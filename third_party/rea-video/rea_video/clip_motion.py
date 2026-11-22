# ShotDecode extension for the vendored renderer.
"""Motion presets shared by the desktop, subtitle exporter and video renderer."""
from __future__ import annotations

import math


# Values after progress are scale, horizontal/vertical displacement in canvas units,
# clockwise degrees, opacity and blur as a fraction of the shorter edge.
NEUTRAL = (1, 0, 0, 0, 1, 0)


def key(progress, *, scale=1, x=0, y=0, angle=0, alpha=1, blur=0):
    return (progress, scale, x, y, angle, alpha, blur)


def preset(identifier, name, seconds, *frames, once=False):
    return dict(id=identifier, name=name, seconds=seconds, frames=frames, once=once)


def slide(identifier, name, axis, distance, opening):
    position = {axis: distance}
    if opening:
        return preset(identifier, name, .48, key(0, **position),
                      key(.56, **{axis: distance * .20}), key(1))
    return preset(identifier, name, .45, key(0), key(.45, **{axis: distance * .19}),
                  key(1, **position))


PRESETS = {
    'entrance': (
        preset('fade', '渐显', .5, key(0, alpha=0), key(1)),
        preset('zoom', '放大', .55, key(0, scale=.52, alpha=.2), key(.6, scale=.94, alpha=.95), key(1)),
        preset('shrink', '缩小进入', .55, key(0, scale=1.46, alpha=.1), key(.55, scale=1.10, alpha=.95), key(1)),
        preset('pop', '弹入', .62, key(0, scale=.45, alpha=0), key(.44, scale=1.15), key(.69, scale=.94),
               key(.86, scale=1.04), key(1)),
        slide('left', '向左滑入', 'x', 1.03, True),
        slide('right', '向右滑入', 'x', -1.03, True),
        slide('up', '向上滑入', 'y', 1.03, True),
        slide('down', '向下滑入', 'y', -1.03, True),
        preset('rotate', '旋转进入', .62, key(0, scale=.62, angle=-56, alpha=0),
               key(.55, scale=.95, angle=-12, alpha=.97), key(1)),
        preset('blur', '模糊渐显', .6, key(0, alpha=0, blur=.037),
               key(.38, alpha=.68, blur=.018), key(.75, alpha=.96, blur=.004), key(1)),
        preset('whip', '甩入', .62, key(0, x=.92, y=.08, angle=-36, alpha=.1),
               key(.53, x=-.085, angle=12), key(.78, x=.032, angle=-4), key(1)),
        preset('swing', '摇摆进入', .72, key(0, scale=.88, angle=-22, alpha=0),
               key(.36, angle=15, alpha=.92), key(.61, angle=-7), key(.82, angle=4), key(1)),
    ),
    'exit': (
        preset('fade', '渐隐', .5, key(0), key(1, alpha=0)),
        preset('shrink', '缩小消失', .52, key(0), key(.48, scale=.91, alpha=.91), key(1, scale=.44, alpha=0)),
        preset('zoom', '放大消失', .52, key(0), key(.49, scale=1.09, alpha=.82), key(1, scale=1.52, alpha=0)),
        slide('left', '向左滑出', 'x', -1.03, False),
        slide('right', '向右滑出', 'x', 1.03, False),
        slide('down', '向下滑出', 'y', 1.03, False),
        preset('rotate', '旋转消失', .62, key(0), key(.48, angle=12, scale=.97, alpha=.84),
               key(1, angle=57, scale=.55, alpha=0)),
        preset('blur', '模糊消失', .6, key(0), key(.38, blur=.006, alpha=.90),
               key(.72, blur=.023, alpha=.52), key(1, blur=.037, alpha=0)),
    ),
    'loop': (
        preset('breathe', '呼吸', 1.75, key(0), key(.18, scale=1.028), key(.5, scale=1.085),
               key(.82, scale=1.028), key(1)),
        preset('float', '漂浮', 1.65, key(0), key(.25, y=-.035), key(.5), key(.75, y=.035), key(1)),
        preset('sway', '摇摆', 1.5, key(0), key(.25, angle=-5.5), key(.5), key(.75, angle=5.5), key(1)),
        preset('shake', '抖动', .42, key(0), key(.17, x=-.024, y=.011), key(.31, x=.023, y=-.01),
               key(.51, x=-.013, y=.007), key(.70, x=.012, y=-.004), key(.84), key(1)),
        preset('heartbeat', '心跳', 1.32, key(0), key(.12, scale=1.13), key(.24, scale=1.025),
               key(.34, scale=1.087), key(.50), key(1)),
        preset('blink', '闪烁', .94, key(0), key(.21), key(.28, alpha=.24), key(.40, alpha=.24),
               key(.48), key(.65), key(.73, alpha=.48), key(.82), key(1)),
        preset('push', '缓慢推进', 1.8, key(0), key(.35, scale=1.035), key(1, scale=1.15), once=True),
    ),
}
INDEX = {phase: {item['id']: item for item in options} for phase, options in PRESETS.items()}
TRANSITION_LIMIT = 12


def normalize(value, duration=None):
    if not isinstance(value, dict):
        return {}
    cap = TRANSITION_LIMIT if duration is None else max(.001, min(TRANSITION_LIMIT, duration))
    result = {}
    for phase, options in INDEX.items():
        current = value.get(phase)
        if not isinstance(current, dict):
            continue
        identifier = current.get('preset')
        chosen = options.get(identifier) if isinstance(identifier, str) else None
        if not chosen:
            continue
        if chosen['once']:
            result[phase] = dict(preset=identifier)
            continue
        seconds = current.get('seconds')
        if type(seconds) not in (int, float) or (isinstance(seconds, float) and not math.isfinite(seconds)):
            seconds = chosen['seconds']
        low, high = (.1, 10) if phase == 'loop' else (min(cap, .02), cap)
        result[phase] = dict(preset=identifier, seconds=round(max(low, min(high, seconds)), 3))
    return result


def tracks(style, duration):
    chosen = dict(style.get('animation') or {})
    for phase, legacy in (('entrance','fade_in'), ('exit','fade_out')):
        if phase not in chosen and style.get(legacy, 0) > 0:
            chosen[phase] = dict(preset='fade', seconds=style[legacy])
    entrance = chosen.get('entrance', {}).get('seconds', 0)
    exit_length = chosen.get('exit', {}).get('seconds', 0)
    fit = min(1, duration / (entrance + exit_length)) if entrance + exit_length else 1
    result = []
    for phase, item in chosen.items():
        detail = INDEX[phase][item['preset']]
        length = item.get('seconds', duration)
        if phase != 'loop':
            length *= fit
        if length > 0:
            start = duration - length if phase == 'exit' else 0
            result.append((detail['frames'], start, length, phase == 'loop' and not detail['once']))
    return result


def interpolate(frames, progress):
    for first, last in zip(frames, frames[1:]):
        if progress <= last[0]:
            amount = max(0, (progress - first[0]) / (last[0] - first[0]))
            return tuple(a + (b - a)*amount for a, b in zip(first[1:], last[1:]))
    return frames[-1][1:]


def sample(timeline, time):
    scale, x, y, angle, alpha, blur = NEUTRAL
    for frames, start, seconds, repeat in timeline:
        local = max(0, time - start)
        progress = local % seconds / seconds if repeat else min(1, local / seconds)
        ds, dx, dy, da, opacity, softness = interpolate(frames, progress)
        scale *= ds
        x += dx
        y += dy
        angle += da
        alpha *= opacity
        blur += softness
    return scale, x, y, angle, alpha, blur


def expression(timeline, channel, time='t'):
    index = channel + 1
    neutral = NEUTRAL[channel]
    all_curves = []
    for frames, start, seconds, repeat in timeline:
        if all(frame[index] == neutral for frame in frames):
            continue
        if repeat:
            progress = f'mod(max({time},0),{seconds:.8g})/{seconds:.8g}'
        else:
            progress = f'clip(({time}-({start:.8g}))/{seconds:.8g},0,1)'
        # Evaluate the phase once, even when the preset has several keyframes.
        curve = f'{frames[-1][index]:.8g}'
        for first, last in reversed(list(zip(frames,frames[1:]))):
            change = (last[index] - first[index]) / (last[0] - first[0])
            line = f'{first[index]:.8g}'
            if change:
                line += f'+({change:.8g})*(ld(0)-{first[0]:.8g})'
            curve = f'if(lte(ld(0),{last[0]:.8g}),{line},{curve})'
        all_curves.append(f'(st(0,{progress});{curve})')
    if not all_curves:
        return None
    join = '*' if channel in (0,4) else '+'
    return join.join(all_curves)


def rotation_bounds(width, height, base, timeline):
    ranges = [(min(frame[4] for frame in frames), max(frame[4] for frame in frames))
              for frames, _, _, _ in timeline]
    low = math.radians(base + sum(lo for lo, _ in ranges))
    high = math.radians(base + sum(hi for _, hi in ranges))
    angles = [low, high]
    for pivot in (math.atan2(height, width), math.atan2(width, height)):
        for turn in range(math.floor(low/math.pi)-1, math.ceil(high/math.pi)+1):
            angles.extend(a for a in (turn*math.pi+pivot, turn*math.pi-pivot) if low < a < high)
    def full(a,b):
        return math.ceil(max(a*abs(math.cos(theta))+b*abs(math.sin(theta)) for theta in angles)-1e-8)
    return full(width,height), full(height,width)
