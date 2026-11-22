from __future__ import annotations

import json
import math


MIX_TRACKS = ('original', 'vocals', 'music', 'external')


def mix_levels(saved=None, changes=None):
    levels = {key: {'enabled': key == 'original', 'volume': 100} for key in MIX_TRACKS}
    for key, setting in (saved if isinstance(saved, dict) else {}).items():
        if key in levels and isinstance(setting, dict):
            enabled = setting.get('enabled')
            volume = setting.get('volume')
            if isinstance(enabled, bool):
                levels[key]['enabled'] = enabled
            if type(volume) is int and 0 <= volume <= 100:
                levels[key]['volume'] = volume
    if changes is None:
        return levels
    if not isinstance(changes, dict):
        raise ValueError('音轨设置格式无效。')
    for key, setting in changes.items():
        if key not in levels or not isinstance(setting, dict):
            raise ValueError('请选择可用的音轨。')
        enabled, volume = setting.get('enabled'), setting.get('volume')
        if type(enabled) is not bool or type(volume) is not int or not 0 <= volume <= 100:
            raise ValueError('音量须为 0 到 100 的整数。')
        levels[key] = {'enabled': enabled, 'volume': volume}
    return levels


def make_mix(job, source, duration, tracks, destination):
    if not duration:
        duration = json.loads(job.rea('probe', source, quiet=True))['duration']
    seconds = float(duration)
    if not math.isfinite(seconds) or seconds <= 0:
        raise ValueError('无法读取原片时长。')
    inputs, filters, labels = [], [], []
    for index, (path, volume) in enumerate(tracks):
        inputs.extend(('-i', path))
        label = f'[track{index}]'
        filters.append(f'[{index}:a:0]aresample=48000:async=1:first_pts=0,'
                       'aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,'
                       f'volume={volume / 100:.2f},apad{label}')
        labels.append(label)
    limit = 'alimiter=limit=0.98:level=0:latency=1[mix]'
    filters.append(''.join(labels) + (f'amix=inputs={len(labels)}:normalize=0,' if len(labels) > 1 else '') + limit)
    encoder = (('-c:a', 'pcm_s24le') if destination.suffix == '.wav' else
               ('-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'))
    job.ffmpeg(*inputs, '-filter_complex', ';'.join(filters), '-map', '[mix]', '-t', f'{seconds:.3f}',
               *encoder, destination)
    return destination
