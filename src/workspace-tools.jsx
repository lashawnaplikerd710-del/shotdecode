function WorkspaceModal(props) {
  return j.createElement(hl,props);
}

function clipAtSourceTime(project, time) {
  return [...(project.timeline || []),...project.timeline_video].find(item=>Number.isFinite(item.source_start) &&
    item.source_start <= time && time < item.source_start+item.duration);
}

function ProjectToolkit({ state, disabled, command, close, seek }) {
  const [tab, setTab] = j.useState('insight');
  const project = state.project;
  return <WorkspaceModal open onClose={close} title="项目工具" className="project-toolkit">
    <ProjectToolTabs tabs={ [['insight','爆款分析'],['template','换品模板'],['versions','版本']] } tab={tab} setTab={setTab} />
    <div className="project-toolkit-body" key={tab + project.id}>
      {tab === 'insight' && <ProjectInsights project={project} command={command} disabled={disabled}
        locate={(sourceTime) => {
          const clip = clipAtSourceTime(project,sourceTime);
          if (project.timeline && !clip) return;
          seek(clip ? clip.start + sourceTime - clip.source_start : sourceTime);
          close();
        }} />}
      {tab === 'template' && <ProductTemplate project={project} command={command} disabled={disabled} close={close} />}
      {tab === 'versions' && <ProjectVersions project={project} command={command} disabled={disabled} />}
    </div>
  </WorkspaceModal>;
}

function ProjectToolTabs({ tabs, tab, setTab }) {
  return <div className="project-tool-tabs" role="group" aria-label="工具分类">
    {tabs.map(([id, label]) => <button key={id} type="button" aria-pressed={id===tab}
      onClick={() => setTab(id)}>{label}</button>)}
  </div>;
}

function useProjectTool(project, command, initial) {
  const [result, setResult] = j.useState(null);
  const [busy, setBusy] = j.useState(false);
  async function run(action, data) {
    setBusy(true);
    try {
      const next = await command(action, {project:project.id, ...data});
      if (next && typeof next === 'object') setResult(next);
      return next;
    } finally {
      setBusy(false);
    }
  }
  j.useEffect(() => { run(initial); }, [project.id, initial]);
  return { result, busy, run };
}

function ProjectInsights({ project, command, disabled, locate }) {
  const tool = useProjectTool(project, command, 'insight_list');
  const [metrics, setMetrics] = j.useState(null);
  const data = tool.result;
  if (!data) return <p className="field-hint">{tool.busy ? '正在读取分析…' : '暂时无法读取分析。'}</p>;
  const sample = data.current;
  const values = metrics || sample.metrics;
  const locked = disabled || tool.busy;
  const names = { opening:'开场 3 秒', product:'产品文字线索', proof:'卖点证明线索', action:'转化引导线索' };
  return <>
    <div className="insight-summary">
      <strong>{sample.name}</strong>
      <span>{labelText('{0} 秒 · {1} 个镜头 · 平均 {2} 秒', sample.duration.toFixed(2), sample.shots, sample.average.toFixed(2))}</span>
    </div>
    <div className="insight-grid">
      {sample.cells.map(({kind, event, cuts}) => <section className="insight-cell" key={kind}>
        <h3>{names[kind]}</h3>
        {kind==='opening' && <p>{labelText('前 3 秒有 {0} 次切镜',cuts)}</p>}
        {event ? <>
          <button type="button" className="insight-time" onClick={() => locate(event.start)}
            disabled={Boolean(project.timeline && !clipAtSourceTime(project,event.start))}>{kt(event.start,true)} · {labelText(event.evidence)}</button>
          <p className="insight-evidence">{event.text}</p>
        </> : <p className="field-hint">已有画面文字或口播里暂无明确线索。</p>}
      </section>)}
    </div>
    <div className="insight-metrics">
      <h3>平台数据与对比</h3>
      <p className="field-hint">结合真实留存和转化数据判断片段表现。上面的线索来自已有文字识别。</p>
      <form className="project-tool-line" onSubmit={async (event) => {
        event.preventDefault();
        const percent = (name) => values[name] === '' || values[name] == null ? null : Number(values[name]);
        if (await tool.run('insight_save', {retention:percent('retention'),conversion:percent('conversion')})) setMetrics(null);
      }}>
        {[['retention','3 秒留存率 %'],['conversion','转化率 %']].map(([name,label]) => <label className="tool-field" key={name}>
          <span>{label}</span><input type="number" min="0" max="100" step="0.001" value={values[name] ?? ''}
            onChange={(event) => setMetrics({...values,[name]:event.target.value})} />
        </label>)}
        <D type="submit" disabled={locked}>保存数据</D>
      </form>
      <D icon={qe} disabled={locked} onClick={() => tool.run('insight_compare')}>添加对比项目</D>
      {!!data.comparisons.length && <div className="insight-table-wrap">
        <table className="insight-table">
          <thead><tr><th>参考片</th><th>前 3 秒切镜</th><th>首次转化引导</th><th>3 秒留存</th><th>转化率</th></tr></thead>
          <tbody>{[sample, ...data.comparisons].map((row,index) => {
            const action = row.cells.find(item => item.kind==='action').event;
            const metric = (key) => row.metrics[key] == null ? '—' : row.metrics[key] + '%';
            return <tr key={index}><th scope="row">{row.name}</th><td>{row.cells[0].cuts}</td>
              <td>{action ? kt(action.start,true) : '—'}</td><td>{metric('retention')}</td><td>{metric('conversion')}</td></tr>;
          })}</tbody>
        </table>
      </div>}
    </div>
  </>;
}

function ProductTemplate({ project, command, disabled, close }) {
  const tool = useProjectTool(project, command, 'template_list');
  const [pairs,setPairs] = j.useState({});
  const [preview,setPreview] = j.useState('');
  const [name,setName] = j.useState('');
  const [requirements,setRequirements] = j.useState({});
  const data = tool.result;
  const effective = Object.fromEntries((data?.slots || []).map(slot => [slot.shot,pairs[slot.shot] ?? slot.suggestion ?? '']));
  const matched = Object.fromEntries(Object.entries(effective).filter(([,id]) => id));
  const locked = disabled || tool.busy;
  const candidate = data?.materials.find(item => item.id===preview);
  const notes = Object.fromEntries((data?.slots || []).map(slot=>[slot.shot,requirements[slot.shot] ?? slot.requirement]));
  async function choose() {
    const result = await tool.run('template_folder');
    if (result) {
      setPairs(Object.fromEntries(result.slots.map(slot=>[slot.shot,slot.suggestion || ''])));
      setPreview('');
    }
  }
  return <>
    <p className="field-hint">按参考片的镜头时长和画幅匹配素材。确认每个素材位后，再一次应用。</p>
    <div className="project-tool-line">
      <D icon={qe} disabled={locked} onClick={choose}>{tool.busy ? '正在读取…' : '选择素材文件夹'}</D>
      <D kind="primary" disabled={locked || !Object.keys(matched).length} onClick={async () => {
        if (await tool.run('template_apply',{pairs:matched})) close();
      }}>应用批量替换</D>
    </div>
    {data && <>
      {candidate && <div className="template-preview">
        <video key={candidate.id} src={candidate.url} controls playsInline preload="metadata" />
        <strong>{candidate.name}</strong>
        <St icon={Wa} label="关闭素材预览" onClick={() => setPreview('')} />
      </div>}
      <div className="template-grid">{data.slots.map((slot) => <section className="template-slot" key={slot.shot}>
        <Gr src={slot.thumb} />
        <div className="template-slot-copy">
          <strong>{labelText('镜头 {0}',slot.shot)}</strong>
          <small>{kt(slot.start,true)} · {slot.duration.toFixed(2)} s · {slot.width} × {slot.height}</small>
          {slot.text && <p title={slot.text}>{slot.text}</p>}
        </div>
        <select aria-label={labelText('镜头 {0} 的替换素材',slot.shot)} value={effective[slot.shot]}
          disabled={locked || !data.materials.length} onChange={(event) => setPairs({...pairs,[slot.shot]:event.target.value})}>
          <option value="">保留现有画面</option>
          {data.materials.map(item => <option key={item.id} value={item.id}>{item.name} · {item.duration.toFixed(2)} s · {item.width} × {item.height}</option>)}
        </select>
        <St icon={qe} label={labelText('预览镜头 {0} 的替换素材',slot.shot)} disabled={!effective[slot.shot]}
          onClick={() => setPreview(effective[slot.shot])} />
        <details className="template-requirement">
          <summary>{notes[slot.shot] || '卖点要求'}</summary>
          <input type="text" aria-label={labelText('镜头 {0} 的卖点要求',slot.shot)} value={notes[slot.shot]} maxLength={200}
            placeholder="例如 展示产品实际使用效果" onChange={event=>setRequirements({...requirements,[slot.shot]:event.target.value})}/>
        </details>
      </section>)}</div>
      <form className="project-tool-line" onSubmit={async (event) => {
        event.preventDefault();
        if (await tool.run('template_save',{name,requirements:notes})) {
          setName('');
          setRequirements({});
        }
      }}>
        <label className="tool-field grow"><span>模板名</span>
          <input value={name} maxLength={60} placeholder="例如 日区 15 秒商品展示" onChange={event => setName(event.target.value)} />
        </label>
        <D type="submit" disabled={locked || !name.trim()}>保存参考模板</D>
      </form>
      {data.presets.map(item => <div className="project-history-row" key={item.id}>
        <span>{item.name}</span><D kind="ghost" disabled={locked} onClick={async () => {
          if (await tool.run('template_open',{id:item.id})) close();
        }}>打开模板项目</D>
      </div>)}
    </>}
  </>;
}

function ProjectVersions({ project, command, disabled }) {
  const tool = useProjectTool(project, command, 'version_list');
  const [name,setName] = j.useState('');
  const data = tool.result;
  return <>
    <p className="field-hint">保存当前剪辑、替换素材、字幕和音轨，可随时切回这个版本。</p>
    <form className="project-tool-line" onSubmit={async (event) => {
      event.preventDefault();
      if (await tool.run('version_save',{name})) setName('');
    }}>
      <label className="tool-field grow"><span>版本名</span><input maxLength={60} value={name}
        onChange={event => setName(event.target.value)} placeholder="例如 A 版 · 快节奏" /></label>
      <D type="submit" kind="primary" disabled={disabled || tool.busy || !name.trim()}>保存当前版本</D>
    </form>
    {data?.versions.map(version => <div className="project-history-row" key={version.id}>
      <div><strong>{version.name}</strong><time>{version.saved.replace('T',' ')}</time></div>
      <D kind="ghost" disabled={disabled || tool.busy} onClick={() => tool.run('version_restore',{id:version.id})}>恢复此版本</D>
    </div>)}
    <h3 className="project-tool-subheading">导出记录</h3>
    {data?.exports.length ? data.exports.map(row => <div className="project-history-row" key={row.id}>
      <span>{row.name}</span><D kind="ghost" icon={qe} onClick={() => command('version_open_export',{project:project.id, id:row.id})}>
        {row.video ? '打开成片' : row.folder ? '打开文件夹' : '打开文件'}
      </D>
    </div>) : <p className="field-hint">暂时没有导出记录。</p>}
  </>;
}

function ClipTrackEditor({ project, shot, time, command, close, disabled, initialAudio }) {
  const [tab,setTab] = j.useState(initialAudio ? 'audio' : 'clip');
  const [edited,setEdited] = j.useState(null);
  const [audioId,setAudioId] = j.useState(initialAudio || '');
  const [busy,setBusy] = j.useState(false);
  const [names,setNames] = j.useState(null);
  const clips = project.timeline || project.shots;
  const active = clips.find(item=>item.id===shot?.id) || clips[0];
  const position = clips.indexOf(active);
  const locked = disabled || busy;
  const range = edited || {first:active?.first ?? 0, last:active?.last ?? active?.duration};
  const audio = project.timeline_audio.find(item=>item.id===audioId) || project.timeline_audio[0];
  const audioDraft = names?.id===audio?.id ? names : audio;
  async function run(action,data) {
    setBusy(true);
    try { return await command(action, {project:project.id,...data}); }
    finally { setBusy(false); }
  }
  async function placement(operation,data={}) {
    if (await run('timeline_edit',{clip:active.id,operation,...data})) {
      setEdited(null);
      close();
    }
  }
  const number = (value) => Number(value);
  return <WorkspaceModal open onClose={close} title="轨道编辑" className="clip-track-editor">
    <ProjectToolTabs tabs={ [['clip','画面'],['audio','配乐与配音']] } tab={tab} setTab={setTab} />
    <div className="project-toolkit-body">
      {tab==='clip' ? active ? <>
        <div className="project-tool-line track-clip-tools">
          <strong>{labelText('镜头 {0}',position+1)} · {kt(active.start,true)}</strong>
          <D disabled={locked || position===0} onClick={() => placement('earlier')}>前移</D>
          <D disabled={locked || position===clips.length-1} onClick={() => placement('later')}>后移</D>
          <D icon={mu} disabled={locked || time<=active.start+.04 || time>=active.end-.04}
            onClick={() => placement('split',{time})}>在播放头分割</D>
        </div>
        <form className="project-tool-line" onSubmit={(event) => {
          event.preventDefault(); placement('trim',{first:number(range.first),last:number(range.last)});
        }}>
          {[['first','镜头内入点（秒）'],['last','镜头内出点（秒）']].map(([key,label]) => <label className="tool-field" key={key}>
            <span>{label}</span><input type="number" required min="0" max={active.original_duration ?? active.duration}
              step="0.001" value={range[key]} onChange={event=>setEdited({...range,[key]:event.target.value})} />
          </label>)}
          <D type="submit" kind="primary" disabled={locked || !edited}>应用修剪</D>
        </form>
      </> : <p className="field-hint">分镜轨道为空。</p> : <>
        <div className="project-tool-line">
          {[['music','添加配乐'],['voice','添加配音 / 音效']].map(([lane,label]) => <D icon={Hi} key={lane} disabled={locked}
            onClick={async () => {
              const result=await run('timeline_audio_pick',{lane,time});
              if (result) setAudioId(result.id);
            }}>{label}</D>)}
        </div>
        {audio && <form className="audio-clip-form" onSubmit={async (event) => {
          event.preventDefault();
          if (await run('timeline_audio_save',{id:audio.id,start:number(audioDraft.start),first:number(audioDraft.first),
            last:number(audioDraft.last),volume:number(audioDraft.volume)})) setNames(null);
        }}>
          <label className="tool-field"><span>音频片段</span>
            <select value={audio.id} onChange={event=>{setAudioId(event.target.value);setNames(null);}}>
              {project.timeline_audio.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="project-tool-line">
            {[['start','时间线位置（秒）',project.timeline?.at(-1)?.end],['first','音频入点（秒）',audio.duration],
              ['last','音频出点（秒）',audio.duration],['volume','音量 %',100]].map(([key,label,max]) => <label className="tool-field" key={key}>
              <span>{label}</span><input type="number" required min="0" max={max} step={key==='volume'?1:0.001} value={audioDraft[key]}
                onChange={event=>setNames({...audioDraft,[key]:event.target.value})} />
            </label>)}
          </div>
          <div className="project-tool-line">
            <D kind="ghost" disabled={locked} onClick={()=>run('timeline_audio_save',{id:audio.id,remove:true})}>移除此片段</D>
            <D type="submit" kind="primary" disabled={locked}>保存音频位置和音量</D>
          </div>
        </form>}
      </>}
    </div>
  </WorkspaceModal>;
}

function timelineExtraLanes(audio,video,tracks) {
  const rows = [['music','配乐轨'],['voice','配音轨']]
    .map(([id,label])=>({id,label,kind:'audio',items:audio.filter(item=>item.lane===id)}))
    .filter(track=>track.items.length);
  const totals = {audio:0,video:0};
  for (const track of tracks) {
    const number=++totals[track.kind];
    const label=labelText(track.kind==='video' ? '视频轨 {0}' : '音频轨 {0}',number);
    const items=(track.kind==='video'? video : audio).filter(item=>item.lane===track.id);
    rows.push({...track,label,items,custom:true});
  }
  return rows;
}

function ExtraTimelineTracks({ rows, duration, labels, edit, editor }) {
  return <>
    {rows.map(track=>{
      const icon=track.kind==='video' ? $t : Xa;
      const add=()=>editor.addMedia(track);
      const canAdd=track.custom && editor.hasVideo && !editor.disabled;
      const label=labelText('添加素材到 {0}',track.label);
      return labels ? <div key={track.id} className="timeline-track-label timeline-audio-extra-label" data-user-track={track.custom?track.id:undefined}>
        {j.createElement(icon,{size:14})}<span title={track.label}>{track.label}</span>
        {track.custom && <St icon={Hi} disabled={!canAdd} label={label} onClick={add}/>}
      </div> : <div key={track.id} className={'timeline-audio-extra'+(track.kind==='video'?' timeline-video-extra':'')}
        aria-label={track.label} data-timeline-lane={track.id}>
        {track.items.map(item=><TimelineMediaClip key={item.id} item={item} duration={duration}
          editor={editor} peers={track.items} open={edit} kind={track.kind}/>)}
        {!track.items.length && <button className="timeline-add-media" type="button" disabled={!canAdd}
          onClick={add} aria-label={label}><Hi size={13}/>添加素材</button>}
      </div>;
    })}
    {editor.addTrack && (labels ?
      <div className="timeline-track-label timeline-add-track">
        <Hi size={14}/>
        <select aria-label="添加轨道" value="" disabled={editor.disabled}
          onChange={async event=>{
            const select=event.currentTarget;
            if (await editor.addTrack(select.value)) requestAnimationFrame(()=>select.scrollIntoView({block:'nearest'}));
          }}>
          <option value="">添加轨道</option>
          <option value="video">视频轨</option>
          <option value="audio">音频轨</option>
          <option value="caption">字幕轨</option>
        </select>
      </div> : <div className="timeline-add-track-lane" data-timeline-lane="new-track" aria-hidden="true"/>)}
  </>;
}
