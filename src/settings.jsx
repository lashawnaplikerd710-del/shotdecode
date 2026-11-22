function CN({ state, command, open, close, checkRuntime, disabled, initialTab, initialAgent, onAgentChange }) {
  const Dialog = hl;
  const [tab, setTab] = j.useState('general');
  j.useEffect(() => {
    if (open) setTab(initialTab || 'general');
  }, [open, initialTab]);
  const pages = [
    ['general', '通用', SettingsGear], ['agents', 'Agent', Ma],
    ['generation', '视频生成', Ka], ['analysis', 'AI 深度分析', Od],
  ];
  return <Dialog open={open} onClose={close} title="工作台设置" className="desktop-settings">
    {open && <div className="settings-layout">
      <nav className="settings-nav" aria-label="设置分类">
        {pages.map(([id, label, Icon]) => <button type="button" key={id}
          className={'nav-item' + (tab === id ? ' active' : '')} aria-current={tab === id ? 'page' : undefined}
          onClick={() => setTab(id)}><Icon size={16} /><span>{label}</span></button>)}
      </nav>
      <div className="settings-main" key={tab}>
        {tab === 'general' && <SettingsGeneral state={state} command={command} disabled={disabled} checkRuntime={checkRuntime} />}
        {tab === 'agents' && <AgentSettings key={initialAgent || ''} initialAgent={initialAgent} onChange={onAgentChange} />}
        {tab === 'generation' && <GenerationSettings state={state} command={command} disabled={disabled} />}
        {tab === 'analysis' && <SettingsAnalysis state={state} command={command} disabled={disabled} />}
      </div>
    </div>}
  </Dialog>;
}

function SettingsGeneral({ state, command, disabled, checkRuntime }) {
  return <>
    <h3>通用</h3>
    <InterfaceSettings settings={state.settings} command={command} />
    <section className="settings-card">
      <h4>文件和项目</h4>
      <Kd label="项目保存位置" value={state.settings.output} disabled={disabled} choose={() => command('pick_output')} />
      <Kd label="成片保存位置" value={state.settings.movie_output} disabled={disabled} choose={() => command('pick_movie_output')} />
      {state.tools && <Kd label="平台元数据 JSON" value={state.tools.inputs.meta} disabled={disabled}
        choose={() => command('tool_pick', {field: 'meta'})} clear={() => command('tool_clear_input', {field: 'meta'})} />}
    </section>
    {state.tools && <section className="settings-card">
      <div className="settings-card-head"><h4>运行环境</h4><D icon={Kl} disabled={disabled} onClick={checkRuntime}>检查本机运行环境</D></div>
    </section>}
  </>;
}

function SettingsAnalysis({ state, command, disabled }) {
  const [form, setForm] = j.useState({base:state.settings.base, model:state.settings.model, key:''});
  const [saved, setSaved] = j.useState(false);
  return <>
    <h3>AI 深度分析</h3>
    <form className="settings-card" onSubmit={async (event) => {
      event.preventDefault();
      if (await command('settings', form) !== undefined) {
        setForm({...form, key:''});
        setSaved(true);
      }
    }}>
      <h4>图像与视频分析服务</h4>
      <p className="field-hint">开启 AI 深度分析后，画面和音轨素材会发送给这里配置的服务。</p>
      {[['base','服务地址','https://…/v1'],['model','模型名','支持视频或图像的模型'],
        ['key','本次会话密钥',state.settings.has_key?'已填写':'API Key']].map(([key, label, placeholder]) =>
        <label key={key} className="tool-field"><span>{label}</span>
          <input type={key==='key'?'password':'text'} autoComplete="off" placeholder={placeholder} value={form[key]}
            onChange={(event) => { setForm({...form, [key]:event.target.value}); setSaved(false); }} />
        </label>)}
      <Kd label="服务配置文件" value={state.settings.env} disabled={disabled} choose={() => command('pick_env')}
        clear={() => command('settings', {clear_env:true})} placeholder="选择 .env 文件…" />
      <div className="settings-card-actions"><span className="settings-feedback" role="status">{saved ? '已保存' : ''}</span>
        <D type="submit" kind="primary" disabled={disabled}>保存分析设置</D></div>
    </form>
  </>;
}

function AgentSettings({ initialAgent, onChange }) {
  const [rows, setRows] = j.useState([]);
  const [query, setQuery] = j.useState('');
  const [expanded, setExpanded] = j.useState(initialAgent || '');
  const [busy, setBusy] = j.useState(null);
  const [feedback, setFeedback] = j.useState(null);
  const expandedRow = j.useRef(null);
  async function action(command, data, key) {
    setBusy({command, key});
    setFeedback(null);
    try {
      const result = await Uo(command, data);
      if (command === 'agent_connect') {
        setRows(await Uo('agent_registry'));
        onChange();
        if (result?.phase === 'error') setFeedback({key, text:result.error, error:true});
      } else if (Array.isArray(result)) {
        setRows(result);
        if (command === 'agent_install') setFeedback({key, text:'连接组件已安装'});
        if (command !== 'agent_registry') onChange();
      } else if (result?.message) setFeedback({key, text:result.message});
    } catch (error) {
      setFeedback({key, text:error.message, error:true});
    } finally {
      setBusy(null);
    }
  }
  j.useEffect(() => { action('agent_registry', {}, 'registry'); }, []);
  const connecting = rows.some(row => row.connection_phase === 'connecting');
  j.useEffect(() => {
    if (!connecting || busy) return;
    let stopped = false;
    let timer;
    async function checkConnection() {
      try {
        const result = await Uo('agent_registry');
        if (!stopped) setRows(result);
      } catch {
        // The next check can recover a temporary transport error.
      }
      if (!stopped) timer = window.setTimeout(checkConnection, 600);
    }
    timer = window.setTimeout(checkConnection, 600);
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [connecting, busy]);
  j.useEffect(() => {
    expandedRow.current?.scrollIntoView({block:'nearest'});
  }, [expanded, rows.length]);
  const filtered = rows.filter((row) => row.name.toLowerCase().includes(query.trim().toLowerCase()));
  const commonIds = commonAgentIds();
  const groups = [
    ['常用', commonIds.map(id => filtered.find(row => row.id === id)).filter(Boolean)],
    ['其他 Agent', filtered.filter(row => !commonIds.includes(row.id))],
  ];
  const renderRow = (row) => {
    const selected = expanded === row.id;
    const run = (command, args) => action(command, {provider:row.id, ...args}, row.id);
    const linked = row.available && ['ready','running','stopping','configuring'].includes(row.connection_phase);
    const opening = row.connection_phase === 'connecting' ||
      (busy?.key === row.id && busy.command === 'agent_connect');
    const installing = busy?.key === row.id && busy.command === 'agent_install';
    const status = linked ? '已连接' : opening ? '正在连接…'
      : row.available && row.connection_phase === 'error' ? '连接失败' : agentConnectionStatus(row);
    const notice = feedback?.key === row.id ? feedback
      : row.connection_error && {text:row.connection_error, error:true};
    const connectLabel = linked ? '已连接' : opening ? '正在连接…' : '连接';
    const connect = () => row.available ? run('agent_connect', {enable:true, wait_ready:true}) : setExpanded(row.id);
    const needsInstall = !row.detected || row.needs_connector;
    const installConnector = () => {
      if (row.detected && row.installable) return run('agent_install');
      setExpanded(row.id);
      return run('agent_docs', {runtime:row.detected && row.needs_connector});
    };
    return <div key={row.id} ref={selected ? expandedRow : null} className={'settings-agent-row' + (selected ? ' expanded' : '')}>
      <div className="settings-agent-line">
        <div className="settings-agent-identity">
          <span className="settings-agent-icon"><AgentBrandIcon provider={row.id} size={18} /></span>
          <div className="settings-agent-name">
            <strong>{row.name}</strong>
            <span className="settings-connection">{labelText(status)}</span>
          </div>
        </div>
        <div className="settings-agent-actions">
          {needsInstall && <D kind="ghost" busy={installing} disabled={!!busy}
            aria-label={labelText('安装连接组件') + ' · ' + row.name} onClick={installConnector}>
            {installing ? '正在安装…' : '安装连接组件'}
          </D>}
          <D className="settings-agent-connect" aria-label={labelText(connectLabel) + ' ' + row.name}
            busy={opening} disabled={!!busy || linked || opening} onClick={connect}>{connectLabel}</D>
          <St icon={Fi} label={labelText('连接设置') + ' · ' + row.name} aria-expanded={selected}
            onClick={() => setExpanded(selected ? '' : row.id)} />
        </div>
        <button type="button" className="switch settings-switch" role="switch" aria-checked={row.enabled}
          data-state={row.enabled ? 'checked' : 'unchecked'} aria-label={'启用 ' + row.name} disabled={!!busy}
          onClick={() => run('agent_enable', {enabled:!row.enabled})}>
          <span className="switch-thumb" data-state={row.enabled ? 'checked' : 'unchecked'} />
        </button>
      </div>
      {selected && <div className="settings-agent-body">
        <div className="agent-capability-summary">
          <strong>{row.workbench_tools==='ready' ? '已连工作台工具' : '连接后检测工作台工具'}</strong>
          {row.workbench_tools==='ready' && <span>读分镜、改项目、导出成片</span>}
          <span>参考帧识别取决于模型</span>
          <span>{row.generation_configured ? '可调用已配置的 ComfyUI' : '可在视频生成设置接入 ComfyUI'}</span>
        </div>
        {row.id === 'workbuddy' && <p className="field-hint">选择 WorkBuddy 企业版提供的 CodeBuddy Code 命令行，以 ACP 模式连接。</p>}
        {!row.detected && <p className="field-hint">安装本机程序后，点「重新检测」再连接。</p>}
        {row.detected && row.needs_connector && !row.installable &&
          <p className="field-hint">安装包含 npm 的 Node.js 后，再点「安装连接组件」。</p>}
        <Kd label="本机程序" value={row.program} placeholder="选择已安装的命令或启动程序…" disabled={!!busy}
          choose={() => run('agent_pick_program')} clear={row.manual ? () => run('agent_reset_program') : undefined} />
        {row.adapter && <Kd label="连接组件" value={row.connector} placeholder={'选择 ' + row.adapter + ' 入口…'} disabled={!!busy}
          choose={() => run('agent_pick_program', {adapter:true})}
          clear={row.custom_connector ? () => run('agent_reset_program', {adapter:true}) : undefined} />}
        <div className="settings-card-actions">
          <span className={'settings-feedback' + (notice?.error ? ' error' : '')} role="status">
            {busy?.key === row.id ? '正在处理…' : notice?.text}
          </span>
          {row.detected && <D kind="ghost" disabled={!!busy} onClick={() => run('agent_docs', {adapter:row.needs_connector})}>安装说明</D>}
          {row.available && <D disabled={!!busy} onClick={() => run('agent_test')}>测试连接</D>}
        </div>
      </div>}
      {!selected && notice && <p className={'settings-agent-feedback' + (notice.error ? ' error' : '')} role="status">{notice.text}</p>}
    </div>;
  };
  return <>
    <h3>Agent</h3>
    <p className="field-hint">检测到的本机 Agent 会出现在左下角菜单。启用后即可选择，登录沿用各 Agent 的账号。</p>
    <div className="settings-search">
      <label className="tool-field"><input aria-label="搜索 Agent" placeholder="搜索 Agent" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <D disabled={!!busy} onClick={() => action('agent_registry', {}, 'registry')}>重新检测</D>
    </div>
    {feedback?.key === 'registry' && <p className="settings-feedback error" role="alert">{feedback.text}</p>}
    {groups.map(([label, group]) =>
      group.length > 0 && <section key={label} className="settings-agent-group">
        <h4>{label}</h4><div>{group.map(renderRow)}</div>
      </section>)}
    {!filtered.length && <p className="field-hint">{busy ? '正在检测本机 Agent…' : '没有匹配的 Agent。'}</p>}
  </>;
}

function GenerationSettings({ state, command, disabled }) {
  const [comfy, setComfy] = j.useState({url:'http://127.0.0.1:8188', path:'', prompt:'', image:'', ...state.settings.comfy});
  const [inputs, setInputs] = j.useState(null);
  const [engine, setEngine] = j.useState(state.settings.engine);
  const [busy, setBusy] = j.useState('');
  const [feedback, setFeedback] = j.useState(null);
  j.useEffect(() => {
    if (comfy.path) Uo('video_gen_workflow').then(setInputs)
      .catch((error) => setFeedback({scope:'comfy', text:error.message, error:true}));
  }, []);
  async function run(scope, action, handler) {
    setBusy(scope);
    setFeedback(null);
    try {
      const result = await action();
      if (handler) handler(result);
      else if (result?.message) setFeedback({scope, text:result.message + (result.version ? ' · ' + result.version : '')});
    } catch (error) {
      setFeedback({scope, text:error.message, error:true});
    } finally {
      setBusy('');
    }
  }
  const chooseWorkflow = () => run('comfy', () => Uo('video_gen_pick_workflow'), (result) => {
    if (result) {
      setInputs(result);
      setComfy({...comfy, path:result.path, prompt:result.prompt, image:''});
    }
  });
  const status = (scope) => <span role="status" className={'settings-feedback' + (feedback?.scope===scope && feedback.error ? ' error' : '')}>
    {busy===scope ? '正在处理…' : feedback?.scope===scope ? feedback.text : ''}
  </span>;
  return <>
    <h3>视频生成</h3>
    <form className="settings-card" onSubmit={(event) => {
      event.preventDefault();
      run('comfy', () => command('video_gen_save', comfy), (saved) => {
        if (saved) {
          setComfy(saved);
          setFeedback({scope:'comfy', text:'ComfyUI 设置已保存'});
        }
      });
    }}>
      <div className="settings-card-head"><h4>ComfyUI</h4>
        <span className="settings-connection">{state.settings.comfy?.path ? '已配置工作流' : '连接本机或局域网'}</span></div>
      <label className="tool-field"><span>服务地址</span><input inputMode="url" value={comfy.url}
        placeholder="http://127.0.0.1:8188" onChange={(event) => setComfy({...comfy, url:event.target.value})} /></label>
      <Kd label="API 工作流 JSON" value={comfy.path} placeholder="选择有视频输出的工作流…" disabled={!!busy || disabled}
        choose={chooseWorkflow} clear={() => { setInputs(null); setComfy({...comfy, path:'', prompt:'', image:''}); }} />
      {!comfy.path && <p className="field-hint">在 ComfyUI 里用「导出（API）」保存视频工作流，再在此选择。</p>}
      {inputs && comfy.path && <div className="settings-fields-grid">
        <label className="tool-field"><span>正向提示词输入</span><select value={comfy.prompt}
          onChange={(event) => setComfy({...comfy, prompt:event.target.value})}>
          <option value="">选择提示词节点</option>
          {inputs.prompts.map((field) => <option key={field.id} title={field.preview} value={field.id}>
            {field.label}{field.preview ? ' · ' + field.preview.slice(0,24) : ''}</option>)}
        </select></label>
        <label className="tool-field"><span>参考帧输入</span><select value={comfy.image}
          onChange={(event) => setComfy({...comfy, image:event.target.value})}>
          <option value="">不发送参考帧</option>
          {inputs.images.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}
        </select></label>
      </div>}
      <div className="settings-card-actions">{status('comfy')}
        <D disabled={!!busy || !comfy.url.trim()} onClick={() => run('comfy', () => Uo('video_gen_test',{url:comfy.url}))}>测试连接</D>
        <D type="submit" kind="primary" disabled={!!busy || disabled || !comfy.url.trim() || (comfy.path && !comfy.prompt)}>保存 ComfyUI 设置</D>
      </div>
    </form>
    <section className="settings-card">
      <h4>批量生成后端</h4>
      <Kd label="后端目录" value={state.settings.capsule_root} disabled={disabled} placeholder="选择已安装的 capsule-cinema 目录…"
        choose={() => command('tool_pick',{field:'capsule_root'})} clear={() => command('tool_clear_input',{field:'capsule_root'})} />
      <Kd label="后端 Python" value={state.settings.capsule_python} disabled={disabled} placeholder="使用后端目录的默认 Python"
        choose={() => command('tool_pick',{field:'capsule_python'})} clear={() => command('tool_clear_input',{field:'capsule_python'})} />
      <label className="tool-field"><span>默认生成引擎</span>
        <input value={engine} placeholder="seedance2.0" onChange={(event) => setEngine(event.target.value)} /></label>
      <div className="settings-card-actions">{status('capsule')}
        <D disabled={!!busy || !state.settings.capsule_root} onClick={() => run('capsule', () => Uo('video_gen_capsule_test'))}>检测后端</D>
        <D disabled={disabled || !engine.trim() || engine===state.settings.engine} onClick={() => command('settings',{engine})}>保存引擎</D>
      </div>
    </section>
  </>;
}

function ComfyGenerationAction({ settings, command, shot, text, disabled, openSettings, save }) {
  const configured = Boolean(settings?.comfy?.path && settings?.comfy?.prompt);
  return <section className="inspector-block comfy-action">
    <div className="section-head"><h3>ComfyUI 生成</h3><St icon={Fi} label="视频生成设置" onClick={() => openSettings('generation')} /></div>
    {configured ? <>
      <p className="field-hint">将当前提示词{settings.comfy.image ? '和首帧' : ''}发送到已配置的工作流。</p>
      <D className="wide" icon={Ma} disabled={disabled || !text.trim()} onClick={async () => {
        if (await save()) await command('video_gen_comfy', {shot:shot.id,text});
      }}>生成并替换当前镜头</D>
    </> : <D className="wide" icon={Fi} onClick={() => openSettings('generation')}>配置视频生成</D>}
  </section>;
}
