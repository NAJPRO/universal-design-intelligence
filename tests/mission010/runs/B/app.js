import { products } from './data.js';
const collection = products.map(p => ({...p}));
const categories = [...new Set(products.map(p=>p.category))];
const statuses = ['Active','Draft','Archived'];
const params = new URLSearchParams(location.search);
let state = ['empty','error','loading'].includes(params.get('state')) ? params.get('state') : 'populated';
let current = null;
let opener = null;
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
document.querySelector('#app').innerHTML = `
<a class="skip" href="#main">Skip to products</a>
<header class="site-header"><div class="brand"><span class="brand-mark" aria-hidden="true">✳</span><span>Northstar<span class="brand-sub">SUPPLY</span></span></div><div class="workspace">Catalog workspace <span class="role">Catalog editor</span></div></header>
<main id="main"><div class="breadcrumb">Catalog <span aria-hidden="true">/</span> Products</div>
<div class="page-heading"><div><div class="eyebrow">YOUR COLLECTION</div><h1>Products</h1><p>Keep the details right. Keep the collection moving.</p></div><span class="local-note"><span aria-hidden="true">◉</span> Session-only changes</span></div>
<div id="notice" class="notice" role="status" aria-live="polite" hidden></div>
<section class="catalog" aria-label="Product catalog">
<div class="toolbar"><div class="search-field"><label for="search">Search products</label><div class="search-input"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search by name or SKU" autocomplete="off"></div></div><button id="filter-toggle" class="button secondary" aria-expanded="false" aria-controls="filters"><span aria-hidden="true">☷</span> Advanced filters <span id="filter-badge" hidden></span></button></div>
<div id="filters" class="filters" hidden><div><label for="status-filter">Status</label><select id="status-filter"><option value="">All statuses</option>${statuses.map(s=>`<option>${s}</option>`).join('')}</select></div><div><label for="category-filter">Category</label><select id="category-filter"><option value="">All categories</option>${categories.map(s=>`<option>${s}</option>`).join('')}</select></div><label class="check"><input id="low-filter" type="checkbox"> Low stock <span>(5 or fewer)</span></label></div>
<div class="results-bar"><p id="result-count" role="status" aria-live="polite"></p><button id="clear" class="text-button" hidden>Clear filters</button></div>
<div id="results"></div>
<div class="catalog-footer"><span>Prices in USD</span><span>Edits are available where you have permission.</span></div>
</section><p class="session-footnote">Changes are kept in this session and reset when you reload.</p>
</main>
<dialog id="editor" aria-labelledby="editor-title" aria-describedby="editor-description"><form id="edit-form" novalidate><div class="editor-header"><div><div class="eyebrow">PRODUCT DETAILS</div><h2 id="editor-title">Edit product</h2><p id="editor-description"></p></div><button type="button" id="close-editor" class="icon-button" aria-label="Close product editor">×</button></div><div class="editor-body"><p class="editor-note">Update the essentials for your collection.</p><div id="form-alert" class="form-alert" role="alert" hidden></div><div class="field"><label for="product-name">Product name</label><textarea id="product-name" name="name" rows="3" required aria-describedby="name-error"></textarea><p id="name-error" class="field-error" hidden></p></div><div class="field-grid"><div class="field"><label for="product-category">Category</label><select id="product-category" name="category" aria-describedby="category-error">${categories.map(s=>`<option>${s}</option>`).join('')}</select><p id="category-error" class="field-error" hidden></p></div><div class="field"><label for="product-status">Status</label><select id="product-status" name="status" aria-describedby="status-error">${statuses.map(s=>`<option>${s}</option>`).join('')}</select><p id="status-error" class="field-error" hidden></p></div></div><div class="field-grid"><div class="field"><label for="product-stock">Stock quantity</label><input id="product-stock" name="stock" type="number" min="0" step="1" required aria-describedby="stock-hint stock-error"><p id="stock-hint" class="hint">Whole units, 0 or more</p><p id="stock-error" class="field-error" hidden></p></div><div class="field"><label for="product-price">Price (USD)</label><input id="product-price" name="price" type="number" min="0.01" step="0.01" required aria-describedby="price-hint price-error"><p id="price-hint" class="hint">Amount greater than $0.00</p><p id="price-error" class="field-error" hidden></p></div></div></div><div class="editor-footer"><span id="edit-state">No unsaved changes</span><div><button type="button" id="cancel-editor" class="button secondary">Cancel</button><button type="submit" class="button primary">Save changes</button></div></div></form></dialog>`;
const $ = s=>document.querySelector(s);
const filters = () => ({query:$('#search').value.trim().toLowerCase(),status:$('#status-filter').value,category:$('#category-filter').value,low:$('#low-filter').checked});
function render() {
 const f=filters();
 const filtered=collection.filter(p=>(!f.query||`${p.name} ${p.id}`.toLowerCase().includes(f.query))&&(!f.status||p.status===f.status)&&(!f.category||p.category===f.category)&&(!f.low||p.stock<=5));
 const active=Object.values(f).filter(Boolean).length;
 $('#clear').hidden=!active;
 const advanced=[f.status,f.category,f.low].filter(Boolean).length;
 $('#filter-badge').hidden=!advanced; $('#filter-badge').textContent=advanced;
 $('#result-count').textContent=state==='populated'?`${filtered.length} of ${collection.length} products${active?' · Filtered collection':''}`:state==='empty'?'0 products':'Product collection';
 if(state==='loading') $('#results').innerHTML='<div class="collection-state" role="status" aria-live="polite"><span class="state-symbol" aria-hidden="true">◌</span><h2>Loading your collection</h2><p>Getting product details ready…</p></div>';
 else if(state==='error') $('#results').innerHTML='<div class="collection-state" role="alert"><span class="state-symbol" aria-hidden="true">!</span><h2>We couldn’t load the products</h2><p>Your collection is unavailable. Try loading it again.</p><button class="button primary" id="retry">Retry</button></div>';
 else if(state==='empty') $('#results').innerHTML='<div class="collection-state"><span class="state-symbol" aria-hidden="true">□</span><h2>Your collection is empty</h2><p>There are no products to manage yet.</p></div>';
 else if(!filtered.length) $('#results').innerHTML='<div class="collection-state"><span class="state-symbol" aria-hidden="true">⌕</span><h2>No products match</h2><p>Try another search or clear the filters to see your collection.</p><button class="button secondary" id="empty-clear">Clear filters</button></div>';
 else $('#results').innerHTML=`<p class="scroll-hint">Swipe or scroll to compare all product details →</p><div class="table-scroll" tabindex="0" role="region" aria-label="Products table, scroll horizontally for all columns"><table><caption class="sr-only">Product collection, prices in US dollars</caption><thead><tr><th scope="col" class="name-column">Product name</th><th scope="col">SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col" class="number">Stock</th><th scope="col" class="number">Price (USD)</th><th scope="col" class="action-column">Access</th></tr></thead><tbody>${filtered.map(p=>`<tr><th scope="row" class="product-name">${esc(p.name)}</th><td class="sku">${p.id}</td><td>${p.category}</td><td><span class="status ${p.status.toLowerCase()}"><span aria-hidden="true">${p.status==='Active'?'●':p.status==='Draft'?'◐':'−'}</span> ${p.status}</span></td><td class="number stock">${p.stock}<span class="stock-label ${p.stock<=5?'low':''}">${p.stock===0?'Out of stock':p.stock<=5?'Low stock':'In stock'}</span></td><td class="number price">${money(p.price)}</td><td>${p.canEdit?`<button class="edit-button" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">Edit <span aria-hidden="true">↗</span></button>`:'<span class="read-only">Read only</span><span class="permission-note">No edit permission</span>'}</td></tr>`).join('')}</tbody></table></div>`;
 $('#retry')?.addEventListener('click',()=>{state='populated';render();});
 $('#empty-clear')?.addEventListener('click',clearFilters);
 document.querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.edit,button)));
}
function clearFilters(){ $('#search').value=''; $('#status-filter').value=''; $('#category-filter').value=''; $('#low-filter').checked=false; render(); $('#search').focus(); }
$('#clear').addEventListener('click',clearFilters);
['search','status-filter','category-filter','low-filter'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
$('#filter-toggle').addEventListener('click',()=>{const open=$('#filters').hidden;$('#filters').hidden=!open;$('#filter-toggle').setAttribute('aria-expanded',String(open));});
const form=$('#edit-form'), dialog=$('#editor');
const values=()=>Object.fromEntries(new FormData(form));
let initial='';
const dirty=()=>current&&JSON.stringify(values())!==initial;
function openEditor(id,button){
 const product=collection.find(p=>p.id===id);
 if(!product?.canEdit||state!=='populated')return;
 current=product;opener=button;
 for(const key of ['name','category','status','stock','price'])form.elements[key].value=product[key];
 $('#editor-description').textContent=`${product.id} · Changes apply to this session`;
 resetErrors(); initial=JSON.stringify(values()); $('#edit-state').textContent='No unsaved changes';
 dialog.showModal(); $('#product-name').focus();
}
function resetErrors(){ $('#form-alert').hidden=true; for(const field of form.querySelectorAll('[aria-invalid]'))field.removeAttribute('aria-invalid'); for(const error of form.querySelectorAll('.field-error'))error.hidden=true; }
function closeEditor(){ if(dirty()&&!confirm('Discard your unsaved product changes?')) return; dialog.close();current=null;opener?.focus(); }
$('#cancel-editor').addEventListener('click',closeEditor);$('#close-editor').addEventListener('click',closeEditor);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
form.addEventListener('input',()=>{$('#edit-state').textContent=dirty()?'Unsaved changes':'No unsaved changes';});
form.addEventListener('change',()=>{$('#edit-state').textContent=dirty()?'Unsaved changes':'No unsaved changes';});
window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
form.addEventListener('submit',event=>{
 event.preventDefault(); if(!current?.canEdit)return;resetErrors(); const v=values(), errors={};
 if(!v.name.trim())errors.name='Enter a product name.';
 if(!categories.includes(v.category))errors.category='Choose an available category.';
 if(!statuses.includes(v.status))errors.status='Choose an available status.';
 if(v.stock.trim()===''||!Number.isSafeInteger(Number(v.stock))||Number(v.stock)<0)errors.stock='Enter a whole number of 0 or more.';
 if(v.price.trim()===''||!Number.isFinite(Number(v.price))||Number(v.price)<=0||Math.abs(Number(v.price)*100-Math.round(Number(v.price)*100))>0.00001)errors.price='Enter a price greater than 0, with up to 2 decimal places.';
 if(Object.keys(errors).length){for(const [key,message] of Object.entries(errors)){const error=$('#'+key+'-error');error.textContent=message;error.hidden=false;form.elements[key].setAttribute('aria-invalid','true');} $('#form-alert').textContent='Changes haven’t been saved. Check the highlighted fields below.';$('#form-alert').hidden=false;form.elements[Object.keys(errors)[0]].focus();return;}
 const id=current.id;
 Object.assign(current,{name:v.name.trim(),category:v.category,status:v.status,stock:Number(v.stock),price:Number(v.price)});
 current=null;dialog.close();render();$('#notice').textContent=`✓ ${id} saved. Your product changes are up to date for this session.`;$('#notice').hidden=false;
 const returnButton=document.querySelector(`[data-edit="${id}"]`);(returnButton||$('#search')).focus();
});
render();if(params.get('edit'))openEditor(params.get('edit'),null);
