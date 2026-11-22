function ShotThumbnail({ shot }) {
  const [failed, setFailed] = j.useState(null);
  const url = shot.replacement_name ? shot.replacement_thumb : shot.thumb;
  return url && failed !== url && <img src={url} alt="" draggable={false} loading="lazy" onError={() => setFailed(url)} />;
}

function PreviewViewToggle({ active, setActive }) {
  return <div className="preview-view-toggle" role="group" aria-label="预览模式">
    <button type="button" aria-pressed={!active} onClick={() => setActive(false)} title="查看原片画面">原片</button>
    <button type="button" aria-pressed={active} onClick={() => setActive(true)} title="查看剪辑后的画面">剪辑</button>
  </div>;
}

function PreviewHeaderAction({ icon, label, ...props }) {
  return <D kind="ghost" icon={icon} className="viewer-compact-action" aria-label={label} title={label} {...props}>
    <span>{label}</span>
  </D>;
}

function TimelineResizeGrip() {
  const node = j.useRef(null);
  const drag = j.useRef(null);
  const [metrics,setMetrics] = j.useState({height:160,max:300});
  function region() {
    const timeline = node.current?.closest('.timeline');
    const shell = timeline?.closest('.shell');
    return {timeline,shell};
  }
  function measure() {
    const {timeline,shell} = region();
    if (!timeline || !shell) return;
    const height = Math.round(timeline.getBoundingClientRect().height);
    const max = Math.max(104,Math.floor(Math.min(window.innerHeight*.46,shell.clientHeight-204)));
    setMetrics((old) => old.height===height && old.max===max ? old : {height,max});
  }
  j.useLayoutEffect(() => {
    const {timeline,shell} = region();
    if (!timeline || !shell) return;
    const observer = new ResizeObserver(measure);
    observer.observe(timeline);
    observer.observe(shell);
    measure();
    return () => {
      observer.disconnect();
      shell.classList.remove('resizing-timeline');
    };
  },[]);
  function resize(height) {
    const {shell} = region();
    if (!shell) return;
    const value = Math.round(Math.max(104,Math.min(metrics.max,height)));
    shell.style.setProperty('--editor-timeline-height',value+'px');
  }
  function reset() {
    region().shell?.style.removeProperty('--editor-timeline-height');
  }
  function start(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {id:event.pointerId,y:event.clientY,height:metrics.height};
    region().shell?.classList.add('resizing-timeline');
  }
  function move(event) {
    const owner = drag.current;
    if (owner?.id === event.pointerId) resize(owner.height+owner.y-event.clientY);
  }
  function end(event) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    region().shell?.classList.remove('resizing-timeline');
  }
  function key(event) {
    const heights = {ArrowUp:metrics.height+20,ArrowDown:metrics.height-20,Home:104,End:metrics.max};
    if (event.key === 'Enter') reset();
    else if (Object.hasOwn(heights,event.key)) resize(heights[event.key]);
    else return;
    event.preventDefault();
  }
  return <div ref={node} className="timeline-resize-grip" role="separator" tabIndex={0}
    aria-label="调整时间线高度" aria-orientation="horizontal" aria-valuemin={104}
    aria-valuemax={metrics.max} aria-valuenow={Math.min(metrics.height,metrics.max)}
    title="上下拖动调整高度，双击恢复默认" onPointerDown={start} onPointerMove={move}
    onPointerUp={end} onLostPointerCapture={end} onPointerCancel={end} onDoubleClick={reset} onKeyDown={key} />;
}

function previewShotAt(shots, time, limit) {
  const last = shots.at(-1);
  if (last && time >= last.end && (limit === undefined || limit === last.end)) return last;
  return shots.find((shot) => time >= shot.start && time < shot.end);
}

function usePreviewFrame(player, url, canvasWidth, canvasHeight) {
  const [frame, setFrame] = j.useState(null);
  j.useLayoutEffect(() => {
    const video = player.current;
    if (!video) return;
    const host = video.parentElement;
    function measure() {
      const width = canvasWidth || video.videoWidth;
      const height = canvasHeight || video.videoHeight;
      if (!width || !height) return;
      const bounds = video.getBoundingClientRect();
      const parent = host.getBoundingClientRect();
      const scale = Math.min(bounds.width / width, bounds.height / height);
      const fitWidth = width * scale, fitHeight = height * scale;
      setFrame({width:fitWidth, height:fitHeight,
        left:bounds.left - parent.left + (bounds.width - fitWidth) / 2,
        top:bounds.top - parent.top + (bounds.height - fitHeight) / 2});
    }
    const observer = new ResizeObserver(measure);
    observer.observe(video);
    video.addEventListener('loadedmetadata', measure);
    video.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', measure);
      video.removeEventListener('resize', measure);
    };
  }, [player, url, canvasWidth, canvasHeight]);
  return frame;
}

function ClipPreviewTarget({player, url, canvas, onSelect, selected, disabled}) {
  const frame = usePreviewFrame(player,url,canvas?.width,canvas?.height);
  if (!frame?.width) return null;
  return <button type="button" className="preview-clip-target" style={frame}
    aria-label="选择画面中的镜头" aria-pressed={selected} disabled={disabled}
    onClick={(event) => { event.stopPropagation(); onSelect(); }} />;
}

function drawClipPreview(context, media, canvas, style, motion) {
  const { width, height } = context.canvas;
  context.fillStyle = '#000';
  context.fillRect(0,0,width,height);
  const sx = width / canvas.width, sy = height / canvas.height;
  const vw = media.videoWidth || media.naturalWidth, vh = media.videoHeight || media.naturalHeight;
  const { left, right, top, bottom } = style.crop;
  context.save();
  context.translate(width/2 + (style.x + motion.x*canvas.width)*sx,
                    height/2 + (style.y + motion.y*canvas.height)*sy);
  context.scale(sx,sy);
  context.rotate((style.rotation + motion.angle) * Math.PI / 180);
  context.scale(motion.scale,motion.scale);
  context.beginPath();
  context.rect((left/100 - .5) * style.width, (top/100 - .5) * style.height,
    (1 - (left+right)/100)*style.width, (1 - (top+bottom)/100)*style.height);
  context.clip();
  context.globalAlpha = Math.max(0,Math.min(1,motion.opacity * style.opacity/100));
  const filters = [];
  if (style.brightness !== 100) filters.push('brightness('+style.brightness+'%)');
  if (style.contrast !== 100) filters.push('contrast('+style.contrast+'%)');
  if (style.saturation !== 100) filters.push('saturate('+style.saturation+'%)');
  if (style.hue) filters.push('hue-rotate('+style.hue+'deg)');
  if (style.grayscale) filters.push('grayscale('+style.grayscale+'%)');
  const blur = minEdgeBlur(style,motion)*Math.min(sx,sy)*motion.scale;
  if (blur) filters.push('blur('+blur.toFixed(3)+'px)');
  if (filters.length) context.filter = filters.join(' ');
  context.scale(style.flip_x ? -1 : 1,style.flip_y ? -1 : 1);
  if (style.fit === 'contain') {
    const scale = Math.min(style.width/vw,style.height/vh);
    const imageWidth = vw*scale, imageHeight = vh*scale;
    context.drawImage(media,-imageWidth/2,-imageHeight/2,imageWidth,imageHeight);
  } else {
    const ratio = style.width/style.height;
    const width = Math.min(vw,vh*ratio), height = Math.min(vh,vw/ratio);
    context.drawImage(media,(vw-width)/2,(vh-height)/2,width,height,
      -style.width/2,-style.height/2,style.width,style.height);
  }
  context.restore();
}

function minEdgeBlur(style,motion) {
  return Math.min(style.width,style.height) * ((style.soft_focus || 0)*.00024 + motion.blur);
}

function ClipComposition({ player, url, project, editor, selected, handles, disabled, library, time, transport, enabled }) {
  const { canvas } = project;
  const shots = project.timeline || project.shots;
  const frame = usePreviewFrame(player, url, canvas.width, canvas.height);
  const plane = j.useRef(null);
  const alternate = j.useRef(null);
  const refresh = j.useRef(null);
  const live = j.useRef({});
  const [playing, setPlaying] = j.useState(false);
  const [notice, setNotice] = j.useState('');
  live.current = { canvas, shots, editor, library, transport, enabled, layers:project.timeline_video };
  const pixels = Math.min(2,window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round((frame?.width || 1) * pixels));
  const height = Math.max(1, Math.round((frame?.height || 1) * pixels));

  j.useLayoutEffect(() => {
    const master = player.current;
    const replacement = alternate.current;
    const context = plane.current?.getContext('2d', { alpha:false });
    if (!master || !replacement || !context) return;
    let urlInUse = '';
    let request = 0;
    let lastPaint = null;
    let currentNotice = '';
    let plan = {};
    const stills = new Map();

    function alignAlternate(next, position, playing, speed) {
      if (next !== urlInUse) {
        replacement.pause();
        urlInUse = next;
        if (next) {
          replacement.src = next;
        } else {
          replacement.removeAttribute('src');
          replacement.load();
        }
      }
      if (!next || replacement.readyState < 2 || replacement.error) return false;
      const duration = replacement.duration;
      if (!Number.isFinite(duration) || duration <= 0 || !replacement.videoWidth) return false;
      const maximum = Math.max(0,duration - .025);
      const desired = Math.min(maximum,position);
      const continuePlaying = playing && desired < maximum;
      if (!replacement.seeking && Math.abs(replacement.currentTime-desired) > (continuePlaying ? .14 : .018)) {
        replacement.currentTime = desired;
      }
      if (continuePlaying) {
        replacement.playbackRate = master.playbackRate * speed;
        if (replacement.paused) replacement.play().catch(() => {});
      } else {
        replacement.pause();
      }
      return !replacement.seeking && replacement.readyState >= 2;
    }

    function stillFrame(url) {
      if (!url) return null;
      if (!stills.has(url)) {
        const image = new Image();
        image.onload = schedule;
        image.src = url;
        stills.set(url,image);
      }
      const image = stills.get(url);
      return image.complete && image.naturalWidth ? image : null;
    }

    function paint() {
      request = 0;
      const state = live.current;
      const active = state.transport?.active ? state.transport.playing : !master.paused && !master.ended;
      if (active) schedule();
      const clock = state.transport?.active ? state.transport.current() : master.currentTime;
      const limit = state.transport?.active ? state.transport.duration : state.shots.at(-1)?.end || 0;
      const time = Math.min(clock,Math.max(0,limit - .0001));
      const shot = previewShotAt(state.shots,time,limit);
      const layer = state.enabled ? layerAtTime(state.layers,time) : null;
      const displayed = layer || shot;
      const style = (state.enabled && displayed && state.editor.read(displayed)) || state.canvas.defaults;
      const position = displayed ? Math.max(0,time-displayed.start) : 0;
      const imported = shot?.type === 'media';
      const replaced = state.enabled && shot?.replacement;
      const next = (layer ? layer.url : replaced || (imported && shot.media_url)) || '';
      const fit = layer ? layer.fit_duration : replaced && (shot.original_duration || shot.duration);
      const speed = fit && Number.isFinite(replacement.duration)
        ? Math.max(.8,Math.min(3,replacement.duration / fit)) : 1;
      const first = layer ? layer.media_first ?? layer.first : shot?.first || 0;
      const nextPosition = (first+position)*speed;
      const masterReady = !master.seeking && master.readyState>=2 && master.videoWidth &&
        (!state.transport?.active || state.transport.hasFrame());
      const useAlternate = alignAlternate(next,nextPosition,active && (layer || imported || !shot || masterReady),speed);
      const medium = useAlternate ? replacement : shot && !imported && !layer && masterReady ? master :
        stillFrame(state.enabled && displayed?.replacement ? displayed.replacement_thumb || displayed.thumb : displayed?.thumb);
      let message = '';
      if (state.enabled && !layer && shot?.replacement_name && !useAlternate) {
        if (!shot.replacement) message = '替换素材已移动，显示原片';
        else if (replacement.error) message = '替换素材无法预览，显示原片';
        else if (replacement.readyState < 2) message = '正在载入替换素材…';
      }
      if (message !== currentNotice) {
        currentNotice = message;
        setNotice(message);
      }
      const previous = lastPaint;
      if (!medium) {
        if (!displayed && previous) {
          context.fillStyle = '#000';
          context.fillRect(0,0,context.canvas.width,context.canvas.height);
          lastPaint = null;
        }
        return;
      }
      if (!useAlternate && next && replacement.seeking && previous?.medium === replacement) return;
      const frameTime = medium.currentTime;
      if (previous && previous.medium === medium && previous.frameTime === frameTime && previous.time === time &&
          previous.style === style && previous.width === context.canvas.width && previous.height === context.canvas.height) return;
      if (plan.style !== style || plan.shot !== displayed?.id || plan.library !== state.library) {
        plan = {style,shot:displayed?.id,library:state.library,timeline:motionTimeline(style,displayed?.duration,state.library)};
      }
      drawClipPreview(context, medium, state.canvas, style, motionAt(plan.timeline,position));
      lastPaint = {medium, frameTime, time, style, width:context.canvas.width, height:context.canvas.height};
    }

    function schedule() {
      if (!request) request = requestAnimationFrame(paint);
    }
    function syncPlay() {
      setPlaying(!master.paused && !master.ended);
      if (master.paused || master.ended) replacement.pause();
      schedule();
    }

    const events = ['loadeddata','seeked','timeupdate','ratechange','resize'];
    events.forEach((event) => master.addEventListener(event,schedule));
    const playingEvents = ['play','pause','ended'];
    playingEvents.forEach((event) => master.addEventListener(event,syncPlay));
    const replacementEvents = ['loadeddata','seeked','error'];
    replacementEvents.forEach((event) => replacement.addEventListener(event,schedule));
    refresh.current = schedule;
    syncPlay();
    return () => {
      cancelAnimationFrame(request);
      events.forEach((event) => master.removeEventListener(event,schedule));
      playingEvents.forEach((event) => master.removeEventListener(event,syncPlay));
      replacementEvents.forEach((event) => replacement.removeEventListener(event,schedule));
      replacement.pause();
      replacement.removeAttribute('src');
      replacement.load();
      refresh.current = null;
    };
  }, [player, url]);
  j.useLayoutEffect(() => { refresh.current?.(); });

  const selectedStyle = selected && editor.read(selected);
  const drawing = handles && selectedStyle && motionAt(motionTimeline(selectedStyle,selected.duration,library),time-selected.start);
  return <>
    <video ref={alternate} className="composition-input" aria-hidden="true" tabIndex={-1}
      preload="auto" playsInline muted />
    <div className="composition-preview" style={frame || { visibility:'hidden' }}>
      <canvas ref={plane} width={width} height={height} aria-label="剪辑画面" />
      {notice && <div className="composition-notice" role="status">{notice}</div>}
    </div>
    {frame && handles && selected && !disabled && !playing && <ClipPreviewHandles key={selected.id}
      frame={frame} style={selectedStyle} motion={drawing} canvas={canvas}
      onChange={(patch) => editor.update(selected,patch)} />}
  </>;
}

function ClipPreviewHandles({ frame, style, canvas, motion, onChange }) {
  const drag = j.useRef(null);
  const clamp = (key, value) => Math.round(Math.max(canvas.limits[key][0],Math.min(canvas.limits[key][1],value)));
  const { crop } = style;
  const rotation = style.rotation+motion.angle;
  const sx = frame.width / canvas.width, sy = frame.height / canvas.height;
  const width = style.width * sx * motion.scale * (1-(crop.left+crop.right)/100);
  const height = style.height * sy * motion.scale * (1-(crop.top+crop.bottom)/100);
  const x = frame.width/2 + (style.x+motion.x*canvas.width)*sx;
  const y = frame.height/2 + (style.y+motion.y*canvas.height)*sy;
  const shiftX = style.width * motion.scale * (crop.left-crop.right)/200;
  const shiftY = style.height * motion.scale * (crop.top-crop.bottom)/200;
  const angle = rotation * Math.PI / 180;
  const centerX = x + (shiftX*Math.cos(angle)-shiftY*Math.sin(angle))*sx;
  const centerY = y + (shiftX*Math.sin(angle)+shiftY*Math.cos(angle))*sy;
  function begin(event) {
    if (event.button !== 0 || drag.current) return;
    const bounds = event.currentTarget.parentElement.getBoundingClientRect();
    drag.current = {
      id:event.pointerId, scale:event.target.hasAttribute('data-clip-scale'), style,
      startX:event.clientX, startY:event.clientY,
      dx:event.clientX - bounds.left - x, dy:event.clientY - bounds.top - y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function move(event) {
    const item = drag.current;
    if (!item || event.pointerId !== item.id) return;
    const dx = event.clientX - item.startX, dy = event.clientY - item.startY;
    if (item.scale) {
      let scale = 1 + (dx*item.dx + dy*item.dy)/Math.max(1,item.dx**2+item.dy**2);
      scale = Math.max(Math.max(2/item.style.width,2/item.style.height),
        Math.min(scale,canvas.limits.width[1]/item.style.width,canvas.limits.height[1]/item.style.height));
      onChange({width:clamp('width',item.style.width*scale),height:clamp('height',item.style.height*scale)});
    } else {
      onChange({ x:clamp('x',item.style.x+dx*canvas.width/frame.width),
                 y:clamp('y',item.style.y+dy*canvas.height/frame.height) });
    }
  }
  function end(event) {
    if (event.pointerId === drag.current?.id) drag.current = null;
  }
  return <div className="clip-handle-plane" style={frame}>
    <div className="clip-preview-handles" style={{width,height,left:centerX,top:centerY,
      transform:'translate(-50%, -50%) rotate('+rotation+'deg)'}}
      role="group" aria-label="画面拖动和缩放" onPointerDown={begin} onPointerMove={move} onPointerUp={end}
      onPointerCancel={end} onLostPointerCapture={end}>
      {['nw','ne','sw','se'].map((corner) => <span key={corner} aria-hidden="true"
        className={'clip-scale-handle clip-scale-'+corner} data-clip-scale={corner} title="拖动缩放镜头" />)}
    </div>
  </div>;
}
