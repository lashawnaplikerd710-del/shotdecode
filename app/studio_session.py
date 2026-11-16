from __future__ import annotations

import hashlib
import os
import re
import secrets
import shutil
import tempfile
import threading
from collections import deque
from pathlib import Path

import backend as be
import spoken_translation as mt
import subtitle_edits as subtitles
from audio_mixing import MIX_TRACKS, make_mix, mix_levels
from app_identity import APP_NAME, engine_display_text
from media_previews import cache_folder, encode_preview, probe_preview
from studio_tools import StudioTools
from workflows import run_analysis, supplement_translation
import link_download


STEM_FILES = {'original': '原声', 'vocals': '人声', 'music': '配乐与环境声'}
AUDIO_LABELS = {**STEM_FILES, 'external': '外部音频'}
TIME_PATTERN = re.compile(r'(\d+):(\d{2}):(\d{2})[,.](\d{3})')


def project_id(path):
    return hashlib.sha256(str(path).casefold().encode('utf-8')).hexdigest()[:20]


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
        self.mix_preview = None
        self.mix_folder = None
        self.subtitle_revision = 0
        self.tools = StudioTools(self)
        self.job = None
        self.worker = None
        self.importing = False
        self.link_import = dict(phase='idle', message='', error='', platform='')
        self.status = '就绪'
        self.error = ''
        self.logs = deque(maxlen=220)
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
                self.set_source(initial)
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
        self.mix_preview = None
        self.tools.reset_project()
        self.status = '就绪'
        self.error = ''
        self.link_import = dict(phase='idle', message='', error='', platform='')

    def set_source(self, path):
        if not path.is_file():
            raise ValueError('所选视频已移动或不可读取。')
        self.clear_view()
        self.source = path.resolve()
        self.status = '已导入参考视频'

    def load_project(self, path, *, remember=True):
        project = be.Project(path)
        source = project.source
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

    def save_mix(self, config):
        if self.project:
            before = self.project.state.get('audio_mix')
            self.project.state['audio_mix'] = config
            try:
                self.project.save()
            except OSError:
                if before is None:
                    self.project.state.pop('audio_mix', None)
                else:
                    self.project.state['audio_mix'] = before
                raise
        else:
            self.source_mix = config

    def audio_sources(self, stems_dir):
        if self.source and (not self.project or self.project.data['source'].get('has_audio') is not False):
            yield 'original', self.source
        if stems_dir:
            for key in ('vocals', 'music'):
                yield key, stems_dir / (key + '.wav')
        external = self.mix_config().get('external')
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
        return tracks

    def waveform_source(self, key):
        with self.lock:
            path = self.assets.get(key)
            if path and any(candidate.resolve() == path for _, candidate in self.audio_sources(self.stems_directory())):
                return path
            return None

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
                shots = []
                for key, shot in project.shots.items():
                    replacement = project.replacements.get(key)
                    base = shot.get('base', {})
                    description = next((opinion['description'] for opinion in (shot.get('review'), shot.get('vlm'))
                                        if opinion and opinion.get('description')), '')
                    shots.append(dict(id=key, start=shot['start'], end=shot['end'], duration=shot['duration'],
                                      label=base.get('label_zh') or be.LABELS.get(base.get('label'), '待确认'),
                                      type=base.get('label'),
                                      description=description, thumb=self.frame(project, key),
                                      replacement=self.asset(replacement),
                                      replacement_name=Path(replacement).name if replacement else None))
                meta = project.data['source']
                source.update({key: meta[key] for key in ('duration', 'width', 'height', 'fps', 'has_audio')
                               if meta.get(key) is not None})
                source['poster'] = source.get('poster') or shots[0]['thumb']
                view = dict(id=project_id(project.path), name=project.name, folder=str(project.folder), shots=shots,
                            verdict=project.data.get('summary', {}).get('verdict', ''),
                            report=(project.folder / 'report.html').is_file(),
                            exports=[dict(label=label, url=self.asset(file), name=Path(file).name)
                                     for label, file in zip(('复刻成片', '对比视频'), project.state.get('last_exports', []))
                                     if Path(file).is_file()])
            stems_dir = self.stems_directory()
            return dict(project=view, source=source, recent=self.recent_cards,
                        tracks=[dict(id=key, label=label) for key, (_, label) in self.tracks().items()],
                        stems=self.stem_assets(stems_dir), options=self.options.copy(), status=self.status, error=self.error,
                        audio_tracks=self.timeline_audio(stems_dir),
                        audio_mix=mix_levels(self.mix_config().get('levels')),
                        external_audio=self.mix_config().get('external'), mix_preview=self.mix_preview,
                        subtitle_editable=bool(project and (project.folder / mt.RESULT).is_file()),
                        subtitle_revision=self.subtitle_revision,
                        link_import=self.link_import.copy(),
                        active=self.job is not None, importing=self.importing, tools=self.tools.snapshot(),
                        logs=list(self.logs), settings=dict(output=str(self.output_dir),
                        movie_output=str(self.movie_output_dir),
                        base=self.config.get('vlm_base', ''), model=self.config.get('vlm_model', ''),
                        env=self.config.get('env_file', ''), engine=self.config.get('engine', 'seedance2.0'),
                        capsule_root=self.config.get('capsule_root', ''), capsule_python=self.config.get('capsule_python', ''),
                        has_key=bool(self.vlm_key)))

    def emit(self, line):
        with self.lock:
            if line.strip():
                self.logs.append(engine_display_text(line.strip()))

    def start(self, title, run, done=None, *, clear_logs=True, on_failure=None, on_cancel=None):
        with self.lock:
            self.idle()
            self.status, self.error = title, ''
            if clear_logs:
                self.logs.clear()
            self.logs.append(title)
            job = self.job = be.Job(self.emit)

            def worker():
                try:
                    result = run(job)
                    job.check()
                    with self.lock:
                        self.status = done(result) if done else '已完成 · ' + title
                except be.Cancelled:
                    with self.lock:
                        self.status = '已停止'
                        if on_cancel:
                            on_cancel()
                except Exception as exc:
                    with self.lock:
                        self.status, self.error = '任务失败', engine_display_text(str(exc))
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
                self.job.cancel()

    def choose(self, kind, *, name='', directory=None):
        if not self.picker:
            raise ValueError('桌面文件选择器尚未准备好。')
        with self.dialog_lock:
            initial = directory or (self.source.parent if self.source and self.source.is_file() else self.output_dir)
            chosen = self.picker(kind, initial, name)
        return Path(chosen).resolve() if chosen else None

    def pick_source(self):
        path = self.choose('video')
        if path:
            with self.lock:
                self.idle()
                self.set_source(path)

    def pick_project(self):
        path = self.choose('project')
        if path:
            with self.lock:
                self.idle()
                self.load_project(path)

    def import_video(self, name, length, stream, shot=None):
        suffix = Path(name).suffix.lower()
        if suffix not in be.VIDEO_EXTENSIONS or length < 1:
            raise ValueError('请选择有效的视频文件。')
        imports = be.DATA / 'imports'
        imports.mkdir(exist_ok=True)
        if shutil.disk_usage(imports).free < length:
            raise ValueError('磁盘可用空间不足，无法保存导入的视频。')
        with self.lock:
            self.idle()
            if shot and shot not in self.project_required().shots:
                raise ValueError('镜头已变化，请重新选择。')
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
                if shot:
                    self.replace(shot, path)
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

            def done(status):
                self.load_project(out / 'breakdown.json')
                if saved_mix:
                    self.save_mix(saved_mix)
                return status or '视频拆解已完成'

            self.start('正在拆解视频', lambda job: run_analysis(job, source, out, task_options,
                       env_file=env_file, extra_env=extra, meta=meta), done)

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
                self.preview_info = {**info, 'poster': self.asset(poster)}

    def make_preview(self, path=None):
        with self.lock:
            if path is not None and path != str(self.source):
                return
            self.idle()
            source = self.file_required()
            dest = cache_folder(source) / 'compatible.mp4'

            def done(result):
                self.preview = result
                return '兼容预览已准备好'

            if dest.is_file() and dest.stat().st_size > 0:
                self.status, self.error = done(dest), ''
                return
            self.start('正在生成兼容预览', lambda job: encode_preview(job, source, dest), done, clear_logs=False)

    def replace(self, key, path):
        project = self.project_required()
        if key not in project.shots:
            raise ValueError('请选择一个有效的镜头。')
        previous = project.replacements.get(key)
        if path:
            project.replacements[key] = str(path)
        else:
            project.replacements.pop(key, None)
        try:
            project.save()
        except OSError:
            if previous is None:
                project.replacements.pop(key, None)
            else:
                project.replacements[key] = previous
            raise
        self.status = '镜头素材已更新'

    def export_dir(self, name):
        return be.new_folder(self.project.folder / 'exports' if self.project else self.output_dir, name)

    def choose_mix_audio(self):
        source, project = self.file_required(), self.project
        path = self.choose('audio')
        if not path:
            return False
        if not path.is_file() or path.suffix.lower() not in be.AUDIO_EXTENSIONS:
            raise ValueError('请选择可用的音频文件。')
        with self.lock:
            self.idle()
            if self.project is not project or self.source != source:
                raise ValueError('当前项目已切换，请重新选择音频。')
            config = self.mix_config().copy()
            levels = mix_levels(config.get('levels'))
            levels['external']['enabled'] = True
            self.save_mix({**config, 'external': str(path), 'levels': levels})
            self.mix_preview = None
            self.status = '外部音频已加入音轨'
            return True

    def selected_audio(self, levels, solo=None):
        paths = dict(self.audio_sources(self.stems_directory()))
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
            selected.append((path, setting['volume']))
        return selected

    def preview_audio_mix(self, data):
        with self.lock:
            self.idle()
            source = self.file_required()
            levels = mix_levels(self.mix_config().get('levels'), data.get('levels'))
            solo = data.get('solo')
            tracks = self.selected_audio(levels, solo)
            if not tracks:
                raise ValueError('请启用至少一条音轨来试听。')
            duration = self.project.data['source'].get('duration') if self.project else None
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

            self.start('正在准备' + title, lambda job: make_mix(job, source, duration, tracks, dest), done)

    def close(self):
        self.stop()
        if self.worker and self.worker.is_alive():
            self.worker.join(timeout=10)
        if self.mix_folder:
            self.mix_folder.cleanup()

    def assemble(self, data):
        mode = data.get('audio', 'original')
        audio = 'mute' if mode == 'mute' else None
        if mode == 'custom':
            audio = self.choose('audio')
            if not audio:
                return
        with self.lock:
            self.idle()
            project = self.project_required()
            source = self.file_required()
            mix_tracks = []
            if mode == 'mix':
                mix_tracks = self.selected_audio(mix_levels(self.mix_config().get('levels')))
                if not mix_tracks:
                    audio = 'mute'
                elif mix_tracks == [(source, 100)]:
                    mix_tracks = []
            replacements = {key: path for key, path in project.replacements.items() if key in project.shots}
            missing = [key for key, path in replacements.items() if not Path(path).is_file()]
            if missing:
                raise ValueError('请重新选择已移动的镜头素材 ' + '、'.join(missing))
            export_root = self.movie_output_dir
            overlays = data.get('overlays', True) is True
            compare = data.get('compare') is True

            def done(result):
                project.state['last_exports'] = list(map(str, result))
                project.save()
                return '时间线成片已导出'

            self.start('正在拼接时间线',
                       lambda job: job.assemble(project, replacements, export_root, overlays, audio,
                                                compare=compare, mix_tracks=mix_tracks), done)

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
                    self.transcribed = result
                return complete(result) if complete else '口播字幕已导出'

            self.start('正在转写口播', lambda job: job.transcribe(source, dest, language), done)

    def separate(self, *, source=None, complete=None):
        with self.lock:
            self.idle()
            source = source or self.file_required()
            dest = self.export_dir('音轨分离')

            def done(stems):
                if source == self.source:
                    if self.project:
                        self.project.state['stem_directory'] = str(stems)
                        self.project.save()
                    self.extra_stems = stems
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
        if command.startswith('tool_'):
            return self.tools.action(command[5:], data)
        if command == 'pick_source':
            return self.pick_source()
        if command == 'pick_project':
            return self.pick_project()
        if command == 'analyze':
            return self.analyze(data.get('options', {}))
        if command == 'analyze_link':
            return self.analyze_link(data.get('text', ''), data.get('options', {}))
        if command == 'assemble':
            return self.assemble(data)
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
        if command in ('pick_output', 'pick_movie_output', 'pick_env', 'replace', 'save_track', 'export_prompts'):
            return self.dialog_action(command, data)
        with self.lock:
            if command == 'read_track':
                path, _ = self.tracks().get(data.get('track'), (None, ''))
                return read_cues(path) if path else []
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
            if command == 'save_subtitle_edit':
                project = self.project_required()
                if data.get('project') != project_id(project.path):
                    raise ValueError('当前项目已切换，请重新打开校对面板。')
                index = subtitles.save(project, data)
                self.reload_project(project.path)
                self.subtitle_revision += 1
                self.status = '字幕、报告和 SRT 已同步保存'
                return {'groups': subtitles.editable(self.project), 'index': index}
            if command == 'save_audio_mix':
                self.file_required()
                config = self.mix_config().copy()
                config['levels'] = mix_levels(config.get('levels'), data.get('levels'))
                self.save_mix(config)
                self.status = '工程音轨设置已保存'
                return None
            if command == 'remove_mix_audio':
                config = self.mix_config().copy()
                config.pop('external', None)
                levels = mix_levels(config.get('levels'))
                levels['external']['enabled'] = False
                self.save_mix({**config, 'levels': levels})
                self.mix_preview = None
                self.status = '外部音频已移除'
                return None
            if command == 'new':
                return self.clear_view()
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
                return self.start('正在补写报告译文', lambda job: supplement_translation(job, project),
                                  lambda status: status)
            if command == 'clear_replacement':
                return self.replace(data.get('shot'), None)
            if command in ('save_prompt', 'reset_prompt'):
                project, key = self.project_required(), data.get('shot')
                if key not in project.shots:
                    raise ValueError('请选择一个有效的镜头。')
                if command == 'save_prompt':
                    project.prompts[key] = str(data.get('text', '')).strip()
                else:
                    project.prompts.pop(key, None)
                project.save()
                self.status = '提示词已保存' if command == 'save_prompt' else '已恢复分镜草稿'
                return None
        raise ValueError('这个操作不可用。')

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
                self.replace(data.get('shot'), chosen)
            else:
                project = self.project_required()
                lines = [project.name, '']
                for key, shot in project.shots.items():
                    lines += [f'镜头 {key.zfill(2)}  {shot["start"]:.3f}–{shot["end"]:.3f} 秒',
                              project.prompts.get(key, be.suggested_prompt(project, key)), '']
                chosen.write_text('\n'.join(lines), encoding='utf-8-sig')
                self.status = '逐镜提示词已导出'
        return None
