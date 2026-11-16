import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'acorn';
import {transform} from 'esbuild';

function once(code,before,after,label=before.slice(0,80)){
  if(code.split(before).length!==2)throw Error('Expected exactly one occurrence: '+label);
  return code.replace(before,after);
}
const original=fs.readFileSync('web-base/studio.js','utf8');
const originalTree=parse(original,{ecmaVersion:'latest',sourceType:'module'});
const originals=originalTree.body.filter(n=>n.type==='FunctionDeclaration');
const custom=(await transform(fs.readFileSync('src/components.jsx','utf8'),{loader:'jsx',jsxFactory:'j.createElement',jsxFragment:'j.Fragment',target:'es2022',charset:'utf8'})).code;
const customTree=parse(custom,{ecmaVersion:'latest',sourceType:'module'});
const patches=[];
const extra=[];
for(const n of customTree.body){
  if(n.type!=='FunctionDeclaration')throw Error('Custom source must only contain functions');
  const old=originals.find(o=>o.id.name===n.id.name), code=custom.slice(n.start,n.end);
  if(old)patches.push({...old,code}); else extra.push(code);
}
function patch(name,apply){const old=originals.find(n=>n.id.name===name);if(!old)throw Error(name);patches.push({...old,code:apply(original.slice(old.start,old.end))});}
patch('IN',code=>{
  code=once(code,'function IN() {','function IN() {\n  const [inputMode,setInputMode]=j.useState("local"),[linkText,setLinkText]=j.useState(""),[showInput,setShowInput]=j.useState(false),[linkSubmitting,setLinkSubmitting]=j.useState(false);');
  code=once(code,'let Et = e?.active || e?.importing;','j.useEffect(()=>{if(e?.link_import?.phase==="failed"){setShowInput(true);setInputMode("link");}else if(e?.source&&["analyzing","completed"].includes(e?.link_import?.phase))setShowInput(false);},[e?.source?.path,e?.link_import?.phase]);\n  let Et = e?.active || e?.importing;');
  code=once(code,'className: "studio"','className: "studio task-" + l + ((!ct || showInput) ? " source-input-open" : "")');
  code=once(code,'(0, _.jsxs)("div", { className: "shell"','(0, _.jsx)(WorkflowGuide, {state:e,tab:l,onTab:xh,command:at,onExport:()=>h("export"),openInput,disabled:jo||linkSubmitting}), (0, _.jsxs)("div", { className: "shell"');
  code=once(code,'seek: Dc, notify: pt }), i &&','seek: Dc, notify: pt, openMixer: ot, openInput }), i &&');
  code=once(code,'async function TM() {\n    await at("new") !== void 0 && xh("analysis");\n  }',`function openInput(mode){
    if(jo||linkSubmitting)return;
    Ve.current?.pause();xh("analysis");setShowInput(true);
    if(mode)setInputMode(mode);
  }
  async function pickLocal(){
    if(jo||linkSubmitting)return;
    await at("pick_source");const next=await Pt();
    if(next.source&&!next.project)setShowInput(false);
  }
  async function analyzeLink(){
    if(jo||linkSubmitting||!linkText.trim())return;
    setLinkSubmitting(true);
    try{await at("analyze_link",{text:linkText,options:u});}finally{setLinkSubmitting(false);}
  }
  async function TM(){
    if(jo||linkSubmitting)return;
    await at("new");xh("analysis");setShowInput(true);setInputMode("local");setLinkText("");
  }`);
  code=once(code,'onPick: () => at("pick_source"), onVolume: vS','onPick: () => openInput(), inputPanel: (!ct || showInput) ? j.createElement(SourceImportPanel,{state:e,mode:inputMode,setMode:setInputMode,text:linkText,setText:setLinkText,onPick:pickLocal,onAnalyze:analyzeLink,onBack:()=>setShowInput(false),disabled:jo,submitting:linkSubmitting}) : null, onVolume: vS');
  code=once(code,'await HT(q, G, w), await Pt(), G && f(G), pt(','await HT(q, G, w), await Pt(), !G && setShowInput(false), G && f(G), pt(');
  return code;
});
patch('xM',code=>{
  code=once(code,'metadata: p })','metadata: p, inputPanel })');
  return once(code,'children: [w && !k ?','children: [inputPanel ? inputPanel : w && !k ?');
});
patch('SM',code=>{
  code=once(code,') {\n  let [v, L]',') {\n  const [viewport,setViewport]=Sa.useState(720),[fit,setFit]=Sa.useState(false);\n  let [v, L]');
  code=once(code,'bN(a, v), [a, v]','bN(a, v*Math.max(1,e.length/8)), [a, v, e.length]');
  code=once(code,'return (0, Sa.useEffect)',`Sa.useEffect(()=>{const node=m.current;if(!node)return;const update=()=>setViewport(Math.max(1,node.clientWidth));update();const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();},[]);
  const shortest=Math.max(0.05,Math.min(...e.map(s=>s.end-s.start).filter(n=>n>0),a||1));
  const readable=Math.min(12000,Math.max(viewport,e.length*96,a/shortest*56));
  const base=fit?viewport:readable;
  const zoomControl=useTimelineZoom(m,{readable,viewport,fit,zoom:v,setZoom:L,setFit,duration:a});
  return (0, Sa.useEffect)`);
  code=once(code,'!T || v === 1','!T || base*v <= viewport || zoomControl.ignoreFollow()');
  code=once(code,'}, [E, v]),','}, [E]),');
  code=once(code,'width: v * 100 + "%"','width: Math.round(base*v) + "px"');
  code=once(code,'disabled: v <= 1','disabled: zoomControl.value <= zoomControl.minimum + 0.0001');
  code=once(code,'disabled: v >= 4','disabled: zoomControl.value >= 4');
  code=once(code,'onClick: () => L(Math.max(1, v - 0.5))','onClick: () => zoomControl.change(zoomControl.value/1.25)');
  code=once(code,'onClick: () => L(Math.min(4, v + 0.5))','onClick: () => zoomControl.change(zoomControl.value*1.25)');
  code=once(code,'min: 1, max: 4, step: 0.25, value: [v]','min: zoomControl.minimum, max: 4, step: 0.01, value: [zoomControl.value]');
  code=once(code,'onValueChange: ([T]) => L(T)','onValueChange: ([T]) => zoomControl.change(T)');
  code=once(code,'className: "timeline-lanes", children:','className: "timeline-lanes", title: "按住 Ctrl 滚动滚轮缩放轨道", children:');
  code=once(code,'label: "适应时间线宽度"','label: "全片概览"');
  code=once(code,'L(1), m.current &&','setFit(true), L(1), m.current &&');
  return code;
});
patch('KT',code=>once(code,'className: "modal-content", children: [','className: "modal-content", children: [(0,_e.jsx)(AudioMixHelp,{levels:i}), '));
patches.sort((a,b)=>b.start-a.start);
let result=original;
for(const p of patches)result=result.slice(0,p.start)+p.code+result.slice(p.end);
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
const built=await transform(result,{minify:false,charset:'utf8',target:'es2022',legalComments:'inline'});
parse(built.code,{ecmaVersion:'latest',sourceType:'module'});
fs.mkdirSync('app/studio_web/assets',{recursive:true});
fs.writeFileSync('app/studio_web/assets/studio.js',built.code);
fs.writeFileSync('app/studio_web/assets/studio.css',fs.readFileSync('web-base/studio.css','utf8')+'\n'+fs.readFileSync('src/usability.css','utf8'));
console.log('Built app/studio_web/assets/studio.js and studio.css');
