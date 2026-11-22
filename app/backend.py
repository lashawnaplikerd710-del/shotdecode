from __future__ import annotations

import ctypes
import datetime as dt
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import unicodedata
from contextlib import contextmanager, suppress
from functools import cache
from pathlib import Path
from typing import NamedTuple
from xml.sax.saxutils import escape

from export_profiles import AUDIO_ENCODERS, VIDEO_AUDIO_ENCODERS, ExportProfile
from ffmpeg_location import ffmpeg_directory
from manual_caption_style import stage_caption_fonts, write_ass


APP = Path(__file__).resolve().parent
HOME = APP.parent
DATA = Path(os.environ.get('REA_WORKBENCH_DATA', HOME / 'data')).resolve()
PORTABLE_PYTHON = HOME / 'runtime/python.exe'
PYTHON = PORTABLE_PYTHON if PORTABLE_PYTHON.is_file() else Path(sys.executable)
FFMPEG = (ffmpeg_directory(HOME) or HOME / 'ffmpeg') / 'ffmpeg.exe'
FFPROBE = FFMPEG.with_name('ffprobe.exe')
DATA.mkdir(parents=True, exist_ok=True)

LABELS = {
    'live_action': '实拍', 'ai_video': 'AI 生成视频', 'avatar': '数字人', 'cg_3d': '3D 渲染',
    'anim_2d': '2D 动画', 'stop_motion': '定格动画', 'film_footage': '影视片段',
    'code_render': '代码 / 模板渲染', 'screen_capture': '录屏 / 截图',
    'still_motion': '静图推拉', 'static_hold': '静帧',
}
MODES = {'单张参考图': 'image_to_video', '首尾帧': 'first_last_frame', '纯文字': 'text_to_video'}
VIDEO_EXTENSIONS = ('.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v', '.wmv', '.flv', '.mts', '.ts', '.mpeg', '.mpg')
AUDIO_EXTENSIONS = ('.wav', '.mp3', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.wma')
SETTINGS_FILE = DATA / 'settings.json'
MANUAL_CAPTIONS_FILE = 'manual-captions.json'
SENSE_VOICE = HOME / 'asr-model-ja'
SPEECH_MODELS = {'zh': HOME / 'asr-model', 'ja': SENSE_VOICE, 'auto': SENSE_VOICE}
JAPANESE_OCR_MODEL = HOME / 'models/japan_PP-OCRv4_rec_mobile.onnx'


def fontconfig() -> Path:
    config = DATA / 'fonts.conf'
    font_dirs = [Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts']
    if local_app_data := os.environ.get('LOCALAPPDATA'):
        user_fonts = Path(local_app_data) / 'Microsoft/Windows/Fonts'
        if user_fonts.is_dir():
            font_dirs.append(user_fonts)
    cache = DATA / 'font-cache'
    cache.mkdir(exist_ok=True)
    directories = ''.join(f'<dir>{escape(directory.as_posix())}</dir>' for directory in font_dirs)
    content = (f'<?xml version="1.0"?><fontconfig>{directories}'
               f'<cachedir>{escape(cache.as_posix())}</cachedir></fontconfig>')
    if not config.is_file() or config.read_text(encoding='utf-8') != content:
        config.write_text(content, encoding='utf-8')
    return config


def load_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding='utf-8-sig'))
    except FileNotFoundError:
        if default is not None:
            return default
        raise


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    temp.replace(path)


def default_project_output_dir() -> Path:
    return HOME / 'projects'


def project_output_dir(saved=None) -> Path:
    legacy = {Path.home() / 'Videos' / name for name in ('REA Video', '视频拆解工作台')}
    if isinstance(saved, str) and saved.strip():
        configured = Path(saved).expanduser()
        if configured.is_absolute() and configured not in legacy:
            return configured
    return default_project_output_dir()


@cache
def default_movie_output_dir() -> Path:
    desktop = Path.home() / 'Desktop'
    if os.name == 'nt':
        path = ctypes.create_unicode_buffer(260)
        # CSIDL_DESKTOPDIRECTORY gives the physical desktop, including redirected folders.
        if ctypes.windll.shell32.SHGetFolderPathW(None, 0x10, None, 0, path) == 0 and path.value:
            desktop = Path(path.value)
    return desktop / '视频拆解成片'


def movie_output_dir(saved=None) -> Path:
    if isinstance(saved, str) and saved:
        configured = Path(saved).expanduser()
        if configured.is_absolute():
            return configured
    return default_movie_output_dir()


def movie_output_picker_start(folder: Path) -> Path:
    return next((path for path in (folder, folder.parent, default_movie_output_dir().parent)
                 if path.is_dir()), Path.home())


def safe_output_name(name: str) -> str:
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]+', ' ', name).strip(' .')[:52].rstrip(' .') or '视频'


def new_folder(parent: Path, name: str) -> Path:
    safe = safe_output_name(name)
    prefix = dt.datetime.now().strftime('%Y%m%d-%H%M%S')
    folder = parent / f'{prefix} {safe}'
    serial = 2
    parent.mkdir(parents=True, exist_ok=True)
    while True:
        try:
            folder.mkdir()
            return folder.resolve()
        except FileExistsError:
            folder = parent / f'{prefix} {safe} ({serial})'
            serial += 1


def publish_delivery(folder: Path, files: tuple[Path, ...], names: tuple[str, ...]) -> tuple[Path, ...]:
    serial = 1
    while True:
        serial_suffix = '' if serial == 1 else f' ({serial})'
        outputs = tuple(folder / (name + serial_suffix + file.suffix)
                        for file, name in zip(files, names, strict=True))
        if not any(path.exists() for path in outputs):
            moved = []
            try:
                for source, target in zip(files, outputs):
                    source.rename(target)
                    moved.append((source, target))
                return outputs
            except OSError as exc:
                for source, target in reversed(moved):
                    target.rename(source)
                if not isinstance(exc, FileExistsError):
                    raise
        serial += 1


class Project:
    def __init__(self, breakdown: Path):
        self.path = breakdown.resolve()
        self.folder = self.path.parent
        self.data = load_json(self.path)
        self.shots = {str(shot['index']): shot for shot in self.data.get('shots', [])}
        if not self.shots or not self.data.get('source', {}).get('path'):
            raise ValueError('请选择拆解项目里的 breakdown.json。')
        self.state_file = self.folder / 'workbench.json'
        self.state = load_json(self.state_file, {})
        self.replacements = self.state.setdefault('replacements', {})
        self.prompts = self.state.setdefault('prompts', {})
        self.references = self.state.setdefault('references', {})

    @property
    def source(self) -> Path:
        path = Path(self.data['source']['path']).expanduser()
        return path.resolve() if path.is_absolute() else (self.folder / path).resolve()

    @property
    def name(self) -> str:
        return self.data['source'].get('filename', self.source.name)

    @property
    def clip_properties(self) -> dict:
        properties = self.state.get('clip_properties')
        return properties if isinstance(properties, dict) else {}

    def save(self):
        write_json(self.state_file, self.state)

    def source_asset(self, shot: str, key: str) -> Path | None:
        relative = self.shots[shot].get('assets', {}).get(key)
        return (self.folder / relative).resolve() if relative else None


class Cancelled(Exception):
    pass


def format_exit_code(code):
    if os.name == 'nt' and (code < 0 or code >= 0x80000000):
        return f'0x{code & 0xFFFFFFFF:08X}'
    return str(code)


class JobProcessError(RuntimeError):
    def __init__(self, code, tail, *, quiet):
        self.exit_code = format_exit_code(code)
        self.summary = f'命令退出，代码 {self.exit_code}。'
        self.quiet = quiet
        super().__init__(self.summary + ('\n' + tail if tail else ''))


class Job:
    def __init__(self, emit, on_stage=None):
        self.emit = emit
        self.on_stage = on_stage
        self.cancelled = threading.Event()
        self.process = None
        self.lock = threading.Lock()

    def set_stage(self, label):
        if self.on_stage:
            self.on_stage(label)

    def check(self):
        if self.cancelled.is_set():
            raise Cancelled()

    def cancel(self):
        self.cancelled.set()
        with self.lock:
            process = self.process
        if process is not None and process.poll() is None:
            threading.Thread(target=self._stop_tree, args=(process,), daemon=True).start()

    @staticmethod
    def _stop_tree(process):
        subprocess.run(['taskkill.exe', '/PID', str(process.pid), '/T', '/F'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                       creationflags=subprocess.CREATE_NO_WINDOW, check=False)

    def run(self, args, *, cwd=None, quiet=False, extra_env=None, on_line=None):
        output = []
        with self.child(args, cwd=cwd, stdout=subprocess.PIPE, text=True, extra_env=extra_env) as process:
            with process.stdout:
                for line in process.stdout:
                    output.append(line)
                    if on_line:
                        on_line(line)
                    if not quiet:
                        self.emit(line.rstrip())
            code = process.wait()
        self.check()
        if code:
            tail = ''.join(output[-6:]).strip()
            raise JobProcessError(code, tail, quiet=quiet)
        return ''.join(output)

    @contextmanager
    def child(self, args, *, cwd=None, stdout=None, text=False, extra_env=None):
        self.check()
        env = os.environ.copy()
        env.pop('PYTHONHOME', None)
        env.pop('PYTHONPATH', None)
        env.update({
            'PATH': str(FFMPEG.parent) + os.pathsep + env.get('PATH', ''),
            'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8', 'PYTHONUNBUFFERED': '1',
            'PYTHONNOUSERSITE': '1', 'REA_VIDEO_MODELS': str(HOME / 'models'),
            'REA_VIDEO_HOME': str(DATA / 'memory'), 'FONTCONFIG_FILE': str(fontconfig()),
        })
        env.update(extra_env or {})
        with self.lock:
            self.check()
            process = self.process = subprocess.Popen(
                list(map(str, args)), cwd=cwd or HOME, env=env, stdout=stdout, stdin=subprocess.DEVNULL,
                stderr=subprocess.STDOUT, text=text, encoding='utf-8' if text else None,
                errors='replace' if text else None,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
        try:
            yield process
        finally:
            if process.poll() is None:
                with suppress(OSError):
                    process.terminate()
                try:
                    process.wait(timeout=4)
                except subprocess.TimeoutExpired:
                    with suppress(OSError):
                        process.kill()
                    process.wait()
            with self.lock:
                self.process = None

    def rea(self, *args, env_file=None, quiet=False, extra_env=None, on_line=None):
        config = ['--env-file', env_file] if env_file else []
        return self.run([PYTHON, '-I', '-X', 'utf8', '-u', APP / 'analysis_runner.py', *config, *args],
                        quiet=quiet, extra_env=extra_env, on_line=on_line)

    def ffmpeg(self, *args, cwd=None):
        return self.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', *args], cwd=cwd)

    def build_generation_plan(self, project, capsule, engine, mode):
        from rea_video.i18n import set_lang
        from rea_video.integrations.capsule_cinema import build_remake_jobs

        self.check()
        set_lang(project.data.get('lang', 'zh'))
        return build_remake_jobs(project.data, project.folder, capsule, engine=engine or None, mode=mode)

    def preview_generation(self, path, capsule, only=''):
        from rea_video.integrations import run_remake

        return self.run([PYTHON, '-I', '-X', 'utf8', '-u', run_remake.__file__, '--jobs', path,
                         '--capsule-root', capsule, '--dry-run', '--only', only])

    def speech_segments(self, source: Path, language: str):
        if not speech_model_ready(language):
            raise ValueError('缺少所选语言的本地口播模型。可从 Windows 开始菜单打开 ShotDecode 组件安装。')
        with tempfile.TemporaryDirectory(dir=DATA) as tmp:
            wave = Path(tmp) / 'speech.f32'
            self.ffmpeg('-i', source, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', wave)
            return recognize_speech(wave, self.emit, self.check, language)

    def transcribe(self, source: Path, dest: Path, language: str = 'zh'):
        rows = [line for segment in self.speech_segments(source, language)
                for line in wrap_speech(segment.start, segment.end, segment.text, segment.anchors)]
        if not rows:
            raise ValueError('这段音频没有识别到可导出的口播。')
        write_srt(dest, rows)
        self.emit(f'已转写 {len(rows)} 条字幕，时间按语音段落估算。')
        return dest

    def separate(self, source: Path, dest: Path):
        self.rea('stems', source, '-o', dest)
        stems = dest / 'stems'
        if not (stems / 'vocals.wav').is_file():
            raise ValueError('人声分轨未生成。请确认输入有音轨，并查看任务日志。')
        return stems

    def burn(self, video: Path, captions: Path, dest: Path):
        with tempfile.TemporaryDirectory(dir=DATA) as tmp:
            folder = Path(tmp)
            alias = 'caption.ass' if captions.suffix.lower() == '.ass' else 'caption.srt'
            shutil.copyfile(captions, folder / alias)
            vf = 'ass=caption.ass' if alias.endswith('.ass') else "subtitles=caption.srt:force_style='FontName=Microsoft YaHei'"
            self.ffmpeg('-i', video, '-map', '0:v:0', '-map', '0:a?', '-vf', vf,
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', dest,
                        cwd=folder)
        return dest

    @contextmanager
    def delivery_folder(self, export_root):
        self.check()
        try:
            export_root.mkdir(parents=True, exist_ok=True)
            scratch = tempfile.TemporaryDirectory(dir=export_root, prefix='.render-', ignore_cleanup_errors=True)
        except OSError as exc:
            raise ValueError(f'无法写入保存位置 {export_root}。请在导出窗口更改保存位置。') from exc
        with scratch as temp:
            yield Path(temp)

    def delivery_audio(self, project, render, audio, mix_tracks, timeline_mix, *, lossless=False):
        import studio_timeline as timeline

        if audio is not None:
            return audio
        original = [('original', project.source, 100)] if project.data['source'].get('has_audio') else []
        tracks = mix_tracks if timeline_mix else original
        if not timeline.active(project) and (not timeline_mix or (tracks and tracks == original)):
            return None
        self.set_stage('正在混合工程音轨')
        items = timeline.positioned_audio(project, tracks, include_added=timeline_mix)
        suffix = '.wav' if lossless else '.m4a'
        return timeline.render_audio(self, timeline.duration(project), items,
                                     render / ('timeline-audio' + suffix)) or 'mute'

    def finish_movie(self, assembled, audio, profile, destination):
        separate_audio = audio is not None and audio != 'mute'
        args = ['-i', assembled]
        if separate_audio:
            args.extend(('-i', audio))
        args.extend(('-map', '0:v:0', *profile.video_args()))
        if audio == 'mute':
            args.append('-an')
        else:
            if separate_audio:
                args.extend(('-map', '1:a:0', '-shortest'))
            else:
                args.extend(('-map', '0:a:0?'))
            args.extend(profile.audio_filters(pad=separate_audio))
            args.extend(('-c:a', 'copy') if audio is None and profile.format in ('h264', 'hevc')
                        and profile.loudness is None else VIDEO_AUDIO_ENCODERS[profile.format])
        if profile.extension != '.webm':
            args.extend(('-movflags', '+faststart'))
        self.ffmpeg(*args, destination)

    def deliver(self, export_root, files, names):
        if any(file.stat().st_size == 0 for file in files):
            raise ValueError('导出文件为空。')
        self.check()
        self.set_stage('正在写入导出文件')
        exported = publish_delivery(export_root, files, names)
        self.emit(f'文件已保存到 {exported[0]}')
        return exported

    def assemble(self, project: Project, replacements: dict, export_root: Path, overlays: bool,
                 audio: Path | str | None, *, compare=False, mix_tracks=(), timeline_mix=False,
                 profile=ExportProfile()):
        import studio_timeline as timeline

        with self.delivery_folder(export_root) as render:
            audio = self.delivery_audio(project, render, audio, mix_tracks, timeline_mix)
            breakdown = project.path
            results = render / 'results.json'
            edited = timeline.active(project)
            sequence = timeline.source_clips(project)
            if edited:
                self.set_stage('正在整理时间线')
                if not timeline.has_video(project, sequence):
                    raise ValueError('时间线需要至少一个视频片段才能导出。')
                duration = timeline.duration(project, sequence)
                original_audio = None
                if compare and audio != 'mute' and project.data['source'].get('has_audio'):
                    items = timeline.positioned_audio(project, [('original', project.source, 100)])
                    original_audio = timeline.render_audio(self, duration, items, render/'reference-audio.m4a')
                sequence = list(timeline.with_video_gaps(sequence, duration))
                reference = timeline.render_reference(self, project, sequence, render/'reference.mp4', audio=original_audio)
                breakdown = render/'timeline.json'
                write_json(breakdown, timeline.staged_breakdown(project, sequence, reference))
            clips = {}
            for index, item in enumerate(sequence, 1):
                if item['shot'] is None and 'path' not in item:
                    continue
                record = {}
                if video := timeline.clip_replacement(project, item, replacements):
                    record['video'] = video
                    length = timeline.video_length(project, item)
                    if edited and (item['first'] > .001 or item['duration'] < length - .001):
                        record.update(take_from=item['first'], full_length=length)
                if style := timeline.clip_properties(project, item):
                    record['clip_properties'] = style
                if record:
                    clips[str(index) if edited else item['shot']] = record
            layers = timeline.stage_video_layers(self, project, render)
            write_json(results, {'results': clips, 'video_layers': layers})
            args = ['assemble', breakdown, results, '-o', render]
            if overlays:
                args.append('--overlays')
            if not compare:
                args.append('--no-compare')
            elif audio == 'mute':
                args.append('--no-compare-audio')
            captions = load_json(project.folder / MANUAL_CAPTIONS_FILE, [])
            if captions:
                caption_file = render / 'manual-captions.ass'
                write_ass(caption_file, captions, project.data['source'])
                args.extend(('--manual-subtitles', caption_file))
                font_dir = render / 'caption-fonts'
                if stage_caption_fonts(captions, font_dir):
                    args.extend(('--manual-fonts', font_dir))
            self.emit('正在渲染时间线…')
            self.set_stage('正在渲染时间线')
            self.rea(*args, quiet=True)
            log = load_json(render / 'assemble_log.json')
            assembled = Path(log['remake'])
            if log.get('overlays', {}).get('error'):
                self.emit('字幕、标题和花字叠加失败。')
            self.set_stage('正在编码成片')
            final = profile.output_file(render)
            self.finish_movie(assembled, audio, profile, final)
            base = safe_output_name(Path(project.name).stem)
            name = profile.name or base + ' - 成片'
            if compare:
                comparison = (profile.name or base).removesuffix(' - 成片') + ' - 对比视频'
                return self.deliver(export_root, (final, Path(log['compare'])), (name, comparison))
            return self.deliver(export_root, (final,), (name,))

    def export_audio(self, project, export_root, audio, mix_tracks, timeline_mix, profile):
        import studio_timeline as timeline

        with self.delivery_folder(export_root) as render:
            source = self.delivery_audio(project, render, audio, mix_tracks, timeline_mix, lossless=True)
            if source == 'mute' or source is None and project.data['source'].get('has_audio') is False:
                raise ValueError('没有可导出的音轨。请启用音轨或选择外部音频。')
            self.set_stage('正在导出音频')
            file = profile.output_file(render)
            self.ffmpeg('-i', source or project.source, '-map', '0:a:0', '-vn',
                        *profile.audio_filters(pad=True), '-t', f'{timeline.duration(project):.3f}',
                        *AUDIO_ENCODERS[profile.format], file)
            return self.deliver(export_root, (file,), (profile.name,))

    def export_subtitles(self, rows, export_root, profile):
        with self.delivery_folder(export_root) as render:
            file = profile.output_file(render)
            if profile.format == 'srt':
                write_srt(file, rows)
            else:
                cues = [f'{srt_time(start).replace(",", ".")} --> {srt_time(end).replace(",", ".")}\n{escape(text)}\n\n'
                        for start, end, text in rows]
                file.write_text('WEBVTT\n\n' + ''.join(cues), encoding='utf-8')
            return self.deliver(export_root, (file,), (profile.name,))


def srt_time(seconds):
    msec = round(seconds * 1000)
    sec, milli = divmod(msec, 1000)
    minutes, sec = divmod(sec, 60)
    hours, minutes = divmod(minutes, 60)
    return f'{hours:02d}:{minutes:02d}:{sec:02d},{milli:03d}'


def write_srt(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(''.join(f'{i}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n\n'
                            for i, (a, b, text) in enumerate(rows, 1)), encoding='utf-8')


def speech_model_ready(language: str) -> bool:
    folder = SPEECH_MODELS[language]
    return all((folder / file).is_file() for file in ('model.int8.onnx', 'tokens.txt'))


class SpeechSegment(NamedTuple):
    start: float
    end: float
    text: str
    anchors: list[float]
    language: str


def recognize_speech(wave: Path, emit, check, language: str):
    import numpy as np

    package_dir = str(HOME / 'asr-packages')
    if package_dir not in sys.path:
        sys.path.insert(0, package_dir)
    import sherpa_onnx

    rate = 16000
    samples = np.fromfile(wave, dtype='<f4')
    if len(samples) < rate // 5:
        return []
    block = rate // 50
    n_blocks = len(samples) // block
    energy = np.sqrt(np.mean(samples[:n_blocks * block].reshape(-1, block) ** 2, axis=1))
    smooth = np.convolve(energy, np.ones(7) / 7, mode='same')
    noise = min(0.017, max(0.002, float(np.percentile(smooth, 90)) * 0.1))
    if not (smooth >= noise).any():
        return []
    max_blocks, min_cut, max_cut, preferred_cut = (730, 440, 650, 550) if language == 'ja' else (310, 145, 270, 220)
    if language == 'auto':
        max_blocks, min_cut, max_cut, preferred_cut = 440, 150, 380, 310
    cuts = [0]
    while n_blocks - cuts[-1] > max_blocks:
        left, right = cuts[-1] + min_cut, cuts[-1] + max_cut
        candidates = np.arange(left, right)
        quiet = candidates[smooth[left:right] < noise]
        choice = min(quiet, key=lambda i: abs(i - cuts[-1] - preferred_cut)) if quiet.size else left + int(np.argmin(smooth[left:right]))
        cuts.append(int(choice))
    cuts.append(math.ceil(len(samples) / block))
    folder = SPEECH_MODELS[language]
    model = str(folder / 'model.int8.onnx')
    options = dict(tokens=str(folder / 'tokens.txt'), num_threads=4, sample_rate=rate)
    if language in ('ja', 'auto'):
        recognizer = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=model, language=language, use_itn=True, **options)
    else:
        recognizer = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=model, **options)
    cues = []
    for i, (start, end) in enumerate(zip(cuts, cuts[1:]), 1):
        check()
        active = np.flatnonzero(smooth[start:end] >= noise)
        if not active.size:
            continue
        a, b = max(start, start + int(active[0]) - 3), min(end, start + int(active[-1]) + 5)
        stream = recognizer.create_stream()
        stream.accept_waveform(rate, samples[a * block:b * block])
        recognizer.decode_stream(stream)
        recognized = stream.result
        detected = recognized.lang.removeprefix('<|').removesuffix('|>') if language == 'auto' else language
        sentence = recognized.text.strip()
        if sentence:
            last = cues[-1].text if cues and cues[-1].language == detected else ''
            for overlap in range(min(5, len(sentence), len(last)), 2, -1):
                if last.endswith(sentence[:overlap]):
                    sentence = sentence[overlap:].lstrip()
                    break
        if sentence:
            start_time, end_time = a / 50, min(len(samples) / rate, b / 50)
            anchors = [start_time + t for t in recognized.timestamps if 0 <= t < end_time - start_time]
            cues.append(SpeechSegment(start_time, end_time, sentence, anchors, detected))
        if i == len(cuts) - 1 or i % 8 == 0:
            emit(f'语音识别 {i}/{len(cuts) - 1} 段')
    return cues


def wrap_speech(start, end, sentence, anchors=(), columns=38):
    tokens = re.findall(r"[A-Za-z0-9]+(?:[.'-][A-Za-z0-9]+)*|\s+|.", sentence)
    rows, line, used = [], [], 0
    for token in tokens:
        width = sum(2 if unicodedata.east_asian_width(c) in ('W', 'F') else 1 for c in token)
        if line and used + width > columns and token not in '，。！？、；,.!?':
            rows.append(''.join(line).strip())
            line, used = [], 0
        line.append(token)
        used += width
    if line:
        rows.append(''.join(line).strip())
    rows = [row for row in rows if row]
    total = sum(map(len, rows))
    result = []
    at, used = start, 0
    for row in rows[:-1]:
        used += len(row)
        stop = start + (end - start) * used / total
        if anchors:
            index = min(len(anchors) - 1, round(used / total * len(anchors)))
            if at + .12 < anchors[index] < end - .12:
                stop = anchors[index]
        if stop <= at:
            stop = at + (end - at) * len(row) / (total - used + len(row))
        result.append((at, stop, row))
        at = stop
    if rows:
        result.append((at, end, rows[-1]))
    return result


def suggested_prompt(project: Project, key: str) -> str:
    shot = project.shots[key]
    for opinion in (shot.get('review'), shot.get('vlm')):
        if opinion and (opinion.get('replication') or {}).get('video_prompt'):
            return opinion['replication']['video_prompt']
    description = next((opinion['description'] for opinion in (shot.get('review'), shot.get('vlm'))
                        if opinion and opinion.get('description')), '')
    frame = shot.get('aspects', {}).get('framing', {}).get('result', {})
    framing = '，'.join(str(frame[field]) for field in ('shot_size', 'camera_angle') if frame.get(field))
    source = project.data['source']
    return '\n'.join(filter(None, [
        f'{source.get("aspect_ratio", "9:16")}，约 {shot["duration"]:.2f} 秒，单镜头。',
        f'取景保持{framing}。' if framing else '',
        description or '参照上传图片的主体、道具、环境和光线。根据分镜补充主体动作和镜头运动。',
        '保持主体与参考图一致，动作和光影连续。输出干净画面，文字留给后期。',
    ]))
