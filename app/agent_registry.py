"""Discover local ACP clients, plus the optional Codex and Claude connectors."""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import threading
from dataclasses import dataclass
from pathlib import Path

import backend as be


@dataclass(frozen=True)
class Agent:
    name: str
    names: tuple[str, ...]
    website: str
    args: tuple[str, ...] = ()
    domestic: bool = False
    adapter: str = ''
    version: str = ''
    adapter_env: str = ''


AGENTS = {
    'codex': Agent('Codex', ('codex',), 'https://learn.chatgpt.com/docs/codex/cli',
                   adapter='codex-acp', version='2.7.0', adapter_env='CODEX_PATH'),
    'claude': Agent('Claude Code', ('claude',), 'https://code.claude.com/docs/en/setup',
                    adapter='claude-agent-acp', version='0.81.2', adapter_env='CLAUDE_CODE_EXECUTABLE'),
    'copilot': Agent('GitHub Copilot CLI', ('copilot',), 'https://github.com/features/copilot/cli', ('--acp',)),
    'cursor': Agent('Cursor Agent', ('cursor-agent',), 'https://cursor.com/cli', ('acp',)),
    'opencode': Agent('OpenCode', ('opencode',), 'https://opencode.ai/download', ('acp',)),
    'antigravity': Agent('Google Antigravity', ('agy',), 'https://antigravity.google/docs/getting-started?tab=cli', ('acp',)),
    'qwen': Agent('Qwen Code', ('qwen',), 'https://github.com/QwenLM/qwen-code', ('--acp',), True),
    'deepseek': Agent('DeepSeek Harness', ('dsh',), 'https://www.deepseek.com/harness/', ('--profile', 'acp'), True),
    'kimi': Agent('Kimi Code', ('kimi',), 'https://www.kimi.com/code/docs/en/kimi-code-cli/guides/getting-started.html', ('acp',), True),
    'codebuddy': Agent('CodeBuddy', ('codebuddy',), 'https://www.codebuddy.cn/docs/cli/installation', ('--acp',), True),
    'workbuddy': Agent('WorkBuddy', (), 'https://cloud.tencent.com/document/product/1831/137019', ('--acp',), True),
    'minimax': Agent('MiniMax Code', ('mcode', 'minimax', 'mmcode'), 'https://code.minimax.io/docs/cli/quick-start', ('acp',), True),
}
DEFAULT_ENABLED = ('codex', 'claude', 'opencode')
PROGRAM_TYPES = ('.exe', '.cmd', '.bat', '.js', '.mjs', '.cjs')


@dataclass(frozen=True)
class Provider:
    name: str
    command: tuple | str = ()
    env: dict | None = None
    detail: str = ''
    program: str = ''
    connector: str = ''


def first_file(paths):
    return next((str(path) for path in paths if path.is_file()), '')


def executable(names, locations=()):
    return next((path for name in names if (path := shutil.which(name))), '') or first_file(locations)


def launch(program, args=(), node=None, env=None):
    variables = dict(env or {})
    if Path(program).suffix.lower() in ('.js', '.mjs', '.cjs'):
        if not node:
            return (), variables
        return (node, program, *args), variables
    if os.name == 'nt' and Path(program).suffix.lower() in ('.cmd', '.bat'):
        # Only the fixed profile arguments reach cmd. The path is passed via the child environment.
        variables['SHOTDECODE_AGENT_LAUNCH_FILE'] = program
        interpreter = str(Path(os.environ.get('SystemRoot', 'C:/Windows')) / 'System32/cmd.exe')
        command = subprocess.list2cmdline((interpreter, '/d', '/v:off', '/s', '/c'))
        tail = subprocess.list2cmdline(args)
        return command + ' ""%SHOTDECODE_AGENT_LAUNCH_FILE%"' + (' ' + tail if tail else '') + '"', variables
    return (program, *args), variables


class Registry:
    def __init__(self):
        self.path = be.DATA / 'agent-settings.json'
        self.lock = threading.RLock()
        self.install_lock = threading.Lock()
        self.settings = be.load_json(self.path, {})

    @staticmethod
    def profile(key):
        if not isinstance(key, str) or key not in AGENTS:
            raise ValueError('请选择支持的 Agent。')
        return AGENTS[key]

    def change(self, key, field, value):
        agent = self.profile(key)
        if field == 'enabled':
            if not isinstance(value, bool):
                raise ValueError('请选择启用或停用。')
        elif field in ('program', 'connector') and (field != 'connector' or agent.adapter):
            if not isinstance(value, str):
                raise ValueError('请选择一个本机程序。')
            if value:
                path = Path(value)
                if not path.is_absolute() or not path.is_file() or path.suffix.lower() not in PROGRAM_TYPES:
                    raise ValueError('请选择可用的可执行程序、命令脚本或 JavaScript 入口。')
                value = str(path.resolve())
            else:
                value = ''
        else:
            raise ValueError('这个连接选项不可用。')
        with self.lock:
            updated = {**self.settings, key: {**self.settings.get(key, {}), field: value}}
            be.write_json(self.path, updated)
            self.settings = updated

    def enabled(self, key, available):
        with self.lock:
            return self.settings.get(key, {}).get('enabled', available and key in DEFAULT_ENABLED)

    @staticmethod
    def homes():
        return (Path(os.environ.get('LOCALAPPDATA') or Path.home() / 'AppData/Local'),
                Path(os.environ.get('APPDATA') or Path.home() / 'AppData/Roaming'))

    def node(self):
        local, _ = self.homes()
        return executable(('node',), (
            local / 'Programs/nodejs/node.exe',
            Path(os.environ.get('ProgramFiles', 'C:/Program Files')) / 'nodejs/node.exe',
            Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe',
        ))

    def program(self, key, agent, settings):
        if settings.get('program'):
            return first_file((Path(settings['program']),))
        local, roaming = self.homes()
        extra = []
        if key == 'codex':
            copies = (local / 'OpenAI/Codex/bin').glob('*/codex.exe')
            extra.extend(sorted(copies, key=lambda path: path.parent.name, reverse=True))
        if key == 'opencode':
            extra.append(Path.home() / '.opencode/bin/opencode.exe')
        if key == 'deepseek':
            extra.append(local / 'Programs/DeepSeek Harness/resources/runtime/cli/bin/dsh.cmd')
        if key == 'cursor':
            extra.extend(folder / name for folder in (
                Path.home() / '.cursor/bin', local / 'cursor-agent/bin'
            ) for name in ('cursor-agent.exe', 'agent.exe', 'agent.cmd'))
        paths = [path for name in agent.names for path in (
            Path.home() / '.local/bin' / (name + '.exe'),
            roaming / 'npm' / (name + '.cmd'),
            local / 'Microsoft/WinGet/Links' / (name + '.exe'),
        )]
        return executable(agent.names, (*extra, *paths))

    def npm_program(self):
        local, roaming = self.homes()
        return executable(('npm',), (roaming / 'npm/npm.cmd', local / 'Programs/nodejs/npm.cmd',
                                    Path(os.environ.get('ProgramFiles', 'C:/Program Files')) / 'nodejs/npm.cmd'))

    def adapter_entry(self, key, name, settings):
        if settings.get('connector'):
            return first_file((Path(settings['connector']),))
        _, roaming = self.homes()
        module = Path('@agentclientprotocol') / name / 'dist/index.js'
        installed = be.DATA / 'agent-connectors' / key
        copies = sorted(installed.glob('*/node_modules'), reverse=True)
        return first_file((
            *(path / module for path in copies),
            installed / 'node_modules' / module,
            roaming / 'npm/node_modules' / module,
        )) or executable((name,), (roaming / 'npm' / (name + '.cmd'),))

    @staticmethod
    def legacy_connector(agent):
        directory = (be.APP / 'agent-runtime' / agent.adapter).resolve()
        if directory.is_relative_to(be.APP / 'agent-runtime') and (directory / 'dist/index.js').is_file():
            return directory
        return None

    def resolve(self, key):
        agent = self.profile(key)
        with self.lock:
            settings = self.settings.get(key, {}).copy()
        binary = self.program(key, agent, settings)
        connector = self.adapter_entry(key, agent.adapter, settings) if agent.adapter else ''
        if not binary:
            detail = '指定程序已移动' if settings.get('program') else '未检测到本机程序'
            if key == 'workbuddy' and not settings.get('program'):
                detail = '请选择 WorkBuddy 的 ACP 命令行'
        elif agent.adapter and not connector:
            detail = '指定连接组件已移动' if settings.get('connector') else '缺少连接组件'
        else:
            variables = {agent.adapter_env: binary} if agent.adapter else {}
            if key == 'codebuddy' and 'CODEBUDDY_INTERNET_ENVIRONMENT' not in os.environ:
                variables['CODEBUDDY_INTERNET_ENVIRONMENT'] = 'internal'
            argv, env = launch(connector or binary, agent.args, self.node(), variables)
            if argv:
                return Provider(agent.name, argv, env, '可连接', binary, connector)
            detail = '需要 Node.js 运行连接组件'
        return Provider(agent.name, detail=detail, program=binary, connector=connector)

    def list(self):
        node = self.node()
        npm = self.npm_program()
        rows = []
        for key, agent in AGENTS.items():
            provider = self.resolve(key)
            needs_connector = bool(agent.adapter and not provider.connector)
            with self.lock:
                fields = self.settings.get(key, {})
            rows.append(dict(id=key, name=agent.name, domestic=agent.domestic,
                             enabled=self.enabled(key, bool(provider.command)), available=bool(provider.command),
                             detected=bool(provider.program), detail=provider.detail,
                             program=provider.program or fields.get('program', ''), manual=bool(fields.get('program')),
                             adapter=agent.adapter, connector=provider.connector or fields.get('connector', ''),
                             custom_connector=bool(fields.get('connector')), website=agent.website,
                             needs_connector=needs_connector,
                             installable=bool(needs_connector and node and (npm or self.legacy_connector(agent)))))
        return rows

    def install(self, key):
        agent = self.profile(key)
        if not agent.adapter:
            raise ValueError('该 Agent 使用自己的 ACP 程序。')
        legacy = self.legacy_connector(agent)
        npm = self.npm_program()
        if not self.node() or (not legacy and not npm):
            raise ValueError('请安装包含 npm 的 Node.js，或选择已有连接组件。')
        base = (be.DATA / 'agent-connectors').resolve()
        if not base.is_relative_to(be.DATA) or not (base / key).resolve().is_relative_to(base):
            raise ValueError('连接组件目录不可用。')
        base.mkdir(exist_ok=True)
        entry = Path('node_modules/@agentclientprotocol') / agent.adapter / 'dist/index.js'
        with self.install_lock:
            if self.adapter_entry(key, agent.adapter, {}):
                self.change(key, 'connector', '')
                return
            with tempfile.TemporaryDirectory(prefix=key + '-', dir=base) as directory:
                if legacy:
                    shutil.copytree(legacy, Path(directory) / entry.parent.parent)
                else:
                    args = ('install', '--ignore-scripts', '--omit=dev', '--omit=optional',
                            '--no-fund', '--no-audit', '--save-exact',
                            f'@agentclientprotocol/{agent.adapter}@{agent.version}')
                    argv, env = launch(npm, args)
                    try:
                        result = subprocess.run(argv, cwd=directory, env={**os.environ, **env},
                                                stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                                                stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW,
                                                timeout=180)
                    except subprocess.TimeoutExpired:
                        raise ValueError('连接组件安装超时，请重试。') from None
                    if result.returncode:
                        raise ValueError('安装未完成。请检查 npm 和网络，或选择已安装的连接组件。')
                if not (Path(directory) / entry).is_file():
                    raise ValueError('找不到安装完成的连接组件。')
                completed = be.new_folder(base / key, agent.adapter)
                packages = (Path(directory) / 'node_modules').resolve()
                destination = completed / 'node_modules'
                if not packages.is_relative_to(Path(directory).resolve()) or not destination.resolve().is_relative_to(base):
                    raise ValueError('连接组件目录不可用。')
                packages.rename(destination)
                self.change(key, 'connector', '')
