import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {browser} from './browser.mjs';
import {observePage} from './observe.mjs';
import {assess} from './assess.mjs';
const b=await browser();const root=new URL('./evidence/',import.meta.url);const result={protocol:'Paired hand-authored reference implementations, same fixed fictional data/tasks/tokens. Not independent agent generations or aesthetic scoring.',captures:[],checks:[],lab:[]};
const evaluate=b.evaluate;
const check=async(arm,name,expression)=>{try{const observed=await evaluate(expression);result.checks.push({arm,name,passed:!!observed,observed});}catch(error){result.checks.push({arm,name,passed:false,error:error.message});}};
const key=async(name,code,num)=>{for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:name,code,windowsVirtualKeyCode:num});};
const observe=()=>evaluate(`(${observePage.toString()})()`);
const set=async(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(e.type==='checkbox')e.checked=${JSON.stringify(value)};else e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
async function screenshot(path){const r=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const bytes=Buffer.from(r.data,'base64');await writeFile(new URL(path,root),bytes);return{path,sha256:createHash('sha256').update(bytes).digest('hex')};}
try{
 await mkdir(new URL('screenshots/',root),{recursive:true});
 for(const arm of ['before','after']){
 for(const width of [375,768,1440])for(const state of ['populated','empty','error','loading','edit','compare']){
  const query=state==='edit'?'edit=NS-1001':state==='compare'?'view=compare':`state=${state}`;
  await b.navigate(arm,query,width);const observation=await observe();const shot=await screenshot(`screenshots/${arm}-${width}-${state}.png`);
  result.captures.push({arm,width,height:1000,state,...shot,observation,findings:assess(observation),exceptions:b.events.filter(e=>e.method==='Runtime.exceptionThrown'),requests:b.events.filter(e=>e.method==='Network.requestWillBeSent').map(e=>e.params.request.url)});
 }
 for(const height of [500,320]){
  await b.navigate(arm,'edit=NS-1001',375);await b.send('Emulation.setDeviceMetricsOverride',{width:375,height,deviceScaleFactor:1,mobile:false});await delay(100);
  const observation=await observe();observation.dialogActions=await evaluate(`(()=>{const d=document.querySelector('#editor');return [...d.querySelectorAll('#cancel,button[type=submit]')].map(e=>{e.focus();e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));const hit=document.elementFromPoint(x,y);return{id:e.id||'save',open:d.open,reachableAfterReveal:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&(hit===e||e.contains(hit))};});})()`);
  result.captures.push({arm,width:375,height,state:'short-edit',...await screenshot(`screenshots/${arm}-375x${height}-edit.png`),observation,findings:assess(observation)});
 }
 await b.navigate(arm,'',375);
 await check(arm,'12 records retain original long names',"document.querySelectorAll('#rows tr').length===12&&document.body.textContent.includes('weighted base and extra-long braided power cable')");
 await check(arm,'read-only records lack edit controls in every representation',"!document.querySelector('[data-edit=\"NS-1004\"],[data-edit=\"NS-1005\"]')&&/role can.t edit/.test(document.body.textContent)");
 if(arm==='after'){
 await check(arm,'summary preserves critical fields and secondary detail',"[...document.querySelectorAll('.record-list article')].every(e=>/NS-10/.test(e.textContent)&&['Status','Stock','Price','Category','Permission'].every(t=>e.textContent.includes(t)))");
 await evaluate("document.querySelector('.record-list summary').focus()");await key(' ','Space',32);await check(arm,'record detail opens with keyboard',"document.querySelector('.record-list details').open");
 }
 await set('#search','ns-1002');await check(arm,'SKU search retains identity',"document.querySelectorAll('#rows tr').length===1&&document.querySelector('#rows').textContent.includes('Field notebook')");
 await evaluate("document.querySelector('#clear').click();document.querySelector('#filter-toggle').click()");await set('#status','Active');await set('#category','Stationery');await set('#low',true);
 await check(arm,'combined filters preserve exact two records',"document.querySelectorAll('#rows tr').length===2&&['NS-1002','NS-1008'].every(id=>document.querySelector('#rows').textContent.includes(id))");
 await evaluate("document.querySelector('#filter-toggle').click()");await check(arm,'active filter scope remains visible',"[...document.querySelectorAll('#active [data-remove]')].length===3&&document.querySelector('#clear').getClientRects().length>0");
 await set('#search','not-a-product');await check(arm,'filter-empty offers clear recovery',"!!document.querySelector('#empty-clear')");await evaluate("document.querySelector('#empty-clear').click()");
 await check(arm,'clearing restores collection',"document.querySelectorAll('#rows tr').length===12");
 await b.navigate(arm,'view=compare',375);await evaluate("document.querySelector('.table-scroll').focus()");await key('ArrowRight','ArrowRight',39);await delay(200);
 await check(arm,'comparison region keyboard scrolls',"document.querySelector('.table-scroll').scrollLeft>0");
 const touch=await evaluate("(()=>{const e=document.querySelector('.table-scroll');e.scrollLeft=0;const r=e.getBoundingClientRect();return{x:Math.min(innerWidth-30,r.left+250),y:Math.min(innerHeight-40,r.top+60)};})()");
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await b.send('Input.synthesizeScrollGesture',{...touch,xDistance:-180,yDistance:0,gestureSourceType:'touch'});await delay(200);
 await check(arm,'comparison responds to simulated touch scroll',"document.querySelector('.table-scroll').scrollLeft>0");result.checks.at(-1).interpretation='If false, touch validation remains missing; headless injection alone does not diagnose a physical touchscreen defect.';await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});
 await b.navigate(arm,'edit=NS-1004',375);await check(arm,'permission cannot be bypassed by edit URL',"!document.querySelector('#editor').open");
 await b.navigate(arm,'edit=NS-1001',375);await set('#name','Draft preserved on resize');await set('#stock','-1');await evaluate("document.querySelector('#edit-form').requestSubmit()");
 await check(arm,'invalid input survives correction',"document.querySelector('#editor').open&&document.querySelector('#name').value==='Draft preserved on resize'&&document.querySelector('#stock').value==='-1'&&document.querySelector('#stock').getAttribute('aria-invalid')==='true'");
 await evaluate("document.querySelector('#name').focus()");await b.send('Emulation.setDeviceMetricsOverride',{width:768,height:500,deviceScaleFactor:1,mobile:false});await delay(100);
 await check(arm,'draft and field focus survive layout change',"document.activeElement.id==='name'&&document.querySelector('#name').value==='Draft preserved on resize'");
 await set('#stock','43');await set('#price','70.25');await evaluate("document.querySelector('#edit-form').requestSubmit()");
 await check(arm,'save acknowledges and updates exact record',"!document.querySelector('#editor').open&&['Draft preserved on resize','43','$70.25'].every(t=>document.querySelector('#rows tr').textContent.includes(t))&&/saved/i.test(document.querySelector('#notice').textContent)");
 await check(arm,'save returns to a visible record action',"document.activeElement.dataset.edit==='NS-1001'&&document.activeElement.getClientRects().length>0");
 await b.navigate(arm,'edit=NS-1001',375);await set('#name','Unsaved mission 011 draft');await evaluate("document.querySelector('#cancel').click()");
 await check(arm,'dirty cancel exposes keep or discard',"document.querySelector('#discard').open");await evaluate("document.querySelector('#keep').click()");
 await check(arm,'keep editing retains draft',"document.querySelector('#editor').open&&document.querySelector('#name').value==='Unsaved mission 011 draft'");
 await evaluate("document.querySelector('#cancel').click();document.querySelector('#discard-confirm').click()");await check(arm,'discard closes without changing record',"!document.querySelector('#editor').open&&!document.querySelector('#rows').textContent.includes('Unsaved mission 011 draft')");
 await b.navigate(arm,'',1440);await evaluate("[...document.querySelectorAll('[data-edit=\"NS-1001\"]')].find(e=>e.getClientRects().length).focus()");await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:1000,deviceScaleFactor:1,mobile:false});await delay(100);
 await check(arm,'record identity retains keyboard focus on restructure',"document.activeElement.dataset.edit==='NS-1001'&&document.activeElement.getClientRects().length>0");
 await b.navigate(arm,'edit=NS-1001',375);let allInside=true;const focus=[];
 for(let i=0;i<16;i++){const f=await evaluate("({tag:document.activeElement.tagName,id:document.activeElement.id,inside:document.querySelector('#editor').contains(document.activeElement)})");focus.push(f);allInside&&=f.inside;await key('Tab','Tab',9);}
 result.checks.push({arm,name:'modal Tab sequence stays in editor',passed:allInside,certainty:allInside?'observed-pass':'review-warning',trace:focus,interpretation:'A BODY stop is a review warning, not proof of background-control access.'});
 await key('Escape','Escape',27);await check(arm,'Escape closes clean editor',"!document.querySelector('#editor').open");
 await b.navigate(arm,'state=error',375);await evaluate("document.querySelector('#retry').click()");await check(arm,'Retry restores records',"document.querySelectorAll('#rows tr').length===12");
 }
 // Laboratory tests deliberately separate justified scrolling and injected defects.
 for(const fault of ['', 'page','clip','uncued','nested']){
 await b.navigate('lab.html',fault?`fault=${fault}`:'',375);const o=await observe();const findings=assess(o);result.lab.push({fault:fault||'none',observation:o,findings,...await screenshot(`screenshots/lab-${fault||'none'}.png`)});
 }
 await b.navigate('lab.html','',375);
 await evaluate("document.querySelector('[data-for=carousel][data-step=\"1\"]').click()");await check('lab','hidden carousel track has operable next alternative',"document.querySelector('#carousel').scrollLeft>0&&getComputedStyle(document.querySelector('#carousel')).scrollbarWidth==='none'");
 await evaluate("document.querySelector('#navigation a:last-child').focus()");await check('lab','hidden navigation reveals focused link',"(()=>{const r=document.querySelector('#navigation a:last-child').getBoundingClientRect();return document.querySelector('#navigation').scrollLeft>0&&r.right<=innerWidth&&r.left>=0})()");
 await check('lab','filter chips wrap without clipping',"document.querySelector('#filter-chips').scrollWidth<=document.querySelector('#filter-chips').clientWidth+1");
 const expected={page:'page-overflow',clip:'critical-truncation',uncued:'scroll-discovery',nested:'nested-scroll'};
 for(const [fault,id]of Object.entries(expected))result.checks.push({arm:'lab',name:`injected ${fault} defect classified`,passed:result.lab.find(r=>r.fault===fault).findings.some(f=>f.id===id)});
 result.environment={node:process.version,browser:await b.send('Browser.getVersion')};
 await writeFile(new URL('browser-results.json',root),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({captures:result.captures.length,checks:result.checks.length,failures:result.checks.filter(c=>!c.passed),primaryActionTravel:result.captures.filter(r=>r.state==='populated'||r.state==='compare').map(r=>({arm:r.arm,width:r.width,state:r.state,maxHorizontalTravel:Math.max(0,...r.observation.actions.filter(a=>a.visibleRepresentation).map(a=>a.horizontalTravel))})),lab:result.lab.map(r=>({fault:r.fault,findings:r.findings.map(f=>f.id)}))},null,2));
}finally{await b.close();}
