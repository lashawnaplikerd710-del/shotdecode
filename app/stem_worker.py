from __future__ import annotations

import ctypes
import json
import logging
import os
import subprocess
import sys
import tempfile
from pathlib import Path


LOG = logging.getLogger(__name__)
TRACKS = ('original', 'vocals', 'music')


def publish_stems(staged, destination):
    if not destination.exists():
        staged.rename(destination)
        return
    previous = staged.with_name('previous')
    destination.rename(previous)
    try:
        staged.rename(destination)
    except OSError:
        previous.rename(destination)
        raise


def guarded_extract_stems(source, output):
    from backend import format_exit_code

    output = Path(output).resolve()
    try:
        output.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.stems-', dir=output, ignore_cleanup_errors=True) as temp:
            process = subprocess.run(
                [sys.executable, '-I', '-X', 'utf8', '-u', __file__, str(source), temp],
                stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, encoding='utf-8', errors='replace',
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            if process.returncode:
                raise RuntimeError(f'音轨分离进程退出，代码 {format_exit_code(process.returncode)}。')

            result = json.loads(process.stdout)
            if not result['ok']:
                if result.get('reason') == 'no audio':
                    return {'ok': False, 'reason': '没有读到可分离的音频。'}
                raise RuntimeError(result.get('reason') or '没有生成分轨文件。')

            staged, destination = Path(temp) / 'stems', output / 'stems'
            if any((staged / f'{track}.wav').stat().st_size <= 44 for track in TRACKS):
                raise RuntimeError('分轨文件不完整。')
            publish_stems(staged, destination)
            result.update({track: str(destination / f'{track}.wav') for track in TRACKS})
            return result
    except (OSError, ValueError, KeyError, RuntimeError) as exc:
        LOG.warning('分轨未完成 · %s', exc)
        return {'ok': False, 'reason': str(exc)}


if __name__ == '__main__':
    if os.name == 'nt':
        # Return native failures to the analysis process without opening a Windows error dialog.
        ctypes.windll.kernel32.SetErrorMode(0x0003)
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s', datefmt='%H:%M:%S')
    from rea_video.stems import extract_stems

    print(json.dumps(extract_stems(*sys.argv[1:]), ensure_ascii=False))
