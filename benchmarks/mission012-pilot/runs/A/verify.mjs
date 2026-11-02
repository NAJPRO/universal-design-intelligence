import {browser} from './tools/browser.mjs';
import {writeFile} from 'node:fs/promises';
const b=await browser();
const checks=[];
async function run(name, expression) { const result=await b.evaluate(expression); checks.push({name,result}); if(!result) console.error("FAILED:",name); }
async function shot(path) { const s=await b.send('Page.captureScreenshot',{format:'png'}); await writeFile(path,Buffer.from(s.data,'base64')); }
try {
 await b.navigate('index.html','',1440);
 await run('18 populated records',`document.querySelectorAll('tbody tr').length===18`);
 await run('desktop no page overflow',`document.documentElement.scrollWidth<=innerWidth`);
 await shot('desktop.png');
 await run('combined filters and count',`(()=>{for(const [id,v] of [['category','Inspection'],['status','Draft'],['stock','out']]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));}return document.querySelectorAll('tbody tr').length===3 && document.querySelector('#result-count').textContent==='Showing 3 of 18 products'})()`);
 await run('search combines with filters',`(()=>{const e=document.querySelector('#search');e.value='TRN-0141';e.dispatchEvent(new Event('input'));return document.querySelectorAll('tbody tr').length===1})()`);
 await run('clear all restores results',`(()=>{document.querySelector('#clear-all').click();return document.querySelectorAll('tbody tr').length===18 && document.activeElement.id==='search'})()`);
 await run('full restricted details',`(()=>{document.querySelector('[data-action=view][data-record-id="TW-2104"]').click();const d=document.querySelector('dialog');return d.open && d.textContent.includes('Alder Fabrication') && d.textContent.includes('28 days') && d.textContent.includes('Managed by procurement') && !d.querySelector('[data-action=edit]')})()`);
 await run('injected restricted edit blocked',`(()=>{document.querySelector('dialog [data-action=cancel]').click();const e=document.createElement('button');e.dataset.action='edit';e.dataset.recordId='TW-2104';document.body.append(e);e.click();e.remove();return !document.querySelector('dialog').open})()`);
 await run('authorized editing',`(()=>{document.querySelector('[data-action=edit][data-record-id="TW-2101"]').click();return document.querySelector('dialog').open && document.activeElement.name==='name'})()`);
 await run('invalid values retained with errors',`(()=>{document.querySelector('[name=name]').value=' ';document.querySelector('[name=stock]').value='-1';document.querySelector('[name=price]').value='0';document.querySelector('[data-action=save]').click();return document.querySelectorAll('[aria-invalid=true]').length===3 && document.querySelector('[name=stock]').value==='-1' && document.querySelector('[name=name]').value===' '})()`);
 await run('fractional stock rejected',`(()=>{document.querySelector('[name=name]').value='Updated bracket';document.querySelector('[name=stock]').value='1.5';document.querySelector('[name=price]').value='25';document.querySelector('[data-action=save]').click();return document.querySelector('[name=stock]').getAttribute('aria-invalid')==='true'})()`);
 await run('unsaved cancel preserves inputs',`(()=>{document.querySelector('form [data-action=cancel]').click();return !document.querySelector('#discard-confirmation').hidden && document.querySelector('[name=name]').value==='Updated bracket'})()`);
 await run('keep editing and save succeeds with focus return',`(()=>{document.querySelector('[data-action=keep-editing]').click();document.querySelector('[name=stock]').value='0';document.querySelector('[data-action=save]').click();return !document.querySelector('dialog').open && document.querySelector('[data-action=view][data-record-id="TW-2101"]').textContent==='Updated bracket' && document.activeElement.dataset.action==='edit' && document.querySelector('#notification').textContent.includes('saved')})()`);
 await run('discard returns to prior values',`(()=>{document.querySelector('[data-action=edit][data-record-id="TW-2101"]').click();document.querySelector('[name=name]').value='Discard me';document.querySelector('form [data-action=cancel]').click();document.querySelector('[data-action=discard]').click();document.querySelector('[data-action=edit][data-record-id="TW-2101"]').click();return document.querySelector('[name=name]').value==='Updated bracket'})()`);
 await run('escape triggers unsaved protection',`(()=>{document.querySelector('[name=name]').value='Unsaved';document.querySelector('dialog').dispatchEvent(new Event('cancel',{cancelable:true}));return !document.querySelector('#discard-confirmation').hidden})()`);
 await b.evaluate(`document.querySelector('[data-action=discard]').click()`);
 for(const state of ['empty','loading','error']) {
   await b.navigate('index.html',`state=${state}`,768);
   await run(`${state} deterministic and recoverable`,`document.querySelectorAll('tbody tr').length===0 && !!document.querySelector('[data-action=retry]')`);
   if(state==='loading') {await new Promise(r=>setTimeout(r,300));await run('loading remains pending',`document.querySelector('#result-count').textContent==='Loading inventory…'`);}
   await run(`${state} recovery loads records`,`(()=>{document.querySelector('[data-action=retry]').click();return document.querySelectorAll('tbody tr').length===18})()`);
 }
 await b.navigate('index.html','',375);
 await run('mobile no horizontal overflow',`document.documentElement.scrollWidth<=innerWidth`);
 await run('mobile names wrap fully',`getComputedStyle(document.querySelector('tr')).display==='grid' && getComputedStyle(document.querySelector('.product-name')).overflow!=='hidden'`);
 await shot('mobile.png');
 await b.evaluate(`document.querySelector('[data-action=edit]').click()`);
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:480,deviceScaleFactor:1,mobile:false});
 await run('short viewport dialog scrolls within viewport',`(()=>{const d=document.querySelector('dialog');return d.getBoundingClientRect().height<=innerHeight && d.scrollHeight>d.clientHeight})()`);
 await shot('editor-short.png');
 await b.evaluate(`document.querySelector('form [data-action=cancel]').click()`);
 await b.send('Emulation.setDeviceMetricsOverride',{width:768,height:650,deviceScaleFactor:1,mobile:false});
 await run('tablet no page overflow and usable table scroll',`document.documentElement.scrollWidth<=innerWidth && document.querySelector('.table-scroll').scrollWidth>document.querySelector('.table-scroll').clientWidth`);
 await shot('tablet.png');
 await b.evaluate(`document.querySelector('#search').focus()`);
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:600,deviceScaleFactor:1,mobile:false});
 await run('focus retained across layout change',`document.activeElement.id==='search'`);
 await run('no-match state and recovery',`(()=>{const e=document.querySelector('#search');e.value='no-such-product-xyz';e.dispatchEvent(new Event('input'));const good=document.querySelector('#app').textContent.includes('No matching products');document.querySelector('[data-action=reset]').click();return good && document.querySelectorAll('tbody tr').length===18})()`);
 await run('individual filter removal',`(()=>{const e=document.querySelector('#category');e.value='Storage';e.dispatchEvent(new Event('change'));document.querySelector('[data-clear=category]').click();return e.value==='' && document.querySelectorAll('tbody tr').length===18 && document.activeElement===e})()`);
 await b.evaluate(`document.querySelector('[data-action=edit]').click();document.querySelector('[data-action=save]').focus()`);
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await run('modal wraps keyboard focus',`document.querySelector('dialog').contains(document.activeElement)`);
 await b.evaluate(`document.querySelector('[name=name]').value='Keyboard draft'`);
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await run('physical Escape protects unsaved editor',`document.querySelector('dialog').open && !document.querySelector('#discard-confirmation').hidden`);
 await b.evaluate(`document.querySelector('[data-action=discard]').click()`);
 await run('no browser exceptions',`true`);
 const exceptions=b.events.filter(e=>e.method==='Runtime.exceptionThrown');
 if(exceptions.length) throw Error(JSON.stringify(exceptions));
 console.log(JSON.stringify({checks,exceptions},null,2));
 await writeFile('verification-results.json',JSON.stringify({checks,exceptions},null,2));
 if(checks.some(c=>!c.result)) throw Error('Verification failed; see verification-results.json');
} finally { await Promise.race([b.close(),new Promise(r=>setTimeout(r,2000))]); }
process.exit(0);
