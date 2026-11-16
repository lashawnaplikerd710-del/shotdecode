"""Download one public TikTok or Douyin video for the video breakdown workbench.

Adapted from the user-owned Framo agent_core/video_download.py. See vendor/SOURCES.md."""
from __future__ import annotations

from http.cookiejar import CookieJar
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit, urlunsplit
from urllib.request import HTTPCookieProcessor, HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parent
PLATFORMS = {'tiktok': 'TikTok', 'douyin': '抖音'}
ID = r'[0-9]{15,25}'
SHORT = r'[A-Za-z0-9_-]{4,64}'
SHARE = 'https://www.iesdouyin.com/share/video/{}/'
DOUYIN_ID = re.compile(rf'/(?:share/)?video/({ID})/?')
DOUYIN_SHORT = re.compile(rf'/{SHORT}/?')
ROUTER_DATA = re.compile(r'window\._ROUTER_DATA\s*=\s*(.*?)</script>', re.DOTALL)
DOUYIN_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 '
                  '(KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': 'https://www.douyin.com/',
}
MAX_BYTES = 1024 ** 3
NETWORK_TIMEOUT = 12
MAX_LINK_TEXT = 16_384
MAX_COLLECTED_LINKS = 50
LINK = re.compile(r'https?://[^\s<>"“”‘’。！？，、；（）【】,;]+', re.IGNORECASE)


class DownloadError(ValueError):
    """A short, user-facing failure with no URL, cookies, or provider log."""


def _canonical_video_link(url):
    try:
        parts = urlsplit(url.rstrip('.,!?)]}'))
        host = parts.hostname
    except ValueError:
        return None
    if not host or parts.netloc.lower() != host:
        return None
    path = parts.path.rstrip('/')
    if host in ('tiktok.com', 'www.tiktok.com', 'm.tiktok.com'):
        if re.fullmatch(rf'/@[A-Za-z0-9_.-]+/video/{ID}', path) or re.fullmatch(rf'/t/{SHORT}', path):
            return 'tiktok', 'https://www.tiktok.com' + path
    elif host in ('vm.tiktok.com', 'vt.tiktok.com') and re.fullmatch(rf'/{SHORT}', path):
        return 'tiktok', f'https://{host}{path}/'
    elif host in ('douyin.com', 'www.douyin.com', 'iesdouyin.com', 'www.iesdouyin.com'):
        match = DOUYIN_ID.fullmatch(path)
        if match:
            return 'douyin', SHARE.format(match[1])
    elif host in ('v.douyin.com', 'v.iesdouyin.com') and DOUYIN_SHORT.fullmatch(path):
        return 'douyin', f'https://{host}{path}/'
    return None


def parse_video_link(text):
    """Return a platform and canonical public video URL from a share message."""
    if not isinstance(text, str) or not text.strip():
        raise DownloadError('请粘贴抖音或 TikTok 的视频链接。')
    if len(text) > MAX_LINK_TEXT:
        raise DownloadError('分享内容过长，请只保留一条作品链接。')
    matches = {match for url in LINK.findall(text) if (match := _canonical_video_link(url))}
    if len(matches) == 1:
        return matches.pop()
    if matches:
        raise DownloadError('一次只能下载一条视频，请只保留一个作品链接。')
    raise DownloadError('请粘贴一条公开的 TikTok 或抖音视频链接，也可以粘贴完整分享文案。')


def video_link_row(platform, url):
    match = re.search(rf'/video/({ID})/?$', urlsplit(url).path)
    post_id = match[1] if match else ''
    return {'key': f'{platform}:{post_id or url}', 'platform': PLATFORMS[platform],
            'url': url, 'video_id': post_id}


def collect_video_links(text):
    """Collect distinct public work links without contacting the platforms."""
    if not isinstance(text, str) or len(text) > MAX_LINK_TEXT:
        raise DownloadError('分享内容过长，请分段粘贴。')
    rows = {}
    duplicates = unsupported = 0
    for url in LINK.findall(text):
        link = _canonical_video_link(url)
        if not link:
            unsupported += 1
            continue
        row = video_link_row(*link)
        if row['key'] in rows:
            duplicates += 1
        else:
            rows[row['key']] = row
    links = list(rows.values())
    return {'links': links[:MAX_COLLECTED_LINKS], 'duplicates': duplicates,
            'unsupported': unsupported, 'overflow': max(0, len(links) - MAX_COLLECTED_LINKS)}


def _marked_url(url):
    parts = urlsplit(url)
    params = parse_qs(parts.query.lower())
    return 'playwm' in parts.path.lower().split('/') or any(
        value in ('1', 'true') for key in ('watermark', 'wm') for value in params.get(key, ())
    )


def _tiktok_formats(context):
    formats = [
        fmt for fmt in context['formats']
        if fmt.get('ext') == 'mp4'
        and fmt.get('vcodec') not in ('none', None)
        and not fmt.get('has_drm')
        and fmt.get('protocol') in ('https', 'http')
        and 'watermark' not in (fmt.get('format_note') or '').lower()
        and not (fmt.get('format_id') or '').startswith('download')
        and not _marked_url(fmt['url'])
    ]
    if not formats:
        raise DownloadError('TikTok 未提供可下载的无水印 MP4 版本。')
    # yt-dlp has already sorted by quality. Prefer original sound and H.264.
    yield max(reversed(formats), key=lambda fmt: (
        fmt.get('acodec') not in ('none', None),
        fmt['vcodec'].startswith(('avc', 'h264')),
    ))


class _QuietLog:
    def debug(self, message):
        pass

    warning = error = debug


def _check_size(size):
    if size > MAX_BYTES:
        raise DownloadError('视频大于 1 GB，请选择较小的视频。')


def _download_tiktok(url, output):
    os.environ['YTDLP_NO_PLUGINS'] = '1'
    try:
        from yt_dlp import YoutubeDL
        from yt_dlp.utils import DownloadError as ExtractorError
    except ImportError:
        raise DownloadError('TikTok 下载组件缺失，请安装 requirements.txt 中的依赖。') from None

    def check_progress(info):
        _check_size(info.get('downloaded_bytes') or 0)

    try:
        with YoutubeDL({
            'allowed_extractors': [r'(?i:tiktok|vm\.tiktok)'],
            'format': _tiktok_formats,
            'outtmpl': str(output).replace('%', '%%'),
            'noplaylist': True,
            'cachedir': False,
            'socket_timeout': NETWORK_TIMEOUT,
            'extractor_retries': 1,
            'retries': 1,
            'fixup': 'never',
            'logger': _QuietLog(),
            'progress_hooks': [check_progress],
        }) as ydl:
            info = ydl.extract_info(url, download=True)
    except ExtractorError as error:
        message = str(error).lower()
        if any(word in message for word in ('timed out', 'timeout', 'connection', 'certificate')):
            raise DownloadError('连接 TikTok 失败，请检查当前网络后重试。') from None
        raise DownloadError('TikTok 暂未返回可用的视频，请确认作品在当前网络中可以公开播放。') from None
    return info['id']


def _douyin_url_allowed(url):
    try:
        parts = urlsplit(url)
        host = parts.hostname
    except ValueError:
        return False
    return (
        parts.scheme == 'https' and host and parts.netloc.lower() == host
        and (host == 'aweme.snssdk.com' or any(
            host == domain or host.endswith('.' + domain)
            for domain in ('douyin.com', 'iesdouyin.com', 'douyinvod.com', 'amemv.com')
        ))
    )


class _DouyinRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not _douyin_url_allowed(newurl) or _marked_url(newurl):
            raise DownloadError('抖音返回了无法验证的下载地址。')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _douyin_item(page, post_id):
    match = ROUTER_DATA.search(page)
    if not match:
        return None
    try:
        data = json.loads(match[1].strip().rstrip(';'))
    except json.JSONDecodeError:
        return None
    for node in (data.get('loaderData') or {}).values():
        if not isinstance(node, dict):
            continue
        video_info = node.get('videoInfoRes') or node.get('videoInfo') or {}
        for item in video_info.get('item_list') or []:
            if str(item.get('aweme_id')) == post_id:
                return item
    return None


def _douyin_streams(item):
    urls = ((item.get('video') or {}).get('play_addr') or {}).get('url_list') or []
    for url in urls:
        if not _douyin_url_allowed(url):
            continue
        parts = urlsplit(url)
        # Public player variants documented in yzfly/douyin-mcp-server.
        if parts.path.rstrip('/') == '/aweme/v1/playwm':
            url = urlunsplit(parts._replace(path='/aweme/v1/play/', fragment=''))
        if not _marked_url(url):
            yield url


def _download_douyin(url, output):
    # Keep only anonymous session cookies issued by the public share pages.
    opener = build_opener(_DouyinRedirects(), HTTPCookieProcessor(CookieJar()))

    def get(address):
        return opener.open(Request(address, headers=DOUYIN_HEADERS), timeout=NETWORK_TIMEOUT)

    try:
        with get('https://www.iesdouyin.com/'):
            pass
    except (URLError, TimeoutError):
        pass

    for _ in range(2):
        with get(url) as response:
            match = DOUYIN_ID.fullmatch(urlsplit(response.url).path)
            if not match:
                raise DownloadError('这条抖音链接没有指向可公开播放的视频作品。')
            post_id = match[1]
            page = response.read(2 * 1024 ** 2).decode('utf-8', errors='replace')
        item = _douyin_item(page, post_id)
        if item is not None:
            break
        url = SHARE.format(post_id)
    else:
        raise DownloadError('抖音分享页未返回视频，请确认作品仍可公开播放，再复制新链接重试。')

    streams = list(dict.fromkeys(_douyin_streams(item)))
    if not streams:
        raise DownloadError('这条抖音作品没有可用的无水印视频流。')
    for stream in streams[:3]:
        try:
            with get(stream) as response:
                if response.status != 200 or not response.headers.get_content_type().startswith(
                    ('video/', 'application/octet-stream')
                ):
                    continue
                size = int(response.headers.get('Content-Length') or 0)
                _check_size(size)
                received = 0
                with output.open('wb') as target:
                    while chunk := response.read(256 * 1024):
                        received += len(chunk)
                        _check_size(received)
                        target.write(chunk)
                if received and (not size or received == size):
                    return post_id
        except (URLError, TimeoutError):
            continue
    raise DownloadError('抖音视频流下载失败，请检查网络后重试。')


def _run(args, check, timeout, *, on_wait=None, env=None,
         failure_message='下载组件未能完成操作，请重试。',
         timeout_message='等待视频下载或校验超时，请检查网络后重试。'):
    """Isolate blocking network work; cancellation is polled at most 200 ms apart."""
    check()
    deadline = monotonic() + timeout
    with subprocess.Popen(
        args, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0), cwd=ROOT, env=env,
    ) as process:
        try:
            while True:
                check()
                remaining = deadline - monotonic()
                if remaining <= 0:
                    raise DownloadError(timeout_message)
                try:
                    stdout, _ = process.communicate(timeout=min(.2, remaining))
                    if process.returncode != 0:
                        raise DownloadError(failure_message)
                    return stdout
                except subprocess.TimeoutExpired:
                    if on_wait:
                        on_wait()
        finally:
            if process.poll() is None:
                process.kill()
            # Reap the child and close its handles before temporary-file cleanup.
            process.communicate()


def _verify_mp4(path, probe, check):
    if not path.is_file() or not path.stat().st_size:
        raise DownloadError('平台未返回完整的视频文件。')
    _check_size(path.stat().st_size)
    try:
        data = json.loads(_run([
            str(probe), '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height:format=format_name,duration', '-of', 'json', str(path),
        ], check, 15, failure_message='下载到的文件未通过视频校验，请重新复制链接重试。'))
        container = data.get('format') or {}
        video = next(iter(data.get('streams') or []), {})
        duration = float(container.get('duration', 0))
    except (ValueError, TypeError, AttributeError) as error:
        if isinstance(error, DownloadError):
            raise
        raise DownloadError('下载到的文件未通过视频校验，请重试。') from None
    if ('mp4' not in container.get('format_name', '').split(',')
            or not video.get('width') or not video.get('height')
            or not math.isfinite(duration) or duration <= 0):
        raise DownloadError('下载到的文件未通过 MP4 校验，请重试。')


def publish_unique(staging, directory, stem, check):
    for index in range(1, 1000):
        check()
        suffix = f' ({index})' if index > 1 else ''
        target = directory / f'{stem}{suffix}{staging.suffix}'
        try:
            # Windows rename is atomic and fails if the destination exists.
            staging.rename(target)
        except FileExistsError:
            continue
        return target
    raise DownloadError('同名文件过多，请更换保存文件夹。')


def _download_progress(staging, progress):
    received = 0
    candidates = (staging, staging.with_suffix('.mp4.part'))

    def update():
        nonlocal received
        for candidate in candidates:
            try:
                size = candidate.stat().st_size
            except OSError:
                continue
            if size > received:
                received = size
                amount = f'{size / 1024 ** 2:.1f} MB' if size >= 1024 ** 2 else f'{max(1, size // 1024)} KB'
                progress('正在下载 · 已接收 ' + amount)

    return update


def download_video(text, directory, *, progress=None, check=lambda: None, ffmpeg=None):
    """Return one validated MP4 Path, or raise a short DownloadError.

    ``check`` is the caller's cancellation callback; its exception propagates
    unchanged. The network parser runs in a disposable isolated subprocess,
    so cancellation never waits for an outstanding platform socket timeout.
    ``ffmpeg`` is the caller's ffmpeg executable, beside ffprobe.exe/ffprobe.
    No browser credentials or install-dependent Framo imports are used.
    """
    platform, url = parse_video_link(text)
    check()
    try:
        directory = Path(directory).expanduser()
        if not directory.is_absolute():
            raise DownloadError('请选择一个有效的保存文件夹。')
        directory = directory.resolve()
        directory.mkdir(parents=True, exist_ok=True)
        ffmpeg = Path(ffmpeg) if ffmpeg is not None else ROOT.parent / 'ffmpeg' / 'ffmpeg.exe'
        probe = ffmpeg.with_name('ffprobe.exe' if ffmpeg.suffix.lower() == '.exe' else 'ffprobe')
        if not probe.is_file():
            raise DownloadError('缺少视频校验组件，请修复视频拆解工作台安装后重试。')
        python = Path(sys.executable)
        if python.name.lower() == 'pythonw.exe':
            python = python.with_name('python.exe')
        with tempfile.TemporaryDirectory(prefix='.workbench-download-', dir=directory) as stage:
            staging = Path(stage) / 'video.mp4'
            args = [str(python), '-I', '-B', '-X', 'utf8', str(Path(__file__).resolve()),
                    platform, url, str(staging)]
            child_env = dict(os.environ, TEMP=str(stage), TMP=str(stage),
                             YTDLP_NO_PLUGINS='1', PYTHONDONTWRITEBYTECODE='1')
            if progress:
                progress('正在连接' + PLATFORMS[platform] + '…')
            raw = _run(args, check, 600, env=child_env,
                       on_wait=_download_progress(staging, progress) if progress else None)
            try:
                result = json.loads(raw)
            except (ValueError, TypeError):
                raise DownloadError('平台暂未返回有效的视频数据，请稍后重试。') from None
            if not isinstance(result, dict):
                raise DownloadError('平台暂未返回有效的视频数据，请稍后重试。')
            if result.get('error'):
                raise DownloadError(result['error'])
            post_id = result.get('id', '')
            if not isinstance(post_id, str) or not re.fullmatch(ID, post_id):
                raise DownloadError('平台未返回有效的作品编号。')
            check()
            if progress:
                progress('正在校验下载的视频…')
            _verify_mp4(staging, probe, check)
            if progress:
                progress('正在保存视频…')
            return publish_unique(staging, directory, f'{PLATFORMS[platform]}-{post_id}', check)
    except OSError:
        raise DownloadError('无法保存视频，请检查文件夹权限和磁盘空间。') from None


def _transfer(platform, url, output):
    try:
        if platform == 'tiktok':
            post_id = _download_tiktok(url, Path(output))
        else:
            post_id = _download_douyin(url, Path(output))
        result = {'id': str(post_id)}
    except DownloadError as error:
        result = {'error': str(error)}
    except HTTPError as error:
        if error.code == 429:
            result = {'error': '抖音访问过于频繁，请稍后重试。'}
        elif error.code in (401, 403, 404, 410):
            result = {'error': '抖音未返回公开视频，请确认作品可以播放，再复制新链接重试。'}
        else:
            result = {'error': '抖音暂时无法访问，请稍后重试。'}
    except (URLError, TimeoutError):
        result = {'error': f'连接{PLATFORMS[platform]}失败，请检查当前网络后重试。'}
    except OSError:
        result = {'error': '读取或保存视频失败，请检查网络、文件夹权限和磁盘空间。'}
    except Exception:
        result = {'error': f'{PLATFORMS[platform]}暂未返回有效的视频数据，请稍后重试。'}
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    _transfer(*sys.argv[1:])
