from __future__ import annotations

import ctypes
import hashlib
import http.client
import json
import os
import queue
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import tkinter as tk
import urllib.request
import zipfile
from contextlib import contextmanager
from pathlib import Path
from tkinter import messagebox, ttk
from typing import NamedTuple

from app_identity import APP_NAME, has_webview2
from ffmpeg_location import BINARIES, ffmpeg_directory


HOME = Path(__file__).resolve().parent.parent
TOOLS = HOME / 'ffmpeg'
VERSION = '9.0.2'
RELEASE = f'https://github.com/GyanD/codexffmpeg/releases/tag/{VERSION}'
PREFIX = f'ffmpeg-{VERSION}-essentials_build'
ARCHIVE_NAME = PREFIX + '.zip'
ARCHIVE_SIZE = 114768076
ARCHIVE_SHA256 = '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba'
VC_DOWNLOAD = 'https://aka.ms/vc14/vc_redist.x64.exe'
WEBVIEW_DOWNLOAD = 'https://go.microsoft.com/fwlink/?LinkId=2124701'
VC_INSTALLER = 'vc_redist.x64.exe'
WEBVIEW_INSTALLER = 'MicrosoftEdgeWebView2RuntimeInstallerX64.exe'


class Model(NamedTuple):
    title: str
    path: str
    url: str
    size: int
    sha256: str

    def ready(self):
        path = HOME / self.path
        return path.is_file() and path.stat().st_size == self.size


MODELS = (
    Model('英文和日文转写', 'asr-model-ja/model.int8.onnx',
          'https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/resolve/'
          '2365baeacb507f821a0c8120fcee3d484dba7a07/model.int8.onnx',
          239233841, 'c71f0ce00bec95b07744e116345e33d8cbbe08cef896382cf907bf4b51a2cd51'),
    Model('中文口播转写', 'asr-model/model.int8.onnx',
          'https://huggingface.co/csukuangfj/sherpa-onnx-paraformer-zh-small-2024-03-09/resolve/'
          '63ddc3cd0f2810b68289a7b3876e62ef5d53d6df/model.int8.onnx',
          81828675, '3ef6c19369b912f7caf3cef8e545c5ccd1a33d9d7ec792a46668dc41c4b229ec'),
    Model('英文和日文翻译成中文', 'translation/Hy-MT2-1.8B-Q4_K_M.gguf',
          'https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF/resolve/'
          'a0c709d9fac510f2c807aa3af52872340dc37a4a/Hy-MT2-1.8B-Q4_K_M.gguf',
          1133080448, 'dc5f44fcf1fa496ee7ad725982c0c8c553a4de00259b53af84c4b89fb0c06699'),
    Model('人声与配乐分轨', 'models/UVR-MDX-NET-Inst_HQ_3.onnx',
          'https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models/UVR-MDX-NET-Inst_HQ_3.onnx',
          66759214, '317554b07fe1ea5279a77f2b1520a41ea4b93432560c4ffd08792c30fddf9adc'),
)


class SetupCancelled(Exception):
    pass


def tools_ready():
    return ffmpeg_directory(HOME) is not None


def official_asset(filename):
    return f'https://github.com/GyanD/codexffmpeg/releases/download/{VERSION}/{filename}'


def download_file(url, destination, progress, check, *, label, limit, size=0):
    check()
    progress(label, 0, size)
    digest = hashlib.sha256()
    written = 0
    updated = time.monotonic()
    request = urllib.request.Request(url, headers={'User-Agent': 'ShotDecode/1.0'})
    with urllib.request.urlopen(request, timeout=15) as response, destination.open('wb') as target:
        length = response.headers.get('Content-Length', '')
        total = size or (int(length) if length.isdecimal() else 0)
        if total > limit:
            raise ValueError('下载文件大小超出预期。')
        while chunk := response.read(256 * 1024):
            check()
            written += len(chunk)
            if written > limit:
                raise ValueError('下载文件大小超出预期。')
            digest.update(chunk)
            target.write(chunk)
            if time.monotonic() - updated >= 0.1 or written == total:
                progress(label, written, total)
                updated = time.monotonic()
    if total and written != total:
        raise ValueError('下载未完成。')
    return digest.hexdigest()


def download_archive(destination, size, expected, progress, check):
    filename = destination.name
    official = official_asset(filename)
    urls = (official, f'https://www.gyan.dev/ffmpeg/builds/packages/{filename}')
    failure = None
    for url in urls:
        try:
            digest = download_file(url, destination, progress, check, label='正在下载 FFmpeg…', limit=size, size=size)
            if digest == expected:
                return
            raise ValueError('下载校验未通过。')
        except (OSError, ValueError, http.client.HTTPException) as exc:
            failure = exc
    raise OSError(f'未能下载 FFmpeg {VERSION}。可从发布页下载 {filename}，放进软件安装目录后重试。') from failure


def install_ffmpeg(progress, check=lambda: None):
    if tools_ready():
        return
    local = HOME / ARCHIVE_NAME
    with tempfile.TemporaryDirectory(prefix='rea-ffmpeg-', dir=HOME) as scratch:
        scratch = Path(scratch)
        archive = scratch / ARCHIVE_NAME
        if local.is_file():
            progress('正在校验已下载的 FFmpeg…', 0, 0)
            with local.open('rb') as stream:
                correct = (local.stat().st_size == ARCHIVE_SIZE
                           and hashlib.file_digest(stream, 'sha256').hexdigest() == ARCHIVE_SHA256)
            if not correct:
                raise ValueError(f'{local.name} 校验未通过。请重新下载发布页上对应的文件。')
            archive = local
        else:
            download_archive(archive, ARCHIVE_SIZE, ARCHIVE_SHA256, progress, check)

        check()
        progress('正在解压视频工具…', 0, 0)
        members = [(f'{PREFIX}/bin/{name}', name) for name in BINARIES]
        members += [(f'{PREFIX}/LICENSE', 'LICENSE')]
        with zipfile.ZipFile(archive) as source:
            for entry, name in members:
                check()
                with source.open(entry) as stream, (scratch / name).open('wb') as target:
                    shutil.copyfileobj(stream, target, 1024 * 1024)

        check()
        TOOLS.mkdir(exist_ok=True)
        for _, name in reversed(members):
            dest = TOOLS / name
            (scratch / name).replace(dest)


def install_models(models, progress, check):
    failures = []
    for model in models:
        check()
        if model.ready():
            continue
        target = HOME / model.path
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            with tempfile.TemporaryDirectory(prefix='shotdecode-model-', dir=target.parent) as scratch:
                staged = Path(scratch) / target.name
                digest = download_file(model.url, staged, progress, check, label=f'正在下载{model.title}…',
                                       limit=model.size, size=model.size)
                if digest != model.sha256:
                    raise ValueError('文件校验未通过')
                check()
                staged.replace(target)
        except (OSError, ValueError, http.client.HTTPException) as error:
            failures.append(f'{model.title}（{error}）')
    if failures:
        raise OSError('以下模型安装未完成。可以重试，已下载的模型会保留。\n\n' + '\n'.join(failures))


def vc_runtime_ready():
    # Probe in a child process so an existing DLL can be replaced by Microsoft's installer.
    check_dlls = "from ctypes import WinDLL; WinDLL('msvcp140.dll'); WinDLL('msvcp140_1.dll')"
    probe = subprocess.run([HOME / 'runtime/python.exe', '-I', '-c', check_dlls],
                           stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           creationflags=subprocess.CREATE_NO_WINDOW, timeout=15, check=False)
    return probe.returncode == 0


def installer_command(installer, command, timeout=None):
    powershell = Path(os.environ['SystemRoot']) / 'System32/WindowsPowerShell/v1.0/powershell.exe'
    env = dict(os.environ, VIDEO_WORKBENCH_INSTALLER=str(installer), PSModulePath=str(powershell.parent / 'Modules'))
    result = subprocess.run([powershell, '-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
                            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                            env=env, creationflags=subprocess.CREATE_NO_WINDOW, timeout=timeout, check=False)
    return result.returncode & 0xffffffff


def verify_microsoft_installer(installer):
    command = """
        $sig = Get-AuthenticodeSignature -LiteralPath $env:VIDEO_WORKBENCH_INSTALLER
        if ($sig.Status -ne 'Valid' -or $null -eq $sig.SignerCertificate) { exit 1 }
        if ($sig.SignerCertificate.GetNameInfo('SimpleName', $false) -ne 'Microsoft Corporation') { exit 2 }
        exit 0
    """
    if installer_command(installer, command, timeout=90):
        raise ValueError('微软安装程序的数字签名校验失败。可点「微软官方下载」手动安装。')


@contextmanager
def prerequisite_installer(filename, url, progress, check):
    bundled = HOME / 'prerequisites' / filename
    if bundled.is_file():
        check()
        progress('正在校验随包提供的离线安装程序…', 0, 0)
        try:
            manifest = json.loads((HOME / 'app/prerequisite-checksums.json').read_text(encoding='utf-8'))
            with bundled.open('rb') as stream:
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            if digest != manifest.get(filename):
                raise ValueError('安装程序校验不一致。')
        except (OSError, ValueError) as error:
            raise ValueError('离线组件校验失败，请重新完整解压安装包。') from error
        check()
        yield bundled
        return
    with tempfile.TemporaryDirectory(prefix='workbench-setup-') as scratch:
        installer = Path(scratch) / filename
        try:
            download_file(url, installer, progress, check, label='正在从微软下载运行库…', limit=512 * 1024 * 1024)
        except (OSError, ValueError, http.client.HTTPException) as error:
            check()
            raise OSError('下载运行库失败。请检查网络，或点「微软官方下载」手动安装。') from error
        check()
        progress('正在校验微软数字签名…', 0, 0)
        verify_microsoft_installer(installer)
        check()
        yield installer


def install_vc_runtime(progress, check):
    with prerequisite_installer(VC_INSTALLER, VC_DOWNLOAD, progress, check) as installer:
        progress('请在 Windows 权限窗口确认，等待微软安装程序完成。', 0, 0)
        code = installer_command(installer, """
            try {
                $setup = Start-Process -FilePath $env:VIDEO_WORKBENCH_INSTALLER -Verb RunAs `
                    -ArgumentList '/install','/passive','/norestart' -Wait -PassThru -ErrorAction Stop
                exit $setup.ExitCode
            } catch {
                $failure = $_.Exception
                while ($null -ne $failure) {
                    if ($failure -is [System.ComponentModel.Win32Exception]) { exit $failure.NativeErrorCode }
                    $failure = $failure.InnerException
                }
                exit 1
            }
        """)
        check()
        if vc_runtime_ready():
            return
        if code == 3010:
            raise OSError('微软安装程序要求重启 Windows。请重启后再次打开工作台。')
        if code in (1223, 1602, 0x800704c7, 0x80070642):
            raise OSError('安装已取消。你可以重新点「下载并安装」，或手动安装。')
        raise OSError(f'安装后仍无法加载 x64 运行库（安装退出码 {code}）。请打开微软安装程序并选择「修复」。')


def install_webview_runtime(progress, check):
    with prerequisite_installer(WEBVIEW_INSTALLER, WEBVIEW_DOWNLOAD, progress, check) as installer:
        progress('正在安装 WebView2，工作台将在准备完成后打开。', 0, 0)
        code = installer_command(installer, """
            $setup = Start-Process -FilePath $env:VIDEO_WORKBENCH_INSTALLER `
                -ArgumentList '/silent','/install' -Wait -PassThru -ErrorAction Stop
            exit $setup.ExitCode
        """)
        check()
        if not has_webview2():
            raise OSError(f'WebView2 安装未完成（退出码 {code}）。可重新安装或重启 Windows 后再试。')


def prepare_window(*, runtime=False, webview=False, models=False, automatic=False):
    missing = [model for model in MODELS if not model.ready()] if models else []
    if models and not missing:
        return True

    root = tk.Tk()
    microsoft = runtime or webview
    title = ('安装本地模型' if models else '准备 WebView2' if webview
             else '准备微软运行库' if runtime else '准备 FFmpeg')
    root.title(f'{APP_NAME} · {title}')
    icon = HOME / 'app/workbench.ico'
    if icon.is_file():
        root.iconbitmap(str(icon))

    root.resizable(False, False)
    panel = ttk.Frame(root, padding=(23, 18))
    panel.pack(fill='both', expand=True)
    font = 'Microsoft YaHei UI'
    ttk.Label(panel, text=title, font=(font, 16, 'bold')).pack(anchor='w')
    installer = WEBVIEW_INSTALLER if webview else VC_INSTALLER
    offline = microsoft and (HOME / 'prerequisites' / installer).is_file()
    action_text = '安装离线组件' if offline else '在线安装'
    if models:
        intro = ('按需安装转写、翻译和分轨模型。可以先开始剪辑，'
                 '稍后从开始菜单打开「ShotDecode 组件安装」。')
    elif webview:
        intro = f'软件界面需要 Microsoft Edge WebView2。请选择「{action_text}」，也可以从微软下载后手动安装。'
    elif runtime:
        intro = f'这台电脑需要 Microsoft Visual C++ x64 运行库。请选择「{action_text}」，并在 Windows 权限窗口确认。'
    else:
        intro = (f'视频预览、拆解和导出需要 FFmpeg。可在线下载约 {ARCHIVE_SIZE / 1_000_000:.0f} MB，'
                 f'也可以从发布页下载 {ARCHIVE_NAME}，放进软件安装目录后重试。')

    label = tk.StringVar(value=intro)
    wrap = int(min(root.winfo_screenwidth() - 80, 560 * root.winfo_fpixels('1i') / 96))
    ttk.Label(panel, textvariable=label, font=(font, 9), wraplength=wrap,
              justify='left').pack(anchor='w', pady=(9, 8))
    choices = [(model, tk.BooleanVar(value=True)) for model in missing]
    actions = []
    for model, selected in choices:
        choice = ttk.Checkbutton(panel, text=f'{model.title}（{model.size / 1_000_000:.0f} MB）',
                                 variable=selected)
        choice.pack(anchor='w', pady=(0, 4))
        actions.append(choice)
    bar = ttk.Progressbar(panel, mode='determinate')
    bar.pack(fill='x', pady=(4, 0))
    buttons = ttk.Frame(panel)
    buttons.pack(fill='x', pady=(14, 0))

    stop = threading.Event()
    messages = queue.Queue()
    succeeded = False
    active = False
    worker = None
    poll_task = None
    job = install_webview_runtime if webview else install_vc_runtime if runtime else install_ffmpeg
    ready = has_webview2 if webview else vc_runtime_ready if runtime else tools_ready

    def finish(success):
        nonlocal poll_task, succeeded
        succeeded = success
        if poll_task is not None:
            root.after_cancel(poll_task)
            poll_task = None
        root.destroy()

    def cancel():
        if not active:
            finish(False)
            return
        stop.set()
        button.state(['disabled'])
        label.set('正在停止…')

    def check():
        if stop.is_set():
            raise SetupCancelled

    def prepare(selected_models):
        def progress(*event):
            messages.put(('progress', event))

        try:
            if models:
                install_models(selected_models, progress, check)
            else:
                job(progress, check)
        except SetupCancelled:
            messages.put(('finished', False))
        except Exception as exc:
            messages.put(('error', str(exc)))
        else:
            messages.put(('finished', True))

    def begin():
        nonlocal active, worker
        if active:
            return
        selected_models = [model for model, selected in choices if selected.get()]
        if models and not selected_models:
            finish(True)
            return
        active = True
        stop.clear()
        for action in actions:
            action.state(['disabled'])
        worker = threading.Thread(target=prepare, args=(selected_models,), daemon=True)
        worker.start()

    def check_installed():
        if ready():
            finish(True)
        else:
            detail = ('安装完成后再点「安装后继续」。如果安装程序要求重启，请重启 Windows。' if microsoft
                      else '也可把 ffmpeg.exe 和 ffprobe.exe 放进安装目录下的 ffmpeg 文件夹。使用 PATH 安装时请重新打开软件。')
            messagebox.showinfo(title, detail, parent=root)

    def poll():
        nonlocal active, poll_task
        poll_task = None
        while not messages.empty():
            kind, data = messages.get_nowait()
            if kind == 'progress':
                if stop.is_set():
                    continue
                text, done, total = data
                label.set(f'{text}  {done / 1_000_000:.1f} / {total / 1_000_000:.1f} MB' if total else text)
                bar.configure(maximum=total or 1, value=done if total else 1)
                continue
            if kind == 'finished' or stop.is_set():
                finish(kind == 'finished' and data)
                return
            messagebox.showerror(f'{title}未完成', data, parent=root)
            active = False
            label.set('可以重新选择模型再试，也可以稍后安装。' if models
                      else '可以重试，也可以手动安装后点「安装后继续」。')
            bar.configure(maximum=1, value=0)
            for action in actions:
                action.state(['!disabled'])
        poll_task = root.after(80, poll)

    button = ttk.Button(buttons, text='稍后安装', command=cancel)
    button.pack(side='right')
    options = [(action_text, begin)]
    if microsoft:
        url = WEBVIEW_DOWNLOAD if webview else VC_DOWNLOAD
        options += [('微软官方下载', lambda: os.startfile(url)), ('安装后继续', check_installed)]
    elif models:
        options.append(('打开软件目录', lambda: os.startfile(HOME)))
    else:
        options += [('FFmpeg 发布页', lambda: os.startfile(RELEASE)),
                    ('打开软件目录', lambda: os.startfile(HOME)), ('安装后继续', check_installed)]
    for text, command in options:
        action = ttk.Button(buttons, text=text, command=command)
        action.pack(side='left', padx=(0, 8))
        actions.append(action)

    root.update_idletasks()
    x = max(0, (root.winfo_screenwidth() - root.winfo_reqwidth()) // 2)
    y = max(0, (root.winfo_screenheight() - root.winfo_reqheight()) // 2)
    root.geometry(f'+{x}+{y}')
    root.protocol('WM_DELETE_WINDOW', cancel)
    poll_task = root.after(50, poll)
    if automatic and offline:
        root.after_idle(begin)
    root.mainloop()
    if worker is not None:
        worker.join()
    poll = None
    return succeeded


def main():
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
    os.environ['REA_WORKBENCH_DATA'] = str(HOME / 'data')
    offline_setup = '--offline-setup' in sys.argv[1:]
    if not vc_runtime_ready() and not prepare_window(runtime=True, automatic=offline_setup):
        return 1
    if not tools_ready() and not prepare_window():
        return 1
    if not has_webview2() and not prepare_window(webview=True, automatic=offline_setup):
        return 1
    if '--prepare-only' in sys.argv[1:] or '--components-only' in sys.argv[1:]:
        if any(not model.ready() for model in MODELS):
            prepare_window(models=True)
        elif '--components-only' in sys.argv[1:]:
            messagebox.showinfo(APP_NAME, '运行组件和本地模型均已安装。')
        return 0

    import studio
    return studio.main()



if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        ctypes.windll.user32.MessageBoxW(None, str(error), f'{APP_NAME} · 启动失败', 0x10)
        raise SystemExit(1)
