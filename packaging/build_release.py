from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGING = ROOT / 'packaging'
IGNORE_DIRS = {'__pycache__', '.git', 'node_modules', 'agent-runtime', 'agent-connectors'}
COMPONENT_DIRS = ('runtime', 'ffmpeg', 'prerequisites', 'models', 'asr-model',
                  'asr-model-ja', 'asr-packages', 'translation', 'licenses')


def sha256(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def copy_tree(source, destination, *, omit=()):
    if not source.is_dir():
        raise FileNotFoundError(source)
    for folder, dirs, files in os.walk(source):
        current = Path(folder)
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and
                   (current / d).relative_to(source).as_posix() not in omit]
        for name in files:
            path = current / name
            relative = path.relative_to(source)
            if name.startswith('.env') or path.suffix in ('.pyc', '.pyo', '.log'):
                continue
            if not path.resolve(strict=True).is_relative_to(source):
                raise ValueError(f'File points outside the input directory: {relative}')
            target = destination / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)


def run(argv, work):
    subprocess.run(list(map(str, argv)), cwd=work, check=True)


def main():
    parser = argparse.ArgumentParser(description='Build the full offline Windows installer.')
    parser.add_argument('--components', type=Path, required=True, help='Prepared x64 runtime and offline components')
    parser.add_argument('--compiler', type=Path, required=True, help='Path to ISCC.exe')
    parser.add_argument('--output', type=Path, required=True, help='New directory for staging and release files')
    args = parser.parse_args()
    components = args.components.resolve(strict=True)
    compiler = args.compiler.resolve(strict=True)
    work = args.output.resolve()
    work.mkdir(parents=True)
    payload = work / 'payload'
    release = work / 'release'
    payload.mkdir()
    release.mkdir()

    sys.path.insert(0, str(ROOT / 'app'))
    from app_identity import APP_VERSION
    from portable_start import MODELS, VC_INSTALLER, VERSION, WEBVIEW_INSTALLER, verify_microsoft_installer

    print('Staging application and offline components', flush=True)
    copy_tree(ROOT / 'app', payload / 'app')
    for name in COMPONENT_DIRS:
        omit = ('Lib/site-packages/rea_video',) if name == 'runtime' else ()
        copy_tree(components / name, payload / name, omit=omit)
    engine = ROOT / 'third_party/rea-video'
    copy_tree(engine / 'rea_video', payload / 'runtime/Lib/site-packages/rea_video')
    license_dir = payload / 'third_party/rea-video'
    license_dir.mkdir(parents=True)
    for name in ('LICENSE', 'NOTICE'):
        shutil.copy2(engine / name, license_dir / name)
    for name in ('LICENSE', 'NOTICE', 'README.md', 'THIRD_PARTY_NOTICES.txt'):
        shutil.copy2(ROOT / name, payload / name)
    copy_tree(ROOT / 'skills/shotdecode', payload / 'skills/shotdecode')

    for model in MODELS:
        path = payload / model.path
        if path.stat().st_size != model.size or sha256(path) != model.sha256:
            raise ValueError(f'Model integrity check failed: {model.path}')
    prerequisites = {}
    for name in (VC_INSTALLER, WEBVIEW_INSTALLER):
        path = payload / 'prerequisites' / name
        verify_microsoft_installer(path)
        prerequisites[name] = sha256(path)
    (payload / 'app/prerequisite-checksums.json').write_text(json.dumps(prerequisites, indent=2), encoding='utf-8')
    ffmpeg = payload / 'ffmpeg/ffmpeg.exe'
    ffprobe = payload / 'ffmpeg/ffprobe.exe'
    configuration = subprocess.check_output([ffmpeg, '-buildconf'], stderr=subprocess.STDOUT, text=True, encoding='utf-8')
    if f'ffmpeg version {VERSION}' not in configuration:
        raise ValueError('FFmpeg version does not match the application.')
    subprocess.run([ffprobe, '-version'], check=True, stdout=subprocess.DEVNULL)
    ffmpeg_licenses = payload / 'licenses/ffmpeg'
    if not (payload / 'ffmpeg/LICENSE').is_file() or not any(ffmpeg_licenses.glob('FFmpeg-*.tar.gz')):
        raise FileNotFoundError('FFmpeg license or corresponding source archive is missing.')
    (ffmpeg_licenses / 'build-configuration.txt').write_text(configuration, encoding='utf-8')

    csc = Path(os.environ['SystemRoot']) / 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
    run([csc, '/nologo', '/codepage:65001', '/target:winexe', '/platform:x64', '/optimize+',
         '/reference:System.Windows.Forms.dll', f'/win32icon:{payload / "app/workbench.ico"}',
         f'/out:{payload / "ShotDecode.exe"}', PACKAGING / 'ShotDecodeLauncher.cs'], work)
    manifest = {path.relative_to(payload).as_posix(): [path.stat().st_size, sha256(path)]
                for path in sorted(payload.rglob('*')) if path.is_file()}
    (work / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False), encoding='utf-8')

    name = f'ShotDecode-Setup-{APP_VERSION}-Windows-x64-Offline'
    print(f'Building {name}', flush=True)
    run([compiler, '/Q', f'/DReleaseVersion={APP_VERSION}', f'/DPayloadDir={payload}',
         f'/DReleaseDir={release}', f'/DReleaseFileName={name}', PACKAGING / 'windows-offline.iss'], work)
    assets = sorted(release.glob(name + '*'))
    if not (release / (name + '.exe')).is_file() or not any(path.suffix == '.bin' for path in assets):
        raise RuntimeError('The compiler did not create the installer and its data files.')
    if any(path.stat().st_size >= 2**31 for path in assets):
        raise RuntimeError('An installer part exceeds the GitHub Releases file size limit.')
    print(json.dumps({'version': APP_VERSION, 'assets': [
        {'file': path.name, 'bytes': path.stat().st_size, 'sha256': sha256(path)} for path in assets]}), flush=True)


if __name__ == '__main__':
    main()
