# ShotDecode

面向抖音和 TikTok 短视频的 Windows 本地工作台。可从原片提取镜头和字幕，查看拆解报告，替换镜头并导出新视频。

[下载 Windows 完整离线版](https://github.com/lashawnaplikerd710-del/shotdecode/releases/latest) · [观看实机演示](#实机演示) · [安装 ShotDecode Skill](#安装-shotdecode-skill)

## 实机演示

https://github.com/user-attachments/assets/97fabb5d-b4d3-439c-b128-3912a86f00fb

## 主要功能

- **本地上传**：从「新建拆解」选择或拖入视频，再开始拆解。
- **链接拆解**：粘贴公开的抖音或 TikTok 视频链接，也可以粘贴整段分享文案。点击「下载并开始拆解」，下载完成后自动分析。
- **逐镜查看**：在时间线定位镜头，查阅拆解报告、双语字幕和复刻提示词。校对字幕后可同步报告和 SRT。在「字幕与翻译」选择一条字幕轨并点击「加入字幕轨」，可在成片里继续编辑。需要压制到原片时，使用「导出带字幕原片」。
- 在**成片剪辑**中，从时间线选择镜头或手动字幕，在右侧选用入场、出场和循环动画。镜头可替换素材、调整裁剪和调色，也可混合音轨。保存的动画和画面调节会随 MP4 导出。
- 手动字幕的「字体」可按中文、日语、英语、西班牙语和本机字体筛选。内置字体支持离线预览，MP4 导出会使用所选字体。
- 在当前项目会话里，删除手动字幕、重置镜头属性和恢复提示词草稿后，可以用顶部的「撤销」或 Ctrl+Z 恢复。任务日志中的「复制诊断」会同时复制构建号、任务阶段和错误信息。

## 安装 Windows 版

适用于 Windows 10 / 11 x64。打开 [最新 Release](https://github.com/lashawnaplikerd710-del/shotdecode/releases/latest)，将 `ShotDecode-Setup-*-Offline.exe` 和它的全部同名 `.bin` 分卷下载到同一个文件夹，然后运行 `.exe`。

离线包包含 FFmpeg、Visual C++ x64 运行库、WebView2，以及中英日语口播转写、画面 OCR、中译和人声分轨所需的本地模型。安装向导会检测 Windows 运行组件。缺少时会启动随包提供的微软安装程序，安装 Visual C++ 可能需要在 Windows 权限窗口确认。安装完成后可离线拆解本机视频、编辑并导出。

抖音和 TikTok 链接下载需要联网。Agent 会使用本机 Agent 程序及其账号，外部视频生成使用已配置的服务。

## 在 Windows 上运行源码

需要 Windows 10/11 x64、64 位 Python 3.12（含 Tcl/Tk）、WebView2 Evergreen，以及 FFmpeg。先安装 [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)。如果本机缺少 VC++ x64 运行库，可从 [Microsoft](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist/) 安装。

在仓库根目录用 PowerShell 执行：

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pip install --force-reinstall --no-deps "opencv-python-headless>=4.8,<5"
```

最后一条命令恢复无 GUI 的 OpenCV 文件，避免 RapidOCR 的 OpenCV 依赖覆盖它。将 Windows 版的 `ffmpeg.exe` 和 `ffprobe.exe` 放入仓库根目录下的 `ffmpeg/`。接口按现有便携版结构查找这两个程序。然后启动：

```powershell
.\.venv\Scripts\python.exe .\app\studio.py
```

仓库内附可直接运行的前端资源。修改前端时，使用 Node.js 20+ 执行 `npm ci` 和 `npm run build`。界面功能源码在 `src/`，原始界面基线在 `web-base/`，构建结果在 `app/studio_web/`。

## 让本机 Agent 处理视频

- **在 Codex 对话中**，加载 [ShotDecode Skill](skills/shotdecode/SKILL.md)。用 `app/shotdecode_cli.py --help` 查看命令。`analyze` 生成拆解报告，`inspect`、`subtitles` 和 `frames` 读取项目、字幕与抽帧。
- **在软件中**，点击工作台左下角的模型名选择 Agent，或在「设置 → Agent」管理本机连接。点击右侧「Agent 指令」输入任务，再点「交给 Agent」，即可把当前视频、选中的镜头和播放位置带入左侧会话。也可以从左侧「对话」继续发送指令。
- **对话剪辑**。在消息中附带当前视频或项目，发送「剪掉开头 2 秒，把最后一个镜头移到最前」这样的指令。Agent 读取分镜或当前时间线后，可以直接修剪、分割、删减和重排片段，字幕、附加画面和音频跟随剪辑。结果会在成片剪辑里显示，会话保留每步和耗时。本轮编辑可用 Ctrl+Z 撤销。
- **从原始素材制作成片**。把视频拖入左侧对话的输入框，或点输入框旁的加号添加素材。发送「剪成一条节奏明快的产品种草短片，先展示产品亮点」即可开始。Agent 可以查看带时间码的参考画面、静音区间和本地口播转写（已安装模型时），自行挑片并在可编辑的时间线上展示成片。继续发送指令即可调整，或让 Agent 导出 MP4。
- 当会话显示「工作台工具已连接」时，Agent 可以读取分镜和中译、拆解当前视频、添加或修改字幕、导入译文轨道、保存镜头提示词和导出成片。需要替换镜头时，在输入区选择替换视频并随消息发送。时间线会显示已应用的编辑，会话会保留每条指令的执行步骤和耗时，新报告和成片可从会话里打开。

「设置 → Agent」的「常用」区列出 Codex、Claude Code 和 DeepSeek Harness。找到本机程序后点「连接」，也可以在连接设置中手动选择程序。

缺少本机程序时，「安装连接组件」会打开该 Agent 的官方安装入口，安装后可重新检测。Codex 和 Claude Code 还需要 ACP 连接组件，可在同一入口将组件安装到用户数据目录。下载需要带 npm 的 Node.js。旧版随包组件可在点击安装后从本机复用。登录沿用各 Agent 现有的账号状态。

项目内的对话会保存在本机。重开同一工程后，从左侧「对话」继续提问，也可以打开项目对话历史。工作台支持重试失败的工具步骤，连续的 Agent 编辑可用顶部「撤销」一起恢复。读取参考帧时会把画面返回给支持图像的模型。生成替换镜头使用已配置的 ComfyUI 工作流。

### 安装 ShotDecode Skill

从 [Release 下载 ShotDecode Skill](https://github.com/lashawnaplikerd710-del/shotdecode/releases/latest/download/shotdecode-skill.zip)，把解压得到的 `shotdecode` 文件夹放入 Codex 的个人 Skills 目录。Windows 上可使用 `%USERPROFILE%\.codex\skills\shotdecode`。重新打开 Codex 后，输入「用 $shotdecode 拆解这条视频，并结合抽帧说明前 3 秒怎么剪的」。

Skill 调用本机已安装的 ShotDecode。命令和示例见 [skills/shotdecode/SKILL.md](skills/shotdecode/SKILL.md)。

## 快速换品与成片编辑

- 左侧「项目工具」包含爆款分析、换品模板和版本。爆款分析从已有画面文字和口播提取带时间码的线索，可以添加对比项目和实际留存、转化数据。
- 在换品模板选择素材文件夹，按画幅和时长匹配镜头、试听或预览素材，再一次应用。可以保存参考模板及每个镜头的卖点要求。
- 从时间线的「轨道编辑」分割、修剪或移动镜头，也可以添加配乐和配音片段，设置各段位置、入出点及音量。项目版本会保存当前编辑和音轨设置，导出记录可直接打开成片。
- 在时间线上选中视频、手动字幕或添加的音频片段，可点工具栏的「分割」在播放头位置切开，拖动片段两端调整长度，或按 Backspace 删除。删除和修剪可以撤销。
- 编辑后，预览直接按时间线定位原片对应的画面，导出成片时再渲染。人声和配乐分轨默认展开。点击底部「添加轨道」可以新建多个视频轨和音频轨，空轨会随项目保存。附加视频轨的画面叠放在主轨上，音频轨参与工程混音。
- 顶部的下载图标打开时间线导出。可选择视频、音频或字幕，再在底部设置保存位置和文件名。视频默认导出一份 H.264 MP4，可使用横屏和竖屏预设或调整画幅、分辨率与帧率。
- 「导出 → 剪辑工程」可选择 Windows 电脑版剪映专业版或 CapCut。软件会把分镜、替换素材、音频轨和可编辑字幕一起写入草稿文件夹。有调色、裁剪或动画的片段会按当前效果单独渲染，完整原素材也会随草稿保留。默认使用检测到的草稿位置，可更改路径。导出完成后回到剪辑软件首页，从本地草稿打开。CapCut 会按导出时的路径读取素材，建议直接选择它的实际草稿目录。
- 「设置 → 通用」可以切换简体中文、繁体中文、英语、日语和西班牙语界面，也可以选择深色、浅色或跟随系统。报告语言仍使用视频拆解里的独立设置。

## 在工作台生成替换镜头

在「设置 → 视频生成」填写已启动的 ComfyUI 地址，选择从 ComfyUI 导出的 API 工作流 JSON，再选定正向提示词输入和可选的参考帧输入。工作流需要包含保存视频的节点。保存后，在项目中选中镜头，打开「提示词」并点击「生成并替换当前镜头」。工作台会把生成的视频存入项目并替换该镜头。需要批量生成时，可以在同一设置页配置 capsule-cinema，随后从「更多工具 → 批量生成与参考图」提交任务。

### 可选模型

核心镜头拆解由随源码提供的 rea-video 引擎执行。报告中译、口播转录、特定 OCR 和音轨分离按各功能使用本地模型。已有便携版时，可复制它的以下目录到源码根目录，保持原有文件名：

| 目录 | 功能 |
| --- | --- |
| `asr-model/`、`asr-model-ja/`、`asr-packages/` | 中英及多语言口播识别 |
| `translation/` | llama.cpp 本地翻译服务和 Hy-MT2 模型 |
| `models/` | 日语 OCR、脸部检测和音轨分离模型 |

组件出处和下载来源见 [第三方组件说明](THIRD_PARTY_NOTICES.txt)。音轨分离模型缺失时，分析引擎可尝试首次下载。链接拆解需要网络。基础分析在所需依赖和模型就绪后可本地运行。多模态分析、自动生成需要在「设置」中配置自己的服务。

设置存放在 `data/`。新拆解默认存放在 `projects/`，可在「设置」更改。

## 许可证

ShotDecode 原创代码采用 [MIT License](LICENSE)，版权署名为 ShotDecode contributors。第三方组件遵循各自许可证。

分析引擎基于 [JuneYaooo/rea-video](https://github.com/JuneYaooo/rea-video/tree/89e27e00ec6749da7ee2b23e76e0f90c604688d1)。`third_party/rea-video/` 中的上游代码和基于该引擎的修改保留 [Apache License 2.0](third_party/rea-video/LICENSE)、[原版权声明](third_party/rea-video/NOTICE) 及相应修改说明。

随附模型、FFmpeg、依赖、字体和图标保留原有许可证，见 [NOTICE](NOTICE)、[第三方组件说明](THIRD_PARTY_NOTICES.txt) 及各组件目录。
