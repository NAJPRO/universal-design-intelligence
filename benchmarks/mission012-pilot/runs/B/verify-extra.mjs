import{browser}from'./tools/browser.mjs';import{writeFile}from'node:fs/promises';const b=await browser();const checks=[];const check=async(name,expr)=>{if(b.events.some(e=>e.method==='Runtime.exceptionThrown'))throw Error('Runtime exception during '+name);if(!await b.evaluate(expr))throw Error(name);checks.push(name)};const key=async(key,code=key)=>{await b.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,text:key==='Enter'?'\r':undefined,windowsVirtualKeyCode:({Enter:13,Escape:27,Tab:9})[key]});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:({Enter:13,Escape:27,Tab:9})[key]});await new Promise(r=>setTimeout(r,60));};const shot=async(file)=>{const image=await b.send('Page.captureScreenshot',{format:'png'});await writeFile(file,Buffer.from(image.data,'base64'));};
try{
await b.navigate('index.html','',375);await shot('mobile-initial.png');
await b.evaluate(`var s=document.querySelector('[data-testid="search"]');s.value='precision';s.dispatchEvent(new Event('input'));s.focus()`);
await check('Case-insensitive name search and search focus retained',`document.querySelectorAll('tbody tr').length===1&&document.activeElement.dataset.testid==='search'`);
await b.evaluate(`var s=document.querySelector('[data-testid="search"]');s.value='no matching sku';s.dispatchEvent(new Event('input'))`);
await check('No matches message and count',`!document.querySelector('tbody tr')&&document.querySelector('#results').textContent.includes('No matching products')&&document.querySelector('#results-title').textContent==='0 of 18 products'`);
await b.evaluate(`document.querySelector('#results [data-clear="all"]').click();document.querySelector('[data-action="edit"]').focus()`);
await b.send('Emulation.setDeviceMetricsOverride',{width:1100,height:600,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,80));
await check('Focused record edit survives responsive layout change',`document.activeElement.dataset.action==='edit'&&document.activeElement.dataset.recordId==='TW-2101'`);
await key('Enter');await check('Keyboard opens editor',`document.querySelector('dialog').open&&document.activeElement.name==='name'`);
await b.evaluate(`document.querySelector('[name="stock"]').value='-1';document.querySelector('[name="price"]').value='0';document.querySelector('[data-action="save"]').click()`);
await check('Negative stock and zero price rejected',`document.querySelector('[name="stock"]').getAttribute('aria-invalid')==='true'&&document.querySelector('[name="price"]').getAttribute('aria-invalid')==='true'`);
await b.evaluate(`document.querySelector('[name="stock"]').value='';document.querySelector('[name="price"]').value='NaN';document.querySelector('[data-action="save"]').click()`);
await check('Blank stock and NaN rejected with input retained',`document.querySelector('[name="stock"]').getAttribute('aria-invalid')==='true'&&document.querySelector('[name="price"]').value==='NaN'`);
await key('Escape');await check('Escape with dirty data requires confirmation',`document.querySelector('dialog').open&&!document.querySelector('.confirm').hidden`);
await b.evaluate(`document.querySelector('[data-action="keep"]').click();document.querySelector('[name="name"]').focus()`);
await key('Tab');await check('Tab moves through editor fields',`document.activeElement.name==='stock'`);
await b.evaluate(`document.querySelector('[data-action="cancel"]').click();document.querySelector('[data-action="discard"]').click()`);
await b.send('Emulation.setDeviceMetricsOverride',{width:320,height:320,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,80));
await b.evaluate(`document.querySelector('[data-action="edit"]').click();document.querySelector('[data-action="save"]').focus()`);
await check('Save reachable in 320x320 viewport',`(()=>{let d=document.querySelector('dialog'),s=document.querySelector('[data-action="save"]').getBoundingClientRect();return d.scrollTop>0&&s.bottom<=innerHeight&&s.top>=0&&document.documentElement.scrollWidth<=innerWidth})()`);
await shot('short-editor.png');
await b.evaluate(`document.querySelector('[name="name"]').value='Filtered name';document.querySelector('[data-action="save"]').click();var s=document.querySelector('[data-testid="search"]');s.value='Filtered name';s.dispatchEvent(new Event('input'));document.querySelector('[data-action="edit"]').click();document.querySelector('[name="name"]').value='Renamed record';document.querySelector('[data-action="save"]').click()`);
await check('Filtered-out save returns focus to results heading',`document.querySelectorAll('tbody tr').length===0&&document.activeElement.id==='results-title'&&!document.querySelector('dialog').open`);
await b.navigate('index.html','state=loading',375);await new Promise(r=>setTimeout(r,1200));await check('Loading persists without automatic timer',`!!document.querySelector('[data-action="retry"]')&&!document.querySelector('tbody tr')`);
console.log(JSON.stringify({passed:checks.length,checks},null,2));
}finally{await b.close()}
