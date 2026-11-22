"""Local desktop draft files for Jianying Pro and CapCut.

The JSON layout is adapted from OpenFilm's MIT-licensed draft writer.
Copyright (c) 2026 OpenFilm contributors. See THIRD_PARTY_NOTICES.txt.
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from manual_caption_style import clean_style


PLATFORMS = {
    'jianying': dict(app_id=3704, app_source='lv', app_version='5.9.0', os='windows'),
    'capcut': dict(app_id=359289, app_source='cc', app_version='5.9.0', os='windows'),
}
DRAFT_PATH = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
MATERIAL_TYPES = (
    'ai_translates', 'audio_balances', 'audio_effects', 'audio_fades', 'audio_track_indexes', 'audios',
    'beats', 'canvases', 'chromas', 'color_curves', 'common_mask', 'digital_humans', 'drafts',
    'effects', 'flowers', 'green_screens', 'handwrites', 'hsl', 'images', 'log_color_wheels',
    'loudnesses', 'manual_deformations', 'masks', 'material_animations', 'material_colors',
    'multi_language_refs', 'placeholders', 'plugin_effects', 'primary_color_wheels', 'realtime_denoises',
    'shapes', 'smart_crops', 'smart_relights', 'sound_channel_mappings', 'speeds', 'stickers',
    'tail_leaders', 'text_templates', 'texts', 'time_marks', 'transitions', 'video_effects',
    'video_trackings', 'videos', 'vocal_beautifys', 'vocal_separations',
)


def text_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def microseconds(seconds):
    return round(seconds * 1_000_000)


def time_range(start, end):
    return dict(start=microseconds(start), duration=microseconds(end) - microseconds(start))


def picture(*, scale=1, x=0, y=0):
    return dict(alpha=1, flip=dict(horizontal=False, vertical=False), rotation=0,
                scale=dict(x=scale, y=scale), transform=dict(x=x, y=y))


def opaque_color(color):
    return dict(alpha=1, color=[int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)])


@dataclass(frozen=True)
class Media:
    file: Path
    name: str
    duration: float
    size: tuple[int, int] | None = None


class DraftDocument:
    def __init__(self, target, folder, size, fps, duration):
        self.target, self.folder = target, folder
        self.width, self.height = size
        self.fps = fps
        self.duration = microseconds(duration)
        self.identifier = str(uuid4()).upper()
        self.now = time.time_ns() // 1000
        self.materials = {kind: [] for kind in MATERIAL_TYPES}
        self.library = []
        self.media_ids = {}
        self.tracks = []
        self.subtitle_tasks = []

    def media(self, file):
        if file.file in self.media_ids:
            return self.media_ids[file.file]
        relative = file.file.as_posix()
        if self.target == 'jianying':
            path, library_path = f'{DRAFT_PATH}/{relative}', f'./{relative}'
        else:
            path = library_path = (self.folder / file.file).as_posix()
        width, height = file.size or (0, 0)
        id_, local_id = uuid4().hex, str(uuid4()).upper()
        duration = microseconds(file.duration)
        self.library.append(dict(
            ai_group_type='', create_time=-1, duration=duration, enter_from=0, extra_info=file.name,
            file_Path=library_path, height=height, id=local_id, import_time=-1, import_time_ms=-1,
            item_source=1, material_color_tag='', md5='', metetype='video' if file.size else 'music',
            roughcut_time_range=dict(duration=-1, start=-1), sub_time_range=dict(duration=-1, start=-1),
            type=0, width=width))
        if file.size:
            self.materials['videos'].append(dict(
                audio_fade=None, category_id='', category_name='local', check_flag=63487,
                crop=dict(upper_left_x=0, upper_left_y=0, upper_right_x=1, upper_right_y=0,
                          lower_left_x=0, lower_left_y=1, lower_right_x=1, lower_right_y=1),
                crop_ratio='free', crop_scale=1, duration=duration, height=height, width=width,
                id=id_, local_material_id=local_id, material_id=id_, material_name=file.name,
                media_path='', path=path, type='video'))
        else:
            self.materials['audios'].append(dict(
                app_id=0, category_id='', category_name='local', check_flag=3, copyright_limit_type='none',
                duration=duration, effect_id='', formula_id='', id=id_, local_material_id=local_id,
                music_id=id_, name=file.name, path=path, source_platform=0, type='extract_music',
                wave_points=[]))
        self.media_ids[file.file] = id_
        return id_

    @staticmethod
    def track(kind, name, segments, *, muted=False, subtitles=False):
        return dict(attribute=int(muted), flag=int(subtitles), id=uuid4().hex, is_default_name=False,
                    name=name, type=kind, segments=segments)

    def segment(self, id_, start, end, *, source=None, clip=None, speed=1, volume=0):
        refs = []
        if source:
            reference = uuid4().hex
            self.materials['speeds'].append(dict(curve_speed=None, id=reference, mode=0, speed=speed, type='speed'))
            refs.append(reference)
        return dict(
            id=uuid4().hex, material_id=id_, target_timerange=time_range(start, end),
            source_timerange=time_range(*source) if source else None, clip=clip,
            uniform_scale=dict(on=True, value=1) if clip else None,
            hdr_settings=dict(intensity=1, mode=1, nits=1000) if clip and source else None,
            extra_material_refs=refs, render_index=len(self.tracks),
            enable_adjust=True, enable_color_correct_adjust=False, enable_color_curves=True,
            enable_color_match_adjust=False, enable_color_wheels=True, enable_lut=True,
            enable_smart_color_adjust=False, last_nonzero_volume=volume or 1,
            reverse=False, track_attribute=0, track_render_index=0, visible=True,
            common_keyframes=[], keyframe_refs=[], speed=speed, volume=volume, is_tone_modify=False)

    def video_track(self, name, cuts):
        segments = []
        for file, start, end, first, speed in cuts:
            width, height = file.size
            x, y = self.width / width, self.height / height
            # Both editors fit the material first. The relative scale fills the ShotDecode canvas.
            scale = round(max(x, y) / min(x, y), 6)
            segments.append(self.segment(self.media(file), start, end,
                                         source=(first, min(file.duration, first + (end-start)*speed)),
                                         clip=picture(scale=scale), speed=speed))
        if segments:
            self.tracks.append(self.track('video', name, segments))

    def audio_track(self, name, cuts, muted=False):
        segments = [self.segment(self.media(file), start, end, source=(first, first + end - start), volume=gain)
                    for file, start, end, first, gain in cuts]
        if segments:
            self.tracks.append(self.track('audio', name, segments, muted=muted))

    def caption_track(self, name, cues, fonts=None, language=None):
        if not cues:
            return
        recognized = language is not None
        task = uuid4().hex[:24] + '_0_0'
        if recognized:
            self.subtitle_tasks.append(dict(
                id=task, type=10, language=language, content='', remove_invalid_task_id='',
                ai_accurate_recognize_enable=False, supplies_commit_id='', is_local_asr=False))
        segments = []
        for cue in cues:
            style = clean_style(cue.get('style'))
            text = cue['text'].strip()
            id_ = uuid4().hex
            size = round(style['size'] * self.height / min(self.width, self.height) * 144, 4)
            strokes = ([dict(width=style['outline'], content=dict(render_type='solid', solid=opaque_color(style['stroke'])))]
                       if style['outline'] else [])
            glyph = dict(range=[0, len(text)], size=size, bold=style['bold'], italic=False, underline=False,
                         fill=dict(alpha=1, content=dict(render_type='solid', solid=opaque_color(style['fill']))),
                         strokes=strokes)
            entry = dict(id=id_, type='subtitle' if recognized else 'text', add_type=int(recognized),
                         alignment=1, check_flag=15 if strokes else 7, line_spacing=.02, line_feed=1,
                         line_max_width=.82, force_apply_line_max_width=False, global_alpha=1)
            if face := (fonts or {}).get((style['font'], style['bold'])):
                font_file, family = face
                font_path = ((f'{DRAFT_PATH}/{font_file.as_posix()}') if self.target == 'jianying'
                             else (self.folder / font_file).as_posix())
                glyph['font'] = dict(id='', path=font_path)
                entry.update(font_name=family, font_path=font_path)
            if recognized:
                entry.update(recognize_task_id=task, recognize_text=text, language=language,
                             group_id=f'{language}_{self.now // 1000}',
                             words=dict(start_time=[], end_time=[], text=[]),
                             current_words=dict(start_time=[], end_time=[], text=[]),
                             subtitle_keywords=dict(range=[]), typesetting=0)
            entry['content'] = text_json(dict(styles=[glyph], text=text))
            self.materials['texts'].append(entry)
            place = style['position'] or dict(x=.5, y=.90)
            segments.append(self.segment(id_, cue['start'], cue['end'],
                                         clip=picture(x=2*place['x']-1, y=1-2*place['y'])))
        self.tracks.append(self.track('text', name, segments, subtitles=recognized))

    def write(self, folder):
        platform = PLATFORMS[self.target]
        config = dict(
            adjust_max_index=1, attachment_info=[], combination_max_index=1, export_range=None,
            extract_audio_last_index=1, lyrics_recognition_id='', lyrics_sync=True, lyrics_taskinfo=[],
            maintrack_adsorb=False, material_save_mode=0, multi_language_current='none',
            multi_language_list=[], multi_language_main='none', multi_language_mode='none',
            original_sound_last_index=1, record_audio_last_index=1, sticker_max_index=1,
            subtitle_keywords_config=None, subtitle_recognition_id='', subtitle_sync=True,
            subtitle_taskinfo=self.subtitle_tasks, system_font_list=[], video_mute=False, zoom_info_params=None)
        body = dict(
            canvas_config=dict(width=self.width, height=self.height, ratio='original'),
            color_space=0, config=config, cover=None, create_time=0, duration=self.duration,
            extra_info=None, fps=self.fps, free_render_index_mode_on=False, group_container=None,
            id=self.identifier, keyframe_graph_list=[],
            keyframes={key: [] for key in ('adjusts', 'audios', 'effects', 'filters', 'handwrites',
                                           'stickers', 'texts', 'videos')},
            last_modified_platform=platform, platform=platform, materials=self.materials,
            mutable_config=None, name=self.folder.name, new_version='110.0.0', relationships=[],
            render_index_track_mode_on=False, retouch_cover=None, source='default',
            static_cover_image_path='', time_marks=None, tracks=self.tracks, update_time=0, version=360000)
        meta = dict(
            cloud_package_completed_time='', draft_cloud_capcut_purchase_info='',
            draft_cloud_last_action_download=False, draft_cloud_materials=[], draft_cloud_purchase_info='',
            draft_cloud_template_id='', draft_cloud_tutorial_info='', draft_cloud_videocut_purchase_info='',
            draft_cover='draft_cover.jpg' if (folder/'draft_cover.jpg').is_file() else '', draft_deeplink_url='',
            draft_enterprise_info=dict(draft_enterprise_extra='', draft_enterprise_id='',
                                       draft_enterprise_name='', enterprise_material=[]),
            draft_fold_path=self.folder.as_posix(), draft_id=self.identifier, draft_is_ai_packaging_used=False,
            draft_is_ai_shorts=False, draft_is_ai_translate=False, draft_is_article_video_draft=False,
            draft_is_from_deeplink='false', draft_is_invisible=False,
            draft_materials=[dict(type=key, value=self.library if key == 0 else []) for key in (0, 1, 2, 3, 6, 7, 8)],
            draft_materials_copied_info=[], draft_name=self.folder.name, draft_new_version='',
            draft_removable_storage_device='', draft_root_path=self.folder.parent.as_posix(),
            draft_segment_extra_info=[], draft_type='', tm_draft_cloud_completed='', tm_draft_cloud_modified=0,
            tm_draft_create=self.now, tm_draft_modified=self.now, tm_draft_removed=0, tm_duration=self.duration)
        content = text_json(body)
        for name in ('draft_content.json', 'draft_info.json'):
            (folder / name).write_text(content, encoding='utf-8')
        (folder / 'draft_meta_info.json').write_text(text_json(meta), encoding='utf-8')
