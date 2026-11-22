from __future__ import annotations

import hashlib
import json
import math
import shutil
import tempfile
from copy import deepcopy
from pathlib import Path

import backend as be
import spoken_translation as mt
from app_identity import engine_display_text


GROUPS = {'en': ('英文口播', 'english_speech', 'en'), 'ja': ('日语口播', 'rows', 'ja'),
          'screen': ('英文画面文字', 'english_screen', 'en')}
REPORTS = (Path('report.html'), Path('report.md'))
SCREEN_FILES = (mt.SCREEN_EN_SRT, mt.SCREEN_ZH_SRT)
SUBTITLE_FILES = (*SCREEN_FILES, *(item for pair in mt.SPEECH_FILES.values() for item in pair))
TRANSLATION_OUTPUTS = (mt.RESULT, *SUBTITLE_FILES, *REPORTS)


def revision(rows):
    return hashlib.sha256(json.dumps(rows, ensure_ascii=False, sort_keys=True).encode('utf-8')).hexdigest()


def editable(project):
    result = be.load_json(project.folder / mt.RESULT, {})
    groups = []
    for key, (label, entry, language) in GROUPS.items():
        rows = result.get(entry, [])
        if rows:
            groups.append(dict(id=key, label=label, revision=revision(rows), rows=[
                dict(start=row['start'], end=row['end'], original=row[language], translation=row.get('zh', ''))
                for row in rows]))
    return groups


def update_packaging(data, old, updated):
    cues = (data.get('packaging') or {}).get('text_cues', [])
    matched = []
    for cue in cues:
        if cue.get('t0') != old['start'] or cue.get('t1') != old['end'] or mt.screen_original(cue) != old['en']:
            continue
        lines = updated['en'].splitlines()
        cue.update(t0=updated['start'], t1=updated['end'], text='/'.join(lines), n_lines=len(lines),
                   workbench_bilingual={'en': updated['en'], 'zh': updated['zh']})
        matched.append(cue)
    return matched


def prepare_packaging(project, stage, data, matched):
    from rea_video.i18n import set_lang
    from rea_video.packaging import to_ass, to_srt

    set_lang(data.get('lang', 'zh'))
    pack = data['packaging']
    cues = sorted(pack['text_cues'], key=lambda cue: cue['t0'])
    paths = [Path('breakdown.json')]
    folder = stage / 'packaging'
    folder.mkdir(exist_ok=True)
    if any(cue['kind'] == 'subtitle' and not cue.get('part_of_picture') for cue in matched):
        path = Path('packaging/subtitles.srt')
        (stage / path).write_text(to_srt(cues), encoding='utf-8')
        paths.append(path)
    original_ass = Path('packaging/overlays.ass')
    if (project.folder / original_ass).is_file():
        meta = data['source']
        width, height = meta['width'], meta['height']
        if meta.get('rotation') in (90, 270):
            width, height = height, width
        (stage / original_ass).write_text(to_ass([cue for cue in cues if cue['kind'] != 'scene' and
                                                  not cue.get('part_of_picture')], width, height), encoding='utf-8')
        paths.append(original_ass)
    timeline_path = Path('packaging/timeline.json')
    timeline = be.load_json(project.folder / timeline_path, {})
    if timeline:
        changes = {cue.get('id'): cue for cue in matched}
        for cue in timeline.get('text', []):
            match = changes.get(cue.get('id'))
            if match:
                cue.update({key: match[key] for key in ('text', 't0', 't1')})
        if 'text' in timeline:
            timeline['text'].sort(key=lambda cue: cue['t0'])
        be.write_json(stage / timeline_path, timeline)
        paths.append(timeline_path)
    be.write_json(stage / 'breakdown.json', data)
    return paths


def render_reports(stage, data):
    from rea_video.report import write_reports

    write_reports(data, stage)
    for relative in REPORTS:
        path = stage / relative
        path.write_text(engine_display_text(path.read_text(encoding='utf-8')), encoding='utf-8')


def replace_outputs(folder, stage, paths):
    backup = stage / 'backup'
    for path in paths:
        if (folder / path).is_file():
            target = backup / path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(folder / path, target)
    completed = []
    try:
        for path in paths:
            destination = folder / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            if (stage / path).is_file():
                (stage / path).replace(destination)
            else:
                destination.unlink(missing_ok=True)
            completed.append(path)
    except OSError:
        for path in reversed(completed):
            if (backup / path).is_file():
                (backup / path).replace(folder / path)
            else:
                (folder / path).unlink(missing_ok=True)
        raise


def capture_outputs(folder, paths):
    outputs = {}
    for path in paths:
        try:
            outputs[path] = (folder / path).read_bytes()
        except FileNotFoundError:
            outputs[path] = None
    return outputs


def restore_outputs(folder, outputs):
    with tempfile.TemporaryDirectory(prefix='.恢复项目内容-', dir=folder) as scratch:
        stage = Path(scratch)
        for path, content in outputs.items():
            if content is not None:
                target = stage / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(content)
        replace_outputs(folder, stage, outputs)


def save(project, data):
    group = data.get('group')
    if group not in GROUPS:
        raise ValueError('请选择可校对的字幕组。')
    _, key, language = GROUPS[group]
    result = be.load_json(project.folder / mt.RESULT, {})
    rows = result.get(key, [])
    index = data.get('index')
    if type(index) is not int or not 0 <= index < len(rows) or revision(rows) != data.get('revision'):
        raise ValueError('字幕已更新，请重新打开校对面板。')
    try:
        start, end = (round(float(data[field]), 3) for field in ('start', 'end'))
    except (KeyError, TypeError, ValueError, OverflowError):
        raise ValueError('请填写有效的字幕时间。') from None
    duration = project.data['source'].get('duration')
    if not all(map(math.isfinite, (start, end))) or not 0 <= start < end or (duration and end > duration + .15):
        raise ValueError('结束时间需晚于开始时间，并落在视频时长内。')
    original, chinese = ('\n'.join(line.strip() for line in str(data.get(field, '')).splitlines() if line.strip())
                         for field in ('original', 'translation'))
    if not original or max(len(original), len(chinese)) > 4000:
        raise ValueError('原文不能为空，每个文本栏最多 4000 个字符。')
    old = rows[index]
    updated = {language: original, 'zh': chinese, 'start': start, 'end': end, 'edited': True}
    rows[index] = updated
    rows.sort(key=lambda row: (row['start'], row['end']))
    source_data = deepcopy(project.data) if group == 'screen' else project.data
    matched = update_packaging(source_data, old, updated) if group == 'screen' else []
    changed_tracks = SCREEN_FILES if group == 'screen' else mt.SPEECH_FILES[language]

    with tempfile.TemporaryDirectory(prefix='.字幕校对-', dir=project.folder) as scratch:
        stage = Path(scratch)
        for path in SUBTITLE_FILES:
            if path not in changed_tracks and (project.folder / path).is_file():
                (stage / path).parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(project.folder / path, stage / path)
        files = prepare_packaging(project, stage, source_data, matched) if matched else []
        if matched or not all((project.folder / path).is_file() for path in REPORTS):
            render_reports(stage, source_data)
        else:
            for path in REPORTS:
                shutil.copyfile(project.folder / path, stage / path)
        be.write_json(stage / mt.RESULT, result)
        if group == 'screen':
            mt.write_screen_tracks(stage, rows, changed=True)
        else:
            mt.write_speech_tracks(stage, language, rows, changed=True)
        mt.refresh_reports(stage)
        paths = [*files, *changed_tracks, mt.RESULT, *REPORTS]
        previous = capture_outputs(project.folder, paths)
        replace_outputs(project.folder, stage, paths)
    return next(i for i, row in enumerate(rows) if row is updated), previous
