from __future__ import annotations

import math
import shutil
from pathlib import Path

import backend as be
from app_identity import engine_display_text
from workflows import (build_generation_jobs, check_runtime, match_clip_names, read_clip_results,
                       refresh_project_report, verify_original)


IMAGE_TYPES = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')
CAPTION_TYPES = ('.srt', '.ass')
TOOL_INPUTS = {'video': ('video', be.VIDEO_EXTENSIONS), 'media': ('media', be.VIDEO_EXTENSIONS + be.AUDIO_EXTENSIONS),
               'caption': ('caption', CAPTION_TYPES), 'meta': ('json', ('.json',))}
TOOL_COMMANDS = (
    'pick', 'clear_input', 'probe', 'tiles', 'correct', 'make_review', 'apply_review', 'relink', 'summary',
    'memory', 'export_labels', 'evaluate', 'export_analysis', 'draft', 'runtime', 'open_output',
    'batch_clips', 'import_results', 'open_exports', 'references', 'set_reference', 'build_jobs',
    'preview_jobs', 'run_jobs', 'open_jobs', 'read_subtitle', 'copy_subtitle',
    'transcribe', 'separate', 'burn',
)


class StudioTools:
    def __init__(self, session):
        self.session = session
        self.inputs = {}
        self.results = {}
        self.locations = {}

    def reset_project(self):
        for key in ('video', 'media', 'caption'):
            self.inputs.pop(key, None)
        self.results.clear()
        self.locations.clear()

    def snapshot(self):
        project = self.session.project
        return dict(inputs={key: str(path) for key, path in self.inputs.items()}, results=self.results.copy(),
                    labels=be.LABELS, modes={code: label for label, code in be.MODES.items()},
                    jobs_ready=bool(project and (project.folder / 'remake/jobs.json').is_file()),
                    has_ass=bool(project and (project.folder / 'packaging/overlays.ass').is_file()))

    def action(self, name, data):
        if name not in TOOL_COMMANDS:
            raise ValueError('这个高级工具操作不可用。')
        return getattr(self, name)(data)

    def show(self, page, title, *, text='', location=None, image=None, video=None, audio=None):
        if location:
            self.locations[page] = location
        else:
            self.locations.pop(page, None)
        self.results[page] = dict(title=title, text=engine_display_text(text.strip())[:48_000],
                                  name=location.name if location else '', image=self.session.asset(image),
                                  video=self.session.asset(video), audio=audio or [])
        self.session.error = ''
        return title

    def open_output(self, data):
        location = self.locations.get(data.get('page'))
        if not location or not location.exists():
            raise ValueError('找不到当前工具的输出。')
        return self.session.open_result(location if location.is_dir() else location.parent, '已打开输出目录')

    def current(self, project):
        self.session.idle()
        if self.session.project is not project:
            raise ValueError('当前项目已切换，请重新操作。')

    def pick(self, data):
        key = data.get('field')
        if key in ('capsule_root', 'capsule_python'):
            path = self.session.choose('folder' if key == 'capsule_root' else 'executable')
            if path:
                with self.session.lock:
                    self.session.idle()
                    self.session.config[key] = str(path)
                    self.session.save_config()
            return
        if key not in TOOL_INPUTS:
            raise ValueError('这个文件选项不可用。')
        project = self.session.project
        kind, suffixes = TOOL_INPUTS[key]
        path = self.session.choose(kind, directory=project.folder if project and key == 'caption' else None)
        if path:
            if not path.is_file() or path.suffix.lower() not in suffixes:
                raise ValueError('请选择可用的对应格式文件。')
            with self.session.lock:
                self.current(project)
                self.inputs[key] = path

    def clear_input(self, data):
        key = data.get('field')
        with self.session.lock:
            self.session.idle()
            if key in ('capsule_root', 'capsule_python'):
                self.session.config.pop(key, None)
                self.session.save_config()
            elif key in TOOL_INPUTS:
                self.inputs.pop(key, None)

    def media_source(self, key):
        path = self.inputs.get(key) or self.session.source
        if not path or not path.is_file():
            raise ValueError('请选择可用的媒体文件。')
        return path

    def text_job(self, title, *args, page='tools'):
        self.session.start(title, lambda job: job.rea(*args, quiet=True), lambda text: self.show(page, title, text=text))

    def probe(self, _):
        self.text_job('视频元数据', 'probe', self.media_source('video'), '--tags')

    def tiles(self, data):
        source = self.media_source('video')
        try:
            start, end, every = (float(data[key]) for key in ('start', 'end', 'every'))
        except (KeyError, TypeError, ValueError):
            raise ValueError('开始、结束和间隔请填写秒数，例如 0、3、0.25。') from None
        if not all(map(math.isfinite, (start, end, every))) or not (0 <= start < end and every > 0):
            raise ValueError('结束时间要晚于开始时间，间隔必须大于 0。')
        end = min(end, start + 48 * every)
        if end <= start:
            raise ValueError('间隔太短，请增大抽帧间隔。')
        dest = self.session.export_dir('抽帧') / 'tiles.jpg'
        self.session.start('正在生成抽帧图', lambda job: job.rea('tiles', source, '--start', start, '--end', end,
                           '--every', every, '--max', 48, '-o', dest),
                           lambda _: self.show('tools', '抽帧图已生成', location=dest, image=dest))

    @staticmethod
    def shot(project, data):
        key = data.get('shot')
        if key not in project.shots:
            raise ValueError('请选择当前项目里的镜头。')
        return key

    def review_job(self, title, project, args):
        def done(_):
            self.session.reload_project(project.path)
            return self.show('tools', title, location=project.folder)

        self.session.start(title, lambda job: refresh_project_report(job, project, args), done)

    def correct(self, data):
        project = self.session.project_required()
        key = self.shot(project, data)
        label = data.get('label')
        if label not in be.LABELS:
            raise ValueError('请选择镜头类型。')
        args = ['correct', project.folder, '--shots', key, '--label', label]
        note = str(data.get('note', '')).strip()
        if note:
            args += ['--note', note]
        self.review_job('镜头纠正已保存', project, args)

    def make_review(self, _):
        project = self.session.project_required()
        self.session.start('正在生成复核文件', lambda job: job.rea('review', project.folder, quiet=True),
                           lambda text: self.show('tools', '复核文件已生成', text=text, location=project.folder))

    def apply_review(self, _):
        project = self.session.project_required()
        path = self.session.choose('json', directory=project.folder)
        if path:
            with self.session.lock:
                self.current(project)
                self.review_job('复核结果已并入', project, ['apply-review', project.folder, path, '--by', '工作台复核'])

    def relink(self, _):
        project = self.session.project_required()
        path = self.session.choose('video')
        if not path:
            return

        def done(_):
            project.data['source']['path'] = str(path)
            be.write_json(project.path, project.data)
            self.session.reload_project(project.path)
            return self.show('tools', '原片位置已更新', text=str(path))

        with self.session.lock:
            self.current(project)
            self.session.start('正在核对原片', lambda job: verify_original(job, path, project.data['source']), done)

    def summary(self, _):
        self.text_job('精简结论', 'summary', self.session.project_required().path)

    def memory(self, _):
        self.text_job('本机纠错记忆', 'memory')

    def export_labels(self, _):
        dest = self.session.choose('yaml_save', name='镜头纠错.yaml')
        if dest:
            self.session.start('正在导出纠错标签', lambda job: job.rea('memory', '--export-labels', dest),
                               lambda _: self.show('tools', '纠错标签已导出', location=dest))

    def evaluate(self, _):
        path = self.session.choose('yaml')
        if path:
            dest = self.session.export_dir('标注集评测')
            self.session.start('正在评测标注集', lambda job: job.rea('eval', path, '-o', dest, quiet=True),
                               lambda text: self.show('tools', '标注集评测已完成', text=text, location=dest))

    def export_analysis(self, _):
        project = self.session.project_required()
        dest = self.session.choose('json_save', directory=project.folder, name='视频分析.json')
        if dest in (project.path, project.state_file):
            raise ValueError('请为导出的分析数据选择新的文件名。')
        if dest:
            with self.session.lock:
                self.current(project)
                self.session.start('正在导出视频分析', lambda job: job.rea('capsule', project.path, '-o', dest),
                                   lambda _: self.show('tools', '视频分析 JSON 已导出', location=dest))

    def backend_location(self):
        value = self.session.config.get('capsule_root')
        if not value or not (Path(value) / 'lib').is_dir():
            raise ValueError('请先在设置里选择已安装的生成后端目录。')
        capsule = Path(value).resolve()
        interpreter = Path(self.session.config.get('capsule_python') or capsule / '.venv/Scripts/python.exe')
        if not interpreter.is_file():
            raise ValueError('找不到生成后端的 Python，请在设置中选择解释器。')
        return capsule, interpreter

    def draft(self, _):
        project = self.session.project_required()
        capsule, interpreter = self.backend_location()
        self.session.start('正在导出复刻配方', lambda job: job.rea('capsule-draft', project.path,
                           '--capsule-root', capsule, '--python', interpreter, quiet=True),
                           lambda text: self.show('tools', '复刻配方草稿', text=text, location=project.folder))

    def runtime(self, _):
        self.session.start('正在检查本机环境', check_runtime, lambda text: self.show('tools', '本机运行环境', text=text))

    def save_matches(self, project, matches, title, location):
        with self.session.lock:
            self.current(project)
            before = project.replacements.copy()
            project.replacements.update(matches)
            try:
                project.save()
            except OSError:
                project.replacements.clear()
                project.replacements.update(before)
                raise
            lines = '\n'.join(f'镜头 {key.zfill(2)}  ·  {Path(path).name}' for key, path in matches.items())
            self.session.status = self.show('timeline', f'{title} {len(matches)} 个镜头', text=lines, location=location)

    def batch_clips(self, _):
        project = self.session.project_required()
        folder = self.session.choose('folder', directory=project.folder)
        if folder:
            self.save_matches(project, match_clip_names(project, folder), '已匹配', folder)

    def import_results(self, _):
        project = self.session.project_required()
        file = self.session.choose('json', directory=project.folder / 'remake')
        if file:
            self.save_matches(project, read_clip_results(project, file), '已导入', file)

    def open_exports(self, _):
        project = self.session.project_required()
        final = next((Path(path) for path in project.state.get('last_exports', []) if Path(path).is_file()), None)
        if not final:
            raise ValueError('当前项目还没有可用的成片。')
        return self.session.open_result(final.parent, '已打开成片目录')

    def references(self, data):
        with self.session.lock:
            project = self.session.project_required()
            key = self.shot(project, data)
            choices = project.references.get(key, {})
            result = {}
            for role in ('first', 'last'):
                original = project.source_asset(key, role + '_frame')
                if original and not original.is_relative_to(project.folder):
                    original = None
                chosen = Path(choices[role]) if choices.get(role) else None
                current = chosen if chosen and chosen.suffix.lower() in IMAGE_TYPES else original
                result[role] = dict(original=self.session.asset(original), image=self.session.asset(current),
                                    name=chosen.name if chosen else '', missing=bool(chosen and not chosen.is_file()))
            return result

    def set_reference(self, data):
        project = self.session.project_required()
        key = self.shot(project, data)
        role = data.get('role')
        if role not in ('first', 'last'):
            raise ValueError('请选择首帧或尾帧。')
        reset = data.get('reset') is True
        path = None if reset else self.session.choose('image', directory=project.folder)
        if not path and not reset:
            return
        if path and (not path.is_file() or path.suffix.lower() not in IMAGE_TYPES):
            raise ValueError('请选择可用的图片。')
        with self.session.lock:
            self.current(project)
            choices = project.references.get(key, {}).copy()
            updated = choices.copy()
            if path:
                updated[role] = str(path)
            else:
                updated.pop(role, None)
            if updated:
                project.references[key] = updated
            else:
                project.references.pop(key, None)
            try:
                project.save()
            except OSError:
                if choices:
                    project.references[key] = choices
                else:
                    project.references.pop(key, None)
                raise
            self.session.status = '生成参考图已更新'
            return self.references(data)

    def jobs_path(self):
        path = self.session.project_required().folder / 'remake/jobs.json'
        if not path.is_file():
            raise ValueError('请先导出生成任务表。')
        return path

    def build_jobs(self, data):
        project = self.session.project_required()
        mode = data.get('mode')
        if mode not in be.MODES.values():
            raise ValueError('请选择生成模式。')
        engine = str(data.get('engine') or '').strip()
        capsule = Path(self.session.config.get('capsule_root') or be.DATA / 'generation').resolve()
        self.session.start('正在导出生成任务', lambda job: build_generation_jobs(job, project, capsule, engine, mode),
                           lambda count: self.show('prompts', f'已导出 {count} 个模型任务', location=self.jobs_path()))

    def generation_spec(self, data):
        path = self.jobs_path()
        spec = be.load_json(path)
        only = self.shot(self.session.project_required(), data) if data.get('only') else ''
        count = sum(item['executor'] == 'capsule_cinema' and (not only or str(item['shot']) == only) for item in spec['jobs'])
        return path, Path(spec['capsule_root']), only, count

    def preview_jobs(self, data):
        path, capsule, only, _ = self.generation_spec(data)
        self.session.start('正在预览生成任务', lambda job: job.preview_generation(path, capsule, only),
                           lambda text: self.show('prompts', '生成任务预览', text=text, location=path))

    def generation_info(self, data):
        path, planned, only, count = self.generation_spec(data)
        capsule, interpreter = self.backend_location()
        if capsule != planned.resolve():
            raise ValueError('生成后端已更换，请重新导出任务表。')
        if not count:
            raise ValueError('所选范围没有可运行的模型生成任务。')
        return path, capsule, interpreter, only, count

    def run_jobs(self, data):
        path, capsule, interpreter, only, count = self.generation_info(data)
        if data.get('confirmed') is not True:
            return {'count': count}
        if data.get('count') != count:
            raise ValueError('可运行的生成任务数量已变化，请重新确认。')
        self.session.start('正在调用视频模型', lambda job: job.rea('remake-run', path, '--capsule-root', capsule,
                           '--python', interpreter, '--only', only, quiet=True),
                           lambda text: self.show('prompts', '生成任务已结束', text=text, location=path.parent))

    def open_jobs(self, _):
        return self.session.open_result(self.jobs_path().parent, '已打开任务目录')

    def project_subtitle(self, key):
        if key == 'ass':
            path = self.session.project_required().folder / 'packaging/overlays.ass'
        else:
            path, _ = self.session.tracks().get(key, (None, ''))
        if not path or not path.is_file():
            raise ValueError('请先选择可用的项目字幕。')
        return path

    def read_subtitle(self, data):
        path = self.project_subtitle(data.get('track'))
        with path.open(encoding='utf-8-sig') as stream, self.session.lock:
            self.session.status = self.show('media', '项目字幕', text=stream.read(48_000), location=path)

    def copy_subtitle(self, data):
        path = self.project_subtitle(data.get('track'))
        dest = self.session.choose(path.suffix[1:].lower() + '_save', name=path.name)
        if dest and dest != path:
            with self.session.lock:
                self.session.idle()
                shutil.copyfile(path, dest)
                self.session.status = self.show('media', '字幕文件已保存', location=dest)

    def transcribe(self, data):
        source = self.media_source('media')
        self.session.transcribe(data, source=source,
                                complete=lambda path: self.show('media', '口播字幕已导出', location=path))

    def separate(self, _):
        source = self.media_source('media')
        self.session.separate(source=source, complete=lambda path: self.show(
            'media', '音轨分离已完成', location=path, audio=self.session.stem_assets(path)))

    def burn(self, data):
        source = self.media_source('media')
        if source.suffix.lower() not in be.VIDEO_EXTENSIONS:
            raise ValueError('压制字幕需要视频文件。')
        captions = self.project_subtitle(data['track']) if data.get('track') else self.inputs.get('caption')
        if not captions or not captions.is_file():
            raise ValueError('请选择外部 SRT / ASS 或项目字幕轨。')
        self.session.burn(None, source=source, captions=captions,
                          complete=lambda path: self.show('media', '带字幕视频已导出', location=path, video=path))
