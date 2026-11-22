# 从源码运行

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

### 可选模型

核心镜头拆解由随源码提供的 rea-video 引擎执行。报告中译、口播转录、特定 OCR 和音轨分离按各功能使用本地模型。已有便携版时，可复制它的以下目录到源码根目录，保持原有文件名：

| 目录 | 功能 |
| --- | --- |
| `asr-model/`、`asr-model-ja/`、`asr-packages/` | 中英及多语言口播识别 |
| `translation/` | llama.cpp 本地翻译服务和 Hy-MT2 模型 |
| `models/` | 日语 OCR、脸部检测和音轨分离模型 |

组件出处和下载来源见 [第三方组件说明](../THIRD_PARTY_NOTICES.txt)。音轨分离模型缺失时，分析引擎可尝试首次下载。链接拆解需要网络。基础分析在所需依赖和模型就绪后可本地运行。多模态分析、自动生成需要在「设置」中配置自己的服务。

设置存放在 `data/`。新拆解默认存放在 `projects/`，可在「设置」更改。

## 构建完整离线安装包

先构建前端，再用 Inno Setup 7 x64 编译安装包。Windows 自带的 .NET Framework 编译器用于生成启动程序。

```powershell
npm ci
npm run build
py -3.12 .\packaging\build_release.py --components "C:\ShotDecode-组件" --compiler "C:\Inno Setup 7\ISCC.exe" --output "C:\ShotDecode-构建"
```

`--components` 指向准备好的 Windows x64 组件目录。可从上一版完整离线包试装得到运行时，再补齐当前版本要求的组件。目录需包含 `runtime/`、`ffmpeg/`、`prerequisites/`、`models/`、`asr-model/`、`asr-model-ja/`、`asr-packages/`、`translation/` 和 `licenses/`。组件出处见 [第三方组件说明](../THIRD_PARTY_NOTICES.txt)。构建时会校验本地模型和微软安装程序，并随 FFmpeg 保留许可证及对应源码。

`--output` 使用新的目录。编译好的程序和数据分卷位于其 `release/` 目录。将这些文件放在一起运行安装程序。
