"""Project-level editing, comparison and reusable replacement workflows."""
from __future__ import annotations

import copy
import datetime as dt
import json
import math
import secrets
import subprocess
from pathlib import Path

import backend as be
from audio_mixing import mix_levels
from rea_video.clip_style import canvas_size
import studio_timeline as timeline
from studio_insights import observe


EDIT_FIELDS = ('timeline', 'timeline_magnet', 'timeline_tracks', 'timeline_audio', 'timeline_video', 'timeline_source_audio',
               'timeline_caption_rows',
               'replacements', 'prompts', 'clip_properties', 'audio_mix', *timeline.CLIP_OVERRIDE_FIELDS)


def editable_state(project):
    return dict(fields=copy.deepcopy({key:project.state[key] for key in EDIT_FIELDS if key in project.state}),
                captions=be.load_json(project.folder/be.MANUAL_CAPTIONS_FILE, []))


def restore_state(project, snapshot):
    previous = editable_state(project)
    caption_path = project.folder/be.MANUAL_CAPTIONS_FILE

    def set_fields(fields):
        for key in EDIT_FIELDS:
            if key in fields:
                project.state[key] = copy.deepcopy(fields[key])
            else:
                project.state.pop(key, None)
        project.replacements = project.state.setdefault('replacements', {})
        project.prompts = project.state.setdefault('prompts', {})
        timeline.separate_added_tracks(project)
    set_fields(snapshot['fields'])
    captions_changed = previous['captions'] != snapshot['captions']
    captions_saved = False
    try:
        if captions_changed:
            be.write_json(caption_path, snapshot['captions'])
            captions_saved = True
        project.save()
    except OSError:
        set_fields(previous['fields'])
        if captions_saved:
            be.write_json(caption_path, previous['captions'])
        raise


def probe(path, kind):
    try:
        out = subprocess.check_output(
            [be.FFPROBE, '-v', 'error', '-select_streams', kind+':0', '-show_entries',
             'stream=width,height,duration:stream_side_data=rotation:format=duration', '-of', 'json', path],
            stdin=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=6, creationflags=subprocess.CREATE_NO_WINDOW)
        data = json.loads(out)
        stream = data['streams'][0]
        duration = float(stream.get('duration') or data['format']['duration'])
        width, height = stream.get('width', 0), stream.get('height', 0)
        if any(abs(detail.get('rotation', 0)) == 90 for detail in stream.get('side_data_list', [])):
            width, height = height, width
        if not math.isfinite(duration) or not 0 < duration <= 100000:
            raise ValueError()
        return dict(duration=round(duration, 3), width=width, height=height)
    except (KeyError, IndexError, OSError, ValueError, subprocess.SubprocessError):
        raise ValueError(f'无法读取素材 {path.name}。') from None


def timestamp():
    return dt.datetime.now().isoformat(timespec='seconds')


def edit_lane_clip(items, data, kind, destination=None):
    row = next((item for item in items if item['id'] == data.get('id')), None)
    if row is None:
        raise ValueError('时间线片段已变化，请重新选择。')
    name = '音频片段' if kind == 'audio' else '视频片段'
    if data.get('remove') is True:
        items.remove(row)
        return row, '删除' + name
    if data.get('split') is True:
        at = timeline.split_time(data.get('time'), row['start'], timeline.clip_end(row))
        cut = round(row['first'] + at - row['start'], 3)
        second = dict(row, id=secrets.token_hex(8), start=at, first=cut)
        row['last'] = cut
        items.insert(items.index(row) + 1, second)
        return second, '时间线编辑'
    first, last, start = [timeline.seconds(data.get(key)) for key in ('first', 'last', 'start')]
    volume = data.get('volume')
    if last <= first or last > row['duration']:
        raise ValueError('片段起止时间超出可用范围。')
    if type(volume) is not int or not 0 <= volume <= 100:
        raise ValueError('音量须为 0 到 100 的整数。')
    if destination is not None and destination != row['lane']:
        occupied = [timeline.interval(item) for item in items if item['lane'] == destination]
        start = timeline.place_start(start, round(row['last'] - row['first'], 3), occupied)
        row.update(lane=destination, start=start)
        return row, '移动片段'
    occupied = timeline.lane_peers([item for item in items if item['lane'] == row['lane']], row)
    if data.get('operation') == 'trim':
        anchor = round(row['start'] - row['first'], 3)
        before, after = timeline.trim_limits(row['start'], timeline.clip_end(row), occupied)
        first, last = max(first, round(before - anchor, 3)), min(last, round(after - anchor, 3))
        if last <= first:
            raise ValueError('这条轨道没有足够的空位。')
        start = round(anchor + first, 3)
    else:
        start = timeline.place_start(start, round(last-first, 3), occupied)
    label = '移动片段' if (first, last) == (row['first'], row['last']) and start != row['start'] else '时间线编辑'
    row.update(first=first, last=last, start=start, volume=volume)
    return row, label


def append_track(fields, kind):
    identifier = 'track-' + secrets.token_hex(6)
    fields.setdefault('timeline_tracks', []).append(dict(id=identifier, kind=kind))
    return identifier


def media_lane(fields, kind, requested, *, create=False):
    if requested == 'new-track' and create:
        return append_track(fields, kind)
    accepted = {track['id'] for track in fields.get('timeline_tracks', []) if track['kind'] == kind}
    if kind == 'audio':
        accepted.update(timeline.AUDIO_LANES)
    if not isinstance(requested, str) or requested not in accepted:
        raise ValueError('请选择可以放入该素材的轨道。')
    return requested


class WorkspaceActions:
    def __init__(self, session, identify, read_cues):
        self.session = session
        self.identify = identify
        self.read_cues = read_cues
        self.library = {}

    def reset(self):
        self.library.clear()

    def scope(self, data):
        project = self.session.project_required()
        if data.get('project') != self.identify(project.path):
            raise ValueError('当前项目已切换，请重新打开工具。')
        return project

    def commit(self, project, before, after, label, *, record_undo=True):
        if before != after:
            restore_state(project, after)
            if record_undo:
                self.session.remember_workspace_undo(label, before)
            self.session.prompt_revision += 1
            self.session.subtitle_revision += 1
        self.session.status = '已保存'

    def edit(self, project, data):
        previous = timeline.layout(project)
        sequence, clips, parents, selected = timeline.edit(project, data)
        if previous == clips or timeline.clip_order(previous) == sequence:
            return {'clip': selected, 'duration': timeline.duration(project, previous)}
        before = editable_state(project)
        after = copy.deepcopy(before)
        after['fields']['timeline'] = sequence
        after['fields']['timeline_magnet'] = timeline.main_magnet(project)
        timeline.keep_clip_overrides(after['fields'], [*timeline.video_items(project), *sequence], parents)
        operation = data.get('operation')
        if operation != 'move' and (clips or not timeline.video_items(project)):
            spans = list(timeline.spans_for_edit(previous, clips, parents))
            after['captions'] = timeline.remap(before['captions'], spans, manual=True)
        label = {'remove': '删除视频片段', 'move': '移动片段'}.get(operation, '时间线编辑')
        self.commit(project, before, after, label)
        return {'clip': selected, 'duration': timeline.duration(project, clips)}

    def cut_timeline(self, project, ranges, before):
        previous = timeline.layout(project)
        duration = round(timeline.duration(project, previous), 3)
        spans = timeline.cut_spans(ranges, duration, project.data['source'].get('fps') or 24)
        if spans == [(0, duration, 0)]:
            return False

        after = copy.deepcopy(before)
        fields = after['fields']
        parents = {}
        main = timeline.cut_media(previous, spans, parents)
        if len(main) > max(timeline.MAX_CLIPS, len(previous)):
            raise ValueError(f'本次剪辑会生成过多片段，时间线最多支持 {timeline.MAX_CLIPS} 个主轨片段。')
        if 'timeline_video' in fields:
            fields['timeline_video'] = timeline.cut_media(fields['timeline_video'], spans, parents)
        layers = fields.get('timeline_video', [])
        if not (main or layers):
            raise ValueError('请至少保留一段包含画面的时间范围。')
        fields['timeline'] = timeline.clip_order(
            [dict(item, end=timeline.clip_end(item)) for item in main])
        fields['timeline_magnet'] = timeline.main_magnet(project) and not any(item.get('gap') for item in fields['timeline'])
        timeline.keep_clip_overrides(fields, [*main, *layers], parents)
        if 'timeline_audio' in fields:
            fields['timeline_audio'] = timeline.cut_media(fields['timeline_audio'], spans, {})
        for audio in fields.get('timeline_source_audio', {}).values():
            audio['clips'] = timeline.cut_media(audio['clips'], spans, {})
        after['captions'] = timeline.remap(before['captions'], spans, manual=True)
        self.commit(project, before, after, 'Agent 剪辑', record_undo=False)
        return before != after

    def transfer_video(self, project, data, from_main):
        before = editable_state(project)
        after = copy.deepcopy(before)
        fields = after['fields']
        main = timeline.layout(project)
        layers = fields.setdefault('timeline_video', [])
        magnetic = timeline.main_magnet(project)
        origin = main if from_main else layers
        identifier = data.get('clip' if from_main else 'id')
        item = next((row for row in origin if row['id'] == identifier), None)
        if item is None:
            raise ValueError('时间线片段已变化，请重新选择。')
        source, _, _ = timeline.video_input(project, item)
        if not source.is_file():
            raise ValueError('视频素材已移动，请重新选择。')
        origin.remove(item)
        requested = data.get('lane')
        at = timeline.seconds(data.get('start'))
        length = round(item['last']-item['first'], 3)
        order = timeline.clip_order(main)
        if from_main:
            lane = media_lane(fields, 'video', requested, create=True)
            occupied = [timeline.interval(clip) for clip in layers if clip['lane'] == lane]
            start = timeline.place_start(at, length, occupied)
            path = str(project.source) if item.get('shot') is not None else item['path']
            layers.append(dict(timeline.video_order_item(item), lane=lane, path=path, start=start,
                               duration=timeline.video_length(project, item), volume=item.get('volume', 100)))
            kind = 'video-layer'
        else:
            if len(main) >= 240:
                raise ValueError('此时间线已达到 240 个片段。')
            clip = timeline.video_order_item(item)
            if magnetic:
                index = timeline.magnetic_index(main, at)
                order.insert(index, clip)
                start = round(sum(row['duration'] for row in main[:index]), 3)
            else:
                start = timeline.place_start(at, length, [timeline.interval(row) for row in main])
                placed = dict(clip, start=start, end=round(start+length, 3), duration=length)
                order = timeline.clip_order(sorted([*main, placed], key=lambda row: row['start']))
            kind = 'video'
        fields['timeline'] = timeline.compact(order) if magnetic else order
        fields['timeline_magnet'] = magnetic
        self.commit(project, before, after, '移动片段')
        return dict(id=item['id'], kind=kind, start=start, duration=timeline.duration(project))

    def set_main_magnet(self, project, data):
        enabled = data.get('enabled')
        if not isinstance(enabled, bool):
            raise ValueError('请选择主轨磁吸状态。')
        before = editable_state(project)
        after = copy.deepcopy(before)
        after['fields']['timeline_magnet'] = enabled
        if enabled:
            previous = timeline.layout(project)
            order = timeline.clip_order(previous)
            if any(item.get('gap') for item in order):
                compacted = timeline.compact(order)
                after['fields']['timeline'] = compacted
                limit = timeline.duration(project, timeline.layout(project, compacted))
                after['captions'] = timeline.close_caption_gaps(before['captions'], previous, limit)
        self.commit(project, before, after, '主轨磁吸')
        return True

    def add_track(self, project, data):
        kind = data.get('kind')
        if kind not in ('audio', 'video', 'caption'):
            raise ValueError('请选择视频轨、音频轨或字幕轨。')
        before = editable_state(project)
        after = copy.deepcopy(before)
        if kind == 'caption':
            captions = timeline.numbered_lanes(before['captions'], self.session.caption_lane_count)
            identifier = f'caption:{len(captions)}'
            after['fields']['timeline_caption_rows'] = len(captions) + 1
        else:
            identifier = append_track(after['fields'], kind)
        self.commit(project, before, after, '添加轨道')
        return {'id': identifier}

    def save_lane_media(self, project, data, picked=None, *, kind='audio'):
        before = editable_state(project)
        after = copy.deepcopy(before)
        fields = after['fields']
        items = fields.setdefault('timeline_audio' if kind == 'audio' else 'timeline_video', [])
        limit = timeline.duration(project)
        if picked:
            media, duration = picked
            lane = media_lane(fields, kind, data.get('lane'))
            start = min(timeline.seconds(data.get('time', 0)), max(0, limit - .1))
            length = min(duration, round(limit - start, 3))
            if length <= 0:
                raise ValueError('请将播放头移到时间线内部。')
            occupied = [timeline.interval(item) for item in items if item['lane'] == lane]
            start = timeline.place_start(start, length, occupied, forward=True)
            row = dict(id=secrets.token_hex(8), path=str(media), lane=lane, start=start,
                       first=0, last=length, duration=duration, volume=100)
            items.append(row)
            label = '时间线编辑'
        else:
            destination = media_lane(fields, kind, data['lane'], create=True) if (
                data.get('operation') == 'move' and 'lane' in data) else None
            row, label = edit_lane_clip(items, data, kind, destination)
            if kind == 'video':
                for field in timeline.CLIP_OVERRIDE_FIELDS:
                    overrides = fields.get(field, {})
                    if data.get('split') is True and data['id'] in overrides:
                        overrides[row['id']] = overrides[data['id']]
                    if data.get('remove') is True:
                        overrides.pop(row['id'], None)
        self.commit(project, before, after, label)
        return {'id':row['id']}

    def save_source_audio(self, project, data):
        track = data.get('source_track')
        sources = dict(self.session.audio_sources(self.session.stems_directory()))
        path = sources.get(track) if isinstance(track, str) else None
        if path is None or not path.is_file():
            raise ValueError('找不到要编辑的音轨。')
        before = editable_state(project)
        original = timeline.source_audio_items(project, track, path)
        items = copy.deepcopy(original)
        row, label = edit_lane_clip(items, data, 'audio')
        if items != original:
            after = copy.deepcopy(before)
            fields = after['fields']
            overrides = fields.setdefault('timeline_source_audio', {})
            count = overrides.get(track, {}).get('row_count', 1)
            stored = {'clips': items, 'row_count': count}
            if track == 'external':
                stored['path'] = str(path)
            overrides[track] = stored
            self.commit(project, before, after, label)
        return {'id': row['id']}

    def transfer_audio(self, project, data):
        before = editable_state(project)
        after = copy.deepcopy(before)
        fields = after['fields']
        added = fields.setdefault('timeline_audio', [])
        overrides = fields.setdefault('timeline_source_audio', {})
        sources = dict(self.session.audio_sources(self.session.stems_directory()))
        groups = {}

        def load_group(key):
            path = sources.get(key)
            if path is None or not path.is_file():
                raise ValueError('找不到要编辑的音轨。')
            if key not in groups:
                lanes = timeline.source_audio_lanes(project, key, path)
                stored = {'row_count':len(lanes), 'clips':[
                    dict(row, row=index) for index, rows in enumerate(lanes) for row in rows
                ]}
                if key == 'external':
                    stored['path'] = str(path)
                groups[key] = overrides[key] = stored
            return groups[key], str(path)

        source = data.get('source_track')
        if source is not None and not isinstance(source, str):
            raise ValueError('请选择有效的音轨。')
        origin, origin_path = load_group(source) if source is not None else (None, None)
        items = origin['clips'] if origin is not None else added
        row, _ = edit_lane_clip(items, {**data, 'remove': True}, 'audio')
        path = row.get('path') or origin_path
        if not path or not Path(path).is_file():
            raise ValueError('音频素材已移动，请重新选择。')

        requested = data.get('lane')
        group = None
        number = None
        if isinstance(requested, str) and requested.startswith('source:'):
            parts = requested.split(':')
            if len(parts) != 3 or not parts[2].isascii() or not parts[2].isdecimal() or len(parts[2]) > 4:
                raise ValueError('请选择有效的音轨。')
            _, group, index = parts
            destination, group_path = load_group(group)
            number = int(index)
            if not 0 <= number < destination['row_count']:
                raise ValueError('目标音轨已变化，请重新选择。')
            target = destination['clips']
            peers = [item for item in target if item['row'] == number]
            lane = group
        else:
            lane = media_lane(fields, 'audio', requested, create=True)
            target = added
            peers = [item for item in target if item['lane'] == lane]
        start = timeline.place_start(timeline.seconds(data.get('start')), round(row['last']-row['first'], 3),
                                     [timeline.interval(item) for item in peers])
        moved = dict(row, lane=lane, start=start)
        if group is not None:
            moved['row'] = number
            if path == group_path:
                moved.pop('path', None)
            else:
                moved['path'] = path
        else:
            moved.pop('row', None)
            moved['path'] = path
            if source is not None:
                level = mix_levels(self.session.mix_config().get('levels'))[source]
                moved['volume'] = round(row['volume'] * level['volume'] / 100) if level['enabled'] else 0
        if source is not None and group != source:
            moved['id'] = secrets.token_hex(8)
        target.append(moved)
        self.commit(project, before, after, '移动片段')
        return dict(id=moved['id'], kind='source-audio' if group is not None else 'audio')

    def versions(self, project, data, action):
        file = project.folder/'shotdecode-versions.json'
        rows = be.load_json(file, [])
        if action == 'version_save':
            name = str(data.get('name') or '').strip()
            if not 1 <= len(name) <= 60 or '\x00' in name:
                raise ValueError('请输入 1 到 60 个字符的版本名。')
            if any(row['name'].casefold() == name.casefold() for row in rows):
                raise ValueError('已有同名版本，请换一个名字。')
            if len(rows) >= 40:
                raise ValueError('此项目已保存 40 个版本。')
            previous = rows
            rows = [dict(id=secrets.token_hex(7), name=name, saved=timestamp(), snapshot=editable_state(project)), *previous]
            be.write_json(file, rows)
            self.session.remember_undo('保存版本', lambda: be.write_json(file, previous))
        if action == 'version_restore':
            chosen = next((row for row in rows if row['id'] == data.get('id')), None)
            if not chosen:
                raise ValueError('此版本已不存在，请刷新列表。')
            self.commit(project, editable_state(project), chosen['snapshot'], '切换版本')
        summaries = [dict(id=row['id'], name=row['name'], saved=row['saved']) for row in rows]
        history = project.state.get('export_history', project.state.get('last_exports', []))
        exports = [dict(id=self.identify(path), name=path.name, path=path,
                        video=path.is_file() and path.suffix.lower() in be.VIDEO_EXTENSIONS,
                        folder=path.is_dir()) for path in map(Path, history) if path.exists()]
        if action == 'version_open_export':
            path = next((item['path'] for item in exports if item['id'] == data.get('id')), None)
            if not path:
                raise ValueError('成片文件已移动。')
            return self.session.open_result(path, '导出结果已打开')
        for item in exports:
            del item['path']
        return dict(versions=summaries, exports=exports)

    def insight(self, project, data, action):
        if action == 'insight_save':
            incoming = {}
            for key in ('retention', 'conversion'):
                value = data.get(key)
                if value is not None:
                    if type(value) not in (int, float) or not 0 <= value <= 100:
                        raise ValueError('指标请输入 0 至 100 之间的百分数。')
                    incoming[key] = round(value, 3)
            self.session.write_project_field(project, 'insight_metrics', incoming, label='修改项目数据')
        result = observe(project, self.read_cues)
        peers = []
        for path in project.state.get('insight_comparisons', []):
            try:
                peers.append(observe(be.Project(Path(path)), self.read_cues))
            except (OSError, ValueError, KeyError):
                continue
        return dict(current=result, comparisons=peers)

    def template_data(self, project):
        width, height = canvas_size(project.data['source'])
        files = [dict(item, url=self.session.asset(item['path'])) for item in self.library.values()]
        width_ratio = width / height
        slots, taken = [], set()
        notes = project.state.get('template_requirements', {})
        for key, shot in project.shots.items():
            length = shot['duration']
            texts = (project.data.get('packaging') or {}).get('text_cues', [])
            original_text = next((cue.get('text') for cue in texts if max(cue['t0'],shot['start']) <
                                  min(cue['t1'],shot['end']) and cue.get('text')), '')
            remaining = [item for item in files if item['id'] not in taken]

            def score(item):
                ratio = item['width']/item['height']
                return abs(math.log(ratio/width_ratio))*2 + abs(math.log(item['duration']/max(.04, length)))
            preferred = min(remaining, key=lambda item:(score(item),item['name'].casefold())) if remaining else None
            if preferred:
                taken.add(preferred['id'])
            slots.append(dict(shot=key, duration=length, width=width, height=height, start=shot['start'],
                              text=original_text[:110], thumb=self.session.frame(project, key),
                              requirement=notes.get(key,''),
                              suggestion=preferred['id'] if preferred else None))
        return dict(materials=[{key:item[key] for key in ('id','name','width','height','duration','url')} for item in files],
                    slots=slots, presets=be.load_json(be.DATA/'shotdecode-templates.json', []))

    def template(self, project, data, action):
        file = be.DATA/'shotdecode-templates.json'
        if action == 'template_apply':
            pairs = data.get('pairs')
            if not isinstance(pairs, dict) or not pairs or not pairs.keys() <= project.shots.keys():
                raise ValueError('请为至少一个镜头选择素材。')
            now = editable_state(project)
            updated = copy.deepcopy(now)
            for key, item_id in pairs.items():
                item = self.library.get(item_id) if isinstance(item_id, str) else None
                if not item or not Path(item['path']).is_file():
                    raise ValueError('素材列表已经变化，请重新选择。')
                updated['fields'].setdefault('replacements', {})[key] = item['path']
            self.commit(project, now, updated, '批量换品')
        if action == 'template_save':
            name = str(data.get('name') or '').strip()
            if not 1 <= len(name) <= 60 or '\x00' in name:
                raise ValueError('请输入 1 到 60 个字符的模板名。')
            requirements = data.get('requirements', {})
            if (not isinstance(requirements, dict) or not requirements.keys() <= project.shots.keys()
                    or any(not isinstance(value,str) or len(value)>200 or '\x00' in value
                           for value in requirements.values())):
                raise ValueError('每个镜头的卖点要求需在 200 字以内。')
            notes = {key:value.strip() for key,value in requirements.items() if value.strip()}
            previous = be.load_json(file, [])
            identifier = self.identify(project.path)
            rows = [row for row in previous if (row['project'],row['name']) != (identifier,name)]
            rows.insert(0, dict(id=secrets.token_hex(7), name=name, project=identifier,
                                path=str(project.path), saved=timestamp(), requirements=notes))
            previous_notes = project.state.get('template_requirements', {})
            self.session.write_project_field(project, 'template_requirements', notes)
            try:
                be.write_json(file, rows[:32])
            except OSError:
                self.session.write_project_field(project, 'template_requirements', previous_notes)
                raise

            def restore():
                active = self.session.project_required()
                self.session.write_project_field(active, 'template_requirements', previous_notes)
                try:
                    be.write_json(file, previous)
                except OSError:
                    self.session.write_project_field(active, 'template_requirements', notes)
                    raise

            self.session.remember_undo('保存参考模板', restore)
        if action == 'template_open':
            row = next((row for row in be.load_json(file, []) if row['id'] == data.get('id')), None)
            if not row or not Path(row['path']).is_file():
                raise ValueError('模板对应的参考项目已移动。')
            path = Path(row['path'])
            if 'requirements' in row:
                target = be.Project(path)
                target.state['template_requirements'] = row['requirements']
                target.save()
            self.session.load_project(path)
            return True
        return self.template_data(project)

    def choose_resource(self, command, project, data):
        kind = {'template_folder':'folder', 'insight_compare':'project',
                'timeline_audio_pick':'audio', 'timeline_video_pick':'video'}[command]
        initial = project.state.get('template_folder') if command == 'template_folder' else None
        path = self.session.choose(kind, directory=Path(initial) if initial else None)
        if not path:
            return None
        if command == 'template_folder':
            if not path.is_dir():
                raise ValueError('请选择包含替换视频的文件夹。')
            candidates = sorted((item for item in path.iterdir() if item.is_file() and
                                 item.suffix.lower() in be.VIDEO_EXTENSIONS), key=lambda item:item.name.casefold())[:60]
            materials = {}
            for clip in candidates:
                try:
                    info = probe(clip, 'v')
                    if not info['height'] or not info['width']:
                        continue
                except ValueError:
                    continue
                identifier = self.identify(clip)
                materials[identifier] = dict(info, path=str(clip), name=clip.name, id=identifier)
        elif kind in ('audio', 'video'):
            extensions = be.AUDIO_EXTENSIONS if kind == 'audio' else be.VIDEO_EXTENSIONS
            if not path.is_file() or path.suffix.lower() not in extensions:
                raise ValueError('请选择可用的媒体文件。')
            media = (path, probe(path, kind[0])['duration'])
        else:
            peer = be.Project(path)
        with self.session.lock:
            if self.scope(data) is not project:
                raise ValueError('当前项目已切换，请重新选择。')
            self.session.idle()
            if command == 'template_folder':
                self.session.write_project_field(project, 'template_folder', str(path))
                self.library = materials
                return self.template_data(project)
            if kind in ('audio', 'video'):
                return self.save_lane_media(project, data, media, kind=kind)
            previous = project.state.get('insight_comparisons', [])
            if peer.path != project.path and str(peer.path) not in previous:
                self.session.write_project_field(project, 'insight_comparisons', [*previous, str(peer.path)][-3:],
                                                 label='添加对比项目')
            return self.insight(project, data, command)

    def action(self, command, data):
        with self.session.lock:
            project = self.scope(data)
            if command not in ('version_list', 'insight_list', 'template_list'):
                self.session.idle()
            if command == 'timeline_edit':
                if data.get('operation') == 'move' and 'lane' in data:
                    return self.transfer_video(project, data, from_main=True)
                return self.edit(project, data)
            if command == 'timeline_magnet_set':
                return self.set_main_magnet(project, data)
            if command == 'timeline_track_add':
                return self.add_track(project, data)
            if command == 'timeline_audio_save' and data.get('operation') == 'move' and 'lane' in data and (
                'source_track' in data or str(data['lane']).startswith('source:')
            ):
                return self.transfer_audio(project, data)
            if command == 'timeline_audio_save' and 'source_track' in data:
                return self.save_source_audio(project, data)
            if command == 'timeline_video_save' and data.get('operation') == 'move' and data.get('lane') == 'main':
                return self.transfer_video(project, data, from_main=False)
            if command in ('timeline_audio_save', 'timeline_video_save'):
                return self.save_lane_media(project, data, kind='audio' if command == 'timeline_audio_save' else 'video')
            if command.startswith('version_'):
                return self.versions(project, data, command)
            if command in ('insight_list', 'insight_save'):
                return self.insight(project, data, command)
            if command in ('template_list', 'template_apply', 'template_save', 'template_open'):
                return self.template(project, data, command)
        if command in ('template_folder', 'insight_compare', 'timeline_audio_pick', 'timeline_video_pick'):
            return self.choose_resource(command, project, data)
        raise ValueError('此项目操作不可用。')
