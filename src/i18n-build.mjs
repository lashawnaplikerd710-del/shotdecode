import {parse} from 'acorn';

const chinese = /[\u3400-\u9fff]/u;
const nativeNames = new Set(['简体中文','繁體中文','日本語','影片字幕，字體預覽']);
const comparisons = new Set(['==','===','!=','!==','<','<=','>','>=']);
const matchCalls = new Set(['startsWith','endsWith','includes','indexOf','split','match','replace','replaceAll']);

export function localizeWorkbench(code) {
  const inventory = new Set();
  const edits = [];
  function visit(node,parent) {
    if (!node || typeof node!=='object') return;
    // Font family keys are shared with the exporter and the installed font catalog.
    if (node.type==='VariableDeclarator' && node.id.name==='captionFontCatalog') return;
    if (node.type==='Property' && node.key.name==='sample') return;
    if (node.type==='Literal' && typeof node.value==='string' && chinese.test(node.value) && !nativeNames.has(node.value)) {
      const propertyKey = parent?.key===node && !parent.computed;
      const test = parent?.type==='SwitchCase' && parent.test===node ||
        parent?.type==='BinaryExpression' && comparisons.has(parent.operator) ||
        parent?.type==='CallExpression' && matchCalls.has(parent.callee.property?.name);
      if (!propertyKey && !test) {
        inventory.add(node.value);
        if (!(parent?.type==='CallExpression' && parent.callee.name==='labelText' && parent.arguments[0]===node)) {
          edits.push({start:node.start,end:node.end,text:'labelText('+JSON.stringify(node.value)+')'});
        }
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(child=>visit(child,node));
      else if (value && typeof value==='object') visit(value,node);
    }
  }
  visit(parse(code,{ecmaVersion:'latest',sourceType:'module'}),null);
  for (const {start,end,text} of edits.sort((a,b)=>b.start-a.start)) code=code.slice(0,start)+text+code.slice(end);
  return {code,keys:[...inventory].sort()};
}
