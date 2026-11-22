from __future__ import annotations

import ctypes
import os
import queue
import re
import shutil
import sys
import threading
import traceback
import tkinter as tk
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, font as tkfont, messagebox, ttk

from PIL import Image, ImageOps, ImageTk

import backend as be
import spoken_translation as mt
from workflows import (build_generation_jobs, check_runtime, match_clip_names, read_clip_results,
                       refresh_project_report, run_analysis, supplement_translation, verify_original)
from app_identity import APP_NAME, WINDOWS_APP_ID, engine_display_text
from workbench_theme import ACCENT, ACCENT_BG, ACCENT_RULE, BG, FONT, INK, MUTED, NAV, PAPER, RULE, SURFACE
from workbench_theme import Icons, apply_styles, dark_caption


NAV_ICONS = {'视频拆解': 'scan-line', '字幕与声音': 'captions', '时间线剪辑': 'scissors',
             '提示词与生成': 'sparkles', '实用工具': 'wrench', '设置': 'settings'}
ACTION_ICONS = {'开始拆解': 'play', '开始拼接': 'play', '打开已有项目': 'folder-open',
                '打开报告': 'file-text', '任务日志': 'terminal', '停止': 'square'}
VIDEO = [('视频', '*.mp4 *.mov *.mkv *.webm *.avi *.m4v *.wmv *.flv *.mts *.ts *.mpeg *.mpg'), ('所有文件', '*.*')]
AUDIO = [('音频', '*.wav *.mp3 *.m4a *.aac *.flac *.ogg *.opus *.wma'), ('所有文件', '*.*')]
IMAGE = [('图像', '*.png *.jpg *.jpeg *.webp *.bmp'), ('所有文件', '*.*')]
SUBS = [('字幕', '*.srt *.ass'), ('所有文件', '*.*')]


class Workbench:
    def __init__(self, root):
        self.root = root
        self.config = be.load_json(be.SETTINGS_FILE, {})
        self.project = None
        self.current = '视频拆解'
        self.pending = None
        self.events = queue.Queue()
        self.closing = False
        self.log_open = False
        self.selected_shot = None
        self.prompt_shot = None

        self.status = tk.StringVar(value='就绪')
        self.project_name = tk.StringVar(value='尚未打开项目')
        self.video = tk.StringVar()
        saved_output = str(be.project_output_dir(self.config.get('output')))
        self.output = tk.StringVar(value=saved_output)
        self.movie_output = tk.StringVar(value=str(be.movie_output_dir(self.config.get('movie_output'))))
        self.language = tk.StringVar(value=self.config.get('language', '中文'))
        self.ocr_language = tk.StringVar(value='ja' if self.config.get('ocr_language') in ('ja', '日文') else 'zh')
        self.speech_language = tk.StringVar(value='ja' if self.config.get('speech_language') == 'ja' else 'zh')
        self.ocr = tk.BooleanVar(value=True)
        self.packaging = tk.BooleanVar(value=True)
        self.stems = tk.BooleanVar(value=True)
        self.vlm = tk.BooleanVar(value=False)
        self.overlays = tk.BooleanVar(value=True)
        self.export_comparison = tk.BooleanVar(value=False)
        self.env_file = tk.StringVar(value=self.config.get('env_file', ''))
        self.vlm_base = tk.StringVar(value=self.config.get('vlm_base', ''))
        self.vlm_model = tk.StringVar(value=self.config.get('vlm_model', ''))
        self.vlm_key = tk.StringVar()
        self.capsule_root = tk.StringVar(value=self.config.get('capsule_root', ''))
        self.capsule_python = tk.StringVar(value=self.config.get('capsule_python', ''))
        self.engine = tk.StringVar(value=self.config.get('engine', 'seedance2.0'))
        self.mode = tk.StringVar(value='单张参考图')
        self.only_selected = tk.BooleanVar(value=False)
        self.caption_file = tk.StringVar()
        self.caption_video = tk.StringVar()
        self.tools_video = tk.StringVar()
        self.meta = tk.StringVar()
        self.tile_start = tk.StringVar(value='0')
        self.tile_end = tk.StringVar(value='3')
        self.tile_every = tk.StringVar(value='0.25')
        self.audio_mode = tk.StringVar(value='沿用原片')
        self.audio_file = tk.StringVar()

        self.setup_window()
        self.theme_images = apply_styles(root)
        self.icons = Icons(root)
        self.layout()
        self.switch('视频拆解')
        self.root.after_idle(lambda: dark_caption(self.root))
        self.root.after(80, self.poll)

    def setup_window(self):
        self.root.title(APP_NAME)
        self.root.configure(bg=BG)
        self.root.option_add('*Font', (FONT, 10))
        if (be.APP / 'workbench.ico').is_file():
            self.root.iconbitmap(str(be.APP / 'workbench.ico'))
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        width, height = min(1300, screen_w - 60), min(880, screen_h - 90)
        self.root.geometry(f'{width}x{height}+{max(12, (screen_w - width) // 2)}+{max(12, (screen_h - height) // 2)}')
        self.root.minsize(min(920, width), min(650, height))
        self.root.protocol('WM_DELETE_WINDOW', self.close)
        self.root.report_callback_exception = self.callback_error

    def layout(self):
        self.root.grid_columnconfigure(0, minsize=196)
        self.root.grid_columnconfigure(1, weight=1)
        self.root.grid_rowconfigure(1, weight=1)
        side = tk.Frame(self.root, bg=NAV)
        side.grid(row=0, column=0, rowspan=3, sticky='nsew')
        brand = tk.Frame(side, bg=NAV)
        brand.pack(fill='x', padx=17, pady=(21, 24))
        icon = be.APP / 'workbench.ico'
        if icon.is_file():
            with Image.open(icon) as mark:
                self.brand_image = ImageTk.PhotoImage(mark.resize((36, 36), Image.Resampling.LANCZOS), master=self.root)
            tk.Label(brand, image=self.brand_image, bg=NAV).pack(side='left', padx=(0, 9))
        self.label(brand, APP_NAME, bg=NAV, size=14, bold=True).pack(side='left')
        main_nav = tk.Frame(side, bg=NAV)
        main_nav.pack(fill='x', padx=12)
        tool_nav = tk.Frame(side, bg=NAV)
        tool_nav.pack(fill='x', side='bottom', padx=12, pady=(0, 15))
        tk.Frame(tool_nav, bg=RULE, height=1).pack(fill='x', padx=8, pady=(0, 8))
        self.nav = {}
        for name, icon in NAV_ICONS.items():
            parent = tool_nav if name in ('实用工具', '设置') else main_nav
            button = ttk.Button(parent, text=name, image=self.icons.get(icon), compound='left',
                                command=lambda key=name: self.switch(key), style='Navigation.TButton', cursor='hand2')
            button.pack(fill='x', pady=2)
            self.nav[name] = button

        top = tk.Frame(self.root, bg=NAV)
        top.grid(row=0, column=1, sticky='ew')
        top.columnconfigure(0, weight=1)
        project_bar = tk.Frame(top, bg=NAV)
        project_bar.grid(row=0, column=0, padx=25, pady=9, sticky='ew')
        tk.Label(project_bar, image=self.icons.tile('folder', 32, fill=SURFACE, color=MUTED), bg=NAV).pack(side='left', padx=(0, 8))
        info = tk.Frame(project_bar, bg=NAV)
        info.pack(side='left', fill='x', expand=True)
        self.label(info, '当前项目', bg=NAV, fg=MUTED, size=8).pack(anchor='w')
        self.project_font = tkfont.Font(root=self.root, family=FONT, size=10, weight='bold')
        self.project_label = tk.Label(info, textvariable=self.project_name, bg=NAV, fg=INK, font=self.project_font, anchor='w')
        self.project_label.pack(fill='x')
        self.project_label.bind('<Configure>', self.fit_project_name)
        self.report_button = self.button(top, '打开报告', lambda: self.open_file(self.require_project().folder / 'report.html'))
        self.report_button.grid(row=0, column=1, padx=(8, 0), pady=9)
        self.report_button.grid_remove()
        self.button(top, '打开已有项目', self.choose_project).grid(row=0, column=2, padx=(8, 23), pady=9)
        tk.Frame(top, bg=RULE, height=1).grid(row=1, column=0, columnspan=3, sticky='ew')

        workspace = tk.Frame(self.root, bg=BG)
        workspace.grid(row=1, column=1, sticky='nsew')
        workspace.grid_rowconfigure(0, weight=1)
        workspace.grid_columnconfigure(0, weight=1)
        self.canvas = tk.Canvas(workspace, bg=BG, highlightthickness=0)
        self.canvas.grid(row=0, column=0, sticky='nsew')
        scroll = ttk.Scrollbar(workspace, orient='vertical', command=self.canvas.yview)
        scroll.grid(row=0, column=1, sticky='ns')
        self.canvas.configure(yscrollcommand=scroll.set)
        self.body = tk.Frame(self.canvas, bg=BG)
        self.viewport = self.canvas.create_window((0, 0), window=self.body, anchor='nw')
        self.canvas.bind('<Configure>', lambda event: self.canvas.itemconfigure(self.viewport, width=event.width))
        self.body.bind('<Configure>', lambda _: self.canvas.configure(scrollregion=self.canvas.bbox('all')))
        self.root.bind_all('<MouseWheel>', self.scroll_page, add='+')

        footer = tk.Frame(self.root, bg=NAV)
        footer.grid(row=2, column=1, sticky='ew')
        tk.Frame(footer, bg=RULE, height=1).pack(fill='x')
        row = tk.Frame(footer, bg=NAV)
        row.pack(fill='x', padx=19, pady=5)
        row.columnconfigure(1, weight=1)
        self.status_dot = tk.Canvas(row, width=12, height=12, bg=NAV, highlightthickness=0)
        self.status_dot.create_oval(3, 3, 9, 9, fill='#72d5af', outline='', tags='dot')
        self.status_dot.grid(row=0, column=0, padx=(1, 7))
        tk.Label(row, textvariable=self.status, bg=NAV, fg=MUTED, anchor='w', font=(FONT, 9)).grid(row=0, column=1, sticky='ew')
        self.progress = ttk.Progressbar(row, mode='determinate', length=94, value=0)
        self.progress.grid(row=0, column=2, padx=10)
        self.progress.grid_remove()
        self.cancel_button = self.button(row, '停止', self.cancel, compact=True)
        self.cancel_button.grid(row=0, column=3, padx=4)
        self.cancel_button.state(['disabled'])
        self.log_button = self.button(row, '任务日志', self.toggle_log, compact=True)
        self.log_button.grid(row=0, column=4, padx=(5, 0))
        self.log_panel = tk.Frame(footer, bg=NAV)
        self.log = self.text_box(self.log_panel, 8, bg=BG, font=('Consolas', 10))
        self.log.configure(state='disabled')

    def fit_project_name(self, _=None):
        if self.project is None:
            return
        name = self.project.name
        width = self.project_label.winfo_width() - 5
        if width < 10:
            return
        if self.project_font.measure(name) > width:
            trimmed = name[:80]
            while trimmed and self.project_font.measure(trimmed + '…') > width:
                trimmed = trimmed[:-1]
            name = trimmed + '…'
        if self.project_name.get() != name:
            self.project_name.set(name)

    def scroll_page(self, event):
        widget = self.root.winfo_containing(event.x_root, event.y_root)
        while widget is not None and widget is not self.canvas:
            if isinstance(widget, (tk.Text, ttk.Treeview, ttk.Combobox)):
                return
            widget = widget.master
        if widget is self.canvas:
            self.canvas.yview_scroll(-int(event.delta / 120) * 3, 'units')

    @staticmethod
    def label(parent, text, *, bg=PAPER, fg=INK, size=10, bold=False, wrap=0):
        return tk.Label(parent, text=text, bg=bg, fg=fg, font=(FONT, size, 'bold' if bold else 'normal'),
                        justify='left', anchor='w', wraplength=wrap)

    def note(self, parent, text, wrap=760):
        widget = self.label(parent, text, fg=MUTED, size=9, wrap=wrap)
        widget.pack(fill='x', pady=(4, 3), anchor='w')

        def wrap_to_width(event):
            width = max(1, min(wrap, event.width - 2))
            if int(widget.cget('wraplength')) != width:
                widget.configure(wraplength=width)

        widget.bind('<Configure>', wrap_to_width)
        return widget

    def button(self, parent, label, command, *, primary=False, compact=False):
        style = 'Accent.TButton' if primary else 'Compact.TButton' if compact else 'TButton'
        icon = ACTION_ICONS.get(label)
        image = self.icons.get(icon, BG if primary else MUTED, 15) if icon else ''
        return ttk.Button(parent, text=label, command=command, style=style, image=image, compound='left', cursor='hand2')

    def actions(self, parent, *actions):
        row = tk.Frame(parent, bg=PAPER)
        row.pack(fill='x', pady=(10, 0))
        for label, command, primary in actions:
            self.button(row, label, command, primary=primary).pack(side='left', padx=(0, 7))
        return row

    def combo(self, parent, variable, values, width=13):
        return ttk.Combobox(parent, textvariable=variable, values=values, width=width, state='readonly')

    @staticmethod
    def language_buttons(parent, variable):
        for code, name in (('zh', '中文 / 英文'), ('ja', '日语 / 日本語')):
            ttk.Radiobutton(parent, text=name, variable=variable, value=code).pack(side='left', padx=(0, 12))

    def title(self, title, subtitle=None, action=None):
        header = tk.Frame(self.page, bg=BG)
        header.pack(fill='x')
        self.label(header, title, bg=BG, size=26, bold=True).pack(side='left')
        if action:
            self.button(header, action[0], action[1], primary=True).pack(side='right')
        if subtitle:
            self.label(self.page, subtitle, bg=BG, fg=MUTED, size=10, wrap=780).pack(fill='x', pady=(3, 18), anchor='w')

    def card(self, title, parent=None, *, icon=None):
        frame = ttk.Frame(parent if parent is not None else self.page, style='Card.TFrame')
        frame.pack(fill='x', pady=(0, 14))
        content = tk.Frame(frame, bg=PAPER)
        content.pack(fill='x', padx=17, pady=(14, 16))
        heading = tk.Frame(content, bg=PAPER)
        heading.pack(fill='x', pady=(0, 10))
        if icon:
            tk.Label(heading, image=self.icons.get(icon, ACCENT, 17), bg=PAPER).pack(side='left', padx=(0, 7))
        self.label(heading, title, size=12, bold=True).pack(side='left')
        return content

    def field(self, parent, label, variable, choose=None, *, button='浏览…', label_width=13):
        row = tk.Frame(parent, bg=PAPER)
        row.pack(fill='x', pady=4)
        label_widget = self.label(row, label, size=9)
        label_widget.configure(width=label_width)
        label_widget.pack(side='left', ipadx=2)
        entry = ttk.Entry(row, textvariable=variable)
        entry.pack(side='left', fill='x', expand=True, padx=(6, 8))
        if choose is not None:
            self.button(row, button, choose).pack(side='right')
        return entry

    @staticmethod
    def text_box(parent, height, *, bg=PAPER, fg=INK, font=None, expand=False):
        box = tk.Frame(parent, bg=bg)
        box.pack(fill='both' if expand else 'x', expand=expand, pady=3)
        box.columnconfigure(0, weight=1)
        box.rowconfigure(0, weight=1)
        text = tk.Text(box, height=height, wrap='word', bg=bg, fg=fg, bd=0,
                       highlightbackground=RULE, highlightcolor=ACCENT, highlightthickness=1,
                       insertbackground=fg, selectbackground=ACCENT_BG, selectforeground=INK,
                       font=font or (FONT, 10), padx=10, pady=8)
        text.grid(row=0, column=0, sticky='nsew')
        scroll = ttk.Scrollbar(box, orient='vertical', command=text.yview)
        scroll.grid(row=0, column=1, sticky='ns')
        text.configure(yscrollcommand=scroll.set)
        return text

    def choose(self, var, types=VIDEO, *, title='选择文件'):
        path = self.ask_file(types, title, var.get())
        if path:
            var.set(str(path))
        return path

    def ask_file(self, types, title, current=''):
        candidate = Path(current).expanduser() if current else None
        start = candidate.parent if candidate and candidate.parent.is_dir() else Path.home()
        selected = filedialog.askopenfilename(parent=self.root, title=title, filetypes=types, initialdir=start)
        return Path(selected).resolve() if selected else None

    def choose_folder(self, variable):
        path = filedialog.askdirectory(parent=self.root, initialdir=variable.get() or str(Path.home()))
        if path:
            variable.set(path)

    def save_as(self, title, default, extensions):
        directory = self.project.folder if self.project else Path(self.output.get())
        path = filedialog.asksaveasfilename(parent=self.root, title=title, initialfile=default,
                                            initialdir=directory if directory.is_dir() else Path.home(),
                                            filetypes=extensions, defaultextension=Path(default).suffix)
        return Path(path).resolve() if path else None

    def existing_file(self, value, title):
        if not value or not Path(value).expanduser().is_file():
            raise ValueError(f'请选择{title}。')
        return Path(value).expanduser().resolve()

    def open_file(self, path):
        if path is None or not Path(path).exists():
            raise ValueError('该文件尚未生成，或已经移动。')
        os.startfile(str(Path(path).resolve()))

    def copy_asset(self, path, title):
        source = self.existing_file(path, '已生成的文件')
        dest = self.save_as(title, source.name, [(source.suffix.upper().lstrip('.'), '*' + source.suffix), ('所有文件', '*.*')])
        if dest and source != dest:
            shutil.copyfile(source, dest)
            self.status.set(f'已保存 · {dest.name}')

    def settings(self):
        self.config.update({
            'output': self.output.get(), 'language': self.language.get(), 'ocr_language': self.ocr_language.get(),
            'speech_language': self.speech_language.get(),
            'env_file': self.env_file.get(), 'vlm_base': self.vlm_base.get(), 'vlm_model': self.vlm_model.get(),
            'capsule_root': self.capsule_root.get(),
            'capsule_python': self.capsule_python.get(), 'engine': self.engine.get(),
        })
        be.write_json(be.SETTINGS_FILE, self.config)

    def switch(self, name):
        if self.current == '提示词与生成' and getattr(self, 'prompt_text', None) is not None and self.prompt_text.winfo_exists():
            self.store_prompt()
        self.current = name
        for key, button in self.nav.items():
            active = key == name
            button.state(['selected' if active else '!selected'])
            button.configure(image=self.icons.get(NAV_ICONS[key], ACCENT if active else MUTED))
        for widget in self.body.winfo_children():
            widget.destroy()
        self.page_images = []
        self.page = tk.Frame(self.body, bg=BG)
        self.page.pack(fill='x', padx=25, pady=20)
        self.canvas.yview_moveto(0)
        pages = {'视频拆解': self.analysis_page, '字幕与声音': self.media_page, '时间线剪辑': self.edit_page,
                 '提示词与生成': self.prompt_page, '实用工具': self.tools_page, '设置': self.settings_page}
        pages[name]()

    def choose_project(self):
        if self.pending:
            raise ValueError('请等当前任务结束后再切换项目。')
        current = str(self.project.path) if self.project else self.output.get()
        path = self.ask_file([('项目文件', '*.json')], '打开 breakdown.json', current)
        if path:
            self.load_project(path)

    def load_project(self, path):
        if self.current == '提示词与生成' and getattr(self, 'prompt_text', None) is not None and self.prompt_text.winfo_exists():
            self.store_prompt()
            self.prompt_shot = None
        self.project = be.Project(path)
        if (self.project.folder / 'report.html').is_file():
            self.report_button.grid()
        else:
            self.report_button.grid_remove()
        self.root.after_idle(self.fit_project_name)
        self.selected_shot = next(iter(self.project.shots))
        self.video.set(str(self.project.source))
        self.caption_video.set('')
        self.caption_file.set('')
        self.tools_video.set('')
        recent = [entry for entry in self.config.get('recent', []) if entry != str(path) and Path(entry).is_file()]
        self.config['recent'] = [str(path), *recent][:6]
        self.settings()
        self.switch(self.current)

    def require_project(self):
        if not self.project:
            raise ValueError('请先拆解一个视频，或打开已有项目。')
        return self.project

    def empty_project(self, title, subtitle):
        self.title(title, subtitle)
        box = self.card('选择项目')
        self.note(box, '先拆解参考视频，或从以前的输出目录打开 breakdown.json。')
        self.actions(box, ('去拆解', lambda: self.switch('视频拆解'), True), ('打开已有项目', self.choose_project, False))

    def job_dir(self, name):
        if self.pending:
            raise ValueError('请等当前任务结束，或点击「停止」。')
        target = (self.project.folder / 'exports') if self.project else self.output_dir()
        return be.new_folder(target, name)

    def output_dir(self):
        if not self.output.get().strip():
            raise ValueError('请选择项目保存目录。')
        return Path(self.output.get()).expanduser().resolve()

    def start(self, title, action, done=None, *, show_log=False):
        if self.pending:
            raise ValueError('已有任务在运行，可以等待完成或点击「停止」。')
        self.status.set(title + '…')
        self.write_log('\n' + title + '\n')
        self.progress.configure(mode='indeterminate')
        self.progress.grid()
        self.progress.start(12)
        self.status_dot.itemconfigure('dot', fill=ACCENT)
        self.cancel_button.state(['!disabled'])
        if show_log and not self.log_open:
            self.toggle_log()
        job = be.Job(lambda line: self.events.put(('log', line)))
        self.pending = job

        def worker():
            try:
                result = action(job)
                job.check()
            except be.Cancelled:
                self.events.put(('cancelled', title))
            except Exception as exc:
                self.events.put(('error', (title, str(exc))))
            else:
                self.events.put(('done', (title, done, result)))

        threading.Thread(target=worker, daemon=True).start()

    def poll(self):
        for _ in range(120):
            try:
                event, value = self.events.get_nowait()
            except queue.Empty:
                break
            if event == 'log':
                self.write_log(value + '\n')
                continue
            self.pending = None
            self.progress.stop()
            self.progress.configure(mode='determinate', value=0)
            self.progress.grid_remove()
            self.status_dot.itemconfigure('dot', fill={'error': '#f399a5', 'cancelled': '#e5bc7b'}.get(event, '#72d5af'))
            self.cancel_button.state(['disabled'])
            if self.closing:
                self.root.destroy()
                return
            if event == 'done':
                title, done, result = value
                self.status.set('已完成 · ' + title)
                if done:
                    try:
                        done(result)
                    except Exception:
                        self.callback_error(*sys.exc_info())
            elif event == 'cancelled':
                self.status.set('已停止 · ' + value)
            else:
                title, detail = value
                self.status.set('任务失败 · ' + title)
                self.write_log(detail + '\n')
                messagebox.showerror(title, engine_display_text(detail)[-1200:] or '请查看任务日志。', parent=self.root)
        self.root.after(80, self.poll)

    def write_log(self, text):
        self.log.configure(state='normal')
        self.log.insert('end', engine_display_text(text))
        if int(self.log.index('end-1c').split('.')[0]) > 2200:
            self.log.delete('1.0', '301.0')
        self.log.see('end')
        self.log.configure(state='disabled')

    def toggle_log(self):
        self.log_open = not self.log_open
        if self.log_open:
            self.log_panel.pack(fill='x', padx=16, pady=(0, 8))
        else:
            self.log_panel.pack_forget()
        self.log_button.configure(text='收起日志' if self.log_open else '任务日志')

    def cancel(self):
        if self.pending:
            self.status.set('正在停止…')
            self.cancel_button.state(['disabled'])
            self.pending.cancel()

    def close(self):
        if self.pending and not messagebox.askyesno('停止任务', '停止当前任务并关闭工作台？', parent=self.root):
            return
        if self.current == '提示词与生成':
            self.store_prompt()
        self.settings()
        if self.pending:
            self.closing = True
            self.cancel()
        else:
            self.root.destroy()

    def callback_error(self, kind, value, trace):
        if not isinstance(value, (ValueError, FileNotFoundError)):
            self.write_log(''.join(traceback.format_exception(kind, value, trace)))
        messagebox.showerror(APP_NAME, engine_display_text(str(value)) or '请查看任务日志。', parent=self.root)

    def analysis_page(self):
        self.title('视频拆解', '从参考视频提取镜头、字幕和音轨，生成拆解报告。', action=('开始拆解', self.decompose))
        panels = tk.Frame(self.page, bg=BG)
        panels.pack(fill='x')
        panels.columnconfigure(0, weight=1)
        form = tk.Frame(panels, bg=BG)
        form.grid(row=0, column=0, sticky='new')
        rail = tk.Frame(panels, bg=BG)
        rail.grid(row=1, column=0, sticky='new')

        def arrange(event):
            wide = event.width >= 828
            if wide == (int(rail.grid_info()['column']) == 1):
                return
            panels.columnconfigure(1, minsize=300 if wide else 0)
            rail.grid_configure(row=0 if wide else 1, column=1 if wide else 0, padx=(15, 0) if wide else 0)

        panels.bind('<Configure>', arrange)
        source = self.card('参考视频', form, icon='file-video')
        picker = tk.Frame(source, bg=SURFACE, highlightbackground=RULE, highlightthickness=1)
        picker.pack(fill='x', pady=(0, 7))
        tk.Label(picker, image=self.icons.tile('clapperboard', 36), bg=SURFACE).pack(side='left', padx=(10, 8))
        self.button(picker, '选择视频…', lambda: self.choose(self.video, title='选择参考视频')).pack(side='right', padx=10)
        pick_copy = tk.Frame(picker, bg=SURFACE)
        pick_copy.pack(side='left', fill='x', expand=True, pady=8)
        heading = tk.Frame(pick_copy, bg=SURFACE)
        heading.pack(fill='x', pady=(0, 3))
        self.label(heading, '视频文件', bg=SURFACE, size=9, bold=True).pack(side='left', padx=(0, 8))
        self.label(heading, 'MP4、MOV、MKV、WebM 等', bg=SURFACE, fg=MUTED, size=8).pack(side='left')
        ttk.Entry(pick_copy, textvariable=self.video).pack(fill='x')
        self.field(source, '保存目录', self.output, lambda: self.choose_folder(self.output), label_width=9)

        box = self.card('拆解选项', form, icon='sliders-horizontal')
        languages = tk.Frame(box, bg=PAPER)
        languages.pack(fill='x')
        ocr = tk.Frame(languages, bg=PAPER)
        ocr.pack(side='left', padx=(0, 24))
        self.label(ocr, '字幕识别语言', fg=MUTED, size=9).pack(anchor='w', pady=(0, 3))
        ocr_options = tk.Frame(ocr, bg=PAPER)
        ocr_options.pack(anchor='w')
        self.language_buttons(ocr_options, self.ocr_language)
        report = tk.Frame(languages, bg=PAPER)
        report.pack(side='left')
        self.label(report, '报告语言', fg=MUTED, size=9).pack(anchor='w', pady=(0, 3))
        self.combo(report, self.language, ['中文', 'English'], 9).pack(anchor='w')

        translation = tk.Frame(box, bg=ACCENT_BG, highlightbackground=ACCENT_RULE, highlightthickness=1)
        translation.pack(fill='x', pady=(12, 9))
        tk.Label(translation, image=self.icons.get('languages', ACCENT, 20), bg=ACCENT_BG).pack(side='left', padx=(11, 7))
        translation_copy = tk.Frame(translation, bg=ACCENT_BG)
        translation_copy.pack(side='left', pady=(6, 8))
        self.label(translation_copy, '报告自动附中文译文', bg=ACCENT_BG, size=9, bold=True).pack(anchor='w')
        self.label(translation_copy, '英文画面文字、英文和日语口播', bg=ACCENT_BG,
                   fg=MUTED, size=9).pack(anchor='w')

        options = tk.Frame(box, bg=PAPER)
        options.pack(fill='x')
        checks = (('识别画面文字', self.ocr), ('分析剪辑包装', self.packaging), ('分离音轨', self.stems), ('多模态分析', self.vlm))
        for index, (label, variable) in enumerate(checks):
            ttk.Checkbutton(options, text=label, variable=variable).grid(row=index // 2, column=index % 2, sticky='w', padx=(0, 18))

        if self.project:
            self.analysis_results(rail)
        self.recent_projects(rail)

    def project_cover(self, folder, data, size):
        shot = next(iter(data.get('shots', [])), {})
        first_frame = shot.get('assets', {}).get('first_frame')
        if first_frame:
            try:
                with Image.open(folder / first_frame) as original:
                    image = ImageOps.fit(original.convert('RGB'), size, Image.Resampling.LANCZOS)
                photo = ImageTk.PhotoImage(image, master=self.root)
                self.page_images.append(photo)
                return photo
            except OSError:
                pass
        return self.icons.tile('image', min(size), fill=SURFACE, color=MUTED)

    def analysis_results(self, parent):
        project = self.project
        result = self.card('拆解结果', parent, icon='file-text')
        source = project.data['source']
        details = tk.Frame(result, bg=PAPER)
        details.pack(fill='x', pady=(0, 10))
        cover = self.project_cover(project.folder, project.data, (61, 45))
        tk.Label(details, image=cover, bg=PAPER).pack(side='left', padx=(0, 9))
        meta = tk.Frame(details, bg=PAPER)
        meta.pack(side='left')
        self.label(meta, f'{len(project.shots)} 个镜头 · {source.get("duration", 0):.2f} 秒', bold=True).pack(anchor='w')
        self.label(meta, f'{source.get("width", "?")} × {source.get("height", "?")}', fg=MUTED, size=9).pack(anchor='w')
        verdict = project.data.get('summary', {}).get('verdict')
        if verdict:
            self.note(result, verdict[:64] + ('…' if len(verdict) > 64 else ''), wrap=235)
        self.button(result, '打开报告', lambda: self.open_file(project.folder / 'report.html'), primary=True).pack(fill='x')
        self.button(result, '补写报告译文', self.translate_existing).pack(fill='x', pady=(6, 0))
        row = tk.Frame(result, bg=PAPER)
        row.pack(fill='x', pady=(6, 0))
        for label, command in (('分镜图', lambda: self.open_file(project.folder / 'storyboard.jpg')),
                               ('去剪辑', lambda: self.switch('时间线剪辑')),
                               ('打开项目文件夹', lambda: self.open_file(project.folder))):
            self.button(row, label, command, compact=True).pack(side='left', padx=(0, 4))

    def recent_projects(self, parent):
        recent = [Path(path) for path in self.config.get('recent', []) if Path(path).is_file()]
        box = self.card('最近项目', parent, icon='history')
        if not recent:
            self.note(box, '拆解或打开项目后，会在这里显示。', wrap=235)
        for index, path in enumerate(recent[:4]):
            if index:
                tk.Frame(box, bg=RULE, height=1).pack(fill='x', pady=8)
            try:
                data = be.load_json(path, {})
            except (OSError, ValueError):
                data = {}
            if not isinstance(data, dict):
                data = {}
            row = tk.Frame(box, bg=PAPER)
            row.pack(fill='x')
            self.button(row, '打开', lambda p=path: self.load_recent(p), compact=True).pack(side='right', padx=(7, 0))
            thumbnail = self.project_cover(path.parent, data, (43, 39))
            tk.Label(row, image=thumbnail, bg=PAPER).pack(side='left', padx=(0, 8))
            caption = tk.Frame(row, bg=PAPER)
            caption.pack(side='left', fill='x', expand=True)
            source = data.get('source', {})
            name = source.get('filename') or Path(source.get('path', '')).name or path.parent.name
            self.label(caption, name if len(name) <= 22 else name[:20] + '…', size=9, bold=True, wrap=144).pack(fill='x')
            if re.match(r'^\d{8}-\d{6} ', path.parent.name):
                try:
                    date = datetime.strptime(path.parent.name[:15], '%Y%m%d-%H%M%S')
                    self.label(caption, date.strftime('%m-%d  %H:%M'), fg=MUTED, size=8).pack(anchor='w')
                except ValueError:
                    pass

    def load_recent(self, path):
        if self.pending:
            raise ValueError('请等当前任务结束后再切换项目。')
        self.load_project(path)

    def decompose(self):
        if self.pending:
            raise ValueError('请等当前任务结束，或点击「停止」。')
        source = self.existing_file(self.video.get(), '参考视频')
        if self.ocr.get() and self.ocr_language.get() == 'ja' and not be.JAPANESE_OCR_MODEL.is_file():
            raise ValueError('找不到本地日语 OCR 模型，请在设置里检查运行环境。')
        use_vlm = self.vlm.get()
        env_file = self.existing_file(self.env_file.get(), '设置中的模型配置文件') if use_vlm and self.env_file.get() else None
        extra_env = {}
        if use_vlm and not env_file:
            extra_env = {'REA_VLM_BASE_URL': self.vlm_base.get().strip(), 'REA_VLM_MODEL': self.vlm_model.get().strip(),
                         'REA_VLM_API_KEY': self.vlm_key.get().strip()}
            if not all(extra_env.values()):
                raise ValueError('开启多模态分析前，请在设置里填写服务地址、模型名和本次会话密钥，或选择已有 .env。')
        meta = self.existing_file(self.meta.get(), '平台元数据 JSON') if self.meta.get() else None
        self.settings()
        out = be.new_folder(self.output_dir(), source.stem)
        options = dict(ocr_language=self.ocr_language.get(), report_language='zh' if self.language.get() == '中文' else 'en',
                       ocr=self.ocr.get(), packaging=self.packaging.get(), stems=self.stems.get(), vlm=use_vlm,
                       engine=self.engine.get())

        def done(status):
            self.load_project(out / 'breakdown.json')
            if status:
                self.status.set(status)

        self.start('拆解视频',
                   lambda job: run_analysis(job, source, out, options, env_file=env_file, extra_env=extra_env, meta=meta), done)

    def translate_existing(self):
        project = self.require_project()

        def done(status):
            self.status.set(status)
            self.open_file(project.folder / 'report.html')

        self.start('补写报告译文', lambda job: supplement_translation(job, project), done)

    def media_page(self):
        self.title('字幕与声音', '提取画面字幕、转写口播，或把字幕压入一段视频。')
        if self.project:
            folder = self.project.folder
            box = self.card('当前项目的字幕', icon='captions')
            srt = folder / 'packaging/subtitles.srt'
            ass = folder / 'packaging/overlays.ass'
            self.note(box, '画面字幕来自 OCR。SRT 保存文本和时间，ASS 同时保存近似位置和样式。')
            self.actions(box, ('查看 SRT', lambda: self.display_text('画面字幕', srt.read_text(encoding='utf-8-sig')), False),
                         ('另存 SRT', lambda: self.copy_asset(srt, '另存 SRT'), False),
                         ('另存 ASS', lambda: self.copy_asset(ass, '另存 ASS'), False))
            zh = folder / mt.ZH_SRT
            if zh.is_file():
                self.actions(box, ('查看口播中文译文', lambda: self.display_text('口播中文译文', zh.read_text(encoding='utf-8')), False),
                             ('另存中文口播 SRT', lambda: self.copy_asset(zh, '另存中文口播 SRT'), False))
            english_zh = folder / mt.EN_ZH_SRT
            if english_zh.is_file():
                self.actions(box, ('查看英文口播中译', lambda: self.display_text('英文口播中译', english_zh.read_text(encoding='utf-8')), False),
                             ('另存英文口播中译 SRT', lambda: self.copy_asset(english_zh, '另存英文口播中译 SRT'), False))
            if not srt.is_file():
                self.note(box, '当前项目没有提取到画面字幕，可以在下方转写口播。')
        box = self.card('口播转写与音轨分离', icon='languages')
        default_video = str(self.project.source) if self.project else self.video.get()
        if not self.caption_video.get() and default_video:
            self.caption_video.set(default_video)
        self.field(box, '视频或音频', self.caption_video,
                   lambda: self.choose(self.caption_video, VIDEO[:1] + AUDIO, title='选择要处理的媒体'))
        row = tk.Frame(box, bg=PAPER)
        row.pack(fill='x', pady=(5, 1))
        self.label(row, '口播语言', size=9, bold=True).pack(side='left', padx=(0, 11))
        self.language_buttons(row, self.speech_language)
        self.note(box, '口播转写在本地运行。字幕按语音段落估算时间，可在剪辑软件里校准。')
        self.actions(box, ('转写口播为 SRT', self.transcribe, True), ('分离音轨', self.separate_audio, False))
        if self.project and (self.project.folder / 'stems/original.wav').is_file():
            folder = self.project.folder / 'stems'
            self.actions(box, ('原声', lambda: self.open_file(folder / 'original.wav'), False),
                         ('人声分轨', lambda: self.open_file(folder / 'vocals.wav'), False),
                         ('配乐和环境声分轨', lambda: self.open_file(folder / 'music.wav'), False))
        box = self.card('压制字幕到视频', icon='file-video')
        self.field(box, 'SRT / ASS', self.caption_file, lambda: self.choose(self.caption_file, SUBS, title='选择字幕文件'))
        self.note(box, '使用上方的媒体路径作为输入。给没有内嵌字幕的成片或替换素材使用，可避免文字重叠。')
        self.actions(box, ('导出带字幕 MP4', self.burn_subtitles, True))

    def transcribe(self):
        source = self.existing_file(self.caption_video.get(), '视频或音频')
        language = self.speech_language.get()
        dest = self.save_as('保存口播字幕', source.stem[:42] + ' - 口播.srt', [('SRT 字幕', '*.srt')])
        if dest:
            if dest == source:
                raise ValueError('请为字幕选择新的输出文件。')
            self.settings()
            self.start('转写口播', lambda job: job.transcribe(source, dest, language), lambda result: self.caption_file.set(str(result)))

    def separate_audio(self):
        source = self.existing_file(self.caption_video.get(), '视频或音频')
        dest = self.job_dir('音轨分离')

        self.start('分离音轨', lambda job: job.separate(source, dest), self.open_file)

    def burn_subtitles(self):
        source = self.existing_file(self.caption_video.get(), '要压制字幕的视频')
        captions = self.existing_file(self.caption_file.get(), 'SRT 或 ASS 字幕')
        if captions.suffix.lower() not in ('.srt', '.ass'):
            raise ValueError('请选择 SRT 或 ASS 文件。')
        dest = self.save_as('保存带字幕的视频', source.stem[:42] + ' - 带字幕.mp4', [('MP4 视频', '*.mp4')])
        if dest:
            if dest in (source, captions):
                raise ValueError('请为压制结果选择新的输出文件。')
            self.start('压制字幕', lambda job: job.burn(source, captions, dest), self.open_file)

    def edit_page(self):
        if not self.project:
            self.empty_project('时间线剪辑', '把实拍或生成的片段填进参考视频的镜头位置。')
            return
        self.title('时间线剪辑', '双击镜头分配替换视频。空着的镜头按项目方案使用原片或重建静图。',
                   action=('开始拼接', self.assemble))
        box = self.card('镜头与替换素材', icon='clapperboard')
        table = tk.Frame(box, bg=PAPER)
        table.pack(fill='x')
        table.columnconfigure(0, weight=1)
        self.tree = ttk.Treeview(table, columns=('number', 'time', 'method', 'media'), show='headings', height=7, selectmode='browse')
        self.tree.grid(row=0, column=0, sticky='ew')
        self.tree.tag_configure('alternate', background=NAV)
        scroll = ttk.Scrollbar(table, orient='vertical', command=self.tree.yview)
        scroll.grid(row=0, column=1, sticky='ns')
        self.tree.configure(yscrollcommand=scroll.set)
        peek = tk.Frame(table, bg=BG, width=159, height=250, highlightbackground=RULE, highlightthickness=1)
        peek.grid(row=0, column=2, sticky='ns', padx=(10, 0))
        peek.pack_propagate(False)
        self.label(peek, '首帧预览', bg=BG, fg=MUTED, size=9).pack(pady=(8, 5))
        self.peek_image = tk.Label(peek, bg=BG, fg=MUTED, font=(FONT, 9))
        self.peek_image.pack(fill='both', expand=True, padx=5, pady=(0, 8))
        for key, label, width, stretch in (('number', '镜头', 60, False), ('time', '原时间（秒）', 145, False),
                                           ('method', '制作方式', 142, False), ('media', '替换素材', 310, True)):
            self.tree.heading(key, text=label, anchor='w')
            self.tree.column(key, width=width, stretch=stretch, anchor='w')
        self.tree.bind('<<TreeviewSelect>>', self.timeline_selected)
        self.tree.bind('<Double-1>', lambda event: self.assign_clip() if self.tree.identify_row(event.y) else None)
        self.actions(box, ('选择替换素材', self.assign_clip, True), ('按文件名批量匹配', self.batch_clips, False),
                     ('移除替换', self.clear_clip, False), ('导入生成结果', self.import_results, False))
        self.shot_summary = self.note(box, '')
        self.refresh_tree()
        self.actions(box, ('查看镜头截图', self.open_shot, False), ('编辑该镜提示词', self.open_shot_prompt, False))

        box = self.card('拼接与输出', icon='scissors')
        self.field(box, '成片保存位置', self.movie_output, self.pick_movie_output, button='更改…').state(['readonly'])
        ttk.Checkbutton(box, text='把识别出的字幕、标题和花字叠到替换镜头', variable=self.overlays).pack(anchor='w')
        options = tk.Frame(box, bg=PAPER)
        options.pack(fill='x', pady=3)
        self.label(options, '成片音轨', size=9).pack(side='left', padx=(0, 9))
        self.combo(options, self.audio_mode, ['沿用原片', '静音', '使用音频文件'], 15).pack(side='left')
        self.field(box, '替换音频', self.audio_file, self.pick_remake_audio)
        ttk.Checkbutton(box, text='同时导出对比视频', variable=self.export_comparison).pack(anchor='w')
        last = self.project.state.get('last_exports', [])
        if last and Path(last[0]).is_file():
            final = Path(last[0])
            comparison = Path(last[1]) if len(last) > 1 else None
            actions = [('播放成片', lambda: self.open_file(final), False)]
            if comparison and comparison.is_file():
                actions.append(('播放对比视频', lambda: self.open_file(comparison), False))
            actions.append(('打开成片位置', lambda: self.open_file(final.parent), False))
            self.actions(box, *actions)

    def refresh_tree(self):
        project = self.require_project()
        children = self.tree.get_children()
        if children:
            self.tree.delete(*children)
        for index, (key, shot) in enumerate(project.shots.items()):
            base = shot.get('base', {})
            entry = project.replacements.get(key)
            clip = Path(entry).name if entry else '原片占位'
            if entry and not Path(entry).is_file():
                clip = '文件已移动 · ' + clip
            if not entry and base.get('label') in ('still_motion', 'static_hold'):
                clip = '本地静图重建'
            self.tree.insert('', 'end', iid=key, values=(key.zfill(2), f'{shot["start"]:.3f} – {shot["end"]:.3f}',
                                                          base.get('label_zh', base.get('label', '待确认')), clip),
                             tags=('alternate',) if index % 2 else ())
        if self.selected_shot not in project.shots:
            self.selected_shot = next(iter(project.shots))
        self.tree.selection_set(self.selected_shot)
        self.tree.see(self.selected_shot)
        self.timeline_selected()

    def timeline_selected(self, _=None):
        selected = self.tree.selection()
        if not selected or not self.project:
            return
        key = self.selected_shot = selected[0]
        shot = self.project.shots[key]
        description = next((opinion['description'] for opinion in (shot.get('review'), shot.get('vlm'))
                            if opinion and opinion.get('description')), '')
        message = f'镜头 {key.zfill(2)} · {shot["duration"]:.2f} 秒'
        self.shot_summary.configure(text=message + (' · ' + description[:130] if description else ''))
        first = self.project.source_asset(key, 'first_frame')
        self.peek_photo = None
        if first and first.is_file():
            try:
                with Image.open(first) as original:
                    original.thumbnail((145, 221), Image.Resampling.LANCZOS)
                    self.peek_photo = ImageTk.PhotoImage(original.convert('RGB'))
            except OSError:
                pass
        self.peek_image.configure(image=self.peek_photo or '', text='' if self.peek_photo else '暂无首帧')

    def assign_clip(self):
        project = self.require_project()
        key = self.selected_shot
        choice = self.ask_file(VIDEO, f'选择镜头 {key} 的替换视频', project.replacements.get(key, str(project.source)))
        if choice:
            project.replacements[key] = str(choice)
            project.save()
            self.refresh_tree()

    def batch_clips(self):
        project = self.require_project()
        chosen = filedialog.askdirectory(parent=self.root, title='选择含 shot_001.mp4 或 001.mp4 的文件夹', initialdir=project.folder)
        if not chosen:
            return
        matches = match_clip_names(project, Path(chosen))
        project.replacements.update(matches)
        project.save()
        self.refresh_tree()
        self.status.set(f'已匹配 {len(matches)} 个镜头')

    def clear_clip(self):
        project = self.require_project()
        if self.selected_shot in project.replacements:
            del project.replacements[self.selected_shot]
            project.save()
            self.refresh_tree()

    def import_results(self):
        project = self.require_project()
        chosen = self.ask_file([('生成结果', '*.json')], '选择生成任务的 results.json', str(project.folder / 'remake/results.json'))
        if not chosen:
            return
        matches = read_clip_results(project, chosen)
        project.replacements.update(matches)
        project.save()
        self.refresh_tree()
        self.status.set(f'已导入 {len(matches)} 个替换镜头')

    def open_shot(self):
        project = self.require_project()
        self.open_file(project.source_asset(self.selected_shot, 'sheet'))

    def open_shot_prompt(self):
        self.prompt_shot = self.selected_shot
        self.switch('提示词与生成')

    def pick_remake_audio(self):
        if self.choose(self.audio_file, AUDIO, title='选择替换音频'):
            self.audio_mode.set('使用音频文件')

    def pick_movie_output(self):
        folder = be.movie_output_dir(self.config.get('movie_output'))
        chosen = filedialog.askdirectory(parent=self.root, title='选择成片保存位置',
                                         initialdir=be.movie_output_picker_start(folder))
        if chosen:
            self.config['movie_output'] = str(Path(chosen).resolve())
            self.settings()
            self.movie_output.set(self.config['movie_output'])

    def assemble(self):
        project = self.require_project()
        self.existing_file(project.source, '项目对应的原视频，或在实用工具中重新定位')
        missing = [key for key, clip in project.replacements.items() if key in project.shots and not Path(clip).is_file()]
        if missing:
            raise ValueError('请重新选择或移除已移动的镜头素材：' + '、'.join(missing))
        audio = None
        if self.audio_mode.get() == '静音':
            audio = 'mute'
        if self.audio_mode.get() == '使用音频文件':
            audio = self.existing_file(self.audio_file.get(), '替换音轨')
        replacements = {key: path for key, path in project.replacements.items() if key in project.shots}
        overlays = self.overlays.get()
        compare = self.export_comparison.get()
        export_root = be.movie_output_dir(self.config.get('movie_output'))

        def done(result):
            project.state['last_exports'] = list(map(str, result))
            project.save()
            if self.current == '时间线剪辑':
                self.switch(self.current)

        self.start('拼接时间线',
                   lambda job: job.assemble(project, replacements, export_root, overlays, audio, compare=compare), done)
        self.export_comparison.set(False)

    def prompt_page(self):
        if not self.project:
            self.empty_project('提示词与生成', '按镜头编辑、复制提示词，并准备外部视频生成任务。')
            return
        project = self.project
        self.title('提示词与生成', '读取模型生成的提示词，也可以在本机按分镜创建可编辑草稿。')
        box = self.card('逐镜提示词', icon='file-text')
        line = tk.Frame(box, bg=PAPER)
        line.pack(fill='x')
        self.label(line, '镜头', size=9).pack(side='left', padx=(0, 8))
        self.prompt_choice = tk.StringVar(value=self.prompt_shot if self.prompt_shot in project.shots else self.selected_shot)
        chooser = self.combo(line, self.prompt_choice, list(project.shots), 7)
        chooser.pack(side='left')
        chooser.bind('<<ComboboxSelected>>', self.prompt_changed)
        self.prompt_note = self.label(line, '', fg=MUTED, size=9)
        self.prompt_note.pack(side='left', padx=12)
        self.prompt_text = self.text_box(box, 7, bg=BG)
        self.prompt_shot = None
        self.prompt_changed()
        self.actions(box, ('复制提示词', self.copy_prompt, True), ('保存编辑', self.store_prompt, False),
                     ('恢复分镜草稿', self.reset_prompt, False), ('导出全部提示词', self.export_prompts, False))
        self.actions(box, ('看原首帧', lambda: self.view_frame('first_frame'), False),
                     ('看原尾帧', lambda: self.view_frame('last_frame'), False),
                     ('选择生成参考图', lambda: self.set_reference('first'), False),
                     ('选择生成尾帧', lambda: self.set_reference('last'), False))
        self.ref_note = self.note(box, '原帧可能含字幕。生成时可选干净产品图，再在剪辑里叠字。')
        self.show_reference_note()

        box = self.card('视频生成任务', icon='sparkles')
        row = tk.Frame(box, bg=PAPER)
        row.pack(fill='x')
        row.columnconfigure(1, weight=1)
        row.columnconfigure(3, weight=1)
        self.label(row, '生成模式', size=9).grid(row=0, column=0, sticky='w', padx=(0, 8))
        self.combo(row, self.mode, list(be.MODES), 12).grid(row=0, column=1, sticky='ew')
        self.label(row, '引擎', size=9).grid(row=0, column=2, sticky='w', padx=(16, 8))
        ttk.Entry(row, textvariable=self.engine, width=24).grid(row=0, column=3, sticky='ew')
        ttk.Checkbutton(row, text='只运行当前镜头', variable=self.only_selected).grid(
            row=1, column=0, columnspan=4, sticky='w', pady=(5, 0))
        self.note(box, '导出和预览任务可离线完成。实际调用从设置读取 capsule-cinema 和模型环境。')
        self.actions(box, ('导出任务表', self.make_jobs, True), ('预览任务', lambda: self.run_jobs(True), False),
                     ('调用模型生成…', lambda: self.run_jobs(False), False), ('打开任务文件夹', self.open_jobs, False))

    def prompt_changed(self, _=None):
        project = self.require_project()
        if self.prompt_shot in project.shots:
            self.store_prompt()
        self.prompt_shot = self.prompt_choice.get()
        key = self.prompt_shot
        shot = project.shots[key]
        self.prompt_note.configure(text=f'{shot["start"]:.2f}–{shot["end"]:.2f} 秒 · {shot.get("base", {}).get("label_zh", "待确认")}')
        self.prompt_text.delete('1.0', 'end')
        self.prompt_text.insert('1.0', project.prompts.get(key, be.suggested_prompt(project, key)))
        self.show_reference_note()

    def store_prompt(self):
        if not self.project or self.prompt_shot not in self.project.shots:
            return
        if not getattr(self, 'prompt_text', None) or not self.prompt_text.winfo_exists():
            return
        key = self.prompt_shot
        old = self.project.prompts.get(key, be.suggested_prompt(self.project, key))
        value = self.prompt_text.get('1.0', 'end-1c').strip()
        if value != old:
            self.project.prompts[key] = value
            self.project.save()
            self.status.set(f'已保存镜头 {key} 的提示词')

    def copy_prompt(self):
        self.store_prompt()
        self.root.clipboard_clear()
        self.root.clipboard_append(self.prompt_text.get('1.0', 'end-1c'))
        self.status.set('提示词已复制')

    def reset_prompt(self):
        project = self.require_project()
        key = self.prompt_shot
        project.prompts.pop(key, None)
        project.save()
        self.prompt_text.delete('1.0', 'end')
        self.prompt_text.insert('1.0', be.suggested_prompt(project, key))

    def export_prompts(self):
        project = self.require_project()
        self.store_prompt()
        dest = self.save_as('导出逐镜提示词', '逐镜提示词.txt', [('文本', '*.txt')])
        if dest:
            lines = [project.name, '']
            for key, shot in project.shots.items():
                lines += [f'镜头 {key.zfill(2)}  {shot["start"]:.3f}–{shot["end"]:.3f} 秒',
                          project.prompts.get(key, be.suggested_prompt(project, key)), '']
            dest.write_text('\n'.join(lines), encoding='utf-8-sig')
            self.status.set('已导出逐镜提示词')

    def view_frame(self, key):
        self.open_file(self.require_project().source_asset(self.prompt_shot, key))

    def show_reference_note(self):
        widget = getattr(self, 'ref_note', None)
        if not widget or not widget.winfo_exists() or not self.project:
            return
        refs = self.project.references.get(self.prompt_shot, {})
        text = '首图 ' + Path(refs['first']).name if refs.get('first') else '首图用原片抽帧'
        text += ' · 尾图 ' + Path(refs['last']).name if refs.get('last') else ' · 尾图用原片抽帧'
        widget.configure(text=text + '。原帧可能含字幕，生成时可换用干净的产品图。')

    def set_reference(self, role):
        project = self.require_project()
        refs = project.references.setdefault(self.prompt_shot, {})
        selected = self.ask_file(IMAGE, '选择用于生成的参考图', refs.get(role, str(project.source)))
        if selected:
            refs[role] = str(selected)
            project.save()
            self.show_reference_note()

    def make_jobs(self):
        project = self.require_project()
        self.store_prompt()
        engine = self.engine.get().strip()
        mode = be.MODES[self.mode.get()]
        capsule = Path(self.capsule_root.get()).expanduser().resolve() if self.capsule_root.get() else be.DATA / 'generation'
        self.settings()

        self.start('导出生成任务', lambda job: build_generation_jobs(job, project, capsule, engine, mode),
                   lambda count: self.status.set(f'已导出 · {count} 个模型生成任务'), show_log=True)

    def jobs_file(self):
        project = self.require_project()
        return self.existing_file(project.folder / 'remake/jobs.json', '先用「导出任务表」生成的任务文件')

    def open_jobs(self):
        self.open_file(self.jobs_file().parent)

    def run_jobs(self, dry):
        path = self.jobs_file()
        spec = be.load_json(path)
        capsule = Path(spec['capsule_root'])
        only = self.prompt_shot if self.only_selected.get() else ''
        if dry:
            self.start('预览生成任务', lambda job: job.preview_generation(path, capsule, only), show_log=True)
            return
        if not self.capsule_root.get() or Path(self.capsule_root.get()).resolve() != capsule.resolve() or not (capsule / 'lib').is_dir():
            raise ValueError('请在设置中选择已配置的 capsule-cinema 文件夹，再重新导出任务。')
        interpreter = self.capsule_interpreter(capsule)
        count = sum(item['executor'] == 'capsule_cinema' and (not only or str(item['shot']) == only) for item in spec['jobs'])
        if not count:
            raise ValueError('选中的镜头没有可运行的生成任务。')
        if messagebox.askyesno('调用视频模型', f'将执行 {count} 个生成任务，模型服务可能收费。开始生成？', parent=self.root):
            self.start('调用视频模型', lambda job: job.rea('remake-run', path, '--capsule-root', capsule,
                                                          '--python', interpreter, '--only', only), show_log=True)

    def capsule_interpreter(self, capsule):
        value = self.capsule_python.get() or str(capsule / '.venv/Scripts/python.exe')
        return self.existing_file(value, 'capsule-cinema 的 Python 解释器')

    def display_text(self, title, content):
        window = tk.Toplevel(self.root, bg=PAPER)
        window.title(f'{title} · {APP_NAME}')
        window.transient(self.root)
        frame = tk.Frame(window, bg=PAPER)
        frame.pack(fill='both', expand=True, padx=15, pady=15)
        def copy():
            window.clipboard_clear()
            window.clipboard_append(content)
            self.status.set('已复制 · ' + title)

        actions = self.actions(frame, ('复制', copy, True), ('关闭', window.destroy, False))
        actions.pack_configure(side='bottom')
        box = self.text_box(frame, 24, bg=BG, expand=True)
        box.configure(width=92)
        box.insert('1.0', content)
        box.configure(state='disabled')
        window.bind('<Escape>', lambda _: window.destroy())
        window.after_idle(lambda: dark_caption(window))

    def tools_page(self):
        self.title('实用工具', '检查来源线索、抽帧、纠正镜头分类或管理复核结果。')
        box = self.card('单文件工具')
        if not self.tools_video.get():
            self.tools_video.set(str(self.project.source) if self.project else self.video.get())
        self.field(box, '视频文件', self.tools_video, lambda: self.choose(self.tools_video, title='选择要检查的视频'))
        row = tk.Frame(box, bg=PAPER)
        row.pack(fill='x', pady=6)
        for title, variable in (('开始秒数', self.tile_start), ('结束秒数', self.tile_end), ('间隔秒数', self.tile_every)):
            self.label(row, title, size=9).pack(side='left', padx=(0, 7))
            ttk.Entry(row, textvariable=variable, width=8).pack(side='left', padx=(0, 17))
        self.note(box, '元数据可提供平台转码、AIGC 和来源线索。抽帧结果按时间排列成图。')
        self.actions(box, ('查看元数据', self.probe, False), ('生成抽帧图', self.tiles, True))

        if self.project:
            box = self.card('当前项目复核')
            row = tk.Frame(box, bg=PAPER)
            row.pack(fill='x', pady=4)
            self.label(row, '镜头', size=9).pack(side='left', padx=(0, 8))
            self.correct_key = tk.StringVar(value=self.selected_shot)
            self.correct_label = tk.StringVar()
            self.correct_note = tk.StringVar()
            dropdown = self.combo(row, self.correct_key, list(self.project.shots), 6)
            dropdown.pack(side='left', padx=(0, 14))
            self.label(row, '正确类型', size=9).pack(side='left', padx=(0, 8))
            self.combo(row, self.correct_label, list(be.LABELS.values()), 18).pack(side='left')
            dropdown.bind('<<ComboboxSelected>>', self.select_correct_label)
            self.select_correct_label()
            self.field(box, '依据（可选）', self.correct_note)
            self.actions(box, ('保存镜头纠正', self.correct_shot, True), ('生成复核文件', self.make_review, False),
                         ('并入复核文件', self.apply_review, False), ('重新定位原片', self.relink, False))

        box = self.card('项目数据与批量评测')
        self.actions(box, ('查看本机纠错记忆', self.memory, False), ('导出纠错标签', self.export_memory, False),
                     ('评测标注集…', self.evaluate, False))
        if self.project:
            self.actions(box, ('查看精简结论', self.summary, False), ('导出视频分析 JSON', self.export_capsule, False),
                         ('导出复刻配方草稿', self.capsule_draft, False))

    def probe(self):
        source = self.existing_file(self.tools_video.get(), '视频')
        self.start('读取视频元数据', lambda job: job.rea('probe', source, '--tags', quiet=True),
                   lambda result: self.display_text('视频元数据', result))

    def tiles(self):
        import math

        source = self.existing_file(self.tools_video.get(), '视频')
        try:
            start, end, every = map(float, (self.tile_start.get(), self.tile_end.get(), self.tile_every.get()))
        except ValueError:
            raise ValueError('开始、结束和间隔请填写秒数，例如 0、3、0.25。') from None
        if not all(map(math.isfinite, (start, end, every))) or not (0 <= start < end and every > 0):
            raise ValueError('结束时间要晚于开始时间，间隔必须大于 0。')
        dest = self.job_dir('抽帧')
        self.start('生成抽帧图', lambda job: job.rea('tiles', source, '--start', start, '--end', end, '--every', every,
                                                     '--max', 48, '-o', dest / 'tiles.jpg'),
                   lambda _: self.open_file(dest))

    def select_correct_label(self, _=None):
        key = self.correct_key.get()
        current = self.project.shots[key].get('base', {}).get('label')
        self.correct_label.set(be.LABELS.get(current, '实拍'))

    def correct_shot(self):
        project = self.require_project()
        key = self.correct_key.get()
        label = next(name for name, display in be.LABELS.items() if display == self.correct_label.get())
        note = self.correct_note.get().strip()
        args = ['correct', project.folder, '--shots', key, '--label', label]
        if note:
            args += ['--note', note]
        self.start('保存镜头纠正', lambda job: refresh_project_report(job, project, args),
                   lambda _: self.load_project(project.path))

    def make_review(self):
        project = self.require_project()
        self.start('生成复核文件', lambda job: job.rea('review', project.folder), lambda _: self.open_file(project.folder))

    def apply_review(self):
        project = self.require_project()
        file = self.ask_file([('复核答案', '*.json')], '选择 review_answers.json', str(project.folder / 'review_answers.json'))
        if file:
            args = ['apply-review', project.folder, file, '--by', '工作台复核']
            self.start('并入复核文件', lambda job: refresh_project_report(job, project, args),
                       lambda _: self.load_project(project.path))

    def relink(self):
        project = self.require_project()
        file = self.ask_file(VIDEO, '定位项目的原视频', str(project.source))
        if not file:
            return
        source = project.data['source']

        def done(_):
            source['path'] = str(file)
            be.write_json(project.path, project.data)
            self.load_project(project.path)

        self.start('核对原视频', lambda job: verify_original(job, file, source), done)

    def summary(self):
        project = self.require_project()
        self.start('读取精简结论', lambda job: job.rea('summary', project.path, quiet=True),
                   lambda result: self.display_text('精简结论', engine_display_text(result)))

    def memory(self):
        self.start('读取纠错记忆', lambda job: job.rea('memory', quiet=True),
                   lambda result: self.display_text('本机纠错记忆', result))

    def export_memory(self):
        dest = self.save_as('导出纠错标签', '镜头纠错.yaml', [('YAML', '*.yaml *.yml')])
        if dest:
            self.start('导出纠错标签', lambda job: job.rea('memory', '--export-labels', dest),
                       lambda _: self.open_file(dest.parent))

    def evaluate(self):
        yaml = self.ask_file([('标注集', '*.yaml *.yml')], '选择评测标注集')
        if yaml:
            dest = self.job_dir('标注集评测')
            self.start('评测标注集', lambda job: job.rea('eval', yaml, '-o', dest),
                       lambda _: self.open_file(dest), show_log=True)

    def export_capsule(self):
        project = self.require_project()
        dest = self.save_as('保存视频分析 JSON', '视频分析.json', [('JSON', '*.json')])
        if dest:
            if dest in (project.path, project.state_file):
                raise ValueError('请为导出的分析数据选择新的文件名。')
            self.start('导出视频分析 JSON', lambda job: job.rea('capsule', project.path, '-o', dest),
                       lambda _: self.open_file(dest.parent))

    def capsule_draft(self):
        project = self.require_project()
        value = self.capsule_root.get()
        if not value or not (Path(value) / 'lib').is_dir():
            raise ValueError('请先在设置选择已安装的 capsule-cinema 文件夹。')
        capsule = Path(value).resolve()
        interpreter = self.capsule_interpreter(capsule)
        self.start('导出配方草稿', lambda job: job.rea('capsule-draft', project.path, '--capsule-root', capsule,
                                                     '--python', interpreter), show_log=True)

    def settings_page(self):
        self.title('设置', '核心功能在本机运行。模型服务和生成后端按需配置。')
        box = self.card('项目与报告')
        self.field(box, '保存目录', self.output, lambda: self.choose_folder(self.output))
        self.field(box, '平台元数据', self.meta, lambda: self.choose(self.meta, [('平台元数据', '*.json')]))
        self.note(box, '平台元数据 JSON 可为下一次拆解补充原平台的曲名等信息。')

        box = self.card('多模态分析')
        self.field(box, '服务地址', self.vlm_base)
        self.field(box, '模型名', self.vlm_model)
        self.field(box, '会话 API 密钥', self.vlm_key).configure(show='●')
        self.field(box, '已有 .env', self.env_file,
                   lambda: self.choose(self.env_file, [('模型配置文件', '*.env .env'), ('所有文件', '*.*')]))
        self.note(box, '填写兼容接口地址和模型名，密钥只在本次窗口使用。已有 .env 会优先读取。开启多模态分析时，所选媒体会交给该模型服务分析。')

        box = self.card('自动视频生成')
        self.field(box, '后端目录', self.capsule_root, lambda: self.choose_folder(self.capsule_root))
        self.field(box, '后端 Python', self.capsule_python, lambda: self.choose(self.capsule_python, [('Python', '*.exe')]))
        self.field(box, '默认引擎', self.engine)
        self.note(box, '用于 capsule-cinema 的本地安装。留空 Python 时使用后端目录的 .venv\\Scripts\\python.exe。')
        self.actions(box, ('保存设置', self.save_settings, True), ('检查本机运行环境', self.check_runtime, False))

    def save_settings(self):
        self.settings()
        self.status.set('设置已保存')

    def check_runtime(self):
        self.start('检查本机环境', check_runtime, lambda result: self.display_text('本机运行环境', result))


def main():
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(WINDOWS_APP_ID)
    except (AttributeError, OSError):
        pass
    root = tk.Tk()
    try:
        app = Workbench(root)
        args = sys.argv[1:]
        if args[:1] == ['--page']:
            page = args[1]
            args = args[2:]
        else:
            page = '视频拆解'
        if args:
            incoming = Path(args[0])
            if incoming.suffix.lower() == '.json':
                app.load_project(incoming)
            elif incoming.is_file():
                app.video.set(str(incoming.resolve()))
        if page != '视频拆解':
            app.switch(page)
    except Exception:
        log = be.DATA / 'startup-error.txt'
        log.write_text(traceback.format_exc(), encoding='utf-8')
        messagebox.showerror(APP_NAME, f'启动失败。错误详情保存在\n{log}', parent=root)
        root.destroy()
        return 1
    root.mainloop()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
