"""Reproduce the hand-authored after reference; not an independent agent generation."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent/'fixture'
s=(root/'before/app.js').read_text()
s=s.replace("const params = new URLSearchParams(location.search);","const params = new URLSearchParams(location.search);\nconst narrow=matchMedia('(max-width:700px)');\nlet viewMode=['compare','records'].includes(params.get('view'))?params.get('view'):'auto';")
s=s.replace('<p class="scroll-hint">','<div class="view-controls" role="group" aria-label="Collection presentation"><button data-view="records">Record summaries</button><button data-view="compare">Compare columns</button><span id="view-note"></span></div><div id="record-summaries"></div><p class="scroll-hint">',1)
s=s.replace('<col class="action-col">','').replace('<th scope="col">Action</th>','')
s=re.sub(r'<td>\$\{p.canEdit\?.*?</td>', '', s, count=1)
s=s.replace('<tr><th scope="row">${esc(p.name)}</th>','<tr><th scope="row">${esc(p.name)}<span class="identity-status">${esc(p.status)} · ${p.stock} units</span>${rowAction(p)}</th>')
s=s.replace("$('.table-scroll').setAttribute('aria-busy',String(state==='loading'));","$('.table-scroll').setAttribute('aria-busy',String(state==='loading'));renderResponsive(shown);")
s=s.replace('const target=$(`[data-edit="${returnId}"]`);','const target=[...document.querySelectorAll(`[data-edit="${returnId}"]`)].find(e=>e.getClientRects().length);')
# Insert support declarations before first render invocation, preserving the original model/filter/editor flows.
insert=r'''
function rowAction(p){return p.canEdit?`<button class="edit-button" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">Edit product</button>`:'<span class="read-only">Read only</span><span class="permission">Your role can’t edit</span>';}
function renderResponsive(shown){
 const summary=viewMode==='records'||(viewMode==='auto'&&narrow.matches);
 const list=$('#record-summaries');
 const priorOpen=new Set([...list.querySelectorAll('details[open]')].map(e=>e.dataset.record));
 list.innerHTML=`<ul class="record-list">${shown.map(p=>`<li><article aria-labelledby="record-${p.id}"><h3 id="record-${p.id}">${esc(p.name)}</h3><p class="sku">${p.id}</p><dl><div><dt>Status</dt><dd>${p.status}</dd></div><div><dt>Stock</dt><dd>${p.stock} units${p.stock<=5?' · Low stock':''}</dd></div><div><dt>Price</dt><dd>${money.format(p.price)}</dd></div></dl>${rowAction(p)}<details data-record="${p.id}" ${priorOpen.has(p.id)?'open':''}><summary>Details for ${p.id}</summary><dl><div><dt>Category</dt><dd>${esc(p.category)}</dd></div><div><dt>Permission</dt><dd>${p.canEdit?'Editing permitted':'Read only — your role cannot edit'}</dd></div></dl></details></article></li>`).join('')}</ul>`;
 list.hidden=!summary||!shown.length;
 $('.table-scroll').hidden=summary||!shown.length;
 $('.scroll-hint').hidden=summary||!shown.length;
 $('.view-controls').hidden=!shown.length;
 document.querySelectorAll('[data-view]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.view===(summary?'records':'compare'))));
 $('#view-note').textContent=summary?'Identity, stock and actions first. Open details for more.':'All columns retained. On narrow screens, scroll the named table; Edit stays with identity.';
}
$('#record-summaries').onclick=e=>{const b=e.target.closest('[data-edit]');if(b)openEditor(b.dataset.edit);};
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{viewMode=button.dataset.view;render();button.focus();});
let focusedRecordAction=null;
document.addEventListener('focusin',e=>{focusedRecordAction=e.target.dataset?.edit||null;});
narrow.addEventListener('change',()=>{
 const active=document.activeElement;const id=active?.dataset.edit||(active===document.body?focusedRecordAction:null);
 render();if(id)[...document.querySelectorAll(`[data-edit="${id}"]`)].find(e=>e.getClientRects().length)?.focus();
});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('keydown',e=>{
 if(e.key!=='Tab')return;
 const controls=[...dialog.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(e=>!e.disabled&&e.getClientRects().length);
 if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}
 else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}
});
'''
s=s.replace("render();if(state==='populated'",insert+"\nrender();if(state==='populated'")
(root/'after/app.js').write_text(s)
css=(root/'before/styles.css').read_text()+'''
/* Mission 011 reference decisions: scoped owners, native scrollbar visibility. */
.collection{overflow:visible;min-width:0}.table-scroll{max-width:100%;scrollbar-width:auto}
.view-controls{display:flex;flex-wrap:wrap;gap:8px;padding:8px 24px 16px;align-items:center}.view-controls button[aria-pressed=true]{background:var(--brand);color:var(--surface)}#view-note{flex-basis:100%;font-size:12px;color:var(--muted)}
.identity-status{display:block;font-size:11px;color:var(--muted);font-weight:400;margin:8px 0}.table-scroll tbody th .edit-button{margin-top:8px}
.record-list{list-style:none;margin:0;padding:0}.record-list li{padding:20px 24px;border-top:1px solid var(--line)}.record-list h3{font-size:16px;line-height:1.5;overflow-wrap:anywhere}.record-list .sku{margin-top:8px}.record-list dl{display:flex;flex-wrap:wrap;gap:12px 24px;margin:16px 0}.record-list dt{font-size:11px;color:var(--muted)}.record-list dd{margin:0;font-weight:600}.record-list summary{padding:12px 0;cursor:pointer;color:var(--brand)}.record-list details{margin-top:8px}.record-list .edit-button{min-height:44px}
dialog#editor{overflow:visible;max-height:calc(100dvh - 24px)}#edit-form{display:grid;grid-template-rows:auto minmax(0,1fr) auto;max-height:calc(100dvh - 24px)}.dialog-body{min-height:0;overflow-y:auto;scrollbar-width:auto;scroll-padding-block:16px}.dialog-actions,.dialog-heading{position:relative}.dialog-body :is(input,select,textarea){scroll-margin-block:16px}#discard{overflow-y:auto}
@media(max-width:700px){.view-controls{padding:8px 16px 16px}.record-list li{padding:20px 16px}.view-controls button{flex:1}#view-note{font-size:11px}.table-scroll tbody th{padding-left:16px}.dialog-heading{padding:12px 16px}.dialog-actions{padding:12px 16px}.form-grid{grid-template-columns:1fr 1fr}}
@media(max-height:600px){.dialog-heading{padding:8px 16px}.dialog-heading h2{font-size:20px}.dialog-heading .eyebrow{margin:0}.dialog-actions{padding:8px 16px}.dialog-body{padding:16px}}
'''
(root/'after/styles.css').write_text(css)
