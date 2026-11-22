"""Editable clip order, source ranges and additional audio lanes."""
from __future__ import annotations

import hashlib
import json
import secrets
from pathlib import Path


AUDIO_LANES = ('music', 'voice')
CLIP_OVERRIDE_FIELDS = ('timeline_replacements', 'timeline_clip_properties')
MAX_TIME = 100000
MAX_CLIPS = 240


def seconds(value):
    if type(value) not in (int, float) or not 0 <= value <= MAX_TIME:
        raise ValueError('请输入有效的时间。')
    return round(value, 3)


def explicit(project):
    return isinstance(project.state.get('timeline'), list)


def layout(project, sequence=None):
    if sequence is None:
        sequence = project.state.get('timeline')
    if not isinstance(sequence, list):
        return [dict(id=key, shot=key, first=0.0, last=shot['duration'],
                     start=shot['start'], end=shot['end'], duration=shot['duration'])
                for key, shot in project.shots.items()]
    clips = []
    start = 0.0
    for item in sequence:
        start = round(start + item.get('gap', 0), 3)
        duration = round(item['last'] - item['first'], 3)
        end = round(start + duration, 3)
        clips.append(dict(**item, start=start, end=end, duration=duration))
        start = end
    return clips


def independent_clip(project, shot, clip_id):
    """Resolve an edit on a split clip while keeping one-to-one shots editable as before."""
    if clip_id is None:
        return None
    layers = [dict(item, duration=round(item['last']-item['first'], 3), end=clip_end(item))
              for item in video_items(project)]
    matching = [item for item in [*layout(project), *layers] if (item.get('shot') or item['id']) == shot]
    clip = next((item for item in matching if item['id'] == clip_id), None)
    if clip is None:
        raise ValueError('时间线片段已变化，请重新选择。')
    if ('lane' in clip or clip.get('shot') is None or len(matching) > 1 or clip_id != shot
            or any(clip_id in project.state.get(field, {}) for field in CLIP_OVERRIDE_FIELDS)):
        return clip
    return None


def clip_replacement(project, clip, replacements=None):
    if replacements is None:
        replacements = project.replacements
    return project.state.get('timeline_replacements', {}).get(clip['id'], replacements.get(clip.get('shot')))


def clip_properties(project, clip):
    return project.state.get('timeline_clip_properties', {}).get(
        clip['id'], project.clip_properties.get(clip.get('shot')))


def video_length(project, clip):
    key = clip.get('shot')
    return project.shots[key]['duration'] if key is not None else clip.get('media_duration', clip['duration'])


def video_input(project, clip, replacements=None):
    """Return the file, its in point and the original duration when replacement needs fitting."""
    first = clip['first']
    if replacement := clip_replacement(project, clip, replacements):
        return Path(replacement), first, video_length(project, clip)
    if clip.get('shot') is not None:
        return project.source, round(project.shots[clip['shot']]['start']+first, 3), None
    return Path(clip['path']), first, None


def has_video(project, clips=None):
    return bool((layout(project) if clips is None else clips) or video_items(project))


def duration(project, clips=None):
    if clips is None:
        clips = layout(project)
    ends = [clips[-1]['end'] if clips else 0]
    mix = project.state.get('audio_mix')
    external = mix.get('external') if isinstance(mix, dict) else None
    tracks = project.state.get('timeline_source_audio', {})
    for key in tracks:
        ends.extend(clip_end(row) for row in (source_audio_override(project, key, external) or ()))
    ends.extend(clip_end(row) for row in (*audio_items(project), *video_items(project)))
    return max(ends)


def clip_end(item):
    return round(item['start'] + item['last'] - item['first'], 3)


def overlaps(start, end, left, right):
    return round(start, 3) < round(right, 3) and round(left, 3) < round(end, 3)


def trim_limits(start, end, occupied, limit=MAX_TIME):
    before = max((right for _, right in occupied if right <= start), default=0)
    after = min((left for left, _ in occupied if left >= end), default=limit)
    return before, after


def place_start(start, length, occupied, *, limit=MAX_TIME, forward=False):
    """Find a free interval without changing the other clips on the lane."""
    target = round(start, 3)
    candidates = []
    cursor = 0
    for left, right in [*sorted((left, right) for left, right in occupied if left < limit), (limit, limit)]:
        last = round(left - length, 3)
        first = max(cursor, target) if forward else cursor
        if first <= last:
            position = min(max(target, first), last)
            if position == target or forward:
                return position
            candidates.append(position)
        cursor = max(cursor, right)
    if candidates:
        return min(candidates, key=lambda candidate: (round(abs(candidate - target), 3), candidate))
    raise ValueError('这条轨道没有足够的空位。')


def separate_overlaps(rows, bounds):
    """Put overlapping segments on separate rows, keeping later layers above earlier ones."""
    tracks = []
    for row in rows:
        start, end = bounds(row)
        conflicts = [index for index, track in enumerate(tracks)
                     if any(overlaps(start, end, left, right) for left, right, _ in track)]
        index = max(conflicts, default=-1) + 1
        if index == len(tracks):
            tracks.append([])
        tracks[index].append((start, end, row))
    return [[row for _, _, row in sorted(track, key=lambda item: item[:2])] for track in tracks]


def interval(item):
    return item['start'], item['end'] if 'end' in item else clip_end(item)


def numbered_lanes(rows, count=1):
    """Keep explicitly placed clips on their rows and recover legacy overlaps."""
    lanes = [[] for _ in range(count)]
    automatic = []

    def conflicts(row, lane):
        left, right = interval(row)
        return any(overlaps(left, right, *interval(peer)) for peer in lane)

    for row in rows:
        index = row.get('row')
        if type(index) is not int or not 0 <= index < 4096:
            automatic.append(row)
            continue
        while len(lanes) <= index:
            lanes.append([])
        if conflicts(row, lanes[index]):
            automatic.append(row)
        else:
            lanes[index].append(row)
    for row in automatic:
        index = max((i for i, lane in enumerate(lanes) if conflicts(row, lane)), default=-1) + 1
        if index == len(lanes):
            lanes.append([])
        lanes[index].append(row)
    return [sorted(lane, key=interval) for lane in lanes]


def lane_peers(items, item):
    lane = next(track for track in numbered_lanes(items) if item in track)
    return [interval(row) for row in lane if row is not item]


def clip_order(placements):
    result = []
    end = 0
    for clip in placements:
        item = video_order_item(clip)
        gap = round(clip['start'] - end, 3)
        if gap > 0:
            item['gap'] = gap
        result.append(item)
        end = clip['end']
    return result


def video_order_item(clip):
    item = {key: clip[key] for key in ('id', 'first', 'last')}
    item['shot'] = clip.get('shot')
    if item['shot'] is None:
        item.update(path=clip['path'], media_duration=clip.get('media_duration', clip['duration']))
    if 'volume' in clip:
        item['volume'] = clip['volume']
    return item


def main_magnet(project):
    saved = project.state.get('timeline_magnet')
    if isinstance(saved, bool):
        return saved
    return not any(item.get('gap') for item in clip_order(layout(project)))


def compact(sequence):
    return [{key: value for key, value in item.items() if key != 'gap'} for item in sequence]


def close_caption_gaps(captions, clips, duration):
    gaps = [(left, clip['start']) for left, clip in zip([0, *(row['end'] for row in clips)], clips)
            if round(clip['start'] - left, 3) > 0]

    def position(time):
        removed = sum(min(right - left, max(0, time - left)) for left, right in gaps)
        return round(min(duration, time - removed), 3)

    rows = []
    for cue in captions:
        start, end = position(cue['start']), position(cue['end'])
        if end <= start:
            # Keep an editable cue at the join if all of its time was in a closed gap.
            length = min(duration, cue['end'] - cue['start'])
            start = round(min(start, duration - length), 3)
            end = round(start + length, 3)
        rows.append(dict(cue, start=start, end=end))
    return sorted(rows, key=lambda row: (row['start'], row['end'], row['id']))


def move_clip(previous, sequence, index, at, magnetic):
    clip = previous[index]
    others = previous[:index] + previous[index + 1:]
    length = clip['duration']
    if magnetic:
        sequence.insert(magnetic_index(others, at), sequence.pop(index))
        return sequence
    start = place_start(at, length, [interval(row) for row in others])
    moved = dict(clip, start=start, end=round(start + length, 3))
    return clip_order(sorted([*others, moved], key=lambda row: row['start']))


def magnetic_index(clips, at):
    start = 0
    for index, row in enumerate(clips):
        if at < start + row['duration'] / 2:
            return index
        start = round(start + row['duration'], 3)
    return len(clips)


def split_time(value, start, end, minimum=.04):
    at = seconds(value)
    if min(at - start, end - at) < minimum - .001:
        raise ValueError('请将播放头移到片段内部再分割。')
    return at


def edit(project, request):
    previous = layout(project)
    index = next((i for i, clip in enumerate(previous) if clip['id'] == request.get('clip')), -1)
    if index < 0:
        raise ValueError('请先在时间线上选择镜头。')
    sequence = clip_order(previous)
    item = sequence[index]
    clip = previous[index]
    command = request.get('operation')
    magnetic = main_magnet(project)
    selected = item['id']
    parents = {}
    minimum = min(clip['duration'], max(.04, 1 / (project.data['source'].get('fps') or 24)))
    if command == 'trim':
        first, last = seconds(request.get('first')), seconds(request.get('last'))
        if last - first < minimum - .001 or last > video_length(project, clip) + .001:
            raise ValueError('修剪范围必须在原镜头内，并保留至少一帧。')
        if magnetic:
            item.update(first=first, last=last)
        else:
            anchor = round(clip['start'] - clip['first'], 3)
            peers = [interval(row) for row in previous if row is not clip]
            before, after = trim_limits(*interval(clip), peers)
            first, last = max(first, round(before - anchor, 3)), min(last, round(after - anchor, 3))
            if last - first < minimum - .001:
                raise ValueError('这条轨道没有足够的空位。')
            changed = dict(clip, first=first, last=last, start=round(anchor+first, 3), end=round(anchor+last, 3))
            sequence = clip_order([*previous[:index], changed, *previous[index + 1:]])
    elif command == 'split':
        at = split_time(request.get('time'), clip['start'], clip['end'], minimum)
        cut = round(item['first'] + at - previous[index]['start'], 3)
        if len(sequence) >= MAX_CLIPS:
            raise ValueError('此时间线已达到 240 个片段。')
        selected = 'clip-' + secrets.token_hex(6)
        parents[selected] = item['id']
        sequence.insert(index + 1, dict(item, id=selected, first=cut))
        sequence[index + 1].pop('gap', None)
        item['last'] = cut
    elif command == 'remove':
        if magnetic:
            sequence.pop(index)
        else:
            sequence = clip_order(previous[:index] + previous[index + 1:])
        selected = sequence[min(index, len(sequence) - 1)]['id'] if sequence else None
    elif command == 'move':
        sequence = move_clip(previous, sequence, index, seconds(request.get('start')), magnetic)
    elif command in ('earlier', 'later'):
        target = index + (-1 if command == 'earlier' else 1)
        if not 0 <= target < len(sequence):
            raise ValueError('镜头已经在时间线边缘。')
        first_gap, second_gap = item.get('gap', 0), sequence[target].get('gap', 0)
        sequence[index], sequence[target] = dict(sequence[target], gap=first_gap), dict(item, gap=second_gap)
    else:
        raise ValueError('请选择可用的时间线操作。')
    if magnetic:
        sequence = compact(sequence)
    return sequence, layout(project, sequence), parents, selected


def spans_for_edit(previous, next_clips, parents):
    by_id = {item['id']: item for item in previous}
    for item in next_clips:
        old = by_id[parents.get(item['id'], item['id'])]
        first, last = max(old['first'], item['first']), min(old['last'], item['last'])
        if first < last:
            old_start = old['start'] + first - old['first']
            yield old_start, old_start + last - first, item['start'] + first - item['first']


def cut_spans(ranges, duration, fps):
    """Map ordered ranges on the old timeline to consecutive positions on the new one."""
    if not isinstance(ranges, list) or not 1 <= len(ranges) <= MAX_CLIPS:
        raise ValueError(f'请提供 1 至 {MAX_CLIPS} 段要保留的时间范围。')
    minimum = min(duration, max(.04, 1 / fps))
    spans = []
    position = 0.0
    for item in ranges:
        if not isinstance(item, dict) or item.keys() != {'start', 'end'}:
            raise ValueError('每一段需要当前时间线上的开始和结束秒数。')
        start, end = seconds(item['start']), seconds(item['end'])
        if end > duration or end <= start or end - start < minimum - .001:
            raise ValueError('保留范围必须在当前时间线内，每段至少保留一帧。')
        spans.append((start, end, position))
        position = round(position + end - start, 3)
        if position > MAX_TIME:
            raise ValueError('剪辑后的总时长超出时间线范围。')
    return spans


def cut_media(items, spans, parents):
    """Apply the same time mapping to a video or audio lane and keep source offsets."""
    result = []
    used = set()
    for start, end, position in spans:
        for item in items:
            a, z = max(start, item['start']), min(end, clip_end(item))
            if z <= a:
                continue
            identifier = item['id']
            if identifier in used:
                identifier = 'clip-' + secrets.token_hex(8)
                parents[identifier] = item['id']
            used.add(identifier)
            first = round(item['first'] + a - item['start'], 3)
            last = round(item['first'] + z - item['start'], 3)
            at = round(position + a - start, 3)
            result.append(dict(item, id=identifier, start=at, first=first, last=last))
    return sorted(result, key=lambda item: item['start'])


def keep_clip_overrides(fields, clips, parents):
    for field in CLIP_OVERRIDE_FIELDS:
        if overrides := fields.get(field):
            fields[field] = {item['id']: overrides[parent] for item in clips
                             if (parent := parents.get(item['id'], item['id'])) in overrides}


def source_spans(project, clips):
    for item in sorted([*clips, *video_items(project)], key=lambda row: row['start']):
        if item.get('shot') is None:
            continue
        offset = project.shots[item['shot']]['start']
        yield offset + item['first'], offset + item['last'], item['start']


def contiguous_spans(spans):
    previous = None
    for first, last, position in spans:
        if previous and abs(first - previous[1]) < .0005 and abs(position - previous[2] - (previous[1] - previous[0])) < .0005:
            previous = (previous[0], last, previous[2])
        else:
            if previous:
                yield previous
            previous = (first, last, position)
    if previous:
        yield previous


def remap(rows, spans, keys=('start', 'end'), *, manual=False):
    left, right = keys
    result = []
    used = set()
    for a, z, position in contiguous_spans(spans):
        for row in rows:
            first, last = max(a, row[left]), min(z, row[right])
            if last - first < .015:
                continue
            moved = {**row, left: round(position + first - a, 3), right: round(position + last - a, 3)}
            if manual:
                identifier = row['id']
                if identifier in used:
                    moved['id'] = secrets.token_hex(8)
                used.add(identifier)
            else:
                if first > row[left] + .001:
                    moved['anim_in'] = None
                if last < row[right] - .001:
                    moved['anim_out'] = None
            result.append(moved)
    return sorted(result, key=lambda row: (row[left], row[right]))


def active(project):
    return explicit(project) or bool(audio_items(project) or video_items(project) or project.state.get('timeline_source_audio'))


def audio_items(project):
    return project.state.get('timeline_audio', [])


def user_tracks(project):
    return project.state.get('timeline_tracks', [])


def video_items(project):
    order = {row['id']: index for index, row in enumerate(user_tracks(project))}
    return sorted((row for row in project.state.get('timeline_video', []) if row['lane'] in order),
                  key=lambda row: order[row['lane']])


def separate_added_tracks(project):
    """Recover overlapping clips from older workspaces without changing their times."""
    existing = user_tracks(project)
    ids = {track['id'] for track in existing}
    media = {'audio': audio_items(project), 'video': video_items(project)}
    presets = [dict(id=lane, kind='audio') for lane in AUDIO_LANES]
    tracks = []
    for track in [*presets, *existing]:
        lane = track['id']
        if track in existing:
            tracks.append(track)
        rows = [row for row in media[track['kind']] if row['lane'] == lane]
        for index, row in enumerate(separate_overlaps(rows, interval)[1:], 2):
            identifier = f'{lane}-layer-{index}'
            while identifier in ids:
                identifier += '-layer'
            ids.add(identifier)
            tracks.append(dict(id=identifier, kind=track['kind']))
            for clip in row:
                clip['lane'] = identifier
    if tracks != existing:
        project.state['timeline_tracks'] = tracks


def source_audio_override(project, track, path):
    stored = project.state.get('timeline_source_audio', {}).get(track)
    if stored is not None and (track != 'external' or stored.get('path') == str(path)):
        return stored['clips']
    return None


def source_audio_items(project, track, path, clips=None):
    override = source_audio_override(project, track, path)
    if override is not None:
        return override
    media_duration = project.data['source'].get('duration') or duration(project, clips)
    spans = contiguous_spans(source_spans(project, layout(project) if clips is None else clips))
    items = [dict(id=f'source-{track}-{index}', lane=track, start=round(start, 3),
                  first=round(first, 3), last=round(last, 3), duration=media_duration, volume=100)
             for index, (first, last, start) in enumerate(spans) if last - first >= .001]
    if track == 'external':
        previous = project.state.get('timeline_source_audio', {}).get(track, {})
        items.extend(row for row in previous.get('clips', []) if row.get('path'))
    return items


def source_audio_lanes(project, track, path, clips=None):
    stored = project.state.get('timeline_source_audio', {}).get(track, {})
    count = stored.get('row_count', 1)
    count = count if type(count) is int and 1 <= count <= 4096 else 1
    return numbered_lanes(source_audio_items(project, track, path, clips), count)


def positioned_audio(project, selected_tracks, *, include_added=False):
    items = [dict(row, path=row.get('path') or path, volume=row['volume'] * level / 100)
             for track, path, level in selected_tracks
             for row in source_audio_items(project, track, path)]
    if include_added:
        items.extend(audio_items(project))
    return [row for row in items if row['volume'] > 0]


def shape_revision(project):
    data = json.dumps(project.state.get('timeline'), sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(data.encode('utf-8')).hexdigest()[:20]


def render_audio(job, duration, items, destination):
    inputs, filters, labels = [], [], []
    indices = {}
    format_audio = 'aresample=48000,aformat=channel_layouts=stereo'
    for row in items:
        if row['start'] >= duration:
            continue
        path = Path(row['path'])
        if not path.is_file():
            raise ValueError('时间线音频文件已移动 ' + path.name)
        if path not in indices:
            indices[path] = len(indices)
            inputs.extend(('-i', path))
        label = f'[a{len(labels)}]'
        filters.append(f'[{indices[path]}:a:0]{format_audio},apad,atrim=start={row["first"]}:end={row["last"]},'
                       f'asetpts=PTS-STARTPTS,volume={row["volume"]/100:.2f},'
                       f'adelay={round(row["start"]*1000)}:all=1{label}')
        labels.append(label)
    if not labels:
        return None
    filters.append(''.join(labels) + (f'amix=inputs={len(labels)}:normalize=0,' if len(labels)>1 else '')
                   + 'alimiter=limit=0.98:level=0:latency=1,apad[out]')
    encoder = ('-c:a', 'pcm_s24le') if destination.suffix == '.wav' else ('-c:a', 'aac', '-b:a', '192k')
    job.ffmpeg(*inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', '-t', f'{duration:.3f}',
               *encoder, destination)
    return destination


def source_clips(project):
    return [dict(item, source_start=round(project.shots[item['shot']]['start'] + item['first'], 3))
            if item['shot'] is not None else item
            for item in layout(project)]


def with_video_gaps(clips, limit):
    end = 0
    for clip in clips:
        if clip['start'] > end:
            yield dict(shot=None, start=end, end=clip['start'], duration=round(clip['start'] - end, 3))
        yield clip
        end = clip['end']
    if limit > end:
        yield dict(shot=None, start=end, end=limit, duration=round(limit - end, 3))


def stage_video_layers(job, project, folder):
    from rea_video import clip_style
    from rea_video.remake import fit_speed
    from studio_workspace import probe

    layers = []
    source = project.data['source']
    size = clip_style.canvas_size(source)
    fps = min(source.get('fps') or 24, 60)
    defaults = clip_style.defaults(size)
    for index, item in enumerate(video_items(project)):
        path, first, fit = video_input(project, item)
        if not path.is_file():
            raise ValueError('附加视频轨的素材已移动，请重新添加。')
        length = round(item['last']-item['first'], 3)
        style = clip_style.normalize(clip_properties(project, item), size, length)
        if fit is not None or style != defaults:
            speed = 1
            if fit is not None:
                media_length = probe(path, 'v')['duration']
                speed = fit_speed(media_length, fit)
                first = min(first*speed, max(0, media_length-1/fps))
            dest = folder / f'video-layer-{index:04d}.mp4'
            graph = clip_style.filter_graph(style, size, length, fps, speed,
                                            motion_file=folder / (dest.stem + '.motion'))
            job.ffmpeg('-ss', f'{first:.6f}', '-i', path, '-filter_complex_threads', '2',
                       '-filter_complex', graph, '-map', '[out]', '-an',
                       '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', dest, cwd=folder)
            path, first = dest, 0
        layers.append(dict(path=str(path), start=item['start'], first=first, last=round(first+length, 3),
                           restore_packaging=bool(fit is not None and item.get('shot') is not None)))
    return layers


def render_reference(job, project, clips, destination, *, audio=None):
    # Materialize the edited source only when exporting a movie.
    source = project.data['source']
    fps = min(source.get('fps') or 24, 60)
    width, height = (source[key] + source[key] % 2 for key in ('width', 'height'))
    if source.get('rotation') in (90, 270):
        width, height = height, width
    segments = []
    for index, item in enumerate(clips):
        segment = destination.with_name(f'ref-{index:04d}.mp4')
        filters = f'fps={fps},pad=ceil(iw/2)*2:ceil(ih/2)*2'
        if 'path' in item:
            inputs = ('-ss', f'{item["first"]:.3f}', '-i', item['path'])
            filters = (f'fps={fps},scale={width}:{height}:force_original_aspect_ratio=increase,'
                       f'crop={width}:{height},setsar=1')
        elif item['shot'] is None:
            inputs = ('-f', 'lavfi', '-i', f'color=c=black:s={width}x{height}:r={fps}')
        else:
            inputs = ('-ss', f'{item["source_start"]:.3f}', '-i', project.source)
        job.ffmpeg(*inputs,
                   '-t', f'{item["duration"]:.3f}', '-map', '0:v:0', '-an',
                   '-vf', filters,
                   '-c:v', 'libx264', '-preset', 'veryfast',
                   '-crf', '16', '-pix_fmt', 'yuv420p', segment)
        segments.append(segment)
    listing = destination.with_name('reference.concat')
    listing.write_text(''.join(f"file '{part.name}'\n" for part in segments), encoding='ascii')
    command = ['-f', 'concat', '-safe', '0', '-i', listing]
    if audio:
        command.extend(('-i', audio, '-map', '0:v:0', '-map', '1:a:0'))
    command.extend(('-c', 'copy', '-movflags', '+faststart', destination))
    job.ffmpeg(*command)
    return destination


def staged_breakdown(project, clips, reference):
    b = dict(project.data)
    b['source'] = dict(b['source'], path=str(reference), duration=clips[-1]['end'], has_audio=False)
    b['shots'] = []
    for index, item in enumerate(clips, 1):
        shot = project.shots.get(item['shot'], {})
        b['shots'].append(dict(shot, index=index, start=item['start'], end=item['end'], duration=item['duration'],
                               base=dict(shot.get('base', {}), label='live_action')))
    if 'packaging' in b and b['packaging']:
        pack = dict(b['packaging'])
        spans = list(source_spans(project, clips))
        for key in ('text_cues', 'stickers'):
            pack[key] = remap(pack.get(key, []), spans, ('t0', 't1'))
        b['packaging'] = pack
    return b
