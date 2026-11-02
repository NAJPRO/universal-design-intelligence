import {browser} from './tools/browser.mjs';
import {writeFile} from 'node:fs/promises';
const b=await browser(),checks=[];
const check=async(name,expr)=>{const pass=await b.evaluate(expr);checks.push({name,pass});if(!pass)throw Error(name);};
const click=s=>b.evaluate(`document.querySelector(${JSON.stringify(s)}).click()`);
const fill=(s,value,event='input')=>b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(s)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`);
const key=async key=>{await b.send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:({Escape:27,Tab:9,ArrowRight:39})[key]});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:({Escape:27,Tab:9,ArrowRight:39})[key]});};
try{
 await b.navigate('index.html','',1440);
 await check('18 products and 14 authorized editors','document.querySelectorAll("tbody tr").length===18 && document.querySelectorAll("[data-action=edit]").length===14');
 await fill('#search','trn-0140');await check('Case-insensitive SKU search','document.querySelectorAll("tbody tr").length===1 && document.querySelector("tbody tr").dataset.recordId==="TW-2101"');
 await click('[data-action=clear]');await fill('#category','Inspection','change');await fill('#status','Draft','change');await fill('#stock','out','change');
 await check('AND filters and removable chips','document.querySelectorAll("tbody tr").length===3 && document.querySelectorAll("[data-remove]").length===3');
 await fill('#search','no-such-record');await check('Filtered empty state retains active criteria','!document.querySelector("tbody") && document.querySelectorAll("[data-remove]").length===4');
 await click('#results [data-action=clear]');await check('Clear restores data and focus','document.querySelectorAll("tbody tr").length===18 && document.activeElement.id==="search"');
 await click('[data-action=edit][data-record-id="TW-2101"]');await check('Editor name receives focus','document.activeElement.name==="name"');
 await fill('[name=name]','   ');await fill('[name=stock]','-2.5');await fill('[name=price]','Infinity');await click('[data-action=save]');
 await check('Three validation errors retain input and focus summary','document.querySelector("[name=stock]").value==="-2.5" && document.querySelector("[name=price]").value==="Infinity" && document.querySelectorAll("[aria-invalid=true]").length===3 && document.activeElement.id==="error-summary"');
 await click('#error-summary a');await check('Error link focuses field','document.activeElement.name==="name"');
 await fill('[name=name]','Updated bracket');await fill('[name=stock]','0');await fill('[name=price]','25.75');await click('#editor [data-action=cancel]');
 await check('Unsaved cancel offers safe choice','!document.querySelector("#discard-confirm").hidden && document.activeElement.dataset.action==="stay" && document.querySelector("#editor").inert');
 await key('Escape');await check('Escape keeps unsaved input','document.querySelector("#discard-confirm").hidden && document.querySelector("[name=name]").value==="Updated bracket"');
 await click('[data-action=save]');await check('Save updates values and acknowledges','!document.querySelector("dialog").open && document.querySelector("tbody tr").textContent.includes("Updated bracket") && document.querySelector("tbody tr").textContent.includes("$25.75") && document.querySelector("#notice").textContent.includes("Saved TRN-0140")');
 await check('Save restores edit focus','document.activeElement.dataset.action==="edit" && document.activeElement.dataset.recordId==="TW-2101"');
 await click('[data-action=edit][data-record-id="TW-2101"]');await fill('[name=name]','discard this');await key('Escape');await click('[data-action=discard]');
 await check('Discard preserves saved record','!document.querySelector("dialog").open && document.querySelector("tbody tr").textContent.includes("Updated bracket")');
 await click('[data-action=details][data-record-id="TW-2104"]');await check('Restricted detail provides reason and sourcing','document.querySelector("dialog").textContent.includes("Managed by procurement; inventory role can consult only.") && !document.querySelector("dialog [data-action=edit]") && document.querySelector("dialog").textContent.includes("28 days")');
 await click('dialog [data-action=cancel]');
 await b.evaluate('(()=>{const x=document.createElement("button");x.dataset.action="edit";x.dataset.recordId="TW-2104";document.body.append(x);x.click();x.remove();})()');
 await check('Forged restricted edit blocked','!document.querySelector("dialog").open && document.querySelector("#notice").textContent.includes("read only")');
 await click('[data-action=edit][data-record-id="TW-2101"]');await b.evaluate('document.querySelector("#editor").dataset.recordId="TW-2104"');await fill('[name=name]','Session-owned identity');await click('[data-action=save]');
 await check('DOM mutation cannot retarget save','document.querySelector("tr[data-record-id=TW-2101]").textContent.includes("Session-owned identity") && document.querySelector("tr[data-record-id=TW-2104]").textContent.includes("Adjustable inspection light")');
 await b.evaluate('document.querySelector("#search").focus()');await key('Tab');await check('Keyboard tab order from search to category','document.activeElement.id==="category"');
 for(const width of [320,375,768,1440]){
  await b.navigate('index.html','',width);await check(`No page overflow at ${width}`,'document.documentElement.scrollWidth<=innerWidth');
  await click('[data-action=edit][data-record-id="TW-2101"]');await fill('[name=stock]','9');await b.evaluate('document.querySelector("[name=stock]").focus()');
  await b.send('Emulation.setDeviceMetricsOverride',{width:width===320?768:320,height:480,deviceScaleFactor:1,mobile:false});
  await check(`Focus and input survive resize from ${width}`,'document.activeElement.name==="stock" && document.querySelector("[name=stock]").value==="9"');
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:480,deviceScaleFactor:1,mobile:false});
  await b.evaluate('document.querySelector("[data-action=save]").scrollIntoView({block:"center"})');
  await check(`Save reachable at ${width}x480`,'(()=>{let r=document.querySelector("[data-action=save]").getBoundingClientRect();return r.top>=0&&r.bottom<=480})()');await click('[data-action=save]');
 }
 await b.navigate('index.html','',375);await click('#table-view');await check('Comparison scroll is local','(()=>{const e=document.querySelector(".table-scroll");return e.scrollWidth>e.clientWidth && document.documentElement.scrollWidth<=innerWidth})()');
 await b.evaluate('document.querySelector(".table-scroll").focus()');await key('ArrowRight');await new Promise(r=>setTimeout(r,200));await check('Arrow key scrolls comparison region','document.querySelector(".table-scroll").scrollLeft>0');
 for(const state of ['empty','loading','error']){
  await b.navigate('index.html',`state=${state}`,375);await check(`${state} deterministic state`,'!document.querySelector("tbody tr") && !!document.querySelector("[data-action=retry]")');
  if(state==='loading'){await new Promise(r=>setTimeout(r,500));await check('Loading remains pending','document.querySelector("#results").getAttribute("aria-busy")==="true"');}
  await click('[data-action=retry]');await check(`${state} recovery`,'document.querySelectorAll("tbody tr").length===18 && document.activeElement.id==="inventory"');
 }
 checks.push({name:'Runtime exceptions on final navigation',pass:!b.events.some(e=>e.method==='Runtime.exceptionThrown')});
 console.log(JSON.stringify(checks,null,2));
}finally{await writeFile('verification.json',JSON.stringify(checks,null,2));await b.close();}
