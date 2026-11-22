"""Shared preview and export settings for hand-entered subtitles."""
from __future__ import annotations

import ctypes
from ctypes import wintypes
from functools import cache
import gzip
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess

from rea_video import clip_motion


SIZE_RANGE = (.01, .40)
DEFAULT_STYLE = {
    'font': 'Microsoft YaHei', 'size': .053, 'bold': False,
    'fill': '#ffffff', 'stroke': '#111116', 'outline': .065, 'box': None, 'position': None,
}
PREFERRED_FONTS = ('Microsoft YaHei', 'SimHei', 'SimSun', 'DengXian', 'KaiTi', 'Microsoft JhengHei',
                   'Meiryo', 'Yu Gothic', 'Arial', 'Segoe UI', 'Times New Roman')
FONT_ALIASES = {
    '微软雅黑': 'Microsoft YaHei', '黑体': 'SimHei', '宋体': 'SimSun', '等线': 'DengXian',
    '楷体': 'KaiTi', '仿宋': 'FangSong', '微軟正黑體': 'Microsoft JhengHei',
    'メイリオ': 'Meiryo', '游ゴシック': 'Yu Gothic',
}
FONT_NAME = re.compile(r'[^,\x00-\x1f{}\\]{1,100}\Z')
COLOR = re.compile(r'#[0-9a-fA-F]{6}\Z')
BUNDLED_FONT_ROOT = Path(__file__).resolve().parent / 'studio_web/assets/caption-fonts'


def font_family(name):
    if not isinstance(name, str) or not FONT_NAME.fullmatch(name.strip()):
        return None
    return FONT_ALIASES.get(name.strip(), name.strip())


@cache
def bundled_fonts():
    try:
        catalog = json.loads((BUNDLED_FONT_ROOT / 'catalog.json').read_text(encoding='utf-8'))
    except FileNotFoundError:
        return {}
    return {entry['name'].casefold(): entry for entry in catalog['families']}


def bundled_face(font, bold):
    entry = bundled_fonts().get(font.casefold())
    if not entry:
        return None
    weight = 700 if bold else 400
    face = min(entry['faces'], key=lambda item: abs(item['weight'] - weight))
    return BUNDLED_FONT_ROOT / entry['folder'] / face['file'], face['ass_name']


def stage_caption_fonts(cues, folder):
    """Give libass just the bundled faces referenced by these captions."""
    styles = (clean_style(cue.get('style')) for cue in cues)
    files = sorted({face[0] for style in styles if (face := bundled_face(style['font'], style['bold']))})
    if not files:
        return False
    folder.mkdir()
    for face in files:
        if not face.is_file():
            raise ValueError(f'字幕字体文件缺失：{face.name}。')
        with gzip.open(face, 'rb') as source, (folder / f'{face.parent.name}-{face.stem}').open('wb') as output:
            shutil.copyfileobj(source, output)
    return True


@cache
def installed_fonts():
    if os.name != 'nt':
        return PREFERRED_FONTS

    class LogFont(ctypes.Structure):
        _fields_ = [(name, wintypes.LONG) for name in ('height', 'width', 'escapement', 'orientation', 'weight')] + [
            (name, wintypes.BYTE) for name in ('italic', 'underline', 'strikeout', 'charset', 'out_precision',
                                               'clip_precision', 'quality', 'pitch_family')] + [
            ('face', wintypes.WCHAR * 32)]

    callback_type = ctypes.WINFUNCTYPE(ctypes.c_int, ctypes.POINTER(LogFont), ctypes.c_void_p,
                                        wintypes.DWORD, wintypes.LPARAM)
    families = {}

    @callback_type
    def collect(info, metrics, font_type, parameter):
        name = font_family(info.contents.face)
        if name and not name.startswith('@') and not font_type & 1:  # raster fonts cannot be used in export
            families.setdefault(name.casefold(), name)
        return 1

    get_dc = ctypes.windll.user32.GetDC
    get_dc.argtypes, get_dc.restype = [wintypes.HWND], wintypes.HDC
    release_dc = ctypes.windll.user32.ReleaseDC
    release_dc.argtypes = [wintypes.HWND, wintypes.HDC]
    enumerate_fonts = ctypes.windll.gdi32.EnumFontFamiliesExW
    enumerate_fonts.argtypes = [wintypes.HDC, ctypes.POINTER(LogFont), callback_type, wintypes.LPARAM, wintypes.DWORD]
    dc = get_dc(None)
    if not dc:
        return PREFERRED_FONTS
    try:
        spec = LogFont()
        spec.charset = 1  # DEFAULT_CHARSET
        enumerate_fonts(dc, ctypes.byref(spec), collect, 0, 0)
    finally:
        release_dc(None, dc)
    common = [families.pop(name.casefold()) for name in PREFERRED_FONTS if name.casefold() in families]
    return tuple(common + sorted(families.values(), key=str.casefold)) or PREFERRED_FONTS


def bounded(value, low, high, default):
    if not isinstance(value, (int, float)) or not math.isfinite(value):
        return default
    return round(min(high, max(low, value)), 4)


def color(value, default=None):
    return value.lower() if isinstance(value, str) and COLOR.fullmatch(value) else default


def clean_style(value):
    style = value if isinstance(value, dict) else {}
    position = style.get('position')
    if isinstance(position, dict):
        position = dict(x=bounded(position.get('x'), 0, 1, .5), y=bounded(position.get('y'), 0, 1, .9))
    else:
        position = None
    result = dict(font=font_family(style.get('font')) or DEFAULT_STYLE['font'],
                size=bounded(style.get('size'), *SIZE_RANGE, DEFAULT_STYLE['size']),
                bold=style.get('bold') is True,
                fill=color(style.get('fill'), DEFAULT_STYLE['fill']),
                stroke=color(style.get('stroke'), DEFAULT_STYLE['stroke']),
                outline=bounded(style.get('outline'), 0, .25, DEFAULT_STYLE['outline']),
                box=color(style.get('box')), position=position)
    animation = clip_motion.normalize(style.get('animation'))
    if animation:
        result['animation'] = animation
    return result


def ass_track_header(ffprobe, source):
    """Read native ASS/SSA styles from container metadata without decoding any video frames."""
    if source is None or not source.is_file():
        return ''
    try:
        result = subprocess.check_output([ffprobe, '-v', 'error', '-select_streams', 's', '-show_data',
                                          '-show_entries', 'stream=codec_name,extradata', '-of', 'json', source],
                                         stdin=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                         creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0), timeout=6)
        for stream in json.loads(result).get('streams', []):
            if stream['codec_name'] not in ('ass', 'ssa') or not stream.get('extradata'):
                continue
            dump = stream['extradata'].splitlines()
            payload = ''.join(line.partition(': ')[2].partition('  ')[0] for line in dump)
            return bytes.fromhex(payload).decode('utf-8-sig', errors='replace')
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        return ''
    return ''


def embedded_font(header):
    columns = []
    fonts = []
    for line in header.splitlines():
        key, _, value = line.partition(':')
        if key.lower().strip() == 'format':
            columns = [name.strip().lower() for name in value.split(',')]
        if key.lower().strip() == 'style' and 'fontname' in columns:
            entry = dict(zip(columns, (item.strip() for item in value.split(','))))
            name = font_family(entry.get('fontname'))
            if name:
                fonts.append((entry.get('name', '').casefold() != 'default', name, entry.get('bold') in ('1', '-1')))
    return min(fonts, key=lambda font: font[0])[1:] if fonts else (None, False)


def picture_style(packaging, seconds, fonts):
    cues = [cue for cue in (packaging or {}).get('text_cues', [])
            if cue.get('kind') in ('subtitle', 'huazi', 'title') and cue.get('style')]
    if not cues:
        return None
    def distance(cue):
        return max(cue['t0'] - seconds, seconds - cue['t1'], 0)
    cue = min(cues, key=lambda item: (distance(item) > .15, item['kind'] != 'subtitle', distance(item)))
    measured = cue['style']
    text = cue.get('text', '')
    if re.search(r'[\u3040-\u30ff]', text):
        choices = ('Meiryo', 'Yu Gothic', 'Microsoft YaHei')
    elif re.search(r'[\u3400-\u9fff]', text):
        choices = ('Microsoft YaHei', 'SimHei')
    else:
        choices = ('Arial', 'Segoe UI', 'Microsoft YaHei')
    family = next((name for name in choices if name in fonts), DEFAULT_STYLE['font'])
    return clean_style(dict(font=family, size=bounded(cue.get('line_h'), .012, .148, .04) * 1.35,
                            bold=bounded(measured.get('weight'), 0, 1, 0) > .20,
                            fill=measured.get('fill'), stroke=measured.get('stroke'),
                            outline=measured.get('stroke_ratio', 0),
                            box=measured.get('box_color') if measured.get('box') else None))


def reference_style(ffprobe, source, packaging, time):
    fonts = installed_fonts() + tuple(entry['name'] for entry in bundled_fonts().values())
    exact, bold = embedded_font(ass_track_header(ffprobe, source))
    style = picture_style(packaging, bounded(time, 0, 1e9, 0), fonts)
    if exact:
        available = next((name for name in fonts if name.casefold() == exact.casefold()), None)
        if available:
            return dict(style={**(style or DEFAULT_STYLE), 'font': available, 'bold': bold},
                        note=f'已沿用内嵌字幕字体「{available}」。')
        alternative = style or DEFAULT_STYLE
        return dict(style=alternative, note=f'内嵌字幕字体为「{exact}」，本机已选用「{alternative["font"]}」。')
    if style:
        return dict(style=style, note=f'已参考原片的字高、颜色和描边，当前近似字体为「{style["font"]}」。')
    return dict(style=None, note='可先开启画面文字识别进行拆解，再参考原片字幕样式。')


def ass_color(rgb):
    return f'&H00{rgb[5:7]}{rgb[3:5]}{rgb[1:3]}'


def ass_time(centiseconds):
    seconds, fraction = divmod(centiseconds, 100)
    minutes, seconds = divmod(seconds, 60)
    hour, minute = divmod(minutes, 60)
    return f'{hour}:{minute:02d}:{seconds:02d}.{fraction:02d}'


def animated_caption(cue, style, width, height, bottom, fps):
    start, end = round(cue['start']*100), round(cue['end']*100)
    end = max(start+1,end)
    position = style['position']
    track = clip_motion.tracks(style,cue['end']-cue['start'])
    if not track:
        tag = r'{\an5\pos(%d,%d)}' % (round(position['x']*width),round(position['y']*height)) if position else ''
        yield start,end,tag
        return

    # ASS uses centiseconds; put each change just before its output frame.
    first = max(0, math.ceil(start*fps/100))
    last = max(first+1,math.ceil(end*fps/100))
    pending = None
    for frame in range(first,last):
        time = frame/fps
        lo = start if frame == first else math.floor(time*100 + 1e-7)
        hi = end if frame+1 == last else math.floor((frame+1)/fps*100 + 1e-7)
        scale, dx, dy, angle, alpha, blur = clip_motion.sample(track,time-cue['start'])
        values = []
        if position or abs(dx) > .0001 or abs(dy) > .0001:
            x = (position['x'] if position else .5)*width + dx*width
            y = (position['y']*height if position else height-bottom) + dy*height
            values.append(r'\an%d\pos(%.2f,%.2f)' % (5 if position else 2,x,y))
        if abs(scale-1) > .0001:
            values.append(r'\fscx%.2f\fscy%.2f' % (scale*100,scale*100))
        if abs(angle) > .0001:
            values.append(r'\frz%.2f' % -angle)
        if alpha < 1:
            values.append(r'\alpha&H%02X&' % round(255*(1-alpha)))
        if blur:
            values.append(r'\blur%.2f' % (blur*min(width,height)))
        tag = '{' + ''.join(values) + '}' if values else ''
        if pending and pending[2] == tag:
            pending = (pending[0],hi,tag)
        else:
            if pending:
                yield pending
            pending = (lo,hi,tag)
    if pending:
        yield pending


def write_ass(path: Path, cues, frame):
    width, height = int(frame['width']), int(frame['height'])
    if frame.get('rotation') in (90, 270):
        width, height = height, width
    width, height = width - width % 2, height - height % 2
    styles = {}
    events = []
    margin, bottom = round(width * .045), round(height * .06)
    source_fps = frame.get('fps')
    fps = float(source_fps) if isinstance(source_fps,(int,float)) and 0 < source_fps <= 60 else 30
    for cue in cues:
        style = clean_style(cue.get('style'))
        spec = tuple(style[key] for key in ('font', 'size', 'bold', 'fill', 'stroke', 'outline', 'box'))
        name = styles.get(spec)
        if name is None:
            name = f'Manual{len(styles) + 1}'
            styles[spec] = name
        # Use the same literal-text escapes as FFmpeg's WebVTT decoder.
        text = cue['text'].replace('\\', '\\\u2060').replace('{', r'\{{}').replace('\n', r'\N')
        for start, end, tag in animated_caption(cue,style,width,height,bottom,fps):
            events.append(f'Dialogue: 0,{ass_time(start)},{ass_time(end)},{name},,0,0,0,,{tag}{text}')
    definitions = []
    for (font, size, bold, fill, stroke, outline, box), name in styles.items():
        face = bundled_face(font, bold)
        if face:
            font = face[1]
        pixels = size * height
        border = 3 if box else 1
        padding = pixels * (.12 if box else outline)
        definitions.append(f'Style: {name},{font},{pixels:.2f},{ass_color(fill)},&H00FFFFFF,'
                           f'{ass_color(box or stroke)},&H00000000,{-1 if bold else 0},0,0,0,'
                           f'100,100,0,0,{border},{padding:.2f},0,2,{margin},{margin},{bottom},1')
    header = ('[Script Info]\nScriptType: v4.00+\nWrapStyle: 0\nScaledBorderAndShadow: yes\n'
              f'PlayResX: {width}\nPlayResY: {height}\n\n[V4+ Styles]\n'
              'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
              'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, '
              'Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n')
    path.write_text(header + '\n'.join(definitions) + '\n\n[Events]\n'
                    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
                    + '\n'.join(events) + '\n', encoding='utf-8')
