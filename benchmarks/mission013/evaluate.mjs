import { browser } from './browser.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('./', import.meta.url);
const b = await browser();
const output = { kind: 'Controller-authored original demonstration; no independent comparison or aesthetic superiority claim.', widths: [], screenshots: [], checks: [] };
const check = (name, passed, observed) => output.checks.push({ name, passed: !!passed, observed });
const ev = source => b.evaluate(source);
async function key(key, code, number, modifiers = 0) {
  await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: number, modifiers });
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: number, modifiers });
}
async function waitFor(source) {
  for (let i = 0; i < 80; i++) {
    if (await ev(source)) return;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw Error('Timed out waiting for browser state');
}
async function shot(name) {
  const { data } = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const bytes = Buffer.from(data, 'base64');
  await writeFile(new URL(`evidence/screenshots/${name}.png`, root), bytes);
  output.screenshots.push({ path: `evidence/screenshots/${name}.png`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
}
const metrics = `(() => {
 const r=e=>{const x=e.getBoundingClientRect();return {x:x.x,y:x.y,width:x.width,height:x.height}};
 return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
 title:document.querySelector('h1').innerText,chosen:document.querySelector('#chosen-title').innerText,
 controls:[...document.querySelectorAll('button,input,summary')].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,name:e.getAttribute('aria-label')||e.labels?.[0]?.innerText||e.innerText,rect:r(e)})),
 printVisible:!!document.querySelector('.print-art svg').getBoundingClientRect().width,
 motion:{press:getComputedStyle(document.querySelector('.primary')).transitionDuration,disclosure:getComputedStyle(document.querySelector('summary span')).transitionDuration},
 reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};})()`;
try {
  await mkdir(new URL('evidence/screenshots/', root), { recursive: true });
  for (const width of [320, 375, 768, 1440]) {
    await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await b.navigate('index.html', '', width);
    const m = await ev(metrics);
    output.widths.push(m);
    check(`${width}: no page overflow`, m.scrollWidth <= width && m.bodyWidth <= width, { scrollWidth: m.scrollWidth, bodyWidth: m.bodyWidth });
    check(`${width}: all native controls have a name`, m.controls.every(c => c.name.trim()), m.controls.map(c => c.tag));
    check(`${width}: essential controls stay within horizontal viewport`, m.controls.every(c => c.rect.x >= 0 && c.rect.x + c.rect.width <= width + 1), m.controls.map(c => c.rect));
    await shot(`${width}-opening`);
    await ev("document.querySelector('#programme').scrollIntoView({block:'start'});document.querySelector('input[value=empreinte]').focus()");
    await key('ArrowDown', 'ArrowDown', 40);
    check(`${width}: keyboard selects a complete readable value`, await ev("document.querySelector('input[value=couleur]').checked && document.querySelector('#chosen-title').textContent==='La couleur en partage'"));
    await ev("document.querySelector('#prepare').click()");
    check(`${width}: invalid name retains choice and gets focus`, await ev("document.activeElement.id==='visitor-name' && document.querySelector('#visitor-name').getAttribute('aria-invalid')==='true' && document.querySelector('input[value=couleur]').checked"));
    await key('Tab', 'Tab', 9);
    check(`${width}: keyboard reaches action with visible focus`, await ev("document.activeElement.id==='prepare' && getComputedStyle(document.activeElement).outlineStyle!=='none'"));
    const before = await ev("(()=>{const r=document.querySelector('#prepare').getBoundingClientRect();return {width:r.width,height:r.height}})()");
    const pending = await ev("(()=>{const n=document.querySelector('#visitor-name');n.value='Camille';n.dispatchEvent(new Event('input'));document.querySelector('#draft-form').requestSubmit();const b=document.querySelector('#prepare'),r=b.getBoundingClientRect();return {busy:b.getAttribute('aria-busy'),disabled:b.disabled,width:r.width,height:r.height,status:document.querySelector('#draft-status').textContent}})()");
    check(`${width}: real local write reports stable pending state`, pending.busy === 'true' && pending.disabled && pending.width === before.width && pending.height === before.height && pending.status.includes('Aucun envoi'), pending);
    await waitFor("document.querySelector('#draft-status').dataset.state==='saved'");
    check(`${width}: completion honestly distinguishes draft from booking`, await ev("document.querySelector('#draft-status').textContent.includes('Aucune place réservée') && document.querySelector('#draft-status').textContent.includes('Rien n’a été envoyé') && !document.querySelector('#prepare').disabled"));
    await ev("document.querySelector('#draft-title').scrollIntoView({block:'start'})");
    await shot(`${width}-saved`);
    await ev("document.querySelector('details').open=true;document.querySelector('#pratique').scrollIntoView({block:'start'})");
    await shot(`${width}-details`);
    await ev("document.querySelector('#clear-draft').click()");
    await waitFor("document.querySelector('#draft-status').dataset.state==='deleted'");
    check(`${width}: local deletion and focus return work`, await ev("document.activeElement.id==='prepare' && document.querySelector('#clear-draft').hidden"));
  }
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await b.navigate('index.html', '', 375);
  const reduced = await ev(metrics);
  output.reducedMotion = reduced;
  check('Reduced motion removes spatial transitions', reduced.reduced && reduced.motion.press === '0s' && reduced.motion.disclosure === '0s', reduced.motion);
  await ev("document.querySelector('details').open=true;document.querySelector('input[value=affiche]').click();document.querySelector('#visitor-name').value='Noa';document.querySelector('#draft-form').requestSubmit()");
  await waitFor("document.querySelector('#draft-status').dataset.state==='saved'");
  check('Reduced motion retains feedback and selected value', await ev("document.querySelector('#chosen-title').textContent==='Une affiche pour demain' && document.querySelector('#draft-status').textContent.includes('Aucune place réservée')"));
  await ev("document.querySelector('#draft-title').scrollIntoView({block:'start'})");
  await shot('375-reduced-saved');
  // Exercise a real storage-denial path; the injected failure is controller instrumentation only.
  await ev("window.__open=IDBFactory.prototype.open;IDBFactory.prototype.open=function(){throw new Error('controller storage-denial test')};document.querySelector('#draft-form').requestSubmit()");
  await waitFor("document.querySelector('#draft-status').dataset.state==='error'");
  check('Storage denial preserves input and choice with honest recovery', await ev("document.querySelector('#visitor-name').value==='Noa' && document.querySelector('input[value=affiche]').checked && document.querySelector('#draft-status').textContent.includes('n’a pas pu être enregistré')"));
  await ev("IDBFactory.prototype.open=window.__open;document.querySelector('#draft-form').requestSubmit()");
  await waitFor("document.querySelector('#draft-status').dataset.state==='saved'");
  check('Storage retry succeeds without fabricated server acknowledgement', await ev("document.querySelector('#draft-status').textContent.includes('sur cet appareil')"));
  output.browser = await b.send('Browser.getVersion');
  output.externalRequests = b.events.filter(e => e.method === 'Network.requestWillBeSent' && !e.params.request.url.startsWith('http://127.0.0.1:')).map(e => e.params.request.url);
  check('Final exercised page makes no external asset requests', output.externalRequests.length === 0);
  // Contrast checks for declared token pairs, not a complete accessibility audit.
  const rgb = hex => hex.match(/[0-9a-f]{2}/g).map(x => { const n = parseInt(x, 16) / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
  const lum = hex => rgb(hex).reduce((s, n, i) => s + n * [.2126, .7152, .0722][i], 0);
  output.contrast = [['ink/paper', '17372e', 'f5f1e8'], ['accent/paper', 'a13e25', 'f5f1e8'], ['muted/paper', '536158', 'f5f1e8']].map(([pair, a, c]) => ({ pair, ratio: (Math.max(lum(a), lum(c)) + .05) / (Math.min(lum(a), lum(c)) + .05) }));
  check('Declared text token pairs meet 4.5:1', output.contrast.every(c => c.ratio >= 4.5), output.contrast);
  output.passed = output.checks.filter(c => c.passed).length;
  output.total = output.checks.length;
  output.sourceSha256 = Object.fromEntries(await Promise.all(['index.html', 'styles.css', 'app.js'].map(async name => [name, createHash('sha256').update(await readFile(new URL(`demo/${name}`, root))).digest('hex')])));
  await writeFile(new URL('evidence/browser-results.json', root), JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ passed: output.passed, total: output.total, failures: output.checks.filter(c => !c.passed), screenshots: output.screenshots.length }));
  if (output.passed !== output.total) process.exitCode = 1;
} finally { await b.close(); }
