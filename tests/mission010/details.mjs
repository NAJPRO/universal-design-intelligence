import { evidenceRoot } from './config.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { browser } from './browser.mjs';
const b=await browser();const result={note:'Focused follow-up on frozen outputs; no implementation changes. Screenshots at 375 CSS px, DPR 1. Native browser confirmation dialogs are CDP events and absent from page screenshots.',arms:{}};
async function shot(arm,state){const r=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const path=`details/${arm}-${state}.png`;await writeFile(new URL(path,evidenceRoot),Buffer.from(r.data,'base64'));return path;}
try{await mkdir(new URL('details/',evidenceRoot),{recursive:true});for(const arm of ['A','B','C']){
 const evalJs=b.evaluate;
 const key=async()=>{for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:'Tab',code:'Tab',windowsVirtualKeyCode:9});};
 await b.navigate(arm,'edit=NS-1001',375);const trace=[];
 for(let i=0;i<16;i++){trace.push(await evalJs("({tag:document.activeElement.tagName,id:document.activeElement.id,inside:document.querySelector('#editor').contains(document.activeElement),dialogOpen:document.querySelector('#editor').open})"));await key();}
 await evalJs("(()=>{const f=document.querySelector('#editor form');f.elements.name.value='';f.elements.stock.value='-1';f.elements.price.value='0';f.dispatchEvent(new Event('input',{bubbles:true}));f.requestSubmit();})()");
 const invalid=await shot(arm,'invalid');const errorLinks=await evalJs("[...document.querySelectorAll('#editor [role=alert] a')].map(e=>({text:e.textContent,href:e.getAttribute('href')}))");
 b.setDialogAction(false);await evalJs(`document.querySelector('#${arm==='C'?'cancel':'cancel-editor'}').click()`);
 const custom=await evalJs("!!document.querySelector('#discard')?.open");const discard=await shot(arm,'discard');
 if(custom){await evalJs("document.querySelector('#discard-confirm').click()");}else{b.setDialogAction(true);await evalJs("document.querySelector('#cancel-editor').click()");}
 await b.navigate(arm,'',375);
 await evalJs(`(()=>{document.querySelector('#filter-toggle').click();for(const [id,value]of [['${arm==='C'?'status':'status-filter'}','Active'],['${arm==='C'?'category':'category-filter'}','Stationery']]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('change'));}const e=document.getElementById('${arm==='C'?'low':'low-filter'}');e.checked=true;e.dispatchEvent(new Event('change'));document.querySelector('#filter-toggle').click();})()`);
 const scope=await evalJs("({text:document.querySelector('main').innerText,removableChips:[...document.querySelectorAll('[data-remove]')].map(e=>({name:e.getAttribute('aria-label'),text:e.innerText})),expanded:document.querySelector('#filter-toggle').getAttribute('aria-expanded')})");const filters=await shot(arm,'collapsed-filters');
 result.arms[arm]={focusTrace:trace,errorLinks,customDiscardDialog:custom,scope,screenshots:{invalid,discard,filters}};
}
await writeFile(new URL('details.json',evidenceRoot),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(result.arms).map(([arm,r])=>[arm,{bodyStops:r.focusTrace.filter(t=>!t.inside),errorLinks:r.errorLinks.length,customDiscard:r.customDiscardDialog,chips:r.scope.removableChips.length}])),null,2));
}finally{await b.close();}
