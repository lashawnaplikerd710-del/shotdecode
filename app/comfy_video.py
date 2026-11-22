"""Submit a user-selected video workflow to an existing ComfyUI server."""
from __future__ import annotations

import json
import mimetypes
import secrets
import tempfile
import time
from contextlib import suppress
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

import backend as be


DEFAULT_URL = 'http://127.0.0.1:8188'
PROMPT_KEYS = {'text', 'prompt', 'positive', 'positive_prompt', 'text_g', 'text_l'}


def address(value):
    if not isinstance(value, str) or len(value) > 2048:
        raise ValueError('请输入 ComfyUI 的 HTTP 或 HTTPS 地址。')
    parsed = urlsplit(value.strip())
    if (parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username is not None
            or parsed.query or parsed.fragment or any(ch.isspace() for ch in value.strip())):
        raise ValueError('请输入 ComfyUI 地址，例如 http://127.0.0.1:8188。')
    parsed.port  # Validate a supplied port before making requests.
    return parsed.geturl().rstrip('/')


def workflow_file(value):
    if not isinstance(value, (str, Path)) or not value:
        raise ValueError('请先选择 ComfyUI 的 API 工作流。')
    path = Path(value).expanduser()
    if not path.is_absolute() or path.suffix.lower() != '.json' or not path.is_file():
        raise ValueError('请重新选择可用的 API 工作流 JSON。')
    if path.stat().st_size > 8 * 1024 * 1024:
        raise ValueError('工作流 JSON 太大。请从 ComfyUI 导出用于提交的 API 格式。')
    graph = be.load_json(path)
    if isinstance(graph, dict) and isinstance(graph.get('prompt'), dict):
        graph = graph['prompt']
    if not isinstance(graph, dict) or not graph or not all(
        isinstance(node, dict) and isinstance(node.get('class_type'), str)
        and isinstance(node.get('inputs'), dict) for node in graph.values()
    ):
        raise ValueError('这个文件是编辑器工作流。请在 ComfyUI 用「导出（API）」另存 JSON。')
    return graph


def matching_fields(graph, image=False):
    fields = {}
    for node, definition in graph.items():
        kind = definition['class_type']
        meta = definition.get('_meta') or {}
        label = (meta.get('title') if isinstance(meta, dict) else None) or kind
        for key, value in definition['inputs'].items():
            if not isinstance(value, str):
                continue
            if image and (kind != 'LoadImage' or key != 'image'):
                continue
            if not image and key.lower() not in PROMPT_KEYS:
                continue
            fields[f'{node}.{key}'] = dict(node=node, field=key,
                label=f'{node} · {label} / {key}', preview=value.replace('\n', ' ')[:90])
    return fields


def workflow_options(path):
    graph = workflow_file(path)
    prompts, images = matching_fields(graph), matching_fields(graph, True)
    if not prompts:
        raise ValueError('没有找到可编辑的提示词字段。请选择带有文本提示词的工作流。')
    positive = [key for key, row in prompts.items() if any(
        term in row['label'].casefold() for term in ('positive', '正向'))]
    selected = next(iter(prompts)) if len(prompts) == 1 else (positive[0] if len(positive) == 1 else '')
    return dict(path=str(path), prompt=selected,
                prompts=[dict(id=key, **row) for key, row in prompts.items()],
                images=[dict(id=key, **row) for key, row in images.items()])


def settings(data):
    url = address(data.get('url', DEFAULT_URL))
    path = data.get('path') or ''
    prompt, image = data.get('prompt') or '', data.get('image') or ''
    if path:
        graph = workflow_file(path)
        if not isinstance(prompt, str) or prompt not in matching_fields(graph):
            raise ValueError('请选择工作流里用于正向提示词的字段。')
        if not isinstance(image, str) or (image and image not in matching_fields(graph, True)):
            raise ValueError('请选择有效的参考图输入，或留空。')
        path = str(Path(path).resolve())
    else:
        prompt = image = ''
    return dict(url=url, path=path, prompt=prompt, image=image)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


class ComfyUI:
    def __init__(self, url):
        self.url = address(url)
        self.opener = build_opener(ProxyHandler({}), NoRedirect())

    def request(self, route, payload=None, content_type='application/json', timeout=8):
        request = Request(self.url + route, data=payload,
                          headers={'Content-Type': content_type} if payload is not None else {})
        try:
            return self.opener.open(request, timeout=timeout)
        except HTTPError as exc:
            with exc:
                if exc.code >= 400:
                    try:
                        error = json.loads(exc.read(10_000))
                        message = error.get('error') if isinstance(error, dict) else None
                        if isinstance(message, dict):
                            message = message.get('details') or message.get('message')
                        if isinstance(message, str) and message.strip():
                            raise RuntimeError('ComfyUI · ' + message[:450]) from None
                    except (ValueError, TypeError):
                        pass
            raise RuntimeError(f'ComfyUI 接口返回 HTTP {exc.code}。请核对服务地址和工作流。') from None
        except (URLError, TimeoutError, OSError) as exc:
            raise RuntimeError(f'无法连接 ComfyUI，请确认服务已启动（{getattr(exc, "reason", exc)}）。') from None

    def json(self, route, body=None, timeout=8):
        payload = json.dumps(body, ensure_ascii=False).encode('utf-8') if body is not None else None
        with self.request(route, payload, timeout=timeout) as response:
            try:
                value = json.loads(response.read(32 * 1024 * 1024))
            except (ValueError, OSError):
                raise RuntimeError('ComfyUI 返回的数据无法读取。请核对服务地址。') from None
        if not isinstance(value, dict):
            raise RuntimeError('ComfyUI 返回了无法识别的数据。')
        return value

    def test(self):
        result = self.json('/system_stats')
        system = result.get('system')
        if not isinstance(system, dict) or not isinstance(result.get('devices'), list):
            raise ValueError('这个地址未返回 ComfyUI 的系统信息。')
        return dict(message='ComfyUI 已连接', version=str(system.get('comfyui_version') or ''))

    def upload_image(self, path):
        if not path.is_file() or path.stat().st_size > 32 * 1024 * 1024:
            raise ValueError('参考帧不可用。请选择不超过 32 MB 的图片。')
        boundary = 'shotdecode-' + secrets.token_hex(12)
        name = 'shotdecode-' + secrets.token_hex(10) + path.suffix.lower()
        content = mimetypes.guess_type(name)[0] or 'application/octet-stream'
        header = (f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{name}"\r\n'
                  f'Content-Type: {content}\r\n\r\n').encode('ascii')
        payload = header + path.read_bytes() + f'\r\n--{boundary}--\r\n'.encode('ascii')
        with self.request('/upload/image', payload, f'multipart/form-data; boundary={boundary}') as response:
            result = json.load(response)
        if not isinstance(result, dict) or not isinstance(result.get('name'), str):
            raise RuntimeError('ComfyUI 没有确认收到参考帧。')
        return '/'.join(filter(None, (result.get('subfolder'), result['name'])))

    def video_output(self, entry):
        status = entry.get('status') or {}
        if status.get('status_str') == 'error':
            error = next((row[1].get('exception_message') for row in status.get('messages', [])
                          if len(row) > 1 and row[0] == 'execution_error' and isinstance(row[1], dict)), '')
            if error:
                raise RuntimeError('ComfyUI 生成失败 · ' + str(error)[:450])
            raise RuntimeError('ComfyUI 生成失败，请查看它的任务日志。')
        for output in (entry.get('outputs') or {}).values():
            if not isinstance(output, dict):
                continue
            for values in output.values():
                if not isinstance(values, list):
                    continue
                for file in values:
                    if not isinstance(file, dict) or not isinstance(file.get('filename'), str):
                        continue
                    name = file['filename']
                    if Path(name).name == name and Path(name).suffix.lower() in be.VIDEO_EXTENSIONS:
                        return file
        raise ValueError('工作流已结束，但没有输出视频。请在 ComfyUI 工作流里加入保存视频节点。')

    def download(self, job, file, folder):
        group = file.get('type', 'output')
        if group not in ('output', 'temp'):
            raise ValueError('工作流没有返回可下载的视频输出。')
        params = urlencode(dict(filename=file['filename'], subfolder=file.get('subfolder', ''), type=group))
        destination = folder / ('生成镜头' + Path(file['filename']).suffix.lower())
        with tempfile.NamedTemporaryFile(prefix='.comfy-', dir=folder, delete=False) as stream:
            pending = Path(stream.name)
            try:
                with self.request('/view?' + params, timeout=15) as response:
                    while block := response.read(256 * 1024):
                        job.check()
                        stream.write(block)
                job.check()
                stream.flush()
                stream.close()
                probe = job.run([be.FFPROBE, '-v', 'error', '-select_streams', 'v:0',
                                 '-show_entries', 'stream=codec_type', '-of', 'json', pending], quiet=True)
                if not json.loads(probe).get('streams'):
                    raise ValueError('ComfyUI 返回的文件没有视频画面。')
                job.check()
                pending.replace(destination)
            finally:
                stream.close()
                pending.unlink(missing_ok=True)
        return destination

    def generate(self, job, config, text, folder, reference):
        graph = workflow_file(config['path'])
        prompt = matching_fields(graph).get(config['prompt'])
        image = matching_fields(graph, True).get(config['image']) if config['image'] else None
        if not prompt or (config['image'] and not image):
            raise ValueError('工作流的输入已变化，请在「设置 → 视频生成」重新选择。')
        graph[prompt['node']]['inputs'][prompt['field']] = text
        if image:
            job.emit('正在发送选中镜头的参考帧')
            graph[image['node']]['inputs'][image['field']] = self.upload_image(reference)
        job.check()
        queued = self.json('/prompt', dict(prompt=graph, client_id='shotdecode-' + secrets.token_hex(10)))
        identifier = queued.get('prompt_id')
        if not isinstance(identifier, str) or not identifier:
            raise RuntimeError('ComfyUI 没有返回任务编号。')
        job.emit('已提交 ComfyUI，等待队列生成视频')
        queue_check = time.monotonic() + 20
        missing = False
        try:
            while not job.cancelled.wait(1):
                result = self.json('/history/' + quote(identifier, safe=''))
                entry = result.get(identifier)
                if entry:
                    job.emit('ComfyUI 已返回，正在下载生成镜头')
                    return self.download(job, self.video_output(entry), folder)
                if time.monotonic() >= queue_check:
                    queue = self.json('/queue')
                    running, pending = queue.get('queue_running'), queue.get('queue_pending')
                    if isinstance(running, list) and isinstance(pending, list):
                        present = any(isinstance(row, list) and len(row) > 1 and row[1] == identifier
                                      for row in running + pending)
                        if missing and not present:
                            raise RuntimeError('ComfyUI 队列里已找不到本次任务。请检查服务端任务记录。')
                        missing = not present
                    queue_check = time.monotonic() + 10
            job.check()
        except be.Cancelled:
            # Remove only our queued task. The server's global interrupt can stop other jobs.
            with suppress(RuntimeError):
                self.json('/queue', {'delete': [identifier]}, timeout=2)
            raise
