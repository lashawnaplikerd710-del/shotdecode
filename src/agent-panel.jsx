function commonAgentIds() {
  return ['codex', 'claude', 'deepseek'];
}

function useAgentConnection(refreshKey, settingsOpen, scope) {
  const [registry, setRegistry] = j.useState([]);
  const [chat, setChat] = j.useState(null);
  const [pending, setPending] = j.useState(false);
  const [error, setError] = j.useState('');
  const previousRefresh = j.useRef(refreshKey);
  const previousScope = j.useRef(scope);
  const live = j.useRef(false);
  const requesting = j.useRef(false);
  const revision = j.useRef(0);
  const registryScan = j.useRef(0);
  const connected = chat?.phase === 'ready';
  const generating = ['running', 'stopping'].includes(chat?.phase) ||
    chat?.messages.at(-1)?.task?.phase === 'connecting';
  const locked = pending || generating || ['connecting', 'configuring'].includes(chat?.phase);
  const provider = registry.find(({id}) => id === chat?.provider);
  const usable = registry.filter((item) => item.enabled && item.available);

  async function request(action, data) {
    if (requesting.current) return;
    requesting.current = true;
    revision.current++;
    setPending(true);
    setError('');
    try {
      const result = await Uo(action, data);
      if (live.current) setChat(result);
      return result;
    } catch (failure) {
      if (live.current) setError(failure.message);
    } finally {
      requesting.current = false;
      if (live.current) setPending(false);
    }
  }

  async function scanRegistry() {
    const scan = ++registryScan.current;
    const entries = await Uo('agent_registry');
    if (live.current && scan === registryScan.current) setRegistry(entries);
    return entries;
  }

  async function refresh() {
    if (requesting.current) return;
    requesting.current = true;
    revision.current++;
    setPending(true);
    setError('');
    try {
      const [available, current] = await Promise.all([scanRegistry(), Uo('agent_state')]);
      if (!live.current) return;
      setChat(current);
      if (!settingsOpen && (!current || current.phase === 'archived')) {
        const next = available.find((item) => item.available && item.enabled &&
          (!current || item.id === current.provider));
        if (next) {
          const opened = await Uo('agent_connect', {provider: next.id, scope: scope ?? null, automatic: true});
          if (opened && live.current) setChat(opened);
        }
      }
    } catch (failure) {
      if (live.current) setError(failure.message);
    } finally {
      requesting.current = false;
      if (live.current) setPending(false);
    }
  }

  function activate() {
    if (chat && chat.phase !== 'archived') {
      // Keep the last known choices if a background scan fails.
      scanRegistry().catch(() => {});
    } else {
      refresh();
    }
  }

  j.useEffect(() => {
    live.current = true;
    refresh();
    return () => { live.current = false; };
  }, []);

  const phase = chat?.phase;
  j.useEffect(() => {
    if (!phase) return;
    let polling = false;
    let stopped = false;
    const timer = window.setInterval(async () => {
      if (polling || requesting.current) return;
      polling = true;
      const started = revision.current;
      try {
        const current = await Uo('agent_state');
        if (!stopped && started === revision.current) {
          setChat(current);
          // When an old task finishes, the server can switch to the new project's saved session.
          if (!settingsOpen && (!current || (current.phase === 'archived' && phase !== 'archived'))) refresh();
        }
      } catch (failure) {
        if (!stopped && started === revision.current) setError(failure.message);
      } finally {
        polling = false;
      }
    }, 500);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [phase, scope, settingsOpen]);

  j.useEffect(() => {
    if (settingsOpen || refreshKey === previousRefresh.current || pending || requesting.current) return;
    previousRefresh.current = refreshKey;
    refresh();
  }, [settingsOpen, refreshKey, pending]);

  j.useEffect(() => {
    if (scope===previousScope.current || pending || requesting.current) return;
    previousScope.current = scope;
    refresh();
  },[scope,pending]);

  return { registry, chat, pending, error, connected, generating, locked, provider, usable, request, activate };
}

function AgentSidebar({ agentOpen, setAgentOpen, refreshKey, settingsOpen, shot, time, openResult,
    onWorkbenchChange, onTimelineEdit, onTaskBusy, prepareAgentTask, ...workspace }) {
  const connection = useAgentConnection(refreshKey, settingsOpen, workspace.state.manual_caption_scope);
  const manage = (providerId) => workspace.openSettings('agents', providerId);
  const editorRevision = connection.chat?.workbench_revision;
  const timelineEdit = connection.chat?.timeline_edit;
  const openedEdit = j.useRef(null);
  j.useEffect(() => {
    if (!editorRevision) return;
    let stale = false;
    onWorkbenchChange().then(next => {
      if (stale || !timelineEdit || openedEdit.current === timelineEdit.id ||
          next.manual_caption_scope !== timelineEdit.scope) return;
      openedEdit.current = timelineEdit.id;
      onTimelineEdit();
    }).catch(() => {});
    return () => { stale = true; };
  }, [editorRevision, timelineEdit?.id, onWorkbenchChange, onTimelineEdit]);
  j.useEffect(() => {
    onTaskBusy(Boolean(connection.generating));
  }, [connection.generating, onTaskBusy]);
  function openConversation() {
    connection.activate();
    setAgentOpen(true);
  }
  const picker = <AgentPicker connection={connection} settingsOpen={settingsOpen} manage={manage}
    openConversation={agentOpen ? undefined : openConversation} />;
  if (!agentOpen) return <SN {...workspace} agentPicker={picker} />;
  return <AgentPanel close={() => setAgentOpen(false)} openResult={openResult} manage={manage}
    source={workspace.state.source} project={workspace.state.project} shot={shot} time={time}
    prepareAgentTask={prepareAgentTask} scope={workspace.state.manual_caption_scope} command={workspace.command}
    disabled={workspace.disabled} connection={connection} picker={picker} />;
}

function AgentPanel({ close, openResult, manage, source, project, shot, time, disabled, connection, picker,
    prepareAgentTask, scope, command }) {
  const { registry, chat, pending, error, connected, generating, locked, provider, usable, request } = connection;
  const [text, setText] = j.useState('');
  const [attach, setAttach] = j.useState(true);
  const [material, setMaterial] = j.useState(null);
  const [footage, setFootage] = j.useState(null);
  const [upload, setUpload] = j.useState(null);
  const [dropping, setDropping] = j.useState(false);
  const [footageError, setFootageError] = j.useState('');
  const [submitting, setSubmitting] = j.useState(false);
  const [history, setHistory] = j.useState(null);
  const addingFootage = j.useRef(false);
  const materialInProject = material?.scope === scope ? material : null;
  const footageInProject = footage?.scope === scope ? footage : null;
  const feed = j.useRef(null);
  const input = j.useRef(null);
  const follow = j.useRef(true);
  const context = project?.name || source?.name;
  const transcript = chat?.messages || [];
  const archived = chat?.phase === 'archived';
  const lastText = transcript.at(-1)?.text;
  j.useLayoutEffect(() => { follow.current = true; }, [chat?.provider]);
  j.useLayoutEffect(() => {
    if (feed.current && follow.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [transcript.length, lastText, transcript.at(-1)?.task?.steps?.length, chat?.activity, chat?.permission]);

  function connect(id, options={}) {
    follow.current = true;
    return request('agent_connect', { provider: id, ...options });
  }

  async function showHistory() {
    if (history) {
      setHistory(null);
      return;
    }
    try { setHistory(await Uo('agent_history')); }
    catch { setHistory([]); }
  }

  j.useEffect(() => { setHistory(null); setFootageError(''); },[scope]);

  async function send(event) {
    event?.preventDefault();
    if (!text.trim() || !(connected || archived) || disabled || locked || submitting || addingFootage.current) return;
    setSubmitting(true);
    try {
      if (!await prepareAgentTask()) return;
      follow.current = true;
      const result = await request(archived ? 'agent_dispatch' : 'agent_send', {
        text, attach: Boolean(context && attach && !footageInProject), scope,
        shot: shot?.source_id || shot?.id, clip: shot?.id, time,
        footage: footageInProject?.key, material: attach && !footageInProject ? materialInProject?.key : undefined
      });
      if (result) {
        setText('');
        setMaterial(null);
        setFootage(null);
        input.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function pickMaterial() {
    const selected = await command('agent_pick_material', { scope });
    if (selected) setMaterial({ ...selected, scope });
  }

  async function addFootage(file) {
    if (disabled || locked || submitting || addingFootage.current) return;
    addingFootage.current = true;
    setUpload(file ? 0 : -1);
    setFootageError('');
    try {
      const selected = file ? await HT(file, {agent_footage:1, scope}, setUpload)
        : await Uo('agent_pick_footage', {scope});
      if (selected) {
        setFootage({...selected, scope});
        setMaterial(null);
        input.current?.focus();
      }
    } catch (failure) {
      setFootageError(failure.message);
    } finally {
      addingFootage.current = false;
      setUpload(null);
    }
  }

  function prefill(question) {
    setText(question);
    input.current?.focus();
  }

  return <aside className="sidebar agent-panel" aria-label="本机 Agent">
    <div className="agent-panel-header">
      <St icon={fu} className="agent-back" label="返回工作区" onClick={close} />
      <h2>Agent</h2>
      <St icon={qe} label="项目对话历史" disabled={!scope || locked} aria-expanded={Boolean(history)} onClick={showHistory} />
      <St icon={Hi} label="新对话" disabled={!provider?.available || !provider.enabled || locked} onClick={() => connect(provider.id,{fresh:true})} />
      <St icon={Fi} label="管理 Agent" onClick={() => manage()} />
    </div>
    {history && <div className="agent-history">
      {history.length ? history.map(item => <D key={item.id} kind="ghost" disabled={locked} onClick={async () => {
        if (await connect(item.provider,{history:item.id})) setHistory(null);
      }}>{item.title}</D>) : <p className="field-hint">这个项目还没有已保存的对话。</p>}
    </div>}
    <div className="agent-feed" role="log" aria-label="对话" ref={feed} onScroll={(event) => {
      const node = event.currentTarget;
      follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 45;
    }}>
      {!transcript.length && <div className="agent-empty">
        <div className="agent-empty-icon"><Ma size={19} aria-hidden="true" /></div>
        <strong>{context || footageInProject ? '想怎么剪辑或分析这条视频？' : '从一段素材开始剪辑'}</strong>
        {!context && !footageInProject && <p>添加原始视频，然后告诉 Agent 想剪成什么样。</p>}
        {registry.length > 0 && !usable.length ? <D icon={Fi} onClick={() => manage()}>配置本机 Agent</D>
          : <div className="agent-suggestions">
            {(source || footageInProject) && <D kind="ghost" icon={Ma}
              onClick={() => prefill(footageInProject ? '把这段素材剪成一条节奏明快的产品短片，开头先展示亮点。'
                : '把开头 1 秒和结尾 1 秒剪掉，保留中间内容。')}>试试自动剪辑</D>}
            {project && <D kind="ghost" icon={Ka} onClick={() => prefill('看一下当前项目，列出前 3 秒的分镜、画面文字和口播中译。')}>查看开头 3 秒</D>}
            {project && shot && <D kind="ghost" icon={Ma} onClick={() => prefill('结合当前镜头的关键帧，给我一份可用的复刻提示词。')}>生成当前镜头提示词</D>}
            {source && !project && <D kind="ghost" icon={Ka} onClick={() => prefill('拆解当前视频，生成报告并列出每个镜头。')}>拆解当前视频</D>}
          </div>}
      </div>}
      {transcript.map((message, index) => <article className={'agent-message ' + message.role} key={index}
        aria-label={message.role === 'user' ? '你' : provider?.name || 'Agent'}>
        {message.context && <div className="agent-message-context" title={message.context}>{message.context}</div>}
        {message.task && <AgentTaskTrace task={message.task} activity={index === transcript.length - 1 ? chat?.activity : undefined}
          onExpand={() => { follow.current = false; }}
          retry={connected && !locked ? (step) => request('agent_retry_tool',{step}) : null} />}
        {message.task?.note && message.task.note !== message.text &&
          <p className="agent-task-note">{labelText(message.task.note)}</p>}
        {message.text && <div className="agent-message-text">
          {message.role === 'assistant' ? <AgentReply text={message.text} /> : message.text}
        </div>}
        <AgentResultList message={message} disabled={disabled} openResult={openResult} />
      </article>)}
      {chat?.permission && <div className="agent-permission">
        <strong>{chat.permission.title}</strong>
        <div>{chat.permission.options.map((option) => <D key={option.id} disabled={pending}
          onClick={() => request('agent_permission', { request: chat.permission.id, option: option.id })}>{option.name}</D>)}</div>
      </div>}
      {(chat?.error || error) && <div className="agent-error" role="alert">
        <p>{labelText(error || chat.error)}</p>
        {chat?.phase === 'error' && provider?.available && provider.enabled && <D disabled={pending} onClick={() => connect(provider.id)}>重新连接</D>}
      </div>}
    </div>
    <div className="agent-controls">
      <div className="agent-activity" role="status"><span className={'agent-dot' + (connected || generating ? ' on' : '')}></span>
        <span title={labelText(chat?.activity)}>{labelText(chat?.activity) || (pending ? '正在检测本机 Agent' : '尚未连接 Agent')}</span>
        {archived && provider?.available && provider.enabled &&
          <D kind="ghost" disabled={disabled || locked} onClick={() => connect(provider.id)}>重新连接</D>}
        {chat?.tools === 'ready' && <small className="agent-tools-ready">工作台工具已连接</small>}
        {connected && chat?.tools === 'unavailable' && <small>工作台工具不可用</small>}
      </div>
      <form className={'agent-compose' + (dropping ? ' dropping' : '')} onSubmit={send}
        {...bM(addFootage, setDropping)} aria-busy={upload !== null || submitting}>
        <textarea ref={input} aria-label="发消息给 Agent" placeholder="描述要剪辑或分析的内容…" maxLength={16000} rows={2}
          value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) send(event);
          }} />
        {footageInProject && <div className="agent-compose-attachment">
          <Ka size={14} aria-hidden="true" />
          <span title={footageInProject.name}>{footageInProject.name}</span>
          <St icon={Wa} label="移除剪辑素材" onClick={() => setFootage(null)} disabled={submitting} />
        </div>}
        {!footageInProject && attach && materialInProject && <div className="agent-compose-attachment">
          <span title={materialInProject.name}>{materialInProject.name}</span>
          <St icon={Wa} label="移除替换视频附件" onClick={() => setMaterial(null)} />
        </div>}
        {upload >= 0 && upload !== null && <small role="status">{labelText('正在添加素材 {0}%',upload)}</small>}
        {footageError && <p className="field-hint" role="alert">{labelText(footageError)}</p>}
        <div className="agent-send-row">
          <St icon={Hi} label={footageInProject ? '更换剪辑素材' : '添加剪辑素材'}
            disabled={disabled || locked || submitting || upload !== null} onClick={() => addFootage()} />
          {context && !footageInProject && <label className={'agent-context' + (attach ? ' selected' : '')} title={context}>
            <input type="checkbox" checked={attach} onChange={(event) => setAttach(event.target.checked)} />
            <span>{project ? '当前项目' : '当前视频'}{project && shot ? labelText(' · 镜头 {0}',shot.number || shot.id) : ''}</span></label>}
          {project && attach && !footageInProject && <St icon={qe} label={materialInProject ? '更换替换视频' : '选择替换视频'}
            disabled={disabled || locked || submitting} onClick={pickMaterial} />}
          {generating ? <D icon={hu} disabled={pending || chat?.phase === 'stopping'} onClick={() => request('agent_cancel')}>停止</D>
            : <D type="submit" kind="primary" disabled={!(connected || archived) || locked || disabled || submitting || upload !== null || !text.trim()}>发送</D>}
        </div>
      </form>
      {picker}
    </div>
  </aside>;
}

function agentOptionLabel(option) {
  if (option.id === 'fast-mode') return '速度';
  const labels = {model:'模型', thought_level:'思考强度', speed:'速度'};
  return labels[option.category] || option.name;
}

function AgentBrandIcon({provider, size = 16}) {
  if (!provider) return <Ma size={size} aria-hidden="true" />;
  const mono = ['copilot','cursor','opencode'].includes(provider);
  const style = 'agent-brand-icon' + (mono ? ' mono' : '') +
    (['codex','kimi'].includes(provider) ? ' ' + provider : '');
  return <img className={style} src={'/assets/agent-logos/' + provider + '.png'}
    width={size} height={size} alt="" aria-hidden="true" draggable={false} />;
}

function agentElapsed(milliseconds) {
  const seconds = Math.max(0, Number(milliseconds) || 0) / 1000;
  if (seconds < 0.1) return '< 0.1 秒';
  return seconds < 60 ? labelText('{0} 秒',seconds.toFixed(1)) : kt(seconds);
}

function AgentTaskTrace({ task, activity, retry, onExpand }) {
  const names = {connecting:'连接 Agent', running:'正在执行', stopping:'正在停止', done:'已完成', cancelled:'已停止',
    failed:task.note ? '本次指令未完成' : '连接或执行失败'};
  const states = {pending:'等待', in_progress:'进行中', completed:'完成', failed:'失败', cancelled:'停止', finished:'结束'};
  const running = ['connecting','running','stopping'].includes(task.phase);
  const steps = task.steps || [];
  const current = running && activity;
  const summary = <>
    <span className={'agent-task-status ' + task.phase}>{names[task.phase]}</span>
    <span aria-hidden="true">·</span><time aria-label="任务累计耗时">{agentElapsed(task.elapsed_ms)}</time>
    {!!steps.length && <><span aria-hidden="true">·</span><span>{labelText('{0} 个步骤',steps.length)}</span></>}
  </>;
  if (!steps.length && !current) {
    return <div className="agent-task-trace" role="group" aria-label="Agent 任务进度">
      <div className="agent-trace-summary">{summary}</div>
    </div>;
  }
  return <details className="agent-task-trace" aria-label="Agent 任务进度" onToggle={event => {
    if (event.currentTarget.open) onExpand();
  }}>
    <summary className="agent-trace-summary" title={current ? labelText(current) : undefined}>
      {summary}<span className="agent-disclosure" aria-hidden="true" />
    </summary>
    <div className="agent-trace-details" tabIndex={0} role="region" aria-label="执行步骤">
      {current && <p className="agent-task-current">{labelText(current)}</p>}
      {!!steps.length && <ol className="agent-task-steps">
        {steps.map(step => <li key={step.id} data-state={step.status}>
          <div className="agent-step-heading">
            <strong>{labelText(step.title)}</strong>
            <span>{states[step.status] || states.pending} · {agentElapsed(step.elapsed_ms)}</span>
          </div>
          {step.detail && <p>{labelText(step.detail)}</p>}
          {step.retryable && retry && <D kind="ghost" onClick={() => retry(step.id)}>重试此步</D>}
        </li>)}
      </ol>}
    </div>
  </details>;
}

function AgentResultList({message, openResult, disabled}) {
  const artifacts = [message.artifact, ...(message.task?.steps || []).map(step => step.artifact)];
  const items = [...new Map(artifacts.filter(item => item?.id).map(item => [item.id,item])).values()];
  if (!items.length) return null;
  const visible = items.slice(0,4);
  const remaining = items.slice(visible.length);
  function rows(results) {
    return <ul>{results.map(item => {
      const Icon = item.kind === 'project' ? qe : fo;
      const action = item.kind === 'project' ? '打开拆解项目' : item.kind === 'material' ? '打开生成素材' : '打开成片';
      return <li key={item.id}>
        <button type="button" title={item.name} aria-label={labelText('{0} · {1}',action,item.name)}
          onClick={() => openResult(item.id)} disabled={disabled}>
          <Icon size={15} aria-hidden="true"/><span className="agent-result-name">{item.name}</span>
          <span className="agent-disclosure" aria-hidden="true" />
        </button>
      </li>;
    })}</ul>;
  }
  return <section className="agent-results" aria-label="任务产出">
    {rows(visible)}
    {!!remaining.length && <details>
      <summary>{labelText('还有 {0} 个结果',remaining.length)}<span className="agent-disclosure" aria-hidden="true" /></summary>
      {rows(remaining)}
    </details>}
  </section>;
}

function AgentInstructionEntry({ open }) {
  return <div className="agent-instruction-entry">
    <D kind="ghost" icon={Ma} onClick={open}>Agent 指令</D>
  </div>;
}

function AgentInstructionEditor({ state, shot, time, onSubmit, back, command, disabled, taskBusy, openSettings, tab }) {
  const [text, setText] = j.useState('');
  const [material, setMaterial] = j.useState(null);
  const [busy, setBusy] = j.useState('');
  const target = state.project?.name || state.source?.name;
  const scope = state.manual_caption_scope;
  const locked = disabled || taskBusy || !!busy;
  const materialInProject = material?.scope === scope ? material : null;

  async function pick() {
    setBusy('pick');
    try {
      const selected = await command('agent_pick_material',{scope});
      if (selected) setMaterial({ ...selected, scope });
    } finally {
      setBusy('');
    }
  }

  async function send(event) {
    event.preventDefault();
    if (locked || !text.trim()) return;
    setBusy('send');
    try {
      const result = await onSubmit({text, attach:Boolean(target), scope, shot:shot?.source_id || shot?.id,
        clip:shot?.id, time, material:materialInProject?.key});
      if (result) back();
    } finally {
      setBusy('');
    }
  }

  return <aside id="task-inspector" className="inspector task-panel agent-instruction-panel" aria-label="Agent 指令面板">
    <PanelResizeHandle tab={tab} />
    <div className="agent-instruction-header">
      <div className="agent-instruction-title"><Ma size={18} /><h2>Agent 指令</h2></div>
      <St icon={Fi} label="设置 Agent 连接" onClick={() => openSettings('agents')} />
      <St icon={Wa} label="返回编辑属性" onClick={back} disabled={!!busy} />
    </div>
    <form className="agent-instruction-form" onSubmit={send}>
      {target ? <div className="agent-instruction-context" title={target}>
        <strong>{target}</strong>
        <span>{shot ? '镜头 ' + shot.id + ' · ' : ''}{kt(time || 0,true)}</span>
      </div> : <p className="field-hint">导入视频后，Agent 可以处理当前视频和时间线。</p>}
      <label className="tool-field">
        <span>告诉 Agent 要做什么</span>
        <textarea value={text} onChange={(event) => setText(event.target.value)}
          aria-label="编辑 Agent 指令" placeholder="例如：剪掉开头 2 秒，把最后一个镜头移到最前。"
          maxLength={16000} rows={4} disabled={!!busy} onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) send(event);
          }} />
      </label>
      {state.project && <div className="agent-instruction-material">
        <D icon={qe} disabled={locked} onClick={pick}>{materialInProject ? '更换替换视频' : '选择替换视频'}</D>
        {materialInProject && <><span title={materialInProject.name}>{materialInProject.name}</span>
          <St icon={Wa} label="移除替换视频附件" disabled={locked} onClick={() => setMaterial(null)} /></>}
      </div>}
      <div className="agent-instruction-actions">
        {taskBusy && <p className="field-hint" role="status">Agent 正在执行上一条指令。</p>}
        <D type="submit" kind="primary" icon={Ma} disabled={locked || !text.trim()}>
          {busy === 'send' ? '正在提交…' : '交给 Agent'}
        </D>
      </div>
    </form>
  </aside>;
}

function AgentPicker({ connection, settingsOpen, manage, openConversation }) {
  const { provider, registry, usable, chat, pending, locked, error, request, activate } = connection;
  const [open, setOpen] = j.useState(false);
  const [pointerActivated, setPointerActivated] = j.useState(false);
  const [submenu, setSubmenu] = j.useState(null);
  const toolbar = j.useRef(null);
  const trigger = j.useRef(null);
  const panel = j.useRef(null);
  const optionTimer = j.useRef(null);
  const options = chat?.options || [];
  const activeOption = options.find((option) => option.id === submenu?.id);
  const model = options.find((option) => option.category === 'model');
  const modelLabel = model?.choices.find((choice) => choice.id === model.value)?.name;
  const effort = options.find((option) => option.category === 'thought_level');
  const effortLabel = effort?.choices.find((choice) => choice.id === effort.value)?.name;
  const currentProvider = provider || usable[0];
  const label = modelLabel ? [modelLabel,effortLabel].filter(Boolean).join(' · ')
    : currentProvider?.name || '选择 Agent';
  const switchLabel = labelText('切换模型或 Agent · ');
  const issue = error || chat?.error;

  function closeMenu() {
    clearTimeout(optionTimer.current);
    setSubmenu(null);
    setOpen(false);
  }

  function toggleMenu(event) {
    if (event.detail > 0) setPointerActivated(true);
    if (open) {
      closeMenu();
      return;
    }
    setOpen(true);
    activate();
  }

  function openSettings(providerId) {
    closeMenu();
    manage(providerId);
  }

  function chooseProvider(id) {
    closeMenu();
    trigger.current?.focus({preventScroll:true});
    request('agent_connect', {provider:id});
  }

  function openOptions(id, anchor, focus = false) {
    clearTimeout(optionTimer.current);
    setSubmenu({id, anchor, focus});
  }

  function hoverOption(event, id) {
    if (event.pointerType !== 'mouse') return;
    const anchor = event.currentTarget;
    clearTimeout(optionTimer.current);
    // Give the pointer time to cross adjacent rows on the way to an open submenu.
    if (submenu?.id !== id || submenu?.anchor !== anchor) {
      optionTimer.current = setTimeout(() => openOptions(id, anchor), 90);
    }
  }

  function leaveOptions(event) {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(optionTimer.current);
    optionTimer.current = setTimeout(() => setSubmenu(null), 210);
  }

  j.useEffect(() => {
    return () => clearTimeout(optionTimer.current);
  }, []);

  j.useEffect(() => {
    clearTimeout(optionTimer.current);
    setSubmenu(null);
  }, [chat?.provider]);

  j.useEffect(() => {
    if (settingsOpen) closeMenu();
  }, [settingsOpen]);

  j.useLayoutEffect(() => {
    if (!open) return;
    const bar = toolbar.current;
    const area = bar.closest('.sidebar');
    const header = area.querySelector('.agent-panel-header');
    const menu = panel.current;
    function fit() {
      const top = header ? header.getBoundingClientRect().bottom : area.getBoundingClientRect().top;
      const space = bar.getBoundingClientRect().top - top - 13;
      menu.style.setProperty('--agent-menu-height', Math.max(0, Math.floor(space)) + 'px');
    }
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(area);
    if (header) observer.observe(header);
    return () => observer.disconnect();
  }, [open]);

  j.useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (event.type === 'focusin' && event.target === document.body) return;
      if (!toolbar.current?.contains(event.target)) closeMenu();
    }
    function escape(event) {
      if (event.key !== 'Escape' || event.isComposing || event.defaultPrevented) return;
      event.preventDefault();
      if (activeOption && submenu?.anchor) {
        clearTimeout(optionTimer.current);
        setSubmenu(null);
        if (toolbar.current?.contains(event.target)) submenu.anchor.focus({preventScroll:true});
      } else {
        closeMenu();
        if (toolbar.current?.contains(event.target)) trigger.current?.focus({preventScroll:true});
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, activeOption?.id, submenu?.anchor]);

  return <div className={'agent-toolbar' + (openConversation ? ' agent-toolbar--workspace' : '')} ref={toolbar}>
    {openConversation && <button className="agent-conversation" type="button" aria-label="打开 Agent 对话"
      title="打开 Agent 对话" onClick={openConversation}>对话</button>}
    <button ref={trigger} className="agent-picker" type="button" aria-expanded={open}
      aria-controls={open ? 'agent-picker-options' : undefined} aria-label={switchLabel + label}
      data-pointer-activated={pointerActivated || undefined} onPointerLeave={() => setPointerActivated(false)}
      title={issue || switchLabel + (provider && modelLabel ? provider.name + ' · ' + label : label)} onClick={toggleMenu}>
      <AgentBrandIcon provider={currentProvider?.id} size={14} />
      <span className="agent-picker-label">
        <span>{modelLabel || label}</span>
        {modelLabel && effortLabel && <span className="agent-picker-effort"> · {effortLabel}</span>}
      </span>
    </button>
    {!openConversation && <St icon={SettingsGear} label="Agent 设置" onClick={() => openSettings()} />}
    {open && <div ref={panel} className="agent-picker-menu" id="agent-picker-options" role="group" aria-label="Agent 选项">
      <div className="agent-picker-heading">
        <strong>Agent</strong>
        <St icon={SettingsGear} className="agent-picker-settings" label="管理连接" onClick={() => openSettings()} />
      </div>
      <AgentChoices registry={registry} chat={chat} pending={pending} locked={locked}
        connect={chooseProvider} manage={openSettings} />
      {openConversation && issue && <p className="agent-menu-error" role="alert">{issue}</p>}
      {!!options.length && <div className="agent-option-triggers">
        {options.map((option) => {
          const label = agentOptionLabel(option);
          const value = option.choices.find((choice) => choice.id === option.value)?.name || option.value;
          const expanded = activeOption?.id === option.id;
          return <button key={option.id} type="button" className="agent-option-trigger" aria-expanded={expanded}
            aria-label={label} aria-controls={expanded ? 'agent-setting-choices' : undefined}
            onPointerEnter={(event) => hoverOption(event, option.id)} onPointerLeave={leaveOptions}
            onClick={(event) => openOptions(option.id, event.currentTarget, event.detail === 0)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight') return;
              event.preventDefault();
              openOptions(option.id, event.currentTarget, true);
            }}>
            <span title={label}>{label}</span><span title={value}>{value}</span>{j.createElement(fu,{size:12,'aria-hidden':true})}
          </button>;
        })}
      </div>}
    </div>}
    {open && activeOption && <AgentOptionFlyout key={activeOption.id} option={activeOption} submenu={submenu}
      panel={panel} disabled={locked || chat?.phase !== 'ready'}
      onEnter={() => clearTimeout(optionTimer.current)} onLeave={leaveOptions}
      close={() => {
        clearTimeout(optionTimer.current);
        setSubmenu(null);
        submenu.anchor.focus({preventScroll:true});
      }}
      choose={(value) => {
        if (value !== activeOption.value) request('agent_option', {id:activeOption.id, value});
      }} />}
  </div>;
}

function AgentOptionFlyout({ option, submenu, panel, disabled, onEnter, onLeave, close, choose }) {
  const flyout = j.useRef(null);
  const {anchor, focus} = submenu;

  j.useLayoutEffect(() => {
    const node = flyout.current;
    const menu = panel.current;
    if (!node || !menu) return;
    function place() {
      const edge = 8;
      const gap = 5;
      const from = anchor.getBoundingClientRect();
      const bounds = menu.getBoundingClientRect();
      const width = node.offsetWidth;
      const right = bounds.right + gap;
      const fitsRight = right + width <= window.innerWidth - edge;
      const left = fitsRight ? right : Math.max(edge, bounds.left - width - gap);
      const top = Math.max(edge, Math.min(from.top, window.innerHeight - node.offsetHeight - edge));
      node.style.left = left + 'px';
      node.style.top = top + 'px';
      node.dataset.side = fitsRight ? 'right' : 'left';
      node.style.visibility = from.bottom > bounds.top && from.top < bounds.bottom ? 'visible' : 'hidden';
    }
    place();
    if (focus) {
      const first = node.querySelector('[aria-pressed="true"]:not(:disabled)') || node.querySelector('button:not(:disabled)');
      first?.focus({preventScroll:true});
      first?.scrollIntoView({block:'nearest'});
    }
    const observer = new ResizeObserver(place);
    observer.observe(menu);
    observer.observe(node);
    window.addEventListener('resize', place);
    menu.addEventListener('scroll', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      menu.removeEventListener('scroll', place);
    };
  }, [anchor, focus, panel]);

  return <div ref={flyout} className="agent-option-flyout" id="agent-setting-choices" role="group"
    aria-label={agentOptionLabel(option) + '选项'} onPointerEnter={onEnter} onPointerLeave={onLeave}
    onKeyDown={(event) => {
      if (!['ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') return close();
      const choices = [...flyout.current.querySelectorAll('button:not(:disabled)')];
      if (!choices.length) return;
      const current = choices.indexOf(document.activeElement);
      const offset = event.key === 'ArrowUp' ? -1 : 1;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1
        : (current + offset + choices.length) % choices.length;
      choices[next].focus();
    }}>
    <div className="agent-option-values">
      {option.choices.map((choice) => <button key={choice.id} type="button" disabled={disabled}
        aria-pressed={choice.id === option.value} title={choice.name} onClick={(event) => {
          choose(choice.id);
          if (event.detail === 0 || event.nativeEvent.pointerType === 'touch') close();
        }}>
        <span>{choice.name}</span>{choice.id === option.value && <span aria-hidden="true">✓</span>}
      </button>)}
    </div>
  </div>;
}

function agentConnectionStatus(item) {
  if (item.available && !item.enabled) return '已检测到 · 未启用';
  return item.detail;
}

function AgentChoices({ registry, chat, pending, locked, connect, manage }) {
  const pinned = commonAgentIds()
    .map((id) => registry.find((item) => item.id === id)).filter(Boolean);
  const currentAgent = registry.find((item) => item.id === chat?.provider);
  if (currentAgent && !pinned.includes(currentAgent)) pinned.push(currentAgent);
  const choices = [...pinned, ...registry.filter((item) => !pinned.includes(item) && (item.detected ?? item.available))];
  return <div className="agent-choice-list" role="group" aria-label="本机 Agent 列表">
    {choices.map((item) => {
      const ready = item.available && item.enabled;
      const current = item.id === chat?.provider;
      const archived = current && chat.phase === 'archived';
      const retry = current && (archived || chat.phase === 'error');
      const connecting = current && chat.phase === 'connecting';
      const selected = ready && current && !retry && !connecting;
      let status = agentConnectionStatus(item);
      if (ready && current) {
        if (archived) status = '历史会话 · 待重连';
        else if (retry) status = '连接失败';
        else status = connecting ? '正在连接…' : '已连接';
      }
      const action = ready ? retry ? '重连' : '选择' : '配置';
      const brief = !item.available ? item.detected ? '待配置' : '未找到'
        : !item.enabled ? '未启用' : retry ? '重连' : connecting ? '连接中…' : '';
      const description = labelText('{0} {1}，{2}', action, item.name, labelText(status));
      return <button key={item.id} className="agent-choice" type="button" aria-current={current || undefined}
        aria-label={description} title={description} data-unavailable={!ready || undefined} disabled={ready && locked}
        onClick={() => {
          if (!ready) manage(item.id);
          else if (!current || retry) connect(item.id);
        }}>
        <AgentBrandIcon provider={item.id} size={15} />
        <span className="agent-choice-name">{item.name}</span>
        {selected ? <span className="agent-choice-selected" aria-hidden="true">✓</span>
          : brief && <span className="agent-choice-status" aria-hidden="true">{brief}</span>}
      </button>;
    })}
    {!choices.length && <p className="agent-choice-empty">{pending ? '正在检测本机 Agent…' : '可在设置中重新检测本机 Agent。'}</p>}
  </div>;
}

function AgentReply({ text }) {
  const tokens = j.useMemo(() => {
    try { return agentMarkdown.lexer(text, {gfm:true, breaks:true}); }
    catch { return null; }
  }, [text]);
  return tokens ? <AgentMarkdownTokens tokens={tokens} /> : <p>{text}</p>;
}

function AgentMarkdownTokens({tokens}) {
  return tokens.map((token, key) => {
    const content = token.tokens?.length ? <AgentMarkdownTokens tokens={token.tokens} /> : token.text;
    switch (token.type) {
      case 'space':
      case 'def': return null;
      case 'paragraph': return <p key={key}>{content}</p>;
      case 'heading': {
        const Heading = 'h' + Math.min(6,token.depth + 2);
        return <Heading key={key}>{content}</Heading>;
      }
      case 'strong': return <strong key={key}>{content}</strong>;
      case 'em': return <em key={key}>{content}</em>;
      case 'del': return <del key={key}>{content}</del>;
      case 'codespan': return <code key={key}>{token.text}</code>;
      case 'code': return <pre key={key} tabIndex={0}><code>{token.text}</code></pre>;
      case 'blockquote': return <blockquote key={key}>{content}</blockquote>;
      case 'br': return <br key={key} />;
      case 'hr': return <hr key={key} />;
      case 'list': {
        const List = token.ordered ? 'ol' : 'ul';
        return <List key={key} start={token.ordered ? token.start : undefined}>
          {token.items.map((item,index) => <li key={index}><AgentMarkdownTokens tokens={item.tokens} /></li>)}
        </List>;
      }
      case 'checkbox': return <input key={key} type="checkbox" checked={token.checked} disabled readOnly />;
      case 'table': return <AgentReplyTable key={key} token={token} />;
      case 'link': return /^https?:\/\/[^\s]/i.test(token.href)
        ? <a key={key} href={token.href} target="_blank" rel="noopener noreferrer">{content}</a>
        : <j.Fragment key={key}>{content}</j.Fragment>;
      case 'image': return <j.Fragment key={key}>{token.text}</j.Fragment>;
      default: return <j.Fragment key={key}>{content ?? token.raw}</j.Fragment>;
    }
  });
}

function AgentReplyTable({token}) {
  const alignment = index => ({textAlign:token.align[index] || 'start'});
  return <div className="agent-reply-table" tabIndex={0} role="region" aria-label="回复表格">
    <table>
      <thead><tr>{token.header.map((cell,index) => <th key={index} scope="col" style={alignment(index)}>
        <AgentMarkdownTokens tokens={cell.tokens} />
      </th>)}</tr></thead>
      <tbody>{token.rows.map((row,index) => <tr key={index}>
        {row.map((cell,column) => <td key={column} style={alignment(column)}><AgentMarkdownTokens tokens={cell.tokens} /></td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}
