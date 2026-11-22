// The timeline, video and inspector read the same in-progress caption.
function useManualCaptionEditor(state, command, pause, seek, playRange, selectContext, notify) {
  const [draft, renderDraft] = j.useState(null);
  const draftRef = j.useRef(null);
  const [saving, setSaving] = j.useState(false);
  const inFlight = j.useRef(null);
  const { scope, cues, limit, defaults, height, sizeRange = [.01, .40], time, override, disabled, motion, laneCount = 1 } = state;
  const current = draft?.scope === scope ? draft : null;
  const busy = disabled || saving;
  const selectedId = current ? current.id || 'manual-caption-draft' : null;
  const previewCues = j.useMemo(() => {
    if (!current) return cues || [];
    const timing = manualCaptionTiming(current, limit) || current.original;
    const edited = { id: selectedId, start: timing.start, end: timing.end, text: current.text, style: current.style, row:current.row };
    return [...(cues || []).filter((cue) => cue.id !== current.id), edited].sort((a, b) => a.start - b.start || a.end - b.end);
  }, [current, selectedId, cues, limit]);
  const layout = j.useMemo(() => layoutManualCaptions(previewCues,laneCount), [previewCues,laneCount]);

  function readDraft() {
    const item = draftRef.current;
    return item?.scope === scope ? item : null;
  }

  function setDraft(item) {
    draftRef.current = item;
    renderDraft(item);
  }

  function startDraft(cue) {
    setDraft({ scope, id: cue.id, original: cue, text: cue.text, start: String(cue.start), end: String(cue.end), row:cue.row,
      style: { ...defaults, ...cue.style }, dirty: false, attempted: false });
  }

  function update(patch) {
    const item = readDraft();
    if (!item || disabled || inFlight.current) return;
    setDraft({ ...item, dirty: true, ...patch });
  }

  function updateStyle(patch) {
    const item = readDraft();
    if (item) update({ style: { ...item.style, ...patch } });
  }

  function change(action, data, apply) {
    if (!scope || disabled || inFlight.current) return Promise.resolve(false);
    setSaving(true);
    const work = command(action, { scope, ...data }).then((result) => {
      if (!result) return false;
      apply(result);
      return true;
    }).finally(() => {
      inFlight.current = null;
      setSaving(false);
    });
    inFlight.current = work;
    return work;
  }

  async function flush(action = 'save_manual_caption') {
    if (inFlight.current) return inFlight.current;
    const item = readDraft();
    if (!item?.dirty || (!item.id && !item.text.trim())) return true;
    const timing = manualCaptionTiming(item, limit);
    if (!timing || !item.text.trim()) {
      setDraft({ ...item, attempted: true });
      notify(!item.text.trim() ? '请填写字幕文字，或用「撤销修改」恢复。' : '请检查字幕的开始与结束时间。',true);
      return false;
    }
    const row = !item.id || item.row !== item.original.row ? item.row : undefined;
    return change(action, { id: item.id, ...timing, text: item.text, style: item.style, row }, startDraft);
  }

  async function selectCue(cue, isCurrent) {
    if (!scope || !limit || disabled) return false;
    if (inFlight.current && !await inFlight.current) return false;
    const item = readDraft();
    const same = item && (item.id || 'manual-caption-draft') === cue.id;
    if (!same && item && !await flush()) return false;
    if (!isCurrent()) return false;
    if (!same) startDraft(cue);
    return true;
  }

  function edit(cue, {locate = true, stylePatch} = {}) {
    return selectContext(async (isCurrent) => {
      if (!await selectCue(cue,isCurrent)) return false;
      if (locate && (override || time < cue.start || time >= cue.end)) {
        pause();
        seek(cue.start);
      }
      if (!stylePatch) return true;
      updateStyle(stylePatch);
      return !readDraft()?.id || await flush();
    });
  }

  function add(at,row) {
    return selectContext(async (isCurrent) => {
      if (!scope || !limit || disabled || !await flush() || !isCurrent()) return false;
      const position = Math.max(0, Math.min(Math.round(at * 1000), Math.round(limit * 1000) - 100)) / 1000;
      const length = Math.min(2,timelineMs(limit-position));
      const start = row === undefined ? position : timelinePlacementStart(position,length,
        layout.groups[row].map(timelineInterval),limit);
      if (start === null) {
        notify('这条轨道没有足够的空位。',true);
        return false;
      }
      startDraft({ start,end:timelineMs(start+length),text:'',row });
      pause();
      seek(start);
      return true;
    });
  }

  function retime(cue, timing, edge, lane) {
    return selectContext(async (isCurrent) => {
      if (!await selectCue(cue,isCurrent)) return false;
      const previous = readDraft();
      const row = lane === 'new-track' ? layout.rows : lane ? Number(lane.slice('caption:'.length)) : previous.row;
      update({ start: String(timing.start), end: String(timing.end), row });
      seek(edge === 'end' ? Math.max(timing.start, timing.end - 0.001) : timing.start);
      if (!previous.id) return true;
      const saved = await flush('retime_manual_caption');
      if (!saved) setDraft(previous);
      return saved;
    });
  }

  async function split(time) {
    if (!await flush()) return false;
    const item = readDraft();
    if (!item?.id) return false;
    pause();
    return change('split_manual_caption', {id:item.id, time}, startDraft);
  }

  async function remove(id) {
    if (id === 'manual-caption-draft') { setDraft(null); return true; }
    return change('remove_manual_caption', { id }, () => {
      if (readDraft()?.id === id) setDraft(null);
    });
  }

  async function reference() {
    const item = readDraft();
    if (!item) return null;
    const timing = manualCaptionTiming(item, limit) || item.original;
    const sample = time >= timing.start && time < timing.end ? time : timing.start;
    const result = await command('reference_caption_style', { scope, time: sample });
    if (result?.style && readDraft()?.original === item.original) {
      updateStyle({ ...result.style, position: readDraft().style.position });
    }
    return result;
  }

  async function close(isCurrent = () => true) {
    if (await flush() && isCurrent()) { setDraft(null); return true; }
    return false;
  }

  function revert() {
    const item = readDraft();
    if (item?.id) startDraft(item.original);
    else setDraft(null);
  }

  async function undoPending() {
    if (inFlight.current) await inFlight.current;
    const item = readDraft();
    if (!item || (item.id && !item.dirty)) return false;
    revert();
    return true;
  }

  return { scope, limit, defaults, height, sizeRange, layout, disabled, busy, draft: current, selectedId, previewCues,
    pause, seek, playRange, motion, edit, add, retime, split, update, updateStyle, flush, remove, close, revert, undoPending, reference };
}

function manualCaptionTiming(cue, limit) {
  const start = Math.round(Number(cue.start) * 1000) / 1000;
  const end = Math.round(Number(cue.end) * 1000) / 1000;
  return cue.start !== '' && cue.end !== '' && start >= 0 && end > start && end <= limit ? { start, end } : null;
}

function captionTimelineLane(index) {
  return 'caption:'+index;
}

function layoutManualCaptions(cues,count) {
  const sorted = [...cues].sort((a,b)=>a.start-b.start || a.end-b.end || a.id.localeCompare(b.id));
  const groups = Array.from({length:count},()=>[]);
  const automatic = [];
  const conflicts = (cue,lane) => lane.some(peer=>cue.start < peer.end && peer.start < cue.end);
  for (const cue of sorted) {
    if (!Number.isInteger(cue.row) || cue.row < 0 || cue.row >= 4096) {
      automatic.push(cue);
      continue;
    }
    while (groups.length <= cue.row) groups.push([]);
    if (conflicts(cue,groups[cue.row])) automatic.push(cue);
    else groups[cue.row].push(cue);
  }
  for (const cue of automatic) {
    const row = groups.findLastIndex(lane=>conflicts(cue,lane)) + 1;
    if (row === groups.length) groups.push([]);
    groups[row].push(cue);
  }
  return {groups,rows:groups.length};
}

function ManualCaptionLabel({ editor, time }) {
  return <button type="button" className="timeline-track-label manual-caption-label" aria-label="添加字幕"
                 title="在播放头位置添加字幕" disabled={editor.busy || !editor.limit} onClick={() => editor.add(time)}>
    {j.createElement(va, { size: 14, 'aria-hidden': true })}<span>手动字幕</span><Hi size={14} aria-hidden="true" />
  </button>;
}

function ManualCaptionLane({ editor, timeline, duration }) {
  const board = j.useRef(null);
  const { groups, rows } = editor.layout;

  function timeAt(event) {
    const bounds = board.current.getBoundingClientRect();
    return Math.min(duration, Math.max(0, (event.clientX - bounds.left) / bounds.width * duration));
  }

  return <div className="manual-caption-lane" aria-label="手动字幕轨道">
      <div className="manual-caption-board" ref={board} style={{ '--caption-rows': rows }}>
        {!editor.previewCues.length && <span className="caption-empty">
          {editor.limit ? '双击空白处添加字幕' : '正在读取视频时长…'}
        </span>}
        {groups.map((peers,row) => <div className="manual-caption-row" key={row}
          data-timeline-lane={captionTimelineLane(row)} aria-label={labelText('字幕轨 {0}',row+1)}
          style={{'--caption-row':row}}
          onClick={event=>{ if (event.target === event.currentTarget && editor.limit) editor.seek(timeAt(event)); }}
          onDoubleClick={event=>{ if (event.target === event.currentTarget) editor.add(timeAt(event),row || undefined); }}>
          {peers.map(cue => <ManualCaptionClip key={cue.id} cue={cue} row={row}
            duration={duration} editor={editor} timeline={timeline} peers={peers}/>)}
        </div>)}
      </div>
    </div>;
}

function ManualCaptionClip({ cue, row, duration, editor, timeline, peers }) {
  const label = cue.text || '新字幕';
  const bounds = {start:cue.start,first:cue.start,last:cue.end,minFirst:0,maxLast:editor.limit,
    minLength:Math.min(.05,cue.end-cue.start)};
  const select = () => editor.edit(cue);
  const gesture = useTimelineDrag({id:cue.id,bounds,duration,editor:timeline,peers,limit:editor.limit,kind:'caption',
    ghost:{type:'caption',label},select,commit:(range,operation,edge)=>editor.retime(cue,{
      start:range.start,end:timelineMs(range.start+range.last-range.first),
    },edge,range.lane)});
  return <button type="button" data-timeline-clip data-caption-id={cue.id}
    className={'manual-caption-clip' + (editor.selectedId === cue.id ? ' selected' : '') +
      (gesture.moving ? ' timeline-drag-origin' : '')}
    style={{...timelineClipStyle(gesture.start,gesture.end,duration),'--caption-row':row}}
    aria-label={'字幕 ' + label} aria-pressed={editor.selectedId === cue.id}
    aria-keyshortcuts="Enter ArrowLeft ArrowRight Backspace Delete" aria-disabled={timeline.disabled}
    title={label + '\n' + kt(gesture.start,true) + ' – ' + kt(gesture.end,true)}
    onClick={event=>{ if (!event.detail && !timeline.disabled) select(); }} {...gesture.handle('move')}>
    <span className="caption-trim caption-trim-start" data-edge="start" aria-hidden="true"/>
    <span className="caption-clip-text">{label}</span>
    <span className="caption-trim caption-trim-end" data-edge="end" aria-hidden="true"/>
  </button>;
}

function ManualCaptionInspector({ editor, agentEntry }) {
  return <aside id="task-inspector" className="inspector task-panel property-inspector manual-caption-inspector" aria-label="字幕编辑面板">
    <PanelResizeHandle tab="manual-captions" />
    <ManualCaptionFields key={editor.selectedId} editor={editor} />
    {agentEntry}
  </aside>;
}

function ManualCaptionFields({ editor }) {
  const cue = editor.draft;
  const { text, start, end, style } = cue;
  const [fonts, setFonts] = j.useState(null);
  const [probing, setProbing] = j.useState(false);
  const [reference, setReference] = j.useState('');
  const [tab, setTab] = j.useState('text');
  const font = style.font || 'Microsoft YaHei';
  const timing = manualCaptionTiming(cue,editor.limit);
  const validTime = Boolean(timing);
  const span = timing || cue.original;
  const tabs = [['text','文字'],['layout','排版'],['animation','动画'],['timing','时间']];
  const position = style.position || {x:.5,y:.90};
  function locate(axis,value) {
    editor.updateStyle({position:{...position,[axis]:value/100}});
  }

  j.useEffect(() => {
    let mounted = true;
    Uo('manual_caption_fonts').then((available) => { if (mounted) setFonts(available); })
      .catch(() => {
        if (!mounted) return;
        setFonts([]);
        setReference('暂时无法读取本机字体列表。');
      });
    return () => { mounted = false; };
  }, []);

  async function useReference() {
    setProbing(true);
    try {
      const result = await editor.reference();
      if (result) setReference(result.note);
    } finally {
      setProbing(false);
    }
  }

  return <>
    <div className="property-header">
      <span className="property-object-icon">{j.createElement(va,{size:17,'aria-hidden':true})}</span>
      <div className="property-heading"><h2>字幕编辑</h2><div title={cue.text}>{cue.text || '新字幕'}</div></div>
      <div className="property-header-actions"><St icon={Wa} label="关闭字幕编辑" disabled={editor.busy} onClick={()=>editor.close()} /></div>
    </div>
    <PropertyTabs label="字幕属性类别" tabs={tabs} value={tab} setValue={setTab} className="manual-caption-form">
      {tab === 'text' && <>
      <section className="inspector-block">
        <label className="tool-field">
          <span>字幕内容</span>
          <textarea autoFocus={!cue.id} rows={3} maxLength={4000} value={text} placeholder="输入字幕文字"
                    disabled={editor.busy}
                    style={{ fontFamily: captionFontFamily(font), fontWeight: style.bold ? 700 : 400 }}
                    onChange={(event) => editor.update({ text: event.target.value })} />
        </label>
        {cue.attempted && !text.trim() && <p className="field-hint" role="alert">请输入字幕文字，或撤销修改。</p>}
      </section>
      <section className="inspector-block manual-caption-style-controls">
        <CaptionFontPicker font={font} text={text} systemFonts={fonts} disabled={editor.busy || probing}
          onSelect={(name) => {
            editor.updateStyle({font:name});
            setReference('');
          }}>
          <D disabled={editor.busy || probing} busy={probing} onClick={useReference}>参考原片</D>
        </CaptionFontPicker>
        {reference && <p className="field-hint caption-reference-note" role="status">{reference}</p>}
        <ManualCaptionSize editor={editor} disabled={editor.busy || probing} />
        <div className="manual-caption-appearance">
          <D disabled={editor.busy || probing} aria-pressed={style.bold} onClick={() => editor.updateStyle({ bold: !style.bold })}>加粗</D>
          <label>颜色<input type="color" aria-label="文字颜色" value={style.fill || '#ffffff'}
            disabled={editor.busy || probing} onChange={(event) => editor.updateStyle({ fill: event.target.value })}/></label>
          {style.position && <D kind="ghost" className="caption-reset-position" disabled={editor.busy}
            onClick={() => editor.updateStyle({ position: null })}>移回底部</D>}
        </div>
      </section>
      </>}
      {tab === 'layout' && <PropertySection title="字幕位置与大小">
        <div className="property-two">
          <PropertyNumber label="字幕水平位置" mark="X" suffix="%" min={0} max={100} step={.1}
            value={Math.round(position.x*1000)/10} disabled={editor.busy} onValue={(value) => locate('x',value)} />
          <PropertyNumber label="字幕垂直位置" mark="Y" suffix="%" min={0} max={100} step={.1}
            value={Math.round(position.y*1000)/10} disabled={editor.busy} onValue={(value) => locate('y',value)} />
        </div>
        <ManualCaptionSize editor={editor} disabled={editor.busy || probing} />
        <D kind="ghost" disabled={editor.busy || !style.position}
          onClick={() => editor.updateStyle({position:null})}>移回底部</D>
        <p className="field-hint">也可拖动画面里的字幕移动，拖动角点缩放。</p>
      </PropertySection>}
      {tab === 'animation' && <MotionPicker style={style} duration={span.end-span.start}
        library={editor.motion} title={text.trim().split('\n')[0]} disabled={editor.busy || !validTime}
        update={editor.updateStyle} preview={text.trim() && ((start,end)=>editor.playRange(span.start+start,span.start+end))} />}
      {tab === 'timing' && <section className="inspector-block manual-caption-timing">
        <div className="tool-fields two-fields">
          <label className="tool-field"><span>开始（秒）</span>
            <input type="number" min="0" max={editor.limit} step="0.001" value={start} disabled={editor.busy}
                   onChange={(event) => editor.update({ start: event.target.value })} /></label>
          <label className="tool-field"><span>结束（秒）</span>
            <input type="number" min="0" max={editor.limit} step="0.001" value={end} disabled={editor.busy}
                   onChange={(event) => editor.update({ end: event.target.value })} /></label>
        </div>
        {!validTime && <p className="field-hint" role="alert">起止时间需在视频范围内，且结束晚于开始。</p>}
      </section>}
    </PropertyTabs>
    <div className="manual-caption-actions">
      {cue.id && <D kind="ghost" className="remove-manual-caption" disabled={editor.busy}
        onClick={() => editor.remove(cue.id)}>删除</D>}
      {(cue.dirty || !cue.id) && <D kind="ghost" disabled={editor.busy} onClick={editor.revert}>
        {cue.id ? '撤销修改' : '取消'}
      </D>}
      <D kind="primary" disabled={editor.busy || probing || !cue.dirty || !text.trim() || !validTime}
         onClick={() => editor.flush()}>保存字幕</D>
    </div>
  </>;
}

function ManualCaptionSize({ editor, disabled }) {
  const [typed, setTyped] = j.useState(null);
  const height = editor.height || 1080;
  const [minRatio, maxRatio] = editor.sizeRange;
  const min = Math.max(1, Math.ceil(minRatio * height));
  const max = Math.max(min, Math.floor(maxRatio * height));
  const pixels = Math.min(max, Math.max(min, Math.round(editor.draft.style.size * height)));
  function setSize(value) {
    editor.updateStyle({ size: Math.min(max, Math.max(min, Math.round(value))) / height });
  }
  return <div className="manual-caption-size">
    <label className="tool-field">
      <span>字号</span>
      <input aria-label="字号（像素）" type="number" min={min} max={max} step="1" disabled={disabled}
        value={typed ?? pixels} onChange={(event) => {
          const value = event.target.value;
          setTyped(value);
          if (value !== '' && Number(value) >= min && Number(value) <= max) setSize(Number(value));
        }} onBlur={() => {
          if (typed !== null && typed !== '' && Number.isFinite(Number(typed))) setSize(Number(typed));
          setTyped(null);
        }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
    </label>
    <input className="caption-size-slider" aria-label="拖动调整字号" type="range" min={min} max={max}
      step="1" value={pixels} disabled={disabled} onChange={(event) => {
        setTyped(null);
        setSize(Number(event.target.value));
      }} />
  </div>;
}

function captionFontLabel(font) {
  const labels = {
    'Microsoft YaHei': '微软雅黑', 'Microsoft JhengHei': '微软正黑体', SimHei: '黑体', SimSun: '宋体',
    DengXian: '等线', KaiTi: '楷体', FangSong: '仿宋', Meiryo: 'メイリオ', 'Yu Gothic': '游ゴシック',
    'Noto Sans SC': 'Noto 黑体（简体）', 'Noto Serif SC': 'Noto 宋体（简体）',
    'Noto Sans CJK TC': 'Noto 黑体（繁体）', 'Noto Serif CJK TC': 'Noto 明体（繁体）',
    'LXGW WenKai': '霞鹜文楷', 'LXGW WenKai Screen': '霞鹜文楷屏幕阅读版',
    'LXGW WenKai TC': '霞鹜文楷（繁体）', 'LXGW WenKai Mono TC': '霞鹜文楷等宽（繁体）',
    'LXGW Marker Gothic': '霞鹜漫黑', 'Smiley Sans': '得意黑', Xiaolai: '小赖字体', Yozai: '悠哉字体',
    'Ma Shan Zheng': '马善政毛笔', 'Zhi Mang Xing': '志莽行书', 'Liu Jian Mao Cao': '刘建毛草', 'Long Cang': '龙藏体',
    'ZCOOL KuaiLe': '站酷快乐体', 'ZCOOL QingKe HuangYou': '站酷庆科黄油体', 'ZCOOL XiaoWei': '站酷小薇体',
    Huninn: '粉圆体', Iansui: '芫荽体', 'Bpmf Huninn': '注音粉圆体', 'Bpmf Iansui': '注音芫荽体',
    'Bpmf Zihi Kai Std': '注音楷体', 'GenSen Rounded TC': '源泉圆体（繁体）', 'GenSeki Gothic TC': '源石黑体（繁体）',
    'WDXL Lubrifont SC': 'WDXL 圆体（简体）', 'WDXL Lubrifont TC': 'WDXL 圆体（繁体）',
    'BIZ UDGothic': 'BIZ UDゴシック', 'BIZ UDPGothic': 'BIZ UDPゴシック',
    'BIZ UDMincho': 'BIZ UD明朝', 'BIZ UDPMincho': 'BIZ UDP明朝', 'Zen Maru Gothic': 'Zen 丸ゴシック',
    'Zen Old Mincho': 'Zen オールド明朝', 'Zen Kurenaido': 'Zen 紅道', 'Klee One': 'クレー',
    'Dela Gothic One': 'デラゴシック', 'DotGothic16': 'ドットゴシック', 'Hachi Maru Pop': 'はちまるポップ',
    'Hina Mincho': 'ひな明朝', 'Kiwi Maru': 'キウイ丸', 'Sawarabi Gothic': 'さわらびゴシック',
    'Sawarabi Mincho': 'さわらび明朝', 'Shippori Mincho': 'しっぽり明朝', 'Yomogi': 'よもぎ',
  };
  return labels[font] ? labels[font] + ' · ' + font : font;
}

function captionFontFamily(font) {
  const bundled = captionBundledFamilies.get(font.toLowerCase());
  return [bundled, font, 'Microsoft YaHei'].filter(Boolean).map((name) => JSON.stringify(name)).join(', ') + ', sans-serif';
}

function useCaptionMotionClock(player,url,active) {
  const [current,setCurrent] = j.useState(null);
  j.useEffect(() => {
    const video = player.current;
    if (!video || !active) {
      setCurrent(null);
      return;
    }
    let request = 0;
    function sample() {
      request=0;
      setCurrent(video.currentTime);
      if (!video.paused && !video.ended) schedule();
    }
    function schedule() {
      if (!request) request=requestAnimationFrame(sample);
    }
    const events = ['play','pause','seeked','loadeddata'];
    events.forEach((event)=>video.addEventListener(event,schedule));
    schedule();
    return () => {
      cancelAnimationFrame(request);
      events.forEach((event)=>video.removeEventListener(event,schedule));
    };
  },[player,url,active]);
  return current;
}

function ManualCaptionPreview({ editor, player, url, raised, canvas, liveTime }) {
  const frame = usePreviewFrame(player, url, canvas?.width, canvas?.height);
  const [activeIds, setActiveIds] = j.useState([]);
  const [gesture, setGesture] = j.useState(null);
  const plane = j.useRef(null);
  const drag = j.useRef(null);
  const preview = j.useRef(null);
  const cues = editor.previewCues;
  const intervals = JSON.stringify(cues.map(({ id, start, end }) => ({ id, start, end })));
  const trajectories = j.useMemo(() => new Map(cues.filter((cue)=>cue.style?.animation).map((cue)=>
    [cue.id,motionTimeline(cue.style,cue.end-cue.start,editor.motion)])),[cues,editor.motion]);
  const logical = Number.isFinite(liveTime);
  const clock = useCaptionMotionClock(player,url,
    !logical && activeIds.some((id)=>trajectories.get(id)?.length)) ?? liveTime ?? player.current?.currentTime ?? 0;
  const visibleIds = logical ? cues.filter(cue=>cue.start<=clock && clock<cue.end).map(cue=>cue.id) : activeIds;

  j.useEffect(() => {
    if (logical) return;
    const video = player.current;
    if (!video) return;
    if (preview.current?.video !== video) {
      preview.current = { video, track: video.addTextTrack('metadata', '手动字幕时间') };
    }
    const { track } = preview.current;
    const timing = JSON.parse(intervals);
    const timedCues = timing.map((cue) => {
      const timed = new VTTCue(cue.start, cue.end, '');
      timed.id = cue.id;
      track.addCue(timed);
      return timed;
    });
    function sync() {
      const time = video.currentTime;
      const ids = timing.filter((cue) => time >= cue.start && time < cue.end).map((cue) => cue.id);
      setActiveIds((previous) => previous.length === ids.length && previous.every((id, i) => ids[i] === id) ? previous : ids);
    }
    track.mode = 'hidden';
    track.addEventListener('cuechange', sync);
    video.addEventListener('seeked', sync);
    video.addEventListener('timeupdate', sync);
    sync();
    return () => {
      track.removeEventListener('cuechange', sync);
      video.removeEventListener('seeked', sync);
      video.removeEventListener('timeupdate', sync);
      timedCues.forEach((cue) => track.removeCue(cue));
      track.mode = 'disabled';
    };
  }, [intervals, player, url, logical]);

  function begin(event, cue, motion) {
    if (editor.disabled || event.button !== 0 || drag.current) return;
    const bounds = plane.current.getBoundingClientRect();
    const box = event.currentTarget.getBoundingClientRect();
    const centerX = box.left + box.width / 2, centerY = box.top + box.height / 2;
    drag.current = { pointer: event.pointerId, cue, width: bounds.width, height: bounds.height,
      originX: event.clientX, originY: event.clientY,
      anchorX: event.clientX - centerX, anchorY: event.clientY - centerY,
      x: (centerX - bounds.left) / bounds.width - motion.x,
      y: (centerY - bounds.top) / bounds.height - motion.y,
      scale: !!event.target.closest('[data-caption-scale]'), selected: editor.selectedId === cue.id,
      wasDirty: editor.draft?.dirty };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const item = drag.current;
    if (!item || editor.busy || event.pointerId !== item.pointer) return;
    const dx = event.clientX - item.originX, dy = event.clientY - item.originY;
    if (!item.patch && Math.hypot(dx, dy) < 3) return;
    if (!item.patch) editor.pause();
    const clamp = (value) => Math.min(1, Math.max(0, value));
    if (item.scale) {
      const { anchorX, anchorY } = item;
      const factor = 1 + (dx * anchorX + dy * anchorY) / Math.max(1, anchorX ** 2 + anchorY ** 2);
      const [min, max] = editor.sizeRange;
      const size = Math.round(Math.max(min, Math.min(max, item.cue.style.size * factor)) * 10000) / 10000;
      item.patch = { size, position: item.cue.style.position || { x: clamp(item.x), y: clamp(item.y) } };
    } else {
      item.patch = { position: { x: clamp(item.x + dx / item.width), y: clamp(item.y + dy / item.height) } };
    }
    if (item.selected) editor.updateStyle(item.patch);
    else setGesture({ id: item.cue.id, patch: item.patch });
  }

  async function finish(event) {
    const item = drag.current;
    if (!item || event.pointerId !== item.pointer) return;
    drag.current = null;
    try {
      await editor.edit(item.cue, {locate:false, stylePatch:item.patch});
    } finally {
      setGesture(null);
    }
  }

  function cancel(event) {
    const item = drag.current;
    if (event.pointerId !== item?.pointer) return;
    drag.current = null;
    if (item.patch && item.selected && editor.selectedId === item.cue.id) {
      editor.update({ style: item.cue.style, dirty: item.wasDirty });
    }
    setGesture(null);
  }

  if (!frame?.height || !visibleIds.length) return null;
  return <div className="manual-caption-preview" style={frame} ref={plane}>
    <div className="manual-caption-stack" style={{ paddingBottom: frame.height * (raised ? .15 : .06) }}>
      {cues.filter((cue) => cue.text.trim() && visibleIds.includes(cue.id)).map((cue) => {
        const style = { ...editor.defaults, ...cue.style, ...(gesture?.id === cue.id ? gesture.patch : null) };
        const position = style.position;
        const selected = editor.selectedId === cue.id;
        const size = frame.height * (style.size || .053);
        const coords = position ? { left: position.x * 100 + '%', top: position.y * 100 + '%' } : {};
        const trajectory = trajectories.get(cue.id);
        const motion = motionAt(trajectory || [],clock-cue.start);
        const visible = motion.opacity > .025;
        const transform = trajectory?.length ? (position ? 'translate(-50%, -50%) ' : '')+
          'translate('+motion.x*frame.width+'px,'+motion.y*frame.height+'px) rotate('+motion.angle+'deg) scale('+motion.scale+')' :
          undefined;
        return <button key={cue.id} type="button" data-preview-caption={cue.id}
          className={'manual-caption-on-video' + (position ? ' positioned' : '') + (selected ? ' selected' : '')}
          style={{ ...coords, fontSize: size, fontWeight: style.bold ? 700 : 400, color: style.fill,
            background: style.box || undefined, fontFamily: captionFontFamily(style.font || 'Microsoft YaHei'),
            transform, transformOrigin:position?'center':'center bottom', opacity:motion.opacity,
            pointerEvents:visible ? undefined : 'none',
            filter:motion.blur ? 'blur('+motion.blur*Math.min(frame.width,frame.height)+'px)' : undefined,
            WebkitTextStroke: !style.box && style.outline ? size * style.outline * 2 + 'px ' + style.stroke : undefined }}
          title="单击选择字幕，拖动调整位置" aria-label={'画面字幕 ' + cue.text} aria-pressed={selected}
          aria-hidden={!visible || undefined} aria-disabled={editor.disabled} tabIndex={visible ? 0 : -1}
          onPointerDown={(event) => begin(event, { ...cue, style },motion)} onPointerMove={move} onPointerUp={finish}
          onPointerCancel={cancel} onLostPointerCapture={cancel}
          onClick={(event) => { if (!event.detail) editor.edit(cue, {locate:false}); }}>
          {cue.text}
          {selected && ['nw', 'ne', 'sw', 'se'].map((corner) =>
            <span key={corner} data-caption-scale={corner} aria-hidden="true" className="caption-scale-handle" />
          )}
        </button>;
      })}
    </div>
  </div>;
}
