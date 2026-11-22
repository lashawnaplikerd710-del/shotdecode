"""Timestamped observations from a project's existing analysis and transcript."""
from __future__ import annotations

import re

from spoken_translation import EN_SRT, JA_SRT, ZH_SRT


PROOF = re.compile(r'实测|演示|对比|效果|承重|防水|测试|之前|之后|耐久|比較|実証|実際|before|after|tested|demonstrat|waterproof|prueb|resultad', re.I)
ACTION = re.compile(r'下单|购买|领券|商品链接|购物车|点击|关注|加购|注文|購入|商品ページ|今すぐ|link in bio|buy now|order now|shop now|tap|compra|haz clic|pide ahora', re.I)


def text_rows(project, read_cues):
    pack = project.data.get('packaging') or {}
    cues = [dict(start=cue['t0'], end=cue['t1'], text=cue['text'], evidence='画面文字')
            for cue in pack.get('text_cues', [])
            if cue.get('text') and 't0' in cue and 't1' in cue]
    for filename in (ZH_SRT, JA_SRT, EN_SRT):
        path = project.folder / filename
        if path.is_file():
            cues.extend(dict(cue, evidence='口播') for cue in read_cues(path))
    return sorted(cues, key=lambda row: row['start'])


def observe(project, read_cues):
    shots = list(project.shots.values())
    length = project.data['source'].get('duration') or shots[-1]['end']
    rows = text_rows(project, read_cues)
    first = next((row for row in rows if row['start'] < 3), None)
    cells = [
        dict(kind='opening', start=0, end=min(length, 3),
             cuts=sum(1 for shot in shots[1:] if shot['start'] < 3), event=first),
        dict(kind='product', event=next((row for row in rows if row['evidence'] == '画面文字'), None)),
        dict(kind='proof', event=next((row for row in rows if PROOF.search(row['text'])), None)),
        dict(kind='action', event=next((row for row in rows if ACTION.search(row['text'])), None)),
    ]
    for cell in cells:
        if cell['event']:
            cell['event'] = dict(cell['event'], text=cell['event']['text'][:240])
    saved = project.state.get('insight_metrics') or {}
    return dict(name=project.name, duration=length, shots=len(shots), cells=cells,
                average=sum(shot['duration'] for shot in shots)/len(shots), metrics=saved)
