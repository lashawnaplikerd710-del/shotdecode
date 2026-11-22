from __future__ import annotations

import os
import subprocess
from pathlib import Path


BINARIES = ('ffmpeg.exe', 'ffprobe.exe')


def ffmpeg_directory(home: Path) -> Path | None:
    local = home / 'ffmpeg'
    if all((local / binary).is_file() for binary in BINARIES):
        return local

    for entry in dict.fromkeys(os.get_exec_path()):
        folder = Path(entry.strip('"'))
        if not folder.is_absolute() or not all((folder / binary).is_file() for binary in BINARIES):
            continue
        try:
            options = dict(stdin=subprocess.DEVNULL, capture_output=True, timeout=5,
                           creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            encoders = subprocess.run([folder / 'ffmpeg.exe', '-hide_banner', '-encoders'], **options)
            filters = subprocess.run([folder / 'ffmpeg.exe', '-hide_banner', '-filters'], **options)
            probe = subprocess.run([folder / 'ffprobe.exe', '-version'], **options)
        except (OSError, subprocess.TimeoutExpired):
            continue
        if (encoders.returncode == filters.returncode == probe.returncode == 0
                and all(codec in encoders.stdout for codec in (b'libx264', b'libx265', b'libvpx-vp9', b'prores_ks', b' aac '))
                and b' subtitles ' in filters.stdout and b'ffprobe version ' in probe.stdout):
            return folder
    return None
