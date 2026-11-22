function useSpacePlayback(enabled, toggle) {
  const action = j.useRef(toggle);
  action.current = toggle;
  j.useEffect(() => {
    if (!enabled) return;
    function handle(event) {
      if (event.code !== 'Space' || event.defaultPrevented || event.isComposing || event.keyCode === 229 ||
          event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = event.composedPath().find(node => node instanceof Element);
      if (isEditingText(target) || target?.closest(
        'select, [role=dialog], [role=menu], [role=listbox], [role=combobox], .agent-panel, .agent-picker-menu, .agent-option-flyout'
      )) return;
      if (target?.closest('button:focus-visible') && !target.closest('.timeline-editable-item, .manual-caption-clip')) return;
      event.preventDefault();
      if (!event.repeat) action.current();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [enabled]);
}

function sourceMoment(clips, time, limit) {
  const clip = previewShotAt(clips,time,limit);
  if (!clip || clip.type === 'media') return {clip:null,time:null};
  const local = Math.max(0,Math.min(time-clip.start,clip.duration-.001));
  return {clip,time:(clip.source_start ?? clip.start)+local};
}

function layerAtTime(layers, time) {
  return layers?.findLast(clip=>clip.start<=time && time<clip.start+clip.last-clip.first);
}

function useLiveTimeline({ enabled, player, project, source, onTime, tracks, mix }) {
  const clips = project?.timeline || project?.shots || [];
  const active = Boolean(enabled && source?.url && (clips.length || project?.timeline_video?.length));
  const duration = source?.duration || 0;
  const [playing,setPlaying] = j.useState(false);
  const [volume,setVolume] = j.useState(1);
  const [muted,setMuted] = j.useState(false);
  const [originalMuted,setOriginalMuted] = j.useState(false);
  const [rate,setRate] = j.useState(1);
  const model = j.useRef(null);
  model.current = {active,clips,project,tracks,mix,volume,muted,originalMuted,rate,duration,onTime};
  const clock = j.useRef({ time:0, clip:null, desired:null, playing:false, rangeEnd:null, scope:null, lastUpdate:0, gapTick:0 });
  const scheduler = j.useRef(null);
  const audio = j.useRef(new Map());

  function align() {
    const video = player.current, cursor = clock.current;
    if (cursor.desired === null || !video?.readyState || video.seeking) return;
    const target = Math.min(cursor.desired,Number.isFinite(video.duration) ? video.duration : cursor.desired);
    if (Math.abs(video.currentTime-target)>.006) video.currentTime = target;
    else cursor.desired = null;
  }

  function publish(time, force = false) {
    const cursor = clock.current;
    cursor.time = time;
    if (!force && performance.now()-cursor.lastUpdate < 34) return;
    cursor.lastUpdate = performance.now();
    model.current.onTime(time);
  }

  function seek(time) {
    const current = model.current, cursor = clock.current;
    const next = Math.max(0,Math.min(current.duration,time));
    const moment = sourceMoment(current.clips,next,current.duration);
    cursor.clip = moment.clip;
    cursor.desired = moment.time;
    cursor.gapTick = performance.now();
    publish(next,true);
    align();
    if (!moment.clip) player.current?.pause();
    else if (cursor.playing) resumeVideo();
    scheduler.current?.();
  }

  function pause() {
    const cursor = clock.current;
    cursor.playing = false;
    cursor.rangeEnd = null;
    player.current?.pause();
    for (const {media} of audio.current.values()) media.pause();
    setPlaying(false);
    publish(cursor.time,true);
  }

  function play(end = null) {
    const video = player.current, current = model.current, cursor = clock.current;
    if (!video || !current.active) return;
    if (cursor.time >= current.duration-.001) seek(0);
    cursor.playing = true;
    cursor.rangeEnd = end;
    cursor.gapTick = performance.now();
    setPlaying(true);
    resumeVideo();
    scheduler.current?.();
  }

  function resumeVideo() {
    const video = player.current;
    if (!video?.paused || !clock.current.clip) return;
    video.play().catch(() => {
      if (player.current===video && video.paused && !video.seeking && clock.current.playing && clock.current.clip) pause();
    });
  }

  function previewMix(video) {
    const { tracks, mix, project, volume, muted, originalMuted, rate } = model.current;
    const cursor = clock.current;
    const master = muted ? 0 : volume;
    const original = mix?.original;
    const originalTrack = tracks?.find(track=>track.id==='original');
    video.volume = master*(original?.volume ?? 100)/100;
    video.muted = !cursor.clip || originalTrack?.detached || originalMuted || original?.enabled === false || master===0;
    video.playbackRate = rate;
    const pictureReady = !video.paused && !video.seeking && cursor.desired===null && video.readyState>=2;
    const audible = cursor.playing && (!cursor.clip || pictureReady) && master>0;
    const active = new Set();
    function sync(item, time, volume) {
      if (!item.url || volume<=0 || time<0) return;
      active.add(item.id);
      const old = audio.current.get(item.id);
      if (old?.url !== item.url) {
        old?.media.pause();
        const media = new Audio(item.url);
        media.preload = 'auto';
        audio.current.set(item.id,{url:item.url,media});
      }
      const entry = audio.current.get(item.id);
      const media = entry.media;
      media.volume = master*volume/100;
      media.playbackRate = rate;
      if (!audible || (Number.isFinite(media.duration) && time>=media.duration)) {
        media.pause();
        return;
      }
      if (media.readyState>0 && !media.seeking && Math.abs(media.currentTime-time)>(media.paused ? .035 : .14)) {
        media.currentTime = time;
      }
      if (media.paused && !entry.starting) {
        entry.starting = true;
        media.play().catch(()=>{}).finally(()=>entry.starting=false);
      }
    }
    for (const track of tracks || []) {
      if (!mix?.[track.id]?.enabled || (track.id==='original' && (!track.detached || originalMuted))) continue;
      for (const item of track.items || []) {
        const offset = cursor.time-item.start;
        if (offset>=0 && offset<item.last-item.first) sync({...item,url:item.url ?? track.url},item.first+offset,item.volume*mix[track.id].volume/100);
      }
    }
    for (const item of project?.timeline_audio || []) {
      const offset = cursor.time-item.start;
      if (offset>=0 && offset<item.last-item.first) sync(item,item.first+offset,item.volume);
    }
    for (const [id,entry] of audio.current) {
      if (!active.has(id)) {
        entry.media.pause();
        entry.media.removeAttribute('src');
        entry.media.load();
        audio.current.delete(id);
      }
    }
  }

  j.useLayoutEffect(() => {
    if (!active) return;
    const video = player.current, cursor = clock.current;
    if (!video) return;
    let request = 0;
    const settings = {volume:video.volume, muted:video.muted, rate:video.playbackRate};

    function tick() {
      request = 0;
      align();
      const current = model.current;
      const clip = cursor.clip;
      const limit = cursor.rangeEnd === null ? current.duration : Math.min(cursor.rangeEnd,current.duration);
      if (cursor.playing && !clip) {
        const now = performance.now();
        const nextTime = cursor.time + (now-cursor.gapTick)*current.rate/1000;
        cursor.gapTick = now;
        const following = current.clips.find(item=>item.start>cursor.time);
        if (limit <= nextTime && (!following || limit <= following.start)) {
          seek(limit);
          pause();
        } else if (following && nextTime>=following.start) {
          seek(following.start);
        } else {
          publish(nextTime);
        }
      } else if (cursor.playing && clip && video.readyState && !video.seeking && cursor.desired===null) {
        const reference = clip.source_start ?? clip.start;
        const nextTime = clip.start+Math.max(0,video.currentTime-reference);
        if (nextTime>=limit-.001 || (video.ended && clip.end>=limit-.001)) {
          seek(limit);
          pause();
        } else if (nextTime>=clip.end-.001 || video.ended) {
          const next = current.clips.find(row=>row.start===clip.end);
          const nextSource = next?.source_start ?? next?.start;
          if (next && next.type!=='media' && !video.ended && Math.abs(nextSource-reference-clip.duration)<.006) {
            cursor.clip = next;
            publish(next.start+Math.max(0,video.currentTime-nextSource),true);
          } else {
            seek(clip.end);
          }
        } else {
          publish(nextTime);
        }
      }
      previewMix(video);
      if (cursor.playing) schedule();
    }
    function schedule() {
      if (!request) request=requestAnimationFrame(tick);
    }
    function nativePause() {
      if (!video.ended && cursor.playing && cursor.clip) pause();
      schedule();
    }
    function nativePlay() {
      cursor.playing = true;
      setPlaying(true);
      schedule();
    }
    const updates = ['loadedmetadata','loadeddata','seeked','timeupdate','ended','waiting'];
    updates.forEach(event=>video.addEventListener(event,schedule));
    video.addEventListener('pause',nativePause);
    video.addEventListener('play',nativePlay);
    scheduler.current = schedule;
    schedule();
    return () => {
      scheduler.current = null;
      cancelAnimationFrame(request);
      updates.forEach(event=>video.removeEventListener(event,schedule));
      video.removeEventListener('pause',nativePause);
      video.removeEventListener('play',nativePlay);
      cursor.playing = false;
      cursor.rangeEnd = null;
      video.pause();
      video.volume = settings.volume;
      video.muted = settings.muted;
      video.playbackRate = settings.rate;
      setPlaying(false);
      for (const {media} of audio.current.values()) {
        media.pause();
        media.removeAttribute('src');
        media.load();
      }
      audio.current.clear();
    };
  },[active,player,source?.url]);

  j.useLayoutEffect(() => {
    const cursor = clock.current;
    if (!active) return;
    const time = cursor.scope === project.id ? cursor.time : 0;
    cursor.scope = project.id;
    seek(time);
  },[active,project?.id,project?.timeline_revision,source?.url,duration]);
  j.useLayoutEffect(() => { scheduler.current?.(); },[volume,muted,originalMuted,rate,mix,tracks,project?.timeline_audio]);

  return { active,duration,playing,volume,muted,rate,setVolume,setMuted,setRate,originalMuted,
    toggleOriginal:()=>setOriginalMuted(value=>!value), play,pause,
    toggle:()=>{ if (clock.current.playing) pause(); else play(); },
    seek:time=>{ clock.current.rangeEnd=null; seek(time); },
    playRange:(from,end)=>{ seek(from); play(end); },
    current:()=>clock.current.time,
    hasFrame:()=>clock.current.desired===null || Math.abs((player.current?.currentTime ?? -1)-clock.current.desired)<.012 };
}

function LivePlaybackControls({ transport, time }) {
  const at = Math.min(time,transport.duration);
  function fullscreen(event) {
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    else event.currentTarget.closest('media-controller')?.requestFullscreen().catch(()=>{});
  }
  return <div className="media-controls live-media-controls">
    <button type="button" className="live-play-toggle" aria-label="播放或暂停" aria-keyshortcuts="Space"
      title="播放或暂停（空格）" aria-pressed={transport.playing} onClick={transport.toggle}>
      {transport.playing ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="3" y="2" width="3" height="12" rx="1" />
        <rect x="10" y="2" width="3" height="12" rx="1" />
      </svg> : j.createElement(mo,{size:16,fill:"currentColor",'aria-hidden':true})}
    </button>
    <time aria-label="播放时间">{kt(at)} / {kt(transport.duration)}</time>
    <input type="range" aria-label="拖动播放进度" className="live-time-range" min="0" max={transport.duration}
      step=".01" value={at} onChange={event=>transport.seek(Number(event.target.value))}/>
    <select aria-label="播放速度" value={transport.rate} onChange={event=>transport.setRate(Number(event.target.value))}>
      {[.5,1,1.5,2].map(rate=><option key={rate} value={rate}>{rate}×</option>)}
    </select>
    <St icon={transport.muted ? Ud : zi} label="静音" aria-pressed={transport.muted} onClick={()=>transport.setMuted(!transport.muted)} />
    <input type="range" aria-label="音量" className="live-volume-range" min="0" max="1" step=".01"
      value={transport.muted ? 0 : transport.volume} onChange={event=>{
        transport.setMuted(false);
        transport.setVolume(Number(event.target.value));
      }}/>
    <St icon={Hr} label="全屏预览" onClick={fullscreen} />
  </div>;
}
