// Supplemental controller checks adapt selectors to submitted implementations; rubric/task remain frozen.
import{browser}from'./browser.mjs';import{observe}from'./observe.mjs';import{writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const b=await browser(),results={checks:[],comparisons:[],shortEditors:[]};const ev=b.evaluate;const wait=()=>new Promise(r=>setTimeout(r,150));
const check=async(arm,name,expression)=>{try{const observed=await ev(expression);results.checks.push({arm,name,passed:!!observed,observed});}catch(e){results.checks.push({arm,name,passed:false,certainty:'harness-limitation',error:e.message});}};
const edit=()=>ev("[...document.querySelectorAll('[data-action=edit]')].find(e=>e.getClientRects().length&&!e.disabled)?.click()");
try{for(const arm of ['A','B','C']){
 await b.navigate(arm,'',375);await ev(`(()=>{for(const[id,value]of [['category','Inspection'],['status','Draft'],['stock',${JSON.stringify(arm==='C'?'zero':'out')}]]){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));}})()`);await wait();
 await check(arm,'combined filters retain matching SKU and exclude nonmatch',"document.body.innerText.includes('TRN-0141')&&!document.body.innerText.includes('TRN-0140')");
 await check(arm,'active criteria have removal controls',"[...document.querySelectorAll('button')].some(e=>e.getClientRects().length&&/remove|clear/i.test(e.getAttribute('aria-label')||e.textContent))");
 await b.navigate(arm,'',375);await ev("(()=>{const x=document.createElement('button');x.dataset.action='edit';x.dataset.recordId='TW-2104';(document.querySelector('#results')||document.querySelector('#app')||document.body).append(x);x.click();x.remove();})()");
 await check(arm,'forged restricted edit does not expose save',"![...document.querySelectorAll('[data-action=save]')].some(e=>e.getClientRects().length)");
 for(const state of ['empty','loading']){await b.navigate(arm,`state=${state}`,375);await check(arm,`${state} has explicit recovery`,"[...document.querySelectorAll('[data-action=retry]')].some(e=>e.getClientRects().length)");await ev("document.querySelector('[data-action=retry]')?.click()");await wait();await check(arm,`${state} recovery restores catalogue`,"document.body.innerText.includes('TRN-0140')");}
 await b.navigate(arm,'',375);await edit();await ev("(()=>{const e=[...document.querySelectorAll('[name=name]')].find(e=>e.getClientRects().length);e.value='Unsaved control draft';e.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-action=cancel]').click();})()");await wait();
 await check(arm,'dirty cancel retains draft with explicit choice',"[...document.querySelectorAll('[name=name]')].some(e=>e.getClientRects().length&&e.value==='Unsaved control draft')&&[...document.querySelectorAll('button')].some(e=>e.getClientRects().length&&/keep editing/i.test(e.textContent))");
 for(const width of [320,375,768]){
  await b.navigate(arm,'',width);let supported=false;
  if(arm==='B'){await ev("document.querySelector('#table-view').click()");supported=true;}
  if(arm==='C'){await ev("(()=>{const e=document.querySelector('#view');e.value='table';e.dispatchEvent(new Event('change',{bubbles:true}));})()");supported=true;}
  if(!supported){results.comparisons.push({arm,width,explicitComparisonControl:false,certainty:'review-warning',reason:'No separate aligned-comparison override found in source; default responsive representation retained.'});continue;}
  const observation=await ev(`(${observe.toString()})()`);const name=`screenshots/${arm}-${width}x1000-forced-comparison.png`;const r=await b.send('Page.captureScreenshot',{format:'png'});const bytes=Buffer.from(r.data,'base64');await writeFile(new URL('./evidence/'+name,import.meta.url),bytes);
  const region=await ev("(()=>{const e=[...document.querySelectorAll('[tabindex=\"0\"]')].find(e=>e.scrollWidth>e.clientWidth+1);if(!e)return null;e.focus();return {scroll:e.scrollLeft,label:e.getAttribute('aria-label')}})()");
  for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await wait();
  const keyboard=await ev("[...document.querySelectorAll('[tabindex=\"0\"]')].some(e=>e.scrollWidth>e.clientWidth+1&&e.scrollLeft>0)");results.comparisons.push({arm,width,explicitComparisonControl:true,path:name,sha256:createHash('sha256').update(bytes).digest('hex'),observation,region,keyboardScrolled:keyboard});
 }
 await b.navigate(arm,'',375);await edit();await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:320,deviceScaleFactor:1,mobile:false});await wait();
 const fields=[];for(const name of ['name','stock','price']){await ev(`(()=>{const e=[...document.querySelectorAll('[name=${name}]')].find(e=>e.getClientRects().length);e.focus();e.scrollIntoView({block:'nearest'});})()`);await wait();fields.push(await ev(`(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {name:${JSON.stringify(name)},rect:{top:r.top,bottom:r.bottom},centreHit:hit===e,focus:e.name===${JSON.stringify(name)}}})()`));}
 results.shortEditors.push({arm,width:375,height:320,fields});
}}finally{await b.close();await writeFile(new URL('./evidence/supplement.json',import.meta.url),JSON.stringify(results,null,2)+'\n');}console.log(JSON.stringify({checks:results.checks.length,comparisons:results.comparisons.length,shortEditors:results.shortEditors},null,2));
