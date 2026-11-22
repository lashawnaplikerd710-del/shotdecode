function yN(props) {
  return props.state.project && <TimelineExportDialog key={props.state.project.id} {...props} />;
}

function exportDimensions(canvas, aspect, resolution) {
  if (aspect === 'source' && resolution === 'source') return [canvas.width, canvas.height];
  const [width,height] = aspect === 'source' ? [canvas.width,canvas.height] : aspect.split(':').map(Number);
  const shortEdge = resolution === 'source' ? Math.min(canvas.width,canvas.height) : Number(resolution);
  const scale = shortEdge / Math.min(width,height) / 2;
  return [Math.max(2, Math.round(width*scale)*2), Math.max(2, Math.round(height*scale)*2)];
}

function videoRateEstimate(format, width, height, fps, quality) {
  // These ranges are indicative because the video encoders target quality, not file size.
  const bitsPerPixel = {h264:[.04,.24],hevc:[.025,.17],prores:[1.8,5.5],vp9:[.025,.16]};
  const weight = format === 'prores' ? 1 : {standard:.7,high:1,highest:1.55}[quality];
  return bitsPerPixel[format].map(bits => bits * width * height * fps * weight);
}

function exportSizeEstimate({format,width,height,fps,quality,duration,audio,comparison}) {
  if (!Number.isFinite(duration) || duration <= 0) return '';
  const audioRates = {h264:[128000,224000],hevc:[128000,224000],prores:[1024000,2400000],
    vp9:[112000,176000],mp3:[96000,320000],wav:[1024000,2400000],m4a:[160000,224000]};
  const rates = ['wav','mp3','m4a'].includes(format) ? [0,0] : videoRateEstimate(format,width,height,fps,quality);
  if (comparison) {
    // The comparison is a separate side-by-side H.264 file, up to 720 pixels tall.
    const h = Math.min(comparison.height,720);
    const w = 2 * comparison.width * h / comparison.height;
    videoRateEstimate('h264',w,h,comparison.fps,'standard').forEach((value,index) => {
      rates[index] += value + (comparison.audio ? audioRates.h264[index] : 0);
    });
  }
  const [lower,upper] = rates.map((value,index) => (value + (audio ? audioRates[format][index] : 0)) * duration / 8);
  if (!upper) return '';
  const [scale,unit] = upper >= 1e9 ? [1e9,'GB'] : upper >= 1e6 ? [1e6,'MB'] : [1e3,'KB'];
  const number = new Intl.NumberFormat(document.documentElement.lang,{maximumSignificantDigits:2});
  const low = number.format(lower / scale);
  const high = number.format(upper / scale);
  return (low === high ? high : low + '–' + high) + ' ' + unit;
}

function VideoExportSettings({settings, setSettings, preset, choosePreset, options, project, locked}) {
  const codecs = [
    ['h264', 'MP4（H.264）', '适合日常分享和上传'],
    ['hevc', 'MP4（HEVC）', '压缩效率更高'],
    ['prores', 'MOV（ProRes 422 HQ）', '用于后续剪辑'],
    ['vp9', 'WebM（VP9）', '适合在网页使用'],
  ];
  const {format, aspect, resolution, fps, quality, fit} = settings;
  const change = (field,value) => setSettings({...settings,[field]:value});
  const [width,height] = exportDimensions(project.canvas,aspect,resolution);
  const matchAspect = Math.abs(width / height - project.canvas.width / project.canvas.height) < .005;

  return <>
    <section className="export-section">
      <h3>导出预设</h3>
      <Kr values={[['project','沿用项目'],['vertical','竖屏 1080p'],['horizontal','横屏 1080p']]}
        label="导出预设" value={preset} onChange={choosePreset} disabled={locked} />
    </section>
    <section className="export-section">
      <h3>视频格式</h3>
      <div className="export-codecs" role="group" aria-label="视频格式">
        {codecs.map(([key,label,hint]) => <button key={key} type="button"
          className="export-choice" aria-label={label} aria-pressed={format === key}
          disabled={locked} onClick={() => change('format',key)}>
          <strong>{label}</strong>
          <small>{hint}</small>
        </button>)}
      </div>
    </section>
    <section className="export-section export-size">
      <div>
        <h3>画幅</h3>
        <Kr values={options.ratios.map(ratio => [ratio, ratio === 'source' ? '原始' : ratio])}
          label="画幅" value={aspect} onChange={value => change('aspect',value)} disabled={locked} />
      </div>
      <div>
        <h3>分辨率</h3>
        <Kr values={[['source','原始'],...options.resolutions.map(size => [size,size === 2160 ? '4K' : size + 'p'])]}
          label="分辨率" value={resolution} onChange={value => change('resolution',value)} disabled={locked} />
      </div>
      {!matchAspect && <div>
        <h3>画面填充</h3>
        <Kr values={[['contain','完整适配'],['cover','铺满画幅']]} label="画面填充" value={fit}
          onChange={value => change('fit',value)} disabled={locked} />
      </div>}
    </section>
    <div className="export-section export-fields">
      <label className="tool-field">
        <span>帧率</span>
        <select aria-label="帧率" value={fps ?? 'source'} disabled={locked} onChange={event =>
          change('fps',event.target.value === 'source' ? null : Number(event.target.value))}>
          <option value="source">{labelText('项目帧率（{0} fps）',project.export_rate)}</option>
          {options.rates.map(rate => <option key={rate} value={rate}>{rate} fps</option>)}
        </select>
      </label>
      <div>
        <h3>画质</h3>
        {format === 'prores' ? <span className="export-fixed-option">ProRes 422 HQ</span>
          : <Kr values={[['standard','标准'],['high','高'],['highest','最高']]} label="画质" value={quality}
              onChange={value => change('quality',value)} disabled={locked} />}
      </div>
    </div>
  </>;
}

function DraftExportSettings({editor, setEditor, native, tracks, subtitle, setSubtitle, disabled}) {
  return <>
    <section className="export-section">
      <h3>剪辑软件</h3>
      <Kr values={[['jianying','剪映专业版'],['capcut','CapCut']]} label="剪辑软件"
        value={editor} onChange={setEditor} disabled={disabled} />
      <p className="field-hint">{native ? '导出后回到剪辑软件首页，从本地草稿打开。'
        : '可选择剪辑软件设置里的草稿目录，也可把导出位置设为它的草稿目录。'}</p>
      {editor === 'capcut' && <p className="field-hint">CapCut 按保存位置读取素材，建议直接导出到它的草稿目录。</p>}
    </section>
    <section className="export-section">
      <h3>素材和轨道</h3>
      <p className="field-hint">复制完整素材，并保留分镜、附加视频和音频轨道。调色、裁剪和动画随对应的片段输出。</p>
      <p className="field-hint">时间线上的手动字幕会作为可编辑文字导出。</p>
      {tracks.length > 0 && <label className="tool-field export-subtitle">
        <span>附加字幕轨</span>
        <select aria-label="附加字幕轨" value={subtitle} onChange={event => setSubtitle(event.target.value)} disabled={disabled}>
          <option value="">仅时间线字幕</option>
          {tracks.map(({id,label}) => <option value={id} key={id}>{labelText(label)}</option>)}
        </select>
      </label>}
    </section>
  </>;
}

function TimelineExportDialog({state, open, close, command, openMixer, disabled}) {
  const Modal = hl, Toggle = bo, FolderIcon = qe, FileIcon = fo;
  const {project,export_options: options} = state;
  const [kind,setKind] = j.useState('video');
  const defaults = {format:'h264',aspect:'source',resolution:'source',fps:null,quality:'high',fit:'contain'};
  const [video,setVideo] = j.useState(defaults);
  const [preset,setPreset] = j.useState('project');
  const [audioFormat,setAudioFormat] = j.useState('wav');
  const [audio,setAudio] = j.useState('mix');
  const [includeAudio,setIncludeAudio] = j.useState(true);
  const [loudness,setLoudness] = j.useState('');
  const [captionFormat,setCaptionFormat] = j.useState('srt');
  const [subtitle,setSubtitle] = j.useState('');
  const [editor,setEditor] = j.useState('jianying');
  const [draftSubtitle,setDraftSubtitle] = j.useState('');
  const [overlays,setOverlays] = j.useState(true);
  const [compare,setCompare] = j.useState(false);
  const [names,setNames] = j.useState({});
  const [starting,setStarting] = j.useState(false);
  const [error,setError] = j.useState('');

  const isVideo = kind === 'video', isAudio = kind === 'audio';
  const isDraft = kind === 'draft', isCaptions = kind === 'captions';
  const draftOutput = state.settings.editor_outputs[editor];
  const output = isDraft ? draftOutput.path : state.settings.movie_output;
  const draftTrack = state.tracks.some(({id}) => id === draftSubtitle) ? draftSubtitle : '';
  const subtitles = [
    ...(state.manual_captions?.length ? [['manual','手动字幕']] : []),
    ...state.tracks.map(({id,label}) => [id,labelText(label)]),
  ];
  const track = subtitles.some(([key]) => key === subtitle) ? subtitle : subtitles[0]?.[0];
  const missingSubtitles = isCaptions && !track;
  const mixTracks = state.audio_tracks.filter(({id}) => state.audio_mix[id]?.enabled && state.audio_mix[id].volume > 0);
  const extraAudio = project.timeline_audio?.filter(item => item.volume > 0).length || 0;
  const mixNames = mixTracks.map(({id,label}) => labelText(label) + ' ' + state.audio_mix[id].volume + '%');
  if (extraAudio) mixNames.push(labelText('附加音频 {0} 段',extraAudio));
  const audioAvailable = audio === 'custom' || (audio === 'mix' ? mixNames.length > 0 : state.source.has_audio !== false);
  const audioSettingsVisible = isAudio || isVideo && includeAudio;
  const format = isVideo ? video.format : isAudio ? audioFormat : captionFormat;
  const extension = isDraft ? '' : options.extensions[format];
  const defaultSuffix = isVideo ? '成片' : isAudio ? '音频' : isDraft ? '剪辑工程' : '字幕';
  const name = names[kind] ?? project.export_basename + ' - ' + defaultSuffix;
  const typed = name.trim();
  const hasExtension = extension && typed.toLowerCase().endsWith(extension);
  const stem = hasExtension ? typed.slice(0,-extension.length).trimEnd() : typed;
  const invalid = !stem || /[<>:"/\\|?*\x00-\x1f]|\.$/.test(stem)
    || /^(CON|PRN|AUX|NUL|(?:COM|LPT)[1-9¹²³])(\s*\.|$)/i.test(stem);
  const locked = state.active || disabled || starting;
  const canExport = !(locked || invalid || isAudio && !audioAvailable || missingSubtitles);
  const fileCount = isVideo && compare ? 2 : 1;
  const [outWidth,outHeight] = exportDimensions(project.canvas,video.aspect,video.resolution);
  const exportDuration = state.source.duration || 0;
  const sizeEstimate = open && (isVideo || isAudio) && exportSizeEstimate({
    format,width:outWidth,height:outHeight,fps:video.fps ?? project.export_rate,quality:video.quality,
    duration:exportDuration,audio:audioSettingsVisible && audioAvailable,
    comparison:isVideo && compare ? {width:project.canvas.width,height:project.canvas.height,
      fps:project.export_rate,audio:includeAudio && state.source.has_audio !== false} : null,
  });
  const formatLabels = {h264:'MP4（H.264）',hevc:'MP4（HEVC）',prores:'MOV（ProRes 422 HQ）',vp9:'WebM（VP9）',
    wav:'WAV',mp3:'MP3',m4a:'M4A',srt:'SRT',vtt:'WebVTT'};

  function dismiss() {
    setCompare(false);
    setError('');
    setKind('video');
    close();
  }

  function choosePreset(value) {
    setPreset(value);
    setVideo(value === 'project' ? defaults
      : {...defaults, aspect:value === 'vertical' ? '9:16' : '16:9', resolution:1080, fit:'cover'});
  }

  async function startExport(event) {
    event.preventDefault();
    if (!canExport) return;
    setStarting(true);
    setError('');
    try {
      const request = {project:project.id, format, name:stem};
      if (isVideo) Object.assign(request,video,{overlays,compare});
      if (isVideo || isAudio) {
        request.audio = audioSettingsVisible ? audio : 'mute';
        request.loudness = audioSettingsVisible && loudness ? Number(loudness) : null;
      } else if (isCaptions) request.track = track;
      const result = isDraft
        ? await command('export_editor_draft',{project:project.id, editor, name:stem, track:draftTrack || null},true)
        : await command('assemble',request,true);
      if (result) dismiss();
      else if (result === undefined) setError('未能提交导出，请检查当前编辑内容。');
    } catch (problem) {
      setError(labelText(problem.message));
    } finally {
      setStarting(false);
    }
  }

  return <Modal open={open} onClose={() => !starting && dismiss()} title="导出时间线成片" className="export-dialog">
    <form className="export-form" onSubmit={startExport}>
      <div className="export-tabs" role="group" aria-label="导出类型">
        {[['video','视频',$t],['draft','剪辑工程',fl],['audio','音频',Xa],['captions','字幕',fo]].map(([key,label,Icon]) =>
          <button type="button" key={key} aria-pressed={kind === key} disabled={locked} onClick={() => {
            setKind(key);
            setError('');
          }}><Icon size={16} aria-hidden="true" />{label}</button>)}
      </div>
      <div className="export-layout">
        <div className="export-options" key={kind}>
          {isVideo && <VideoExportSettings settings={video} setSettings={value => {
            setVideo(value); setPreset('');
          }} preset={preset} choosePreset={choosePreset} options={options} project={project} locked={locked} />}
          {isDraft && <DraftExportSettings editor={editor} setEditor={setEditor} native={draftOutput.native}
            tracks={state.tracks} subtitle={draftTrack} setSubtitle={setDraftSubtitle} disabled={locked} />}
          {isAudio && <section className="export-section">
            <h3>音频格式</h3>
            <Kr values={[['wav','WAV · PCM'],['mp3','MP3'],['m4a','M4A · AAC']]} label="音频格式"
              value={audioFormat} onChange={setAudioFormat} disabled={locked} />
          </section>}
          {(isVideo || isAudio) && <section className="export-section">
            {isVideo && <Toggle checked={includeAudio} disabled={locked} onChange={setIncludeAudio}>包含声音</Toggle>}
            {audioSettingsVisible && <>
              <h3>成片音轨</h3>
              <Kr values={[['mix','工程音轨'],['original','沿用原片'],['custom','替换音频']]}
                value={audio} onChange={setAudio} label="导出音轨" disabled={locked} />
              {audio === 'mix' && <div className="mix-export-summary">
                <span>{mixNames.join(' · ') || '静音输出'}</span>
                <D kind="ghost" disabled={locked} onClick={openMixer}>调整混音</D>
              </div>}
              <label className="tool-field export-loudness">
                <span>响度</span>
                <select aria-label="响度" value={loudness} onChange={event => setLoudness(event.target.value)} disabled={locked}>
                  <option value="">保留当前响度</option>
                  {options.loudness.map(level => <option key={level} value={level}>{level} LUFS</option>)}
                </select>
              </label>
            </>}
            {isAudio && !audioAvailable && <p className="field-hint">没有可导出的音轨。请启用音轨或选择外部音频。</p>}
          </section>}
          {isVideo && <details className="export-advanced">
            <summary>更多设置</summary>
            <div className="export-advanced-options">
              <Toggle checked={overlays} onChange={setOverlays} disabled={locked}
                hint="把识别出的字幕、标题和花字叠到替换镜头">保留原字幕和标题</Toggle>
              <Toggle checked={compare} onChange={setCompare} disabled={locked}>同时导出对比视频</Toggle>
            </div>
          </details>}
          {isCaptions && <section className="export-section">
            <h3>字幕格式</h3>
            <Kr values={[['srt','SRT'],['vtt','WebVTT']]} label="字幕格式" value={captionFormat}
              onChange={setCaptionFormat} disabled={locked} />
            {subtitles.length ? <label className="tool-field export-subtitle">
              <span>字幕轨</span>
              <select aria-label="字幕轨" value={track} onChange={event => setSubtitle(event.target.value)} disabled={locked}>
                {subtitles.map(([key,label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label> : <p className="field-hint">请先添加手动字幕，或在字幕与翻译中生成口播字幕。</p>}
          </section>}
        </div>
        <aside className="export-summary" aria-label="导出摘要">
          <div className="export-summary-card">
            <div className="export-file-icon"><FileIcon size={18} aria-hidden="true" /></div>
            {missingSubtitles ? <h3>无可导出的字幕</h3> : <>
              <h3>{isDraft ? '草稿文件夹' : labelText('{0} 个文件',fileCount)}</h3>
              <p className="export-file-name" title={stem + extension}>{stem}{extension}</p>
              <dl>
                <div><dt>{isDraft ? '剪辑软件' : '格式'}</dt><dd>{isDraft ? editor === 'jianying' ? '剪映专业版' : 'CapCut' : formatLabels[format]}</dd></div>
                {!isCaptions && <div><dt>时长</dt><dd>{kt(exportDuration,true)}</dd></div>}
                {isVideo && <>
                  <div><dt>尺寸</dt><dd>{outWidth} × {outHeight}</dd></div>
                  <div><dt>帧率</dt><dd>{video.fps ?? project.export_rate} fps</dd></div>
                </>}
                {sizeEstimate && <div className="export-size-estimate" title="按导出参数估算，实际大小随素材内容变化。">
                  <dt>{fileCount > 1 ? '预计总大小' : '预计大小'}</dt><dd>{sizeEstimate}</dd>
                </div>}
              </dl>
            </>}
            {isVideo && state.manual_captions?.length > 0 && <p className="field-hint">
              {labelText('{0} 条手动字幕将随成片导出',state.manual_captions.length)}
            </p>}
            {isVideo && compare && <p className="field-hint">另存一份 MP4 对比视频</p>}
          </div>
        </aside>
      </div>
      {(error || invalid) && <p className="export-error" role="alert">{error || '请输入有效的文件名。'}</p>}
      <footer className="export-footer">
        <div className="export-destination">
          <span>保存到</span>
          <button type="button" className="path-button export-path"
            aria-label={isDraft ? '更改草稿保存位置' : '更改成片保存位置'}
            title={output} disabled={locked} onClick={() => isDraft ? command('pick_editor_output',{editor}) : command('pick_movie_output')}>
            <FolderIcon size={16} aria-hidden="true" /><span>{output}</span><strong>更改</strong>
          </button>
        </div>
        <label className="export-destination">
          <span>{isDraft ? '草稿名称' : '文件名'}</span>
          <div className="export-name-field">
            <input value={name} maxLength={80} aria-invalid={invalid} spellCheck="false" disabled={locked} onChange={event => {
              setError('');
              setNames(previous => ({...previous,[kind]:event.target.value}));
            }} />
            {extension && !hasExtension && <span aria-hidden="true">{extension}</span>}
          </div>
        </label>
        <D type="submit" kind="primary" icon={Pr} busy={starting} disabled={!canExport}>
          {starting ? '正在准备…' : isDraft ? '导出草稿' : '开始导出'}
        </D>
      </footer>
    </form>
  </Modal>;
}
