"""Build an editable draft and package the media it uses before publishing."""
from __future__ import annotations

import os
from pathlib import Path
import re
import shutil

import manual_caption_style as captions
from draft_schema import DraftDocument, Media
from export_profiles import project_rate
from rea_video import clip_style
import studio_timeline as timeline
from studio_workspace import probe


EDITOR_FOLDERS = {'jianying': 'JianyingPro', 'capcut': 'CapCut'}


def editor_root(target):
    local = Path(os.environ.get('LOCALAPPDATA') or Path.home() / 'AppData/Local')
    data = local / EDITOR_FOLDERS[target] / 'User Data'
    try:
        settings = (data / 'Config/globalSetting').read_text(encoding='utf-8-sig')
        custom = re.search(r'^currentCustomDraftPath\s*=\s*(.+)$', settings, re.M)
        if custom:
            value = custom[1].strip().strip('"')
            value = re.sub(r'\\(x([0-9a-fA-F]{1,4})|\\|")',
                           lambda match: chr(int(match[2], 16)) if match[2] else match[1], value)
            path = Path(value)
            if path.is_absolute() and path.is_dir():
                return path
    except (OSError, ValueError):
        pass
    default = data / 'Projects/com.lveditor.draft'
    return default if default.is_dir() else None


def trim_cues(cues, duration):
    return [dict(row, end=min(row['end'], duration)) for row in cues
            if row['start'] < min(row['end'], duration) and row['text'].strip()]


def track_names(project, kind, label):
    tracks = (row for row in timeline.user_tracks(project) if row['kind'] == kind)
    return {row['id']: f'{label} {number}' for number, row in enumerate(tracks, 1)}


class DraftMedia:
    def __init__(self, job, folder, size, fps):
        self.job, self.folder = job, folder
        self.size, self.fps = size, fps
        self.files = {}
        self.rendered = []
        (folder / 'media').mkdir(parents=True)

    def copy(self, source, kind):
        path = Path(source).resolve()
        key = (path, kind)
        if key not in self.files:
            self.job.check()
            if not path.is_file():
                raise ValueError(f'工程素材已移动：{path.name}。')
            info = probe(path, kind)
            suffix = path.suffix.lower()
            rel = Path('media') / f'{len(self.files) + 1:03d}{suffix}'
            with path.open('rb') as stream, (self.folder / rel).open('xb') as dest:
                while chunk := stream.read(1024 * 1024):
                    self.job.check()
                    dest.write(chunk)
            size = (info['width'], info['height']) if kind == 'v' else None
            self.files[key] = Media(rel, path.name, info['duration'], size)
        return self.files[key]

    def original_sound(self, source):
        self.job.check()
        rel = Path('media/original-audio.wav')
        self.job.ffmpeg('-i', source, '-map', '0:a:0', '-vn', '-c:a', 'pcm_s16le', self.folder / rel)
        return Media(rel, '原声.wav', probe(self.folder / rel, 'a')['duration'])

    def render_clip(self, media, first, duration, speed, style, name):
        rel = Path('media') / f'clip-{len(self.rendered) + 1:03d}.mp4'
        output = self.folder / rel
        # If a lengthened replacement has run out of frames, hold the last frame.
        first = min(first, max(0, media.duration - 1 / self.fps))
        graph = clip_style.filter_graph(style, self.size, duration, self.fps, speed,
                                        motion_file=self.folder.parent / (rel.stem + '.motion'))
        self.job.ffmpeg('-ss', f'{first:.6f}', '-i', self.folder / media.file, '-filter_complex_threads', '2',
                        '-filter_complex', graph, '-map', '[out]', '-an',
                        '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
                        '-movflags', '+faststart', output, cwd=self.folder.parent)
        file = Media(rel, name, probe(output, 'v')['duration'], self.size)
        self.rendered.append(file)
        return file


def video_cut(project, item, media, end):
    from rea_video.remake import fit_speed

    path, first, fit = timeline.video_input(project, item)
    duration = round(end-item['start'], 3)
    style = clip_style.normalize(timeline.clip_properties(project, item), media.size, duration)
    file = media.copy(path, 'v')
    speed = fit_speed(file.duration, fit) if fit is not None else 1
    first *= speed
    if style != clip_style.defaults(media.size) or first + duration*speed > file.duration + .004:
        file = media.render_clip(file, first, duration, speed, style, '已应用效果.mp4')
        first, speed = 0, 1
    return file, item['start'], end, first, speed


def overlay_video(project, limit, media):
    layers = {}
    for item in timeline.video_items(project):
        start = item['start']
        end = min(limit, start + item['last'] - item['first'])
        if end > start:
            layers.setdefault(item['lane'], []).append(video_cut(project, item, media, end))
    names = track_names(project, 'video', '视频轨')
    return [(names[lane], track) for lane, clips in layers.items()
            for track in timeline.separate_overlaps(clips, lambda cut: cut[1:3])]


def audio_tracks(project, sequence, sources, levels, media):
    tracks = []
    original = None

    def sound(path):
        nonlocal original
        if Path(path).resolve() == project.source.resolve():
            if original is None:
                original = media.original_sound(project.source)
            return original
        return media.copy(path, 'a')

    for key, label, path in sources:
        level = levels[key]
        for number, rows in enumerate(timeline.source_audio_lanes(project, key, path, sequence), 1):
            cuts = []
            for row in rows:
                file = sound(row.get('path') or path)
                first, start = row['first'], row['start']
                end = start + min(row['last'], file.duration) - first
                if start < end:
                    cuts.append((file, start, end, first, level['volume'] * row['volume'] / 10000))
            if cuts:
                tracks.append((label if number == 1 else f'{label} {number}', cuts, not level['enabled']))
    extra = {}
    limit = timeline.duration(project, sequence)
    for item in timeline.audio_items(project):
        file = sound(item['path'])
        first, start = item['first'], item['start']
        end = min(limit, start + min(item['last'], file.duration) - first)
        if end > start:
            extra.setdefault(item['lane'], []).append((file, start, end, first, item['volume']/100))
    names = {'music':'配乐', 'voice':'配音', **track_names(project, 'audio', '音频轨')}
    return [*tracks, *((names[lane], track, False) for lane, clips in extra.items()
                       for track in timeline.separate_overlaps(clips, lambda cut: cut[1:3]))]


def font_paths(cues, folder):
    fonts = {}
    if captions.stage_caption_fonts(cues, folder / 'fonts'):
        for cue in cues:
            style = captions.clean_style(cue.get('style'))
            key = (style['font'], style['bold'])
            if face := captions.bundled_face(*key):
                path, family = face
                fonts[key] = (Path('fonts') / f'{path.parent.name}-{path.stem}', family)
    return fonts


def export_draft(job, project, target, root, name, sources, levels, manual, recognized):
    sequence = timeline.layout(project)
    duration = timeline.duration(project, sequence)
    size = clip_style.canvas_size(project.data['source'])
    fps = project_rate(project.data['source'])
    with job.delivery_folder(root) as workspace:
        staging = workspace / 'draft'
        media = DraftMedia(job, staging, size, fps)
        job.set_stage('正在准备工程素材')
        main = [video_cut(project, item, media, item['end']) for item in sequence]
        overlays = overlay_video(project, duration, media)
        sounds = audio_tracks(project, sequence, sources, levels, media)
        manual = trim_cues(manual, duration)
        recognized_name, language, cues = recognized
        cues = trim_cues(cues, duration)
        fonts = font_paths(manual, staging)
        first = main[0] if main else overlays[0][1][0]
        job.ffmpeg('-ss', f'{first[3]:.6f}', '-i', staging / first[0].file, '-frames:v', '1',
                   '-vf', 'scale=-2:320', '-update', '1', staging / 'draft_cover.jpg')

        job.set_stage('正在写入剪辑工程')
        serial = 1
        while True:
            folder = root / (name if serial == 1 else f'{name} ({serial})')
            serial += 1
            if folder.exists():
                continue
            draft = DraftDocument(target, folder, size, fps, duration)
            draft.video_track('分镜', main)
            for label, track in overlays:
                draft.video_track(label, track)
            for label, track, muted in sounds:
                draft.audio_track(label, track, muted)
            for number, track in enumerate(timeline.numbered_lanes(manual), 1):
                if track:
                    draft.caption_track('手动字幕' if number == 1 else f'手动字幕 {number}', track, fonts)
            for track in timeline.separate_overlaps(cues, timeline.interval):
                draft.caption_track(recognized_name, track, language=language)
            for file in media.files.values():
                draft.media(file)
            draft.write(staging)
            job.check()
            try:
                staging.rename(folder)
            except FileExistsError:
                continue
            job.emit(f'剪辑工程已保存到 {folder}')
            return (folder,)
