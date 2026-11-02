import { evidenceRoot } from './config.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { browser } from './browser.mjs';
const b=await browser();const results={protocol:'Chrome CDP, viewport CSS pixels, DPR=1, height=1000, initial viewport screenshot. No image resizing. Captures are observational, not aesthetic scores.',captures:[]};
try{
 for(const arm of ['A','B','C']){
 await mkdir(new URL(`screenshots/${arm}/`,evidenceRoot),{recursive:true});
 for(const width of [375,768,1440])for(const state of ['populated','empty','error','loading','edit']){
 await b.navigate(arm,state==='edit'?'edit=NS-1001':`state=${state}`,width);
 const metrics=await b.evaluate(`({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,title:document.title,text:document.body.innerText,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({tag:e.tagName,text:e.textContent})),tables:document.querySelectorAll('table').length,dialogs:[...document.querySelectorAll('[role="dialog"],dialog')].map(e=>({open:e.open,hidden:e.hidden,text:e.textContent.slice(0,250)})),unlabelledControls:[...document.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden'&&!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>({tag:e.tagName,id:e.id,type:e.type})),buttons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width).map(e=>({text:e.innerText,disabled:e.disabled,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),horizontalRegions:[...document.querySelectorAll('*')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='visible').map(e=>({tag:e.tagName,cls:e.className,width:e.clientWidth,scroll:e.scrollWidth}))})`);
 const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 const path=`screenshots/${arm}/${width}-${state}.png`;const bytes=Buffer.from(shot.data,'base64');await writeFile(new URL(path,evidenceRoot),bytes);
 results.captures.push({arm,width,state,path,sha256:createHash('sha256').update(bytes).digest('hex'),metrics,requests:b.events.filter(e=>e.method==='Network.requestWillBeSent').map(e=>e.params.request.url),errors:b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Log.entryAdded'&&e.params.entry.level==='error')});
 }
 }
 results.browser=await b.send('Browser.getVersion');
 await writeFile(new URL('captures.json',evidenceRoot),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({count:results.captures.length,overflow:results.captures.filter(r=>r.metrics.scrollWidth>r.width).map(r=>({arm:r.arm,width:r.width,state:r.state,scrollWidth:r.metrics.scrollWidth})),errors:results.captures.filter(r=>r.errors.length).map(r=>({arm:r.arm,width:r.width,state:r.state,errors:r.errors}))},null,2));
}finally{await b.close();}
