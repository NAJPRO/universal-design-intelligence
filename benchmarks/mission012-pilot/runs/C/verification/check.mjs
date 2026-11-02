import { browser } from '../tools/browser.mjs';
import { writeFile } from 'node:fs/promises';
const b = await browser();
const results=[];
const check=async(name,expr)=>{const result=await b.evaluate(expr);results.push({name,result});if(!result)throw Error(name);};
const shot=async name=>{const img=await b.send('Page.captureScreenshot',{format:'png'});await writeFile(new URL(name,import.meta.url),Buffer.from(img.data,'base64'));};
try {
 for(const width of [375,768,1440]){
  await b.navigate('index.html','',width);
  await check(`${width}: populated`, `document.querySelectorAll('tbody tr').length===18`);
  await check(`${width}: no page overflow`, `document.documentElement.scrollWidth<=innerWidth`);
  await shot(`populated-${width}.png`);
 }
 await check('Combined category status stock filters', `(()=>{for(const [id,value] of [['category','Inspection'],['status','Draft'],['stock','out']]){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('change'));}return document.querySelectorAll('tbody tr').length===3 && document.querySelectorAll('[data-remove]').length===3})()`);
 await check('Search SKU combines with filters', `(()=>{const el=document.querySelector('#search');el.value='TRN-0141';el.dispatchEvent(new Event('input'));return document.querySelectorAll('tbody tr').length===1 && document.querySelector('tbody tr').dataset.recordId==='TW-2102'})()`);
 await check('Clear all restores records', `(()=>{document.querySelector('[data-clear]').click();return document.querySelectorAll('tbody tr').length===18 && document.activeElement.id==='search'})()`);
 await check('No matches state', `(()=>{let el=document.querySelector('#search');el.value='no-such-product';el.dispatchEvent(new Event('input'));return document.querySelector('#results').textContent.includes('No matching products')})()`);
 await b.evaluate(`document.querySelector('[data-clear]').click()`);
 await check('Restricted edit control injection denied', `(()=>{const button=document.createElement('button');button.dataset.action='edit';button.dataset.recordId='TW-2104';document.body.append(button);button.click();button.remove();return !document.querySelector('dialog').open})()`);
 await check('Full restricted detail + permission', `(()=>{document.querySelector('button[data-action="details"][data-record-id="TW-2104"]').click();return document.querySelector('dialog').open && document.querySelector('dialog').textContent.includes('Managed by procurement') && !document.querySelector('dialog [data-action="edit"]')})()`);
 await b.evaluate(`document.querySelector('dialog [data-action="cancel"]').click();document.querySelector('button[data-action="edit"][data-record-id="TW-2101"]').click()`);
 await check('Invalid fields retained and identified', `(()=>{for(const [k,v] of [['name','  '],['stock','-2.5'],['price','Infinity']])document.querySelector('[name="'+k+'"]').value=v;document.querySelector('[data-action="save"]').click();return document.querySelector('dialog').open && document.querySelector('[name="stock"]').value==='-2.5' && document.querySelectorAll('[aria-invalid="true"]').length===3 && document.activeElement.name==='name'})()`);
 await check('Unsaved cancel stays open', `(()=>{document.querySelector('dialog [data-action="cancel"]').click();return document.querySelector('dialog').open && !!document.querySelector('[data-action="discard"]')})()`);
 await check('Keep editing retains draft', `(()=>{document.querySelector('[data-action="keep"]').click();return document.querySelector('[name="price"]').value==='Infinity' && !document.querySelector('[data-action="discard"]')})()`);
 await check('Save updates and announces success', `(()=>{for(const [k,v] of [['name','Updated bracket'],['stock','0'],['price','15.25']])document.querySelector('[name="'+k+'"]').value=v;document.querySelector('[data-action="save"]').click();const row=document.querySelector('tr[data-record-id="TW-2101"]');return !document.querySelector('dialog').open && row.textContent.includes('Updated bracket') && row.textContent.includes('$15.25') && document.querySelector('#announcement').textContent.includes('saved') && document.activeElement.dataset.recordId==='TW-2101'})()`);
 await b.evaluate(`document.querySelector('button[data-action="edit"][data-record-id="TW-2101"]').click();document.querySelector('[name="name"]').value='discard-me';document.querySelector('dialog [data-action="cancel"]').click();document.querySelector('[data-action="discard"]').click()`);
 await check('Discard leaves data unchanged', `!document.querySelector('dialog').open && !document.querySelector('tbody').textContent.includes('discard-me')`);
 for(const state of ['empty','loading','error']){
  for(const width of [375,768,1440]){
   await b.navigate('index.html',`state=${state}`,width);
   await check(`${state} ${width}: no overflow`, `document.documentElement.scrollWidth<=innerWidth && document.querySelectorAll('tbody tr').length===0`);
   await shot(`${state}-${width}.png`);
  }
  await check(`${state}: recovery`, `(()=>{document.querySelector('[data-action="retry"]').click();return document.querySelectorAll('tbody tr').length===18})()`);
 }
 await b.navigate('index.html','',375);
 await b.evaluate(`document.querySelector('button[data-action="edit"]').click();document.querySelector('[name="name"]').value='Unfinished draft'`);
 await b.send('Emulation.setDeviceMetricsOverride',{width:768,height:440,deviceScaleFactor:1,mobile:false});
 await check('Resize preserves draft and focus', `document.querySelector('[name="name"]').value==='Unfinished draft' && document.activeElement.name==='name'`);
 await shot('editor-short.png');
 await check('Short editor save reachable', `(()=>{const button=document.querySelector('[data-action="save"]');button.focus();button.scrollIntoView({block:'nearest'});const r=button.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight})()`);
 await b.evaluate(`document.querySelector('dialog [data-action="cancel"]').click();document.querySelector('[data-action="discard"]').click();document.querySelector('#table-view').click()`);
 await check('Comparison horizontal scroll operable', `(()=>{const region=document.querySelector('.table-region');region.scrollLeft=300;return region.scrollLeft>0 && document.documentElement.scrollWidth<=innerWidth})()`);
 await check('No browser exceptions', `true`);
 results.push({name:'Browser runtime exceptions',result:b.events.filter(e=>e.method==='Runtime.exceptionThrown')});
} finally {await writeFile(new URL('results.json',import.meta.url),JSON.stringify(results,null,2));await b.close();}
console.log(JSON.stringify(results,null,2));
