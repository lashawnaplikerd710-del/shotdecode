from __future__ import annotations

import hashlib
import json
import math
import subprocess
import tempfile
from pathlib import Path

import backend as be


def cache_folder(source):
    stat = source.stat()
    key = f'{source}\n{stat.st_size}\n{stat.st_mtime_ns}'
    digest = hashlib.sha256(key.encode('utf-8')).hexdigest()[:24]
    return be.DATA / 'previews' / digest


def probe_preview(source):
    folder = cache_folder(source)
    info = {'needs_preview': (folder / 'compatible.mp4').is_file()}
    try:
        raw = subprocess.check_output(
            [be.FFPROBE, '-v', 'error', '-select_streams', 'V:0', '-show_entries',
             'stream=codec_name,pix_fmt:format=duration', '-of', 'json', source],
            stdin=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            timeout=8, creationflags=subprocess.CREATE_NO_WINDOW,
        )
        data = json.loads(raw)
        video = next(iter(data.get('streams', [])), {})
        codec, pixels = video.get('codec_name'), video.get('pix_fmt')
        if codec == 'hevc' or (codec == 'h264' and pixels and pixels not in ('yuv420p', 'yuvj420p')):
            info['needs_preview'] = True
        duration = float(data.get('format', {}).get('duration', 0))
        if math.isfinite(duration) and duration > 0:
            info['duration'] = duration
    except (OSError, ValueError, subprocess.SubprocessError):
        pass

    poster = folder / 'poster.jpg'
    if not poster.is_file():
        try:
            folder.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(dir=folder, prefix='frame-', ignore_cleanup_errors=True) as temp:
                frame = Path(temp) / 'poster.jpg'
                subprocess.run(
                    [be.FFMPEG, '-v', 'error', '-nostdin', '-i', source, '-map', '0:V:0', '-frames:v', '1',
                     '-vf', "scale='min(iw,640)':'min(ih,640)':force_original_aspect_ratio=decrease:reset_sar=1",
                     '-update', '1', frame],
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    timeout=10, check=True, creationflags=subprocess.CREATE_NO_WINDOW,
                )
                if frame.stat().st_size > 0:
                    frame.replace(poster)
        except (OSError, subprocess.SubprocessError):
            pass
    return info, poster


def encode_preview(job, source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent, prefix='encode-', ignore_cleanup_errors=True) as temp:
        output = Path(temp) / 'compatible.mp4'
        job.ffmpeg('-i', source, '-map', '0:V:0', '-map', '0:a:0?',
                   '-vf', "scale='min(iw,1280)':'min(ih,1280)':force_original_aspect_ratio=decrease:"
                   "force_divisible_by=2:reset_sar=1,fps='min(source_fps,30)'",
                   '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-profile:v', 'main',
                   '-c:a', 'aac', '-movflags', '+faststart', output)
        job.check()
        if output.stat().st_size == 0:
            raise ValueError('未生成可播放的兼容预览。')
        output.replace(destination)
    return destination
