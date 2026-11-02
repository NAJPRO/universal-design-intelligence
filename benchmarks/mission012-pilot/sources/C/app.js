// Original implementation, MIT-compatible. Data and brand tokens remain immutable.
import { products } from './data.js';
const records = products.map(p => ({ ...p }));
const permissions = new Map(products.map(p => [p.id, p.canEdit]));
const $ = s => document.querySelector(s);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n);
let state = ['empty','loading','error'].includes(new URLSearchParams(location.search).get('state')) ? new URLSearchParams(location.search).get('state') : 'populated';
let mode = 'adaptive', current = null, editing = false, initial = null, invoker = null;
const filters = {search:'',category:'',status:'',stock:''};
const dialog = $('#record-dialog');
const authorized = id => permissions.get(id) === true;
const getRecord = id => records.find(p => p.id === id);
function announce(message) { $('#announcement').textContent = message; }
function badge(p) { return `<span class="badge ${p.status.toLowerCase()}">${escape(p.status)}</span>`; }
function filtered() { return records.filter(p => (!filters.search || `${p.name} ${p.sku}`.toLowerCase().includes(filters.search.toLowerCase().trim())) && (!filters.category || p.category === filters.category) && (!filters.status || p.status === filters.status) && (!filters.stock || (filters.stock === 'out' ? p.stock === 0 : filters.stock === 'low' ? p.stock > 0 && p.stock <= 10 : p.stock > 0))); }
function renderStats() {
 const available = state === 'populated';
 const total = available ? records.length : state === 'empty' ? 0 : '—';
 const units = available ? records.reduce((sum,p) => sum+p.stock,0).toLocaleString() : state === 'empty' ? 0 : '—';
 const out = available ? records.filter(p => p.stock===0).length : state === 'empty' ? 0 : '—';
 $('#stats').innerHTML = [[total,'Products','Across the catalog'],[units,'Units on hand','All lifecycle statuses'],[out,'Out of stock','Review replenishment']].map(([value,label,note],i) => `<div class="stat ${i===2?'attention':''}"><span class="stat-index">0${i+1}</span><p class="stat-label">${label}</p><p class="stat-value">${value}</p><p class="stat-note">${note}</p></div>`).join('');
}
function renderFilters() {
 const labels = {search:'Search',category:'Category',status:'Status',stock:'Stock'};
 const stockLabels = {in:'In stock',low:'Low stock (1–10)',out:'Out of stock'};
 const active = Object.entries(filters).filter(([,v])=>v);
 $('#active-filters').innerHTML = active.map(([key,value])=>`<button class="chip" data-remove="${key}" aria-label="Remove ${labels[key]} filter: ${escape(stockLabels[value]||value)}">${labels[key]}: ${escape(stockLabels[value]||value)} <span aria-hidden="true">×</span></button>`).join('')+(active.length?'<button class="clear" data-clear>Clear all filters</button>':'');
}
function statePanel(icon,title,description,action,retry=false) {
 return `<div class="state-panel"><div class="state-icon" aria-hidden="true">${icon}</div><h3>${title}</h3><p>${description}</p><button class="primary" ${retry?'data-action="retry"':'data-clear'}>${action}</button></div>`;
}
function renderResults() {
 const result = $('#results'); result.className = mode;
 $('#scroll-hint').hidden = state !== 'populated';
 if(state !== 'populated') {
  $('#result-count').textContent = state==='loading'?'Loading inventory…':state==='error'?'Inventory unavailable':'0 products';
  result.innerHTML = state === 'loading' ? statePanel('◷','Preparing your inventory','The loading preview is paused. Load the catalog whenever you’re ready.','Load inventory',true) : state === 'error' ? statePanel('!','We couldn’t load inventory','Your records haven’t been changed. Try loading the catalog again.','Try again',true) : statePanel('□','Your catalog is empty','There are no products in this preview. Load the sample catalog to explore the workspace.','Load sample catalog',true);
  return;
 }
 const rows = filtered(); $('#result-count').textContent = `${rows.length} of ${records.length} products`;
 if(!rows.length) { result.innerHTML = statePanel('⌕','No matching products','Try a different name or SKU, or clear your filters to see the full catalog.','Clear all filters'); return; }
 result.innerHTML = `<div class="table-region" role="region" aria-label="Product comparison. Scroll horizontally for more columns." tabindex="0"><table><caption class="sr-only">Inventory products and operational details</caption><thead><tr><th scope="col">Product / SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col" class="numeric">Stock</th><th scope="col" class="numeric">Unit price</th><th scope="col">Supplier</th><th scope="col">Lead time</th><th scope="col">Access</th></tr></thead><tbody>${rows.map(p=>`<tr data-record-id="${p.id}"><td><button class="product-link" data-action="details" data-record-id="${p.id}" aria-label="View ${escape(p.name)}">${escape(p.name)}</button><span class="sku">${p.sku} · ${p.id}</span></td><td data-label="Category">${p.category}</td><td data-label="Lifecycle status">${badge(p)}</td><td data-label="Stock · units" class="numeric ${p.stock===0?'stock-zero':p.stock<=10?'stock-low':''}">${p.stock}<span class="stock-caption">${p.stock===0?'Out of stock':p.stock<=10?'Low stock':'In stock'}</span></td><td data-label="Unit price" class="numeric">${money(p.price)}</td><td data-label="Supplier">${p.supplier}</td><td data-label="Lead time">${p.leadDays} days</td><td class="access" data-label="Access">${authorized(p.id)?`<span class="readonly">Can edit</span><button class="primary-access" data-action="edit" data-record-id="${p.id}" aria-label="Edit ${escape(p.name)}">Edit</button>`:`<span class="readonly">View only</span><button class="permission-link" data-action="details" data-record-id="${p.id}" aria-label="View permission for ${escape(p.name)}">Permission info</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function render() { renderStats(); renderFilters(); renderResults(); }
function refreshFilters() { renderFilters(); renderResults(); }
for (const key of Object.keys(filters)) $('#'+key).addEventListener(key==='search'?'input':'change',e=> { filters[key]=e.target.value; refreshFilters(); });
function clearFilters(key) {
 if(key) { filters[key]=''; $('#'+key).value=''; } else for(const k of Object.keys(filters)) { filters[k]=''; $('#'+k).value=''; }
 refreshFilters(); (key ? $('#'+key) : $('#search')).focus();
}
$('#auto-view').addEventListener('click',()=>setMode('adaptive'));
$('#table-view').addEventListener('click',()=>setMode('compare'));
function setMode(value) {mode=value; $('#auto-view').setAttribute('aria-pressed',String(value==='adaptive')); $('#table-view').setAttribute('aria-pressed',String(value==='compare')); $('#results').className=value; $('#inventory').classList.toggle('compare',value==='compare');}
function head(title,p) { return `<div class="dialog-head"><div><p class="eyebrow">${p.sku} / ${p.id}</p><h2 id="dialog-title">${title}</h2></div><button class="close" data-action="cancel" aria-label="Close ${editing?'editor':'product details'}">×</button></div>`; }
function openRecord(id,edit,source) {
 const p=getRecord(id); if(!p) return;
 if(edit && !authorized(id)) { announce('This record is managed by procurement and cannot be edited.'); return; }
 if(!dialog.open) invoker=source || document.activeElement;
 current=id; editing=edit; initial=null;
 if(edit) {
  initial={name:p.name,stock:String(p.stock),price:String(p.price)};
  $('#dialog-content').innerHTML = `${head('Edit product',p)}<form class="edit-form" novalidate><div class="dialog-body"><p class="save-note">Update the name, stock and unit price. Other product details are managed separately.</p><div class="field"><label for="edit-name">Product name</label><input id="edit-name" name="name" value="${escape(p.name)}" aria-describedby="name-error" required><p class="error" id="name-error"></p></div><div class="form-grid"><div class="field"><label for="edit-stock">Stock · units</label><input id="edit-stock" name="stock" inputmode="numeric" value="${p.stock}" aria-describedby="stock-help stock-error" required><small class="field-help" id="stock-help">Whole number, zero or greater.</small><p class="error" id="stock-error"></p></div><div class="field"><label for="edit-price">Unit price · USD</label><input id="edit-price" name="price" inputmode="decimal" value="${p.price}" aria-describedby="price-help price-error" required><small class="field-help" id="price-help">A number greater than zero.</small><p class="error" id="price-error"></p></div></div><div class="permission"><strong>Editing permitted</strong>${p.permissionReason}</div><p class="error" id="form-error" role="alert"></p></div><div id="discard-slot"></div><div class="dialog-foot"><button type="button" data-action="cancel">Cancel</button><button type="submit" class="primary" data-action="save">Save changes</button></div></form>`;
  $('.edit-form').addEventListener('submit',save);
 } else {
  $('#dialog-content').innerHTML = `${head('Product details',p)}<div class="dialog-body" data-record-id="${p.id}"><h3>${escape(p.name)}</h3>${badge(p)}<dl class="detail-grid">${[['SKU',p.sku],['Record ID',p.id],['Category',p.category],['Lifecycle status',p.status],['Stock',`${p.stock} units${p.stock===0?' · Out of stock':''}`],['Unit price',money(p.price)],['Supplier',p.supplier],['Lead time',`${p.leadDays} days`]].map(([k,v])=>`<div><dt>${k}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl><div class="permission"><strong>${authorized(p.id)?'Can edit':'View only'}</strong>${p.permissionReason}</div></div><div class="dialog-foot"><button data-action="cancel">Close</button>${authorized(p.id)?`<button class="primary" data-action="edit" data-record-id="${p.id}">Edit product</button>`:''}</div>`;
 }
 if(!dialog.open) {dialog.showModal();document.body.classList.add('modal-open');}
 if(edit) $('#edit-name').focus(); else $('.close').focus();
}
function draft() {return Object.fromEntries(['name','stock','price'].map(k=>[k,dialog.querySelector(`[name="${k}"]`)?.value??'']));}
function dirty() {if(!editing||!initial)return false; const d=draft();return Object.keys(initial).some(k=>d[k]!==initial[k]);}
function cancel() {
 if(dirty()) {
  $('#discard-slot').innerHTML='<div class="discard-panel" role="group" aria-label="Unsaved changes"><p><strong>Discard unsaved changes?</strong><br>Your edits will be lost if you leave this editor.</p><div class="discard-actions"><button type="button" data-action="keep">Keep editing</button><button type="button" class="danger-button" data-action="discard">Discard changes</button></div></div>';
  dialog.querySelector('[data-action="keep"]').focus();return;
 } closeDialog();
}
function closeDialog() {
 dialog.close();document.body.classList.remove('modal-open');editing=false;initial=null;
 if(invoker?.isConnected) invoker.focus(); else {
  const fallback=[...document.querySelectorAll('#results [data-record-id]')].find(el=>el.dataset.recordId===current && el.tagName==='BUTTON');
  (fallback || $('#search')).focus();
 }
}
function save(event) {
 event.preventDefault(); if(!editing || !authorized(current)) { announce('You do not have permission to edit this product.'); return; }
 const p=getRecord(current); if(!p)return;
 const d=draft(), errors={};
 if(!d.name.trim()) errors.name='Enter a product name.';
 if(!d.stock.trim() || !Number.isSafeInteger(Number(d.stock)) || Number(d.stock)<0) errors.stock='Enter a whole number of units, zero or greater.';
 if(!d.price.trim() || !Number.isFinite(Number(d.price)) || Number(d.price)<=0) errors.price='Enter a finite price greater than zero.';
 for(const k of ['name','stock','price']) { $('#'+k+'-error').textContent=errors[k]||''; $('#edit-'+k).setAttribute('aria-invalid',String(Boolean(errors[k]))); }
 if(Object.keys(errors).length) { $('#form-error').textContent='Changes not saved. Correct the highlighted fields.'; $('#edit-'+Object.keys(errors)[0]).focus();return; }
 Object.assign(p,{name:d.name.trim(),stock:Number(d.stock),price:Number(d.price)});
 render();closeDialog();announce(`${p.sku} saved. Product details are up to date for this session.`);
}
dialog.addEventListener('keydown',event=>{
 if(event.key !== 'Tab') return;
 const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 const first=controls[0],last=controls.at(-1);
 if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
 else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
});
dialog.addEventListener('cancel',event=>{event.preventDefault();cancel();});
document.addEventListener('click',event=>{
 const button=event.target.closest('button'); if(!button)return;
 if(button.hasAttribute('data-clear'))return clearFilters();
 if(button.dataset.remove)return clearFilters(button.dataset.remove);
 const action=button.dataset.action;
 if(action==='retry'){state='populated';render();$('#search').focus();announce('Inventory loaded. All products are available.');}
 if(action==='edit')openRecord(button.dataset.recordId,true,button);
 if(action==='details')openRecord(button.dataset.recordId,false,button);
 if(action==='cancel')cancel();
 if(action==='discard')closeDialog();
 if(action==='keep'){ $('#discard-slot').innerHTML='';$('#edit-name').focus(); }
});
window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
render();
