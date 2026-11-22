"""Settings shared by the delivery dialog and the local renderer."""

from dataclasses import dataclass
from math import floor
from pathlib import Path
import re

from rea_video.clip_style import canvas_size


EXTENSIONS = {
    'h264': '.mp4', 'hevc': '.mp4', 'prores': '.mov', 'vp9': '.webm',
    'wav': '.wav', 'mp3': '.mp3', 'm4a': '.m4a', 'srt': '.srt', 'vtt': '.vtt',
}
ASPECT_RATIOS = ('source', '16:9', '9:16', '1:1', '4:5', '4:3')
RESOLUTIONS = (480, 720, 1080, 1440, 2160)
FRAME_RATES = (24, 25, 30, 50, 60)
LOUDNESS_LEVELS = (-14, -16, -23)
QUALITY_LEVELS = ('standard', 'high', 'highest')
AUDIO_ENCODERS = {
    'wav': ('-c:a', 'pcm_s24le'),
    'mp3': ('-c:a', 'libmp3lame', '-q:a', '2'),
    'm4a': ('-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'),
}
VIDEO_AUDIO_ENCODERS = {
    'h264': ('-c:a', 'aac', '-b:a', '192k'),
    'hevc': ('-c:a', 'aac', '-b:a', '192k'),
    'prores': ('-c:a', 'pcm_s24le'),
    'vp9': ('-c:a', 'libopus', '-b:a', '160k'),
}
INTERFACE_OPTIONS = dict(extensions=EXTENSIONS, ratios=ASPECT_RATIOS, resolutions=RESOLUTIONS,
                         rates=FRAME_RATES, loudness=LOUDNESS_LEVELS)


def validate_name(value, extension=''):
    if not isinstance(value, str):
        raise ValueError('请输入有效的文件名。')
    stem = value.strip()
    if extension and stem.casefold().endswith(extension):
        stem = stem[:-len(extension)].rstrip()
    invalid = re.search(r'[<>:"/\\|?*\x00-\x1f]', stem)
    reserved = re.fullmatch(r'CON|PRN|AUX|NUL|(?:COM|LPT)[1-9¹²³]', stem.split('.')[0].rstrip(), re.I)
    if not stem or len(stem) > 80 or stem.endswith('.') or invalid or reserved:
        raise ValueError('请输入有效的文件名。')
    return stem


def project_rate(source):
    rate = source.get('fps')
    return rate if isinstance(rate, (float, int)) and 0 < rate <= 60 else 30


def output_canvas(native, aspect, resolution):
    w, h = native
    if aspect == 'source' and resolution == 'source':
        return native
    a, b = (w, h) if aspect == 'source' else map(int, aspect.split(':'))
    short_edge = min(w, h) if resolution == 'source' else resolution
    factor = short_edge / min(a, b)
    return max(2, floor(a * factor / 2 + .5) * 2), max(2, floor(b * factor / 2 + .5) * 2)


@dataclass(frozen=True)
class ExportProfile:
    format: str = 'h264'
    name: str | None = None
    size: tuple[int, int] | None = None
    fit: str = 'contain'
    fps: int | None = None
    quality: str = 'high'
    loudness: int | None = None

    @property
    def extension(self):
        return EXTENSIONS[self.format]

    @classmethod
    def read(cls, data, source):
        fmt = data.get('format', 'h264')
        if not isinstance(fmt, str) or fmt not in EXTENSIONS:
            raise ValueError('请选择支持的导出格式。')
        name = validate_name(data['name'], EXTENSIONS[fmt]) if 'name' in data else None
        loudness = data.get('loudness')
        if loudness is not None and (type(loudness) is not int or loudness not in LOUDNESS_LEVELS):
            raise ValueError('请选择有效的响度。')
        if fmt not in VIDEO_AUDIO_ENCODERS:
            return cls(format=fmt, name=name, loudness=loudness)
        aspect = data.get('aspect', 'source')
        resolution = data.get('resolution', 'source')
        fps = data.get('fps')
        quality = data.get('quality', 'high')
        fit = data.get('fit', 'contain')
        if (aspect not in ASPECT_RATIOS or resolution != 'source' and
                (type(resolution) is not int or resolution not in RESOLUTIONS) or
                fps is not None and (type(fps) is not int or fps not in FRAME_RATES) or
                quality not in QUALITY_LEVELS or fit not in ('contain', 'cover')):
            raise ValueError('请选择有效的视频输出设置。')
        native = canvas_size(source)
        size = output_canvas(native, aspect, resolution)
        return cls(fmt, name, size if size != native else None, fit,
                   fps if fps != project_rate(source) else None, quality, loudness)

    def video_args(self):
        filters = []
        if self.size:
            w, h = self.size
            scale = 'increase' if self.fit == 'cover' else 'decrease'
            filters.append(f'scale={w}:{h}:force_original_aspect_ratio={scale}:force_divisible_by=2')
            filters.append(f'crop={w}:{h}' if self.fit == 'cover' else f'pad={w}:{h}:(ow-iw)/2:(oh-ih)/2')
            filters.append('setsar=1')
        if self.fps:
            filters.append(f'fps={self.fps}')
        if self.format == 'h264' and not filters and self.quality == 'high':
            return ['-c:v', 'copy']
        quality = QUALITY_LEVELS.index(self.quality)
        if self.format == 'hevc':
            encoder = ['-c:v', 'libx265', '-preset', 'fast', '-crf', (27, 22, 17)[quality],
                       '-pix_fmt', 'yuv420p', '-tag:v', 'hvc1']
        elif self.format == 'prores':
            encoder = ['-c:v', 'prores_ks', '-profile:v', '3', '-pix_fmt', 'yuv422p10le']
        elif self.format == 'vp9':
            encoder = ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', (35, 28, 20)[quality],
                       '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-pix_fmt', 'yuv420p']
        else:
            encoder = ['-c:v', 'libx264', '-preset', 'fast', '-crf', (23, 18, 14)[quality], '-pix_fmt', 'yuv420p']
        return (['-vf', ','.join(filters)] if filters else []) + encoder

    def audio_filters(self, *, pad=False):
        filters = []
        if self.loudness is not None:
            filters.extend((f'loudnorm=I={self.loudness}:TP=-1.5:LRA=11', 'aresample=48000'))
        if pad:
            filters.append('apad')
        return ['-af', ','.join(filters)] if filters else []

    def output_file(self, folder: Path):
        return folder / ('delivery' + self.extension)
