import os
import runpy
import sys
from pathlib import Path

# Each analysis or render process loads OpenBLAS through NumPy. Keep parallel
# jobs from creating a full machine's worth of BLAS threads apiece.
os.environ.setdefault('OPENBLAS_NUM_THREADS', '2')

import cv2
import numpy as np


# OpenCV's Windows filename wrappers do not accept all Unicode image paths.
_imread = cv2.imread
_imwrite = cv2.imwrite


def imread(filename, flags=cv2.IMREAD_COLOR):
    if os.fspath(filename).isascii():
        return _imread(filename, flags)
    try:
        encoded = np.fromfile(filename, dtype=np.uint8)
    except OSError:
        return None
    return cv2.imdecode(encoded, flags) if encoded.size else None


def imwrite(filename, image, params=None):
    if os.fspath(filename).isascii():
        return _imwrite(filename, image, params)
    ok, encoded = cv2.imencode(Path(filename).suffix, image, params)
    if ok:
        encoded.tofile(filename)
    return ok


cv2.imread = imread
cv2.imwrite = imwrite

# The desktop runs this entry point with Python's isolated mode.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app_identity import engine_display_text
from rea_video import stems, vlm
from stem_worker import guarded_extract_stems


stems.extract_stems = guarded_extract_stems
vlm.SETUP_HINT = '可以在工作台的「设置」配置多模态分析。'
vlm.SETUP_HINT_EN = 'Configure multimodal analysis in the workbench settings.'
_vlm_note = vlm.vlm_note


def workbench_vlm_note(info, review=None):
    return engine_display_text(_vlm_note(info, review))


vlm.vlm_note = workbench_vlm_note

from rea_video import report


_markdown = report.markdown


def workbench_markdown(result):
    return engine_display_text(_markdown(result))


report.markdown = workbench_markdown
runpy.run_module('rea_video', run_name='__main__')
