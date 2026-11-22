"""Collect timestamped evidence from raw footage for a first cut."""
from __future__ import annotations

from base64 import b64encode
from pathlib import Path
import re
import tempfile

from PIL import Image, ImageDraw, ImageOps

import backend as be
from media_previews import inspect_edit_media
from studio_timeline import seconds


SCAN_WINDOW = 90
SCENE_TIME = re.compile(r'pts_time:([0-9.]+)')
SILENCE_TIME = re.compile(r'silence_(start|end):\s*(-?[0-9.]+)')


def scan_changes(job, source, start, end, has_audio):
    args = [be.FFMPEG, '-hide_banner', '-nostdin', '-loglevel', 'info',
            '-ss', f'{start:.3f}', '-t', f'{end-start:.3f}', '-i', source, '-map', '0:V:0',
            '-vf', "fps=6,scale=240:240:force_original_aspect_ratio=decrease,select='gt(scene,0.28)',showinfo"]
    if has_audio:
        args += ['-map', '0:a:0', '-af', 'silencedetect=n=-35dB:d=0.45']
    output = job.run([*args, '-f', 'null', '-'], quiet=True)
    cuts = []
    for value in SCENE_TIME.findall(output):
        at = round(start + float(value), 3)
        if at - (cuts[-1] if cuts else start) >= .3 and end - at >= .3:
            cuts.append(at)
    quiet = []
    beginning = None
    for edge, value in SILENCE_TIME.findall(output):
        at = round(min(end, max(start, start + float(value))), 3)
        if edge == 'start':
            beginning = at
        elif beginning is not None:
            if at > beginning:
                quiet.append(dict(start=beginning, end=at))
            beginning = None
    if beginning is not None and beginning < end:
        quiet.append(dict(start=beginning, end=end))
    return cuts, quiet


def storyboard(job, source, scratch, start, end, cuts):
    points = [start + (end-start) * i/8 for i in range(8)]
    centers = [(a+b)/2 for a, b in zip([start, *cuts], [*cuts, end])]
    if cuts:
        count = min(4, len(centers))
        points.extend(centers[len(centers)*(2*i+1)//(2*count)] for i in range(count))
    tiles = []
    samples = []
    for index, at in enumerate(sorted(set(round(point, 3) for point in points))):
        job.check()
        path = scratch / f'frame-{index:02d}.jpg'
        job.ffmpeg('-ss', f'{at:.3f}', '-i', source, '-map', '0:V:0', '-frames:v', '1',
                   '-vf', 'scale=256:196:force_original_aspect_ratio=decrease', '-q:v', '4', path)
        if path.is_file():
            with Image.open(path) as frame:
                tiles.append(ImageOps.contain(frame.convert('RGB'), (236, 168)))
            samples.append(dict(frame=len(tiles), time=at))
    if not tiles:
        raise ValueError('这个范围无法提取参考画面，请选择其他时间范围。')

    sheet = Image.new('RGB', (960, ((len(tiles)+3)//4) * 194), '#20242b')
    draw = ImageDraw.Draw(sheet)
    for i, (frame, item) in enumerate(zip(tiles, samples)):
        x, y = (i % 4)*240, (i // 4)*194
        sheet.paste(frame, (x+(240-frame.width)//2, y+(170-frame.height)//2))
        draw.text((x+8, y+174), f'#{item["frame"]:02d}   {item["time"]:.3f}s', fill='white')
    file = scratch / 'storyboard.jpg'
    sheet.save(file, quality=84, optimize=True)
    image = dict(type='image', mimeType='image/jpeg', data=b64encode(file.read_bytes()).decode('ascii'))
    return samples, image


def speech_evidence(job, source, scratch, start, end):
    if not be.speech_model_ready('auto'):
        return 'model_unavailable', []
    wave = scratch / 'speech.f32'
    try:
        job.ffmpeg('-ss', f'{start:.3f}', '-t', f'{end-start:.3f}', '-i', source,
                   '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', wave)
        rows = be.recognize_speech(wave, job.emit, job.check, 'auto')
    except (OSError, ValueError, RuntimeError) as error:
        job.emit(f'口播识别未完成 · {error}')
        return 'unavailable', []
    return 'done', [dict(start=round(start + row.start, 3), end=round(min(end, start + row.end), 3),
                         text=row.text, language=row.language) for row in rows if start + row.start < end]


def review(job, source, options):
    info = inspect_edit_media(source)
    duration = round(info['duration'], 3)
    start = seconds(options.get('start', 0))
    end = seconds(options.get('end', duration))
    if not start < end <= duration:
        raise ValueError('查看范围必须在原素材时长内。')
    scanned = end - start <= SCAN_WINDOW
    cuts, quiet = [], []
    if scanned:
        job.set_stage('正在检测素材分段和静音')
        cuts, quiet = scan_changes(job, source, start, end, info['has_audio'])
    with tempfile.TemporaryDirectory(dir=be.DATA) as directory:
        scratch = Path(directory)
        job.set_stage('正在生成带时间码的素材预览')
        samples, image = storyboard(job, source, scratch, start, end, cuts)
        speech = []
        speech_status = 'not_requested'
        if options.get('speech'):
            if not info['has_audio']:
                speech_status = 'no_audio'
            elif not scanned:
                speech_status = 'select_shorter_window'
            else:
                job.set_stage('正在识别素材口播')
                speech_status, speech = speech_evidence(job, source, scratch, start, end)
    return dict(duration=duration, width=info['width'], height=info['height'], rotation=info['rotation'],
                has_audio=info['has_audio'], start=start, end=end, scene_scan_complete=scanned,
                scene_changes=cuts, quiet_ranges=quiet, samples=samples, speech_status=speech_status,
                speech=speech, _mcp_images=[image])
