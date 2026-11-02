import { browser } from './tools/browser.mjs';
import { writeFile } from 'node:fs/promises';
const b=await browser(); const checks=[];
const act=e=>b.evaluate(`(()=>{${e}})()`);
async function check(name,e){if(!await b.evaluate(e))throw Error('FAIL: '+name);checks.push(name);}
try{
await b.navigate('index.html','',1440);
await check('18 records, 14 authorized edit controls',`document.querySelectorAll('tbody tr').length===18 && document.querySelectorAll('#results [data-action="edit"]').length===14`);
await act(`for(const [id,v] of Object.entries({category:'Inspection',status:'Draft',stock:'out'})){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));}`);
await check('Combined category, status and stock filters, counts and chips',`document.querySelectorAll('tbody tr').length===3 && document.querySelector('#result-count').textContent==='3 of 18 products' && document.querySelectorAll('[data-remove]').length===3`);
await act(`const s=document.querySelector('#search');s.value='  trn-0141 ';s.dispatchEvent(new Event('input',{bubbles:true}));`);
await check('Trimmed case-insensitive SKU search combines with filters',`document.querySelectorAll('tbody tr').length===1 && document.querySelector('tbody tr').dataset.recordId==='TW-2102'`);
await act(`document.querySelector('[data-remove="search"]').click()`);
await check('Removing chip restores results and focus',`document.querySelectorAll('tbody tr').length===3 && document.activeElement.id==='search'`);
await act(`document.querySelector('[data-clear]').click();const s=document.querySelector('#search');s.value='not a product';s.dispatchEvent(new Event('input',{bubbles:true}));`);
await check('No-match state and result count',`document.querySelector('#results').textContent.includes('No matching products') && document.querySelector('#result-count').textContent==='0 of 18 products'`);
await act(`document.querySelector('#results [data-clear]').click();document.querySelector('[data-action="details"][data-record-id="TW-2104"]').click()`);
await check('Restricted details retain supply and permission information',`document.querySelector('dialog').open && document.querySelector('dialog').textContent.includes('Managed by procurement') && document.querySelector('dialog').textContent.includes('28 days') && !document.querySelector('dialog [data-action="edit"]')`);
await act(`const e=document.createElement('button');e.dataset.action='edit';e.dataset.recordId='TW-2104';document.querySelector('#dialog-content').append(e);e.click();e.remove();`);
await check('Forged restricted dialog edit rejected',`!document.querySelector('#editor')`);
await act(`document.querySelector('dialog [data-action="cancel"]').click()`);
await check('Details restores focus',`document.activeElement.dataset.recordId==='TW-2104' && document.activeElement.dataset.action==='details'`);
await act(`const e=document.querySelector('[data-action="edit"][data-record-id="TW-2101"]');e.dataset.recordId='TW-2104';e.click();e.dataset.recordId='TW-2101';`);
await check('Forged catalogue edit rejected',`!document.querySelector('dialog').open`);
await act(`document.querySelector('[data-action="edit"][data-record-id="TW-2101"]').click();const f=document.querySelector('#editor');f.elements.name.value='  ';f.elements.stock.value='-1.5';f.elements.price.value='Infinity';f.requestSubmit();`);
await check('Invalid input retained with errors and focus',`document.querySelector('[name="name"]').value==='  ' && document.querySelector('[name="stock"]').value==='-1.5' && document.querySelector('[name="price"]').value==='Infinity' && document.querySelectorAll('[aria-invalid="true"]').length===3 && document.activeElement.name==='name'`);
await act(`document.querySelector('dialog [data-action="cancel"]').click()`);
await check('Dirty cancel offers discard choice',`document.querySelector('dialog').open && !document.querySelector('.discard').hidden && document.activeElement.dataset.action==='keep'`);
await act(`document.querySelector('[data-action="keep"]').click()`);
await check('Keep editing retains invalid values',`document.querySelector('.discard').hidden && document.querySelector('[name="stock"]').value==='-1.5'`);
await act(`document.querySelector('dialog').dispatchEvent(new Event('cancel',{cancelable:true}));document.querySelector('[data-action="discard"]').click()`);
await check('Escape cancellation and discard preserve record and restore focus',`!document.querySelector('dialog').open && document.activeElement.dataset.action==='edit' && document.querySelector('[data-record-id="TW-2101"]').textContent.includes('37')`);
await act(`document.querySelector('[data-action="edit"][data-record-id="TW-2101"]').click();const f=document.querySelector('#editor');f.elements.name.value='Updated bracket';f.elements.stock.value='0';f.elements.price.value='24.75';document.querySelector('dialog').dataset.recordId='TW-2104';f.requestSubmit();`);
await check('Save uses internal identity, accepts zero, updates data and acknowledges',`!document.querySelector('dialog').open && document.querySelector('[data-record-id="TW-2101"]').textContent.includes('Updated bracket') && document.querySelector('[data-record-id="TW-2101"]').textContent.includes('$24.75') && document.querySelector('[data-record-id="TW-2101"]').textContent.includes('Out of stock') && document.querySelector('[data-record-id="TW-2104"]').textContent.includes('112') && document.querySelector('#notice').textContent.includes('Saved TRN-0140') && document.activeElement.dataset.recordId==='TW-2101'`);
await act(`document.querySelector('[data-action="details"][data-record-id="TW-2102"]').click();document.querySelector('dialog [data-action="edit"]').click();document.querySelector('dialog [data-action="cancel"]').click();`);
await check('Details to edit to cancel focus return',`!document.querySelector('dialog').open && document.activeElement.dataset.recordId==='TW-2102' && document.activeElement.dataset.action==='details'`);
await act(`const s=document.querySelector('#search');s.value='Updated bracket';s.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-action="edit"]').click();const f=document.querySelector('#editor');f.elements.name.value='A renamed bracket';f.requestSubmit();`);
await check('Filtered-out saved record returns focus to inventory',`document.querySelector('#result-count').textContent==='0 of 18 products' && document.activeElement.id==='inventory'`);
for(const state of ['empty','loading','error']){
await b.navigate('index.html',`state=${state}`,375);
await check(state+' deterministic state',`!document.querySelector('tbody') && !!document.querySelector('[data-action="retry"]')`);
if(state==='loading'){await new Promise(r=>setTimeout(r,700));await check('Loading persists',`document.querySelector('#result-count').textContent==='Loading inventory…'`);}
await act(`document.querySelector('[data-action="retry"]').click()`);
await check(state+' recovery',`document.querySelectorAll('tbody tr').length===18 && document.activeElement.id==='inventory'`);
}
for(const [width,height] of [[320,640],[375,667],[768,600],[1024,768],[1440,520],[1920,1080]]){
await b.navigate('index.html','',width);
await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
await check(`No page horizontal overflow ${width}x${height}`,`document.documentElement.scrollWidth<=innerWidth`);
await act(`document.querySelector('[data-action="edit"]').click()`);
await check(`Editor fits viewport ${width}x${height}`,`(()=>{const r=document.querySelector('dialog').getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth})()`);
await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
await new Promise(r=>setTimeout(r,50));
await check(`Keyboard Escape and focus ${width}`,`!document.querySelector('dialog').open && document.activeElement.dataset.action==='edit'`);
}
await b.navigate('index.html','',768);
await act(`document.querySelector('[data-action="edit"]').focus()`);
await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:600,deviceScaleFactor:1,mobile:false});
await check('Focus survives responsive layout change',`document.activeElement.dataset.action==='edit' && document.activeElement.dataset.recordId==='TW-2101'`);
await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await check('Reduced motion removes transitions',`getComputedStyle(document.querySelector('button')).transitionDuration==='0s'`);
if(b.events.some(e=>e.method==='Runtime.exceptionThrown'))throw Error('Runtime exception');
checks.push('No runtime exceptions in final navigation');
await writeFile('verification.json',JSON.stringify({passed:checks.length,checks},null,2)+'\n');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
}finally{await b.close();}
