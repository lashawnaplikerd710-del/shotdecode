"""Stdio MCP entry point for ShotDecode's built-in project tools."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit


SHOT = {'type': 'integer', 'minimum': 1, 'description': '镜头编号'}
SECONDS = {'type': 'number', 'minimum': 0, 'description': '时间（秒）'}
TEXT = {'type': 'string', 'minLength': 1}
RANGES = {'type': 'array', 'minItems': 1, 'maxItems': 240,
          'items': {'type': 'object', 'properties': {'start': SECONDS, 'end': SECONDS},
                    'required': ['start', 'end'], 'additionalProperties': False}}
TOOLS = {
    'inspect_project': ('读取分镜', '读取当前拆解项目、分镜时间、已替换素材和字幕轨。指定镜头可查看证据和提示词。',
                        {'shot': SHOT}, []),
    'review_footage': ('查看原始素材', '查看附件或当前原始视频的多帧预览、时长、画面变化点和静音区间。'
                       '根据用户要求的成片类型，从画面中挑选素材。start/end 用原片秒数；分析长素材可按较短区间继续查看。'
                       '需要据口播剪辑或加字幕时，传 speech=true 读取本机模型识别的口播和时间。'
                       '静音和画面变化仅供选片参考。',
                       {'start': SECONDS, 'end': SECONDS, 'speech': {'type': 'boolean'}}, []),
    'make_first_cut': ('制作素材初稿', '用刚查看的新素材生成可播放、可编辑的剪辑工程。'
                       '按成片顺序提交要保留的原片时间范围，支持重排。opening_title 可选，会在成片开头添加标题。'
                       '只用于新附件或尚无项目的原片，已有项目可用 apply_timeline_edit。',
                       {'ranges': RANGES, 'opening_title': TEXT}, ['ranges']),
    'create_edit_project': ('创建剪辑工程', '将对话新附带的视频或已导入的原片放入可编辑时间线。'
                            '已有项目且本轮没有新素材时，直接读取现有时间线。', {}, []),
    'read_timeline': ('读取剪辑时间线', '读取当前剪辑后的时间线、主轨、附加素材和当前选中的片段，返回应用剪辑所需的 revision。'
                      'start/end 使用现在的播放时间。片段很多时可按区间查询。',
                      {'start': SECONDS, 'end': SECONDS}, []),
    'apply_timeline_edit': (
        '应用时间线剪辑',
        '按 ranges 顺序拼接要保留的区间。每段用调用 read_timeline 时的时间线秒数，可用来修剪、删除、分割、重排或重复片段。'
        '所有轨道同步剪辑。需传入最近一次 read_timeline 返回的 revision。明确要求剪辑时调用，成片导出另用 export_movie。',
        {'revision': TEXT, 'ranges': RANGES},
        ['revision', 'ranges']),
    'read_subtitles': ('读取字幕与中译', '按当前时间线读取口播、画面文字、中文译文和手动字幕。',
                       {'start': SECONDS, 'end': SECONDS}, []),
    'read_frame': ('读取参考帧', '返回 JPEG 画面。time 是原片秒数，shot 使用原镜头首帧，timeline_time 查当前时间线位置的素材帧。',
                   {'shot': SHOT, 'time': SECONDS, 'timeline_time': SECONDS}, []),
    'analyze_video': ('拆解当前视频', '按本机拆解设置分析当前视频，生成新报告并在工作台打开。',
                      {'ocr_language': {'enum': ['zh', 'ja']}, 'stems': {'type': 'boolean'}}, []),
    'import_subtitles': ('译文加入时间线', '将当前项目的一条字幕轨复制到可编辑的手动字幕轨。默认优先选择中文译文。',
                         {'track': {'enum': ['zh', 'ja', 'en_zh', 'en', 'screen_zh', 'screen_en', 'screen', 'speech']}}, []),
    'save_caption': ('保存手动字幕', '在当前工程时间线上添加文字。给出 caption_id 时编辑已有手动字幕并保留样式。',
                     {'start': SECONDS, 'end': SECONDS, 'text': TEXT, 'caption_id': {'type': 'string'}},
                     ['start', 'end', 'text']),
    'replace_shot': ('替换镜头', '使用用户在指令框中选定的替换视频。省略 shot 时使用本次指令选中的镜头。',
                     {'shot': SHOT}, []),
    'save_shot_prompt': ('保存镜头提示词', '写入当前项目指定镜头的复刻提示词。省略 shot 时使用本次指令选中的镜头。',
                         {'shot': SHOT, 'text': TEXT}, ['text']),
    'generate_shot': ('生成并替换镜头', '用户明确要求生成时，使用已经配置的 ComfyUI 工作流生成替换视频。此操作会调用配置的服务。',
                      {'shot':SHOT, 'text':TEXT}, ['text']),
    'export_movie': ('导出时间线成片', '把当前时间线导出为一个 MP4，使用工作台里设置的成片位置。',
                     {'audio': {'enum': ['mix', 'original', 'mute']}, 'overlays': {'type': 'boolean'}}, []),
}
SUPPORTED_VERSIONS = ('2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25')


def tool_list():
    return [
        dict(name=name, description=description, inputSchema=dict(
            type='object', properties=properties, required=required, additionalProperties=False))
        for name, (_, description, properties, required) in TOOLS.items()
    ]


def call_workbench(data):
    url = os.environ['SHOTDECODE_TOOL_URL']
    endpoint = urlsplit(url)
    if endpoint.scheme != 'http' or endpoint.hostname != '127.0.0.1' or endpoint.path != '/api/agent-tool':
        raise ValueError('工作台连接地址无效。')
    request = urllib.request.Request(
        url, data=json.dumps(data, ensure_ascii=False).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + os.environ['SHOTDECODE_TOOL_KEY']},
    )
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(request, timeout=None) as response:
            return json.load(response)['result']
    except urllib.error.HTTPError as error:
        with error:
            failure = json.load(error).get('error')
        raise ValueError(failure or '工作台工具未能完成。') from None


def tool_result(params):
    try:
        data = call_workbench(dict(tool=params.get('name'), arguments=params.get('arguments', {})))
        images = data.pop('_mcp_images', [])
        content = json.dumps(data, ensure_ascii=False)
        return dict(content=[dict(type='text', text=content), *images])
    except (ValueError, KeyError, OSError) as error:
        return dict(isError=True, content=[dict(type='text', text=str(error) or '工作台工具未能完成。')])


def handle(request):
    if 'id' not in request:
        return None
    method, params = request.get('method'), request.get('params') or {}
    if not isinstance(params, dict):
        return dict(jsonrpc='2.0', id=request['id'], error=dict(code=-32602, message='Invalid params'))
    if method == 'initialize':
        requested = params.get('protocolVersion')
        result = dict(protocolVersion=requested if requested in SUPPORTED_VERSIONS else SUPPORTED_VERSIONS[-1],
                      capabilities=dict(tools={}), serverInfo=dict(name='shotdecode', version='0.1.0'))
    elif method == 'ping':
        result = {}
    elif method == 'tools/list':
        try:
            call_workbench({'ready': True})
        except (OSError, ValueError, KeyError):
            pass
        result = dict(tools=tool_list())
    elif method == 'tools/call':
        result = tool_result(params)
    else:
        return dict(jsonrpc='2.0', id=request['id'], error=dict(code=-32601, message='Method not found'))
    return dict(jsonrpc='2.0', id=request['id'], result=result)


if __name__ == '__main__':
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    for line in sys.stdin:
        try:
            message = json.loads(line)
        except ValueError:
            continue
        if isinstance(message, dict):
            reply = handle(message)
            if reply is not None:
                print(json.dumps(reply, ensure_ascii=False), flush=True)
