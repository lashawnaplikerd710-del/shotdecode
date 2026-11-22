"""Windows frame for the workbench's single-row title bar."""
from __future__ import annotations

import ctypes
import logging
from ctypes import wintypes


GWL_STYLE = -16
WS_CAPTION = 0x00C00000
WS_THICKFRAME = 0x00040000
WS_SYSMENU = 0x00080000
WS_MINIMIZEBOX = 0x00020000
WS_MAXIMIZEBOX = 0x00010000
WM_WINDOWPOSCHANGING = 0x0046
WM_WINDOWPOSCHANGED = 0x0047
WM_NCDESTROY = 0x0082
WM_NCCALCSIZE = 0x0083
WM_NCHITTEST = 0x0084
HTCLIENT = 1
HTTOP = 12
SWP_FRAMECHANGED = 0x0020
SWP_NOSIZE = 0x0001
SWP_NOMOVE = 0x0002
SWP_NOZORDER = 0x0004
SWP_NOACTIVATE = 0x0010


class WindowPosition(ctypes.Structure):
    _fields_ = [('hwnd', wintypes.HWND), ('after', wintypes.HWND),
                ('x', ctypes.c_int), ('y', ctypes.c_int),
                ('width', ctypes.c_int), ('height', ctypes.c_int), ('flags', wintypes.UINT)]


class DesktopChrome:
    def __init__(self, entry):
        self._entry = entry
        self._window = None
        self._hwnd = None
        self._native_drag = False
        self._top_resize_height = 0
        self._was_maximized_or_minimized = False
        self._restoring_bounds = False
        self._user32 = ctypes.WinDLL('user32', use_last_error=True)
        self._user32.GetWindowLongW.argtypes = (wintypes.HWND, ctypes.c_int)
        self._user32.GetWindowLongW.restype = wintypes.LONG
        self._user32.SetWindowLongW.argtypes = (wintypes.HWND, ctypes.c_int, wintypes.LONG)
        self._user32.SetWindowLongW.restype = wintypes.LONG
        self._user32.SetWindowPos.argtypes = (wintypes.HWND, wintypes.HWND, ctypes.c_int, ctypes.c_int,
                                             ctypes.c_int, ctypes.c_int, wintypes.UINT)
        self._user32.SetWindowPos.restype = wintypes.BOOL
        self._user32.GetWindowRect.argtypes = (wintypes.HWND, ctypes.POINTER(wintypes.RECT))
        self._user32.GetWindowRect.restype = wintypes.BOOL
        self._user32.GetClientRect.argtypes = (wintypes.HWND, ctypes.POINTER(wintypes.RECT))
        self._user32.GetClientRect.restype = wintypes.BOOL
        self._user32.IsZoomed.argtypes = (wintypes.HWND,)
        self._user32.IsZoomed.restype = wintypes.BOOL
        self._user32.IsIconic.argtypes = (wintypes.HWND,)
        self._user32.IsIconic.restype = wintypes.BOOL
        frame_callback = ctypes.WINFUNCTYPE(
            wintypes.LPARAM, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM,
            ctypes.c_size_t, ctypes.c_size_t,
        )
        self._comctl32 = ctypes.WinDLL('comctl32', use_last_error=True)
        self._comctl32.SetWindowSubclass.argtypes = (
            wintypes.HWND, frame_callback, ctypes.c_size_t, ctypes.c_size_t)
        self._comctl32.SetWindowSubclass.restype = wintypes.BOOL
        self._comctl32.RemoveWindowSubclass.argtypes = (wintypes.HWND, frame_callback, ctypes.c_size_t)
        self._comctl32.RemoveWindowSubclass.restype = wintypes.BOOL
        self._comctl32.DefSubclassProc.argtypes = (
            wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)
        self._comctl32.DefSubclassProc.restype = wintypes.LPARAM
        self._frame_proc = frame_callback(self._frame_message)

    def _frame_message(self, hwnd, message, wparam, lparam, subclass, _):
        default = self._comctl32.DefSubclassProc
        if message == WM_WINDOWPOSCHANGED:
            maximized_or_minimized = bool(self._user32.IsZoomed(hwnd) or self._user32.IsIconic(hwnd))
            restoring = self._was_maximized_or_minimized and not maximized_or_minimized
            self._was_maximized_or_minimized = maximized_or_minimized
            if restoring:
                self._restoring_bounds = True
                try:
                    return default(hwnd, message, wparam, lparam)
                finally:
                    self._restoring_bounds = False
        if message == WM_NCCALCSIZE and lparam and not (
            self._user32.IsZoomed(hwnd) or self._user32.IsIconic(hwnd)
        ):
            # Remember the native resize margin before bringing client content up to the top edge.
            rect = ctypes.cast(lparam, ctypes.POINTER(wintypes.RECT)).contents
            top = rect.top
            default(hwnd, message, wparam, lparam)
            self._top_resize_height = max(0, rect.top - top)
            rect.top = top
            return 0
        if message == WM_NCDESTROY:
            self._comctl32.RemoveWindowSubclass(hwnd, self._frame_proc, subclass)
        result = default(hwnd, message, wparam, lparam)
        if message == WM_WINDOWPOSCHANGING and self._restoring_bounds and lparam:
            # WinForms can reapply the client size as the outer size of its
            # borderless form. Windows has already restored the outer size.
            position = ctypes.cast(lparam, ctypes.POINTER(WindowPosition)).contents
            client = wintypes.RECT()
            if (not position.flags & (SWP_NOSIZE | SWP_FRAMECHANGED)
                    and self._user32.GetClientRect(hwnd, ctypes.byref(client))
                    and (position.width, position.height) == (client.right, client.bottom)):
                position.flags |= SWP_NOSIZE
        if (message == WM_NCHITTEST and result == HTCLIENT and self._top_resize_height
                and not self._user32.IsZoomed(hwnd)):
            rect = wintypes.RECT()
            y = ctypes.c_short(lparam >> 16).value
            if self._user32.GetWindowRect(hwnd, ctypes.byref(rect)) and rect.top <= y < rect.top + self._top_resize_height:
                return HTTOP
        return result

    def attach(self, window):
        self._window = window
        self._hwnd = window.native.Handle.ToInt64()
        style = self._user32.GetWindowLongW(self._hwnd, GWL_STYLE)
        frame = WS_THICKFRAME | WS_SYSMENU | WS_MINIMIZEBOX | WS_MAXIMIZEBOX
        # Keep the native sizing border and system menu without the system caption.
        self._user32.SetWindowLongW(self._hwnd, GWL_STYLE, (style & ~WS_CAPTION) | frame)
        if not self._comctl32.SetWindowSubclass(self._hwnd, self._frame_proc, 1, 0):
            logging.getLogger(__name__).debug('Could not extend the title bar to the top edge.')
        dpi_for_window = getattr(self._user32, 'GetDpiForWindow', None)
        dpi = 96
        if dpi_for_window:
            dpi_for_window.argtypes = (wintypes.HWND,)
            dpi_for_window.restype = wintypes.UINT
            dpi = dpi_for_window(self._hwnd) or dpi
        self._user32.SetWindowPos(self._hwnd, None, 0, 0,
                                  round(window.initial_width * dpi / 96), round(window.initial_height * dpi / 96),
                                  SWP_NOMOVE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED)
        view = window.native.webview
        if view.CoreWebView2:
            self._navigate(view)
        else:
            view.CoreWebView2InitializationCompleted += self._webview_ready

    def _webview_ready(self, sender, args):
        if args.IsSuccess:
            self._navigate(sender)

    def _navigate(self, view):
        try:
            view.CoreWebView2.Settings.IsNonClientRegionSupportEnabled = True
            self._native_drag = True
        except Exception as error:
            logging.getLogger(__name__).debug('Using fallback title-bar dragging: %s', error)
        view.CoreWebView2.Navigate(self._entry)

    def control(self, action):
        window = self._window
        if window is None:
            return None
        if action == 'close':
            window.destroy()
            return None
        if action == 'toggle_maximized':
            if self._user32.IsZoomed(self._hwnd):
                window.restore()
            else:
                window.maximize()
        elif action == 'minimize':
            window.minimize()
        elif action != 'state':
            return None
        return dict(maximized=bool(self._user32.IsZoomed(self._hwnd)), native_drag=self._native_drag)
