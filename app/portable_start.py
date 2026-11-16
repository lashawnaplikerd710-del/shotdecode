from __future__ import annotations

import ctypes
import hashlib
import http.client
import json
import os
import queue
import shutil
import subprocess
import tempfile
import threading
import tkinter as tk
import urllib.request
import zipfile
from contextlib import contextmanager
from pathlib import Path
from tkinter import messagebox, ttk

from app_identity import APP_NAME, has_webview2


HOME = Path(__file__).resolve().parent.parent
TOOLS = HOME / 'ffmpeg'
VERSION = '9.0.2'
RELEASE = f'https://github.com/GyanD/codexffmpeg/releases/tag/{VERSION}'
PREFIX = f'ffmpeg-{VERSION}-essentials_build'
ARCHIVE_NAME = PREFIX + '.zip'
ARCHIVE_SIZE = 114768076
ARCHIVE_SHA256 = '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba'
BINARIES = ('ffmpeg.exe', 'ffprobe.exe')
VC_DOWNLOAD = 'https://aka.ms/vc14/vc_redist.x64.exe'
WEBVIEW_DOWNLOAD = 'https://go.microsoft.com/fwlink/?LinkId=2124701'
VC_INSTALLER = 'vc_redist.x64.exe'
WEBVIEW_INSTALLER = 'MicrosoftEdgeWebView2RuntimeInstallerX64.exe'


class SetupCancelled(Exception):
    pass


def tools_ready():
    return all((TOOLS / name).is_file() for name in BINARIES)


def official_asset(filename):
    return f'https://github.com/GyanD/codexffmpeg/releases/download/{VERSION}/{filename}'


def download_file(url, destination, progress, check, *, label, limit, size=0):
    check()
    progress(label, 0, size)
    digest = hashlib.sha256()
    written = 0
    request = urllib.request.Request(url, headers={'User-Agent': 'VideoBreakdownWorkbench/1.0'})
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
            progress(label, written, total)
    if total and written != total:
        raise ValueError('下载未完成。')
    return digest.hexdigest()


def download_archive(destination, size, expected, progress, check):
    filename = destination.name
    official = official_asset(filename)
    urls = (official, 'https://gh-proxy.com/' + official,
            f'https://www.gyan.dev/ffmpeg/builds/packages/{filename}')
    failure = None
    for url in urls:
        try:
            digest = download_file(url, destination, progress, check, label='正在下载 FFmpeg…', limit=size, size=size)
            if digest == expected:
                return
            raise ValueError('下载校验未通过。')
        except (OSError, ValueError, http.client.HTTPException) as exc:
            failure = exc
    raise OSError(f'未能下载 FFmpeg {VERSION}。请检查网络，或按《使用说明》放入官方压缩包。') from failure


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
                correct = local.stat().st_size == ARCHIVE_SIZE and hashlib.file_digest(stream, 'sha256').hexdigest() == ARCHIVE_SHA256
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
            if not dest.is_file():
                try:
                    (scratch / name).replace(dest)
                except PermissionError:
                    if not dest.is_file():
                        raise


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


def prepare_window(*, runtime=False, webview=False):

    root = tk.Tk()
    microsoft = runtime or webview
    title = '准备 WebView2' if webview else '准备微软运行库' if runtime else '准备视频工具'
    root.title(f'{APP_NAME} · {title if microsoft else "首次启动"}')
    bg, ink, muted, font = root.cget('background'), '#202020', '#444444', 'Microsoft YaHei UI'
    if not microsoft:
        from workbench_theme import BG, FONT, INK, MUTED, apply_styles, dark_caption
        root.theme_images = apply_styles(root)
        root.after_idle(lambda: dark_caption(root))
        bg, ink, muted, font = BG, INK, MUTED, FONT
    width, height = (550, 223) if microsoft else (460, 205)
    root.geometry(f'{width}x{height}+{max(0, (root.winfo_screenwidth()-width)//2)}+{max(0, (root.winfo_screenheight()-height)//2)}')
    root.resizable(False, False)
    panel = tk.Frame(root, bg=bg)
    panel.pack(fill='both', expand=True, padx=23, pady=18)
    tk.Label(panel, text=title, bg=bg, fg=ink, font=(font, 16, 'bold')).pack(anchor='w')
    installer = WEBVIEW_INSTALLER if webview else VC_INSTALLER
    offline = microsoft and (HOME / 'prerequisites' / installer).is_file()
    action_text = '安装离线组件' if offline else '下载并安装'
    if webview:
        intro = f'新版工作台需要 Microsoft Edge WebView2。点「{action_text}」后，工作台会继续启动。'
    elif runtime:
        intro = f'这台电脑需要 Microsoft Visual C++ x64 运行库。点「{action_text}」，并在 Windows 权限窗口确认。'
    else:
        intro = '首次启动需要准备 FFmpeg。'
    label = tk.StringVar(value=intro)
    tk.Label(panel, textvariable=label, bg=bg, fg=muted, font=(font, 9), wraplength=width - 50,
             justify='left').pack(anchor='w', pady=(9, 8))
    bar = ttk.Progressbar(panel, mode='determinate')
    bar.pack(fill='x')
    stop = threading.Event()
    messages = queue.Queue()
    succeeded = False
    active = False
    worker = None
    poll_task = None
    actions = []
    job = install_webview_runtime if webview else install_vc_runtime if runtime else install_ffmpeg
    ready = has_webview2 if webview else vc_runtime_ready

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

    def prepare():
        try:
            job(lambda *event: messages.put(('progress', event)), check)
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
        active = True
        stop.clear()
        for action in actions:
            action.state(['disabled'])
        worker = threading.Thread(target=prepare, daemon=True)
        worker.start()

    def check_installed():
        if ready():
            finish(True)
        else:
            messagebox.showinfo(title, '安装完成后再点「安装后继续」。如果安装程序要求重启，请重启 Windows。', parent=root)

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
            if not microsoft:
                finish(False)
                return
            active = False
            label.set('可以重试，也可以手动安装后点「安装后继续」。')
            for action in actions:
                action.state(['!disabled'])
        poll_task = root.after(80, poll)

    button = ttk.Button(panel, text='取消', command=cancel)
    button.pack(side='right', pady=(14, 0))
    if microsoft:
        for text, command in ((action_text, begin), ('微软官方下载', lambda: os.startfile(WEBVIEW_DOWNLOAD if webview else VC_DOWNLOAD)),
                              ('安装后继续', check_installed)):
            action = ttk.Button(panel, text=text, command=command)
            action.pack(side='left', padx=(0, 8), pady=(14, 0))
            actions.append(action)
    else:
        begin()
    root.protocol('WM_DELETE_WINDOW', cancel)
    poll_task = root.after(50, poll)
    root.mainloop()
    if worker is not None:
        worker.join()
    # Release the self-referencing callback on this thread before the next window.
    poll = None
    return succeeded


def main():
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
    os.environ['REA_WORKBENCH_DATA'] = str(HOME / 'data')
    if not vc_runtime_ready() and not prepare_window(runtime=True):
        return 1
    if not tools_ready() and not prepare_window():
        return 1
    if not has_webview2() and not prepare_window(webview=True):
        return 1
    import studio
    return studio.main()


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        ctypes.windll.user32.MessageBoxW(None, str(error), f'{APP_NAME} · 启动失败', 0x10)
        raise SystemExit(1)
