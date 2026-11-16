# Link import dependencies

## yt-dlp
- Upstream: https://github.com/yt-dlp/yt-dlp
- Version: 2026.10.21 (Unlicense). Install via requirements.txt.
- The app disables yt-dlp plugins and limits extractors to TikTok.

## link_download.py
- Adapted from the existing user-owned Framo agent_core/video_download.py.
- Retains its public-share parsing, strict Douyin redirect/CDN validation, MP4 verification and collision-safe publication.
- Workbench changes: callback-based cancellation, child reaping, local vendor path and tool discovery, input validation and Chinese workbench messages.
