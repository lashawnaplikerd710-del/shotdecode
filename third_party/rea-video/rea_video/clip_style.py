# ShotDecode extension for the vendored renderer.
"""Validate clip properties and build the corresponding video filters."""
from __future__ import annotations

import math

from . import clip_motion


CROP_EDGES = ('left', 'right', 'top', 'bottom')


def canvas_size(source):
    width, height = int(source['width']), int(source['height'])
    if source.get('rotation') in (90, 270):
        width, height = height, width
    return max(2, width - width % 2), max(2, height - height % 2)


def defaults(size):
    width, height = size
    return dict(x=0, y=0, width=width, height=height, rotation=0, fit='cover',
                crop=dict.fromkeys(CROP_EDGES, 0), fade_in=0, fade_out=0,
                opacity=100, brightness=100, contrast=100, saturation=100,
                hue=0, grayscale=0, soft_focus=0, flip_x=False, flip_y=False, animation={})


def bounds(size):
    width, height = size
    return dict(
        x=(-2 * width, 2 * width), y=(-2 * height, 2 * height),
        width=(2, max(width, min(7680, width * 4))),
        height=(2, max(height, min(7680, height * 4))),
        rotation=(-180, 180), opacity=(0, 100), brightness=(25, 175),
        contrast=(25, 175), saturation=(0, 200), hue=(-180,180),
        grayscale=(0,100), soft_focus=(0,100),
    )


def normalize(value, size, duration):
    result = defaults(size)
    if not isinstance(value, dict):
        return result

    def number(key, minimum, maximum, digits=0, *, source=value, fallback=0):
        item = source.get(key)
        if type(item) not in (int, float) or (isinstance(item, float) and not math.isfinite(item)):
            return fallback
        return round(min(maximum, max(minimum, item)), digits)

    for key, (lo, hi) in bounds(size).items():
        result[key] = number(key, lo, hi, 1 if key == 'rotation' else 0, fallback=result[key])
    if value.get('fit') == 'contain':
        result['fit'] = 'contain'
    crop = value.get('crop')
    if isinstance(crop, dict):
        for first, second in (('left', 'right'), ('top', 'bottom')):
            edge = number(first, 0, 95, 2, source=crop)
            result['crop'][first] = edge
            result['crop'][second] = number(second, 0, 95 - edge, 2, source=crop)
    limit = max(0, math.floor(duration * 1000) / 1000)
    result['fade_in'] = number('fade_in', 0, limit, 3)
    result['fade_out'] = number('fade_out', 0, limit - result['fade_in'], 3)
    result['flip_x'] = value.get('flip_x') is True
    result['flip_y'] = value.get('flip_y') is True
    result['animation'] = clip_motion.normalize(value.get('animation'),duration)
    return result


def color_matrix(matrix):
    channels = 'rgb'
    return 'colorchannelmixer=' + ':'.join(f'{out}{src}={gain:.8f}'
        for out, row in zip(channels,matrix) for src, gain in zip(channels,row))


def mix_saturation(amount, luma):
    return [[(1-amount)*weight + (amount if dest==source else 0)
             for source, weight in enumerate(luma)] for dest in range(3)]


def color_filters(style):
    brightness = style['brightness'] / 100
    contrast = style['contrast'] / 100
    saturation = style['saturation'] / 100
    opacity = style['opacity'] / 100
    filters = []
    if brightness != 1:
        filters.append(f'lutrgb=r=val*{brightness}:g=val*{brightness}:b=val*{brightness}')
    if contrast != 1:
        expression = f'(val-127.5)*{contrast}+127.5'
        filters.append(f'lutrgb=r={expression}:g={expression}:b={expression}')
    if saturation != 1:
        filters.append(color_matrix(mix_saturation(saturation,(.213,.715,.072))))
    if style['hue']:
        angle = math.radians(style['hue'])
        c, s = math.cos(angle), math.sin(angle)
        filters.append(color_matrix((
            (.213+.787*c-.213*s, .715-.715*c-.715*s, .072-.072*c+.928*s),
            (.213-.213*c+.143*s, .715+.285*c+.140*s, .072-.072*c-.283*s),
            (.213-.213*c-.787*s, .715-.715*c+.715*s, .072+.928*c+.072*s),
        )))
    if style['grayscale']:
        filters.append(color_matrix(mix_saturation(1-style['grayscale']/100,(.2126,.7152,.0722))))
    if opacity != 1:
        filters.append(f'lutrgb=r=val*{opacity}:g=val*{opacity}:b=val*{opacity}')
    return filters


def blur_filters(timeline, style, fps, reference_size, motion_file):
    sigma = reference_size * style['soft_focus'] * .00024
    ranges = [(start, start + length) for frames, start, length, _ in timeline if any(frame[6] for frame in frames)]
    filters = []
    if ranges:
        frames = {0}
        for start, end in ranges:
            frames.update(range(max(0, math.floor(start*fps)),math.ceil(end*fps)+1))
        commands = []
        last = None
        for frame in sorted(frames):
            amount = round(sigma + reference_size * clip_motion.sample(timeline,frame/fps)[5], 3)
            if amount != last:
                # FFmpeg rounds command timestamps to microseconds.
                timestamp = max(0, (frame-.3)/fps)
                commands.append(f'{timestamp:.6f} gblur@clipblur sigma {amount:.3f};')
                last = amount
        motion_file.write_text('\n'.join(commands),encoding='ascii')
        filters.append(f'sendcmd=f={motion_file.name}')
    if sigma or ranges:
        filters.append(f'gblur@clipblur=sigma={sigma:.3f}:steps=2')
    return filters


def filter_graph(style, size, duration, fps, speed=1, *, motion_file=None):
    canvas_w, canvas_h = size
    w, h = (int(style[key]) for key in ('width', 'height'))
    contain = style['fit'] == 'contain'
    filters = [f'setpts=(PTS-STARTPTS)/{speed:.4f}', f'fps={fps}',
               f'tpad=stop_mode=clone:stop_duration={duration:.6f}', f'trim=duration={duration:.6f}']
    if contain:
        # Even a very narrow fit needs one pixel on each axis.
        filters.append(f"scale=w='max(1,min({w},round({h}*dar)))':h='max(1,min({h},round({w}/dar)))'")
    else:
        # Crop the source before scaling to avoid an oversized intermediate frame.
        ratio = f'({w}/{h})'
        filters.extend((f"crop=w='max(1,min(iw,round(iw*{ratio}/dar)))':"
                        f"h='max(1,min(ih,round(ih*dar/{ratio})))':exact=1",
                        f'scale={w}:{h}'))
    filters.extend(('setsar=1', *color_filters(style), 'format=yuv444p'))
    if contain:
        filters.append(f'pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black')
    if style['flip_x']:
        filters.append('hflip')
    if style['flip_y']:
        filters.append('vflip')
    motion = clip_motion.tracks(style,duration) if style['animation'] else []
    filters.extend(blur_filters(motion,style,fps,min(w,h),motion_file))
    crop = style['crop']
    left = min(w - 1, round(w * crop['left'] / 100))
    top = min(h - 1, round(h * crop['top'] / 100))
    right = min(w - left - 1, round(w * crop['right'] / 100))
    bottom = min(h - top - 1, round(h * crop['bottom'] / 100))
    if left or top or right or bottom:
        filters.extend((f'crop={w - left - right}:{h - top - bottom}:{left}:{top}',
                        f'pad={w}:{h}:{left}:{top}:black'))
    rotation = clip_motion.expression(motion,3)
    if style['rotation'] or rotation:
        angle = f"(({style['rotation']})+({rotation or '0'}))*PI/180"
        out_w, out_h = clip_motion.rotation_bounds(w,h,style['rotation'],motion)
        filters.append(f"rotate='{angle}':ow={out_w}:oh={out_h}:c=black")
    zoom = clip_motion.expression(motion,0)
    if zoom:
        filters.extend((f"scale=w='max(1,round(iw*({zoom})))':h='max(1,round(ih*({zoom})))':eval=frame",
                        'setsar=1'))
    x, y = style['x'], style['y']
    shift_x = clip_motion.expression(motion,1) or '0'
    shift_y = clip_motion.expression(motion,2) or '0'
    frame = f'color=c=black:s={canvas_w}x{canvas_h}:r={fps},format=yuv444p[matte]'
    composite = [f"overlay=x='(main_w-overlay_w)/2+({x})+{canvas_w}*({shift_x})':"
                 f"y='(main_h-overlay_h)/2+({y})+{canvas_h}*({shift_y})':shortest=1:format=yuv444"]
    graph = '[0:v]' + ','.join(filters) + '[clip];' + frame + ';[matte][clip]'
    opacity = clip_motion.expression(motion,4,'T')
    if opacity:
        # Evaluate the animated opacity on a tiny mask before expanding it to the canvas.
        alpha = (f"color=c=black:s=2x2:r={fps},format=yuva444p,"
                 f"geq=lum=16:cb=128:cr=128:a='255*(1-({opacity}))',"
                 f"scale={canvas_w}:{canvas_h}:flags=neighbor[fade];"
                 "[framed][fade]overlay=shortest=1:format=yuv444,format=yuv420p[out]")
        return graph + ','.join(composite) + '[framed];' + alpha
    if not motion and style['fade_in']:
        composite.append(f"fade=t=in:st=0:d={style['fade_in']}")
    if not motion and style['fade_out']:
        composite.append(f"fade=t=out:st={duration - style['fade_out']:.6f}:d={style['fade_out']}")
    composite.append('format=yuv420p')
    return graph + ','.join(composite) + '[out]'
