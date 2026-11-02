// Mission 013.1: measured focus regressions plus screenshots requiring visual review.
import { browser } from './browser.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('./', import.meta.url);
const baselineIndex = process.argv.indexOf('--baseline-css');
const baseline = baselineIndex < 0 ? null : await readFile(process.argv[baselineIndex + 1], 'utf8');
const output = { mission: '013.1', automatedScope: 'Contour geometry, native input behavior and declared contrast. Aesthetic quality requires separate visual inspection.', scenarios: [], checks: [], screenshots: [] };
const currentCss = await readFile(new URL('demo/styles.css', root), 'utf8');
const b = await browser();
const ev = expression => b.evaluate(expression);
const check = (name, passed, observed) => output.checks.push({ name, passed: !!passed, ...(observed === undefined ? {} : { observed }) });
const readState = `(() => {
 const e=document.querySelector('#visitor-name'),s=getComputedStyle(e),r=e.getBoundingClientRect(),error=document.querySelector('#name-error');
 return {focused:document.activeElement===e,focusVisible:e.matches(':focus-visible'),invalid:e.getAttribute('aria-invalid'),
 width:r.width,height:r.height,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],
 borderWidths:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],borderColor:s.borderTopColor,
 outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineOffset:s.outlineOffset,shadow:s.boxShadow,
 transition:s.transitionDuration,animation:s.animationName,errorVisible:!error.hidden,errorColor:getComputedStyle(error).color,
 reduced:matchMedia('(prefers-reduced-motion:reduce)').matches,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
})()`;
async function key(key, code, number, modifiers = 0) {
 for (const type of ['keyDown', 'keyUp']) await b.send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: number, modifiers });
}
async function clickField() {
 const p = await ev("(()=>{const r=document.querySelector('#visitor-name').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...p });
 await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...p });
}
async function shot(name) {
 const result = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
 const bytes = Buffer.from(result.data, 'base64');
 const path = `evidence/screenshots/focus-0131/${name}.png`;
 await writeFile(new URL(path, root), bytes);
 output.screenshots.push({ path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
}
async function state(scenario, name) {
 const value = await ev(readState);
 scenario.states[name] = value;
 await shot(`${scenario.width}-${scenario.reduced ? 'reduced' : 'normal'}-${name}`);
 return value;
}
async function waitFor(expression) {
 for(let i=0;i<100;i++) { if(await ev(expression)) return; await new Promise(r=>setTimeout(r,25)); }
 throw Error('Timed out waiting for form storage feedback');
}
function contrast(a, c) {
 const lum = color => color.match(/\d+/g).slice(0,3).map(n=>Number(n)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
 return (Math.max(lum(a),lum(c))+.05)/(Math.min(lum(a),lum(c))+.05);
}
try {
 await mkdir(new URL('evidence/screenshots/focus-0131/',root),{recursive:true});
 for (const width of [320,375,768,1440]) {
  for (const reduced of [false,true]) {
   await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
   await b.navigate('index.html','',width);
   await ev("document.querySelector('#visitor-name').scrollIntoView({block:'center'})");
   const scenario={width,reduced,states:{}};
   output.scenarios.push(scenario);
   let original=null;
   if(baseline) {
    await ev(`(()=>{document.querySelector('link[rel=stylesheet]').disabled=true;const s=document.createElement('style');s.id='baseline-css';s.textContent=${JSON.stringify(baseline)};document.head.append(s)})()`);
    original=await ev(readState);
    if(!reduced && [320,1440].includes(width)) {
     await clickField();
     scenario.beforeFocus=await ev(readState);
     await shot(`${width}-before-focus`);
     await ev("document.querySelector('#visitor-name').blur()");
    }
    await ev(`document.querySelector('#baseline-css').textContent=${JSON.stringify(currentCss)}`);
   }
   const normal=await state(scenario,'default');
   check(`${width}/${reduced}: default is one unfocused border`,!normal.focused && normal.borderWidths.every(v=>v==='2px') && normal.shadow==='none');
   if(original) check(`${width}/${reduced}: original input geometry preserved`,normal.width===original.width && normal.height===original.height,{before:{width:original.width,height:original.height},after:{width:normal.width,height:normal.height}});
   await clickField();
   const mouse=await state(scenario,'mouse-focus');
   check(`${width}/${reduced}: mouse focus uses integrated border`,mouse.focused && mouse.borderColor==='rgb(23, 55, 46)' && mouse.borderColor!==normal.borderColor && (mouse.outlineStyle==='none'||mouse.outlineWidth==='0px') && mouse.shadow==='none');
   await ev("document.querySelector('#visitor-name').blur()");
   const blur=await state(scenario,'blur');
   check(`${width}/${reduced}: blur restores the default contour`,!blur.focused && blur.borderColor===normal.borderColor && blur.shadow==='none');
   // Start from the immediately preceding real Tab stop, then use native Tab.
   await ev("document.querySelectorAll('#pratique summary')[1].focus()");
   await key('Tab','Tab',9);
   const keyboard=await state(scenario,'keyboard-focus');
   check(`${width}/${reduced}: Tab reaches a visible single-contour focus`,keyboard.focused && keyboard.focusVisible && keyboard.borderColor===mouse.borderColor && (keyboard.outlineStyle==='none'||keyboard.outlineWidth==='0px') && keyboard.shadow==='none');
   const pairs=await ev("({surface:getComputedStyle(document.querySelector('#visitor-name')).backgroundColor,ink:getComputedStyle(document.querySelector('#visitor-name')).borderColor})");
   const ratios={focusAgainstDefault:contrast(keyboard.borderColor,normal.borderColor),focusAgainstSurface:contrast(pairs.ink,pairs.surface)};
   check(`${width}/${reduced}: integrated focus has at least 3:1 contrast`,ratios.focusAgainstDefault>=3 && ratios.focusAgainstSurface>=3,ratios);
   await ev("document.querySelector('#draft-form').requestSubmit()");
   const invalidFocus=await state(scenario,'invalid-focus');
   check(`${width}/${reduced}: invalid focus keeps error and focus separate`,invalidFocus.focused && invalidFocus.invalid==='true' && invalidFocus.errorVisible && invalidFocus.errorColor!==invalidFocus.borderColor && invalidFocus.borderColor===keyboard.borderColor);
   await key('Tab','Tab',9);
   const invalidBlur=await state(scenario,'invalid-blur');
   check(`${width}/${reduced}: invalid blur retains error styling`,!invalidBlur.focused && invalidBlur.errorVisible && invalidBlur.borderColor==='rgb(161, 62, 37)' && invalidBlur.borderColor!==blur.borderColor);
   await ev("document.querySelector('#visitor-name').focus()");
   await b.send('Input.insertText',{text:'Léa'});
   const corrected=await state(scenario,'corrected-focus');
   check(`${width}/${reduced}: editing clears error without losing focus`,corrected.focused && corrected.invalid===null && !corrected.errorVisible && corrected.borderColor===keyboard.borderColor);
   const all=Object.values(scenario.states);
   check(`${width}/${reduced}: no dimension shift across states`,all.every(s=>s.width===normal.width && s.height===normal.height && s.borderWidths.every(v=>v==='2px')));
   check(`${width}/${reduced}: no horizontal overflow`,all.every(s=>s.scrollWidth<=s.viewport));
   check(`${width}/${reduced}: focus is immediate without animation`,all.every(s=>s.transition==='0s' && s.animation==='none' && s.reduced===reduced));
   await ev("document.querySelector('#draft-form').requestSubmit()");
   await waitFor("document.querySelector('#draft-status').dataset.state==='saved'");
   check(`${width}/${reduced}: draft submission still works`,await ev("document.querySelector('#visitor-name').value==='Léa' && document.querySelector('#draft-status').textContent.includes('Aucune place réservée') && !document.querySelector('#prepare').disabled"));
   await ev("document.querySelector('#clear-draft').click()");
   await waitFor("document.querySelector('#draft-status').dataset.state==='deleted'");
  }
 }
 check('Other controls retain their external keyboard outline',await ev("(()=>{const e=document.querySelector('#prepare');e.focus();return getComputedStyle(e).outlineWidth==='3px'&&getComputedStyle(e).outlineStyle==='solid'})()"));
 output.browser=await b.send('Browser.getVersion');
 output.sourceSha256=Object.fromEntries(await Promise.all(['index.html','styles.css','app.js'].map(async p=>[p,createHash('sha256').update(await readFile(new URL(`demo/${p}`,root))).digest('hex')])));
 if(baseline) output.baselineCssSha256=createHash('sha256').update(baseline).digest('hex');
 output.passed=output.checks.filter(c=>c.passed).length;output.total=output.checks.length;
 await writeFile(new URL('evidence/focus-0131.json',root),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({passed:output.passed,total:output.total,failures:output.checks.filter(c=>!c.passed),screenshots:output.screenshots.length}));
 if(output.passed!==output.total) process.exitCode=1;
} finally {await b.close();}
