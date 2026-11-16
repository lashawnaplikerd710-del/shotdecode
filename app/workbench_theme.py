from __future__ import annotations

import ctypes
from pathlib import Path
from tkinter import ttk

import sv_ttk
from PIL import Image, ImageDraw, ImageTk


BG = '#11151b'
NAV = '#161c24'
PAPER = '#1c232d'
SURFACE = '#242e3b'
RULE = '#313c4c'
INK = '#f2f5fb'
MUTED = '#a7b4c6'
ACCENT = '#57c8ff'
ACCENT_BG = '#1d3446'
ACCENT_RULE = '#32556e'
FONT = 'Microsoft YaHei UI'


class Icons:
    def __init__(self, root):
        self.root = root
        self.cache = {}
        self.directory = Path(__file__).with_name('ui_assets')

    def get(self, name, color=MUTED, size=18):
        key = (name, color, size)
        if key not in self.cache:
            self.cache[key] = ImageTk.PhotoImage(self._glyph(name, color, size), master=self.root)
        return self.cache[key]

    def _glyph(self, name, color, size):
        with Image.open(self.directory / f'{name}.png') as mask:
            alpha = mask.resize((size, size), Image.Resampling.LANCZOS)
        glyph = Image.new('RGBA', alpha.size, color)
        glyph.putalpha(alpha)
        return glyph

    def tile(self, name, size, *, fill=ACCENT_BG, color=ACCENT):
        key = ('tile', name, size, fill, color)
        if key not in self.cache:
            tile = _rounded(fill, None, 9, size)
            tile.alpha_composite(self._glyph(name, color, size // 2), (size // 4, size // 4))
            self.cache[key] = ImageTk.PhotoImage(tile, master=self.root)
        return self.cache[key]


def _rounded(fill, outline, radius, size):
    resolution = size * 3
    image = Image.new('RGBA', (resolution, resolution))
    ImageDraw.Draw(image).rounded_rectangle((0, 0, resolution - 1, resolution - 1), radius=radius * 3,
                                            fill=fill, outline=outline, width=3)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def apply_styles(root):
    sv_ttk.set_theme('dark', root)
    root.configure(background=BG)
    style = ttk.Style(root)
    style.configure('.', font=(FONT, 10), foreground=INK, background=PAPER)
    style.configure('TButton', padding=(12, 6))
    style.configure('Accent.TButton', padding=(16, 7), font=(FONT, 10, 'bold'))
    style.configure('Compact.TButton', padding=(8, 4), font=(FONT, 9))
    style.configure('TEntry', padding=(9, 6))
    style.configure('TCombobox', padding=(8, 5))
    style.configure('TCheckbutton', background=PAPER, padding=(1, 4))
    style.configure('TRadiobutton', background=PAPER, padding=(0, 3))
    style.configure('Switch.TCheckbutton', background=ACCENT_BG, font=(FONT, 10, 'bold'), padding=(1, 3))
    style.configure('Treeview', rowheight=33, background=PAPER, fieldbackground=PAPER, foreground=INK)
    style.configure('Treeview.Heading', font=(FONT, 9, 'bold'), foreground=MUTED, padding=(8, 6))
    style.map('Treeview', background=[('selected', ACCENT_BG)], foreground=[('selected', '#d4f2ff')])

    # Tk tiles the area inside the image border. A larger tile keeps repainting fast on Windows.
    card = ImageTk.PhotoImage(_rounded(PAPER, RULE, 12, 128), master=root)
    nav_colors = [(NAV, None), (SURFACE, None), (SURFACE, ACCENT), (ACCENT_BG, ACCENT_RULE), (ACCENT_BG, ACCENT)]
    base, hover, focus, selected, selected_focus = [
        ImageTk.PhotoImage(_rounded(fill, line, 8, 72), master=root) for fill, line in nav_colors
    ]
    style.element_create('WorkbenchCard.border', 'image', card, border=13, width=28, height=28, sticky='nsew')
    style.layout('Card.TFrame', [('WorkbenchCard.border', {'sticky': 'nsew'})])
    style.element_create('WorkbenchNav.border', 'image', base, ('selected focus', selected_focus),
                         ('selected', selected), ('focus', focus), ('active', hover),
                         border=9, width=20, height=20, sticky='nsew')
    style.layout('Navigation.TButton', [('WorkbenchNav.border', {'sticky': 'nsew', 'children': [
        ('Button.padding', {'sticky': 'nsew', 'children': [('Button.label', {'sticky': 'w'})]})
    ]})])
    style.configure('Navigation.TButton', foreground=MUTED, padding=(12, 10), anchor='w')
    style.map('Navigation.TButton', foreground=[('selected', ACCENT), ('active', INK)],
              font=[('selected', (FONT, 10, 'bold'))])
    return card, base, hover, focus, selected, selected_focus


def dark_caption(window):
    try:
        user32 = ctypes.windll.user32
        user32.GetAncestor.argtypes = (ctypes.c_void_p, ctypes.c_uint)
        user32.GetAncestor.restype = ctypes.c_void_p
        handle = user32.GetAncestor(window.winfo_id(), 2)
        enable = ctypes.c_int(1)
        set_attr = ctypes.windll.dwmapi.DwmSetWindowAttribute
        set_attr(ctypes.c_void_p(handle), 20, ctypes.byref(enable), ctypes.sizeof(enable))
        red, green, blue = bytes.fromhex(NAV[1:])
        caption = ctypes.c_uint(red | (green << 8) | (blue << 16))
        set_attr(ctypes.c_void_p(handle), 35, ctypes.byref(caption), ctypes.sizeof(caption))
    except (AttributeError, OSError):
        pass
