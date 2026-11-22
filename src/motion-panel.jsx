function motionSelection(style, phase) {
  const legacy = phase === 'entrance' ? style.fade_in : phase === 'exit' ? style.fade_out : 0;
  return style.animation?.[phase] || (legacy > 0 ? {preset:'fade', seconds:legacy} : null);
}

function motionTimeline(style, duration, library) {
  if (!library?.presets || !duration) return [];
  const entrance = motionSelection(style,'entrance');
  const exit = motionSelection(style,'exit');
  const length = (entrance?.seconds || 0) + (exit?.seconds || 0);
  const fit = length ? Math.min(1,duration/length) : 1;
  return [['entrance',entrance],['exit',exit],['loop',motionSelection(style,'loop')]].flatMap(([phase,active]) => {
    if (!active) return [];
    const preset = library.presets[phase].find((item) => item.id === active.preset);
    if (!preset) return [];
    const seconds = (preset.once ? duration : active.seconds || preset.seconds) * (phase==='loop' ? 1 : fit);
    const start = phase==='exit' ? duration-seconds : 0;
    return [{phase,preset,seconds,start,repeat:phase==='loop'&&!preset.once}];
  });
}

function motionFrame(frames, progress) {
  const index = frames.findIndex((frame) => frame[0] >= progress);
  if (index <= 0) return (index === 0 ? frames[0] : frames.at(-1)).slice(1);
  const first = frames[index-1], last = frames[index];
  const amount = (progress-first[0])/(last[0]-first[0]);
  return first.slice(1).map((value,channel) => value+(last[channel+1]-value)*amount);
}

function motionAt(timeline, time) {
  let scale=1, x=0, y=0, angle=0, opacity=1, blur=0;
  for (const item of timeline) {
    const local = Math.max(0,time-item.start);
    const position = item.repeat ? local%item.seconds/item.seconds : Math.min(1,local/item.seconds);
    const [zoom,dx,dy,rotation,alpha,sigma] = motionFrame(item.preset.frames,position);
    scale *= zoom;
    x += dx;
    y += dy;
    angle += rotation;
    opacity *= alpha;
    blur += sigma;
  }
  return {scale,x,y,angle,opacity,blur};
}

function MotionTile({preset, phase, poster, title, active, disabled, apply}) {
  const piece = j.useRef(null);
  const animation = j.useRef(null);

  function transform(frame) {
    const [scale,x,y,angle,opacity,blur] = frame;
    return {transform:'translate('+x*118+'%, '+y*118+'%) rotate('+angle+'deg) scale('+scale+')',
      opacity, filter:blur ? 'blur('+blur*46+'px)' : 'none'};
  }
  function stop() {
    animation.current?.cancel();
    animation.current = null;
  }
  function start() {
    if (!preset || !piece.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    const frames = preset.frames.map(([offset,...frame]) => ({...transform(frame),offset}));
    animation.current = piece.current.animate(frames,{
      duration:Math.max(500,Math.min(1450,preset.seconds*1450)),
      iterations:phase==='loop'&&!preset.once ? Infinity : 1,fill:'both',
    });
  }
  j.useEffect(() => stop,[preset,poster,title]);
  const example = preset ? transform(motionFrame(preset.frames,phase==='exit' ? .54 : .35)) : null;
  const label = preset ? labelText(preset.name) : '无';
  return <button type="button" className="motion-card" aria-pressed={active} disabled={disabled}
    aria-label={label} title={preset ? label : '清除此类动效'} onClick={apply}
    onPointerEnter={start} onPointerLeave={stop} onFocus={start} onBlur={stop}>
    <span className="motion-swatch" aria-hidden="true">
      {preset ? <span className={'motion-piece'+(poster?'':' motion-piece-text')} ref={piece} style={example}>
        {poster ? <img src={poster} alt="" draggable={false} /> : <b>{title || '字幕'}</b>}
      </span> : <span className="motion-none"></span>}
    </span>
    <span className="motion-card-label">{label}</span>
  </button>;
}

function MotionPicker({style, duration, library, poster, title, disabled, update, preview}) {
  const [phase,setPhase] = j.useState('entrance');
  const phases = [
    {id:'entrance', label:'入场', presets:'入场预设', preview:'试播入场'},
    {id:'exit', label:'出场', presets:'出场预设', preview:'试播出场'},
    {id:'loop', label:'循环', presets:'循环预设', preview:'试播循环'},
  ];
  if (!library?.presets) return null;
  const selectedPhase = phases.find(({id}) => id===phase);
  const items = library.presets[phase];
  const active = motionSelection(style,phase);
  const preset = items.find((item) => item.id===active?.preset);
  const isLoop = phase==='loop';
  const maximum = isLoop ? 10 : Math.max(.001,Math.min(library.transition_limit,duration));
  const minimum = isLoop ? .1 : Math.min(.02,maximum);

  function modify(item) {
    const animation = {...style.animation};
    if (item) animation[phase] = item;
    else delete animation[phase];
    const patch = {animation};
    if (phase==='entrance' && 'fade_in' in style) patch.fade_in = 0;
    if (phase==='exit' && 'fade_out' in style) patch.fade_out = 0;
    update(patch);
    return {...style,...patch};
  }
  function play(style) {
    if (!preview) return;
    const interval = motionTimeline(style,duration,library).find((track) => track.phase===phase);
    if (!interval) return;
    const start = Math.max(0,interval.start-(phase==='exit'?.16:0));
    const end = Math.min(duration,interval.start+interval.seconds+(phase==='entrance'?.18:0));
    preview(start,end);
  }
  function choose(item) {
    if (!item) {
      modify(null);
      return;
    }
    const next = item.once ? {preset:item.id} : {preset:item.id,
      seconds:Number(Math.min(maximum,active?.seconds || item.seconds).toFixed(3))};
    if (active?.preset===item.id) {
      play(style);
    } else {
      play(modify(next));
    }
  }

  return <section className="motion-picker" aria-label="动画预设">
    <div className="motion-phases"><Kr label="动画阶段" values={phases.map(({id,label})=>[id,label])} value={phase} onChange={setPhase} /></div>
    <div className="motion-library" key={phase} role="group" aria-label={selectedPhase.presets}>
      <MotionTile phase={phase} active={!preset} disabled={disabled} apply={()=>choose(null)} />
      {items.map((item) => <MotionTile key={item.id} preset={item} phase={phase} poster={poster} title={title}
        active={preset?.id===item.id} disabled={disabled} apply={()=>choose(item)} />)}
    </div>
    {preset && <div className="motion-controls">
      {preset.once ? <span className="motion-timing-info">随片段时长推进</span> :
        <PropertyNumber label={isLoop?'循环周期（秒）':'动画时长（秒）'} mark={isLoop?'周期':'时长'} suffix="秒"
          value={active?.seconds ?? preset.seconds} min={minimum} max={maximum} step={.05} disabled={disabled}
          onValue={(seconds)=>modify({preset:preset.id,seconds:Number(seconds.toFixed(3))})} />}
      <D className="motion-play-button" icon={mo} disabled={disabled || !preview} onClick={()=>play(style)}>
        {selectedPhase.preview}
      </D>
    </div>}
  </section>;
}
