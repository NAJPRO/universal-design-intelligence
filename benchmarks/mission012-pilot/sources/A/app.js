import { products } from './data.js';

// Original MIT-compatible implementation. Source records and permissions stay immutable.
const records = products.map(product => ({ ...product }));
const permissions = new Map(products.map(({id, canEdit}) => [id, canEdit]));
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(value);
const filters = {search:'',category:'',status:'',stock:''};
const requestedState = new URLSearchParams(location.search).get('state');
let mode = ['empty','loading','error'].includes(requestedState) ? requestedState : 'populated';
let editor = null;
let returnTarget = null;
let toastTimer;
const dialog = $('#record-dialog');

function notify(message) {
  clearTimeout(toastTimer);
  $('#notification').textContent = message;
  $('#notification').hidden = false;
  toastTimer = setTimeout(() => { $('#notification').hidden = true; }, 6000);
}
function baseRecords() { return mode === 'populated' ? records : []; }
function matchingRecords() {
  const query = filters.search.trim().toLowerCase();
  return baseRecords().filter(p => (!query || `${p.name} ${p.sku}`.toLowerCase().includes(query)) && (!filters.category || p.category === filters.category) && (!filters.status || p.status === filters.status) && (!filters.stock || (filters.stock === 'out' ? p.stock === 0 : filters.stock === 'low' ? p.stock > 0 && p.stock <= 10 : p.stock > 10)));
}
const statusBadge = p => `<span class="status ${p.status.toLowerCase()}">${escape(p.status)}</span>`;
function renderMetrics() {
  const list = baseRecords();
  const unavailable = mode === 'loading' || mode === 'error';
  const stats = [
    ['Total products',list.length,'Across all lifecycle statuses','▦',''],
    ['Active products',list.filter(p=>p.status==='Active').length,'Ready for operations','↗',''],
    ['Out of stock',list.filter(p=>p.stock===0).length,'Products with zero on hand','◷','alert'],
    ['Stock value',money(list.reduce((sum,p)=>sum+p.stock*p.price,0)),'On-hand units × unit price','◇','']
  ];
  $('#metrics').innerHTML = stats.map(([label,value,detail,icon,cls])=>`<div class="metric ${cls}"><div class="metric-label">${label}<span class="metric-icon" aria-hidden="true">${icon}</span></div><strong>${unavailable?'—':value}</strong><small>${detail}</small></div>`).join('');
  $('#catalog-total').textContent = unavailable ? '—' : list.length;
  $('.nav-count').textContent = unavailable ? '—' : list.length;
}
function render() {
  renderMetrics();
  const list = matchingRecords();
  const active = Object.entries(filters).filter(([,v])=>v !== '');
  $('#clear-all').hidden = !active.length;
  $('#active-filters').innerHTML = active.map(([key,value])=>{
    const label = key === 'stock' ? ({out:'Out of stock',low:'Low stock (1–10)',available:'In stock (11+)'})[value] : value;
    return `<button class="chip" data-clear="${key}" aria-label="Remove ${key} filter: ${escape(label)}">${escape(key === 'search' ? `Search: ${label}` : label)}<span aria-hidden="true">×</span></button>`;
  }).join('');
  $('#result-count').textContent = mode === 'loading' ? 'Loading inventory…' : mode === 'error' ? 'Inventory unavailable' : `Showing ${list.length} of ${baseRecords().length} products`;
  let state = null;
  if(mode === 'loading') state = ['◌','Loading your inventory','The catalog is waiting to load. You can retry whenever you’re ready.','Load inventory','retry','spinner'];
  else if(mode === 'error') state = ['!','Inventory couldn’t be loaded','Your records are safe. Try again to return to your inventory.','Try again','retry',''];
  else if(mode === 'empty') state = ['▦','Your catalog is empty','There are no products in this workspace yet. Load the sample catalog to explore the inventory.','Load sample catalog','retry',''];
  else if(!list.length) state = ['⌕','No matching products','Try another name or SKU, or clear your filters to see the full catalog.','Clear all filters','reset',''];
  if(state) {
    $('#app').innerHTML = `<div class="empty-state"><div class="state-icon ${state[5]}" aria-hidden="true">${state[0]}</div><h3>${state[1]}</h3><p>${state[2]}</p><button class="primary" data-action="${state[4]}">${state[3]}</button></div>`;
    return;
  }
  $('#app').innerHTML = `<p class="scroll-hint">Compare products below · Scroll horizontally for more columns when needed →</p><div class="table-scroll" tabindex="0" role="region" aria-label="Product comparison table, scroll horizontally if needed"><table><caption class="sr-only">Product inventory, with name, category, lifecycle status, on-hand stock and unit price. Open a product for supplier and permissions.</caption><thead><tr><th scope="col">Product / SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">On hand</th><th scope="col">Unit price</th><th scope="col">Access</th></tr></thead><tbody>${list.map(p=>`<tr data-record-id="${p.id}"><td><button class="product-name" data-action="view" data-record-id="${p.id}" aria-label="View ${escape(p.name)}">${escape(p.name)}</button><span class="sku">${p.sku}</span></td><td data-label="Category">${p.category}</td><td data-label="Status">${statusBadge(p)}</td><td data-label="On hand"><span class="stock-number number">${p.stock}</span><span class="stock-note ${p.stock===0?'out':p.stock<=10?'low':''}">${p.stock===0?'Out of stock':p.stock<=10?'Low stock':'In stock'}</span></td><td data-label="Unit price" class="number">${money(p.price)}</td><td>${permissions.get(p.id)?`<button class="edit-button" data-action="edit" data-record-id="${p.id}" aria-label="Edit ${escape(p.name)}">Edit <span aria-hidden="true">↗</span></button>`:`<span class="read-only">Consult only</span>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function resetFilters() {
  Object.keys(filters).forEach(key=>{ filters[key]=''; $(`#${key}`).value=''; });
  render();
  $('#search').focus();
}
function restoreFocus() {
  if(returnTarget?.isConnected) { returnTarget.focus(); return; }
  const matching = returnTarget?.dataset.recordId && [...document.querySelectorAll('[data-action]')].find(el=>el.dataset.recordId===returnTarget.dataset.recordId && el.dataset.action===returnTarget.dataset.action);
  (matching || $('#search')).focus();
}
function closeDialog() { editor=null; dialog.close(); restoreFocus(); }
function showRecord(id, editing, trigger) {
  const p=records.find(item=>item.id===id);
  if(!p) return;
  if(editing && !permissions.get(id)) { notify('This product is managed by procurement and can only be consulted.'); return; }
  returnTarget=trigger || document.activeElement;
  editor=editing?{id,original:{name:p.name,stock:String(p.stock),price:String(p.price)}}:null;
  $('#dialog-content').innerHTML = `<div data-record-id="${p.id}"><header class="dialog-head"><div><p class="eyebrow">${editing?'UPDATE RECORD':'PRODUCT DETAILS'} · ${p.id}</p><h2 id="dialog-title">${editing?'Edit product':'Product overview'}</h2></div><button class="close-button" data-action="cancel" aria-label="Close ${editing?'editor':'product details'}">×</button></header>${editing?editorMarkup(p):detailMarkup(p)}<div class="discard-box" id="discard-confirmation" hidden role="alert"><p><strong>Discard unsaved changes?</strong><br>Your changes to this product haven’t been saved.</p><div class="discard-actions"><button class="secondary" data-action="keep-editing">Keep editing</button><button class="danger-button" data-action="discard">Discard changes</button></div></div></div>`;
  if(!dialog.open) dialog.showModal();
  if(editing) $('[name="name"]').focus();
  else $('.close-button').focus();
}
function detailMarkup(p) {
  return `<div class="dialog-body"><h3 class="detail-name">${escape(p.name)}</h3><dl class="detail-grid"><div><dt>SKU</dt><dd class="sku">${p.sku}</dd></div><div><dt>Category</dt><dd>${p.category}</dd></div><div><dt>Lifecycle status</dt><dd>${statusBadge(p)}</dd></div><div><dt>On-hand stock</dt><dd class="number">${p.stock} units</dd></div><div><dt>Unit price · USD</dt><dd class="number">${money(p.price)}</dd></div><div><dt>Lead time</dt><dd>${p.leadDays} days</dd></div><div><dt>Supplier</dt><dd>${p.supplier}</dd></div><div><dt>Record ID</dt><dd>${p.id}</dd></div></dl><p class="permission"><strong>${permissions.get(p.id)?'Editing permitted':'Consult only'}</strong>${p.permissionReason}</p></div><footer class="dialog-footer"><button class="secondary" data-action="cancel">Close</button>${permissions.get(p.id)?`<button class="primary" data-action="edit" data-record-id="${p.id}">Edit product</button>`:''}</footer>`;
}
function editorMarkup(p) {
  return `<form id="editor-form" novalidate><div class="dialog-body"><p class="editor-context">${p.sku} · ${p.category} · ${p.status}<br>Update the name, on-hand stock and unit price.</p><label class="field">Product name<input name="name" value="${escape(p.name)}" required aria-describedby="name-error"><span class="field-error" id="name-error"></span></label><div class="field-row"><label class="field">On-hand stock<input name="stock" type="number" min="0" step="1" value="${p.stock}" required aria-describedby="stock-help stock-error"><small id="stock-help">Whole units, 0 or more</small><span class="field-error" id="stock-error"></span></label><label class="field">Unit price · USD<input name="price" type="number" min="0" step="any" value="${p.price}" required aria-describedby="price-help price-error"><small id="price-help">Must be greater than $0</small><span class="field-error" id="price-error"></span></label></div><p class="permission"><strong>Editing permitted</strong>${p.permissionReason} Changes are kept for this session.</p></div><footer class="dialog-footer"><button type="button" class="secondary" data-action="cancel">Cancel</button><button type="submit" class="primary" data-action="save">Save changes</button></footer></form>`;
}
function dirty() { return editor && Object.keys(editor.original).some(key=>$(`[name="${key}"]`).value!==editor.original[key]); }
function requestClose() {
  if(dirty()) { $('#discard-confirmation').hidden=false; $('[data-action="keep-editing"]').focus(); }
  else closeDialog();
}
function save(event) {
  event.preventDefault();
  // Recheck trusted source permissions at the mutation boundary, independent of DOM hooks.
  if(!editor || !permissions.get(editor.id)) { notify('You do not have permission to edit this product.'); return; }
  const fields=Object.fromEntries(['name','stock','price'].map(key=>[key,$(`[name="${key}"]`)]));
  const values={name:fields.name.value.trim(),stock:Number(fields.stock.value),price:Number(fields.price.value)};
  const errors={name:!values.name?'Enter a product name.':'',stock:fields.stock.value.trim()==='' || !Number.isSafeInteger(values.stock) || values.stock<0?'Enter a whole number of units, 0 or more.':'',price:fields.price.value.trim()==='' || !Number.isFinite(values.price) || values.price<=0?'Enter a price greater than 0.':''};
  for(const key of Object.keys(fields)) { $(`#${key}-error`).textContent=errors[key]; fields[key].setAttribute('aria-invalid',String(!!errors[key])); }
  const invalid=Object.keys(errors).find(key=>errors[key]);
  if(invalid) { fields[invalid].focus(); return; }
  const p=records.find(p=>p.id===editor.id);
  Object.assign(p,values);
  const sku=p.sku;
  render(); closeDialog(); notify(`${sku} saved. Product details are up to date.`);
}
for(const key of Object.keys(filters)) {
  $(`#${key}`).addEventListener(key==='search'?'input':'change',event=>{ filters[key]=event.target.value; render(); });
}
$('#clear-all').addEventListener('click',resetFilters);
$('#active-filters').addEventListener('click',event=>{
  const key=event.target.closest('[data-clear]')?.dataset.clear;
  if(!key) return;
  filters[key]=''; $(`#${key}`).value=''; render(); $(`#${key}`).focus();
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button) return;
  const action=button.dataset.action;
  if(action==='view' || action==='edit') {
    // Prevent replacing a dirty editor through injected edit controls.
    if(dialog.open && editor) return;
    const trigger=dialog.open?returnTarget:button;
    showRecord(button.dataset.recordId,action==='edit',trigger);
  }
  if(action==='retry') { mode='populated'; resetFilters(); notify('Inventory loaded.'); }
  if(action==='reset') resetFilters();
  if(action==='cancel' && dialog.open) requestClose();
  if(action==='keep-editing') { $('#discard-confirmation').hidden=true; $('[name="name"]').focus(); }
  if(action==='discard' && dialog.open) closeDialog();
});
dialog.addEventListener('cancel',event=>{ event.preventDefault(); requestClose(); });
dialog.addEventListener('submit',save);
// Keep Tab navigation inside the dialog, including at the browser-chrome boundary.
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab') return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=controls[0], last=controls.at(-1);
  if(event.shiftKey && (document.activeElement===first || document.activeElement===dialog)) { event.preventDefault(); last?.focus(); }
  else if(!event.shiftKey && document.activeElement===last) { event.preventDefault(); first?.focus(); }
});
window.addEventListener('beforeunload',event=>{if(dirty()){ event.preventDefault(); event.returnValue=''; }});
render();
