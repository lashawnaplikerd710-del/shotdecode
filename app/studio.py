from __future__ import annotations

import ctypes
import hmac
import json
import mimetypes
import os
import re
import secrets
import sys
import threading
import traceback
from ctypes.wintypes import RECT
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

import backend as be
from app_identity import APP_NAME, WINDOWS_APP_ID, engine_display_text, has_webview2
from audio_waveforms import AudioWaveforms
from media_previews import poster_frame
from studio_session import StudioSession
from studio_tools import IMAGE_TYPES
from window_chrome import DesktopChrome


DIST = be.APP / 'studio_web'
CONTENT_POLICY = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                  "img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; "
                  "object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
FILE_TYPES = {
    'video': ('视频 (' + ';'.join('*' + ext for ext in be.VIDEO_EXTENSIONS) + ')', '所有文件 (*.*)'),
    'media': ('视频与音频 (' + ';'.join('*' + ext for ext in be.VIDEO_EXTENSIONS + be.AUDIO_EXTENSIONS) + ')', '所有文件 (*.*)'),
    'audio': ('音频 (*.wav;*.mp3;*.m4a;*.aac;*.flac;*.ogg;*.opus;*.wma)', '所有文件 (*.*)'),
    'project': ('拆解项目 (*.json)',),
    'env': ('模型配置 (*.env)', '所有文件 (*.*)'),
    'caption': ('字幕 (*.srt;*.ass)',),
    'image': ('图像 (' + ';'.join('*' + ext for ext in IMAGE_TYPES) + ')',),
    'json': ('JSON 文件 (*.json)',),
    'yaml': ('YAML 文件 (*.yaml;*.yml)',),
    'executable': ('Python 程序 (*.exe)',),
    'agent_program': ('程序与入口 (*.exe;*.cmd;*.bat;*.js;*.mjs;*.cjs)',),
    'srt_save': ('SRT 字幕 (*.srt)',),
    'ass_save': ('ASS 字幕 (*.ass)',),
    'json_save': ('JSON 文件 (*.json)',),
    'yaml_save': ('YAML 文件 (*.yaml)',),
    'video_save': ('MP4 视频 (*.mp4)',),
    'text_save': ('文本 (*.txt)',),
}


class StudioServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, session, dist=DIST):
        self.waveforms = AudioWaveforms()
        super().__init__(('127.0.0.1', 0), StudioHandler)
        self.session = session
        self.chrome = None
        self.dist = Path(dist).resolve()
        self.host = f'127.0.0.1:{self.server_address[1]}'
        self.origin = 'http://' + self.host
        self.token = secrets.token_urlsafe(32)
        self.cookie_name = 'studio_' + str(self.server_address[1])
        self.entry = self.origin + '/?open=' + self.token
        self.session.agents.tool_url = self.origin + '/api/agent-tool'

    def server_close(self):
        self.waveforms.close()
        super().server_close()


class StudioHandler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def log_message(self, *args):
        pass

    def headers_for(self, status, kind, length, *, headers=None):
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(length))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', CONTENT_POLICY)
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()

    def reply(self, status, data):
        raw = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.headers_for(status, 'application/json; charset=utf-8', len(raw))
        if self.command != 'HEAD':
            self.wfile.write(raw)

    def authenticated(self):
        try:
            cookie = SimpleCookie(self.headers.get('Cookie', ''))
            value = cookie.get(self.server.cookie_name)
            return value is not None and hmac.compare_digest(value.value, self.server.token)
        except (ValueError, TypeError):
            return False

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        if self.headers.get('Host') != self.server.host:
            self.reply(403, {'error': '这个工作台地址无效。'})
            return
        route = urlsplit(self.path)
        if route.path == '/':
            token = parse_qs(route.query).get('open', [''])[0]
            if token and hmac.compare_digest(token.encode('utf-8'), self.server.token.encode('ascii')):
                self.headers_for(303, 'text/plain; charset=utf-8', 0, headers={
                    'Location': '/', 'Set-Cookie': f'{self.server.cookie_name}={self.server.token}; HttpOnly; SameSite=Strict; Path=/',
                })
                return
        if not self.authenticated():
            self.reply(403, {'error': '请从工作台入口重新打开。'})
            return
        try:
            if route.path == '/api/state':
                self.reply(200, self.server.session.snapshot())
            elif route.path.startswith('/api/thumbnail/'):
                source = self.server.session.get_asset(route.path.rsplit('/', 1)[1])
                image = poster_frame(source) if source and source.suffix.lower() in be.VIDEO_EXTENSIONS else None
                self.serve_file(image)
            elif route.path.startswith('/api/waveform/'):
                path = self.server.session.waveform_source(route.path.rsplit('/', 1)[-1])
                if not path:
                    self.reply(404, {'error': '音频文件已移动或尚未生成。'})
                    return
                try:
                    waveform = self.server.waveforms.read(path)
                except (OSError, ValueError, RuntimeError):
                    self.reply(422, {'error': '无法读取音频波形。'})
                else:
                    self.reply(200, waveform)
            elif route.path.startswith('/media/'):
                path = self.server.session.get_asset(route.path[len('/media/'):])
                self.serve_file(path)
            elif route.path == '/':
                self.serve_file(self.server.dist / 'index.html')
            elif route.path.startswith('/assets/'):
                path = (self.server.dist / unquote(route.path[1:])).resolve()
                self.serve_file(path if path.is_relative_to(self.server.dist / 'assets') else None)
            else:
                self.reply(404, {'error': '这个页面不存在。'})
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_POST(self):
        route = urlsplit(self.path)
        agent_tool = route.path == '/api/agent-tool'
        if self.headers.get('Host') != self.server.host or (not agent_tool and (
                self.headers.get('Origin') != self.server.origin or not self.authenticated())):
            self.close_connection = True
            self.reply(403, {'error': '请从工作台入口重新打开。'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if agent_tool and self.headers.get_content_type() == 'application/json' and 0 < length <= 64 * 1024:
                self.connection.settimeout(20)
                data = json.loads(self.rfile.read(length))
                key = self.headers.get('Authorization', '').removeprefix('Bearer ')
                self.reply(200, {'result': self.server.session.agent_tool(key, data)})
            elif route.path == '/api/import' and self.headers.get_content_type() == 'application/octet-stream':
                self.connection.settimeout(60)
                query = parse_qs(route.query)
                footage = query.get('agent_footage') == ['1']
                result = self.server.session.import_video(
                    unquote(self.headers.get('X-Filename', '')), length, self.rfile, query.get('shot', [None])[0],
                    clip=query.get('clip', [None])[0], scope=query.get('scope' if footage else 'project', [None])[0],
                    editing=query.get('edit') == ['1'], agent_footage=footage)
                self.reply(200, {'result': result})
            elif route.path == '/api/action' and self.headers.get_content_type() == 'application/json' and 0 < length <= 256 * 1024:
                data = json.loads(self.rfile.read(length))
                if not isinstance(data, dict) or not isinstance(data.get('action'), str):
                    raise ValueError('请求格式无效。')
                if data['action'] == 'window_control':
                    chrome = self.server.chrome
                    result = chrome.control(data.get('operation')) if chrome else None
                else:
                    result = self.server.session.action(data['action'], data)
                self.reply(200, {'result': result})
            else:
                raise ValueError('这个操作不可用。')
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
        except Exception as exc:
            self.close_connection = True
            try:
                code = 403 if agent_tool and isinstance(exc, PermissionError) else 400
                self.reply(code, {'error': engine_display_text(str(exc)) or '操作失败，请重试。'})
            except (BrokenPipeError, ConnectionResetError):
                pass

    def serve_file(self, path):
        if not path or not path.is_file():
            self.reply(404, {'error': '文件已移动或尚未生成。'})
            return
        try:
            stream = path.open('rb')
        except OSError:
            self.reply(404, {'error': '文件已移动或尚未生成。'})
            return
        with stream:
            total = os.fstat(stream.fileno()).st_size
            start, end = 0, total - 1
            status = 200
            compressed_font = (path.is_relative_to(self.server.dist / 'assets/caption-fonts')
                               and path.name.endswith(('.ttf.gz', '.otf.gz')))
            headers = {'Content-Encoding': 'gzip'} if compressed_font else {'Accept-Ranges': 'bytes'}
            requested = None if compressed_font else self.headers.get('Range')
            if requested:
                match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested)
                if match:
                    first, last = match.groups()
                    if first:
                        start = int(first)
                        end = min(int(last), end) if last else end
                    elif last:
                        start = max(0, total - int(last))
                    else:
                        match = None
                if not match or start > end:
                    self.headers_for(416, 'text/plain', 0, headers={'Content-Range': f'bytes */{total}'})
                    return
                headers['Content-Range'] = f'bytes {start}-{end}/{total}'
                status = 206
            suffix = Path(path.stem).suffix if compressed_font else path.suffix.lower()
            kind = {'.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
                    '.html': 'text/html; charset=utf-8', '.m4v': 'video/mp4', '.woff2': 'font/woff2',
                    '.ttf': 'font/ttf', '.otf': 'font/otf'}.get(
                        suffix, mimetypes.guess_type(path.name)[0] or 'application/octet-stream')
            length = end - start + 1
            self.headers_for(status, kind, length, headers=headers)
            if self.command != 'HEAD' and length:
                stream.seek(start)
                while length:
                    chunk = stream.read(min(length, 256 * 1024))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    length -= len(chunk)


def choose_file(webview, window, kind, directory, name):
    mode = webview.FileDialog.FOLDER if kind == 'folder' else (
        webview.FileDialog.SAVE if kind.endswith('_save') else webview.FileDialog.OPEN)
    value = window.create_file_dialog(mode, directory=str(directory) if directory.is_dir() else '',
                                      save_filename=name, file_types=FILE_TYPES.get(kind, ()))
    return value[0] if isinstance(value, (tuple, list)) and value else value


def startup_window_size():
    user32 = ctypes.windll.user32
    dpi_context = getattr(user32, 'SetThreadDpiAwarenessContext', None)
    previous = None
    if dpi_context is not None:
        dpi_context.argtypes = [ctypes.c_void_p]
        dpi_context.restype = ctypes.c_void_p
        previous = dpi_context(ctypes.c_void_p(-4))
    try:
        area = RECT()
        available = ((area.right - area.left, area.bottom - area.top)
                     if user32.SystemParametersInfoW(0x0030, 0, ctypes.byref(area), 0)
                     else (user32.GetSystemMetrics(0), user32.GetSystemMetrics(1) - 48))
        scale = user32.GetDpiForSystem() / 96 if previous else 1
    finally:
        if previous:
            dpi_context(previous)
    # WebView expects logical pixels, and the work area already excludes the taskbar.
    return min(1800, round(available[0] / scale) - 28), min(1100, round(available[1] / scale) - 24)


def startup_background(mode):
    if mode == 'system':
        import winreg

        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                                r'Software\Microsoft\Windows\CurrentVersion\Themes\Personalize') as key:
                mode = 'light' if winreg.QueryValueEx(key, 'AppsUseLightTheme')[0] else 'dark'
        except OSError:
            pass
    return '#ffffff' if mode == 'light' else '#121417'


def main():
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(WINDOWS_APP_ID)
    if not (DIST / 'index.html').is_file() or not has_webview2():
        import workbench
        return workbench.main()
    try:
        import webview

        initial = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
        session = StudioSession(initial)
        with StudioServer(session) as server:
            worker = threading.Thread(target=server.serve_forever, name='studio-http', daemon=True)
            worker.start()
            try:
                width, height = startup_window_size()
                chrome = DesktopChrome(server.entry)
                server.chrome = chrome
                window = webview.create_window(APP_NAME, width=width, height=height,
                                               min_size=(min(960, width), min(650, height)),
                                               background_color=startup_background(session.config.get('color_mode')),
                                               frameless=True, easy_drag=False, text_select=True)
                window.events.before_show += chrome.attach
                session.picker = lambda *args: choose_file(webview, window, *args)
                window.events.closing += lambda: not session.job or window.create_confirmation_dialog(
                    APP_NAME, '当前任务仍在运行。停止任务并关闭工作台？')
                webview.start(gui='edgechromium', icon=str(be.APP / 'workbench.ico'))
            finally:
                session.close()
                server.shutdown()
                worker.join()
        return 0
    except Exception:
        (be.DATA / 'studio-startup-error.txt').write_text(traceback.format_exc(), encoding='utf-8')
        import workbench
        return workbench.main()


if __name__ == '__main__':
    raise SystemExit(main())
