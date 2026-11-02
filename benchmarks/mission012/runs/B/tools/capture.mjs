// Original local browser harness, MIT. No application or design decisions supplied.
import{writeFile}from'node:fs/promises';import{browser}from'./browser.mjs';
const [width='375',query='',path='capture.png',expression='null']=process.argv.slice(2);const b=await browser();
try{await b.navigate('index.html',query,Number(width));const result=await b.evaluate(expression);await new Promise(r=>setTimeout(r,200));const shot=await b.send('Page.captureScreenshot',{format:'png'});await writeFile(path,Buffer.from(shot.data,'base64'));console.log(JSON.stringify({path,result,overflow:await b.evaluate('document.documentElement.scrollWidth-innerWidth'),exceptions:b.events.filter(x=>x.method==='Runtime.exceptionThrown')},null,2));}finally{await b.close();}
