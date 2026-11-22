"""Apply Agent tool requests through the same project and job state as the editor."""
from __future__ import annotations

from dataclasses import dataclass
from base64 import b64encode
import hashlib
import json
from math import isfinite
from pathlib import Path
from types import SimpleNamespace
import tempfile

import agent_footage
import backend as be
from media_previews import inspect_edit_media
import shotdecode_cli as cli
from rea_video.remake import fit_speed
from shotdecode_mcp import TOOLS
from studio_workspace import editable_state, probe
import studio_timeline as timeline


@dataclass
class ToolResult:
    message: str
    data: dict
    artifact: Path | None = None
    changed: bool = False
    show_timeline: bool = False


def agent_undo(session, turn, project, before):
    if not project or not before:
        return
    after = editable_state(project)
    if before == after:
        return
    last = session.edit_undo[-1] if session.edit_undo else None
    if last and last.revision == getattr(turn, 'undo_revision', None) and before == turn.undo_after:
        before = turn.undo_before
        session.edit_undo.pop()
    turn.undo_revision = session.remember_workspace_undo('本轮 Agent 修改', before)
    turn.undo_before = before
    turn.undo_after = after


def check_context(session, turn):
    context = turn.context
    if turn.cancelled.is_set():
        raise ValueError('本次 Agent 任务已停止。')
    if not context.get('source'):
        raise ValueError('请在 Agent 对话中添加剪辑素材或附带当前项目。')
    if context.get('incoming_footage'):
        attached = session.agent_footage
        if (session.agent_scope() != context.get('scope') or not attached or attached[0] != context.get('footage_key')
                or not Path(context['source']).is_file()):
            raise ValueError('工作台已切换项目或素材已移动。请重新添加素材后发送。')
        return
    project = str(session.project.path) if session.project else None
    if not session.source or str(session.source) != context['source'] or project != context.get('project'):
        raise ValueError('工作台已切换项目。请在新项目中重新发送指令。')


def shot_key(project, turn, args, *, use_selection=True):
    value = args.get('shot')
    if value is None and use_selection:
        value = (turn.context.get('shot') or {}).get('index')
    key = str(value) if type(value) in (int, str) else ''
    if key not in project.shots:
        raise ValueError('请选择该项目中的一个镜头，或在指令里写出镜头编号。')
    return key


def check_arguments(name, args):
    if not isinstance(args, dict):
        raise ValueError('请传入工作台工具的参数对象。')
    properties, required = TOOLS[name][2:]
    if not args.keys() <= properties.keys() or not all(field in args for field in required):
        raise ValueError('请使用这个工作台工具规定的参数。')
    for key, value in args.items():
        schema = properties[key]
        allowed = schema.get('enum')
        kind = schema.get('type')
        invalid = (
            (allowed is not None and value not in allowed) or
            (kind == 'integer' and (type(value) is not int or not 1 <= value <= 1_000_000)) or
            (kind == 'number' and (type(value) not in (int, float) or not 0 <= value <= 1_000_000 or not isfinite(value))) or
            (kind == 'boolean' and type(value) is not bool) or
            (kind == 'string' and (not isinstance(value, str) or not value.strip() or '\0' in value or len(value) > 16000))
        )
        if invalid:
            raise ValueError(f'工作台工具的 {key} 参数无效。')


def run_tool(session, turn, name, args, progress):
    check_arguments(name, args)
    with session.lock:
        check_context(session, turn)
        incoming = turn.context.get('incoming_footage')
        if incoming and name not in ('review_footage', 'read_frame', 'create_edit_project', 'make_first_cut', 'analyze_video'):
            raise ValueError('这条消息附带了新素材。请先查看素材并为它创建剪辑工程。')
        project = session.project
        modifying = name in ('apply_timeline_edit', 'save_caption', 'import_subtitles', 'save_shot_prompt',
                             'replace_shot', 'generate_shot')
        before = editable_state(project) if modifying and project else None
        if name == 'review_footage':
            result = {}

            def reviewed(data):
                result.update(data)
                return '素材预览已准备好'

            source = Path(turn.context['source'])
            session.start('正在查看原始素材', lambda job: agent_footage.review(job, source, args), reviewed,
                          announce=False)
        elif name == 'analyze_video':
            if incoming:
                session.idle()
                session.set_source(Path(turn.context['source']))
                turn.context.pop('incoming_footage')
                turn.context.pop('footage_key')
                turn.context['scope'] = session.agent_scope()
            options = {**session.options, 'vlm': False, **args}
            project_path = Path(session.analyze(options))
        elif name == 'export_movie':
            exporting = session.project_required()
            session.assemble(dict(audio=args.get('audio', 'mix'), overlays=args.get('overlays', True)))
        elif name == 'generate_shot':
            key = shot_key(session.project_required(), turn, args)
            session.video_generation_action('video_gen_comfy', dict(shot=key, text=args['text']), record_undo=False)
        else:
            result = project_tool(session, turn, name, args, before)
            agent_undo(session, turn, project, before)
            return result
        job, events, worker = session.job, session.task, session.worker

    progress(events.get('stage'), True)
    while worker.is_alive():
        worker.join(.25)
        with session.lock:
            if turn.cancelled.is_set() and session.job is job and events.get('phase') == 'running':
                session.stop()
            progress(events.get('stage'), False)
    if events.get('phase') != 'done':
        raise ValueError(events.get('error') or '工作台任务已停止。')

    if name == 'review_footage':
        with session.lock:
            check_context(session, turn)
        return ToolResult('已查看素材画面和时间码', result)
    if name == 'export_movie':
        path = Path(exporting.state['last_exports'][0])
        return ToolResult('已导出成片 ' + path.name, {'movie': str(path)}, path, True)
    if name == 'generate_shot':
        with session.lock:
            agent_undo(session, turn, project, before)
        path = Path(project.replacements[key])
        return ToolResult(f'镜头 {key} 已生成并替换', {'shot':key,'replacement':path.name}, path, True)
    with session.lock:
        if session.project and session.project.path == project_path:
            turn.context['project'] = str(project_path)
            turn.context['scope'] = session.agent_scope()
    project = be.Project(project_path)
    report = project.folder / 'report.html'
    return ToolResult(f'已拆解 {len(project.shots)} 个镜头', dict(project=str(project_path), report=str(report),
                      shots=len(project.shots), summary=project.data.get('summary', {}).get('verdict')),
                      project_path, True)


def timeline_revision(project, clips, snapshot):
    state = json.dumps([str(project.path), clips, snapshot], ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(state.encode('utf-8')).hexdigest()[:24]


def timeline_clip(project, item):
    path, first, fit = timeline.video_input(project, item)
    start, end = item['start'], timeline.clip_end(item)
    info = dict(id=item['id'], shot=item.get('shot'), start=start, end=end, material=path.name)
    if fit is None:
        info.update(media_start=first, media_end=round(first + end - start, 3))
    if 'lane' in item:
        info['lane'] = item['lane']
    return info


def read_timeline(project, turn, args):
    main = timeline.layout(project)
    duration = round(timeline.duration(project, main), 3)
    start, end = args.get('start', 0), args.get('end', duration)
    if end <= start and args:
        raise ValueError('查询结束时间需晚于开始时间。')
    clips = [timeline_clip(project, item) for item in main if timeline.overlaps(start, end, *timeline.interval(item))]
    layers = [timeline_clip(project, item) for item in timeline.video_items(project)
              if timeline.overlaps(start, end, *timeline.interval(item))]
    audio = [dict(id=item['id'], start=item['start'], end=timeline.clip_end(item), lane=item['lane'],
                  material=Path(item['path']).name) for item in timeline.audio_items(project)
             if timeline.overlaps(start, end, *timeline.interval(item))]
    return ToolResult('已读取当前剪辑时间线', dict(
        revision=timeline_revision(project, main, editable_state(project)), duration=duration,
        main=clips[:100], video_layers=layers[:100], audio_clips=audio[:100],
        truncated=any(len(items) > 100 for items in (clips, layers, audio)),
        selected_clip=turn.context.get('clip'), playhead=turn.context.get('playhead')))


def timeline_frame(project, position):
    clips = [*timeline.layout(project), *timeline.video_items(project)]
    item = next((clip for clip in reversed(clips) if clip['start'] <= position < timeline.clip_end(clip)), None)
    if item is None:
        raise ValueError('当前时间点没有画面，请用 read_timeline 查询可用的片段。')
    path, first, fit = timeline.video_input(project, item)
    at = first + position - item['start']
    if fit is not None:
        length = probe(path, 'v')['duration']
        fps = project.data['source'].get('fps') or 24
        at = min(at * fit_speed(length, fit), max(0, length - 1 / fps))
    return path, at


def open_source_edit(session, turn, source, *, metadata=None):
    session.create_edit_project(source, metadata=metadata)
    project = session.project_required()
    turn.context.pop('incoming_footage', None)
    turn.context.pop('footage_key', None)
    turn.context.update(project=str(project.path), scope=session.agent_scope(), label=project.name)
    return project


def make_first_cut(session, turn, source, args):
    meta = inspect_edit_media(source)
    timeline.cut_spans(args['ranges'], round(meta['duration'], 3), meta['fps'])
    title = args.get('opening_title', '').strip()
    if len(title) > 4000:
        raise ValueError('开场标题最多 4000 个字符。')
    project = open_source_edit(session, turn, source, metadata=meta)
    before = editable_state(project)
    try:
        session.workspace.cut_timeline(project, args['ranges'], before)
        duration = round(timeline.duration(project), 3)
        if title:
            session.change_manual_caption('save_manual_caption', dict(
                scope=turn.context['scope'], start=0, end=min(2, duration), text=title), record_undo=False)
    finally:
        agent_undo(session, turn, project, before)
    return ToolResult('成片初稿已在时间线打开', dict(duration=duration, main_clips=len(timeline.layout(project)),
                      opening_title=title, project=str(project.path)), changed=True, show_timeline=True)


def project_tool(session, turn, name, args, before):
    if name == 'read_frame':
        incoming = turn.context.get('incoming_footage')
        if incoming and ('shot' in args or 'timeline_time' in args):
            raise ValueError('请用 time 指定新素材中的原片时间。')
        source = Path(turn.context['source']) if incoming else session.file_required()
        if 'timeline_time' in args:
            if 'shot' in args or 'time' in args:
                raise ValueError('请指定一个时间线位置或一个原片位置。')
            position = args['timeline_time']
            source, at = timeline_frame(session.project_required(), position)
        elif 'shot' in args:
            project = session.project_required()
            key = shot_key(project, turn, args)
            position = at = args.get('time', project.shots[key]['start'])
        else:
            shot = turn.context.get('shot') or {}
            position = at = args.get('time', shot.get('start', turn.context.get('playhead', 0)))
        with tempfile.TemporaryDirectory(dir=be.DATA) as scratch:
            image = Path(scratch) / 'frame.jpg'
            job = be.Job(lambda _: None)
            job.ffmpeg('-ss', f'{at:.3f}', '-i', source, '-map', '0:v:0', '-frames:v', '1',
                       '-vf', 'scale=min(720\\,iw):-2', '-q:v', '4', image)
            if not image.is_file():
                raise ValueError('这个时间点未找到可用画面。')
            frame = dict(type='image', mimeType='image/jpeg', data=b64encode(image.read_bytes()).decode('ascii'))
        message = '已读取时间线素材帧' if 'timeline_time' in args else '已读取原片画面'
        return ToolResult(message, dict(time=position, _mcp_images=[frame]))
    if name == 'read_timeline':
        return read_timeline(session.project_required(), turn, args)
    if name == 'inspect_project':
        project = session.project_required()
        index = shot_key(project, turn, args, use_selection=False) if 'shot' in args else None
        result = cli.inspect_project(SimpleNamespace(project=project.path, shot=index, at=None), None)
        result['shots'] = result['shots'][:100]
        for item in result['shots']:
            current = project.replacements.get(str(item['index']))
            if current:
                item['replacement'] = Path(current).name
        result['tracks'] = [{"id": key, "label": label} for key, (_, label) in session.tracks().items()]
        result['selected_shot'] = turn.context.get('shot')
        result['playhead'] = turn.context.get('playhead')
        if timeline.explicit(project):
            result['timeline'] = timeline.source_clips(project)
        return ToolResult('已读取当前项目分镜', result)
    if name == 'read_subtitles':
        project = session.project_required()
        start, end = args.get('start'), args.get('end')
        if start is not None and end is not None and end <= start:
            raise ValueError('结束时间需晚于开始时间。')
        edited = timeline.explicit(project)
        result = cli.subtitles(SimpleNamespace(project=project.path, start=None if edited else start,
                                               end=None if edited else end), None)
        if edited:
            rows = result['subtitles']
            moved = timeline.remap([row for row in rows if row['kind'] != 'manual'],
                                   timeline.source_spans(project, timeline.layout(project)))
            result['subtitles'] = sorted((row for row in [*moved, *(row for row in rows if row['kind']=='manual')]
                if (start is None or row['end'] > start) and (end is None or row['start'] < end)), key=lambda row:row['start'])
        rows = be.load_json(session.manual_caption_file, [])
        manual_ids = {(row['start'], row['end'], row['text']): row['id'] for row in rows}
        result['truncated'] = len(result['subtitles']) > 120
        result['subtitles'] = result['subtitles'][:120]
        for row in result['subtitles']:
            if row['kind'] == 'manual':
                row['caption_id'] = manual_ids.get((row['start'], row['end'], row['original']))
        return ToolResult(f'已读取 {len(result["subtitles"])} 条字幕', result)

    session.idle()
    if name in ('create_edit_project', 'make_first_cut'):
        incoming = turn.context.get('incoming_footage')
        if session.project and not incoming:
            raise ValueError('当前已打开项目，可以直接读取时间线并剪辑。')
        source = Path(turn.context['source']) if incoming else session.file_required()
        if name == 'make_first_cut':
            return make_first_cut(session, turn, source, args)
        project = open_source_edit(session, turn, source)
        return ToolResult('已创建剪辑工程', dict(duration=timeline.duration(project)), changed=True, show_timeline=True)
    if name == 'apply_timeline_edit':
        project = session.project_required()
        clips = timeline.layout(project)
        if timeline_revision(project, clips, before) != args['revision']:
            raise ValueError('时间线有更新。请重新读取时间线，再应用剪辑。')
        old_duration = round(timeline.duration(project, clips), 3)
        changed = session.workspace.cut_timeline(project, args['ranges'], before)
        clips = timeline.layout(project)
        duration = round(timeline.duration(project, clips), 3)
        message = ('已应用剪辑 · {0:.2f} 秒 → {1:.2f} 秒'.format(old_duration, duration)
                   if changed else '当前时间线已符合这次剪辑')
        return ToolResult(message, dict(duration=duration, previous_duration=old_duration,
                                       main_clips=len(clips)), changed=changed, show_timeline=True)
    if name == 'save_caption':
        scope = turn.context['scope']
        caption = session.change_manual_caption('save_manual_caption', dict(
            scope=scope, id=args.get('caption_id'), start=args['start'], end=args['end'], text=args['text']), record_undo=False)
        return ToolResult('已保存手动字幕', caption, changed=True)
    if name == 'import_subtitles':
        track = args.get('track') or next((key for key in ('zh', 'en_zh', 'screen_zh') if key in session.tracks()), '')
        result = session.import_subtitle_track(dict(scope=turn.context['scope'], track=track), record_undo=False)
        return ToolResult(result['message'], result, changed=result['start'] is not None)

    project = session.project_required()
    key = shot_key(project, turn, args)
    if name == 'replace_shot':
        path = turn.material
        if not path or not path.is_file():
            raise ValueError('请在 Agent 输入区选择替换视频，再发送指令。')
        session.replace(key, path, record_undo=False)
        message = f'镜头 {key.zfill(2)} 已替换为 {path.name}'
        return ToolResult(message, dict(shot=key, replacement=path.name), changed=True)
    session.write_clip_setting(project, 'prompts', key, str(args['text']).strip())
    session.prompt_revision += 1
    return ToolResult(f'已保存镜头 {key.zfill(2)} 的提示词', dict(shot=key, text=args['text']), changed=True)
