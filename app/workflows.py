from __future__ import annotations

import json
import re
from pathlib import Path

import backend as be
import spoken_translation as mt


def run_analysis(job, source, output, options, *, env_file=None, extra_env=None, meta=None):
    args = ['decompose', source, '-o', output, '--lang', options['report_language'],
            '--ocr-lang', options['ocr_language'], '--vlm' if options.get('vlm') else '--no-vlm']
    if meta:
        args += ['--meta', meta]
    for option, flag in (('ocr', '--no-ocr'), ('packaging', '--no-packaging'), ('stems', '--no-stems')):
        if not options.get(option, True):
            args.append(flag)
    engine = options.get('engine', '').strip()
    if engine:
        args += ['--engine', engine]
    job.rea(*args, env_file=env_file, extra_env=extra_env)
    data = be.load_json(output / 'breakdown.json')
    stem_result = data.get('stems') or {}
    stem_note = ''
    if options.get('stems', True) and data.get('source', {}).get('has_audio') and not stem_result.get('ok'):
        job.emit(f'已继续拆解并保留原声音轨。分轨未完成 · {stem_result.get("reason") or "见前面的任务日志"}')
        stem_note = ' · 分轨未完成，已保留原声'
    try:
        count, incomplete = mt.translate_report(job, source, output, data)
    except (ValueError, RuntimeError, OSError) as exc:
        job.check()
        job.emit(f'报告中译未完成 · {exc}')
        incomplete = True
    if incomplete:
        return '拆解完成 · 译文待补，见任务日志' + stem_note
    status = f'拆解完成 · 已写入 {count} 条中译' if count else '视频拆解已完成'
    return status + stem_note


def supplement_translation(job, project):
    count, incomplete = mt.translate_report(job, project.source, project.folder, project.data)
    if incomplete:
        return '报告已更新 · 译文待补，见任务日志'
    return f'报告已更新 · {count} 条中译' if count else '未识别到可翻译的英文画面文字或英、日语口播'


def refresh_project_report(job, project, args):
    job.rea(*args)
    mt.refresh_reports(project.folder)


def verify_original(job, file, source):
    info = json.loads(job.rea('probe', file, quiet=True))
    if (abs(float(info['duration']) - float(source['duration'])) > 0.15
            or (info['width'], info['height']) != (source['width'], source['height'])):
        raise ValueError('选中的视频时长或分辨率与原项目不符。')


def match_clip_names(project, folder):
    matches = {}
    for file in sorted(folder.iterdir()):
        if file.is_file() and file.suffix.lower() in ('.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v'):
            match = re.fullmatch(r'(?:shot[_ -]?)?0*(\d+)', file.stem, re.IGNORECASE)
            if match and match[1] in project.shots:
                matches.setdefault(match[1], str(file.resolve()))
    if not matches:
        raise ValueError('没有找到可匹配的文件。请使用 shot_004.mp4 或 004.mp4 这样的文件名。')
    return matches


def read_clip_results(project, chosen):
    data = be.load_json(chosen)
    if not isinstance(data, dict) or not isinstance(data.get('results'), dict):
        raise ValueError('请选择生成任务输出的 results.json。')
    matches = {}
    for key, record in data['results'].items():
        if key not in project.shots or not isinstance(record, dict) or not isinstance(record.get('video'), str):
            continue
        if not record['video']:
            continue
        path = chosen.parent / Path(record['video']).expanduser()
        if path.is_file():
            matches[key] = str(path.resolve())
    if not matches:
        raise ValueError('结果文件里没有与当前项目匹配的可用视频。')
    return matches


def build_generation_jobs(job, project, capsule, engine, mode):
    prompts = project.prompts.copy()
    references = {key: value.copy() for key, value in project.references.items()}
    path = job.build_generation_plan(project, capsule, engine, mode)
    spec = be.load_json(path)
    count = 0
    for item in spec['jobs']:
        if item['executor'] != 'capsule_cinema':
            continue
        count += 1
        key = str(item['shot'])
        params = item['params']
        if prompts.get(key):
            params['prompt'] = prompts[key]
            item['prompt_source'] = 'workbench'
        refs = references.get(key, {})
        first = 'image_path' if 'image_path' in params else 'start_image_path'
        for role, field in (('first', first), ('last', 'end_image_path')):
            if field in params and role in refs:
                if not Path(refs[role]).is_file():
                    raise ValueError(f'镜头 {key} 的参考图已经移动。')
                params[field] = refs[role]
    job.check()
    be.write_json(path, spec)
    job.emit(f'已导出 {count} 个模型生成任务，另保留原片或本地静图任务。')
    return count


def check_runtime(job):
    versions = job.run([be.PYTHON, '-I', '-X', 'utf8', '-c',
                        'import sys, rea_video, cv2, onnxruntime; '
                        'print("Python", sys.version.split()[0]); print("分析引擎", rea_video.__version__); '
                        'print("OpenCV", cv2.__version__); print("ONNX Runtime", onnxruntime.__version__)'], quiet=True)
    ffmpeg = job.run([be.FFMPEG, '-version'], quiet=True).splitlines()[0]
    checks = (('中英口播模型', be.speech_model_ready('zh')), ('多语言口播模型', be.speech_model_ready('auto')),
              ('日语 OCR 模型', be.JAPANESE_OCR_MODEL.is_file()), ('报告自动中译', mt.ready()))
    return versions + ffmpeg + ''.join(f'\n{name} {"已就绪" if ready else "缺少文件"}' for name, ready in checks)
