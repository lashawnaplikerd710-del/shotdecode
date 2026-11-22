function clipEditTarget(project, shot) {
  return {project:project.id, shot:shot.source_id || shot.id,
    clip:shot.source_id || shot.lane || shot.type === 'media' ? shot.id : undefined};
}

function useClipProperties(project, disabled, command, reveal) {
  const queued = j.useRef(new Map());
  const running = j.useRef(null);
  const resetting = j.useRef(null);
  const timer = j.useRef(null);
  const [, redraw] = j.useReducer((revision) => revision + 1, 0);
  const [status, setStatus] = j.useState('idle');

  j.useEffect(() => () => clearTimeout(timer.current), []);
  j.useEffect(() => { setStatus('idle'); }, [project?.id]);

  function read(shot) {
    if (!shot || !project) return null;
    const waiting = queued.current.get(shot.id);
    return waiting?.target.project === project.id ? waiting.value : shot.properties || project.canvas.defaults;
  }

  function flush() {
    clearTimeout(timer.current);
    if (resetting.current) return resetting.current;
    if (running.current) return running.current;
    if (!queued.current.size) return Promise.resolve(true);
    setStatus('saving');
    running.current = (async () => {
      try {
        while (queued.current.size) {
          const [id, entry] = queued.current.entries().next().value;
          const saved = await command('save_clip_properties', {
            ...entry.target, properties: entry.value,
          });
          if (!saved) {
            setStatus('error');
            return false;
          }
          if (queued.current.get(id) === entry) queued.current.delete(id);
          redraw();
        }
        setStatus('saved');
        return true;
      } finally {
        running.current = null;
      }
    })();
    return running.current;
  }

  function update(shot, patch) {
    if (!shot || !project || disabled || resetting.current) return;
    const current = read(shot);
    const next = { ...current, ...patch };
    if (Object.entries(patch).every(([key, value]) => value === current[key])) return;
    queued.current.set(shot.id, {target:clipEditTarget(project, shot), value:next});
    redraw();
    if (!running.current) setStatus('draft');
    reveal(shot);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 320);
  }

  function reset(shot) {
    if (!shot || !project || disabled || resetting.current) return;
    const saving = flush();
    resetting.current = (async () => {
      try {
        if (!await saving) return false;
        setStatus('saving');
        const saved = await command('reset_clip_properties',clipEditTarget(project, shot));
        setStatus(saved ? 'saved' : 'idle');
        if (saved) reveal(shot);
        return Boolean(saved);
      } finally {
        resetting.current = null;
      }
    })();
  }

  return { read, update, flush, reset, status };
}

function PropertyTabs({ label, tabs, value, setValue, children, className = '' }) {
  return <Dm className={'property-tabs ' + className} value={value} onValueChange={setValue}>
    <Om className="property-tabbar" aria-label={label}>
      {tabs.map(([id, name]) => <Pm className="property-tab" key={id} value={id}>{name}</Pm>)}
    </Om>
    <Xi className="property-tab-content" value={value} key={value}>{children}</Xi>
  </Dm>;
}

function PropertySection({ title, children, expanded = true }) {
  return <details className="property-section" open={expanded}>
    <summary><span aria-hidden="true"></span>{title}</summary>
    <div className="property-section-content">{children}</div>
  </details>;
}

function PropertyNumber({ label, mark, suffix, value, min, max, step = 1, disabled, onValue }) {
  const [typed, setTyped] = j.useState(null);
  function finish() {
    if (typed !== null && typed !== '' && Number.isFinite(Number(typed))) {
      onValue(Math.min(max, Math.max(min, Number(typed))));
    }
    setTyped(null);
  }
  return <label className="property-number">
    <span aria-hidden="true">{mark}</span>
    <input aria-label={label} type="number" inputMode="decimal" min={min} max={max} step={step}
           value={typed ?? value} disabled={disabled} onBlur={finish} onKeyDown={(event) => {
      if (event.key === 'Enter') event.currentTarget.blur();
    }} onChange={(event) => {
      const changed = event.target.value;
      const number = Number(changed);
      setTyped(changed);
      if (changed !== '' && number >= min && number <= max) onValue(number);
    }} />
    <span className="property-unit" aria-hidden="true">{suffix}</span>
  </label>;
}

function ClipInspector({ shot, state, clipEditor, disabled, ...props }) {
  const [tab, setTab] = j.useState('geometry');
  const [locked, setLocked] = j.useState(true);
  const canvas = state.project?.canvas;
  if (!shot || !canvas) return <div className="task-panel-body">
    {state.project
      ? <FT icon={$t} text="视频轨道为空" hint="撤销删除可恢复片段。" />
      : <FT icon={$t} text="等待导入视频" hint="导入视频后，点击时间线上的片段开始编辑。" />}
  </div>;
  const style = clipEditor.read(shot);
  const change = (patch) => clipEditor.update(shot, patch);
  const tabs = [['geometry','属性'], ['animation','动画'], ['color','调节'], ['effects','效果'], ['media','高级']];
  const round = (value, precision = 0) => {
    const scale = 10 ** precision;
    return Math.round(value * scale) / scale;
  };
  function dimension(key, value) {
    const next = Math.round(value);
    if (!locked) return change({ [key]:next });
    const partner = key === 'width' ? 'height' : 'width';
    const [lo, hi] = canvas.limits[partner];
    const scale = Math.max(lo / style[partner], Math.min(hi / style[partner], next / style[key]));
    change({ [key]:Math.round(style[key] * scale), [partner]:Math.round(style[partner] * scale) });
  }
  function field(key, label, mark, suffix, onValue, step = 1) {
    const [min, max] = canvas.limits[key];
    return <PropertyNumber label={label} mark={mark} suffix={suffix} value={style[key]} min={min} max={max}
      step={step} disabled={disabled} onValue={onValue || ((value) => change({ [key]:round(value, step < 1 ? 1 : 0) }))} />;
  }
  const cut = style.crop;
  const edges = [['left','裁剪左侧','左','right'],['right','裁剪右侧','右','left'],
    ['top','裁剪顶部','上','bottom'],['bottom','裁剪底部','下','top']];
  function cropRatio(ratio) {
    const current = style.width / style.height;
    const horizontal = ratio && ratio < current ? round(Math.min(47.5, 50 * (1 - ratio / current)), 2) : 0;
    const vertical = ratio && ratio > current ? round(Math.min(47.5, 50 * (1 - current / ratio)), 2) : 0;
    return { left:horizontal, right:horizontal, top:vertical, bottom:vertical };
  }
  function align(key, where) {
    const bounds = clipVisibleBounds(style);
    const [low, high, length] = key === 'x' ? [bounds.left, bounds.right, canvas.width] :
      [bounds.top, bounds.bottom, canvas.height];
    const target = where === 'start' ? -length / 2 - low : where === 'end' ? length / 2 - high : -(low + high) / 2;
    const [min, max] = canvas.limits[key];
    change({ [key]:Math.round(Math.min(max, Math.max(min, target))) });
  }
  function slider(key,label,baseline=0,unit='%') {
    const [min,max] = canvas.limits[key];
    return <ClipSlider key={key} label={label} unit={unit} value={style[key]-baseline}
      min={min-baseline} max={max-baseline} disabled={disabled}
      onValue={(value) => change({[key]:Math.round(value+baseline)})} />;
  }
  const status = clipEditor.status;
  const message = status === 'saving' ? '正在保存…' : status === 'draft' ? '待保存' : status === 'saved' ? '已保存' : '';

  return <>
    <div className="property-header">
      <span className="property-object-icon"><$t size={17} aria-hidden="true" /></span>
      <div className="property-heading">
        <h2>{labelText('镜头 {0}',String(shot.number || shot.id).padStart(2,'0'))}</h2>
        <div title={shot.replacement_name || labelText(shot.label)}>
          {shot.replacement_name ? '替换素材' : '原片'}<span> · </span>{shot.duration.toFixed(2)} 秒
        </div>
      </div>
      <div className="property-header-actions">
        {message && <span className="property-save-label" role="status">{message}</span>}
        <St icon={qi} label="重置镜头属性" disabled={disabled || JSON.stringify(style) === JSON.stringify(canvas.defaults)}
          onClick={() => clipEditor.reset(shot)} />
      </div>
    </div>
    <PropertyTabs label="镜头属性类别" tabs={tabs} value={tab} setValue={setTab}>
      {tab === 'geometry' && <>
        <PropertySection title="位置与大小">
          <div className="property-align">
            {[['x',['左对齐','水平居中','右对齐']],['y',['顶对齐','垂直居中','底对齐']]].map(([axis,names]) =>
              <div key={axis} className="property-align-group" role="group" aria-label={axis === 'x' ? '水平对齐' : '垂直对齐'}>
                {['start','center','end'].map((where,index) => <button key={where} type="button" aria-label={names[index]}
                  title={names[index]} disabled={disabled} onClick={() => align(axis,where)}>
                  <span aria-hidden="true" className={'property-align-icon axis-' + axis + ' align-' + where}><i></i><b></b></span>
                </button>)}
              </div>)}
          </div>
          <div className="property-two">
            {field('x','水平位置 X','X','px')}{field('y','垂直位置 Y','Y','px')}
          </div>
          <div className="property-dimensions">
            {field('width','镜头宽度 W','W','px',(value) => dimension('width',value))}
            <div className="property-height-control">
              {field('height','镜头高度 H','H','px',(value) => dimension('height',value))}
              <button type="button" className="property-lock" aria-label="锁定宽高比" title="锁定宽高比"
                aria-pressed={locked} onClick={() => setLocked(!locked)}>等比</button>
            </div>
          </div>
          <div className="property-two">
            {field('rotation','旋转角度','旋转','°',null,.1)}
            <div className="property-align-group property-rotate" role="group" aria-label="快速旋转">
              {[[-90,'向左转 90 度'],[90,'向右转 90 度']].map(([step,label]) =>
                <button key={step} title={label} aria-label={label} type="button" disabled={disabled}
                  onClick={() => change({rotation:round(((style.rotation + step + 540) % 360) - 180,1)})}>{step<0?'↶':'↷'} 90°</button>)}
            </div>
          </div>
        </PropertySection>
        <PropertySection title="裁剪与填充">
          <div className="property-two">
            {edges.map(([key,label,mark,opposite]) => <PropertyNumber key={key} label={label} mark={mark} suffix="%"
              value={cut[key]} min={0} max={Math.max(0,round(95-cut[opposite],2))} step={.1} disabled={disabled}
              onValue={(value) => change({ crop:{...cut,[key]:round(value,2)} })} />)}
          </div>
          <div className="property-segments" role="group" aria-label="裁剪比例">
            {[[0,'完整'],[16/9,'16:9'],[9/16,'9:16'],[1,'1:1'],[4/3,'4:3']].map(([ratio,label]) => {
              const preset = cropRatio(ratio);
              const equal = Object.keys(preset).every((edge) => preset[edge] === cut[edge]);
              return <button key={label} type="button" disabled={disabled} aria-label={ratio ? '裁剪为 ' + label : '恢复完整画面'}
                aria-pressed={equal && (!ratio || Object.values(preset).some(Boolean))}
                onClick={() => change({crop:preset})}>{label}</button>;
            })}
          </div>
          <Kr label="素材填充方式" values={[[ 'cover','铺满外框' ],[ 'contain','完整适应' ]]} value={style.fit}
            disabled={disabled} onChange={(fit) => change({fit})} />
        </PropertySection>
      </>}
      {tab === 'animation' && <MotionPicker style={style} duration={shot.duration} library={state.motion}
        poster={shot.replacement_thumb || shot.thumb} title={labelText('镜头 {0}',String(shot.number || shot.id).padStart(2,'0'))} disabled={disabled} update={change}
        preview={state.source?.url && ((start,end) => props.playRange(shot.start+start,shot.start+end))} />}
      {tab === 'color' && <PropertySection title="调色">
        {slider('brightness','亮度',100)}{slider('contrast','对比度',100)}
        {slider('saturation','饱和度',100)}{slider('hue','色相',0,'°')}
        {slider('grayscale','黑白')}{slider('opacity','不透明度')}
      </PropertySection>}
      {tab === 'effects' && <PropertySection title="画面效果">
        {slider('soft_focus','柔焦')}
        <div className="clip-effect-flips">
          <D disabled={disabled} aria-pressed={style.flip_x} onClick={()=>change({flip_x:!style.flip_x})}>水平翻转</D>
          <D disabled={disabled} aria-pressed={style.flip_y} onClick={()=>change({flip_y:!style.flip_y})}>垂直翻转</D>
        </div>
      </PropertySection>}
      {tab === 'media' && <ClipMaterialPanel {...props} shot={shot} state={state} disabled={disabled} />}
    </PropertyTabs>
    {status === 'error' && <div className="property-save-state" role="alert">
      <span>属性保存失败</span><D kind="ghost" onClick={clipEditor.flush}>重试保存</D>
    </div>}
  </>;
}

function ClipSlider({label,unit,value,min,max,disabled,onValue}) {
  return <div className="property-slider-row">
    <span>{label}</span>
    <input type="range" aria-label={label+'滑块'} value={value} min={min} max={max} disabled={disabled}
      onChange={(event)=>onValue(Number(event.target.value))} />
    <PropertyNumber label={label} suffix={unit} value={value} min={min} max={max} disabled={disabled} onValue={onValue} />
  </div>;
}

function ClipMaterialPanel({shot,state,disabled,command,playback,openAdvanced}) {
  const name = shot.replacement_name || shot.name || state.source?.name;
  const target = clipEditTarget(state.project, shot);
  return <>
    <PropertySection title="素材">
      <div className="clip-asset-name" title={name}><$t size={15} aria-hidden="true" /><span>{name}</span></div>
      {shot.replacement_name && !shot.replacement && <p className="field-hint">素材已移动，请重新选择文件。</p>}
      <div className="button-row clip-material-actions">
        <D icon={mu} disabled={disabled} onClick={()=>command('replace',target)}>选择替换视频</D>
        {shot.replacement && <D icon={mo} onClick={()=>playback({
          url:shot.replacement,label:labelText('镜头 {0} · 素材预览',shot.number || shot.id),override:true,
        })}>预览素材</D>}
        {shot.replacement_name && <St icon={Wa} label="移除替换素材" disabled={disabled}
          onClick={()=>command('clear_replacement',target)} />}
      </div>
    </PropertySection>
    <PropertySection title="高级" expanded={false}>
      <dl className="clip-video-details">
        <div><dt>时间范围</dt><dd>{kt(shot.start,true)} – {kt(shot.end,true)}</dd></div>
        <div><dt>镜头类型</dt><dd>{labelText(shot.label)}</dd></div>
      </dl>
      {shot.description && <p className="field-hint">{shot.description}</p>}
      <D kind="ghost" icon={po} onClick={()=>openAdvanced('timeline')}>批量匹配与生成结果</D>
      {state.project.exports.length > 0 && <div className="button-row">
        {state.project.exports.map((movie)=><D key={movie.label} icon={mo}
          onClick={()=>movie.external ? command('version_open_export',{project:state.project.id,id:movie.id})
            : playback({...movie,override:true})}>{movie.label}</D>)}
      </div>}
    </PropertySection>
  </>;
}

function clipVisibleBounds(style) {
  const { width, height, crop, rotation } = style;
  const left = width * (crop.left / 100 - .5);
  const right = width * (.5 - crop.right / 100);
  const top = height * (crop.top / 100 - .5);
  const bottom = height * (.5 - crop.bottom / 100);
  const angle = rotation * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y]) =>
    [x * cos - y * sin, x * sin + y * cos]);
  const xs = points.map((point) => point[0]), ys = points.map((point) => point[1]);
  return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
}
