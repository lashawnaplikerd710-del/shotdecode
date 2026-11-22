---
name: shotdecode
description: 通过本机 ShotDecode 拆解视频或抖音/TikTok 链接，或在聊天里查看既有拆解项目的分镜、抽帧、口播中译与复刻提示词。适用于用户指定 ShotDecode 或给出它生成的项目、报告。
---

# ShotDecode

使用 ShotDecode 的命令行，把分镜、时间码和可打开的图片或报告路径直接交给用户。

用下面的 PowerShell 命令定位已安装的 ShotDecode。

```powershell
$sdInstall = if ($env:SHOTDECODE_HOME) { $env:SHOTDECODE_HOME } else {
    Join-Path $env:LOCALAPPDATA 'VideoBreakdownWorkbench'
}
$sdPython = Join-Path $sdInstall 'runtime/python.exe'
$sdCli = Join-Path $sdInstall 'app/shotdecode_cli.py'
& $sdPython -I -X utf8 $sdCli --help
```

如果用户选择了其他安装目录，使用该目录或设置 `SHOTDECODE_HOME`。从源码运行时，使用仓库的 Python 环境与 `app/shotdecode_cli.py`。如果尚未安装，可从 [ShotDecode Releases](https://github.com/lashawnaplikerd710-del/video-breakdown-workbench/releases/latest) 获取完整离线版。

- **新素材**：`analyze <视频路径、链接或分享文案>`。画面是日文时加 `--ocr-language ja`。需要单独的人声和配乐时加 `--stems`。指定项目父目录可加 `--output <目录>`。报告会在本地模型就绪时识别口播，并补充英、日语口播及英语画面文字的中译。任务日志写入 stderr，结果 JSON 写入 stdout。
- **已有项目**：`inspect <项目目录或 breakdown.json>`。返回镜头编号、起止时间、关键帧和报告路径。加 `--shot 2` 或 `--at 3.5` 查看该镜头的描述、证据和复刻提示词。
- **口播和字幕**：`subtitles <项目> [--start 0 --end 3]`。用 `original` 和 `chinese` 回答原文和中译问题。译文缺失时根据 `notes` 区分待补译与未识别；如果在聊天里补译，注明是本次给出的译文。
- **需要亲自核对画面**：先看 `inspect` 返回的关键帧。对切点或特定片段，运行 `frames <项目或视频> --start 0 --end 3 --every 0.5`，再打开返回的拼图。依据实际画面和时间码描述。

同一个素材已有可用项目时，沿用这个项目。复刻请求先给出原片能观察到的构图、动作、文字或节奏，再给适合目标生成工具的提示词。

如果当前智能体的文件权限挡住了 CLI，已有项目仍可通过读取 breakdown.json、report.md 和关键帧回答。说明使用了哪些文件。拆解新素材需要在能访问 ShotDecode 及素材目录的本机环境里运行命令。
