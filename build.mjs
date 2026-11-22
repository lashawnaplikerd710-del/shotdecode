import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'acorn';
import {build,transform} from 'esbuild';
import {localizeWorkbench} from './src/i18n-build.mjs';

function once(code,before,after,label=before.slice(0,80)){
  if(code.split(before).length!==2)throw Error('Expected exactly one occurrence: '+label);
  return code.replace(before,after);
}
const original=fs.readFileSync('web-base/studio.js','utf8').replace(/\r\n/g,'\n');
const originalTree=parse(original,{ecmaVersion:'latest',sourceType:'module'});
const originals=originalTree.body.filter(n=>n.type==='FunctionDeclaration');
const customSource=['src/components.jsx','src/manual-captions.jsx','src/caption-font-picker.jsx','src/agent-panel.jsx','src/settings.jsx',
  'src/clip-inspector.jsx','src/clip-preview.jsx','src/motion-panel.jsx','src/studio-dialogs.jsx','src/export-dialog.jsx','src/workspace-tools.jsx',
  'src/interface.jsx','src/timeline-controls.jsx','src/timeline-playback.jsx'].map(file=>fs.readFileSync(file,'utf8')).join('\n');
const custom=(await transform(customSource,{loader:'jsx',jsxFactory:'j.createElement',jsxFragment:'j.Fragment',target:'es2022',charset:'utf8'})).code;
const customTree=parse(custom,{ecmaVersion:'latest',sourceType:'module'});
const patches=[];
const extra=[];
const markdown=await build({
  stdin:{contents:"export {lexer} from 'marked';",resolveDir:process.cwd()},
  bundle:true,format:'iife',globalName:'agentMarkdown',platform:'browser',
  write:false,minify:true,charset:'utf8',target:'es2022',
});
const markdownLicense=fs.readFileSync('node_modules/marked/LICENSE','utf8').trim();
extra.push('/*! Marked\n'+markdownLicense+'\n*/\n'+markdown.outputFiles[0].text);
const captionFontRoot='app/studio_web/assets/caption-fonts';
const captionFonts=JSON.parse(fs.readFileSync(path.join(captionFontRoot,'catalog.json'),'utf8')).families;
const captionFontCatalog=captionFonts.map(({name,group,locale})=>({name,group,locale,family:'ShotDecode '+name}));
const captionFontRules=captionFonts.flatMap(({folder,faces},index)=>faces.map(({file,weight})=>{
  if (!fs.existsSync(path.join(captionFontRoot,folder,file))) throw Error('Missing caption font: '+file);
  const url='/assets/caption-fonts/'+encodeURIComponent(folder)+'/'+encodeURIComponent(file);
  return '@font-face{font-family:'+JSON.stringify(captionFontCatalog[index].family)+';src:url('+JSON.stringify(url)+
    ');font-weight:'+weight+';font-display:swap}';
}));
extra.push('const captionFontCatalog = '+JSON.stringify(captionFontCatalog)+';');
extra.push('const captionBundledFamilies = new Map(captionFontCatalog.map(({name,family})=>[name.toLowerCase(),family]));');
for(const n of customTree.body){
  if(n.type!=='FunctionDeclaration')throw Error('Custom source must only contain functions');
  const old=originals.find(o=>o.id.name===n.id.name), code=custom.slice(n.start,n.end);
  if(old)patches.push({...old,code}); else extra.push(code);
}
function patch(name,apply){const old=originals.find(n=>n.id.name===name);if(!old)throw Error(name);patches.push({...old,code:apply(original.slice(old.start,old.end))});}
patch('HT', code => {
  code=once(code,
    'r.open("POST", "/api/import" + (t ? "?shot=" + encodeURIComponent(t) : ""))',
    'const query = new URLSearchParams();\n    if (t) for (const [key, value] of Object.entries(t)) if (value != null) query.set(key, value);\n    r.open("POST", "/api/import" + (query.size ? "?" + query : ""))');
  return once(code, 'o();', 'o(i.result ?? undefined);');
});
patch('IN',code=>{
  code=once(code,
    'return (0, _.jsxs)("div", { className: "boot", children: [(0, _.jsx)("span", { className: "brand-mark", children: (0, _.jsx)(fl, { size: 21 }) }), (0, _.jsx)("strong", { children: yM }), a ? (0, _.jsxs)(_.Fragment, { children: [(0, _.jsx)("p", { children: a }), (0, _.jsx)(D, { icon: qe, onClick: () => location.reload(), children: "重新加载" })] }) : (0, _.jsx)("span", { children: "正在读取工作区…" })] });',
    'return j.createElement(StudioStartup, {error:a});');
  code=once(code,'function IN() {','function IN() {\n  const [inputMode,setInputMode]=j.useState("local"),[linkText,setLinkText]=j.useState(""),[showInput,setShowInput]=j.useState(false),[linkSubmitting,setLinkSubmitting]=j.useState(false);\n  const [projectNavigating,setProjectNavigating]=j.useState(false);\n  const projectSwitch=j.useRef(false);');
  code=once(code,'jo = !!(Et || T != null)','jo = !!(Et || T != null || projectNavigating)');
  code=once(code,'let Et = e?.active || e?.importing;','const [initialAudio,setInitialAudio]=j.useState("");\n  useInterfacePreferences(e?.settings);\n  let Et = e?.active || e?.importing;');
  code=once(code,'at = (0, j.useCallback)(async (q, G) => {','at = (0, j.useCallback)(async (q, G, throwOnFailure = false) => {');
  code=once(code,'      pt(Xt.message, true);\n      return;','      if (throwOnFailure) throw Xt;\n      pt(Xt.message, true);\n      return;');
  code=once(code,'let Et = e?.active || e?.importing;','j.useEffect(()=>{if(e?.link_import?.phase==="failed"){setShowInput(true);setInputMode("link");}else if(e?.source&&["analyzing","completed"].includes(e?.link_import?.phase))setShowInput(false);},[e?.source?.path,e?.link_import?.phase]);\n  let Et = e?.active || e?.importing;');
  code=once(code,'yo.current && !e.active && pt(e.error || e.status, !!e.error)',
    'yo.current && !e.active && (e.task?.announce !== false || e.error) && pt(e.error || e.status, !!e.error)');
  code=once(code,'className: "studio"','className: "studio task-" + l + (editorMode ? " editor-mode" : "") + ((!ct || showInput) ? " source-input-open" : "")');
  code=once(code,'function IN() {','function IN() {\n  const [agentOpen, setAgentOpen] = j.useState(false);\n  const [agentTaskBusy, setAgentTaskBusy] = j.useState(false);\n  const [settingsEntry, setSettingsEntry] = j.useState({tab:"general"});\n  const [agentRegistryRevision, bumpAgentRegistry] = j.useState(0);');
  code=once(code,'Ie = () => h(null);',`Ie = () => {
    h(c === "export-mix" ? "export" : null);
    if (c === "settings") refreshAgentRegistry();
  };
  function refreshAgentRegistry() {
    bumpAgentRegistry((version) => version + 1);
  }
  function showSettings(tab, provider) {
    setSettingsEntry({tab: typeof tab === "string" ? tab : "general", provider});
    h("settings");
  }`);
  code=once(code,'Ve.current?.pause(), h("mix");','Ve.current?.pause(), h(c === "export" ? "export-mix" : "mix");');
  const footerStart=code.indexOf(', (0, _.jsxs)("footer", { className: "statusbar"');
  const footerEnd=code.indexOf(', (0, _.jsx)(CN, { open: c === "settings",',footerStart);
  if (footerStart<0 || footerEnd<=footerStart) throw Error('Bottom status bar boundary missing');
  code=once(code,code.slice(footerStart,footerEnd),'','bottom status bar');
  code=once(code,'open: c === "mix", close: Ie, command: at, state: e, time: v, disabled: jo',
    'open: c === "mix" || c === "export-mix", fromExport: c === "export-mix", close: Ie, command: at, state: e, time: v, disabled: jo');
  code=once(code,'disabled: jo, openSettings: () => h("settings"), onNew: TM', 'disabled: jo, openSettings: showSettings, onNew: TM');
  code=once(code,'openAdvanced: ca, openSettings: () => h("settings"), shot: fn', 'openAdvanced: ca, openSettings: showSettings, shot: fn');
  code=once(code,'initialShot: fn?.id, openSettings: () => h("settings")', 'initialShot: fn?.id, openSettings: () => showSettings("generation")');
  code=once(code,'(0, _.jsx)(CN, { open: c === "settings", close: Ie,', '(0, _.jsx)(CN, { open: c === "settings", initialTab: settingsEntry.tab, initialAgent: settingsEntry.provider, onAgentChange: refreshAgentRegistry, close: Ie,');
  code=once(code,'(0, _.jsxs)("div", { className: "shell"','!editorMode && (0, _.jsx)(WorkflowGuide, {state:e,tab:l,onTab:selectWorkspace,onExport:showMovieExport,openInput,disabled:jo||linkSubmitting}), (0, _.jsxs)("div", { className: "shell"');
  code=once(code,'seek: Dc, notify: pt }), i &&','seek: Dc, notify: pt, openMixer: ot, openInput, captionEditor, clipEditor, playRange, selectPromptShot, dispatchAgentTask, agentTaskBusy }), i &&');
  code=once(code,'async function TM() {\n    await at("new") !== void 0 && xh("analysis");\n  }',`async function openInput(mode){
    if(jo||linkSubmitting||!await clipEditor.flush()||!await captionEditor.close())return;
    Ve.current?.pause();
    if(mode||l!=="shot")xh("analysis");
    setShowInput(true);setInputMode(mode||"local");
  }
  async function pickLocal(){
    if(jo||linkSubmitting)return;
    const action = l==="shot" ? "pick_edit_source" : "pick_source";
    if(await captionCommand(action))setShowInput(false);
  }
  async function editCurrentSource(){
    if(!jo&&await captionCommand("edit_source"))setShowInput(false);
  }
  async function analyzeLink(){
    if(jo||linkSubmitting||!linkText.trim())return;
    setLinkSubmitting(true);
    try{await captionCommand("analyze_link",{text:linkText,options:u});}finally{setLinkSubmitting(false);}
  }
  async function navigateProject(change){
    if(jo||linkSubmitting||projectSwitch.current)return false;
    projectSwitch.current=true;
    setProjectNavigating(true);
    try{
      await trackRequest.current;
      return await change();
    }finally{
      projectSwitch.current=false;
      setProjectNavigating(false);
    }
  }
  function openRecentProject(id){
    return navigateProject(async ()=>{
      if(await captionCommand("open_recent",{id})===undefined)return false;
      setShowInput(false);n(null);
      return true;
    });
  }
  function TM(){
    return navigateProject(async ()=>{
      if(!await clipEditor.flush()||!await captionEditor.close())return false;
      if(await at("new")===undefined)return false;
      xh("analysis");setShowInput(true);setInputMode("local");setLinkText("");
      return true;
    });
  }`);
  code=once(code,'onPick: () => at("pick_source"), onVolume: vS','onPick: () => openInput(), inputPanel: (!ct || showInput) ? j.createElement(SourceImportPanel,{state:e,mode:inputMode,setMode:setInputMode,text:linkText,setText:setLinkText,onPick:pickLocal,onAnalyze:analyzeLink,onBack:()=>setShowInput(false),disabled:jo,submitting:linkSubmitting,editing:l==="shot",onEditSource:editCurrentSource}) : e.project?.timeline_empty && !A ? j.createElement(EmptyTimelinePreview) : null, onVolume: vS');
  code=once(code,'if ((0, j.useEffect)(() => {\n    if (!si) return;', `const sourceHeight = ct?.rotation === 90 || ct?.rotation === 270 ? ct?.width : ct?.height;
  const timelineTransport = useLiveTimeline({enabled:!!e?.project && !A && !showInput && !i, player:Ve,
    project:e?.project,source:ct,onTime:L,tracks:e?.audio_tracks,mix:e?.audio_mix});
  useSpacePlayback(l==="shot" && !!e?.project && !e.project.timeline_empty && !!ct?.url && !ct.missing &&
    !Et && T==null && !showInput && !c && !i, toggleEditorPlayback);
  const selectEditor = useEditorSelection(Ut || It);
  const undoQueue = j.useRef(Promise.resolve());
  const undoAvailable = !!e?.manual_caption_scope && !Et && T == null && !projectNavigating &&
    (!c || ["track-tools","project-tools","mix","export-mix"].includes(c));
  const [trackSelection, setTrackSelection] = j.useState(null);
  const [trackBusy, setTrackBusy] = j.useState(false);
  const trackRequest = j.useRef(false);
  useUndoShortcut(undoAvailable, undoWorkbenchEdit);
  const captionEditor = useManualCaptionEditor({
    scope: e?.manual_caption_scope, cues: e?.manual_captions, limit: e?.manual_caption_duration, laneCount:e?.manual_caption_lanes,
    defaults: e?.manual_caption_defaults, sizeRange: e?.manual_caption_size_range,
    height: sourceHeight || x.height, disabled: Et || T != null, time: v, override: !!A || showInput, motion:e?.motion
  }, at, () => { Ve.current?.pause(); setShowInput(false); }, Dc, playRange, selectCaptionContext, pt);
  const [editedPreview, setEditedPreview] = j.useState(true);
  const openAgentTimeline = j.useCallback(() => {
    Ve.current?.pause();
    setShowInput(false);
    setEditedPreview(true);
    setTrackSelection(null);
    f(null);
    n(null);
    r("shot");
  }, []);
  const playingAfterLoad = j.useRef(null);
  const motionPreview = j.useRef(null);
  const clipEditor = useClipProperties(e?.project, Et || T != null, at, (shot) => {
    setEditedPreview(true);
    if (A || v < shot.start || v >= shot.end) {
      Ve.current?.pause();
      Dc(shot.start);
    }
  });
  j.useEffect(() => {
    setEditedPreview(true);
    if (Ut) setShowInput(false);
    return cancelMotionPreview;
  }, [Ut]);
  if ((0, j.useEffect)(() => {
    if (!si) return;`);
  code=once(code,'function xh(q, G) {', `function undoWorkbenchEdit() {
    if (!undoAvailable) return;
    const scope = e.manual_caption_scope;
    undoQueue.current = undoQueue.current.then(async () => {
      await trackRequest.current;
      if (await captionEditor.undoPending()) {
        pt("已撤销字幕编辑");
        return;
      }
      if (!await clipEditor.flush()) return;
      const latest = await Pt();
      if (latest.manual_caption_scope !== scope || latest.active || latest.importing || !latest.edit_undo) return;
      if (!await captionEditor.close()) return;
      pauseEditorPlayback();
      const result = await at("undo_edit", {scope, revision:latest.edit_undo.revision});
      if (result) {
        if (c) Ie();
        pt(result.message);
      }
    }).catch(error => pt(error.message, true));
  }
  function selectWorkspace(q, G) {
    return selectEditor(async (isCurrent) => {
      if (!await clipEditor.flush() || !isCurrent() || !await captionEditor.close(isCurrent) || !isCurrent()) return false;
      xh(q, G);
      if(q==="shot"&&!e.project)setShowInput(true);
      return true;
    });
  }
  function toggleEditorPlayback() {
    cancelMotionPreview();
    if(timelineTransport.active) return timelineTransport.toggle();
    const video=Ve.current;
    if(!video)return;
    if(video.paused)video.play().catch(error=>pt(error.message,true));
    else video.pause();
  }
  function pauseEditorPlayback() {
    if(timelineTransport.active) timelineTransport.pause();
    else Ve.current?.pause();
  }
  async function showMovieExport() {
    if (!e.project || e.project.timeline_empty || !await clipEditor.flush() || !await captionEditor.flush()) return;
    Ve.current?.pause();
    h("export");
  }
  async function showProjectTools() {
    if (await clipEditor.flush() && await captionEditor.close()) {
      Ve.current?.pause();
      h("project-tools");
    }
  }
  async function showTrackTools(audio) {
    if (await clipEditor.flush() && await captionEditor.close()) {
      Ve.current?.pause();
      setInitialAudio(typeof audio === "string" ? audio : selectedTrack?.kind === "audio" ? selectedTrack.item.id : "");
      h("track-tools");
    }
  }
  async function workspaceCommand(action,data) {
    const result = await at(action,data);
    if (result?.clip) f(result.clip);
    return result;
  }
  function selectTimelineMedia(item,kind) {
    if (trackDisabled) return;
    return selectEditor(async (isCurrent) => {
      if (!await clipEditor.flush() || !isCurrent() || !await captionEditor.close(isCurrent) || !isCurrent()) return false;
      setTrackSelection({scope:directScope,kind,id:item.id});
      const end = item.start + item.last - item.first;
      if (A || v < item.start || v >= end) {
        Ve.current?.pause();
        Dc(item.start);
      }
      return true;
    });
  }
  async function runTrackEdit(save) {
    if (trackDisabled || trackRequest.current) return;
    setTrackBusy(true);
    pauseEditorPlayback();
    const pending = save();
    trackRequest.current = pending;
    try {
      return await pending;
    } finally {
      trackRequest.current = false;
      setTrackBusy(false);
    }
  }
  function addTimelineAsset(track) {
    if (!e.project) return;
    return runTrackEdit(async () => {
      if (!await clipEditor.flush() || !await captionEditor.close()) return;
      const kind = track.kind === "video" ? "video-layer" : "audio";
      const result = await workspaceCommand(track.kind === "video" ? "timeline_video_pick" : "timeline_audio_pick",
        {project:e.project.id,lane:track.id,time:v});
      if (result) setTrackSelection({scope:directScope,kind,id:result.id});
    });
  }
  function setMainMagnet() {
    return runTrackEdit(async () => {
      if (!await clipEditor.flush() || !await captionEditor.close()) return;
      return workspaceCommand("timeline_magnet_set",{project:e.project.id,enabled:!e.project.timeline_magnet});
    });
  }
  function editTimelineTrack(target, operation, range) {
    if (!target) return;
    const {kind,item} = target;
    return runTrackEdit(async () => {
      if (kind === "caption") {
        if (operation === "remove") await captionEditor.remove(item.id);
        else await captionEditor.split(v);
        return;
      }
      if (!await clipEditor.flush() || !await captionEditor.close()) return;
      const project = e.project.id;
      const result = kind === "video"
        ? await workspaceCommand("timeline_edit",{project,clip:item.id,operation,time:v,...range})
        : await workspaceCommand(kind==="video-layer" ? "timeline_video_save" : "timeline_audio_save",{project,id:item.id,
            ...range,operation,volume:item.volume,time:v,split:operation==="split",remove:operation==="remove",
            ...(kind==="source-audio" ? {source_track:item.lane} : {})});
      if (!result) return;
      const id = result.kind ? result.id : kind === "video" ? result.clip : operation === "remove" ? null : result.id;
      setTrackSelection(id ? {scope:directScope,kind:result.kind || kind,id} : null);
      if (kind === "video" || result.kind === "video") {
        f(id);
        const position = Math.min(v,Math.max(0,result.duration-.001));
        if (!timelineTransport.active) Ge.current = position;
        L(position);
      }
    });
  }
  async function prepareAgentTask() {
    return !jo && !agentTaskBusy && await clipEditor.flush() && await captionEditor.close();
  }
  async function dispatchAgentTask(data) {
    if (!await prepareAgentTask()) return false;
    const result = await at("agent_dispatch", data);
    if (!result) return false;
    setAgentOpen(true);
    refreshAgentRegistry();
    return true;
  }
  async function captionCommand(action, data, throwOnFailure = false) {
    const changingSource = ["pick_source", "pick_edit_source", "edit_source", "pick_project", "open_recent", "analyze", "analyze_link"].includes(action);
    const exporting = action === "assemble" || action === "export_editor_draft";
    if ((changingSource || exporting || ["replace", "clear_replacement", "video_gen_comfy"].includes(action))
        && !await clipEditor.flush()) return;
    if (changingSource && !await captionEditor.close()) return;
    if (exporting && !await captionEditor.flush()) return;
    return at(action, data, throwOnFailure);
  }
  function xh(q, G) {`);
  code=once(code,'function ca(q) {','async function ca(q) {\n    if (!await clipEditor.flush() || !await captionEditor.close()) return;');
  code=once(code,', onRecent: async (q) => {\n    await at("open_recent", { id: q }) !== void 0 && n(null);\n  }','');
  code=once(code,'showExport: () => h("export")',
    'showExport: showMovieExport, openLogs: () => h("logs"), importingVideo: T != null, undo: undoWorkbenchEdit, openSettings: showSettings, openAdvanced: ca, advanced: !!i, directImport: l === "shot" ? pickLocal : null, onNew: TM, onRecent: openRecentProject, onBrowse: () => navigateProject(() => captionCommand("pick_project"))');
  code=once(code,'onExport: () => h("export")','onExport: showMovieExport');
  code=once(code,'onTab: xh, command: at, disabled: jo','onTab: selectWorkspace, command: captionCommand, disabled: jo');
  code=once(code,'disabled: jo, command: at, showExport:', 'disabled: jo, command: captionCommand, showExport:');
  code=once(code,'(0, _.jsx)(zT, { tab: l, onTab: r, state: e, options: u, setOption: ci, command: at,', '(0, _.jsx)(zT, { tab: l, onTab: r, state: e, options: u, setOption: ci, command: captionCommand,');
  code=once(code,'open: c === "export", close: Ie, command: at',
    'open: c === "export", close: Ie, command: captionCommand, disabled: jo');
  code=once(code,'className: "shell", children:', 'className: "shell" + (agentOpen ? " agent-expanded" : "") + (editingLayout ? " editor-layout" : ""), children:');
  code=once(code,'(0, _.jsx)(SN, { state: e, tab: l,',`(0, _.jsx)(AgentSidebar, {
    agentOpen, setAgentOpen, settingsOpen: c === "settings", refreshKey: agentRegistryRevision, shot: fn, time: v,
    onWorkbenchChange: Pt, onTimelineEdit: openAgentTimeline, onTaskBusy: setAgentTaskBusy, prepareAgentTask,
    openProjectTools: showProjectTools,
    openResult: async (id) => {
      if (await clipEditor.flush() && await captionEditor.close() && await at("agent_open_result", { id })) {
        setShowInput(false);
        n(null);
      }
    },
    state: e, tab: l,`);
  code=once(code,'async function LS(q, G) {\n    if (!jo) {','async function LS(q, G) {\n    if (!jo && await clipEditor.flush() && (G || await captionEditor.close())) {');
  code=once(code,'kc = di.find((q) => v >= q.start && v < q.end)', 'kc = previewShotAt(di, v, ct?.duration)');
  code=once(code,'di = e.project?.shots || []','di = e.project?.timeline || e.project?.shots || []');
  code=once(code,'fn = di.find((q) => q.id === s) || kc || di[0]',
    'fn = l === "prompts" ? e.project?.shots.find(shot=>shot.id===s) || e.project?.shots.find(shot=>shot.id===kc?.source_id) || e.project?.shots[0] : di.find((q) => q.id === s) || kc || di[0]');
  code=once(code,'ct?.duration || x.duration','ct?.duration ?? x.duration');
  code=once(code,'selected: fn?.id, current: kc?.id', 'selected: selectedTrack?.kind === "video" ? selectedTrack.item.id : null, current: kc?.id');
  code=once(code,'function AM(q) {\n    f(q.id), Dc(q.start), l === "analysis" && r("shot");\n  }', `function selectCaptionContext(edit) {
    return selectEditor(async (isCurrent) => {
      if (!await clipEditor.flush() || !isCurrent()) return false;
      const opened = await edit(isCurrent);
      if (opened && isCurrent()) {
        setTrackSelection(null);
        if (Ut) r("shot");
      }
      return opened;
    });
  }
  function selectShot(shot, locate, workspace = "shot") {
    if (!shot || jo) return;
    return selectEditor(async (isCurrent) => {
      if (!await clipEditor.flush() || !isCurrent() || !await captionEditor.close(isCurrent) || !isCurrent()) return false;
      f(shot.id);
      setTrackSelection(workspace === "shot" ? {scope:directScope,kind:"video",id:shot.id} : null);
      r(workspace);
      const time = timelineTransport.active ? timelineTransport.current() : Ve.current?.currentTime ?? v;
      if (locate && (A || time < shot.start || time >= shot.end)) {
        Ve.current?.pause();
        Dc(shot.start);
      }
      return true;
    });
  }
  function AM(shot) {
    return selectShot(shot, true);
  }
  function selectPreviewShot() {
    const time = timelineTransport.active ? timelineTransport.current() : Ve.current?.currentTime ?? v;
    const layer = editedPreview && layerAtTime(extraTimelineVideo,time);
    return layer ? selectTimelineMedia(layer,"video-layer") : selectShot(previewShotAt(di,time), false);
  }
  async function selectPromptShot(id) {
    const clip = [...di,...extraTimelineVideo].find(shot => (shot.source_id || shot.id) === id);
    const selected = await selectShot(e.project?.shots.find(shot=>shot.id===id),false,"prompts");
    if (selected && clip) Dc(clip.start);
    return selected;
  }
  function cancelMotionPreview() {
    if (motionPreview.current) cancelAnimationFrame(motionPreview.current.request);
    motionPreview.current = null;
    playingAfterLoad.current = null;
  }
  function playMotion(media, {from,end}) {
    const audition = {request:0};
    motionPreview.current = audition;
    function sample() {
      if (motionPreview.current !== audition) return;
      if (media.paused || !media.isConnected) {
        cancelMotionPreview();
        return;
      }
      if (!media.seeking && media.currentTime >= end) {
        cancelMotionPreview();
        media.pause();
        media.currentTime = Math.max(from,end-.005);
        return;
      }
      audition.request = requestAnimationFrame(sample);
    }
    media.play().then(() => {
      if (motionPreview.current === audition) sample();
    }).catch(() => {
      if (motionPreview.current === audition) cancelMotionPreview();
    });
  }
  function playRange(from,end) {
    if (jo || !(end > from)) return;
    setEditedPreview(true);
    if (timelineTransport.active) {
      timelineTransport.playRange(from,end);
      return;
    }
    Dc(from);
    const range = {from,end};
    if (A || !Ve.current?.readyState) playingAfterLoad.current = range;
    else playMotion(Ve.current,range);
  }`);
  code=once(code,'function Dc(q) {\n    let G', 'function Dc(q) {\n    cancelMotionPreview();\n    if (timelineTransport.active) { timelineTransport.seek(q); return; }\n    let G');
  code=once(code,'p({ duration: G.duration, width: G.videoWidth, height: G.videoHeight });',`p({ duration: G.duration, width: G.videoWidth, height: G.videoHeight });
    if (timelineTransport.active) {
      const requested = Ge.current;
      Ge.current = null;
      const audition = playingAfterLoad.current;
      playingAfterLoad.current = null;
      if (audition) timelineTransport.playRange(audition.from,audition.end);
      else {
        const resume = tr && ae.current?.path===It && ae.current.url!==Yo ? ae.current.position : null;
        if (resume) ae.current = null;
        timelineTransport.seek(requested ?? timelineTransport.current());
        if (resume?.playing) timelineTransport.play();
      }
      return;
    }`);
  code=once(code,'function vS(q) {\n    let G','function vS(q) {\n    if (timelineTransport.active) return;\n    let G');
  code=once(code,'function IM() {\n    let q','function IM() {\n    if (timelineTransport.active) { timelineTransport.toggleOriginal(); return; }\n    let q');
  code=once(code,'onTime: (q) => !A && L(q.currentTarget.currentTime)','onTime: (q) => !A && !timelineTransport.active && L(q.currentTarget.currentTime)');
  code=once(code,'Ge.current != null && (G.currentTime = Math.min(G.duration || Ge.current, Ge.current), Ge.current = null);',
    `Ge.current != null && (G.currentTime = Math.min(G.duration || Ge.current, Ge.current), Ge.current = null);
    if (playingAfterLoad.current) {
      const range = playingAfterLoad.current;
      playingAfterLoad.current = null;
      playMotion(G,range);
    }`);
  code=once(code,'return (0, _.jsxs)("div", { className: "studio task-"', `const editingLayout = !i && !showInput && !!(e.project || captionEditor.draft);
  const editorMode = editingLayout || l === "shot";
  const extraTimelineAudio = e.project?.timeline_audio || [];
  const extraTimelineVideo = e.project?.timeline_video || [];
  const sourceTimelineAudio = (e.audio_tracks || []).flatMap(track=>track.items || []);
  const directScope = e.manual_caption_scope;
  const explicitSelection = trackSelection?.scope === directScope ? trackSelection : null;
  const captionItem = captionEditor.previewCues.find(cue => cue.id===captionEditor.selectedId);
  const chosenLane = explicitSelection?.kind === "audio" ? extraTimelineAudio
    : explicitSelection?.kind === "source-audio" ? sourceTimelineAudio
    : explicitSelection?.kind === "video-layer" ? extraTimelineVideo : di;
  const chosenItem = chosenLane.find(item=>item.id===explicitSelection?.id);
  const selectedTrack = captionItem ? {kind:"caption",item:captionItem}
    : chosenItem ? {kind:explicitSelection.kind,item:chosenItem} : null;
  if (l==="shot" && selectedTrack?.kind==="video-layer") fn=selectedTrack.item;
  const visibleLayer = editedPreview && layerAtTime(extraTimelineVideo,v);
  const splitTarget = selectedTrack || (kc ? {kind:"video",item:kc} : null);
  const trackDisabled = jo || trackBusy || captionEditor.busy || !!c || !!i || showInput;
  const videoMinimum = Math.max(.04,1/(ct?.fps || 24));
  const cutItem = splitTarget?.item;
  const cutEnd = cutItem?.last!==undefined && ["audio","video-layer","source-audio"].includes(splitTarget.kind)
    ? Math.min(Es,cutItem.start+cutItem.last-cutItem.first) : cutItem?.end;
  const cutMinimum = splitTarget?.kind==="video" ? videoMinimum : .04;
  const timelineEditor = {
    target:selectedTrack ? {kind:selectedTrack.kind,id:selectedTrack.item.id} : null,
    disabled:trackDisabled, videoMinimum,
    magnetic:!!e.project?.timeline_magnet, setMagnet:e.project ? setMainMagnet : null,
    snapping:e.settings.timeline_snap !== false,
    toggleSnap:()=>at("interface_preferences",{timeline_snap:e.settings.timeline_snap===false}),
    canSplit:!trackDisabled && !!cutItem && Math.min(v-cutItem.start,cutEnd-v)>=cutMinimum-.001 &&
      (splitTarget.kind!=="caption" || !!cutItem.text.trim()),
    canDelete:!trackDisabled && !!selectedTrack,
    split:()=>editTimelineTrack(splitTarget,"split"),
    remove:()=>editTimelineTrack(selectedTrack,"remove"),
    pause:pauseEditorPlayback,
    selectMedia:selectTimelineMedia, hasVideo:di.length>0 || extraTimelineVideo.length>0,
    addTrack:e.project ? kind=>workspaceCommand("timeline_track_add",{project:e.project.id,kind}) : null,
    addMedia:addTimelineAsset,
    editVideo:(item,operation,range)=>editTimelineTrack({kind:"video",item},operation,range),
    stepVideo:(item,direction)=>{
      const index=di.indexOf(item)+direction;
      if (di[index]) return editTimelineTrack({kind:"video",item},direction<0?"earlier":"later");
    },
    editMedia:(item,kind,operation,range)=>editTimelineTrack({kind,item},operation,range)
  };
  return (0, _.jsxs)("div", { className: "studio task-"`);
  code=once(code,'caption: da, captions:', `caption: da, captionEditor,
    timelineTransport, timelineTime:v,
    composition: editingLayout && e.project?.canvas ? {
      editor:clipEditor, project:e.project, enabled:editedPreview, setEnabled:setEditedPreview, selected:fn,
      select:selectPreviewShot, handles:l === "shot" && !captionEditor.draft && fn?.id != null && fn.id === (visibleLayer || kc)?.id,
      disabled:jo, library:e.motion, time:v, transport:timelineTransport
    } : null,
    captions:`);
  code=once(code,'toggleMute: IM, openMixer: ot })', `toggleMute: IM, openMixer: ot, captionEditor, resizable:editingLayout,
    showTrackTools:e.project ? showTrackTools : undefined, extraAudio:extraTimelineAudio, extraVideo:extraTimelineVideo,
    tracks:e.project?.timeline_tracks || [], editor:timelineEditor, timelineEmpty:e.project?.timeline_empty,
    stemScope:e.project?.id ?? e.source?.path ?? null })`);
  code=once(code,'audioTracks: e.audio_tracks || [], muted: m','audioTracks: e.project?.timeline_empty ? [] : e.audio_tracks || [], muted: timelineTransport.active ? timelineTransport.originalMuted || e.audio_mix?.original?.enabled === false : m');
  code=once(code,'canMute: !!(!A && ct?.url && Es > 0)','canMute: !!(!A && ct?.url && Es > 0 && (!timelineTransport.active || e.audio_mix?.original?.enabled !== false))');
  code=once(code,'(0, _.jsx)(EN, { open: c === "logs"', `e.project && c === "project-tools" && j.createElement(ProjectToolkit,{key:e.project.id,state:e,disabled:jo,command:workspaceCommand,close:Ie,seek:Dc}),
    e.project && c === "track-tools" && j.createElement(ClipTrackEditor,{key:e.project.id,project:e.project,shot:fn?.lane ? kc || di[0] : fn,time:v,command:workspaceCommand,close:Ie,disabled:jo,initialAudio}),
    (0, _.jsx)(EN, { open: c === "logs"`);
  code=once(code,'initialShot: fn?.id, openSettings:', 'initialShot: fn?.source_id || fn?.id, openSettings:');
  code=once(code,'await HT(q, G, w), await Pt(), G && f(G), pt(','await HT(q, G ? clipEditTarget(e.project, G) : l === "shot" ? {edit:1} : null, w), await Pt(), !G && setShowInput(false), G && f(G.id), pt(');
  return code;
});
patch('XT',code=>once(code,'className: "tool-icon", children: (0, C.jsx)(po, { size: 22 })',
  'className: "tool-icon", children: (0, C.jsx)(ToolboxIcon, { size: 22 })'));
patch('xM',code=>{
  code=once(code,'metadata: p })','metadata: p, inputPanel, captionEditor, composition, timelineTransport, timelineTime })');
  code=once(code,'t?.override ? t.label : e?.compatible ? "兼容预览" : "原片预览"',
    't?.override ? t.label : composition?.enabled ? "剪辑预览" : e?.compatible ? "兼容预览" : "原片预览"');
  code=once(code,'children: [$ && !t?.override &&', `children: [composition && !t?.override && w &&
      j.createElement(PreviewViewToggle,{active:composition.enabled,setActive:composition.setEnabled}), $ && !t?.override &&`);
  code=once(code,'(0, B.jsx)(D, { kind: "ghost", icon: qi, onClick: c, children: "回到原片" })',
    'j.createElement(PreviewHeaderAction,{icon:qi,label:"回到时间线",onClick:c})');
  code=once(code,'(0, B.jsx)(D, { kind: "ghost", icon: $t, disabled: x, onClick: n, children: d ? "正在生成预览…" : "兼容预览" })',
    'j.createElement(PreviewHeaderAction,{icon:$t,disabled:x,onClick:n,label:d ? "正在生成预览…" : "兼容预览"})');
  code=once(code,'A && (0, B.jsx)("button", { className: "center-play"', `composition && (composition.enabled || timelineTransport.active) && !t?.override &&
      j.createElement(ClipComposition,{...composition,player:a,url:w}), composition && !t?.override &&
      j.createElement(ClipPreviewTarget,{player:a,url:w,canvas:composition.enabled?composition.project.canvas:null,
        onSelect:composition.select,selected:composition.handles,disabled:composition.disabled}), A && (0, B.jsx)("button", { className: "center-play"`);
  code=once(code,'A && (0, B.jsx)("button", { className: "center-play"',
    'A && !captionEditor.draft && (!composition || t?.override) && (0, B.jsx)("button", { className: "center-play"');
  code=once(code,'s && !t?.override &&', '!t?.override && captionEditor.scope && (0,B.jsx)(ManualCaptionPreview,{editor:captionEditor,player:a,url:w,raised:!!s,canvas:composition?.enabled?composition.project.canvas:null,liveTime:timelineTransport.active?timelineTime:undefined},w), s && !t?.override &&');
  code=once(code,'(0, B.jsxs)(zw, { className: "media-controls"', 'timelineTransport.active ? j.createElement(LivePlaybackControls,{transport:timelineTransport,time:timelineTime}) : (0, B.jsxs)(zw, { className: "media-controls"');
  return once(code,'children: [w && !k ?','children: [inputPanel ? inputPanel : w && !k ?');
});
patch('SM',code=>{
  code=once(code,'openMixer: f })','openMixer: f, captionEditor, resizable, showTrackTools, extraAudio, extraVideo, tracks, editor, timelineEmpty, stemScope })');
  code=once(code,') {\n  let [v, L]',`) {
  const [viewport,setViewport]=Sa.useState(720),[fit,setFit]=Sa.useState(false);
  const [collapsedStemScope, setCollapsedStemScope] = Sa.useState(undefined);
  const showStems = collapsedStemScope !== stemScope;
  Sa.useEffect(() => setCollapsedStemScope(undefined), [stemScope]);
  let [v, L]`);
  code=once(code,', [x, p] = (0, Sa.useState)(false)','');
  code=once(code,'S = Math.max(0.01, a || 0)','S = rulerEnd');
  code=once(code,'g = (0, Sa.useMemo)(() => bN(a, v), [a, v]), ','');
  code=once(code,'  let [v, L]', '  const rulerEnd = Math.max(.01, a || 0) + (editor.hasVideo ? Math.max(1,Math.min(5,a*.125)) : 0);\n  let [v, L]');
  code=once(code,'I = d.filter((T) => T.id === "original" || T.id === "external" || x)',
    'I = Sa.useMemo(()=>splitTimelineAudioRows(d.filter((T) => T.id === "original" || T.id === "external" || showStems)),[d,showStems])');
  code=once(code,'"aria-pressed": x, title: x ? "收起分离音轨" : "展开分离音轨", onClick: () => p(!x), children: x ? "收起分轨" : "展开分轨"',
    `"aria-pressed": showStems, title: showStems ? "收起分离音轨" : "展开分离音轨",
      onClick: () => setCollapsedStemScope(showStems ? stemScope : undefined), children: showStems ? "收起分轨" : "展开分轨"`);
  code=once(code,'return (0, Sa.useEffect)',`Sa.useEffect(()=>{const node=m.current;if(!node)return;const update=()=>setViewport(Math.max(1,node.clientWidth));update();const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();},[]);
  const [dragPreview,setDragPreview] = Sa.useState(null);
  Sa.useEffect(()=>setDragPreview(null),[captionEditor.scope]);
  const extraLanes = Sa.useMemo(()=>timelineExtraLanes(extraAudio,extraVideo,tracks),[extraAudio,extraVideo,tracks]);
  const laneById = Sa.useMemo(()=>new Map([
    ...extraLanes.map(lane=>[lane.id,lane]),
    ["main",{kind:"video",items:e}],
    ...I.filter(track=>track.items).map(track=>[sourceTimelineLane(track),{kind:"audio",items:track.items}]),
    ...captionEditor.layout.groups.map((items,row)=>[captionTimelineLane(row),{kind:"caption",items}]),
  ]),[extraLanes,e,I,captionEditor.layout.groups]);
  const snapping = editor.snapping;
  const snapPoints = Sa.useMemo(()=>snapping ? timelineSnapPoints(e,I,extraAudio,extraVideo,captionEditor.previewCues,o) : [],
    [snapping,e,I,extraAudio,extraVideo,captionEditor.previewCues,o]);
  const timeline = {
    ...editor, mainClips:e, dragClips:dragPreview?.clips, setDragPreview, laneById, snapPoints,
  };
  const shortest=Math.max(0.05,Math.min(...e.map(s=>s.end-s.start).filter(n=>n>0),a||1));
  const readable=Math.min(12000,Math.max(viewport,e.length*96,a/shortest*56));
  const base=fit?viewport:readable;
  const rulerWidth = Math.round(base*v);
  const ticks = timelineRulerTicks(S, rulerWidth, v*Math.max(1,e.length/8), a<12);
  const zoomControl=useTimelineZoom(m,{readable,viewport,fit,zoom:v,setZoom:L,setFit,duration:a});
  return (0, Sa.useEffect)`);
  code=once(code,'!T || v === 1','!T || base*v <= viewport || zoomControl.ignoreFollow()');
  code=once(code,'}, [E, v]),','}, [E]),');
  code=once(code,'width: v * 100 + "%"','width: rulerWidth + "px"');
  code=once(code,'g.map((T) => (0, B.jsx)("span", { className: T / S > 0.91 ? "tick-end" : void 0, style: { left: T / S * 100 + "%" }, children: kt(T, a < 12) }, T))',
    'ticks.map(({time,alignRight,label}) => (0, B.jsx)("span", {className: alignRight ? "tick-end" : undefined, style: {left: time / S * 100 + "%"}, children: label}, time))');
  code=once(code,'disabled: v <= 1','disabled: zoomControl.value <= zoomControl.minimum + 0.0001');
  code=once(code,'disabled: v >= 4','disabled: zoomControl.value >= 4');
  code=once(code,'onClick: () => L(Math.max(1, v - 0.5))','onClick: () => zoomControl.change(zoomControl.value/1.25)');
  code=once(code,'onClick: () => L(Math.min(4, v + 0.5))','onClick: () => zoomControl.change(zoomControl.value*1.25)');
  code=once(code,'min: 1, max: 4, step: 0.25, value: [v]','min: zoomControl.minimum, max: 4, step: 0.01, value: [zoomControl.value]');
  code=once(code,'onValueChange: ([T]) => L(T)','onValueChange: ([T]) => zoomControl.change(T)');
  code=once(code,'className: "timeline-lanes", children:','className: "timeline-lanes", title: "按住 Ctrl 滚动滚轮缩放轨道", children:');
  code=once(code,'label: "适应时间线宽度"','label: "全片概览"');
  code=once(code,'L(1), m.current &&','setFit(true), L(1), m.current &&');
  code=once(code,'className: "timeline", "aria-label"', 'className: "timeline", onKeyDown:event=>timelineEditShortcut(event,timeline,!!dragPreview), style: {"--caption-visible-rows":Math.min(2,captionEditor.layout.rows)}, "aria-label"');
  code=once(code,'"aria-label": "分镜时间线", children: [', '"aria-label": "分镜时间线", children: [resizable && j.createElement(TimelineResizeGrip), ');
  code=once(code,'(0, B.jsxs)("div", { className: "timeline-track-label video-label"', 'captionEditor.scope && (0,B.jsx)(ManualCaptionLabel,{editor:captionEditor,time:o}), (0, B.jsxs)("div", { className: "timeline-track-label video-label"');
  code=once(code,'(0, B.jsxs)("div", { className: "shot-track"', 'captionEditor.scope && (0,B.jsx)(ManualCaptionLane,{editor:captionEditor,timeline,duration:S},captionEditor.scope), (0, B.jsxs)("div", { className: "shot-track", "data-timeline-lane":"main"');
  code=once(code,'className: "timeline-actions", children: [','className: "timeline-actions", children: [captionEditor.scope && j.createElement(TimelineEditActions,{editor}), showTrackTools && j.createElement(D,{kind:"ghost",icon:mu,onClick:showTrackTools},"轨道编辑"), ');
  code=once(code,'select: i, importFile: u }, T.id)','select: i, importFile: u, editor:timeline }, T.id)');
  code=once(code,'t ? "拆解完成后，镜头会按原片时间排在这里。"','timelineEmpty ? "分镜轨道为空。" : t ? "拆解完成后，镜头会按原片时间排在这里。"');
  code=once(code,'toggleMute: s }, T.id))]','toggleMute: s }, T.id+":"+(T.row||0))), j.createElement(ExtraTimelineTracks,{rows:extraLanes,labels:true,editor:timeline})]');
  code=once(code,'track: T, duration: a, time: o, seek: n, muted: T.id === "original" && c }, T.id)), a > 0',
    'track: T, duration: S, time: o, seek: n, muted: T.id === "original" && c, editor:timeline }, T.id+":"+(T.row||0))), j.createElement(ExtraTimelineTracks,{rows:extraLanes,duration:S,edit:showTrackTools,editor:timeline}), a > 0');
  code=once(code,'className: "playhead", style: { left: E + "%" } })',`className: "playhead", style: { left: E + "%" } }),
    dragPreview?.guide != null && j.createElement("div",{className:"timeline-snap-guide","aria-hidden":true,
      "data-time":dragPreview.guide,style:{left:dragPreview.guide/S*100+"%"}}),
    !!dragPreview && j.createElement(TimelineDragOverlay,{preview:dragPreview,duration:S})`);
  return code;
});
patch('vM',code=>{
  code=once(code,'  return (0, Wo.jsxs)', '  const label = timelineAudioLabel(e);\n  return (0, Wo.jsxs)');
  code=once(code,'title: e.label', 'title: label');
  code=once(code,'children: e.label', 'children: label');
  return once(code,'e.id === "original" && (0, Wo.jsx)', 'e.id === "original" && !e.row && (0, Wo.jsx)');
});
patch('LM',code=>{
  code=once(code,'seek: o, muted: l })','seek: o, muted: l, editor })');
  code=once(code,'let s = n.current, f = () => gN(s, c, t), v = new ResizeObserver(f);\n    return v.observe(s), f(), () => v.disconnect();',
    'const canvas = n.current;\n    return observeTimelineWaveform(canvas, () => gN(canvas, c, t));');
  code=once(code,'  return (0, Wo.jsxs)(wc,',`  if (e.items) return j.createElement(SourceAudioTimeline, {
    track:e,waveform:c,ready:c?.available?"ready":d?"unavailable":"loading",duration:t,muted:l,editor,seek:o
  });
  return (0, Wo.jsxs)(wc,`);
  code=once(code,'title: e.label + " · 点击波形定位原片"', 'title: timelineAudioLabel(e) + " · 点击波形定位原片"');
  code=once(code,'"aria-label": "定位" + e.label + "音频"', '"aria-label": labelText("定位{0}音频", timelineAudioLabel(e))');
  return code;
});
patch('fP',code=>{
  code=once(code, 'notify: l, openAdvanced: r })', 'notify: l, openAdvanced: r, state, openSettings })');
  code=once(code,'}, [t?.id, e?.id, l]), !e)', '}, [t?.id, e?.id, l, state?.prompt_revision]), !e)');
  code=once(code,`if (await v(), await a("reset_prompt", { shot: e.id }) !== void 0) try {
      let m = await Uo("prompt", { shot: e.id });
      n(m), c.current = m;
    } catch (m) {
      l(m.message, true);
    }`, `if (!await v()) return;
    const restored = await a("reset_prompt", { shot:e.id });
    if (typeof restored === "string") {
      n(restored);
      c.current = restored;
    }`);
  return once(code, '(0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)(D, { className: "wide", icon: Ro',
    'j.createElement(ComfyGenerationAction, {settings:state.settings,command:a,shot:e,text:i,disabled:!f,openSettings,save:v}), (0, M.jsxs)("section", { className: "inspector-block", children: [(0, M.jsx)(D, { className: "wide", icon: Ro');
});
patches.sort((a,b)=>b.start-a.start);
let result=original;
for(const p of patches)result=result.slice(0,p.start)+p.code+result.slice(p.end);
result=once(result,', yM = "视频拆解工作台"','');
const rootMarker='(0, Sx.createRoot)(document.getElementById("root")).render';
// Add helpers before the application's root mount, never after the mount.
const rootIndex=result.lastIndexOf('.createRoot)(');
if(rootIndex<0)throw Error('Root mount marker missing');
const expressionStart=result.lastIndexOf('\n',rootIndex)+1;
result=result.slice(0,expressionStart)+extra.join('\n')+'\n'+result.slice(expressionStart);
const names=new Map([
 ['高级工具','更多工具'],['高级工具工作区','更多工具工作区'],['实用工具','检查与抽帧'],['字幕与声音','外部字幕与音频'],['提示词与生成','批量生成与参考图'],
 ['多模态分析','AI 深度分析'],['恢复剪辑包装','保留原字幕和标题'],['导出复刻配方草稿','导出视频生成方案'],['生成复核文件','导出镜头复核文件'],['并入复核文件','导入镜头复核文件'],['查看元数据','查看视频参数']
]);
const edits=[];
function walk(node){if(!node||typeof node!=='object')return;if(node.type==='Literal'&&typeof node.value==='string'&&names.has(node.value))edits.push({start:node.start,end:node.end,text:JSON.stringify(names.get(node.value))});for(const [key,val] of Object.entries(node)){if(key==='start'||key==='end')continue;if(Array.isArray(val))val.forEach(walk);else if(val&&typeof val==='object')walk(val);}}
walk(parse(result,{ecmaVersion:'latest',sourceType:'module'}));
for(const e of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);
const localized=localizeWorkbench(result);
const inventoryPath=process.argv[2]==='--locale-inventory' && process.argv[3];
if(inventoryPath)fs.writeFileSync(inventoryPath,JSON.stringify(localized.keys,null,2));
const locales=JSON.parse(fs.readFileSync('src/locales.json','utf8'));
result='const interfaceDictionary = '+JSON.stringify(locales)+';\n'+localized.code;
const built=await transform(result,{minify:false,charset:'utf8',target:'es2022',legalComments:'inline'});
parse(built.code,{ecmaVersion:'latest',sourceType:'module'});
fs.mkdirSync('app/studio_web/assets',{recursive:true});
fs.writeFileSync('app/studio_web/assets/studio.js',built.code);
const styles=['web-base/studio.css','src/usability.css','src/manual-captions.css','src/agent-panel.css','src/settings.css',
  'src/clip-inspector.css','src/motion-panel.css','src/workspace-tools.css','src/timeline-controls.css','src/export-dialog.css','src/interface.css'];
fs.writeFileSync('app/studio_web/assets/studio.css',[
  ...styles.map(file=>fs.readFileSync(file,'utf8')), ...captionFontRules,
].join('\n'));
console.log('Built app/studio_web/assets/studio.js and studio.css');
