// Uses the installed bundle's React and existing UI primitives; no second React runtime.
function WindowGlyph({kind}) {
  const paths = {minimize:'M1.5 6h9',maximize:'M1.5 1.5h9v9h-9z',restore:'M4 3.5v-2h6.5V8h-2m-7-4.5h7v7h-7z',
    close:'m2 2 8 8m0-8-8 8'};
  return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"
    stroke="currentColor" strokeWidth="1.15"><path d={paths[kind]} /></svg>;
}

function SettingsGear({ size = 16 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <polygon points="9.8,4.7 9.9,2.2 14.1,2.2 14.2,4.7 17.2,6.4 19.4,5.3 21.5,8.9 19.4,10.3
      19.4,13.7 21.5,15.1 19.4,18.7 17.2,17.6 14.2,19.3 14.1,21.8 9.9,21.8 9.8,19.3
      6.8,17.6 4.6,18.7 2.5,15.1 4.6,13.7 4.6,10.3 2.5,8.9 4.6,5.3 6.8,6.4" />
    <circle cx="12" cy="12" r="3.1" />
  </svg>;
}

function ToolboxIcon({ size = 16 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18m-12-1.5v3m6-3v3" />
  </svg>;
}

function ProjectToolsIcon({ size = 16 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M8.5 10.5h2.6v2.6H8.5zm4.4 0h2.6v2.6h-2.6zm-4.4 4.4h2.6v2.6H8.5zm4.4 0h2.6v2.6h-2.6z" fill="currentColor" stroke="none" />
  </svg>;
}

function StudioTitleBar({projects, children}) {
  const [windowState,setWindowState] = j.useState(null);
  const request = j.useCallback(operation => Uo('window_control',{operation}), []);

  j.useEffect(() => {
    let mounted = true, desktop = false, timer;
    const read = () => request('state').then(state => {
      desktop = Boolean(state);
      if (mounted && desktop) setWindowState(state);
    }).catch(() => {});
    const resize = () => {
      if (!desktop) return;
      clearTimeout(timer);
      timer = setTimeout(read,75);
    };
    read();
    window.addEventListener('resize',resize);
    return () => {
      mounted = false;
      clearTimeout(timer);
      window.removeEventListener('resize',resize);
    };
  }, [request]);

  const act = action => request(action).then(state => { if (state) setWindowState(state); }).catch(() => {});
  const toggleLabel = windowState?.maximized ? '还原窗口' : '最大化窗口';
  const dragClass = windowState ? windowState.native_drag ? ' native-drag' : ' pywebview-drag-region' : '';
  return <header className={'appbar' + (windowState ? ' desktop-appbar' : '')}>
    {projects}
    <div className={'appbar-title' + dragClass}
      onDoubleClick={windowState && !windowState.native_drag ? () => act('toggle_maximized') : undefined} />
    {children}
    {windowState && <div className="desktop-window-actions" role="group" aria-label="窗口控制">
      <button type="button" aria-label="最小化窗口" title="最小化窗口" onClick={() => act('minimize')}>
        <WindowGlyph kind="minimize" />
      </button>
      <button type="button" aria-label={toggleLabel} title={toggleLabel} onClick={() => act('toggle_maximized')}>
        <WindowGlyph kind={windowState.maximized ? 'restore' : 'maximize'} />
      </button>
      <button type="button" className="desktop-window-close" aria-label="关闭窗口" title="关闭窗口" onClick={() => act('close')}>
        <WindowGlyph kind="close" />
      </button>
    </div>}
  </header>;
}

function StudioStartup({error}) {
  return <div className="studio-startup">
    <StudioTitleBar />
    <div className="boot">
      {error ? <><p>{error}</p><D icon={qe} onClick={() => location.reload()}>重新加载</D></>
        : <span>正在读取工作区…</span>}
    </div>
  </div>;
}

function HeaderCommand({icon, label, shortcut, primary, ...props}) {
  return <span className="header-command">
    <St icon={icon} label={label} title={undefined}
      className={primary ? 'header-primary' : ''} {...props} />
    <span className="header-tooltip" aria-hidden="true">{label}{shortcut && ' · ' + shortcut}</span>
  </span>;
}

function projectTabIds(ids, active, maximum, recent) {
  if (!active || ids.includes(active)) return ids.slice(0, maximum);
  if (ids.length < maximum) return [...ids, active];
  const leastRecent = recent.findLast(item=>ids.includes(item.id))?.id;
  return [...ids.filter(id=>id!==leastRecent).slice(0,maximum-1), active];
}

function ProjectStrip({project, source, recent, disabled, onOpen, onNew}) {
  const maximum = 3;
  const available = new Map(recent.map(item=>[item.id,item]));
  if (project) available.set(project.id,project);
  const [tabs,setTabs] = j.useState(() => [...new Set([project?.id,...recent.map(item=>item.id)].filter(Boolean))].slice(0,maximum));
  const [menu,setMenu] = j.useState(false);
  const region = j.useRef(null);
  const menuButton = j.useRef(null);
  const addButton = j.useRef(null);
  const tabList = j.useRef(null);
  const active = project?.id;
  const draft = !project && source?.name ? {id:'draft',name:source.name} : null;
  const shown = projectTabIds(tabs.filter(id=>available.has(id)),active,maximum - (draft ? 1 : 0),recent);
  const visible = shown.map(id=>available.get(id));
  if (draft) visible.push(draft);
  const current = active || draft?.id;

  j.useEffect(()=>{
    if (active) setTabs(ids=>projectTabIds(ids,active,maximum,recent));
  },[active]);

  j.useEffect(()=>{
    if (!menu) return;
    function outside(event) {
      if (!region.current?.contains(event.target)) setMenu(false);
    }
    function escape(event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      setMenu(false);
      menuButton.current?.focus();
    }
    document.addEventListener('pointerdown',outside);
    window.addEventListener('keydown',escape);
    return ()=>{
      document.removeEventListener('pointerdown',outside);
      window.removeEventListener('keydown',escape);
    };
  },[menu]);

  function open(id) {
    setMenu(false);
    if (id !== current) return onOpen(id);
  }

  async function close(id) {
    setMenu(false);
    if (id === current) {
      const position = visible.findIndex(item=>item.id===id);
      const neighbor = visible[position+1] || visible[position-1];
      if (!await (neighbor ? onOpen(neighbor.id) : onNew())) return;
    }
    setTabs(ids=>ids.filter(tab=>tab!==id));
    requestAnimationFrame(()=>{
      const target = tabList.current?.querySelector('[aria-current="page"]') || addButton.current;
      target?.focus({preventScroll:true});
    });
  }

  return <div className="project-strip" ref={region}>
    {!!visible.length && <div className="project-tabs" ref={tabList} role="group" aria-label="项目标签">
      {visible.map(item=>{
        const selected = current === item.id;
        const name = Ab(item.name);
        const closeLabel = labelText('关闭项目标签 {0}',name);
        return <div key={item.id} className={'project-tab'+(selected?' current':'')} data-project-tab={item.id}>
          <button type="button" className="project-tab-select" title={name} aria-current={selected?'page':undefined}
            disabled={disabled} onClick={()=>open(item.id)}>
            {j.createElement($t,{size:13,'aria-hidden':true})}<span>{name}</span>
          </button>
          <button type="button" className="project-tab-close" title={closeLabel} aria-label={closeLabel}
            disabled={disabled} onClick={()=>close(item.id)}><Wa size={12} aria-hidden="true" /></button>
        </div>;
      })}
    </div>}
    <button type="button" className="icon-button project-strip-action" ref={addButton}
      aria-label="新建项目" title="新建项目" disabled={disabled} onClick={()=>{setMenu(false); onNew();}}>
      <Hi size={15} aria-hidden="true" />
    </button>
    <button type="button" className="icon-button project-strip-action project-history-trigger" ref={menuButton}
      aria-label="最近项目" title="最近项目" aria-expanded={menu} aria-controls={menu?'project-history':undefined}
      onClick={()=>setMenu(value=>!value)}>
      {j.createElement(fu,{size:14,'aria-hidden':true})}
    </button>
    {menu && <section className="project-history" id="project-history" aria-label="最近项目">
      <h2>最近项目</h2>
      {recent.length ? recent.map(item=><button type="button" key={item.id}
        className={active===item.id?'recent-row current':'recent-row'} title={Ab(item.name)}
        aria-current={active===item.id?'page':undefined} disabled={disabled} onClick={()=>open(item.id)}>
        <Gr src={item.thumb}/>
        <span className="recent-text">
          <strong>{Ab(item.name)}</strong>
          <small>{item.shots} 个镜头 · {kt(item.duration)}</small>
        </span>
      </button>) : <p className="empty-recent">暂无最近项目</p>}
    </section>}
  </div>;
}

function WorkspaceActionsMenu({project, command, openLogs}) {
  const [open,setOpen] = j.useState(false);
  const container = j.useRef(null);
  const trigger = j.useRef(null);
  j.useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!container.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown',outside);
    return () => document.removeEventListener('pointerdown',outside);
  }, [open]);
  function closeMenu() {
    setOpen(false);
    trigger.current?.focus({preventScroll:true});
  }
  function invoke(action) {
    closeMenu();
    action();
  }
  const result = project?.latest_export;
  return <div ref={container} className="workspace-actions header-command" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (open && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    }
  }}>
    <button ref={trigger} type="button" className="icon-button" aria-label="更多操作"
      aria-expanded={open} aria-controls={open ? 'workspace-actions-menu' : undefined}
      onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        {[3,8,13].map(x => <circle key={x} cx={x} cy="8" r="1.2" />)}
      </svg>
    </button>
    {open ? <div id="workspace-actions-menu" className="workspace-actions-menu" role="group" aria-label="更多操作">
      {project && <D kind="ghost" icon={qe} onClick={() => invoke(() => command('open_folder'))}>项目文件夹</D>}
      {result && <D kind="ghost" icon={Pr} title={result.name} onClick={() => invoke(() => command('tool_open_exports'))}>
        {result.video ? '打开成片位置' : '打开导出位置'}
      </D>}
      <D kind="ghost" icon={Kl} onClick={() => invoke(openLogs)}>任务日志</D>
    </div> : <span className="header-tooltip" aria-hidden="true">更多操作</span>}
  </div>;
}

function xN({state, options, disabled, command, showExport, openLogs, importingVideo, undo, openSettings,
    openAdvanced, advanced, directImport, onNew, onRecent, onBrowse}) {
  const {project, source, edit_undo: edit} = state;
  const projects = <ProjectStrip project={project} source={source} recent={state.recent}
    disabled={disabled} onOpen={onRecent} onNew={onNew} />;
  const stage = state.task?.phase === 'running' && state.task.stage;
  const progress = importingVideo ? '正在导入视频' : (state.active || state.importing) && labelText(stage || state.status);
  return <StudioTitleBar projects={projects}>
    <div className="header-actions">
      {progress && <button type="button" className="header-task-progress" aria-label="查看任务进度"
        title={progress} onClick={openLogs}>
        <Nr size={14} className="spin" aria-hidden="true"/><span role="status">{progress}</span>
      </button>}
      {state.active && <HeaderCommand icon={hu} label="停止" onClick={() => command('stop')} />}
      <HeaderCommand icon={SettingsGear} label="设置" onClick={openSettings} />
      <HeaderCommand icon={ToolboxIcon} label="更多工具" aria-pressed={advanced} onClick={() => openAdvanced('tools')} />
      <WorkspaceActionsMenu project={project} command={command} openLogs={openLogs} />
      {edit && <HeaderCommand icon={qi} label={labelText(edit.label)} shortcut="Ctrl+Z" disabled={disabled} onClick={undo} />}
      <HeaderCommand icon={qe} label="打开项目" disabled={disabled} onClick={onBrowse} />
      {project?.report && <HeaderCommand icon={fo} label="打开报告" onClick={() => command('open_report')} />}
      {project
        ? <HeaderCommand icon={Pr} label="导出成片" primary disabled={disabled || source?.missing || project.timeline_empty} onClick={showExport} />
        : directImport ? <HeaderCommand icon={qe} label="导入视频" primary disabled={disabled} onClick={directImport} />
        : <HeaderCommand icon={Ka} label="开始拆解" primary disabled={disabled || !source?.url || source.missing}
            onClick={() => command('analyze',{options})} />}
    </div>
  </StudioTitleBar>;
}

function WorkflowGuide({state, tab, onTab, command, onExport, openInput, disabled}) {
  const hasSource = !!state.source, hasProject = !!state.project;
  const step = !hasSource ? 0 : !hasProject ? 1 : 2;
  const steps = [
    {label:'导入视频', detail:hasSource?'更换视频或粘贴链接':'本地上传 / 链接拆解', action:()=>openInput()},
    {label:'自动拆解', detail:hasProject?'查看拆解设置':'分镜、字幕和中译', action:()=>onTab('analysis'), disabled:!hasSource},
    {label:'查看与修改', detail:'看译文、换镜头、调声音', action:()=>onTab(hasProject?'subtitles':'shot'), disabled:!hasProject},
    {label:'导出成片', detail:'选择格式与保存位置', action:onExport, disabled:!hasProject || state.source?.missing}
  ];
  return <nav className="workflow-guide" aria-label="视频处理流程">
    <span className="workflow-label">操作流程</span>
    {steps.map((s,i)=><button key={s.label} className={'workflow-step'+(step===i?' current':'')+(step>i?' complete':'')} aria-current={step===i?'step':undefined} disabled={disabled||s.disabled} onClick={s.action}>
      <span className="step-number">{step>i?j.createElement(na,{size:13,'aria-hidden':true}):i+1}</span>
      <span className="step-copy"><strong>{s.label}</strong><small>{s.detail}</small></span>
      {i<3&&j.createElement(fu,{className:'step-arrow',size:14,'aria-hidden':true})}
    </button>)}
  </nav>;
}

function SN({state,tab,onTab,onNew,openProjectTools,agentPicker,advanced,disabled}) {
  const sections=[['analysis','视频拆解',Ka],['shot','成片剪辑',$t],['subtitles','字幕与翻译',va],['audio','声音与混音',Xa],['prompts','生成提示词',po]];
  return <aside className="sidebar" aria-label="项目和工作区"><div className="sidebar-main">
    <D className="new-project wide" icon={Hi} onClick={onNew} disabled={disabled}>新建拆解</D>
    <nav className="side-nav" aria-label="功能导航">{sections.map(([id,label,Icon])=><button key={id} type="button" className={!advanced&&tab===id?'nav-item active':'nav-item'} aria-pressed={!advanced&&tab===id} onClick={()=>onTab(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
    {state.project && <button type="button" className="nav-item project-tools-entry" disabled={disabled} onClick={openProjectTools}><ProjectToolsIcon size={18}/><span>项目工具</span></button>}
  </div>
  <div className="side-bottom">{agentPicker}</div></aside>;
}

function zT({tab,onTab,hidden,...props}) {
  const [agentInstructions,setAgentInstructions] = j.useState(false);
  const entry = <AgentInstructionEntry open={() => setAgentInstructions(true)} />;
  if (!hidden && agentInstructions) return <AgentInstructionEditor key={props.state.manual_caption_scope}
    state={props.state} shot={props.shot} time={props.time} onSubmit={props.dispatchAgentTask}
    back={() => setAgentInstructions(false)} command={props.command} disabled={props.disabled}
    taskBusy={props.agentTaskBusy} openSettings={props.openSettings} tab={tab} />;
  if (!hidden && props.captionEditor.draft) return <ManualCaptionInspector editor={props.captionEditor} agentEntry={entry} />;
  if (!hidden && tab === 'shot') return <aside id="task-inspector" className="inspector task-panel property-inspector" aria-label="镜头属性面板">
    <PanelResizeHandle tab={tab} />
    <ClipInspector key={props.state.project?.id} {...props} />
    {entry}
  </aside>;
  const panels={analysis:[sP,'视频拆解','选择视频，自动生成分镜、字幕和中文译文。'],subtitles:[cP,'字幕与翻译','点击一句定位视频，打开大面板校对双语。'],audio:[AudioPanel,'声音与混音','试听、分离人声和配乐，设置成片声音。'],prompts:[PromptWorkspace,'生成提示词','编辑镜头草稿，生成替换素材或导出提示词。']};
  const [Panel,title,detail]=panels[tab]||panels.analysis;
  const sourceShot = props.shot?.source_id ? props.state.project?.shots.find(item=>item.id===props.shot.source_id) : props.shot;
  return <aside id="task-inspector" className={'inspector task-panel task-panel--'+tab} aria-label={labelText('{0}面板',title)} hidden={hidden}><PanelResizeHandle tab={tab} hidden={hidden}/><div className="task-panel-heading"><h2>{title}</h2><p>{detail}</p></div><div className={'task-panel-body'+(tab==='subtitles'?' subtitle-task-body':'')}><Panel {...props} shot={tab==='prompts'?sourceShot:props.shot} project={props.state.project}/></div>{entry}</aside>;
}

function useEditorSelection(scope) {
  const current = j.useRef({scope, request:null});
  const pending = j.useRef(Promise.resolve());
  if (current.current.scope !== scope) current.current = {scope, request:null};

  return (select) => {
    const context = current.current;
    const request = {};
    context.request = request;
    const isCurrent = () => current.current === context && context.request === request;
    const next = pending.current.then(() => isCurrent() && select(isCurrent));
    pending.current = next.catch(() => false);
    return next;
  };
}

function isEditingText(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest('textarea, [contenteditable]:not([contenteditable=false]), [role=textbox]')) return true;
  const input = target.closest('input');
  return !!input && !['range','checkbox','radio','button','submit','file','color','reset'].includes(input.type);
}

function useUndoShortcut(enabled, undo, keyTarget = window) {
  const action = j.useRef(undo);
  action.current = undo;
  j.useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event) {
      if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat || !event.ctrlKey ||
          event.shiftKey || event.altKey || event.key.toLowerCase() !== 'z') return;
      const target = event.composedPath().find(node => node instanceof Element);
      if (isEditingText(target)) return;
      event.preventDefault();
      action.current();
    }
    keyTarget.addEventListener('keydown', onKeyDown);
    return () => keyTarget.removeEventListener('keydown', onKeyDown);
  }, [enabled, keyTarget]);
}

function PromptWorkspace(props) {
  const shots = props.project?.shots || [];
  return <>
    {shots.length > 1 && <section className="inspector-block prompt-clip-picker">
      <label className="tool-field">
        <span>提示词镜头</span>
        <select value={props.shot?.id || ''} disabled={props.disabled}
          onChange={(event) => props.selectPromptShot(event.target.value)}>
          {shots.map((shot) => <option key={shot.id} value={shot.id}>
            镜头 {String(shot.id).padStart(2,'0')} · {kt(shot.start,true)}
          </option>)}
        </select>
      </label>
    </section>}
    {j.createElement(fP,props)}
  </>;
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
    const sidebarWidth=info.shell.querySelector('.sidebar')?.offsetWidth||0;
    const max=Math.max(280,Math.min(680,info.shell.clientWidth-sidebarWidth-360));
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
    layout.current={shell};
    const update=()=>apply(requested.current);update();
    const observer=new ResizeObserver(update);observer.observe(shell);observer.observe(sidebar);
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
function SourceImportPanel({state,mode,setMode,text,setText,onPick,onAnalyze,onBack,disabled,submitting,editing,onEditSource}) {
  const input=j.useRef(null), phase=state.link_import?.phase||'idle';
  const running=state.active&&['downloading','analyzing'].includes(phase);
  const failed=phase==='failed', cancelled=phase==='cancelled';
  const isLink=mode==='link'&&!editing, busy=!!(disabled||submitting);
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
  if(editing) return <div className="source-import" aria-label="导入剪辑素材">
    <div className="source-import-heading">
      <span className="source-import-symbol" aria-hidden="true"><$t size={24}/></span>
      <h3>导入视频剪辑</h3>
    </div>
    <div className="source-input-local">
      <p>将视频拖到这里，或选择电脑中的文件。</p>
      <D className="wide" kind="primary" icon={qe} disabled={busy} onClick={onPick}>选择本地视频</D>
      {state.source?.url&&!state.project&&<D className="wide" disabled={busy} onClick={onEditSource}>直接剪辑当前视频</D>}
      <small>支持 MP4、MOV、MKV、WebM 等常用格式</small>
    </div>
    {state.project&&<button className="source-input-back" type="button" disabled={busy} onClick={onBack}>返回当前视频</button>}
  </div>;
  return <div className="source-import" aria-label="新建视频拆解">
    <div className="source-import-heading"><span className="source-import-symbol" aria-hidden="true"><Ka size={24}/></span><h3>从一条参考视频开始</h3><p>上传本地视频，或粘贴链接自动下载并拆解。</p></div>
    <div className="source-mode-switch" role="tablist" aria-label="视频来源">
      {[['local','本地上传'],['link','链接拆解']].map(([id,label])=><button key={id} id={'source-mode-'+id} type="button" role="tab" data-mode={id} aria-selected={mode===id} aria-controls={'source-input-'+id} tabIndex={mode===id?0:-1} disabled={busy} onClick={()=>changeMode(id)} onKeyDown={keyMode}>{label}</button>)}
    </div>
    {isLink?<form id="source-input-link" role="tabpanel" aria-labelledby="source-mode-link" className="source-input-link" onSubmit={event=>{event.preventDefault();if(text.trim()&&!busy)onAnalyze();}}>
      <label htmlFor="source-share-link">抖音 / TikTok 视频链接</label><textarea ref={input} id="source-share-link" rows={4} maxLength={16384} value={text} disabled={busy} spellCheck={false} placeholder={'粘贴视频链接，或包含链接的完整分享文案\nhttps://v.douyin.com/…'} onChange={event=>setText(event.target.value)} aria-describedby="source-link-hint" aria-invalid={failed||undefined}/>
      <p id="source-link-hint" className="field-hint">自动识别平台，一次拆解一条视频。粘贴后点击下方按钮开始。</p>
      {running&&<div className="link-import-progress" role="status" aria-live="polite"><div className="link-import-steps"><span className={phase==='downloading'?'current':'complete'}><b>{phase==='analyzing'?'✓':'1'}</b>下载视频</span>{j.createElement(fu,{size:14,'aria-hidden':true})}<span className={phase==='analyzing'?'current':''}><b>2</b>自动拆解</span></div><p>{platforms?platforms+' · ':''}{message}</p></div>}
      {!running&&(failed||cancelled)&&<p className={'link-import-feedback'+(failed?' error':'')} role={failed?'alert':'status'}>{failed?state.link_import.error||message:'任务已停止，分享内容已保留，可以重新开始。'}</p>}
      <D className="wide source-import-submit" kind="primary" icon={Ka} disabled={busy||!text.trim()} onClick={()=>{if(!busy&&text.trim())onAnalyze();}}>{submitting?'正在提交…':running?phase==='downloading'?'正在下载视频…':'正在自动拆解…':failed?'重试下载并拆解':cancelled?'重新下载并拆解':'下载并开始拆解'}</D>
    </form>:<div id="source-input-local" role="tabpanel" aria-labelledby="source-mode-local" className="source-input-local"><p>将视频拖到这里，或选择电脑中的文件。</p><D className="wide" kind="primary" icon={qe} disabled={busy} onClick={onPick}>选择本地视频</D><small>支持 MP4、MOV、MKV、WebM 等常用格式</small><p className="source-local-hint">导入后，在右侧确认选项并开始拆解。</p></div>}
    {!isLink && !state.source && !state.task?.phase && state.error &&
      <p className="link-import-feedback error" role="alert">{labelText(state.error)}</p>}
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
      {options.vlm&&<div className="model-note"><span>{configured?'使用已配置的模型服务':'需要先配置模型服务'}</span><D kind="ghost" onClick={()=>openSettings('analysis')}>设置模型</D></div>}
      <label className="field-label">报告界面语言</label><Kr label="报告语言" values={[["zh","中文"],["en","English"]]} value={options.report_language} onChange={value=>setOption({report_language:value})} disabled={disabled}/>
    </div></details>
    <section className="inspector-block analysis-start"><h3>项目保存到</h3><button type="button" className="path-button" disabled={disabled} title={state.settings.output} onClick={()=>command('pick_output')}><qe size={16}/><span>{state.settings.output}</span><strong>更改</strong></button><D className="wide" kind="primary" icon={Ka} disabled={disabled||!state.source||state.source.missing} onClick={()=>command('analyze',{options})}>{state.project&&!state.project.editor_only?'重新拆解为新项目':'开始拆解'}</D><p className="field-hint">默认设置即可开始。完成后先查看译文，再按需修改和导出。</p>{state.project&&!state.project.editor_only&&<D className="wide" kind="ghost" icon={pu} disabled={disabled} onClick={()=>command('translate')}>为此项目补充 / 更新译文</D>}</section>
  </div>;
}

function cP({ state, track, setTrack, cues, time, seek, command, options, setOption, disabled, openAdvanced, notify }) {
  const Editor = qT;
  const [editing, setEditing] = j.useState(false);
  const active = cues.findIndex((cue) => time >= cue.start && time < cue.end);
  const scroller = j.useRef(null);
  const list = j.useRef(null);
  const tools = j.useRef(null);

  j.useEffect(() => {
    if (active < 0 || tools.current?.open) return;
    const viewport = scroller.current.getBoundingClientRect();
    const bounds = list.current.getBoundingClientRect();
    if (bounds.bottom > viewport.top && bounds.top < viewport.bottom) {
      list.current.children[active]?.scrollIntoView({block:'nearest'});
    }
  }, [active]);

  async function importTrack() {
    const result = await command('import_subtitle_track', {track, scope:state.manual_caption_scope});
    if (!result) return;
    if (result.start != null) seek(result.start);
    notify(result.message);
  }

  const trackDisabled = disabled || !track;
  const noSource = !state.source?.url || state.source.missing;
  return <div className="subtitle-workspace">
    <div className="subtitle-scroll" ref={scroller}>
      <div className="subtitle-toolbar">
        <label className="tool-field"><span>查看的字幕</span>
          <select aria-label="选择字幕轨" value={track || ''} onChange={(event) => setTrack(event.target.value)}
            disabled={!state.tracks.length}>
            {state.tracks.map((item) => <option key={item.id} value={item.id}>{labelText(item.label)}</option>)}
            {!state.tracks.length && <option value="">暂无字幕</option>}
          </select>
        </label>
        <D className="wide" kind="primary" icon={va} disabled={disabled || !state.subtitle_editable}
          onClick={() => setEditing(true)}>打开双语校对大面板</D>
        <p className="field-hint">机器识别和翻译建议人工校对。</p>
      </div>
      <div className="cue-list main-cue-list" ref={list} aria-label="字幕列表">
        {cues.map((cue, index) => <button key={index} type="button" className={index === active ? 'cue active' : 'cue'}
          aria-pressed={index === active} onClick={() => seek(cue.start)}><time>{kt(cue.start,true)}</time><span>{cue.text}</span></button>)}
        {!cues.length && <p className="empty-caption">{state.project ? '此字幕轨暂无内容，可补充译文或重新识别口播。' :
          '拆解视频后，字幕和译文会显示在这里。'}</p>}
      </div>
      <details className="subtitle-utilities" ref={tools}>
        <summary>补充译文与口播识别</summary>
        <div className="details-content">
          <D className="wide" icon={pu} disabled={disabled || !state.project} onClick={() => command('translate')}>补充 / 更新中文译文</D>
          <label className="field-label">重新识别口播</label>
          <Kr label="口播识别语言" value={options.speech_language} onChange={(value) => setOption({speech_language:value})}
            values={[['zh','中文 / 英文'],['ja','日语']]} disabled={disabled}/>
          <D className="wide" disabled={disabled || noSource}
            onClick={() => command('transcribe',{language:options.speech_language})}>识别口播并生成 SRT</D>
          <D className="wide" kind="ghost" onClick={() => openAdvanced('media')}>处理外部字幕文件…</D>
        </div>
      </details>
    </div>
    <div className="subtitle-bottom">
      <D icon={Hi} disabled={trackDisabled || !cues.length || noSource || !state.manual_caption_duration}
        title="将选中的字幕复制为可编辑的手动字幕" onClick={importTrack}>加入字幕轨</D>
      <D icon={Ro} disabled={trackDisabled} onClick={() => command('save_track',{track})}>导出 SRT 字幕</D>
      <D icon={$t} disabled={trackDisabled || noSource} title="在原片上压制当前字幕轨"
        onClick={() => command('burn',{track})}>导出带字幕原片</D>
    </div>
    {editing && state.project && <Editor key={state.undo_revision} state={state} track={track} command={command} disabled={disabled}
      notify={notify} seek={seek} close={() => setEditing(false)} />}
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
  return <Modal open={true} onClose={requestClose} title="双语字幕校对" description="点击左侧句子定位原片；修改后保存此句，报告和 SRT 会同步更新。" className="subtitle-editor-modal">
    <div className="subtitle-editor-layout"><aside className="editor-sentence-rail">
      <label className="tool-field"><span>字幕组</span>
        <select aria-label="字幕组" value={group?.id||''} disabled={busy||!groups?.length} onChange={e=>{setGroupId(e.target.value);setIndex(0);}}>
          {groups?.map(g=><option key={g.id} value={g.id}>{labelText('{0} · {1} 句',labelText(g.label),g.rows.length)}</option>)}
        </select>
      </label>
      <div className="editor-sentence-list" aria-label="待校对字幕">{group?.rows.map((r,i)=><button key={i} type="button" disabled={saving} className={index===i?'cue active':'cue'} aria-pressed={index===i} onClick={()=>{setIndex(i);seek(r.start);}}><time>{kt(r.start,true)}</time><span><strong>{r.original}</strong><small>{r.translation||'暂无中文译文'}</small></span></button>)}</div>
    </aside>
    <div className="editor-main">{value?<><div className="editor-current"><h3>第 {index+1} / {group.rows.length} 句</h3><D kind="ghost" icon={kd} onClick={()=>seek(Number(value.start))} disabled={!Number.isFinite(Number(value.start))}>定位原片</D></div><div className="tool-fields two-fields editor-time-fields"><label className="tool-field"><span>开始时间（秒）</span><input aria-label="开始时间（秒）" type="number" min="0" step="0.001" disabled={busy} value={value.start} onChange={e=>update('start',e.target.value)}/></label><label className="tool-field"><span>结束时间（秒）</span><input aria-label="结束时间（秒）" type="number" min="0" step="0.001" disabled={busy} value={value.end} onChange={e=>update('end',e.target.value)}/></label></div><div className="editor-bilingual-fields"><label className="tool-field"><span>字幕原文</span><textarea aria-label="字幕原文" rows="7" maxLength="4000" disabled={busy} value={value.original} onChange={e=>update('original',e.target.value)}/></label><label className="tool-field"><span>中文译文</span><textarea aria-label="中文译文" rows="7" maxLength="4000" disabled={busy} value={value.translation} onChange={e=>update('translation',e.target.value)}/></label></div><p className="field-hint">时间采用秒，支持小数。保存后会同步当前项目的报告与字幕文件。</p></>:<p className="empty-caption">{groups?'暂无可校对的双语字幕，请先补充中文译文。':'正在读取字幕…'}</p>}</div></div><div className="modal-actions editor-actions"><span className={dirty?'draft-status unsaved':'draft-status'} role="status">{dirty?`${dirty} 句修改尚未保存`:'所有修改已保存'}</span><D kind="ghost" disabled={saving} onClick={requestClose}>关闭校对</D><D kind="primary" icon={na} disabled={busy||!drafts[key]||!value?.original.trim()} onClick={save}>{saving?'正在保存…':'保存此句并同步'}</D></div></Modal>;
}

function AudioPanel({state,command,disabled,openMixer,openAdvanced}) {
  return <div className="audio-workspace"><section className="inspector-block"><D className="wide" kind="primary" icon={Xa} disabled={disabled||!state.source?.url} onClick={openMixer}>调整成片音量与混音</D><p className="field-hint">在混音面板选择使用哪些音轨，保存后用于成片导出。</p></section><section className="inspector-block"><h3>试听音轨</h3>{state.stems.map(stem=><div className="stem" key={stem.label}><label>{stem.label}</label>{stem.url?<audio controls preload="metadata" src={stem.url} aria-label={stem.label}/>:<p className="field-hint">尚未生成</p>}</div>)}<p className="field-hint">原声已经包含人声和背景声，改用分离音轨时应关闭原声，避免声音重叠。</p><D className="wide" icon={zi} disabled={disabled||!state.source?.url} onClick={()=>command('separate')}>重新分离人声与配乐</D></section><section className="inspector-block"><D className="wide" kind="ghost" icon={po} onClick={()=>openAdvanced('media')}>单独处理其他音频文件…</D></section></div>;
}

function AudioMixHelp({levels}) {
  const overlap=levels.original?.enabled&&(levels.vocals?.enabled||levels.music?.enabled);
  return <p className={overlap?'mix-help overlap':'mix-help'}>{overlap?'当前原声和分离音轨同时启用，可能出现重叠声音。请确认是否需要保留原声。':'原声包含人声和背景声。若使用分离后的人声、配乐，关闭原声可避免叠音。'}</p>;
}
