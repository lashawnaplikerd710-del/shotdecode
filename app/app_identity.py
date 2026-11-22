from __future__ import annotations

import re


APP_NAME = 'ShotDecode'
APP_VERSION = '0.1.1'
INSTALL_FOLDER = 'VideoBreakdownWorkbench'
WINDOWS_APP_ID = 'VideoBreakdown.Workbench'


def has_webview2():
    import winreg

    component = r'SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
    for hive in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
        for view in (winreg.KEY_WOW64_32KEY, winreg.KEY_WOW64_64KEY):
            try:
                with winreg.OpenKey(hive, component, 0, winreg.KEY_READ | view) as key:
                    version, _ = winreg.QueryValueEx(key, 'pv')
                    if int(version.split('.')[0]) >= 120:
                        return True
            except (OSError, ValueError):
                pass
    return False


def engine_display_text(text: str) -> str:
    replacements = (
        ('能看图的 agent：运行 rea-video review 逐镜看图并 apply-review 并入；否则',
         '可以在「实用工具」生成复核文件，并将复核结果写回报告。'),
        ('An agent that can see images: run rea-video review, look at each shot and merge with apply-review; otherwise ',
         'Use the review actions in Tools to add visual findings. '),
        ('完整数据在 `breakdown.json`；agent 用 `rea-video summary` 读紧凑版。',
         '完整数据在 `breakdown.json`。可以在「实用工具」查看精简结论。'),
        ('The full data is in `breakdown.json`; agents read the compact view with `rea-video summary`.',
         'The full data is in `breakdown.json`. Open Tools for a compact summary.'),
        ('或 rea-video prefs capsule_root <路径> 设成默认', '或在「设置」保存后端目录'),
        ('or set it once with: rea-video prefs capsule_root <path>', 'or save the backend folder in Settings'),
        ('再用 rea-video eval 评测', '再在「实用工具」评测标注集'),
    )
    for original, replacement in replacements:
        text = text.replace(original, replacement)
    text = re.sub(r'建议配置 VLM（任意 OpenAI 兼容的多模态模型[^\r\n]*?再加 --vlm 重跑',
                  '可以在工作台的「设置」配置多模态分析。', text)
    text = re.sub(r'configure a VLM \(any OpenAI-compatible multimodal model[^\r\n]*?rerun with --vlm',
                  'Configure multimodal analysis in the workbench settings.', text)
    text = re.sub(r'(?m)^然后运行：rea-video apply-review [^\r\n]+', '填写复核文件后，在「实用工具」选择「并入复核文件」。', text)
    return re.sub(r'(?m)^rea-video: ', '分析引擎：', text)
