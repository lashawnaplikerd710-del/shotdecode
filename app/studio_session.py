from __future__ import annotations

import hashlib
import os
import platform
import re
import secrets
import shutil
import tempfile
import threading
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, replace
from math import isfinite
from pathlib import Path

import backend as be
import manual_caption_style as caption_styles
import spoken_translation as mt
import subtitle_edits as subtitles
from audio_mixing import MIX_TRACKS, make_mix, mix_levels
from app_identity import APP_NAME, APP_VERSION, engine_display_text
from export_profiles import AUDIO_ENCODERS, INTERFACE_OPTIONS, ExportProfile, project_rate, validate_name
from draft_export import EDITOR_FOLDERS, editor_root, export_draft
from media_previews import cache_folder, encode_preview, inspect_edit_media, poster_frame, probe_preview
from rea_video import __version__ as engine_version, clip_motion, clip_style
from studio_tools import StudioTools
from studio_agent_tools import run_tool
from studio_workspace import WorkspaceActions, editable_state, restore_state
import studio_timeline as timeline
from workflows import run_analysis, supplement_translation
from shotdecode_agents import AgentChat
import comfy_video
import link_download


STEM_FILES = {'original': '原声', 'vocals': '人声', 'music': '配乐与环境声'}
AUDIO_LABELS = {**STEM_FILES, 'external': '外部音频'}
TIME_PATTERN = re.compile(r'(\d+):(\d{2}):(\d{2})[,.](\d{3})')
MISSING_EDIT_FIELD = object()


def project_id(path):
    return hashlib.sha256(str(path).casefold().encode('utf-8')).hexdigest()[:20]


def application_info():
    try:
        with (be.APP / 'studio_web/assets/studio.js').open('rb') as bundle:
            build = hashlib.file_digest(bundle, 'sha256').hexdigest()[:10]
    except OSError:
        build = ''
    return dict(name=APP_NAME, version=APP_VERSION, build=build, engine=engine_version,
                system=f'{platform.system()} {platform.version()} ({platform.machine()})',
                python=platform.python_version())


def read_cues(path):
    def seconds(match):
        h, m, s, ms = map(int, match.groups())
        return h * 3600 + m * 60 + s + ms / 1000

    cues = []
    for block in re.split(r'\n[ \t]*\n', path.read_text(encoding='utf-8-sig').strip()):
        lines = block.splitlines()
        for i, line in enumerate(lines[:2]):
            matches = list(TIME_PATTERN.finditer(line))
            if '-->' in line and len(matches) == 2:
                text = '\n'.join(lines[i + 1:]).strip()
                if text:
                    cues.append(dict(start=seconds(matches[0]), end=seconds(matches[1]), text=text))
                break
    return cues


def write_manual_captions(path, rows):
    be.write_json(path, sorted(rows, key=lambda row: (row['start'], row['end'], row['id'])))


@dataclass(frozen=True)
class EditUndo:
    label: str
    restore: Callable[[], None]
    revision: str


class StudioSession:
    def __init__(self, initial=None):
        self.lock = threading.RLock()
        self.dialog_lock = threading.Lock()
        self.picker = None
        self.config = be.load_json(be.SETTINGS_FILE, {})
        self.project = None
        self.source = None
        self.preview = None
        self.preview_info = {}
        self.transcribed = None
        self.extra_stems = None
        self.source_mix = {}
        self.caption_draft = None
        self.mix_preview = None
        self.mix_choices = set()
        self.mix_folder = None
        self.subtitle_revision = 0
        self.prompt_revision = 0
        self.edit_undo = deque(maxlen=100)
        self.undo_revision = 0
        self.tools = StudioTools(self)
        self.workspace = WorkspaceActions(self, project_id, read_cues)
        self.agents = AgentChat()
        self.agent_materials = {}
        self.agent_footage = None
        self.job = None
        self.worker = None
        self.importing = False
        self.link_import = dict(phase='idle', message='', error='', platform='')
        self.status = '就绪'
        self.error = ''
        self.logs = deque(maxlen=220)
        self.task = {}
        self.application = application_info()
        self.assets = {}
        self.asset_ids = {}
        self.recent = {}
        self.recent_cards = []
        self.vlm_key = ''
        self.refresh_recent()
        self.options = self.default_options()
        if initial and initial.is_file():
            if initial.suffix.lower() == '.json':
                self.load_project(initial)
            else:
                try:
                    self.set_source(initial)
                except ValueError as error:
                    self.error = str(error)
                    self.emit(self.error)
        elif self.recent:
            self.load_project(next(iter(self.recent.values())), remember=False)

    def default_options(self):
        language = 'ja' if self.config.get('ocr_language') in ('ja', '日文') else 'zh'
        return dict(ocr_language=language, report_language='en' if self.config.get('language') == 'English' else 'zh',
                    speech_language='ja' if self.config.get('speech_language') == 'ja' else 'zh',
                    ocr=True, packaging=True, stems=True, vlm=False)

    @property
    def output_dir(self):
        return be.project_output_dir(self.config.get('output'))

    @property
    def movie_output_dir(self):
        return be.movie_output_dir(self.config.get('movie_output'))

    def editor_outputs(self):
        saved = self.config.get('editor_output')
        saved = saved if isinstance(saved, dict) else {}
        outputs = {}
        for target in EDITOR_FOLDERS:
            detected = editor_root(target)
            chosen = Path(saved[target]) if isinstance(saved.get(target), str) else None
            directory = chosen if chosen and chosen.is_absolute() else detected or self.movie_output_dir
            outputs[target] = dict(path=str(directory), native=directory == detected)
        return outputs

    def pick_editor_output(self, data):
        target = data.get('editor')
        if not isinstance(target, str) or target not in EDITOR_FOLDERS:
            raise ValueError('请选择要使用的剪辑软件。')
        with self.lock:
            self.idle()
            initial = Path(self.editor_outputs()[target]['path'])
        folder = self.choose('folder', directory=be.movie_output_picker_start(initial))
        if folder:
            with self.lock:
                self.idle()
                saved = self.config.get('editor_output')
                choices = dict(saved) if isinstance(saved, dict) else {}
                self.config['editor_output'] = {**choices, target:str(folder)}
                self.save_config()
        return bool(folder)

    def save_config(self):
        be.write_json(be.SETTINGS_FILE, self.config)

    def idle(self):
        if self.job or self.importing:
            raise ValueError('请先完成当前任务。')

    def file_required(self):
        if not self.source or not self.source.is_file():
            raise ValueError('请选择可用的参考视频。')
        return self.source

    def project_required(self):
        if not self.project:
            raise ValueError('请先拆解视频或打开一个项目。')
        return self.project

    @property
    def manual_caption_file(self):
        return self.project.folder / be.MANUAL_CAPTIONS_FILE if self.project else self.caption_draft

    @property
    def manual_caption_duration(self):
        if self.project and timeline.active(self.project):
            clips = timeline.layout(self.project)
            return timeline.duration(self.project, clips) if timeline.has_video(self.project, clips) else 0
        duration = self.project.data['source'].get('duration') if self.project else None
        duration = duration or self.preview_info.get('duration')
        return round(duration, 3) if isinstance(duration, (int, float)) and isfinite(duration) and duration > 0 else 0

    @property
    def caption_lane_count(self):
        count = self.project.state.get('timeline_caption_rows') if self.project else None
        return count if type(count) is int and 1 <= count <= 4096 else 1

    def change_manual_caption(self, command, data, *, record_undo=True):
        path = self.manual_caption_file
        if not path or data.get('scope') != project_id(path):
            raise ValueError('视频已切换，请重新选择要编辑的字幕。')
        previous = be.load_json(path, [])
        cue_id = data.get('id')
        old = next((row for row in previous if row['id'] == cue_id), None)
        if (cue_id is not None or command != 'save_manual_caption') and old is None:
            raise ValueError('找不到这条字幕，请刷新后重试。')
        if command == 'remove_manual_caption':
            self.write_caption_edit(path, previous, [row for row in previous if row is not old], '删除字幕', record_undo)
            self.status = '字幕已删除'
            return {'id': cue_id}
        if command == 'split_manual_caption':
            at = timeline.split_time(data.get('time'), old['start'], old['end'])
            second = dict(old, id=secrets.token_hex(8), start=at)
            rows = [row if row is not old else dict(old, end=at) for row in previous] + [second]
            self.write_caption_edit(path, previous, rows, '分割字幕', record_undo)
            self.status = '手动字幕已保存'
            return second

        raw_text = data.get('text', old['text'] if old else '')
        if not isinstance(raw_text, str) or '\0' in raw_text or len(raw_text) > 4000:
            raise ValueError('字幕文字最多 4000 个字符。')
        caption = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
        if not caption:
            raise ValueError('请输入字幕文字。')
        try:
            start, end = (round(float(data[key]), 3) for key in ('start', 'end'))
        except (KeyError, TypeError, ValueError, OverflowError):
            raise ValueError('请填写有效的字幕时间。') from None
        if not isfinite(start) or not isfinite(end) or not 0 <= start < end <= self.manual_caption_duration:
            raise ValueError('字幕起止时间必须在视频时长内，结束时间需晚于开始时间。')
        requested = data.get('row')
        ordered = sorted(previous, key=lambda row: (row['start'], row['end'], row['id']))
        lanes = None
        if requested is not None:
            lanes = timeline.numbered_lanes(ordered, self.caption_lane_count)
            if type(requested) is not int or not 0 <= requested <= len(lanes) or requested >= 4096:
                raise ValueError('目标字幕轨已变化，请重新选择。')
            occupied = [timeline.interval(row) for row in lanes[requested] if row is not old] if requested < len(lanes) else []
        elif old and (start, end) != (old['start'], old['end']):
            occupied = timeline.lane_peers(ordered, old)
        else:
            occupied = []
        if any(timeline.overlaps(start, end, left, right) for left, right in occupied):
            raise ValueError('同一字幕轨的片段不能重合。')
        updated = {'id': cue_id or secrets.token_hex(8), 'start': start, 'end': end, 'text': caption}
        if requested is not None:
            updated['row'] = requested
        elif old and 'row' in old:
            updated['row'] = old['row']
        style = data.get('style', old.get('style') if old else None)
        if style is not None:
            updated['style'] = caption_styles.clean_style(style)
        label = '调整字幕时长' if command == 'retime_manual_caption' else '编辑字幕' if old else '添加字幕'
        if lanes is not None:
            rows = [dict(row, row=index) for index, group in enumerate(lanes) for row in group if row is not old]
            rows.append(updated)
            if self.project:
                before = editable_state(self.project)
                after = dict(fields={**before['fields'], 'timeline_caption_rows':max(len(lanes), requested+1)},
                             captions=sorted(rows, key=lambda row: (row['start'], row['end'], row['id'])))
                self.workspace.commit(self.project, before, after, '移动字幕' if old else label, record_undo=record_undo)
            else:
                self.write_caption_edit(path, previous, rows, '移动字幕' if old else label, record_undo)
        elif updated != old:
            rows = [row for row in previous if row is not old] + [updated]
            self.write_caption_edit(path, previous, rows, label, record_undo)
        self.status = '手动字幕已保存'
        return updated

    def write_caption_edit(self, path, previous, rows, label, record_undo):
        write_manual_captions(path, rows)
        if record_undo:
            self.remember_undo(label, lambda: write_manual_captions(path, previous))

    def import_subtitle_track(self, data, *, record_undo=True):
        path = self.manual_caption_file
        if not path or data.get('scope') != project_id(path):
            raise ValueError('当前视频已切换，请重新选择字幕轨。')
        track, label = self.tracks().get(data.get('track'), (None, ''))
        if not track:
            raise ValueError('请先选择一条可用的字幕轨。')
        duration = self.manual_caption_duration
        rows = be.load_json(path, [])
        existing = {(row['start'], row['end'], row['text']) for row in rows}
        added = []
        skipped = 0
        cues = read_cues(track)
        if self.project and timeline.explicit(self.project):
            cues = timeline.remap(cues, timeline.source_spans(self.project, timeline.layout(self.project)))
        for cue in cues:
            start, end = cue['start'], min(cue['end'], duration)
            text = '\n'.join(line.strip() for line in cue['text'].splitlines() if line.strip())
            key = (start, end, text)
            if not 0 <= start < end or not text or len(text) > 4000 or '\0' in text or key in existing:
                skipped += 1
                continue
            added.append(dict(id=secrets.token_hex(8), start=start, end=end, text=text))
            existing.add(key)
        if added:
            self.write_caption_edit(path, rows, [*rows, *added], '导入字幕', record_undo)
            message = f'已将「{label}」的 {len(added)} 条字幕加入时间线'
        else:
            message = f'「{label}」没有新的字幕可加入'
        if skipped:
            message += f' · 跳过 {skipped} 条重复或超出范围的字幕'
        self.status = message
        return dict(message=message, start=min((row['start'] for row in added), default=None))

    def reference_caption_style(self, data):
        with self.lock:
            path = self.manual_caption_file
            if not path or data.get('scope') != project_id(path):
                raise ValueError('视频已切换，请重新打开字幕编辑。')
            source = self.source
            packaging = self.project.data.get('packaging') if self.project else None
        return caption_styles.reference_style(be.FFPROBE, source, packaging, data.get('time', 0))

    def save_clip_properties(self, data, *, reset=False):
        project = self.project_required()
        key = data.get('shot')
        value = data.get('properties')
        if data.get('project') != project_id(project.path) or not isinstance(key, str):
            raise ValueError('项目或镜头已切换，请重新选中镜头。')
        clip = timeline.independent_clip(project, key, data.get('clip'))
        if clip is None and key not in project.shots:
            raise ValueError('项目或镜头已切换，请重新选中镜头。')
        field, target = ('timeline_clip_properties', clip['id']) if clip else ('clip_properties', key)
        duration = clip['duration'] if clip else project.shots[key]['duration']
        size = clip_style.canvas_size(project.data['source'])
        defaults = clip_style.defaults(size)
        if reset:
            value = defaults
        if not isinstance(value, dict):
            raise ValueError('请选择有效的镜头属性。')
        style = clip_style.normalize(value, size, duration)
        previous = timeline.clip_properties(project, clip) if clip else project.clip_properties.get(key)
        if clip_style.normalize(previous, size, duration) != style:
            self.write_clip_setting(project, field, target, style, remove=not clip and style == defaults,
                                    label='重置镜头' if reset else '编辑镜头属性')
        self.status = f'镜头 {key.zfill(2)} 的属性已保存'
        return style

    def write_clip_setting(self, project, field, key, value, *, remove=False, label=None):
        saved = project.state.get(field)
        previous = saved if isinstance(saved, dict) else {}
        updated = previous.copy()
        if remove:
            updated.pop(key, None)
        else:
            updated[key] = value
        if previous == updated:
            return False
        return self.write_project_field(project, field, updated, label=label)

    def write_project_field(self, project, field, value, *, label=None):
        previous = project.state.get(field, MISSING_EDIT_FIELD)
        if previous == value:
            return False
        if value is MISSING_EDIT_FIELD:
            project.state.pop(field, None)
        else:
            project.state[field] = value
        try:
            project.save()
        except OSError:
            if previous is MISSING_EDIT_FIELD:
                project.state.pop(field, None)
            else:
                project.state[field] = previous
            raise
        if field in ('replacements', 'prompts', 'references'):
            setattr(project, field, project.state.setdefault(field, {}))
        if label:
            self.remember_undo(label, lambda: self.write_project_field(self.project_required(), field, previous))
        return True

    def remember_undo(self, label, restore):
        entry = EditUndo(label, restore, secrets.token_hex(8))
        self.edit_undo.append(entry)
        return entry.revision

    def remember_workspace_undo(self, label, snapshot):
        return self.remember_undo(label, lambda: restore_state(self.project_required(), snapshot))

    def remember_output_undo(self, label, project, previous):
        current = subtitles.capture_outputs(project.folder, previous)
        changed = {path:content for path, content in previous.items() if current[path] != content}
        if changed:
            def restore():
                subtitles.restore_outputs(project.folder, changed)
                if Path('breakdown.json') in changed:
                    self.reload_project(project.path)

            self.remember_undo(label, restore)

    def undo_edit(self, data):
        path = self.manual_caption_file
        if not path or data.get('scope') != project_id(path) or not self.edit_undo:
            raise ValueError('当前项目没有可撤销的操作。')
        entry = self.edit_undo[-1]
        if data.get('revision') != entry.revision:
            raise ValueError('可撤销的操作已变化，请重试。')
        entry.restore()
        self.edit_undo.pop()
        self.mix_preview = None
        self.prompt_revision += 1
        self.subtitle_revision += 1
        self.undo_revision += 1
        self.status = '已撤销' + entry.label
        return dict(message=self.status)

    def get_asset(self, key):
        with self.lock:
            return self.assets.get(key)

    def asset(self, path):
        if not path or not Path(path).is_file():
            return None
        path = Path(path).resolve()
        key = self.asset_ids.get(path)
        if not key:
            key = secrets.token_urlsafe(18)
            self.asset_ids[path] = key
            self.assets[key] = path
        return '/media/' + key

    def frame(self, project, key):
        path = project.source_asset(key, 'first_frame') or project.source_asset(key, 'sheet')
        return self.asset(path) if path and path.is_relative_to(project.folder) else None

    @staticmethod
    def replacement_thumbnail(path, url):
        if not url:
            return None
        try:
            stamp = Path(path).stat()
        except OSError:
            return None
        return f'/api/thumbnail/{url.rsplit("/", 1)[1]}?v={stamp.st_mtime_ns:x}-{stamp.st_size:x}'

    def replacement_view(self, path):
        url = self.asset(path)
        return dict(replacement=url, replacement_thumb=self.replacement_thumbnail(path, url),
                    replacement_name=Path(path).name if path else None)

    def refresh_recent(self):
        self.recent = {}
        self.recent_cards = []
        for entry in self.config.get('recent', [])[:8]:
            try:
                project = be.Project(Path(entry))
            except (OSError, ValueError, KeyError, TypeError):
                continue
            key = project_id(project.path)
            self.recent[key] = project.path
            self.recent_cards.append(dict(id=key, name=project.name, shots=len(project.shots),
                                          duration=project.data['source'].get('duration', 0),
                                          thumb=self.frame(project, next(iter(project.shots)))))

    def clear_view(self):
        self.project = self.source = self.preview = self.transcribed = self.extra_stems = None
        self.preview_info = {}
        self.source_mix = {}
        self.caption_draft = None
        self.mix_preview = None
        self.mix_choices.clear()
        self.agent_materials.clear()
        self.agent_footage = None
        self.edit_undo.clear()
        self.tools.reset_project()
        self.workspace.reset()
        self.status = '就绪'
        self.error = ''
        self.link_import = dict(phase='idle', message='', error='', platform='')

    def set_source(self, path):
        if not path.is_file():
            raise ValueError('所选视频已移动或不可读取。')
        source = path.resolve()
        info = inspect_edit_media(source)
        draft = be.DATA / 'caption-drafts' / (cache_folder(source).name + '.json')
        self.clear_view()
        self.source = source
        self.preview_info = {key: info[key] for key in ('duration', 'width', 'height', 'rotation', 'fps', 'has_audio')}
        self.caption_draft = draft
        self.status = '已导入参考视频'

    def load_project(self, path, *, remember=True):
        project = be.Project(path)
        timeline.separate_added_tracks(project)
        source = project.source
        metadata = project.data['source']
        if metadata.get('has_audio') is None and source.is_file():
            try:
                metadata['has_audio'] = inspect_edit_media(source)['has_audio']
            except ValueError:
                pass
        preview, info = (self.preview, self.preview_info) if source == self.source else (None, {})
        self.clear_view()
        self.project = project
        self.source, self.preview, self.preview_info = source, preview, info
        self.status = '项目已打开'
        if remember:
            current = str(project.path)
            self.config['recent'] = [current, *(entry for entry in self.config.get('recent', []) if entry != current)][:8]
            self.save_config()
            self.refresh_recent()

    def reload_project(self, path):
        project = be.Project(path)
        if project.source != self.source:
            self.preview = self.transcribed = self.extra_stems = None
            self.preview_info = {}
            self.mix_preview = None
            self.mix_choices.clear()
        self.project, self.source = project, project.source
        self.refresh_recent()

    def tracks(self):
        paths = {}
        if self.project:
            folder = self.project.folder
            paths.update(zh=(folder / mt.ZH_SRT, '日语中译'),
                         ja=(folder / mt.JA_SRT, '日文口播'),
                         en_zh=(folder / mt.EN_ZH_SRT, '英语中译'),
                         en=(folder / mt.EN_SRT, '英文口播'),
                         screen_zh=(folder / mt.SCREEN_ZH_SRT, '画面中译'),
                         screen_en=(folder / mt.SCREEN_EN_SRT, '英文画面原文'),
                         screen=(folder / 'packaging/subtitles.srt', '画面字幕'))
        if self.transcribed:
            paths['speech'] = (self.transcribed, '口播转写')
        return {key: (path, label) for key, (path, label) in paths.items() if path.is_file()}

    def stem_assets(self, directory):
        if not directory:
            return []
        return [dict(label=label, url=self.asset(directory / (key + '.wav')))
                for key, label in STEM_FILES.items() if (directory / (key + '.wav')).is_file()]

    def stems_directory(self):
        if self.extra_stems:
            return self.extra_stems
        if self.project:
            saved = self.project.state.get('stem_directory')
            return Path(saved) if saved else self.project.folder / 'stems'
        return None

    def mix_config(self):
        state = self.project.state.get('audio_mix', {}) if self.project else self.source_mix
        return state if isinstance(state, dict) else {}

    def save_mix(self, config, *, record_undo=False):
        if self.project:
            self.write_project_field(self.project, 'audio_mix', config, label='调整混音' if record_undo else None)
        else:
            if record_undo and self.source_mix != config:
                previous = self.source_mix
                self.remember_undo('调整混音', lambda: self.save_mix(previous))
            self.source_mix = config

    def audio_sources(self, stems_dir, config=None):
        if self.source and (not self.project or self.project.data['source'].get('has_audio') is not False):
            yield 'original', self.source
        if stems_dir:
            for key in ('vocals', 'music'):
                yield key, stems_dir / (key + '.wav')
        external = (self.mix_config() if config is None else config).get('external')
        if external:
            yield 'external', Path(external)

    def timeline_audio(self, stems_dir):
        tracks = []
        for key, path in self.audio_sources(stems_dir):
            url = self.asset(path)
            if url:
                try:
                    revision = path.stat().st_mtime_ns
                except OSError:
                    continue
                tracks.append(dict(id=key, label=AUDIO_LABELS[key], url=url, name=path.name,
                                   waveform=f'/api/waveform/{url.rsplit("/", 1)[1]}?v={revision}'))
                if self.project:
                    rows = [[self.audio_item_view(item) for item in row]
                            for row in timeline.source_audio_lanes(self.project, key, path)]
                    tracks[-1].update(items=[item for row in rows for item in row],
                                      rows=rows if len(rows) > 1 else None,
                                      detached=(timeline.source_audio_override(self.project, key, path) is not None or
                                                key == 'original' and any(row.get('shot') for row in timeline.video_items(self.project))))
        return tracks

    def audio_item_view(self, item):
        path = item.get('path')
        if not path:
            return item
        result = dict(item, name=Path(path).name, url=self.asset(path))
        if result['url']:
            try:
                revision = Path(path).stat().st_mtime_ns
            except OSError:
                return result
            result['waveform'] = f'/api/waveform/{result["url"].rsplit("/", 1)[1]}?v={revision}'
        return result

    def waveform_source(self, key):
        with self.lock:
            path = self.assets.get(key)
            candidates = [candidate for _, candidate in self.audio_sources(self.stems_directory())]
            if self.project:
                stored = self.project.state.get('timeline_source_audio', {})
                candidates.extend(Path(row['path']) for group in stored.values() for row in group['clips'] if row.get('path'))
            if path and any(candidate.resolve() == path for candidate in candidates):
                return path
            return None

    def lane_media(self, items):
        return [dict(id=item['id'], lane=item['lane'], start=item['start'], first=item['first'],
                     last=item['last'], volume=item['volume'], duration=item['duration'],
                     name=Path(item['path']).name, url=self.asset(item['path']))
                for item in items]

    def video_item_view(self, project, clip, shots, size, number=None):
        key = clip.get('shot')
        original = shots.get(key, {})
        extra = 'lane' in clip
        length = round(clip['last']-clip['first'], 3)
        props = timeline.clip_properties(project, clip)
        replacement = timeline.clip_replacement(project, clip)
        file = Path(clip['path']) if key is None else project.source
        item = dict(original, id=clip['id'], source_id=key, number=number, start=clip['start'],
                    end=round(clip['start']+length, 3), duration=length, first=clip['first'], last=clip['last'],
                    original_duration=timeline.video_length(project, clip),
                    source_start=original['start']+clip['first'] if original else None,
                    properties=clip_style.normalize(props, size, length) if props else None)
        item.update(self.replacement_view(replacement))
        if key is None:
            url = self.asset(file)
            item.update(label='视频素材', type='media', thumb=self.replacement_thumbnail(file, url), name=file.name,
                        media_url=url)
        if extra:
            path, media_first, fit = timeline.video_input(project, clip)
            url = self.asset(self.preview) if path == project.source and self.preview else self.asset(path)
            item.update(lane=clip['lane'], volume=clip['volume'], name=Path(replacement or file).name,
                        url=url, media_first=media_first, fit_duration=fit)
        return item

    def snapshot(self):
        with self.lock:
            project = self.project
            view = source = None
            if self.source:
                preview = self.asset(self.preview)
                source = dict(self.preview_info, name=self.source.name, path=str(self.source),
                              url=preview or self.asset(self.source), compatible=bool(preview),
                              missing=not self.source.is_file())
            if project:
                size = clip_style.canvas_size(project.data['source'])
                canvas = dict(width=size[0], height=size[1], defaults=clip_style.defaults(size),
                              limits=clip_style.bounds(size))
                shots = []
                for key, shot in project.shots.items():
                    properties = project.clip_properties.get(key)
                    base = shot.get('base', {})
                    description = next((opinion['description'] for opinion in (shot.get('review'), shot.get('vlm'))
                                        if opinion and opinion.get('description')), '')
                    shots.append(dict(id=key, start=shot['start'], end=shot['end'], duration=shot['duration'],
                                      label=base.get('label_zh') or be.LABELS.get(base.get('label'), '待确认'),
                                      type=base.get('label'),
                                      description=description, thumb=self.frame(project, key),
                                      properties=clip_style.normalize(properties, size, shot['duration']) if properties else None,
                                      **self.replacement_view(project.replacements.get(key))))
                meta = project.data['source']
                source.update({key: meta[key] for key in ('duration', 'width', 'height', 'rotation', 'fps', 'has_audio')
                               if meta.get(key) is not None})
                source['poster'] = source.get('poster') or shots[0]['thumb']
                clips = []
                edited = timeline.active(project)
                sequence = timeline.layout(project) if edited else ()
                empty = edited and not timeline.has_video(project, sequence)
                by_id = {shot['id']:shot for shot in shots}
                if edited:
                    clips = [self.video_item_view(project, clip, by_id, size, position)
                             for position, clip in enumerate(sequence, 1)]
                    source.update(duration=timeline.duration(project, sequence))
                    if empty:
                        source.update(url=None, compatible=False)
                latest = next((Path(file) for file in [*project.state.get('last_delivery', []),
                               *project.state.get('last_exports', [])] if Path(file).exists()), None)
                movie_format = project.state.get('last_movie_format', 'h264')
                view = dict(id=project_id(project.path), name=project.name, folder=str(project.folder), shots=shots,
                            canvas=canvas, edited=edited, timeline=clips if edited else None,
                            timeline_audio=self.lane_media(timeline.audio_items(project)),
                            timeline_video=[self.video_item_view(project, clip, by_id, size, position)
                                            for position, clip in enumerate(timeline.video_items(project), 1)],
                            timeline_tracks=timeline.user_tracks(project), timeline_magnet=timeline.main_magnet(project),
                            timeline_empty=empty, timeline_ready=True,
                            timeline_revision=timeline.shape_revision(project),
                            verdict=project.data.get('summary', {}).get('verdict', ''),
                            editor_only=project.data.get('project_kind') == 'edit',
                            report=(project.folder / 'report.html').is_file(),
                            export_basename=be.safe_output_name(Path(project.name).stem),
                            export_rate=project_rate(meta),
                            latest_export=dict(name=latest.name, video=latest.is_file() and
                                               latest.suffix in be.VIDEO_EXTENSIONS) if latest else None,
                            exports=[dict(id=project_id(Path(file)), label=label, url=self.asset(file), name=Path(file).name,
                                          external=label == '复刻成片' and movie_format in ('hevc', 'prores'))
                                     for label, file in zip(('复刻成片', '对比视频'), project.state.get('last_exports', []))
                                     if Path(file).is_file()])
            stems_dir = self.stems_directory()
            caption_file = self.manual_caption_file
            return dict(project=view, source=source, recent=self.recent_cards,
                        tracks=[dict(id=key, label=label) for key, (_, label) in self.tracks().items()],
                        stems=self.stem_assets(stems_dir), options=self.options.copy(), status=self.status, error=self.error,
                        audio_tracks=self.timeline_audio(stems_dir),
                        audio_mix=mix_levels(self.mix_config().get('levels')),
                        external_audio=self.mix_config().get('external'), mix_preview=self.mix_preview,
                        subtitle_editable=bool(project and (project.folder / mt.RESULT).is_file()),
                        subtitle_revision=self.subtitle_revision,
                        prompt_revision=self.prompt_revision,
                        undo_revision=self.undo_revision,
                        edit_undo=dict(label='撤销' + self.edit_undo[-1].label, revision=self.edit_undo[-1].revision)
                        if self.edit_undo else None,
                        manual_captions=be.load_json(caption_file, []) if caption_file else [],
                        manual_caption_scope=project_id(caption_file) if caption_file else None,
                        manual_caption_duration=self.manual_caption_duration,
                        manual_caption_lanes=self.caption_lane_count,
                        manual_caption_defaults=caption_styles.DEFAULT_STYLE,
                        manual_caption_size_range=caption_styles.SIZE_RANGE,
                        motion=dict(presets=clip_motion.PRESETS, transition_limit=clip_motion.TRANSITION_LIMIT),
                        export_options=INTERFACE_OPTIONS,
                        link_import=self.link_import.copy(),
                        active=self.job is not None, importing=self.importing, tools=self.tools.snapshot(),
                        logs=list(self.logs), task=self.task.copy(), application=self.application,
                        settings=dict(output=str(self.output_dir),
                        movie_output=str(self.movie_output_dir),
                        editor_outputs=self.editor_outputs(),
                        ui_language=self.config.get('ui_language', 'zh-CN'),
                        color_mode=self.config.get('color_mode', 'dark'),
                        timeline_snap=self.config.get('timeline_snap', True),
                        base=self.config.get('vlm_base', ''), model=self.config.get('vlm_model', ''),
                        env=self.config.get('env_file', ''), engine=self.config.get('engine', 'seedance2.0'),
                        capsule_root=self.config.get('capsule_root', ''), capsule_python=self.config.get('capsule_python', ''),
                        comfy=self.config.get('comfy') or {},
                        has_key=bool(self.vlm_key)))

    def emit(self, line):
        with self.lock:
            if line.strip():
                self.logs.append(engine_display_text(line.strip()))

    def task_stage(self, label):
        with self.lock:
            if self.task.get('phase') == 'running':
                self.task['stage'] = label

    def start(self, title, run, done=None, *, clear_logs=True, announce=True, on_failure=None, on_cancel=None):
        with self.lock:
            self.idle()
            self.status, self.error = title, ''
            self.task = dict(title=title, stage=title, phase='running', exit_code=None, error='', announce=announce)
            if clear_logs:
                self.logs.clear()
            self.logs.append(title)
            job = self.job = be.Job(self.emit, self.task_stage)

            def worker():
                try:
                    result = run(job)
                    job.check()
                    with self.lock:
                        self.status = done(result) if done else '已完成 · ' + title
                        self.task['phase'] = 'done'
                except be.Cancelled:
                    with self.lock:
                        self.status = '已停止'
                        self.task['phase'] = 'cancelled'
                        if on_cancel:
                            on_cancel()
                except Exception as exc:
                    with self.lock:
                        self.status, self.error = '任务失败', engine_display_text(str(exc))
                        self.task.update(phase='failed', error=self.error)
                        if isinstance(exc, be.JobProcessError):
                            self.task['exit_code'] = exc.exit_code
                            self.logs.append(self.error if exc.quiet else exc.summary)
                        else:
                            self.logs.append(self.error)
                        if on_failure:
                            on_failure(self.error)
                finally:
                    with self.lock:
                        self.job = None

            self.worker = threading.Thread(target=worker, name='studio-task', daemon=True)
            self.worker.start()

    def stop(self):
        with self.lock:
            if self.job:
                self.status = '正在停止任务'
                if self.task.get('phase') == 'running':
                    self.task['phase'] = 'stopping'
                self.job.cancel()

    def choose(self, kind, *, name='', directory=None):
        if not self.picker:
            raise ValueError('桌面文件选择器尚未准备好。')
        with self.dialog_lock:
            initial = directory or (self.source.parent if self.source and self.source.is_file() else self.output_dir)
            chosen = self.picker(kind, initial, name)
        return Path(chosen).resolve() if chosen else None

    def create_edit_project(self, source, *, metadata=None):
        meta = metadata if metadata is not None else inspect_edit_media(source)
        poster = poster_frame(source)
        folder = be.new_folder(self.output_dir, source.stem + ' - 剪辑')
        assets = {}
        if poster:
            shutil.copyfile(poster, folder / 'poster.jpg')
            assets['first_frame'] = 'poster.jpg'
        duration = meta['duration']
        shot = dict(index=1, id='shot_001', start=0, end=duration, duration=duration,
                    base={'label':'source', 'label_zh':'原片'}, assets=assets)
        path = folder / 'breakdown.json'
        be.write_json(path, dict(project_kind='edit', source=meta, shots=[shot], summary={}))
        if source == self.source and not self.project and self.caption_draft and self.caption_draft.is_file():
            shutil.copyfile(self.caption_draft, folder / be.MANUAL_CAPTIONS_FILE)
        self.load_project(path)
        self.status = '剪辑工程已创建'
        return True

    def pick_source(self, *, editing=False):
        path = self.choose('video')
        if path:
            with self.lock:
                self.idle()
                if editing:
                    return self.create_edit_project(path)
                self.set_source(path)
                return True

    def pick_project(self):
        path = self.choose('project')
        if path:
            with self.lock:
                self.idle()
                self.load_project(path)

    def import_video(self, name, length, stream, shot=None, *, clip=None, scope=None, editing=False, agent_footage=False):
        suffix = Path(name).suffix.lower()
        if suffix not in be.VIDEO_EXTENSIONS or length < 1:
            raise ValueError('请选择有效的视频文件。')
        imports = be.DATA / 'imports'
        imports.mkdir(exist_ok=True)
        if shutil.disk_usage(imports).free < length:
            raise ValueError('磁盘可用空间不足，无法保存导入的视频。')
        with self.lock:
            self.idle()
            if agent_footage and (scope != self.agent_scope() or shot is not None or clip is not None or editing):
                raise ValueError('当前项目已变化，请重新添加剪辑素材。')
            if shot is not None or clip is not None:
                project = self.project_required()
                if (shot not in project.shots or (scope is not None and scope != project_id(project.path))):
                    raise ValueError('镜头已变化，请重新选择。')
                timeline.independent_clip(project, shot, clip)
            self.importing = True
        directory = None
        try:
            directory = Path(tempfile.mkdtemp(prefix='clip-', dir=imports))
            stem = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', Path(name).stem).strip(' .')[:90]
            if not stem or re.fullmatch(r'(?i:con|prn|aux|nul|com[1-9]|lpt[1-9])', stem):
                stem = '导入视频'
            path = directory / (stem + suffix)
            with path.open('xb') as output:
                remaining = length
                while remaining:
                    chunk = stream.read(min(remaining, 1024 * 1024))
                    if not chunk:
                        raise ValueError('视频导入未完成，请重试。')
                    output.write(chunk)
                    remaining -= len(chunk)
            with self.lock:
                if agent_footage:
                    return self.stage_agent_footage(path, scope)
                if shot:
                    self.replace(shot, path, clip=clip, scope=scope)
                elif editing:
                    self.create_edit_project(path)
                else:
                    self.set_source(path)
        except Exception:
            if directory is not None:
                for file in directory.iterdir():
                    file.unlink(missing_ok=True)
                directory.rmdir()
            raise
        finally:
            with self.lock:
                self.importing = False

    def update_options(self, options):
        for key in ('ocr_language', 'report_language', 'speech_language'):
            if options.get(key) in ({'zh', 'en'} if key == 'report_language' else {'zh', 'ja'}):
                self.options[key] = options[key]
        for key in ('ocr', 'packaging', 'stems', 'vlm'):
            if isinstance(options.get(key), bool):
                self.options[key] = options[key]
        self.config.update(ocr_language=self.options['ocr_language'], speech_language=self.options['speech_language'],
                           language='English' if self.options['report_language'] == 'en' else '中文')
        self.save_config()

    def analysis_parameters(self, options):
        meta = self.tools.inputs.get('meta')
        if meta and not meta.is_file():
            raise ValueError('平台元数据文件已移动，请在设置中重新选择。')
        self.update_options(options)
        task_options = {**self.options, 'engine': self.config.get('engine', 'seedance2.0')}
        env_file, extra = None, {}
        if task_options['vlm']:
            setting = self.config.get('env_file', '')
            if setting and Path(setting).is_file():
                env_file = Path(setting)
            else:
                extra = dict(REA_VLM_BASE_URL=self.config.get('vlm_base', ''),
                             REA_VLM_MODEL=self.config.get('vlm_model', ''), REA_VLM_API_KEY=self.vlm_key)
                if not all(extra.values()):
                    raise ValueError('请先在设置中填写多模态服务地址、模型名和密钥，或选择 .env 文件。')
        return task_options, env_file, extra, meta

    def analyze(self, options):
        with self.lock:
            self.idle()
            source = self.file_required()
            task_options, env_file, extra, meta = self.analysis_parameters(options)
            out = be.new_folder(self.output_dir, source.stem)
            saved_mix = self.mix_config().copy()
            caption_file = self.manual_caption_file
            saved_captions = be.load_json(caption_file, []) if caption_file else []

            def done(status):
                if saved_captions:
                    be.write_json(out / be.MANUAL_CAPTIONS_FILE, saved_captions)
                self.load_project(out / 'breakdown.json')
                if saved_mix:
                    self.save_mix(saved_mix)
                return status or '视频拆解已完成'

            self.start('正在拆解视频', lambda job: run_analysis(job, source, out, task_options,
                       env_file=env_file, extra_env=extra, meta=meta), done)
            return str(out / 'breakdown.json')

    def analyze_link(self, text, options):
        """Download and analyze with one cancellable job and the local-file pipeline."""
        with self.lock:
            self.idle()
            if not isinstance(text, str) or len(text) > 16_384:
                raise ValueError('请粘贴一条抖音或 TikTok 视频链接，也可以粘贴完整分享文案。')
            platform, _ = link_download.parse_video_link(text)
            label = {'douyin': '抖音', 'tiktok': 'TikTok'}[platform]
            task_options, env_file, extra, meta = self.analysis_parameters(options)
            output_root = self.output_dir
            self.link_import = dict(phase='downloading', message='正在下载参考视频', error='', platform=label)

            def progress(message):
                with self.lock:
                    self.status = str(message)
                    self.task_stage(self.status)
                    self.link_import['message'] = self.status

            def run(job):
                imports = be.DATA / 'imports'
                imports.mkdir(parents=True, exist_ok=True)
                directory = Path(tempfile.mkdtemp(prefix='link-', dir=imports))
                try:
                    source = link_download.download_video(text, directory, progress=progress,
                                                          check=job.check, ffmpeg=be.FFMPEG)
                    job.check()
                    with self.lock:
                        self.set_source(source)
                        self.status = '视频下载完成，正在自动拆解'
                        self.link_import = dict(phase='analyzing', message=self.status, error='', platform=label)
                        self.emit(self.status)
                    out = be.new_folder(output_root, source.stem)
                    status = run_analysis(job, source, out, task_options,
                                          env_file=env_file, extra_env=extra, meta=meta)
                    job.check()
                    return status, out
                finally:
                    # The downloader removes partial files; keep complete video for retry.
                    try:
                        directory.rmdir()
                    except OSError:
                        pass

            def done(result):
                status, out = result
                self.load_project(out / 'breakdown.json')
                self.link_import = dict(phase='completed', message=status or '链接视频拆解已完成',
                                        error='', platform=label)
                return status or '链接视频拆解已完成'

            def failed(error):
                self.link_import.update(phase='failed', message='任务未完成，请查看提示后重试。', error=error)

            def cancelled():
                self.link_import.update(phase='cancelled', message='已停止，可重新开始。', error='')

            self.start('正在下载参考视频', run, done, on_failure=failed, on_cancel=cancelled)

    def inspect_source(self, path):
        with self.lock:
            source = self.source
            if not source or str(source) != path or not source.is_file():
                return
        try:
            info, poster = probe_preview(source)
        except OSError:
            info, poster = {'needs_preview': False}, None
        with self.lock:
            if self.source == source:
                self.preview_info.update(info, poster=self.asset(poster))

    def make_preview(self, path=None):
        with self.lock:
            if path is not None and path != str(self.source):
                return
            self.idle()
            source = self.file_required()
            dest = cache_folder(source) / 'compatible.mp4'
            previous_status = self.status if not self.error else '就绪'

            def done(result):
                self.preview = result
                return previous_status

            if dest.is_file() and dest.stat().st_size > 0:
                self.preview = dest
                return
            self.start('正在生成兼容预览', lambda job: encode_preview(job, source, dest), done,
                       clear_logs=False, announce=False)

    def replace(self, key, path, *, clip=None, scope=None, record_undo=True):
        project = self.project_required()
        if not isinstance(key, str) or (scope is not None and scope != project_id(project.path)):
            raise ValueError('请选择一个有效的镜头。')
        item = timeline.independent_clip(project, key, clip)
        if item is None and key not in project.shots:
            raise ValueError('请选择一个有效的镜头。')
        field, target = ('timeline_replacements', item['id']) if item else ('replacements', key)
        label = ('替换素材' if path else '移除替换素材') if record_undo else None
        self.write_clip_setting(project, field, target, str(path) if path else None,
                                remove=not item and not path, label=label)
        self.status = '镜头素材已更新'

    def export_dir(self, name):
        return be.new_folder(self.project.folder / 'exports' if self.project else self.output_dir, name)

    def choose_mix_audio(self):
        with self.lock:
            self.idle()
            source, project = self.file_required(), self.project
        path = self.choose('audio')
        if not path:
            return None
        if not path.is_file() or path.suffix.lower() not in be.AUDIO_EXTENSIONS:
            raise ValueError('请选择可用的音频文件。')
        with self.lock:
            self.idle()
            if self.project is not project or self.source != source:
                raise ValueError('当前项目已切换，请重新选择音频。')
            url = self.asset(path)
            if not url:
                raise ValueError('外部音频文件已移动，请重新选择。')
            key = url.rsplit('/', 1)[1]
            self.mix_choices.add(key)
            return dict(key=key, name=path.name)

    def mix_draft(self, data):
        path = self.manual_caption_file
        if 'scope' in data and (not path or data['scope'] != project_id(path)):
            raise ValueError('当前项目已切换，请重新打开混音面板。')
        config = self.mix_config().copy()
        config['levels'] = mix_levels(config.get('levels'), data.get('levels'))
        if 'external' not in data:
            return config
        key = data['external']
        if key is None:
            config.pop('external', None)
            config['levels']['external']['enabled'] = False
        elif isinstance(key, str) and key in self.mix_choices:
            path = self.assets.get(key)
            if not path or not path.is_file():
                raise ValueError('外部音频文件已移动，请重新选择。')
            config['external'] = str(path)
        else:
            raise ValueError('请重新选择外部音频。')
        return config

    def selected_audio(self, levels, solo=None, *, config=None):
        paths = dict(self.audio_sources(self.stems_directory(), config))
        if solo is not None and solo not in paths:
            raise ValueError('请选择可用的音轨。')
        selected = []
        for key in MIX_TRACKS:
            setting = levels[key]
            included = key == solo if solo is not None else setting['enabled'] and setting['volume'] > 0
            if not included:
                continue
            path = paths.get(key)
            if not path or not path.is_file():
                if key == 'original' and not path and solo is None:
                    continue
                raise ValueError(f'{AUDIO_LABELS[key]}文件不可用，请重新选择或取消该轨。')
            selected.append((key, path, setting['volume']))
        return selected

    def preview_audio_mix(self, data):
        with self.lock:
            self.idle()
            source = self.file_required()
            config = self.mix_draft(data)
            solo = data.get('solo')
            tracks = self.selected_audio(config['levels'], solo, config=config)
            project = self.project
            lanes = project is not None and not solo and timeline.audio_items(project)
            if not tracks and not lanes:
                raise ValueError('请启用至少一条音轨来试听。')
            duration = timeline.duration(project) if project else None
            if not self.mix_folder:
                self.mix_folder = tempfile.TemporaryDirectory(prefix='workbench-mix-', dir=be.DATA,
                                                              ignore_cleanup_errors=True)
            dest = Path(self.mix_folder.name) / f'{secrets.token_hex(6)}.m4a'
            old_preview = self.mix_preview
            title = AUDIO_LABELS[solo] + '试听' if solo else '混音试听'

            def done(file):
                self.mix_preview = dict(url=self.asset(file), label=title)
                if old_preview:
                    old_path = self.assets.pop(old_preview['url'].rsplit('/', 1)[1], None)
                    if old_path:
                        self.asset_ids.pop(old_path, None)
                        try:
                            old_path.unlink(missing_ok=True)
                        except OSError:
                            pass
                return title + '已就绪'

            def render(job):
                if project:
                    items = timeline.positioned_audio(project, tracks, include_added=not solo)
                    audio = timeline.render_audio(job, duration, items, dest)
                    if audio is None:
                        raise ValueError('所选音轨在时间线上没有可试听的片段。')
                    return audio
                return make_mix(job, source, duration, [(path, level) for _, path, level in tracks], dest)

            self.start('正在准备' + title, render, done)

    def close(self):
        self.agents.close()
        self.stop()
        if self.worker and self.worker.is_alive():
            self.worker.join(timeout=10)
        if self.mix_folder:
            self.mix_folder.cleanup()

    def subtitle_export_rows(self, project, sequence, track):
        if track == 'manual':
            rows = be.load_json(project.folder / be.MANUAL_CAPTIONS_FILE, [])
        else:
            path, _ = self.tracks().get(track, (None, None)) if isinstance(track, str) else (None, None)
            rows = timeline.remap(read_cues(path), timeline.source_spans(project, sequence)) if path else []
        limit = timeline.duration(project, sequence)
        cues = [(row['start'], min(row['end'], limit), row['text']) for row in rows
                if row['start'] < min(row['end'], limit) and row['text'].strip()]
        if not cues:
            raise ValueError('所选字幕轨在当前时间线内没有字幕。')
        return sorted(cues)

    @staticmethod
    def record_delivery(project, result, movie_format=None):
        files = list(map(str, result))
        history = project.state.get('export_history', project.state.get('last_exports', []))
        project.state['last_delivery'] = files
        if movie_format:
            project.state['last_exports'] = files
            project.state['last_movie_format'] = movie_format
        project.state['export_history'] = list(dict.fromkeys([*files, *history]))[:60]
        project.save()

    def export_editor_draft(self, data):
        target = data.get('editor')
        if not isinstance(target, str) or target not in EDITOR_FOLDERS:
            raise ValueError('请选择要使用的剪辑软件。')
        name = validate_name(data.get('name'))
        with self.lock:
            self.idle()
            project = self.project_required()
            if data.get('project') != project_id(project.path):
                raise ValueError('当前项目已切换，请重新打开导出窗口。')
            self.file_required()
            sequence = timeline.layout(project)
            if not timeline.has_video(project, sequence):
                raise ValueError('时间线需要至少一个视频片段才能导出。')
            root = Path(self.editor_outputs()[target]['path']).resolve()
            levels = mix_levels(self.mix_config().get('levels'))
            sounds = [(key, AUDIO_LABELS[key], source) for key, source in
                      self.audio_sources(self.stems_directory()) if source.is_file()]
            manual = be.load_json(project.folder / be.MANUAL_CAPTIONS_FILE, [])
            recognized = ('', None, [])
            track = data.get('track')
            if track is not None:
                selected = self.tracks().get(track) if isinstance(track, str) else None
                if selected is None:
                    raise ValueError('请先选择可用的项目字幕。')
                path, label = selected
                cues = timeline.remap(read_cues(path), timeline.source_spans(project, sequence))
                languages = {'zh':'zh-CN', 'ja':'ja-JP', 'en':'en-US', 'en_zh':'zh-CN',
                             'screen_zh':'zh-CN', 'screen_en':'en-US', 'screen':'zh-CN', 'speech':'zh-CN'}
                recognized = (label, languages.get(track, 'zh-CN'), cues)

            def done(result):
                self.record_delivery(project, result)
                return '剪辑工程已导出'

            self.start('正在导出剪辑工程',
                       lambda job: export_draft(job, project, target, root, name, sounds, levels, manual, recognized),
                       done)
            return True

    def assemble(self, data):
        mode = data.get('audio', 'original')
        if mode not in ('original', 'mix', 'custom', 'mute'):
            raise ValueError('请选择可用的音轨。')
        audio = 'mute' if mode == 'mute' else None
        if mode == 'custom' and data.get('format') not in ('srt', 'vtt'):
            audio = self.choose('audio')
            if not audio:
                return False
        with self.lock:
            self.idle()
            project = self.project_required()
            if data.get('project', project_id(project.path)) != project_id(project.path):
                raise ValueError('当前项目已切换，请重新打开导出窗口。')
            profile = ExportProfile.read(data, project.data['source'])
            sequence = timeline.layout(project)
            if not timeline.has_video(project, sequence):
                raise ValueError('时间线需要至少一个视频片段才能导出。')
            export_root = self.movie_output_dir
            base = be.safe_output_name(Path(project.name).stem)
            video = profile.format not in (*AUDIO_ENCODERS, 'srt', 'vtt')

            def done(result):
                self.record_delivery(project, result, profile.format if video else None)
                return '时间线成片已导出' if video else '文件已导出'

            if profile.format in ('srt', 'vtt'):
                rows = self.subtitle_export_rows(project, sequence, data.get('track', 'manual'))
                profile = replace(profile, name=profile.name or base + ' - 字幕')
                self.start('正在导出字幕', lambda job: job.export_subtitles(rows, export_root, profile), done)
                return True
            self.file_required()
            mix_tracks = []
            if mode == 'mix':
                mix_tracks = self.selected_audio(mix_levels(self.mix_config().get('levels')))
            if not video:
                profile = replace(profile, name=profile.name or base + ' - 音频')
                self.start('正在导出音频', lambda job: job.export_audio(
                    project, export_root, audio, mix_tracks, mode == 'mix', profile), done)
                return True
            used = {clip['shot'] for clip in sequence}
            replacements = {key: path for key, path in project.replacements.items() if key in used}
            missing = [str(index).zfill(2) for index, clip in enumerate(sequence, 1)
                       if (path := timeline.clip_replacement(project, clip, replacements)) and not Path(path).is_file()]
            if missing:
                raise ValueError('请重新选择已移动的镜头素材 ' + '、'.join(missing))
            overlays = data.get('overlays', True) is True
            compare = data.get('compare') is True

            self.start('正在拼接时间线',
                       lambda job: job.assemble(project, replacements, export_root, overlays, audio,
                                                compare=compare, mix_tracks=mix_tracks,
                                                timeline_mix=mode == 'mix', profile=profile), done)
            return True

    def transcribe(self, data, *, source=None, complete=None):
        source = source or self.file_required()
        dest = self.choose('srt_save', name=f'{source.stem[:44]} - 口播.srt')
        if not dest:
            return
        if dest == source:
            raise ValueError('请选择新的字幕文件名。')
        language = 'ja' if data.get('language') == 'ja' else 'zh'
        with self.lock:
            self.idle()
            self.update_options({'speech_language': language})

            def done(result):
                if source == self.source:
                    previous = self.transcribed
                    self.transcribed = result
                    if previous != result:
                        self.remember_undo('更新口播字幕', lambda: setattr(self, 'transcribed', previous))
                return complete(result) if complete else '口播字幕已导出'

            self.start('正在转写口播', lambda job: job.transcribe(source, dest, language), done)

    def separate(self, *, source=None, complete=None):
        with self.lock:
            self.idle()
            source = source or self.file_required()
            dest = self.export_dir('音轨分离')

            def done(stems):
                if source == self.source:
                    previous = self.extra_stems
                    if self.project:
                        previous_directory = self.project.state.get('stem_directory', MISSING_EDIT_FIELD)
                        self.write_project_field(self.project, 'stem_directory', str(stems))
                    self.extra_stems = stems

                    def restore():
                        if self.project:
                            self.write_project_field(self.project, 'stem_directory', previous_directory)
                        self.extra_stems = previous

                    self.remember_undo('分离音轨', restore)
                return complete(stems) if complete else '音轨分离已完成'

            self.start('正在分离音轨', lambda job: job.separate(source, dest), done)

    def burn(self, key, *, source=None, captions=None, complete=None):
        source = source or self.file_required()
        path = captions or self.tracks().get(key, (None, ''))[0]
        if not path:
            path = self.choose('caption')
        if not path:
            return
        if path.suffix.lower() not in ('.srt', '.ass'):
            raise ValueError('请选择 SRT 或 ASS 文件。')
        dest = self.choose('video_save', name=f'{source.stem[:42]} - 带字幕.mp4')
        if dest and dest != source and dest != path:
            self.start('正在压制字幕', lambda job: job.burn(source, path, dest),
                       complete or (lambda _: self.open_result(dest, '带字幕视频已导出')))
        elif dest:
            raise ValueError('请选择新的导出文件名。')

    @staticmethod
    def open_result(path, message):
        os.startfile(str(path))
        return message

    def action(self, command, data):
        if command.startswith(('timeline_', 'version_', 'template_', 'insight_')):
            return self.workspace.action(command, data)
        if command == 'interface_preferences':
            with self.lock:
                modes = {'ui_language': ('zh-CN', 'zh-TW', 'en', 'ja', 'es'),
                         'color_mode': ('dark', 'light', 'system')}
                previous = self.config.copy()
                self.config.update({key:data[key] for key, values in modes.items() if data.get(key) in values})
                if isinstance(data.get('timeline_snap'), bool):
                    self.config['timeline_snap'] = data['timeline_snap']
                try:
                    self.save_config()
                except OSError:
                    self.config = previous
                    raise
                return True
        if command.startswith('agent_'):
            return self.agent_action(command, data)
        if command.startswith('video_gen_'):
            return self.video_generation_action(command, data)
        if command.startswith('tool_'):
            return self.tools.action(command[5:], data)
        if command in ('pick_source', 'pick_edit_source'):
            return self.pick_source(editing=command == 'pick_edit_source')
        if command == 'pick_project':
            return self.pick_project()
        if command == 'analyze':
            return self.analyze(data.get('options', {}))
        if command == 'analyze_link':
            return self.analyze_link(data.get('text', ''), data.get('options', {}))
        if command == 'assemble':
            return self.assemble(data)
        if command == 'export_editor_draft':
            return self.export_editor_draft(data)
        if command == 'pick_editor_output':
            return self.pick_editor_output(data)
        if command == 'transcribe':
            return self.transcribe(data)
        if command == 'separate':
            return self.separate()
        if command == 'burn':
            return self.burn(data.get('track'))
        if command == 'stop':
            return self.stop()
        if command == 'inspect_source':
            return self.inspect_source(data.get('path'))
        if command == 'preview':
            return self.make_preview(data.get('path'))
        if command == 'pick_mix_audio':
            return self.choose_mix_audio()
        if command == 'preview_audio_mix':
            return self.preview_audio_mix(data)
        if command == 'manual_caption_fonts':
            return caption_styles.installed_fonts()
        if command == 'reference_caption_style':
            return self.reference_caption_style(data)
        if command in ('pick_output', 'pick_movie_output', 'pick_env', 'replace', 'save_track', 'export_prompts'):
            return self.dialog_action(command, data)
        with self.lock:
            if command == 'read_track':
                path, _ = self.tracks().get(data.get('track'), (None, ''))
                cues = read_cues(path) if path else []
                if self.project and timeline.explicit(self.project):
                    cues = timeline.remap(cues, timeline.source_spans(self.project, timeline.layout(self.project)))
                return cues
            if command == 'read_subtitle_edits':
                project = self.project_required()
                return subtitles.editable(project)
            if command == 'prompt':
                project = self.project_required()
                key = data.get('shot')
                if key not in project.shots:
                    raise ValueError('请选择一个有效的镜头。')
                return project.prompts.get(key, be.suggested_prompt(project, key))
            if command == 'open_report':
                return self.open_result(self.project_required().folder / 'report.html', '报告已打开')
            if command == 'open_folder':
                folder = self.project.folder if self.project else self.output_dir
                folder.mkdir(parents=True, exist_ok=True)
                return self.open_result(folder, '文件夹已打开')
            self.idle()
            if command in ('save_manual_caption', 'remove_manual_caption', 'retime_manual_caption', 'split_manual_caption'):
                return self.change_manual_caption(command, data)
            if command == 'import_subtitle_track':
                return self.import_subtitle_track(data)
            if command in ('save_clip_properties', 'reset_clip_properties'):
                return self.save_clip_properties(data, reset=command == 'reset_clip_properties')
            if command == 'undo_edit':
                return self.undo_edit(data)
            if command == 'save_subtitle_edit':
                project = self.project_required()
                if data.get('project') != project_id(project.path):
                    raise ValueError('当前项目已切换，请重新打开校对面板。')
                index, previous = subtitles.save(project, data)
                self.reload_project(project.path)
                self.remember_output_undo('校对字幕', project, previous)
                self.subtitle_revision += 1
                self.status = '字幕、报告和 SRT 已同步保存'
                return {'groups': subtitles.editable(self.project), 'index': index}
            if command == 'save_audio_mix':
                self.file_required()
                self.save_mix(self.mix_draft(data), record_undo=True)
                self.mix_preview = None
                self.status = '工程音轨设置已保存'
                return True
            if command == 'new':
                return self.clear_view()
            if command == 'edit_source':
                return self.create_edit_project(self.file_required())
            if command == 'open_recent':
                path = self.recent.get(data.get('id'))
                if not path:
                    raise ValueError('这个项目已经移动。请重新选择项目文件。')
                return self.load_project(path)
            if command == 'options':
                return self.update_options(data.get('options', {}))
            if command == 'settings':
                for incoming, key in (('base', 'vlm_base'), ('model', 'vlm_model'), ('engine', 'engine')):
                    if isinstance(data.get(incoming), str):
                        self.config[key] = data[incoming].strip()
                if isinstance(data.get('key'), str) and data['key'].strip():
                    self.vlm_key = data['key'].strip()
                if data.get('clear_env'):
                    self.config['env_file'] = ''
                self.save_config()
                self.status = '设置已保存'
                return None
            if command == 'translate':
                project = self.project_required()
                previous = subtitles.capture_outputs(project.folder, subtitles.TRANSLATION_OUTPUTS)

                def translated(status):
                    self.remember_output_undo('更新译文', project, previous)
                    self.subtitle_revision += 1
                    return status

                return self.start('正在补写报告译文', lambda job: supplement_translation(job, project), translated)
            if command == 'clear_replacement':
                return self.replace(data.get('shot'), None, clip=data.get('clip'), scope=data.get('project'))
            if command in ('save_prompt', 'reset_prompt'):
                project, key = self.project_required(), data.get('shot')
                if key not in project.shots:
                    raise ValueError('请选择一个有效的镜头。')
                if command == 'save_prompt':
                    self.write_clip_setting(project, 'prompts', key, str(data.get('text', '')).strip(), label='编辑提示词')
                    self.status = '提示词已保存'
                    return None
                default = be.suggested_prompt(project, key)
                self.write_clip_setting(project, 'prompts', key, None, remove=True, label='恢复提示词')
                self.status = '已恢复分镜草稿'
                return default
        raise ValueError('这个操作不可用。')

    def agent_scope(self):
        path = self.manual_caption_file
        return project_id(path) if path else None

    def stage_agent_footage(self, path, scope):
        if scope != self.agent_scope() or not path.is_file() or path.suffix.lower() not in be.VIDEO_EXTENSIONS:
            raise ValueError('请重新选择可用的剪辑素材。')
        key = secrets.token_urlsafe(18)
        self.agent_footage = (key, path)
        return dict(key=key, name=path.name)

    def agent_context(self, data):
        context = {}
        material = None
        with self.lock:
            if 'scope' in data and data['scope'] != self.agent_scope():
                raise ValueError('项目已切换，请在当前项目中重新发送。')
            if data.get('footage') is not None:
                saved = self.agent_footage
                if not saved or data['footage'] != saved[0] or not saved[1].is_file() or data.get('material') is not None:
                    raise ValueError('请重新选择可用的剪辑素材。')
                path = saved[1]
                return dict(source=str(path), label=path.name, scope=self.agent_scope(),
                            incoming_footage=True, footage_key=saved[0]), None
            if data.get('attach') is True and self.source:
                context.update(source=str(self.source), label=self.source.name, scope=self.agent_scope())
                if self.project:
                    context.update(project=str(self.project.path), label=self.project.name)
                    shot = data.get('shot')
                    if isinstance(shot, str) and shot in self.project.shots:
                        item = self.project.shots[shot]
                        context['shot'] = dict(index=shot, start=item['start'], end=item['end'])
                    clip = data.get('clip')
                    if isinstance(clip, str) and any(item['id'] == clip for item in
                                                    [*timeline.layout(self.project), *timeline.video_items(self.project)]):
                        context['clip'] = clip
                time = data.get('time')
                if type(time) in (int, float) and 0 <= time <= 1_000_000:
                    context['playhead'] = round(time, 3)
            token = data.get('material')
            if token is not None:
                material = self.agent_materials.get(token) if isinstance(token, str) else None
                if not material or not material.is_file() or not context.get('project'):
                    raise ValueError('请为当前项目重新选择替换视频。')
                context['replacement'] = material.name
        return context, material

    def agent_tool(self, credential, data):
        if not isinstance(data, dict):
            raise ValueError('工作台工具请求无效。')
        chat = self.agents.current()
        if not chat:
            raise PermissionError('Agent 工作台连接已失效。')
        return chat.tool_request(credential, data, lambda *args: run_tool(self, *args))

    def agent_registry(self):
        live = self.agents.state_for(self.agent_scope()) or {}
        rows = self.agents.registry()
        for row in rows:
            active = live if live.get('provider') == row['id'] else {}
            row['workbench_tools'] = active.get('tools', 'waiting')
            row['connection_phase'] = active.get('phase', '')
            row['connection_error'] = active.get('error', '')
            row['generation_configured'] = bool((self.config.get('comfy') or {}).get('path'))
        return rows

    def agent_action(self, command, data):
        if command == 'agent_registry':
            return self.agent_registry()
        if command == 'agent_history':
            return self.agents.history(self.agent_scope())
        if command in ('agent_enable', 'agent_pick_program', 'agent_reset_program', 'agent_install', 'agent_test', 'agent_docs'):
            key = data.get('provider')
            agent = self.agents.connections.profile(key)
            if command == 'agent_test':
                return self.agents.test(key)
            if command == 'agent_docs':
                url = agent.website
                if data.get('runtime') is True and agent.adapter:
                    url = 'https://nodejs.org/en/download'
                elif data.get('adapter') is True and agent.adapter:
                    url = 'https://github.com/agentclientprotocol/' + agent.adapter
                os.startfile(url)
                return None
            if command == 'agent_install':
                self.agents.connections.install(key)
            elif command == 'agent_enable':
                self.agents.set_preference(key, 'enabled', data.get('enabled'))
            else:
                slot = 'connector' if data.get('adapter') is True and agent.adapter else 'program'
                if command == 'agent_reset_program':
                    self.agents.set_preference(key, slot, '')
                elif path := self.choose('agent_program'):
                    self.agents.set_preference(key, slot, str(path))
            return self.agent_registry()
        if command == 'agent_connect':
            with self.lock:
                output, scope = self.output_dir, self.agent_scope()
                if data.get('automatic') is True:
                    if data.get('scope') != scope:
                        return None
                    return self.agents.connect(data.get('provider'), output, scope, automatic=True)
            return self.agents.connect(data.get('provider'), output, scope, fresh=data.get('fresh') is True,
                                       history_id=data.get('history'), enable=data.get('enable') is True,
                                       wait_ready=data.get('wait_ready') is True)
        if command == 'agent_pick_footage':
            path = self.choose('video')
            with self.lock:
                return self.stage_agent_footage(path, data.get('scope')) if path else None
        if command == 'agent_pick_material':
            with self.lock:
                scope = self.agent_scope()
                if not self.project or scope != data.get('scope'):
                    raise ValueError('请在当前拆解项目中选择替换视频。')
            path = self.choose('video')
            if not path:
                return None
            with self.lock:
                if scope != self.agent_scope() or not path.is_file() or path.suffix.lower() not in be.VIDEO_EXTENSIONS:
                    raise ValueError('请为当前项目选择可用的替换视频。')
                key = secrets.token_urlsafe(18)
                self.agent_materials[key] = path
                return dict(key=key, name=path.name)
        if command in ('agent_dispatch', 'agent_send'):
            text = data.get('text')
            if not isinstance(text, str) or not text.strip() or len(text) > 16000:
                raise ValueError('请输入 1 至 16000 个字符。')
            context, material = self.agent_context(data)
            if command == 'agent_dispatch':
                with self.lock:
                    output, scope = self.output_dir, self.agent_scope()
                return self.agents.dispatch(text.strip(), context, material, output, scope)
            chat = self.agents.current()
            if not chat:
                raise ValueError('请先选择本机 Agent。')
            chat.send(text.strip(), context, material)
            return chat.snapshot()
        if command == 'agent_state':
            return self.agents.state_for(self.agent_scope())
        if command == 'agent_open_result':
            artifact = self.agents.artifact(self.agent_scope(), data.get('id'))
            path = Path(artifact['path'])
            with self.lock:
                self.idle()
                if not path.is_file():
                    raise ValueError('结果文件已移动。')
                if artifact.get('kind') in ('movie', 'material'):
                    self.open_result(path, '成片已打开')
                else:
                    self.load_project(path)
            return True
        chat = self.agents.current()
        if not chat:
            raise ValueError('请先选择本机 Agent。')
        if command == 'agent_option':
            chat.set_option(data.get('id'), data.get('value'))
        elif command == 'agent_permission':
            request_id = data.get('request')
            if not isinstance(request_id, (int, str)):
                raise ValueError('Agent 请求已变化。')
            chat.permission_choice(request_id, data.get('option'))
        elif command == 'agent_cancel':
            chat.cancel()
        elif command == 'agent_retry_tool':
            return chat.retry(data.get('step'), self.agent_scope(), lambda *args: run_tool(self, *args))
        else:
            raise ValueError('该 Agent 操作不可用。')
        return chat.snapshot()

    def video_generation_action(self, command, data, *, record_undo=True):
        if command == 'video_gen_test':
            return comfy_video.ComfyUI(data.get('url')).test()
        if command == 'video_gen_capsule_test':
            with self.lock:
                root, interpreter = self.tools.backend_location()
            return dict(message='批量生成后端已找到', root=str(root), interpreter=str(interpreter))
        if command == 'video_gen_pick_workflow':
            path = self.choose('json')
            return comfy_video.workflow_options(path) if path else None
        if command == 'video_gen_workflow':
            with self.lock:
                path = (self.config.get('comfy') or {}).get('path')
            return comfy_video.workflow_options(path) if path else None
        if command == 'video_gen_save':
            config = comfy_video.settings(data)
            with self.lock:
                self.idle()
                previous = self.config.get('comfy')
                self.config['comfy'] = config
                try:
                    self.save_config()
                except OSError:
                    if previous is None:
                        self.config.pop('comfy', None)
                    else:
                        self.config['comfy'] = previous
                    raise
                self.status = 'ComfyUI 设置已保存'
            return config
        if command == 'video_gen_comfy':
            with self.lock:
                self.idle()
                project, key = self.project_required(), data.get('shot')
                if not isinstance(key, str) or key not in project.shots:
                    raise ValueError('请选择要生成的镜头。')
                config = comfy_video.settings(self.config.get('comfy') or {})
                if not config['path']:
                    raise ValueError('请先在「设置 → 视频生成」保存 ComfyUI 工作流。')
                text = data.get('text')
                if not isinstance(text, str) or not text.strip() or len(text) > 16000:
                    raise ValueError('请输入 1 至 16000 个字符的镜头提示词。')
                reference = None
                if config['image']:
                    chosen = (project.references.get(key) or {}).get('first')
                    reference = Path(chosen) if chosen else project.source_asset(key, 'first_frame')
                    if not reference or not reference.is_file() or (not chosen and not reference.is_relative_to(project.folder)):
                        raise ValueError('找不到选中镜头的参考帧。请在参考图设置中重新选择首帧。')

                def run(job):
                    folder = be.new_folder(project.folder / 'generation' / 'comfyui', f'镜头 {key}')
                    return comfy_video.ComfyUI(config['url']).generate(job, config, text.strip(), folder, reference)

                def done(video):
                    if self.project is not project:
                        raise ValueError('项目已切换，生成文件已保存到原项目。')
                    self.replace(key, video, record_undo=record_undo)
                    self.emit(f'生成文件已保存 · {video.name}')
                    return f'镜头 {key} 已替换为 ComfyUI 生成视频'

                self.start(f'正在用 ComfyUI 生成镜头 {key}', run, done,
                           on_cancel=lambda: setattr(self, 'status', '已停止等待 ComfyUI'))
            return True
        raise ValueError('这个视频生成操作不可用。')

    def dialog_action(self, command, data):
        if command == 'save_track':
            path, _ = self.tracks().get(data.get('track'), (None, ''))
            if not path:
                raise ValueError('请先选择字幕轨。')
            dest = self.choose('srt_save', name=path.name)
            if dest and dest != path:
                shutil.copyfile(path, dest)
            return None
        kinds = {'pick_output': 'folder', 'pick_movie_output': 'folder', 'pick_env': 'env',
                 'replace': 'video', 'export_prompts': 'text_save'}
        initial = be.movie_output_picker_start(self.movie_output_dir) if command == 'pick_movie_output' else None
        chosen = self.choose(kinds[command], name='逐镜提示词.txt', directory=initial)
        if not chosen:
            return None
        with self.lock:
            self.idle()
            setting = {'pick_output': 'output', 'pick_movie_output': 'movie_output', 'pick_env': 'env_file'}.get(command)
            if setting:
                self.config[setting] = str(chosen)
                self.save_config()
            elif command == 'replace':
                self.replace(data.get('shot'), chosen, clip=data.get('clip'), scope=data.get('project'))
            else:
                project = self.project_required()
                lines = [project.name, '']
                for key, shot in project.shots.items():
                    lines += [f'镜头 {key.zfill(2)}  {shot["start"]:.3f}–{shot["end"]:.3f} 秒',
                              project.prompts.get(key, be.suggested_prompt(project, key)), '']
                chosen.write_text('\n'.join(lines), encoding='utf-8-sig')
                self.status = '逐镜提示词已导出'
        return None
