function vP({ result, command, page, notify }) {
  const Card = Qa;
  const Modal = hl;
  const FileIcon = fo;
  const [enlarge, setEnlarge] = j.useState(false);
  const [selection, select] = j.useState(null);
  const images = result.images?.length ? result.images : result.image ? [{name:'抽帧图',url:result.image}] : [];
  const current = images.findIndex((image) => image.url === selection);
  const index = Math.max(0, current);
  const image = images[index];
  const frameLabel = images.length > 1 ? '第 ' + (index + 1) + ' 页' : '抽帧图';
  const pageButtons = images.length > 1 && <div className="tool-image-pages" role="group" aria-label="抽帧页码">
    {images.map((item, i) => <button key={item.url} type="button" aria-pressed={i === index}
      title={item.name} onClick={() => select(item.url)}>第 {i + 1} 页</button>)}
  </div>;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result.text);
      notify('结果已复制');
    } catch {
      notify('可选中结果文本后复制。', true);
    }
  }

  return <aside className="tool-result" aria-label="工具结果">
    <Card title={result.title} icon={na}>
      {result.name && <div className="tool-result-file"><FileIcon size={15} /><span title={result.name}>{result.name}</span></div>}
      {image && <>
        <button className="tool-result-image" type="button" aria-label="放大抽帧图" onClick={() => setEnlarge(true)}>
          <img src={image.url} alt={frameLabel} />
          <Hr className="tool-zoom-icon" size={16} />
        </button>
        {pageButtons}
      </>}
      {result.video && <video className="tool-result-video" src={result.video} controls preload="metadata" />}
      {(result.audio || []).map((item) => <div className="tool-audio" key={item.label}>
        <span>{item.label}</span><audio controls preload="none" src={item.url} aria-label={item.label} />
      </div>)}
      {result.text && <pre className="tool-result-text" tabIndex={0}>{result.text}</pre>}
      <div className="button-row tool-actions">
        {result.text && <D icon={Ni} onClick={copyResult}>复制结果</D>}
        {result.name && <D icon={qe} onClick={() => command('tool_open_output',{page})}>打开输出目录</D>}
      </div>
    </Card>
    <Modal open={enlarge && !!image} onClose={() => setEnlarge(false)} title="抽帧图" className="tool-image-modal">
      {image && <img className="tool-image-preview" src={image.url} alt={frameLabel} />}
      {pageButtons}
    </Modal>
  </aside>;
}

function KT({ state, open, close, command, time, disabled, fromExport }) {
  return open && <MixDialog key={state.manual_caption_scope} state={state} close={close}
    command={command} time={time} disabled={disabled} fromExport={fromExport} />;
}

function MixDialog({ state, close, command, time, disabled, fromExport }) {
  const Modal = hl;
  const Toggle = bo;
  const [draft, setDraft] = j.useState(() => ({
    levels: state.audio_mix, external: undefined, history: [], gesture: null,
  }));
  const {levels, external} = draft;
  const volumeGesture = j.useRef(null);
  const [previewRequest, setPreviewRequest] = j.useState(null);
  const [busy, setBusy] = j.useState(false);
  const tracks = state.audio_tracks.filter((track) => track.id !== 'external' || external === undefined);
  const externalPresent = external === undefined ? Boolean(state.external_audio) : Boolean(external);
  if (external) tracks.push({id:'external', label:'外部音频', name:external.name});
  const missing = Object.entries(LP)
    .filter(([id]) => levels[id]?.enabled && !tracks.some((track) => track.id === id))
    .map(([id,label]) => ({id,label,name:'文件不可用',missing:true}));
  const ready = tracks.some(({id}) => levels[id]?.enabled && levels[id].volume > 0);
  const preview = previewRequest && state.mix_preview?.url !== previewRequest.previous ? state.mix_preview : null;
  const locked = disabled || busy;

  function change(id, patch, {audio, gesture = null} = {}) {
    setDraft((previous) => {
      const level = {...previous.levels[id], ...patch};
      const externalAudio = audio === undefined ? previous.external : audio;
      if (level.volume === previous.levels[id].volume && level.enabled === previous.levels[id].enabled &&
          externalAudio === previous.external) return previous;
      const history = gesture && gesture === previous.gesture
        ? previous.history
        : [...previous.history.slice(-99), {levels:previous.levels, external:previous.external}];
      return {levels:{...previous.levels, [id]:level}, external:externalAudio, history, gesture};
    });
    setPreviewRequest(null);
  }

  // Pending mix edits get the shortcut before the saved project history.
  useUndoShortcut(busy || !!draft.history.length, () => {
    if (busy) return;
    setDraft((current) => {
      const previous = current.history.at(-1);
      return previous ? {...previous, history:current.history.slice(0,-1), gesture:null} : current;
    });
    setPreviewRequest(null);
  }, document);

  function payload() {
    return {scope:state.manual_caption_scope, levels, external:external?.key ?? external};
  }

  async function chooseAudio() {
    setBusy(true);
    try {
      const result = await command('pick_mix_audio');
      if (result) change('external',{enabled:true},{audio:result});
    } finally {
      setBusy(false);
    }
  }

  async function playMix(solo) {
    setPreviewRequest({previous:state.mix_preview?.url});
    if (await command('preview_audio_mix',{...payload(), solo}) === undefined) setPreviewRequest(null);
  }

  async function save() {
    setBusy(true);
    try {
      if (await command('save_audio_mix',payload())) close();
    } finally {
      setBusy(false);
    }
  }

  return <Modal open onClose={() => !busy && close()} title="工程音轨混音" className="audio-mix-modal">
    <div className="modal-content">
      <AudioMixHelp levels={levels} />
      <div className="mix-track-list">
        {[...tracks, ...missing].map((track) => {
          const level = levels[track.id];
          return <section className="mix-track" aria-label={labelText(track.label)} key={track.id}>
            <div className="mix-track-head">
              <span className={'mix-track-icon audio-label--' + track.id}><Xa size={17} /></span>
              <div className="mix-track-name"><strong>{labelText(track.label)}</strong><small title={track.name}>{track.name}</small></div>
              <St icon={Md} label={labelText('试听 {0}',labelText(track.label))} disabled={locked || track.missing} onClick={() => playMix(track.id)} />
            </div>
            <label className="mix-volume"><span>音量</span>
              <input type="range" min="0" max="100" value={level.volume} aria-label={labelText('{0}音量',labelText(track.label))}
                onPointerDown={() => { volumeGesture.current = {}; }}
                onPointerUp={() => { volumeGesture.current = null; }}
                onPointerCancel={() => { volumeGesture.current = null; }}
                onKeyDown={() => { volumeGesture.current = null; }}
                onChange={(event) => change(track.id,{volume:Number(event.target.value)},{gesture:volumeGesture.current})}
                disabled={locked} />
              <output>{level.volume}%</output>
            </label>
            <Toggle checked={level.enabled} disabled={locked} onChange={(value) => change(track.id,{enabled:value})}>加入混音</Toggle>
          </section>;
        })}
      </div>
      <div className="mix-external button-row">
        <D icon={qe} disabled={locked} onClick={chooseAudio}>{externalPresent ? '更换外部音频' : '添加外部音频'}</D>
        {externalPresent && <D kind="ghost" icon={Wa} disabled={locked}
          onClick={() => change('external',{enabled:false},{audio:null})}>移除外部音频</D>}
      </div>
      {preview && <div className="mix-preview" aria-label="音频试听">
        <span>{preview.label}</span>
        <audio key={preview.url} src={preview.url} controls preload="metadata" onLoadedMetadata={(event) => {
          const media = event.currentTarget;
          if (time < media.duration) media.currentTime = time;
          media.play().catch(() => {});
        }} />
      </div>}
      {previewRequest && !preview && state.active && <p className="field-hint">正在生成试听音频…</p>}
      {!!(tracks.length || missing.length) && !ready && <p className="field-hint">当前没有启用音轨，按工程音轨导出时将静音。</p>}
    </div>
    <div className="modal-actions">
      <D kind="ghost" disabled={busy} onClick={close}>{fromExport ? '取消并返回导出' : '取消'}</D>
      <D icon={mo} disabled={locked || !ready} onClick={() => playMix()}>试听混音</D>
      <D kind="primary" icon={na} disabled={locked} onClick={save}>{fromExport ? '保存并返回导出' : '保存工程音轨'}</D>
    </div>
  </Modal>;
}

function EN({ state, open, close, command }) {
  const Modal = hl;
  const log = j.useRef(null);
  const follow = j.useRef(true);
  const [feedback, setFeedback] = j.useState('');
  const app = state.application || {};
  const task = state.task || {};
  const phases = {running:'进行中',stopping:'正在停止',done:'已完成',cancelled:'已停止',failed:'失败'};
  const summary = [
    (app.name || 'ShotDecode') + ' ' + (app.version || '本地版') + (app.build ? ' · 构建 ' + app.build : ''),
    app.system && '系统 ' + app.system + ' · Python ' + app.python + ' · 分析引擎 ' + app.engine,
    task.title && '任务 ' + task.title + ' · ' + (phases[task.phase] || state.status),
    task.stage && (task.phase === 'failed' ? '失败阶段 ' : '任务阶段 ') + task.stage,
    task.exit_code != null && '退出码 ' + task.exit_code,
    task.error && '错误 ' + task.error.split('\n')[0],
  ].filter(Boolean);
  const text = [...summary, '', ...(!state.logs.length ? ['暂无任务记录。'] : state.logs)].join('\n');

  j.useEffect(() => {
    if (open) {
      setFeedback('');
      follow.current = true;
    }
  }, [open]);
  j.useLayoutEffect(() => {
    if (open && log.current && follow.current) log.current.scrollTop = log.current.scrollHeight;
  }, [open, text]);

  async function copyDiagnostic() {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('诊断已复制');
    } catch {
      const selection = window.getSelection();
      if (!selection || !log.current) return;
      const range = document.createRange();
      range.selectNodeContents(log.current);
      selection.removeAllRanges();
      selection.addRange(range);
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {
        // The selected text can still be copied manually.
      }
      if (copied) selection.removeAllRanges();
      setFeedback(copied ? '诊断已复制' : '诊断已选中，请按 Ctrl+C 复制');
    }
  }

  return <Modal open={open} onClose={close} title="任务日志" className="logs-modal">
    <div className="modal-content"><pre className="log-output" ref={log} tabIndex={0} onScroll={(event) => {
      const area = event.currentTarget;
      follow.current = area.scrollHeight - area.clientHeight - area.scrollTop < 32;
    }}>{text}</pre></div>
    <div className="modal-actions task-log-actions">
      {feedback && <span role="status">{feedback}</span>}
      {state.active && <D icon={hu} onClick={() => command('stop')}>停止任务</D>}
      <D icon={Ni} onClick={copyDiagnostic}>复制诊断</D>
      <D kind="ghost" onClick={close}>关闭</D>
    </div>
  </Modal>;
}
