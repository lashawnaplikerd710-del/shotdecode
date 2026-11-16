// Uses the installed bundle's React and existing UI primitives; no second React runtime.
function WorkflowGuide({state, tab, onTab, command, onExport, openInput, disabled}) {
  const hasSource = !!state.source, hasProject = !!state.project;
  const step = !hasSource ? 0 : !hasProject ? 1 : 2;
  const steps = [
    {label:'导入视频', detail:hasSource?'更换视频或粘贴链接':'本地上传 / 链接拆解', action:()=>openInput()},
    {label:'自动拆解', detail:hasProject?'查看拆解设置':'分镜、字幕和中译', action:()=>onTab('analysis'), disabled:!hasSource},
    {label:'查看与修改', detail:'看译文、换镜头、调声音', action:()=>onTab(hasProject?'subtitles':'shot'), disabled:!hasProject},
    {label:'导出成片', detail:'保存为一个 MP4', action:onExport, disabled:!hasProject || state.source?.missing}
  ];
  return <nav className="workflow-guide" aria-label="视频处理流程">
    <span className="workflow-label">操作流程</span>
    {steps.map((s,i)=><button key={s.label} className={'workflow-step'+(step===i?' current':'')+(step>i?' complete':'')} aria-current={step===i?'step':undefined} disabled={disabled||s.disabled} onClick={s.action}>
      <span className="step-number">{step>i?'✓':i+1}</span><span><strong>{s.label}</strong><small>{s.detail}</small></span>{i<3&&<span className="step-arrow" aria-hidden="true">›</span>}
    </button>)}
  </nav>;
}

function SN({state,tab,onTab,command,onNew,onRecent,openSettings,openAdvanced,advanced,disabled}) {
  const ToolsIcon=po;
  const sections=[['analysis','视频拆解',Ka],['shot','镜头替换',$t],['subtitles','字幕与翻译',va],['audio','声音与混音',Xa],['prompts','生成提示词',po]];
  return <aside className="sidebar" aria-label="项目和工作区"><div className="sidebar-main">
    <D className="new-project wide" icon={Hi} onClick={onNew} disabled={disabled}>新建拆解</D>
    <nav className="side-nav" aria-label="功能导航">{sections.map(([id,label,Icon])=><button key={id} type="button" className={!advanced&&tab===id?'nav-item active':'nav-item'} aria-pressed={!advanced&&tab===id} onClick={()=>onTab(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
    <div className="recent"><div className="sidebar-section-title"><h2>最近项目</h2><St icon={qe} label="浏览项目文件" disabled={disabled} onClick={()=>command('pick_project')}/></div>
      {state.recent.length?state.recent.map(p=><button key={p.id} type="button" className={state.project?.id===p.id?'recent-row current':'recent-row'} title={p.name} disabled={disabled} onClick={()=>onRecent(p.id)}><Gr src={p.thumb}/><span className="recent-text"><strong>{Ab(p.name)}</strong><small>{p.shots} 个镜头 · {kt(p.duration)}</small></span></button>):<p className="empty-recent">拆解完成的项目会保存在这里。</p>}
    </div></div><div className="side-bottom"><button className="nav-item" onClick={openSettings}><Fi size={18}/><span>设置</span></button><button className={advanced?'nav-item active':'nav-item'} aria-pressed={advanced} onClick={()=>openAdvanced('tools')}><ToolsIcon size={18}/><span>更多工具</span></button></div></aside>;
}

function zT({tab,onTab,hidden,...props}) {
  const panels={analysis:[sP,'视频拆解','选择视频，自动生成分镜、字幕和中文译文。'],shot:[dP,'镜头替换','点击下方分镜，再选择新素材替换。'],subtitles:[cP,'字幕与翻译','点击一句定位视频，打开大面板校对双语。'],audio:[AudioPanel,'声音与混音','试听、分离人声和配乐，设置成片声音。'],prompts:[fP,'生成提示词','按镜头编辑草稿，复制或导出给生成工具。']};
  const [Panel,title,detail]=panels[tab]||panels.analysis;
  return <aside id="task-inspector" className={'inspector task-panel task-panel--'+tab} aria-label={title+'面板'} hidden={hidden}><PanelResizeHandle tab={tab} hidden={hidden}/><div className="task-panel-heading"><h2>{title}</h2><p>{detail}</p></div><div className={'task-panel-body'+(tab==='subtitles'?' subtitle-task-body':'')}><Panel {...props} project={props.state.project}/></div></aside>;
}

// Intent: keep the video and tools in balance without adding a settings screen.
// Hierarchy: a quiet divider becomes visible on hover/focus; the video remains primary.
// Palette/depth/surfaces: existing charcoal surfaces, border and green accent tokens.
// Typography/spacing: inherited tool type; 4px rhythm, 10px divider hit area.
function PanelResizeHandle({tab,hidden}) {
  const node=j.useRef(null), layout=j.useRef(null), drag=j.useRef(null), requested=j.useRef(undefined);
  const [size,setSize]=j.useState({width:364,min:280,max:680}),[dragging,setDragging]=j.useState(false);
  const storageKey='rea.studio.inspector-width';
  function apply(value) {
    const info=layout.current;if(!info)return;
    const max=Math.max(280,Math.min(680,info.shell.clientWidth-info.sidebar.offsetWidth-360));
    const defaultWidth=parseFloat(getComputedStyle(info.shell).getPropertyValue('--inspector-default'))||364;
    const width=Math.round(Math.max(280,Math.min(max,value??defaultWidth)));
    info.shell.style.setProperty('--inspector-width',width+'px');
    info.width=width;info.max=max;
    setSize(old=>old.width===width&&old.max===max?old:{width,min:280,max});
    return width;
  }
  j.useLayoutEffect(()=>{
    const shell=node.current?.closest('.shell'),sidebar=shell?.querySelector('.sidebar');
    if(!shell||!sidebar||hidden)return;
    if(requested.current===undefined){try{const saved=Number(localStorage.getItem(storageKey));requested.current=Number.isFinite(saved)&&saved>=280?saved:null;}catch{requested.current=null;}}
    layout.current={shell,sidebar};
    const update=()=>apply(requested.current);update();
    const observer=new ResizeObserver(update);observer.observe(shell);
    return()=>{observer.disconnect();shell.classList.remove('resizing-panel');drag.current=null;};
  },[tab,hidden]);
  function persist(){try{requested.current===null?localStorage.removeItem(storageKey):localStorage.setItem(storageKey,String(requested.current));}catch{}}
  function reset(){requested.current=null;apply(null);persist();}
  function begin(event){
    if(event.button!==0||!layout.current)return;
    event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);
    drag.current={pointer:event.pointerId,x:event.clientX,width:layout.current.width};
    layout.current.shell.classList.add('resizing-panel');setDragging(true);
  }
  function move(event){if(drag.current?.pointer!==event.pointerId)return;requested.current=apply(drag.current.width+drag.current.x-event.clientX);}
  function end(event){
    if(drag.current?.pointer!==event.pointerId)return;
    drag.current=null;layout.current?.shell.classList.remove('resizing-panel');setDragging(false);persist();
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboard(event){
    let next;if(event.key==='ArrowLeft')next=size.width+24;else if(event.key==='ArrowRight')next=size.width-24;else if(event.key==='Home')next=size.min;else if(event.key==='End')next=size.max;else if(event.key==='Enter'){event.preventDefault();reset();return;}else return;
    event.preventDefault();requested.current=apply(next);persist();
  }
  return <div ref={node} role="separator" tabIndex={0} aria-label="调整右侧面板宽度" aria-orientation="vertical" aria-controls="task-inspector" aria-valuemin={size.min} aria-valuemax={size.max} aria-valuenow={size.width} aria-valuetext={size.width+' 像素'} title="左右拖动调整宽度；双击恢复默认" className={'panel-resize-handle'+(dragging?' dragging':'')} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onDoubleClick={reset} onKeyDown={keyboard}><span aria-hidden="true">↔</span></div>;
}

// All zoom controls share actual track width; a wheel zoom keeps the cursor time fixed.
function useTimelineZoom(content,config) {
  const latest=Sa.useRef(config),anchor=Sa.useRef(null),lastZoom=Sa.useRef(0);
  latest.current=config;
  const minimum=Math.min(1,config.viewport/config.readable);
  function change(value,clientX){
    const current=latest.current,node=content.current;if(!node)return;
    const width=node.firstElementChild?.getBoundingClientRect().width||current.viewport;
    const x=clientX===undefined?node.clientWidth/2:Math.max(0,Math.min(node.clientWidth,clientX-node.getBoundingClientRect().left));
    const next=Math.max(current.viewport/current.readable,Math.min(4,value));
    anchor.current={fraction:(node.scrollLeft+x)/width,x};lastZoom.current=performance.now();
    current.setFit(false);current.setZoom(next);
  }
  Sa.useLayoutEffect(()=>{
    const node=content.current;if(!node)return;
    if(!config.fit&&config.zoom<minimum){config.setZoom(minimum);return;}
    if(anchor.current){node.scrollLeft=anchor.current.fraction*node.firstElementChild.getBoundingClientRect().width-anchor.current.x;anchor.current=null;}
  },[config.zoom,config.fit,config.readable,config.viewport]);
  Sa.useEffect(()=>{
    const region=content.current?.closest('.timeline-lanes');if(!region)return;
    function wheel(event){
      if(!event.ctrlKey)return;
      event.preventDefault();event.stopPropagation();
      const node=content.current,current=latest.current;if(!node||!current.duration||!event.deltaY)return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?node.clientWidth:1);
      const scale=current.fit?current.viewport/current.readable:current.zoom;
      const next=scale*Math.exp(-Math.max(-600,Math.min(600,delta))*0.002);
      change(next,event.clientX);
      // Keep fast successive wheel events on the most recent requested scale.
      latest.current={...current,fit:false,zoom:Math.max(current.viewport/current.readable,Math.min(4,next))};
    }
    region.addEventListener('wheel',wheel,{passive:false});
    return()=>region.removeEventListener('wheel',wheel);
  },[]);
  return {minimum,value:config.fit?minimum:config.zoom,change,ignoreFollow:()=>performance.now()-lastZoom.current<200};
}

// Intent: commerce creators can begin with a saved file or a platform share link.
// Hierarchy: one mode selector, one input, and one primary action; no extra dialog.
// Palette/depth/surfaces: use existing charcoal fields, subtle borders and green action tokens.
// Typography/spacing: inherited Chinese tool type, 4px rhythm and 40px controls.
function SourceImportPanel({state,mode,setMode,text,setText,onPick,onAnalyze,onBack,disabled,submitting}) {
  const input=j.useRef(null), phase=state.link_import?.phase||'idle';
  const running=state.active&&['downloading','analyzing'].includes(phase);
  const failed=phase==='failed', cancelled=phase==='cancelled';
  const isLink=mode==='link', busy=!!(disabled||submitting);
  const platforms=state.link_import?.platform;
  const message=state.link_import?.message||({downloading:'正在下载视频，完成后会自动开始拆解。',analyzing:'视频已下载，正在自动拆解。',completed:'视频拆解已完成。',cancelled:'任务已停止，分享内容已保留。'}[phase]);
  j.useEffect(()=>{if(isLink&&!busy)input.current?.focus();},[isLink]);
  function changeMode(value){if(!busy)setMode(value);}
  function keyMode(event){
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||busy)return;
    event.preventDefault();
    const value=event.key==='Home'?'local':event.key==='End'?'link':isLink?'local':'link';
    setMode(value);
    event.currentTarget.parentElement.querySelector('[data-mode="'+value+'"]')?.focus();
  }
  return <div className="source-import" aria-label="新建视频拆解">
    <div className="source-import-heading"><span className="source-import-symbol" aria-hidden="true"><Ka size={24}/></span><h3>从一条参考视频开始</h3><p>上传本地视频，或粘贴链接自动下载并拆解。</p></div>
    <div className="source-mode-switch" role="tablist" aria-label="视频来源">
      {[['local','本地上传'],['link','链接拆解']].map(([id,label])=><button key={id} id={'source-mode-'+id} type="button" role="tab" data-mode={id} aria-selected={mode===id} aria-controls={'source-input-'+id} tabIndex={mode===id?0:-1} disabled={busy} onClick={()=>changeMode(id)} onKeyDown={keyMode}>{label}</button>)}
    </div>
    {isLink?<form id="source-input-link" role="tabpanel" aria-labelledby="source-mode-link" className="source-input-link" onSubmit={event=>{event.preventDefault();if(text.trim()&&!busy)onAnalyze();}}>
      <label htmlFor="source-share-link">抖音 / TikTok 视频链接</label><textarea ref={input} id="source-share-link" rows={4} maxLength={16384} value={text} disabled={busy} spellCheck={false} placeholder={'粘贴视频链接，或包含链接的完整分享文案\nhttps://v.douyin.com/…'} onChange={event=>setText(event.target.value)} aria-describedby="source-link-hint" aria-invalid={failed||undefined}/>
      <p id="source-link-hint" className="field-hint">自动识别平台，一次拆解一条视频。粘贴后点击下方按钮开始。</p>
      {running&&<div className="link-import-progress" role="status" aria-live="polite"><div className="link-import-steps"><span className={phase==='downloading'?'current':'complete'}><b>{phase==='analyzing'?'✓':'1'}</b>下载视频</span><i aria-hidden="true">›</i><span className={phase==='analyzing'?'current':''}><b>2</b>自动拆解</span></div><p>{platforms?platforms+' · ':''}{message}</p></div>}
      {!running&&(failed||cancelled)&&<p className={'link-import-feedback'+(failed?' error':'')} role={failed?'alert':'status'}>{failed?state.link_import.error||message:'任务已停止，分享内容已保留，可以重新开始。'}</p>}
      <D className="wide source-import-submit" kind="primary" icon={Ka} disabled={busy||!text.trim()} onClick={()=>{if(!busy&&text.trim())onAnalyze();}}>{submitting?'正在提交…':running?phase==='downloading'?'正在下载视频…':'正在自动拆解…':failed?'重试下载并拆解':cancelled?'重新下载并拆解':'下载并开始拆解'}</D>
    </form>:<div id="source-input-local" role="tabpanel" aria-labelledby="source-mode-local" className="source-input-local"><p>将视频拖到这里，或选择电脑中的文件。</p><D className="wide" kind="primary" icon={qe} disabled={busy} onClick={onPick}>选择本地视频</D><small>支持 MP4、MOV、MKV、WebM 等常用格式</small><p className="source-local-hint">导入后，在右侧确认选项并开始拆解。</p></div>}
    {state.source&&!running&&<button className="source-input-back" type="button" disabled={busy} onClick={onBack}>返回当前视频</button>}
  </div>;
}

function sP({state,options,setOption,command,openSettings,openInput,disabled}) {
  const Toggle=bo, TranslationIcon=pu;
  const configured=state.settings.env || state.settings.base&&state.settings.model&&state.settings.has_key;
  return <div className="analysis-content"><section className="inspector-block"><h3>参考视频</h3><p className="source-name" title={state.source?.name}>{state.source?.name||'选择本地视频，或粘贴抖音 / TikTok 链接。'}</p><div className="source-input-actions"><D icon={qe} disabled={disabled} onClick={()=>openInput('local')}>{state.source?'更换视频':'本地上传'}</D><D disabled={disabled} onClick={()=>openInput('link')}>链接拆解</D></div></section>
    <section className="inspector-block"><h3>画面文字是什么语言？</h3><Kr label="画面字幕识别语言" values={[["zh","中文 / 英文"],["ja","日语 / 日本語"]]} value={options.ocr_language} onChange={value=>setOption({ocr_language:value})} disabled={disabled}/><p className="field-hint">口播语言自动识别；此项用于识别画面上的文字。</p><div className="translation-box"><TranslationIcon size={18}/><div className="toggle-copy"><strong>自动附上中文译文</strong><small>英文画面文字、英文和日语口播会写进报告。</small></div></div></section>
    <details className="analysis-details"><summary>自定义分析选项</summary><div className="details-content">
      <Toggle checked={options.ocr} onChange={value=>setOption({ocr:value})} disabled={disabled} hint="提取视频里已有的字幕和标题">识别画面文字</Toggle>
      <Toggle checked={options.packaging} onChange={value=>setOption({packaging:value})} disabled={disabled} hint="记录字幕、标题、花字等出现的时间">识别字幕和画面包装</Toggle>
      <Toggle checked={options.stems} onChange={value=>setOption({stems:value})} disabled={disabled} hint="生成可单独试听的人声和背景声">分离人声与配乐</Toggle>
      <Toggle checked={options.vlm} onChange={value=>setOption({vlm:value})} disabled={disabled} hint="需配置模型服务，会向该服务发送视频素材">AI 深度分析</Toggle>
      {options.vlm&&<div className="model-note"><span>{configured?'使用已配置的模型服务':'需要先配置模型服务'}</span><D kind="ghost" onClick={openSettings}>设置模型</D></div>}
      <label className="field-label">报告界面语言</label><Kr label="报告语言" values={[["zh","中文"],["en","English"]]} value={options.report_language} onChange={value=>setOption({report_language:value})} disabled={disabled}/>
    </div></details>
    <section className="inspector-block analysis-start"><h3>项目保存到</h3><button type="button" className="path-button" disabled={disabled} title={state.settings.output} onClick={()=>command('pick_output')}><qe size={16}/><span>{state.settings.output}</span><strong>更改</strong></button><D className="wide" kind="primary" icon={Ka} disabled={disabled||!state.source||state.source.missing} onClick={()=>command('analyze',{options})}>{state.project?'重新拆解为新项目':'开始拆解'}</D><p className="field-hint">默认设置即可开始。完成后先查看译文，再按需修改和导出。</p>{state.project&&<D className="wide" kind="ghost" icon={pu} disabled={disabled} onClick={()=>command('translate')}>为此项目补充 / 更新译文</D>}</section>
  </div>;
}

function cP({state,track,setTrack,cues,time,seek,command,options,setOption,disabled,openAdvanced,notify}) {
  const Editor=qT;
  const [editing,setEditing]=j.useState(false);
  const active=cues.findIndex(c=>time>=c.start&&time<c.end), refs=j.useRef([]);
  j.useEffect(()=>{if(active>=0)refs.current[active]?.scrollIntoView({block:'nearest'});},[active]);
  return <div className="subtitle-workspace"><div className="subtitle-toolbar"><label className="tool-field"><span>查看的字幕</span><select aria-label="选择字幕轨" value={track||''} onChange={e=>setTrack(e.target.value)} disabled={!state.tracks.length}>{state.tracks.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}{!state.tracks.length&&<option value="">暂无字幕</option>}</select></label><D className="wide" kind="primary" icon={va} disabled={disabled||!state.subtitle_editable} onClick={()=>setEditing(true)}>打开双语校对大面板</D><p className="field-hint">机器识别和翻译建议人工校对。</p></div>
    <div className="cue-list main-cue-list" aria-label="字幕列表">{cues.map((c,index)=><button key={index} type="button" className={index===active?'cue active':'cue'} aria-pressed={index===active} ref={el=>refs.current[index]=el} onClick={()=>seek(c.start)}><time>{kt(c.start,true)}</time><span>{c.text}</span></button>)}{!cues.length&&<p className="empty-caption">{state.project?'此字幕轨暂无内容，可补充译文或重新识别口播。':'拆解视频后，字幕和译文会显示在这里。'}</p>}</div>
    <div className="subtitle-bottom"><div className="button-row"><D icon={Ro} disabled={disabled||!track} onClick={()=>command('save_track',{track})}>导出 SRT 字幕</D><D icon={$t} disabled={disabled||!track||state.source?.missing} onClick={()=>command('burn',{track})}>导出带字幕视频</D></div><details><summary>补充译文与口播识别</summary><div className="details-content"><D className="wide" icon={pu} disabled={disabled||!state.project} onClick={()=>command('translate')}>补充 / 更新中文译文</D><label className="field-label">重新识别口播</label><Kr label="口播识别语言" value={options.speech_language} onChange={value=>setOption({speech_language:value})} values={[["zh","中文 / 英文"],["ja","日语"]]} disabled={disabled}/><D className="wide" disabled={disabled||!state.source?.url} onClick={()=>command('transcribe',{language:options.speech_language})}>识别口播并生成 SRT</D><D className="wide" kind="ghost" onClick={()=>openAdvanced('media')}>处理外部字幕文件…</D></div></details></div>
    {editing&&state.project&&<Editor state={state} track={track} command={command} disabled={disabled} notify={notify} seek={seek} close={()=>setEditing(false)}/>}
  </div>;
}

function qT({state,track,command,disabled,notify,seek,close}) {
  const Modal=hl;
  const [groups,setGroups]=j.useState(null), [groupId,setGroupId]=j.useState(uP[track]), [index,setIndex]=j.useState(0), [drafts,setDrafts]=j.useState({}), [saving,setSaving]=j.useState(false);
  const project=state.project?.id;
  j.useEffect(()=>{let cancelled=false; Uo('read_subtitle_edits').then(result=>{if(!cancelled)setGroups(result);}).catch(error=>{if(!cancelled){setGroups([]);notify(error.message,true);}});return()=>{cancelled=true;};},[project]);
  const group=groups?.find(g=>g.id===groupId)||groups?.[0], row=group?.rows[index], key=row?group.id+':'+JSON.stringify(row):'', value=drafts[key]||row;
  const busy=disabled||saving, dirty=Object.keys(drafts).length;
  function update(field,next){setDrafts(old=>({...old,[key]:{...value,[field]:next}}));}
  function requestClose(){if(!saving&&(!dirty||window.confirm('还有未保存的字幕修改，关闭会放弃这些修改。确定关闭吗？')))close();}
  async function save(){setSaving(true);try{const result=await command('save_subtitle_edit',{project,group:group.id,revision:group.revision,index,...value});if(result){setGroups(result.groups);setIndex(result.index);setDrafts(old=>{const next={...old};delete next[key];return next;});notify('字幕、报告和 SRT 已同步保存');}}finally{setSaving(false);}}
  return <Modal open={true} onClose={requestClose} title="双语字幕校对" description="点击左侧句子定位原片；修改后保存此句，报告和 SRT 会同步更新。" className="subtitle-editor-modal"><div className="subtitle-editor-layout"><aside className="editor-sentence-rail"><label className="tool-field"><span>字幕组</span><select aria-label="字幕组" value={group?.id||''} disabled={busy||!groups?.length} onChange={e=>{setGroupId(e.target.value);setIndex(0);}}>{groups?.map(g=><option key={g.id} value={g.id}>{g.label} · {g.rows.length} 句</option>)}</select></label><div className="editor-sentence-list" aria-label="待校对字幕">{group?.rows.map((r,i)=><button key={i} type="button" disabled={saving} className={index===i?'cue active':'cue'} aria-pressed={index===i} onClick={()=>{setIndex(i);seek(r.start);}}><time>{kt(r.start,true)}</time><span><strong>{r.original}</strong><small>{r.translation||'暂无中文译文'}</small></span></button>)}</div></aside>
    <div className="editor-main">{value?<><div className="editor-current"><h3>第 {index+1} / {group.rows.length} 句</h3><D kind="ghost" icon={kd} onClick={()=>seek(Number(value.start))} disabled={!Number.isFinite(Number(value.start))}>定位原片</D></div><div className="tool-fields two-fields editor-time-fields"><label className="tool-field"><span>开始时间（秒）</span><input aria-label="开始时间（秒）" type="number" min="0" step="0.001" disabled={busy} value={value.start} onChange={e=>update('start',e.target.value)}/></label><label className="tool-field"><span>结束时间（秒）</span><input aria-label="结束时间（秒）" type="number" min="0" step="0.001" disabled={busy} value={value.end} onChange={e=>update('end',e.target.value)}/></label></div><div className="editor-bilingual-fields"><label className="tool-field"><span>字幕原文</span><textarea aria-label="字幕原文" rows="7" maxLength="4000" disabled={busy} value={value.original} onChange={e=>update('original',e.target.value)}/></label><label className="tool-field"><span>中文译文</span><textarea aria-label="中文译文" rows="7" maxLength="4000" disabled={busy} value={value.translation} onChange={e=>update('translation',e.target.value)}/></label></div><p className="field-hint">时间采用秒，支持小数。保存后会同步当前项目的报告与字幕文件。</p></>:<p className="empty-caption">{groups?'暂无可校对的双语字幕，请先补充中文译文。':'正在读取字幕…'}</p>}</div></div><div className="modal-actions editor-actions"><span className={dirty?'draft-status unsaved':'draft-status'} role="status">{dirty?`${dirty} 句修改尚未保存`:'所有修改已保存'}</span><D kind="ghost" disabled={saving} onClick={requestClose}>关闭校对</D><D kind="primary" icon={na} disabled={busy||!drafts[key]||!value?.original.trim()} onClick={save}>{saving?'正在保存…':'保存此句并同步'}</D></div></Modal>;
}

function AudioPanel({state,command,disabled,openMixer,openAdvanced}) {
  return <div className="audio-workspace"><section className="inspector-block"><D className="wide" kind="primary" icon={Xa} disabled={disabled||!state.source?.url} onClick={openMixer}>调整成片音量与混音</D><p className="field-hint">在混音面板选择使用哪些音轨，保存后用于成片导出。</p></section><section className="inspector-block"><h3>试听音轨</h3>{state.stems.map(stem=><div className="stem" key={stem.label}><label>{stem.label}</label>{stem.url?<audio controls preload="metadata" src={stem.url} aria-label={stem.label}/>:<p className="field-hint">尚未生成</p>}</div>)}<p className="field-hint">原声已经包含人声和背景声，改用分离音轨时应关闭原声，避免声音重叠。</p><D className="wide" icon={zi} disabled={disabled||!state.source?.url} onClick={()=>command('separate')}>重新分离人声与配乐</D></section><section className="inspector-block"><D className="wide" kind="ghost" icon={po} onClick={()=>openAdvanced('media')}>单独处理其他音频文件…</D></section></div>;
}

function AudioMixHelp({levels}) {
  const overlap=levels.original?.enabled&&(levels.vocals?.enabled||levels.music?.enabled);
  return <p className={overlap?'mix-help overlap':'mix-help'}>{overlap?'当前原声和分离音轨同时启用，可能出现重叠声音。请确认是否需要保留原声。':'原声包含人声和背景声。若使用分离后的人声、配乐，关闭原声可避免叠音。'}</p>;
}
