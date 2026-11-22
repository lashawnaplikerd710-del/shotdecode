function timelineRulerTicks(duration, width, density, precise) {
  const labelWidth = text => text.length * 7 + 3;
  const labelGap = 6;
  const capacity = width / (labelWidth(kt(duration, precise)) + labelGap);
  let nextLabelStart = 0;
  return bN(duration, Math.min(density, Math.max(1, capacity) / 7)).map(time => {
    const text = kt(time, precise);
    const tickX = time / duration * width;
    const span = labelWidth(text);
    const alignRight = tickX + span > width;
    const start = alignRight ? tickX - span : tickX;
    const showLabel = start >= nextLabelStart;
    if (showLabel) nextLabelStart = start + span + labelGap;
    return {time, alignRight, label: showLabel ? text : ''};
  });
}

function TimelineEditActions({ editor }) {
  return <div className="timeline-edit-actions" role="group" aria-label="时间线剪辑">
    <D kind="ghost" icon={Xl} disabled={!editor.canSplit} aria-keyshortcuts="Control+B"
      title="在播放头分割（Ctrl+B）" onClick={editor.split}>分割</D>
    <D kind="ghost" disabled={!editor.canDelete} aria-keyshortcuts="Backspace Delete"
      title="删除所选片段（Backspace）" onClick={editor.remove}>删除</D>
    {editor.setMagnet && <>
      <D kind="ghost" className="timeline-option" aria-pressed={editor.magnetic}
        title="开关主轨磁吸。开启时让分镜首尾相接。" disabled={editor.disabled}
        onClick={editor.setMagnet}>主轨磁吸</D>
      <D kind="ghost" className="timeline-option" aria-pressed={editor.snapping}
        title="拖动时对齐附近的片段边缘和播放头。" disabled={editor.disabled}
        onClick={editor.toggleSnap}>自动吸附</D>
    </>}
  </div>;
}

function timelineEditShortcut(event, editor, dragging) {
  if (dragging || event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 ||
      event.repeat || event.metaKey || event.altKey ||
      event.target.closest('select, [role=listbox], [role=menu], [role=dialog]') ||
      isEditingText(event.target)) return;
  if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'b' && editor.canSplit) {
    event.preventDefault();
    editor.split();
  } else if (!event.ctrlKey && !event.shiftKey && ['Backspace','Delete'].includes(event.key) && editor.canDelete) {
    event.preventDefault();
    editor.remove();
  }
}

function timelineMs(value) {
  return Math.round(value * 1000) / 1000;
}

function timelineInterval(item) {
  return { id:item.id, start:item.start, end:item.end ?? timelineMs(item.start + item.last - item.first) };
}

function timelineBoundaries(item, occupied, limit) {
  let before = 0, after = limit;
  for (const peer of occupied) {
    if (peer.end <= item.start) before = Math.max(before,peer.end);
    if (peer.start >= item.end) after = Math.min(after,peer.start);
  }
  return {before,after};
}

function timelinePlacementStart(target, length, occupied, limit) {
  let cursor = 0, choice = null, distance = Infinity;
  const ranges = occupied.filter(peer=>peer.start<limit).sort((a,b)=>a.start-b.start);
  for (const {start,end} of [...ranges,{start:limit,end:limit}]) {
    const last = timelineMs(start-length);
    if (cursor <= last) {
      const candidate = Math.min(last,Math.max(cursor,target));
      const shift = timelineMs(Math.abs(candidate-target));
      if (shift === 0) return candidate;
      if (shift < distance) {
        choice = candidate;
        distance = shift;
      }
    }
    cursor = Math.max(cursor,end);
  }
  return choice;
}

function timelineTrimRange(bounds, edge, delta, limit) {
  const between = (value, min, max) => Math.min(Math.max(value, min), max);
  const {first, last, start, minFirst, maxLast, minLength} = bounds;
  if (edge === 'move') return {first,last,start:timelineMs(between(start + delta, 0, limit - (last-first)))};
  const nextFirst = edge === 'start' ? timelineMs(between(first + delta, minFirst, last - minLength)) : first;
  return {
    first: nextFirst,
    last: edge === 'end' ? timelineMs(between(last + delta, first + minLength, maxLast)) : last,
    start: timelineMs(Math.max(0, start + nextFirst - first)),
  };
}

function timelineMagneticLayout(clips, id, edge, range) {
  const length = timelineMs(range.last-range.first);
  const changed = {id,duration:length};
  let order = clips.map(clip=>clip.id===id ? changed : clip);
  if (edge === 'move') {
    order = clips.filter(clip=>clip.id!==id);
    let target = 0, start = 0;
    for (const clip of order) {
      if (range.start < start+clip.duration/2) break;
      target++;
      start = timelineMs(start+clip.duration);
    }
    order.splice(target,0,changed);
  }
  let start = 0;
  return new Map(order.map((clip,index)=>{
    const placement = {start,end:timelineMs(start+clip.duration),position:index+1};
    start = placement.end;
    return [clip.id,placement];
  }));
}

function timelineDragPlan(bounds, edge, delta, { id, peers, editor, main, tolerance = 0, limit = 100000 }) {
  const magnetic = main && editor.magnetic;
  const occupied = peers.filter(peer=>peer.id!==id).map(timelineInterval);
  const anchor = timelineMs(bounds.start - bounds.first);
  const edges = (range) => [range.start,timelineMs(range.start+range.last-range.first)];
  const original = {start:bounds.start,end:edges(bounds)[1]};
  const {before,after} = timelineBoundaries(original,occupied,limit);
  const trim = magnetic ? bounds : {...bounds,minFirst:Math.max(bounds.minFirst,timelineMs(before-anchor)),
    maxLast:Math.min(bounds.maxLast,timelineMs(after-anchor))};
  function resolve(shift) {
    const range = timelineTrimRange(trim,edge,shift,limit);
    if (edge === 'move' && !magnetic) {
      range.start = timelinePlacementStart(range.start,timelineMs(range.last-range.first),occupied,limit);
      if (range.start === null) return null;
    }
    return range;
  }
  let range = resolve(delta), guide = null;
  if (!range) return null;
  if (editor.snapping && tolerance > 0) {
    const wanted = edges(timelineTrimRange(bounds,edge,delta,limit));
    const candidates = [];
    for (const point of editor.snapPoints) {
      if (point.id === id) continue;
      for (const side of edge === 'move' ? [0,1] : [edge === 'start' ? 0 : 1]) {
        const shift = point.time - wanted[side];
        if (Math.abs(shift) <= tolerance) candidates.push({point,shift,side});
      }
    }
    const sameLane = new Set(occupied.map(peer=>peer.id));
    candidates.sort((a,b)=>Number(sameLane.has(b.point.id))-Number(sameLane.has(a.point.id)) ||
      Math.abs(a.shift)-Math.abs(b.shift));
    for (const {point,shift,side} of candidates) {
      const snapped = resolve(delta+shift);
      if (!snapped || Math.abs(edges(snapped)[side]-point.time) > .0005) continue;
      range = snapped;
      guide = point.time;
      break;
    }
  }
  const clips = magnetic ? timelineMagneticLayout(editor.mainClips,id,edge,range) : null;
  if (clips && guide !== null) guide = edge === 'end' ? clips.get(id).end : clips.get(id).start;
  return {range,clips,guide};
}

function timelineSnapPoints(clips, tracks, audio, video, captions, time) {
  const points = [{time:0},{time:timelineMs(time)}];
  for (const item of [...clips,...tracks.flatMap(track=>track.items || []),...audio,...video,...captions]) {
    const {id,start,end} = timelineInterval(item);
    points.push({id,time:timelineMs(start)},{id,time:timelineMs(end)});
  }
  return points;
}

function timelineDropTarget(item, editor, kind) {
  const row = document.elementFromPoint(item.point.x,item.point.y)?.closest('[data-timeline-lane]');
  if (row === item.row) return {row};
  if (!row || !item.track.contains(row) || !kind) return null;
  const lane = row.dataset.timelineLane;
  if (lane === 'new-track') return {row,lane,peers:[]};
  const target = editor.laneById.get(lane);
  return target?.kind === kind ? {row,lane,peers:target.items} : null;
}

function sourceTimelineLane(track) {
  return 'source:'+track.id+':'+(track.row || 0);
}

function scrollTimelineAtPointer({point,content,panel}) {
  const bounds = content.getBoundingClientRect();
  const panelBounds = panel.getBoundingClientRect();
  const top = Math.max(bounds.top,panelBounds.top + panel.querySelector('.timeline-head').offsetHeight);
  const bottom = Math.min(bounds.bottom,panelBounds.bottom);
  if (point.x < bounds.left || point.x >= bounds.right || point.y < top || point.y >= bottom) return false;
  function velocity(position, first, last) {
    const zone = Math.min(30,(last-first)/3);
    if (position < first + zone) return -Math.ceil((first + zone - position)*.5);
    if (position > last - zone) return Math.ceil((position - last + zone)*.5);
    return 0;
  }
  const left = content.scrollLeft, y = panel.scrollTop;
  content.scrollLeft += velocity(point.x,bounds.left,bounds.right);
  const captions = document.elementFromPoint(point.x,point.y)?.closest('.manual-caption-lane');
  if (captions) {
    const rowBounds = captions.getBoundingClientRect();
    const before = captions.scrollTop;
    captions.scrollTop += velocity(point.y,Math.max(top,rowBounds.top),Math.min(bottom,rowBounds.bottom));
    if (before !== captions.scrollTop) return true;
  }
  panel.scrollTop += velocity(point.y,top,bottom);
  return left !== content.scrollLeft || y !== panel.scrollTop;
}

function useTimelineDrag({ id, bounds, duration, editor, peers, main, kind, limit, ghost, select, commit, step }) {
  const drag = j.useRef(null);
  const [draft, updateDraft] = j.useState(null);
  const pending = draft?.range || bounds;
  const {disabled,pause,setDragPreview} = editor;

  function preview(plan, floating = null) {
    updateDraft(plan || floating ? {range:plan?.lane ? null : plan?.range,floating:!!floating} : null);
    setDragPreview(plan || floating ? {guide:plan?.guide,clips:plan?.clips,slot:plan?.slot,floating} : null);
  }

  async function finish(edge, plan) {
    const range = plan?.range;
    const changed = range && (plan.lane || Object.keys(range).some(key=>range[key] !== bounds[key]));
    if (!changed) {
      preview(null);
      return select();
    }
    preview(edge === 'move' ? {...plan,slot:null,guide:null} : plan);
    try {
      const save = plan.lane ? {...range,lane:plan.lane} : range;
      return await commit(save, edge === 'move' ? 'move' : 'trim', edge);
    } finally {
      preview(null);
    }
  }

  function stop(item) {
    drag.current = null;
    cancelAnimationFrame(item.frame);
    item.cleanup();
  }

  function cancel() {
    const item = drag.current;
    if (!item) return;
    stop(item);
    if (item.element.hasPointerCapture(item.id)) item.element.releasePointerCapture(item.id);
    preview(null);
  }

  j.useEffect(() => () => {
    if (drag.current) stop(drag.current);
  }, []);
  j.useEffect(() => {
    if (disabled) cancel();
  }, [disabled]);

  function placement(item) {
    const moving = item.edge === 'move';
    const target = moving ? timelineDropTarget(item,editor,kind) : {row:item.row};
    if (!target) return null;
    const track = item.track.getBoundingClientRect();
    const scale = item.duration/track.width;
    const shift = (item.point.x-track.left-item.offset)*scale;
    const plan = timelineDragPlan(item.bounds,item.edge,shift,{id,peers:target.peers || peers,
      editor,main:target.lane ? target.lane === 'main' : main,limit,tolerance:Math.min(.22,8*scale)});
    if (!plan) return null;
    if (!moving) return plan;
    const row = target.row.getBoundingClientRect();
    const start = plan.clips?.get(id).start ?? plan.range.start;
    return {...plan,lane:target.lane,slot:{start,end:timelineMs(start+plan.range.last-plan.range.first),
      top:row.top-track.top+(target.lane ? 2 : item.inset),
      height:target.lane ? row.height-4 : item.height}};
  }

  function queuePreview(item) {
    if (item.frame) return;
    item.frame = requestAnimationFrame(() => {
      item.frame = 0;
      if (drag.current !== item) return;
      const scrolling = scrollTimelineAtPointer(item);
      const plan = placement(item);
      const floating = item.edge === 'move' ? {...ghost,height:item.height,width:item.width,
        x:item.point.x-item.grabX,y:item.point.y-item.grabY,valid:!!plan} : null;
      preview(plan,floating);
      if (scrolling) queuePreview(item);
    });
  }

  function handle(edge) {
    return {
      onPointerDown(event) {
        if (disabled || event.button !== 0 || !event.isPrimary || drag.current) return;
        const element = event.currentTarget;
        const row = element.closest('[data-timeline-lane]');
        const track = row?.closest('.track');
        if (!track) return;
        const box = element.closest('[data-timeline-clip]').getBoundingClientRect();
        const point = {x:event.clientX,y:event.clientY};
        const width = Math.min(440,Math.max(24,box.width));
        event.preventDefault();
        event.stopPropagation();
        element.focus({preventScroll:true});
        element.setPointerCapture(event.pointerId);

        function cancelGesture(key) {
          if (key.key !== 'Escape' && !(drag.current?.moved && key.ctrlKey && key.key.toLowerCase() === 'z')) return;
          key.preventDefault();
          key.stopPropagation();
          cancel();
        }
        window.addEventListener('keydown',cancelGesture,true);
        window.addEventListener('blur',cancel);
        drag.current = {id:event.pointerId,edge:event.target.dataset.edge || edge,element,row,track,bounds,duration,
          content:track.parentElement,panel:track.closest('.timeline'),point,initial:point,frame:0,moved:false,
          offset:point.x-track.getBoundingClientRect().left,inset:box.top-row.getBoundingClientRect().top,
          width,height:box.height,grabX:(point.x-box.left)*width/box.width,grabY:point.y-box.top,
          cleanup:()=>{
            window.removeEventListener('keydown',cancelGesture,true);
            window.removeEventListener('blur',cancel);
          }};
      },
      onPointerMove(event) {
        const item = drag.current;
        if (!item || item.id !== event.pointerId || disabled) return;
        if (!item.moved) {
          const x = Math.abs(event.clientX-item.initial.x);
          const y = item.edge === 'move' ? Math.abs(event.clientY-item.initial.y) : 0;
          if (Math.max(x,y) < 3) return;
          item.moved = true;
          pause();
        }
        item.point = {x:event.clientX,y:event.clientY};
        queuePreview(item);
      },
      onPointerUp(event) {
        const item = drag.current;
        if (!item || item.id !== event.pointerId) return;
        stop(item);
        item.point = {x:event.clientX,y:event.clientY};
        const plan = item.moved && !disabled ? placement(item) : null;
        if (disabled || (item.moved && !plan)) preview(null);
        else void finish(item.edge,plan);
      },
      onPointerCancel: event=>{ if (drag.current?.id === event.pointerId) cancel(); },
      onLostPointerCapture: event=>{ if (drag.current?.id === event.pointerId) cancel(); },
      onKeyDown(event) {
        if (disabled || event.ctrlKey || event.altKey || event.metaKey || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        if (edge === 'move' && step && editor.magnetic) return step(direction);
        const delta = direction * (event.shiftKey ? .25 : .05);
        pause();
        void finish(edge,timelineDragPlan(bounds,edge,delta,{id,peers,editor,main,limit}));
      },
    };
  }

  return { ...pending,end:timelineMs(pending.start+pending.last-pending.first),trimming:!!draft && !draft.floating,
    moving:!!draft?.floating,handle };
}

function TimelineEdgeGrips({ gesture, selected, disabled }) {
  if (disabled) return null;
  return ['start','end'].map(edge => {
    const label = edge === 'start' ? '拖动左端修剪' : '拖动右端修剪';
    return <button key={edge} type="button" className={'timeline-trim-grip ' + edge}
      tabIndex={selected ? 0 : -1} aria-label={label} title={label}
      aria-keyshortcuts="ArrowLeft ArrowRight" {...gesture.handle(edge)} />;
  });
}

function timelineClipStyle(start, end, duration) {
  const left = Math.max(0,start / duration * 100);
  return {left:left+'%', width:Math.max(0, Math.min(100-left,(end-start)/duration*100))+'%'};
}

function TimelineDragOverlay({ preview, duration }) {
  const {slot,floating} = preview || {};
  return <>
    {slot && <div aria-hidden="true" className="timeline-drop-slot" style={{
      ...timelineClipStyle(slot.start,slot.end,duration),top:slot.top,height:slot.height,
    }} />}
    {floating && jA.createPortal(
      <div aria-hidden="true" className={'timeline-drag-ghost '+floating.type+(floating.valid ? '' : ' blocked')}
        style={{transform:'translate3d('+floating.x+'px,'+floating.y+'px,0)',width:floating.width,height:floating.height}}>
        {floating.shot && <ShotThumbnail shot={floating.shot}/>}
        {floating.waveform && <TimelineWaveform waveform={floating.waveform}
          first={floating.first} last={floating.last}/>}
        <span>{floating.label}</span>
      </div>,document.body)}
  </>;
}

function LN({ shot, position, duration, selected, playing, select, importFile, editor }) {
  const [drop, setDrop] = j.useState(false);
  const bounds = {start:shot.start, first:shot.first ?? 0, last:shot.last ?? shot.duration,
    minFirst:0, maxLast:shot.original_duration ?? shot.duration, minLength:Math.min(shot.duration,editor.videoMinimum)};
  const label = labelText(shot.label);
  const gesture = useTimelineDrag({id:shot.id,bounds,duration,editor,peers:editor.mainClips,main:true,
    kind:'video',
    ghost:{type:'video',shot,label:String(position).padStart(2,'0')+' · '+label},
    select:()=>select(shot),commit:(range,operation)=>editor.editVideo(shot,operation,range),
    step:direction=>editor.stepVideo(shot,direction)});
  const placed = editor.dragClips?.get(shot.id) || gesture;
  const index = placed.position || position;
  return <div data-timeline-clip className={'timeline-editable-item timeline-video-item' + (selected ? ' selected' : '') +
      (gesture.trimming ? ' trimming' : '') + (gesture.moving ? ' timeline-drag-origin' : '')}
    style={timelineClipStyle(placed.start,placed.end,duration)}>
    <button type="button" className={'shot-clip timeline-movable' + (selected ? ' selected' : '') + (playing ? ' playing' : '') + (drop ? ' drop-target' : '')}
      aria-label={labelText('定位镜头 {0}',position)} aria-pressed={selected} aria-keyshortcuts="ArrowLeft ArrowRight Backspace Delete" disabled={editor.disabled}
      data-shot={shot.id} title={labelText('镜头 {0}',position)+' · '+label+' · '+kt(gesture.start,true)}
      onClick={event=>{ if (!event.detail) select(shot); }} {...gesture.handle('move')}
      {...bM(file=>importFile(file,shot),setDrop)}>
      <ShotThumbnail shot={shot}/>
      <span className="clip-index">{String(index).padStart(2,'0')}</span>
      <span className="clip-title">{shot.replacement_name ? '已替换' : label}</span>
    </button>
    <TimelineEdgeGrips gesture={gesture} selected={selected} disabled={editor.disabled}/>
  </div>;
}

function TimelineMediaClip({ item, duration, editor, peers, open, kind, waveform, sourceTrack }) {
  const video = kind==='video';
  const type = sourceTrack ? 'source-audio' : video ? 'video-layer' : 'audio';
  const selected = editor.target?.kind===type && editor.target.id===item.id;
  const bounds = {start:item.start,first:item.first,last:item.last,
    minFirst:Math.max(0,item.first-item.start),maxLast:Math.min(item.original_duration ?? item.duration,item.first+100000-item.start),
    minLength:Math.min(.04,item.last-item.first)};
  const ownWaveform = useItemWaveform(item.waveform);
  const peaks = item.waveform ? ownWaveform : waveform;
  const gesture = useTimelineDrag({id:item.id,bounds,duration,editor,peers,
    kind,ghost:{type:kind,label:item.name,shot:video ? item : undefined,waveform:peaks,first:item.first,last:item.last},
    select:()=>editor.selectMedia(item,type),commit:(range,operation)=>editor.editMedia(item,type,operation,range)});
  const style = sourceTrack ? 'source-waveform-clip' : video ? 'timeline-layer-clip' : 'timeline-audio-clip';
  return <div data-timeline-clip className={'timeline-editable-item ' + (sourceTrack ? 'timeline-source-item' : 'timeline-audio-item') +
      (selected ? ' selected' : '') + (gesture.trimming ? ' trimming' : '') + (gesture.moving ? ' timeline-drag-origin' : '')}
    style={timelineClipStyle(gesture.start,gesture.end,duration)}>
    <button type="button" className={style+' timeline-movable'} aria-label={item.name}
      title={item.name+' · '+kt(gesture.start,true)+' – '+kt(gesture.end,true)}
      data-audio-id={video || sourceTrack ? undefined : item.id} data-video-layer={video ? item.id : undefined}
      data-source-clip={sourceTrack ? item.id : undefined}
      aria-pressed={selected} aria-keyshortcuts="ArrowLeft ArrowRight Backspace Delete" disabled={editor.disabled}
      onClick={event=>{ if (!event.detail) editor.selectMedia(item,type); }}
      onDoubleClick={!video && !sourceTrack && open ? ()=>open(item.id) : undefined} {...gesture.handle('move')}>
      {sourceTrack ? <TimelineWaveform waveform={peaks} first={gesture.first} last={gesture.last} />
        : <>{video ? j.createElement($t,{size:12}) : <Xa size={12}/>}<span>{item.name}</span></>}
    </button>
    <TimelineEdgeGrips gesture={gesture} selected={selected} disabled={editor.disabled}/>
  </div>;
}

function useItemWaveform(url) {
  const [result,setResult] = j.useState(null);
  j.useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetch(url,{signal:controller.signal}).then(response=>response.ok ? response.json() : null)
      .then(data=>{ if (data && !controller.signal.aborted) setResult({url,data}); }).catch(()=>{});
    return () => controller.abort();
  },[url]);
  return result?.url === url ? result?.data : null;
}

function observeTimelineWaveform(canvas, draw) {
  const resize = new ResizeObserver(draw);
  resize.observe(canvas);
  const theme = new MutationObserver(draw);
  theme.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  draw();
  return () => {
    resize.disconnect();
    theme.disconnect();
  };
}

function TimelineWaveform({ waveform, first, last }) {
  const canvas = j.useRef(null);
  j.useEffect(() => {
    if (!waveform?.available) return;
    const node = canvas.current;
    const offset = Math.floor(first / waveform.interval);
    const count = Math.ceil(last / waveform.interval) - offset;
    const segment = {...waveform, peaks:waveform.peaks.slice(offset, offset + count)};
    return observeTimelineWaveform(node, () => gN(node,segment,last-first));
  }, [waveform,first,last]);
  return waveform?.available ? <canvas className="audio-waveform" ref={canvas} aria-hidden="true" /> : null;
}

function splitTimelineAudioRows(tracks) {
  return tracks.flatMap(track=>track.rows ? track.rows.map((items,row)=>({
    ...track,items,row,
  })) : [track]);
}

function timelineAudioLabel(track) {
  const label = labelText(track.label);
  return track.row == null ? label : label + ' ' + (track.row + 1);
}

function SourceAudioTimeline({ track, waveform, ready, duration, muted, editor, seek }) {
  const label = timelineAudioLabel(track);
  return <div className={'audio-lane audio-editable-lane audio-lane--' + track.id + (muted ? ' audio-muted' : '')}
    aria-label={label} data-track={track.id} data-waveform={ready} data-audio-row={track.row || 0}
    data-timeline-lane={sourceTimelineLane(track)}
    onClick={event => {
      if (event.target !== event.currentTarget || editor.disabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      seek((event.clientX - rect.left) / rect.width * duration);
    }}>
    {track.items.map(item => <TimelineMediaClip key={item.id} sourceTrack={track.id} waveform={waveform}
      item={{...item,name:item.name || label}} duration={duration} editor={editor} peers={track.items} kind="audio" />)}
  </div>;
}

function EmptyTimelinePreview() {
  return <div className="timeline-preview-pending"><Xl size={25}/><p>分镜轨道为空。</p></div>;
}
