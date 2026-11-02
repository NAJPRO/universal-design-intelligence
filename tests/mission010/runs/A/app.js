import { products } from './data.js';

const collection = products.map(product => ({...product}));
const categories = [...new Set(products.map(product => product.category))].sort();
const statuses = ['Active', 'Draft', 'Archived'];
const money = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
const params = new URLSearchParams(location.search);
let state = ['populated','empty','error','loading'].includes(params.get('state')) ? params.get('state') : 'populated';
let editing = null;
let initialForm = '';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const app = document.querySelector('#app');
app.innerHTML = `
  <aside class="sidebar" aria-label="Workspace">
    <a class="brand" href="./" aria-label="Northstar Supply home"><span class="brand-mark" aria-hidden="true">✳</span><span>Northstar<span class="brand-sub">SUPPLY</span></span></a>
    <div class="workspace-label">WORKSPACE</div><a class="nav-item" href="./" aria-current="page"><span aria-hidden="true">▦</span> Products <span class="nav-count">12</span></a>
    <div class="sidebar-foot"><span class="avatar" aria-hidden="true">CE</span><div>Catalog editor<small>Northstar Supply</small></div></div>
  </aside>
  <div class="main-shell"><header class="topbar"><span>Catalog <span aria-hidden="true">/</span> <strong>Products</strong></span><span class="session-label"><i aria-hidden="true"></i> Local workspace</span></header>
  <main id="main"><div class="page-heading"><div><div class="eyebrow">YOUR CATALOG, IN ORDER</div><h1>Products</h1><p>Keep your collection accurate and ready for what’s next.</p></div><span class="collection-tag">NORTHSTAR COLLECTION</span></div>
    <div class="stats" aria-label="Collection overview"><div><span>Total products</span><strong id="total-stat">—</strong></div><div><span>Active products</span><strong id="active-stat">—</strong></div><div><span>Low stock <small>≤ 5 units</small></span><strong id="low-stat">—</strong></div></div>
    <section class="catalog" aria-labelledby="collection-title"><div class="catalog-top"><div><h2 id="collection-title">All products</h2><p>View, compare and manage your product details.</p></div><span class="currency-note">Prices in USD</span></div>
      <div class="toolbar"><div class="search-wrap"><span aria-hidden="true">⌕</span><label class="sr-only" for="search">Search by product name or SKU</label><input id="search" type="search" placeholder="Search by name or SKU…" autocomplete="off"></div><button id="filter-toggle" type="button" aria-expanded="false" aria-controls="advanced-filters"><span aria-hidden="true">☷</span> Filters <span id="filter-count"></span></button></div>
      <div id="advanced-filters" class="advanced-filters" hidden><div><label for="status-filter">Status</label><select id="status-filter"><option value="">All statuses</option>${statuses.map(value=>`<option>${value}</option>`).join('')}</select></div><div><label for="category-filter">Category</label><select id="category-filter"><option value="">All categories</option>${categories.map(value=>`<option>${value}</option>`).join('')}</select></div><label class="checkbox-label" for="low-filter"><input id="low-filter" type="checkbox">Low stock <span>(≤ 5 units)</span></label></div>
      <div class="results-line"><span id="result-count" role="status" aria-live="polite"></span><button id="clear-filters" class="text-button" type="button" hidden>Clear filters</button></div>
      <div id="collection-content"></div>
      <div class="catalog-footer"><span>Changes are saved for this session.</span><span id="footer-count"></span></div>
    </section><p class="page-note">A considered collection. Every detail counts.</p>
  </main></div>
  <div id="announcement" class="toast" role="status" aria-live="polite" hidden></div>
  <dialog id="editor" aria-labelledby="editor-title"><form id="editor-form" novalidate><div class="editor-header"><div><div class="eyebrow">PRODUCT DETAILS</div><h2 id="editor-title">Edit product</h2><p id="editor-sku"></p></div><button type="button" class="icon-button" id="close-editor" aria-label="Close product editor">×</button></div><div class="editor-body"><p class="editor-intro">Update the details below. Changes apply when you save.</p><div id="form-errors" class="error-summary" role="alert" hidden></div><div class="field"><label for="product-name">Product name</label><textarea id="product-name" name="name" rows="3" required></textarea><span class="field-error" id="name-error"></span></div><div class="field"><label for="product-category">Category</label><select id="product-category" name="category">${categories.map(value=>`<option>${value}</option>`).join('')}</select><span class="field-error" id="category-error"></span></div><div class="field"><label for="product-status">Status</label><select id="product-status" name="status">${statuses.map(value=>`<option>${value}</option>`).join('')}</select><span class="field-error" id="status-error"></span></div><div class="field-pair"><div class="field"><label for="product-stock">Stock quantity</label><input id="product-stock" name="stock" type="number" min="0" step="1" required><span class="field-error" id="stock-error"></span></div><div class="field"><label for="product-price">Price (USD)</label><input id="product-price" name="price" type="number" min="0.01" step="0.01" required><span class="field-error" id="price-error"></span></div></div><p class="editor-session">Saved changes stay in this browser session. Reloading restores the original catalog.</p></div><div class="editor-actions"><button type="button" id="cancel-editor">Cancel</button><button class="primary" type="submit">Save changes</button></div></form></dialog>`;

const $ = selector => document.querySelector(selector);
const dialog = $('#editor');
const form = $('#editor-form');
const filters = () => ({search: $('#search').value.trim().toLowerCase(), status: $('#status-filter').value, category: $('#category-filter').value, low: $('#low-filter').checked});
const hasFilters = () => Object.values(filters()).some(Boolean);
function render() {
  const source = state === 'populated' ? collection : [];
  $('#total-stat').textContent = state === 'populated' || state === 'empty' ? source.length : '—';
  $('#active-stat').textContent = state === 'populated' || state === 'empty' ? source.filter(p=>p.status==='Active').length : '—';
  $('#low-stat').textContent = state === 'populated' || state === 'empty' ? source.filter(p=>p.stock<=5).length : '—';
  $('.nav-count').textContent = state === 'populated' || state === 'empty' ? source.length : '—';
  const f = filters();
  const shown = source.filter(p=>(!f.search || `${p.name} ${p.id}`.toLowerCase().includes(f.search)) && (!f.status || p.status===f.status) && (!f.category || p.category===f.category) && (!f.low || p.stock<=5));
  $('#result-count').textContent = state === 'loading' ? 'Loading collection…' : state === 'error' ? 'Collection unavailable' : `${shown.length} of ${source.length} products`;
  $('#clear-filters').hidden = !hasFilters();
  const count = [f.status,f.category,f.low].filter(Boolean).length;
  $('#filter-count').textContent = count ? `(${count})` : '';
  $('#footer-count').textContent = shown.length ? `${shown.length} products displayed` : '';
  const content = $('#collection-content');
  if(state==='loading') {content.innerHTML=`<div class="state-panel" role="status"><span class="spinner" aria-hidden="true"></span><h3>Loading your collection</h3><p>Getting your product details ready.</p></div>`; return;}
  if(state==='error') {content.innerHTML=`<div class="state-panel"><span class="state-icon error-icon" aria-hidden="true">!</span><h3>We couldn’t load your products</h3><p>Your collection is unavailable. Try loading it again.</p><button class="primary" id="retry">Retry</button></div>`; $('#retry').onclick=()=>{state='populated';render();announce('Collection loaded. 12 products available.');};return;}
  if(!shown.length) {content.innerHTML=`<div class="state-panel"><span class="state-icon" aria-hidden="true">▦</span><h3>${hasFilters()?'No matching products':'Your collection is empty'}</h3><p>${hasFilters()?'Try a different search or clear your filters to see the collection.':'There are no products in this collection yet.'}</p>${hasFilters()?'<button id="empty-clear" type="button">Clear filters</button>':''}</div>`;if($('#empty-clear')) $('#empty-clear').onclick=clearFilters;return;}
  content.innerHTML=`<p class="scroll-hint">Scroll horizontally to compare all product details →</p><div class="table-scroll" tabindex="0" role="region" aria-label="Product table, scroll horizontally for more columns"><table><caption class="sr-only">Northstar Supply product catalog. Prices in USD.</caption><thead><tr><th scope="col">Product name</th><th scope="col">SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col" class="numeric">Stock</th><th scope="col" class="numeric">Price</th><th scope="col">Action</th></tr></thead><tbody>${shown.map(p=>`<tr><th scope="row" class="product-name">${escape(p.name)}</th><td class="sku">${p.id}</td><td>${p.category}</td><td><span class="badge ${p.status.toLowerCase()}"><i aria-hidden="true"></i>${p.status}</span></td><td class="numeric stock ${p.stock<=5?'low-stock':''}">${p.stock}<span class="stock-note">${p.stock===0?'Out of stock':p.stock<=5?'Low stock':''}</span></td><td class="numeric price">${money.format(p.price)}</td><td>${p.canEdit?`<button class="edit-button" data-edit="${p.id}" aria-label="Edit ${escape(p.name)}">Edit <span aria-hidden="true">↗</span></button>`:'<span class="read-only">Read only<small>You don’t have edit permission.</small></span>'}</td></tr>`).join('')}</tbody></table></div>`;
  content.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>openEditor(button.dataset.edit));
}
function clearFilters() {$('#search').value='';$('#status-filter').value='';$('#category-filter').value='';$('#low-filter').checked=false;render();$('#search').focus();}
function announce(message) {$('#announcement').textContent=message;$('#announcement').hidden=false;}
function snapshot() {return JSON.stringify(Object.fromEntries(new FormData(form)));}
function dirty() {return editing && snapshot()!==initialForm;}
function closeEditor() {if(dirty() && !confirm('Discard your unsaved changes? Your edits will be lost.')) return;dialog.close();editing=null;}
function clearErrors() {$('#form-errors').hidden=true;for(const name of ['name','category','status','stock','price']) {const input=form.elements[name];input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');$(`#${name}-error`).textContent='';}}
function openEditor(id) {
  const product=collection.find(p=>p.id===id);
  if(!product || !product.canEdit || state!=='populated') return;
  editing=product;clearErrors();
  for(const name of ['name','category','status','stock','price']) form.elements[name].value=product[name];
  $('#editor-sku').textContent=product.id;
  initialForm=snapshot();dialog.showModal();$('#product-name').focus();
}
form.onsubmit=event=>{
  event.preventDefault();clearErrors();if(!editing?.canEdit) return;
  const values=Object.fromEntries(new FormData(form));
  const errors={};
  if(!values.name.trim()) errors.name='Enter a product name.';
  if(!categories.includes(values.category)) errors.category='Choose a listed category.';
  if(!statuses.includes(values.status)) errors.status='Choose a listed status.';
  if(!values.stock.trim() || !Number.isInteger(Number(values.stock)) || Number(values.stock)<0) errors.stock='Enter a whole number of 0 or more.';
  if(!values.price.trim() || !Number.isFinite(Number(values.price)) || Number(values.price)<=0) errors.price='Enter a price greater than $0.';
  if(Object.keys(errors).length) {
    $('#form-errors').textContent=`Please correct ${Object.keys(errors).length===1?'the highlighted field':'the highlighted fields'} before saving. Your changes are still here.`;$('#form-errors').hidden=false;
    for(const [name,message] of Object.entries(errors)) {form.elements[name].setAttribute('aria-invalid','true');form.elements[name].setAttribute('aria-describedby',`${name}-error`);$(`#${name}-error`).textContent=message;}
    form.elements[Object.keys(errors)[0]].focus();return;
  }
  Object.assign(editing,{name:values.name.trim(),category:values.category,status:values.status,stock:Number(values.stock),price:Number(values.price)});
  const savedName=editing.name;const savedId=editing.id;editing=null;dialog.close();render();
  (document.querySelector(`[data-edit="${savedId}"]`) || $('#search')).focus();
  announce(`Saved changes to ${savedName}.`);
};
$('#search').oninput=render;
for(const selector of ['#status-filter','#category-filter','#low-filter']) $(selector).onchange=render;
$('#clear-filters').onclick=clearFilters;
$('#filter-toggle').onclick=()=>{const expanded=$('#filter-toggle').getAttribute('aria-expanded')==='true';$('#filter-toggle').setAttribute('aria-expanded',String(!expanded));$('#advanced-filters').hidden=expanded;};
$('#close-editor').onclick=closeEditor;
$('#cancel-editor').onclick=closeEditor;
dialog.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab') return;
  const controls=[...dialog.querySelectorAll('button, input, select, textarea')].filter(control=>!control.disabled);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
  else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
});
window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
render();
if(params.get('edit')) openEditor(params.get('edit'));
