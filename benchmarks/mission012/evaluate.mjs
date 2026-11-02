import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import{browser}from'./browser.mjs';import{observe}from'./observe.mjs';
const root=new URL('./evidence/',import.meta.url);await mkdir(new URL('screenshots/',root),{recursive:true});const b=await browser();const results={captures:[],checks:[],warnings:[]};
const ev=b.evaluate;const delay=()=>new Promise(r=>setTimeout(r,150));
const check=async(arm,name,expr)=>{try{const observed=await ev(expr);results.checks.push({arm,name,passed:!!observed,observed});}catch(e){results.checks.push({arm,name,passed:false,error:e.message,certainty:'harness-limitation'});}};
const visibleEdit="[...document.querySelectorAll('[data-action=edit]')].find(e=>e.getClientRects().length&&!e.disabled&&e.getAttribute('aria-disabled')!=='true')";
const edit=async()=>{await ev(`(${visibleEdit})?.click()`);await delay();};
const shot=async(arm,width,height,state)=>{const observation=await ev(`(${observe.toString()})()`);const r=await b.send('Page.captureScreenshot',{format:'png'});const bytes=Buffer.from(r.data,'base64');const path=`screenshots/${arm}-${width}x${height}-${state}.png`;await writeFile(new URL(path,root),bytes);results.captures.push({arm,width,height,state,path,sha256:createHash('sha256').update(bytes).digest('hex'),observation,exceptions:b.events.filter(x=>x.method==='Runtime.exceptionThrown')});};
const key=async(key,code,num)=>{for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:num});};
try{
 for(const arm of ['A','B','C']){
  for(const width of [320,375,768,1440])for(const state of ['populated','empty','loading','error','edit']){await b.navigate(arm,['populated','edit'].includes(state)?'':`state=${state}`,width);if(state==='edit')await edit();await shot(arm,width,1000,state);}
  await b.navigate(arm,'',375);await edit();await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:320,deviceScaleFactor:1,mobile:false});await ev("document.querySelector('[data-action=save]')?.scrollIntoView({block:'nearest'})");await delay();await shot(arm,375,320,'edit');
  await check(arm,'short editor save can be revealed',"(()=>{const e=document.querySelector('[data-action=save]');if(!e?.getClientRects().length)return false;const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth})()");
  await b.navigate(arm,'',375);
  await check(arm,'no authorized-looking edit for restricted records',"[...document.querySelectorAll('[data-action=edit]')].filter(e=>e.getClientRects().length&&!e.disabled&&e.getAttribute('aria-disabled')!=='true').every(e=>!['TW-2104','TW-2108','TW-2113','TW-2117'].includes(e.dataset.recordId))");
  await ev("(()=>{const e=document.querySelector('[data-testid=search]');e.value='TRN-0140';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()");await delay();
  await check(arm,'search finds exact SKU and narrows results',"document.body.innerText.includes('TRN-0140')&&!document.body.innerText.includes('TRN-0141')");
  await b.navigate(arm,'',375);await edit();
  await ev("(()=>{for(const [name,value]of [['name',''],['stock','-1'],['price','0']]){const e=[...document.querySelectorAll(`[name=${name}]`)].find(e=>e.getClientRects().length);if(e){e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));}}document.querySelector('[data-action=save]')?.click();})()");await delay();
  await check(arm,'invalid editor input remains for correction',"(()=>{const e=[...document.querySelectorAll('[name=stock]')].find(e=>e.getClientRects().length);return e?.value==='-1'&&!!document.querySelector('[data-action=save]')?.getClientRects().length})()");
  await ev("(()=>{for(const [name,value]of [['name','Mission Twelve verified change'],['stock','23'],['price','44.75']]){const e=[...document.querySelectorAll(`[name=${name}]`)].find(e=>e.getClientRects().length);if(e){e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));}}document.querySelector('[data-action=save]')?.click();})()");await delay();
  await check(arm,'valid save changes visible record',"document.body.innerText.includes('Mission Twelve verified change')&&!document.querySelector('[data-action=save]')?.getClientRects().length");
  await check(arm,'save returns to visible record control',"document.activeElement?.dataset.recordId==='TW-2101'&&!!document.activeElement.getClientRects().length");
  await b.navigate(arm,'',1440);await ev(`(${visibleEdit})?.focus()`);const focused=await ev('document.activeElement.dataset.recordId');await b.send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:false});await delay();
  await check(arm,'record focus survives width restructuring',`document.activeElement.dataset.recordId===${JSON.stringify(focused)}&&!!document.activeElement.getClientRects().length`);
  await b.navigate(arm,'',375);await edit();const trace=[];for(let i=0;i<18;i++){trace.push(await ev("({tag:document.activeElement.tagName,id:document.activeElement.id,name:document.activeElement.getAttribute('name'),dialog:!!document.activeElement.closest('dialog,[role=dialog]')})"));await key('Tab','Tab',9);}results.checks.push({arm,name:'sampled editor Tab sequence',trace,certainty:'review-required'});
  await b.navigate(arm,'state=error',375);await check(arm,'error exposes retry',"!![...document.querySelectorAll('[data-action=retry]')].find(e=>e.getClientRects().length)");await ev("document.querySelector('[data-action=retry]')?.click()");await delay();await check(arm,'retry recovers records',"document.body.innerText.includes('TRN-0140')");
 }
 results.environment={browser:await b.send('Browser.getVersion'),node:process.version};
}finally{await b.close();await writeFile(new URL('browser-results.json',root),JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify({captures:results.captures.length,checks:results.checks.length},null,2));
