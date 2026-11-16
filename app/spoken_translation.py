from __future__ import annotations

import html
import json
import re
import secrets
import socket
import tempfile
import time
import unicodedata
import urllib.error
import urllib.request
from contextlib import contextmanager
from copy import deepcopy
from pathlib import Path

import backend as be


SERVER = be.HOME / 'translation/llama-server.exe'
MODEL = be.HOME / 'translation/Hy-MT2-1.8B-Q4_K_M.gguf'
RESULT = Path('packaging/speech-translation.json')
JA_SRT = Path('packaging/speech-ja.srt')
ZH_SRT = Path('packaging/speech-zh.srt')
EN_SRT = Path('packaging/speech-en.srt')
EN_ZH_SRT = Path('packaging/speech-en-zh.srt')
SCREEN_EN_SRT = Path('packaging/screen-en.srt')
SCREEN_ZH_SRT = Path('packaging/screen-zh.srt')
START = '<!-- rea-workbench-spoken-translation:start -->'
END = '<!-- rea-workbench-spoken-translation:end -->'
SPEECH_KEYS = {'ja': 'rows', 'en': 'english_speech'}
SPEECH_FILES = {'ja': (JA_SRT, ZH_SRT), 'en': (EN_SRT, EN_ZH_SRT)}
SECTION_INFO = (
    ('rows', 'ja', 'speech-translation', '日语口播与中文翻译', '日文原文',
     '来自日语音轨的本地转写和翻译。口播时间为估算值。'),
    ('english_speech', 'en', 'english-speech-translation', '英文口播与中文翻译', '英文原文',
     '来自英文音轨的本地转写和翻译。口播时间为估算值。'),
    ('english_screen', 'en', 'english-screen-translation', '英文画面文字与中文翻译', '英文原文',
     '来自视频画面识别的字幕、标题和其他叠加文字。'),
)


def ready() -> bool:
    return SERVER.is_file() and MODEL.is_file() and be.speech_model_ready('auto')


@contextmanager
def translator(job: be.Job):
    if not SERVER.is_file() or not MODEL.is_file():
        raise ValueError('本地翻译模型缺少文件。')
    with socket.socket() as reserve:
        reserve.bind(('127.0.0.1', 0))
        port = reserve.getsockname()[1]
    address = f'http://127.0.0.1:{port}'
    token = secrets.token_urlsafe(24)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def request(path, payload=None, timeout=2):
        headers = {'Authorization': 'Bearer ' + token}
        data = None
        if payload is not None:
            data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        with opener.open(urllib.request.Request(address + path, data, headers), timeout=timeout) as response:
            return json.load(response)

    args = [SERVER, '--model', MODEL, '--host', '127.0.0.1', '--port', port, '--api-key', token,
            '--threads', 6, '--ctx-size', 2048, '--parallel', 1, '-ngl', 0, '--jinja', '--no-warmup']
    with tempfile.TemporaryFile() as log:
        with job.child(args, cwd=SERVER.parent, stdout=log) as process:
            deadline = time.monotonic() + 50
            while time.monotonic() < deadline:
                job.check()
                if process.poll() is not None:
                    log.seek(0, 2)
                    log.seek(max(0, log.tell() - 1800))
                    raise RuntimeError('本地翻译模型启动失败。\n' + log.read().decode('utf-8', errors='replace'))
                try:
                    if request('/health').get('status') == 'ok':
                        break
                except (urllib.error.URLError, TimeoutError, OSError):
                    pass
                time.sleep(.25)
            else:
                raise RuntimeError('本地翻译模型启动超时。')

            def translate(text, language):
                job.check()
                source = '日语口播' if language == 'ja' else '英文'
                prompt = f'请将以下{source}翻译为自然的简体中文。请只输出译文，保留原意。\n\n{text}'
                try:
                    response = request('/v1/chat/completions', {
                        'messages': [{'role': 'user', 'content': prompt}],
                        'max_tokens': min(450, max(100, len(text) * 3)),
                        'temperature': .35, 'top_p': .6, 'top_k': 20, 'repeat_penalty': 1.05,
                        'stream': False,
                    }, timeout=65)
                except (urllib.error.URLError, TimeoutError, OSError) as exc:
                    job.check()
                    raise RuntimeError('本地模型未能完成翻译。') from exc
                job.check()
                choice = response['choices'][0]
                result = ' '.join((choice['message'].get('content') or '').split())
                if not result or choice.get('finish_reason') == 'length':
                    raise RuntimeError('本地模型没有返回完整译文。')
                return result

            yield translate


def screen_original(cue):
    if cue.get('workbench_bilingual'):
        return cue['workbench_bilingual']['en']
    if cue.get('kind') == 'scene' or cue.get('part_of_picture'):
        return ''
    raw = cue.get('text') or ''
    lines = raw.split('/') if (cue.get('n_lines') or 1) > 1 else [raw]
    english = [line for line in lines if re.search(r'[A-Za-z]', line)
               and all(not char.isalpha() or 'LATIN' in unicodedata.name(char, '') for char in line)]
    return ' '.join(' '.join(english).split())


def english_screen_rows(data):
    found = {}
    for cue in (data.get('packaging') or {}).get('text_cues', []):
        text = screen_original(cue)
        if not text:
            continue
        start, end = cue.get('t0'), cue.get('t1')
        if isinstance(start, (int, float)) and isinstance(end, (int, float)) and 0 <= start < end:
            row = dict(start=start, end=end, en=text)
            if cue.get('workbench_bilingual'):
                row.update(edited=True, zh=cue['workbench_bilingual']['zh'])
            found[(start, end, text)] = row
    return [found[key] for key in sorted(found)]


def translate_report(job: be.Job, source: Path, folder: Path, data):
    previous = be.load_json(folder / RESULT, {})
    result = deepcopy(previous)
    notes = []
    if not result.get('speech_checked') and data['source'].get('has_audio') is not False:
        try:
            if not source.is_file():
                raise ValueError('原视频已移动。重新定位原片后可补写口播译文。')
            job.emit('正在识别口播语言和原文…')
            segments = job.speech_segments(source, 'auto')
            for language, key in SPEECH_KEYS.items():
                if not result.get(key):
                    result[key] = [dict(start=segment.start, end=segment.end, anchors=segment.anchors,
                                        **{language: segment.text}) for segment in segments
                                   if segment.language == language]
            result['speech_checked'] = True
        except (OSError, RuntimeError, ValueError) as error:
            job.check()
            job.emit(f'口播识别未完成 · {error}')
            notes.append('口播识别未完成。详情见工作台任务日志。')

    cache = {(language, row[language]): row['zh']
             for key, language, *_ in SECTION_INFO for row in previous.get(key, []) if row.get('zh')}
    if (data.get('packaging') or {}).get('text_cues') is not None:
        screen = {(row['start'], row['end'], row['en']): row for row in previous.get('english_screen', [])}
        result['english_screen'] = [row if row.get('edited') else screen.get((row['start'], row['end'], row['en']), row)
                                    for row in english_screen_rows(data)]
        for row in screen.values():
            if row.get('edited') and row not in result['english_screen']:
                result['english_screen'].append(row)
    pending = []
    for key, language, *_ in SECTION_INFO:
        for row in result.get(key, []):
            if row.get('edited'):
                continue
            translated = row.get('zh') or cache.get((language, row[language]))
            if translated:
                row['zh'] = translated
            else:
                pending.append((language, row))

    if pending:
        try:
            job.emit('正在加载本地翻译模型…')
            with translator(job) as translate:
                for i, (language, row) in enumerate(pending, 1):
                    key = (language, row[language])
                    if key not in cache:
                        cache[key] = translate(row[language], language)
                    row['zh'] = cache[key]
                    job.emit(f'报告中译 {i}/{len(pending)} 条')
        except (OSError, RuntimeError, ValueError) as error:
            job.check()
            job.emit(f'报告中译未完成 · {error}')
            notes.append('部分译文待补。可在工作台点「补写报告译文」重试。')

    job.check()
    result.pop('note', None)
    result['notes'] = notes
    for language, key in SPEECH_KEYS.items():
        rows = result.get(key, [])
        if rows:
            write_speech_tracks(folder, language, rows, changed=rows != previous.get(key))
    rows = result.get('english_screen', [])
    if rows:
        write_screen_tracks(folder, rows, changed=rows != previous.get('english_screen'))
    if result != previous:
        be.write_json(folder / RESULT, result)
    refresh_reports(folder)
    count = sum(bool(row.get('zh')) for key, *_ in SECTION_INFO for row in result.get(key, []))
    return count, bool(notes)


def write_speech_tracks(folder, language, rows, *, changed):
    original, translated = (folder / path for path in SPEECH_FILES[language])
    if changed or not original.is_file():
        be.write_srt(original, subtitle_cues(rows, language, wrap=True))
    translated_rows = [row for row in rows if row.get('zh')]
    if translated_rows and (changed or not translated.is_file()):
        be.write_srt(translated, subtitle_cues(translated_rows, 'zh', wrap=True))
    elif changed and not translated_rows:
        translated.unlink(missing_ok=True)


def subtitle_cues(rows, language, *, wrap=False):
    for row in sorted(rows, key=lambda item: (item['start'], item['end'])):
        text = row.get(language)
        if text:
            if wrap and not row.get('edited'):
                yield from be.wrap_speech(row['start'], row['end'], text, row.get('anchors', ()) if language != 'zh' else ())
            else:
                yield row['start'], row['end'], text


def write_screen_tracks(folder, rows, *, changed):
    for language, relative in (('en', SCREEN_EN_SRT), ('zh', SCREEN_ZH_SRT)):
        path = folder / relative
        if changed or not path.is_file():
            cues = list(subtitle_cues(rows, language))
            if cues:
                be.write_srt(path, cues)
            elif changed:
                path.unlink(missing_ok=True)


def time_span(row):
    return '–'.join(be.srt_time(row[key]).replace(',', '.')[:12] for key in ('start', 'end'))


def insert_section(original, section, pattern):
    enclosed = f'{START}\n{section}\n{END}' if section else ''
    existing = re.compile(re.escape(START) + r'.*?' + re.escape(END), re.DOTALL)
    if existing.search(original):
        return existing.sub(lambda _: enclosed, original, count=1)
    if not enclosed:
        return original
    position = pattern.search(original)
    offset = position.start() if position else len(original)
    return original[:offset] + '\n' + enclosed + '\n\n' + original[offset:]


def atomic_text(path, text):
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(text, encoding='utf-8')
    temp.replace(path)


def refresh_reports(folder: Path):
    result = be.load_json(folder / RESULT, {})
    if not result:
        return
    html_sections, md_sections = [], []
    for key, language, section_id, title, source_label, description in SECTION_INFO:
        rows = result.get(key, [])
        if not rows:
            continue
        links = []
        files = SPEECH_FILES[language] if key == SPEECH_KEYS[language] else (SCREEN_EN_SRT, SCREEN_ZH_SRT)
        links = [(path.as_posix(), label) for path, label in
                 zip(files, (source_label + ' SRT', '中文译文 SRT')) if (folder / path).is_file()]
        html_links = ' · '.join(f'<a href="{link}">{label}</a>' for link, label in links)
        md_links = ' · '.join(f'[{label}]({link})' for link, label in links)
        entries = []
        md_rows = [f'| 时间 | {source_label} | 中文意思 |', '|---|---|---|']
        for row in rows:
            start_end = time_span(row)
            source = html.escape(row[language])
            chinese = html.escape(row.get('zh') or '待翻译')
            entries.append(f'<tr><td style="white-space:nowrap">{start_end}</td>'
                           f'<td lang="{language}">{source}</td><td lang="zh-CN">{chinese}</td></tr>')
            escaped = [text.replace('|', r'\|').replace('\n', ' ') for text in (source, chinese)]
            md_rows.append(f'| {start_end} | {escaped[0]} | {escaped[1]} |')
        html_sections.append('\n'.join([
            f'<section class="card" id="{section_id}" lang="zh-CN">', f'<h2>{title}</h2>', f'<p>{description}</p>',
            *([f'<p>{html_links}</p>'] if links else []),
            f'<table><thead><tr><th>时间</th><th>{source_label}</th><th>中文意思</th></tr></thead><tbody>',
            *entries, '</tbody></table></section>',
        ]))
        md_sections.append('\n\n'.join([f'## {title}', description, *([md_links] if links else []), '\n'.join(md_rows)]))
    notes = result.get('notes', []) + ([result['note']] if result.get('note') else [])
    if notes:
        html_sections.append('<section class="card" lang="zh-CN"><h2>报告中译状态</h2>\n' +
                             '\n'.join(f'<p>{html.escape(note)}</p>' for note in notes) + '</section>')
        md_sections.append('## 报告中译状态\n\n' + '\n\n'.join(notes))

    path = folder / 'report.html'
    if path.is_file():
        original = path.read_text(encoding='utf-8-sig')
        marker = re.compile(r'<section\b|</main>|</body>', re.IGNORECASE)
        updated = insert_section(original, '\n'.join(html_sections), marker)
        if updated != original:
            atomic_text(path, updated)
    path = folder / 'report.md'
    if path.is_file():
        original = path.read_text(encoding='utf-8-sig')
        updated = insert_section(original, '\n\n'.join(md_sections), re.compile(r'^## ', re.MULTILINE))
        if updated != original:
            atomic_text(path, updated)
