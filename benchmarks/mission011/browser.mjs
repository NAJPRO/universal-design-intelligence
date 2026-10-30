const runRoot=new URL('./fixture/',import.meta.url);
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
export async function browser(){
 const root=resolve(runRoot.pathname);
 const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root+sep))throw Error('Path outside runs');const content=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]??'application/octet-stream');res.end(content);}catch{res.statusCode=404;res.end('Not found');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 const profile=await mkdtemp(new URL('./.chrome-',import.meta.url).pathname);
 const chrome=spawn('google-chrome',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let logs='';chrome.stderr.on('data',d=>logs+=d);
 let endpoint;
 for(let i=0;i<100;i++){try{const [p]=String(await readFile(profile+'/DevToolsActivePort')).trim().split('\n');endpoint=`http://127.0.0.1:${p}`;break;}catch{await delay(100);}}
 if(!endpoint){chrome.kill();server.close();throw Error('Chrome failed: '+logs);}
 const target=await (await fetch(endpoint+'/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let dialogAction=true;let id=0;const pending=new Map();const events=[];
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(Error(JSON.stringify(msg.error))):p.resolve(msg.result);}else {events.push(msg);if(msg.method==='Page.javascriptDialogOpening')send('Page.handleJavaScriptDialog',{accept:dialogAction}).catch(()=>{});}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
 await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const navigate=async(arm,query='',width=1440)=>{events.length=0;await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:`http://127.0.0.1:${port}/${arm}${arm.endsWith('.html')?'':'/'}?${query}`});for(let i=0;i<100;i++){await delay(50);if(await evaluate('document.readyState === "complete" && (!!document.querySelector("#app")?.textContent.trim() || !!document.querySelector("#carousel"))'))break;}await delay(150);};
 return {send,evaluate,navigate,events,setDialogAction:value=>{dialogAction=value;},close:async()=>{await send('Browser.close').catch(()=>{});ws.close();if(chrome.exitCode===null)await new Promise(r=>chrome.once('exit',r));server.close();await rm(profile,{recursive:true,force:true,maxRetries:20,retryDelay:100});}};
}
