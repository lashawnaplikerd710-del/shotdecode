"""Command-line access to the same analysis and project files used by ShotDecode."""
from __future__ import annotations

import argparse
import json
import math
import sys
import tempfile
from pathlib import Path

# The installed runtime also starts this entry point in Python's isolated mode.
sys.path.insert(0, str(Path(__file__).resolve().parent))

import backend as be
import link_download
import spoken_translation as mt
from workflows import run_analysis


def project_at(value):
    path = Path(value).expanduser().resolve()
    if path.is_dir():
        path /= 'breakdown.json'
    elif path.name in ('report.md', 'report.html'):
        path = path.with_name('breakdown.json')
    if not path.is_file():
        raise ValueError('请选择拆解项目目录或 breakdown.json。')
    return be.Project(path)


def available(path):
    return str(path) if path and path.is_file() else None


def project_files(project):
    folder = project.folder
    return dict(project=str(project.path), source=str(project.source),
                report=available(folder / 'report.md'), html=available(folder / 'report.html'),
                storyboard=available(folder / 'storyboard.jpg'),
                translations=available(folder / mt.RESULT))


def analyze(args, job):
    target = Path(args.result_file).expanduser().resolve() if args.result_file else None
    if target and (target.suffix.lower() != '.json' or target.exists()):
        raise ValueError('请选择一个新的 JSON 结果索引文件。')
    if not (be.FFMPEG.is_file() and be.FFPROBE.is_file()):
        raise ValueError('找不到 ShotDecode 的 FFmpeg 和 FFprobe。请使用安装目录或按源码说明准备运行环境。')
    source = Path(args.input).expanduser()
    if source.is_file():
        source = source.resolve()
    else:
        link_download.parse_video_link(args.input)
        imports = be.DATA / 'imports'
        imports.mkdir(exist_ok=True)
        directory = Path(tempfile.mkdtemp(prefix='agent-link-', dir=imports))
        try:
            source = link_download.download_video(args.input, directory, progress=job.emit,
                                                  check=job.check, ffmpeg=be.FFMPEG)
        finally:
            if not any(directory.iterdir()):
                directory.rmdir()

    settings = be.load_json(be.SETTINGS_FILE, {})
    output = args.output or be.project_output_dir(settings.get('output'))
    options = dict(report_language=args.report_language,
                   ocr_language=args.ocr_language or ('ja' if settings.get('ocr_language') in ('ja', '日文') else 'zh'),
                   ocr=not args.no_ocr, packaging=not args.no_packaging, stems=args.stems,
                   vlm=False, engine=settings.get('engine') or 'seedance2.0')
    folder = be.new_folder(Path(output).expanduser().resolve(), source.stem)
    status = run_analysis(job, source, folder, options)
    job.check()
    result = project_files(be.Project(folder / 'breakdown.json'))
    result['status'] = status
    if target:
        be.write_json(target, result)
    return result


def inspect_project(args, _job):
    project = project_at(args.project)
    data = project.data
    selected = project.shots
    if args.shot is not None:
        key = str(args.shot)
        if key not in selected:
            raise ValueError('找不到指定镜头。请先查看项目里的镜头编号。')
        selected = {key: selected[key]}
    elif args.at is not None:
        selected = {key: shot for key, shot in selected.items() if shot['start'] <= args.at < shot['end']}
        if not selected:
            raise ValueError('指定时间不在分镜内。')
    shots = []
    for key, shot in selected.items():
        base = shot.get('base', {})
        row = dict(index=shot['index'], start=shot['start'], end=shot['end'],
                   type=base.get('label_zh') or be.LABELS.get(base.get('label'), base.get('label')),
                   confidence=base.get('confidence'),
                   frames={name: file for name in shot.get('assets', {})
                           if (file := available(project.source_asset(key, name)))})
        if args.shot is not None or args.at is not None:
            opinion = shot.get('review') or shot.get('vlm') or {}
            row.update(description=opinion.get('description'), evidence=base.get('evidence'),
                       prompt=project.prompts.get(key) or be.suggested_prompt(project, key))
        shots.append(row)
    return dict(**project_files(project), name=project.name, duration=data['source'].get('duration'),
                summary=data.get('summary', {}).get('verdict'), shots=shots)


def subtitles(args, _job):
    project = project_at(args.project)
    result = be.load_json(project.folder / mt.RESULT, {})
    rows = []
    for key, language, *_ in mt.SECTION_INFO:
        for line in result.get(key, []):
            rows.append(dict(kind='screen' if key == 'english_screen' else 'speech',
                             start=line['start'], end=line['end'], language=language,
                             original=line.get(language), chinese=line.get('zh')))
    translated = {(row['start'], row['end'], row['original']) for row in rows if row['kind'] == 'screen'}
    for cue in (project.data.get('packaging') or {}).get('text_cues', []):
        start, end, wording = cue.get('t0'), cue.get('t1'), cue.get('text')
        if isinstance(start, (int, float)) and isinstance(end, (int, float)) and wording:
            if (start, end, wording) not in translated:
                rows.append(dict(kind='screen', start=start, end=end, original=wording))
    for cue in be.load_json(project.folder / be.MANUAL_CAPTIONS_FILE, []):
        rows.append(dict(kind='manual', start=cue['start'], end=cue['end'], original=cue['text']))
    rows = [row for row in rows if (args.start is None or row['end'] > args.start)
            and (args.end is None or row['start'] < args.end)]
    return dict(**project_files(project), notes=result.get('notes', []),
                subtitles=sorted(rows, key=lambda row: (row['start'], row['end'])))


def frames(args, job):
    path = Path(args.input).expanduser().resolve()
    source = project_at(path).source if path.is_dir() or path.suffix.lower() in ('.json', '.html', '.md') else path
    if not source.is_file():
        raise ValueError('原视频已移动。请重新定位原片，或提供视频文件。')
    output = be.new_folder(be.DATA / 'agent-frames', source.stem) / 'frames.jpg'
    command = ['tiles', source, '--start', args.start, '--every', args.every, '--max', 36, '-o', output]
    if args.end is not None:
        command += ['--end', args.end]
    result = json.loads(job.rea(*command, quiet=True))
    if not result.get('tiles'):
        raise ValueError('该时段没有抽到画面。请核对视频时长和范围。')
    return result


def seconds(value):
    number = float(value)
    if not math.isfinite(number) or number < 0:
        raise argparse.ArgumentTypeError('请输入非负的秒数。')
    return number


def main(argv=None):
    parser = argparse.ArgumentParser(prog='shotdecode', description='拆解本地视频或短视频链接，读取项目、字幕和分镜画面。结果输出为 JSON。')
    commands = parser.add_subparsers(required=True)
    run = commands.add_parser('analyze', help='生成拆解项目和报告')
    run.add_argument('input', help='本地视频路径，或抖音/TikTok 链接或分享文案')
    run.add_argument('-o', '--output', type=Path, help='项目父目录，默认使用工作台设置')
    run.add_argument('--ocr-language', choices=('zh', 'ja'), help='画面文字识别语言，口播仍自动识别')
    run.add_argument('--report-language', choices=('zh', 'en'), default='zh')
    run.add_argument('--no-ocr', action='store_true')
    run.add_argument('--no-packaging', action='store_true')
    run.add_argument('--stems', action='store_true', help='同时分离人声、配乐和原声')
    run.add_argument('--result-file', type=Path, help='额外写入结果索引 JSON')
    run.set_defaults(run=analyze)
    view = commands.add_parser('inspect', help='读取已有项目和分镜')
    view.add_argument('project')
    choose = view.add_mutually_exclusive_group()
    choose.add_argument('--shot', type=int)
    choose.add_argument('--at', type=seconds, help='定位到该秒数所在的镜头')
    view.set_defaults(run=inspect_project)
    text = commands.add_parser('subtitles', help='查看口播、画面文字、手动字幕与已有中译')
    text.add_argument('project')
    text.add_argument('--start', type=seconds)
    text.add_argument('--end', type=seconds)
    text.set_defaults(run=subtitles)
    images = commands.add_parser('frames', help='按时间抽帧，返回时间戳和图片位置')
    images.add_argument('input', help='视频路径或项目')
    images.add_argument('--start', type=seconds, default=0)
    images.add_argument('--end', type=seconds)
    images.add_argument('--every', type=seconds, default=0.5)
    images.set_defaults(run=frames)
    args = parser.parse_args(argv)
    if getattr(args, 'every', 1) <= 0 or (getattr(args, 'start', None) is not None
            and getattr(args, 'end', None) is not None and args.end <= args.start):
        parser.error('结束时间须晚于开始时间，抽帧间隔须大于 0。')
    job = be.Job(lambda line: print(line, file=sys.stderr, flush=True))
    try:
        print(json.dumps(args.run(args, job), ensure_ascii=False, indent=2))
    except KeyboardInterrupt:
        job.cancel()
        print('任务已停止。', file=sys.stderr)
        return 130
    except (OSError, ValueError, RuntimeError, be.Cancelled) as exc:
        print(str(exc) or '任务未完成。', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
