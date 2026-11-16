from __future__ import annotations

import json
import math
import subprocess
import threading
from collections import OrderedDict
from concurrent.futures import Future
from contextlib import contextmanager, suppress

import backend as be


RATE = 4000
PEAK_LIMIT = 2400


class AudioWaveforms:
    def __init__(self):
        self.lock = threading.Lock()
        self.slots = threading.BoundedSemaphore(2)
        self.cache = OrderedDict()
        self.processes = set()
        self.closed = False

    def read(self, path):
        stat = path.stat()
        key = (path, stat.st_size, stat.st_mtime_ns)
        with self.lock:
            future = self.cache.get(key)
            cached = future is not None
            if cached:
                self.cache.move_to_end(key)
            else:
                future = self.cache[key] = Future()
        if cached:
            return future.result()

        try:
            with self.slots:
                future.set_result(self.build(path))
        except Exception as error:
            future.set_exception(error)
            with self.lock:
                self.cache.pop(key, None)
        else:
            with self.lock:
                for oldest, item in tuple(self.cache.items()):
                    if len(self.cache) <= 24:
                        break
                    if item.done():
                        self.cache.pop(oldest)
        return future.result()

    @staticmethod
    def kill(process):
        with suppress(OSError):
            if process.poll() is None:
                process.kill()

    @contextmanager
    def child(self, args, timeout):
        with self.lock:
            if self.closed:
                raise RuntimeError('工作台正在关闭。')
            process = subprocess.Popen(list(map(str, args)), stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                       stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
            self.processes.add(process)
        timer = threading.Timer(timeout, self.kill, args=(process,))
        timer.daemon = True
        timer.start()
        try:
            yield process
        finally:
            timer.cancel()
            self.kill(process)
            process.wait()
            process.stdout.close()
            with self.lock:
                self.processes.discard(process)

    def close(self):
        with self.lock:
            self.closed = True
            for process in self.processes:
                self.kill(process)

    def build(self, path):
        with self.child([be.FFPROBE, '-v', 'error', '-select_streams', 'a:0', '-show_entries',
                         'stream=index:format=duration', '-of', 'json', path], 12) as process:
            info, _ = process.communicate()
            if process.returncode:
                raise ValueError('无法读取媒体的音频信息。')
        meta = json.loads(info)
        if not meta.get('streams'):
            return dict(available=False, duration=0, interval=0, peaks=[])
        try:
            duration = float(meta.get('format', {}).get('duration', 0))
        except (TypeError, ValueError):
            duration = 0
        return self.decode(path, duration if math.isfinite(duration) and duration > 0 else 0)

    def decode(self, path, duration):
        import numpy as np

        step = max(RATE // 100, math.ceil(duration * (RATE / PEAK_LIMIT)))
        peaks = np.zeros(PEAK_LIMIT, dtype=np.int32)
        offset = 0
        args = [be.FFMPEG, '-v', 'error', '-nostdin', '-i', path, '-map', '0:a:0', '-vn', '-sn', '-dn',
                '-af', 'aresample=async=1:first_pts=0', '-ac', 2, '-ar', RATE, '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1']
        with self.child(args, 120) as process:
            while block := process.stdout.read(64 * 1024):
                stereo = np.frombuffer(block, dtype='<i2').astype(np.int32).reshape(-1, 2)
                amplitude = np.abs(stereo).max(axis=1)
                end = offset + amplitude.size
                while end > PEAK_LIMIT * step:
                    peaks[:PEAK_LIMIT // 2] = peaks.reshape(-1, 2).max(axis=1)
                    peaks[PEAK_LIMIT // 2:] = 0
                    step *= 2
                np.maximum.at(peaks, (np.arange(amplitude.size) + offset) // step, amplitude)
                offset = end
            if process.wait():
                raise ValueError('音频波形读取失败。')
        count = (offset + step - 1) // step
        levels = (peaks[:count] * 255 + 16_384) // 32_768
        return dict(available=bool(offset), duration=offset / RATE, interval=step / RATE, peaks=levels.tolist())
