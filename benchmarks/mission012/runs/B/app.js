// Original Tern Works application, MIT. Session-only edits; no external services.
import { products } from './data.js';
const records = products.map(p => ({ ...p }));
const permissions = new Map(products.map(p => [p.id, Object.freeze({allowed:p.canEdit, reason:p.permissionReason})]));
const $ = s => document.querySelector(s);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
let state = new URLSearchParams(location.search).get('state');
if (!['empty','loading','error'].includes(state)) state='ready';
let visible = [], currentId=null, mode=null, returnControl=null, origin='list', confirming=false;
const dialog = $('#record-dialog');
const filters = ['search','category','status','stock'];
for (const key of ['category','status']) {
  for (const value of [...new Set(records.map(p=>p[key]))]) $(`#${key}`).insertAdjacentHTML('beforeend',`<option>${escape(value)}</option>`);
}
const values = () => Object.fromEntries(filters.map(key=>[key,$(`#${key}`).value]));
function filtered() {
  const v=values(), term=v.search.trim().toLowerCase();
  return records.filter(p=>(!term || `${p.name} ${p.sku}`.toLowerCase().includes(term)) && (!v.category || p.category===v.category) && (!v.status || p.status===v.status) && (!v.stock || (v.stock==='out' ? p.stock===0 : v.stock==='low' ? p.stock>0 && p.stock<=10 : p.stock>0))).sort((a,b)=>{
    const order=$('#sort').value;
    return order==='name' ? a.name.localeCompare(b.name) : order==='stock' ? a.stock-b.stock || a.id.localeCompare(b.id) : order==='price' ? a.price-b.price : a.id.localeCompare(b.id);
  });
}
function announce(message){$('#notice').textContent=message;}
function badge(p){return `<span class="badge ${p.status.toLowerCase()}">${escape(p.status)}</span>`;}
function renderOverview(){
  const ready=state==='ready';
  const entries=[['Total products',ready?records.length:state==='empty'?0:'—','Across all categories','▦',''],['Units on hand',ready?records.reduce((n,p)=>n+p.stock,0).toLocaleString():state==='empty'?0:'—','All lifecycle statuses','≡',''],['Out of stock',ready?records.filter(p=>p.stock===0).length:state==='empty'?0:'—','Records with zero units','!','attention']];
  $('#overview').innerHTML=entries.map(([title,n,sub,icon,cls])=>`<div class="metric ${cls}"><span class="metric-label">${title}</span><strong>${n}</strong><small>${sub}</small><span class="metric-icon" aria-hidden="true">${icon}</span></div>`).join('');
}
function renderChips(){
  const v=values(), labels={search:'Search',category:'Category',status:'Status',stock:'Stock'}, stockLabels={out:'Out of stock',low:'Low stock',available:'In stock'};
  $('#active-filters').innerHTML=filters.filter(key=>v[key]).map(key=>`<button type="button" class="chip" data-remove="${key}" aria-label="Remove ${labels[key]} filter: ${escape(key==='stock'?stockLabels[v[key]]:v[key])}">${labels[key]}: ${escape(key==='stock'?stockLabels[v[key]]:v[key])} <span aria-hidden="true">×</span></button>`).join('')+(filters.some(key=>v[key])?'<button type="button" class="clear" data-action="clear">Clear all</button>':'');
}
function stateMarkup(icon,title,description,action,label){return `<div class="state"><span class="state-icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${description}</p><button type="button" class="primary" data-action="${action}">${label}</button></div>`;}
function renderResults(){
  renderOverview();renderChips();
  const disabled=state!=='ready';
  $('#filters').querySelectorAll('input,select').forEach(el=>el.disabled=disabled);$('#sort').disabled=disabled;
  const results=$('#results');results.setAttribute('aria-busy',String(state==='loading'));
  if(state!=='ready'){
    $('#result-count').textContent=state==='empty'?'0 products':state==='loading'?'Loading products…':'Products unavailable';
    const states={empty:['▦','No products in this inventory','There are no records in this collection. Load the sample inventory to explore the workspace.','retry','Load sample inventory'],loading:['…','Loading inventory','Product records are pending. Load the local inventory when you’re ready.','retry','Load inventory now'],error:['!','Inventory couldn’t be loaded','The records are unavailable. Try again to reload the local inventory.','retry','Retry loading']};
    results.innerHTML=stateMarkup(...states[state]);return;
  }
  visible=filtered();$('#result-count').textContent=`${visible.length} of ${records.length} products`;
  if(!visible.length){results.innerHTML=stateMarkup('⌕','No matching products','Try another name or SKU, remove a filter, or clear all filters to see the full inventory.','clear','Clear all filters');return;}
  results.innerHTML=`<div class="table-scroll" tabindex="0" role="region" aria-label="Product comparison, scroll for more records and columns" aria-describedby="scroll-hint"><table role="table"><caption>Inventory products. Prices in USD; stock in units.</caption><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Product / category</th><th scope="col" role="columnheader">Status</th><th scope="col" role="columnheader" class="num">Stock</th><th scope="col" role="columnheader" class="num">Unit price</th><th scope="col" role="columnheader">Supplier / lead time</th><th scope="col" role="columnheader" class="access">Access / action</th></tr></thead><tbody role="rowgroup">${visible.map(p=>`<tr role="row" data-record-id="${p.id}"><th scope="row" role="rowheader"><button type="button" class="product-name" data-action="details" data-record-id="${p.id}">${escape(p.name)}</button><span class="meta"><span class="sku">${p.sku}</span> <span aria-hidden="true">·</span> ${p.category}</span></th><td role="cell"><span class="mobile-label" aria-hidden="true">Lifecycle status</span>${badge(p)}</td><td role="cell" class="num"><span class="mobile-label" aria-hidden="true">Stock · units</span><span class="${p.stock===0?'zero':''}">${p.stock}</span>${p.stock===0?'<span class="stock-note">Out of stock</span>':''}</td><td role="cell" class="num"><span class="mobile-label" aria-hidden="true">Unit price · USD</span>${money(p.price)}</td><td role="cell" class="supplier"><div><span class="mobile-label" aria-hidden="true">Supplier</span>${escape(p.supplier)}</div><span class="meta">${p.leadDays}-day lead time</span></td><td role="cell" class="access">${permissions.get(p.id).allowed?`<span class="readonly">Editable</span><button type="button" class="edit-button" data-action="edit" data-record-id="${p.id}" aria-label="Edit ${p.sku}">Edit</button>`:`<span class="readonly">Read only</span><button type="button" class="text-button" data-action="details" data-record-id="${p.id}" aria-label="View permission details for ${p.sku}">Why read only?</button>`}</td></tr>`).join('')}</tbody></table></div>`;
}
function header(title,p){return `<div class="dialog-heading"><div><p class="eyebrow">PRODUCT RECORD</p><h2 id="dialog-title">${title}</h2><span class="meta"><span class="sku">${p.sku}</span> · ${p.id}</span></div><button type="button" class="close" data-action="cancel" aria-label="Close ${title.toLowerCase()}">×</button></div>`;}
function showDetails(id,trigger){
  const p=records.find(p=>p.id===id);if(!p)return;
  if(!dialog.open){returnControl=trigger;dialog.showModal();}
  currentId=id;mode='details';confirming=false;
  dialog.innerHTML=header('Product details',p)+`<div class="dialog-body" data-record-id="${p.id}"><h3 class="detail-name">${escape(p.name)}</h3><dl class="details-grid"><div><dt>Category</dt><dd>${p.category}</dd></div><div><dt>Lifecycle status</dt><dd>${badge(p)}</dd></div><div><dt>Stock on hand</dt><dd>${p.stock} units${p.stock===0?' · Out of stock':''}</dd></div><div><dt>Unit price · USD</dt><dd>${money(p.price)}</dd></div><div><dt>Supplier</dt><dd>${p.supplier}</dd></div><div><dt>Lead time</dt><dd>${p.leadDays} days</dd></div></dl><div class="permission"><strong>${permissions.get(id).allowed?'Editing permitted':'Read only · Procurement managed'}</strong>${escape(permissions.get(id).reason)}</div></div><div class="dialog-actions"><button type="button" data-action="cancel">Close</button>${permissions.get(id).allowed?`<button type="button" class="primary" data-action="edit" data-record-id="${id}">Edit product</button>`:''}</div>`;
  dialog.querySelector('.close').focus();dialog.scrollTop=0;
}
function openEdit(id,trigger){
  const p=records.find(p=>p.id===id);
  if(!p || !permissions.get(id)?.allowed){announce('This record is read only. Managed by procurement; inventory role can consult only.');return;}
  origin=dialog.open?'details':'list';if(!dialog.open){returnControl=trigger;dialog.showModal();}
  currentId=id;mode='edit';confirming=false;
  dialog.innerHTML=header('Edit product',p)+`<form id="editor" novalidate data-record-id="${id}"><div class="dialog-body"><p class="hint" style="margin:0 0 20px">Update name, stock and price. All fields are required.</p><div class="error-summary" id="error-summary" tabindex="-1" role="alert"></div><div class="form-field"><label for="edit-name">Product name</label><textarea id="edit-name" name="name" required aria-describedby="name-error">${escape(p.name)}</textarea><p class="error" id="name-error"></p></div><div class="form-row"><div class="form-field"><label for="edit-stock">Stock on hand</label><input id="edit-stock" name="stock" type="text" inputmode="numeric" required value="${p.stock}" aria-describedby="stock-hint stock-error"><p class="hint" id="stock-hint">Whole units, zero or more.</p><p class="error" id="stock-error"></p></div><div class="form-field"><label for="edit-price">Unit price · USD</label><input id="edit-price" name="price" type="text" inputmode="decimal" required value="${p.price}" aria-describedby="price-hint price-error"><p class="hint" id="price-hint">A number greater than zero.</p><p class="error" id="price-error"></p></div></div><div class="permission"><strong>Editing permitted</strong>${escape(permissions.get(id).reason)} Category, status and sourcing details are read only.</div><p class="unsaved" id="edit-status" role="status">No unsaved changes.</p></div><div class="dialog-actions"><button type="button" data-action="cancel">Cancel</button><button type="submit" class="primary" data-action="save">Save changes</button></div></form><section class="confirm" id="discard-confirm" aria-labelledby="discard-title" hidden><h3 id="discard-title">Discard unsaved changes?</h3><p>Your changes to this product haven’t been saved.</p><div><button type="button" class="primary" data-action="stay">Keep editing</button><button type="button" class="danger" data-action="discard">Discard changes</button></div></section>`;
  $('#edit-name').focus();dialog.scrollTop=0;
}
function dirty(){
  if(mode!=='edit')return false;
  const p=records.find(p=>p.id===currentId),f=$('#editor');
  return f && (f.elements.name.value!==p.name || f.elements.stock.value!==String(p.stock) || f.elements.price.value!==String(p.price));
}
function closeDialog(){
  dialog.close();mode=null;currentId=null;confirming=false;
  const id=returnControl?.dataset.recordId,action=returnControl?.dataset.action;
  const target=returnControl?.isConnected?returnControl:document.querySelector(`#results [data-action="${action}"][data-record-id="${id}"]`);
  (target || $('#inventory')).focus();
}
function finishCancel(){
  if(mode==='edit' && origin==='details'){showDetails(currentId);return;}
  closeDialog();
}
function requestCancel(){
  if(confirming){stay();return;}
  if(dirty()){
    confirming=true;$('#discard-confirm').hidden=false;$('#editor').inert=true;
    dialog.querySelector('[data-action="stay"]').focus();$('#discard-confirm').scrollIntoView({block:'nearest'});
  }else finishCancel();
}
function stay(){confirming=false;$('#discard-confirm').hidden=true;$('#editor').inert=false;$('#editor [data-action="cancel"]').focus();}
function save(){
  if(mode!=='edit'||confirming)return;
  const p=records.find(p=>p.id===currentId);
  if(!p||!permissions.get(currentId)?.allowed){announce('Save blocked: this product is read only.');return;}
  const f=$('#editor'),name=f.elements.name.value.trim(),stockText=f.elements.stock.value.trim(),priceText=f.elements.price.value.trim(),stock=Number(stockText),price=Number(priceText),errors={};
  if(!name)errors.name='Enter a product name.';
  if(!/^\d+$/.test(stockText)||!Number.isSafeInteger(stock)||stock<0)errors.stock='Enter a whole number of units, zero or more.';
  if(!priceText||!Number.isFinite(price)||price<=0)errors.price='Enter a finite price greater than zero.';
  for(const key of ['name','stock','price']){f.elements[key].setAttribute('aria-invalid',String(!!errors[key]));$(`#${key}-error`).textContent=errors[key]||'';}
  $('#error-summary').innerHTML=Object.keys(errors).length?`<strong>Check the following fields</strong>${Object.entries(errors).map(([key,message])=>`<a href="#edit-${key}">${message}</a>`).join('')}`:'';
  if(Object.keys(errors).length){$('#error-summary').focus();return;}
  p.name=name;p.stock=stock;p.price=price;renderResults();announce(`Saved ${p.sku}. Product name, stock and price are up to date for this session.`);
  closeDialog();
}
$('#filters').addEventListener('submit',e=>e.preventDefault());
filters.forEach(key=>$(`#${key}`).addEventListener(key==='search'?'input':'change',renderResults));
$('#sort').addEventListener('change',renderResults);
$('#adaptive-view').addEventListener('click',()=>setView(false));$('#table-view').addEventListener('click',()=>setView(true));
function setView(table){$('.workspace').classList.toggle('force-table',table);$('#adaptive-view').setAttribute('aria-pressed',String(!table));$('#table-view').setAttribute('aria-pressed',String(table));}
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.remove){$(`#${button.dataset.remove}`).value='';renderResults();$(`#${button.dataset.remove}`).focus();return;}
  const action=button.dataset.action;
  if(action==='edit')openEdit(button.dataset.recordId,button);
  if(action==='details')showDetails(button.dataset.recordId,button);
  if(action==='cancel')requestCancel();
  if(action==='discard')finishCancel();
  if(action==='stay')stay();
  if(action==='clear'){filters.forEach(key=>$(`#${key}`).value='');renderResults();$('#search').focus();}
  if(action==='retry'){state='ready';renderResults();announce('Local inventory loaded.');$('#inventory').focus();}
});
dialog.addEventListener('submit',e=>{e.preventDefault();save();});
dialog.addEventListener('input',()=>{if(mode==='edit')$('#edit-status').textContent=dirty()?'Unsaved changes.':'No unsaved changes.';});
dialog.addEventListener('click',e=>{const link=e.target.closest('#error-summary a');if(link){e.preventDefault();$(link.getAttribute('href')).focus();}});
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();requestCancel();}});
dialog.addEventListener('cancel',e=>{e.preventDefault();requestCancel();});
window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
renderResults();
