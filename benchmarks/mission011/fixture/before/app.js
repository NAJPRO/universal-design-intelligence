import { products } from './data.js';
const items = products.map(p => ({...p}));
const categories = [...new Set(items.map(p => p.category))];
const statuses = ['Active','Draft','Archived'];
const params = new URLSearchParams(location.search);
let state = ['empty','error','loading'].includes(params.get('state')) ? params.get('state') : 'populated';
let current = null, baseline = '', returnId = null;
const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const options = a => a.map(v => `<option>${esc(v)}</option>`).join('');
document.querySelector('#app').innerHTML = `
<a class="skip" href="#main">Skip to products</a>
<header class="shell"><div class="brand"><span class="brand-mark" aria-hidden="true">✳</span><span>Northstar<span class="brand-sub">SUPPLY</span></span></div><span class="shell-section">Catalog workspace</span><span class="role">Catalog editor</span></header>
<main id="main"><div class="breadcrumb">Catalog <span aria-hidden="true">/</span> Products</div>
<div class="page-heading"><div><p class="eyebrow">YOUR COLLECTION, IN ORDER</p><h1>Products</h1><p class="intro">Compare your catalog. Keep every detail current.</p></div><div class="local-note"><span class="dot"></span> Local workspace<span>Changes last for this session</span></div></div>
<div id="notice" role="status" class="notice" hidden></div>
<section class="collection" aria-labelledby="collection-heading"><div class="toolbar"><div class="section-heading"><h2 id="collection-heading">Product catalog</h2><span>All prices in USD</span></div>
<div class="search-row"><div class="search-field"><label for="search">Search products</label><div class="search-box"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search by name or SKU" autocomplete="off"></div></div><button id="filter-toggle" aria-expanded="false" aria-controls="advanced">Advanced filters <span id="filter-count"></span><span aria-hidden="true">⌄</span></button></div>
<div id="advanced" hidden><fieldset><legend>Refine products <span>Filters apply immediately</span></legend><div class="filter-grid"><label>Status<select id="status"><option value="">All statuses</option>${options(statuses)}</select></label><label>Category<select id="category"><option value="">All categories</option>${options(categories)}</select></label><label class="checkbox"><input type="checkbox" id="low"> Low stock <span>(5 or fewer)</span></label></div></fieldset></div>
<div class="results-line"><p id="count" role="status" aria-live="polite"></p><button class="text-button" id="clear" hidden>Clear filters</button></div><div id="active" aria-label="Active filters"></div></div>
<p class="scroll-hint">Swipe or scroll across the table to compare all details →</p><div class="table-scroll" role="region" aria-label="Product comparison table, scroll horizontally on smaller screens" tabindex="0"><table><caption class="sr-only">Northstar Supply products, prices in US dollars</caption><colgroup><col class="name-col"><col class="sku-col"><col class="category-col"><col class="status-col"><col class="stock-col"><col class="price-col"><col class="action-col"></colgroup><thead><tr><th scope="col">Product name</th><th scope="col">SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col" class="numeric">Stock</th><th scope="col" class="numeric">Price · USD</th><th scope="col">Action</th></tr></thead><tbody id="rows"></tbody></table></div><div id="collection-state"></div><footer class="collection-footer"><span>Northstar Supply catalog</span><span>Session-only edits</span></footer></section>
<p class="permission-note">Read-only products are visible for comparison. Your editor role cannot change them.</p></main>
<dialog id="editor" aria-labelledby="editor-title"><form id="edit-form" novalidate><div class="dialog-heading"><div><p class="eyebrow" id="edit-sku"></p><h2 id="editor-title">Edit product</h2></div><button type="button" id="close-editor" class="icon-button" aria-label="Close editor">×</button></div><div class="dialog-body"><p class="form-intro">Update product details. All fields are required.</p><div id="errors" class="error-summary" tabindex="-1" role="alert" hidden></div><label for="name">Product name</label><textarea id="name" name="name" required rows="3" aria-describedby="name-error"></textarea><p id="name-error" class="field-error" hidden></p><div class="form-grid"><div><label for="edit-category">Category</label><select id="edit-category" name="category" required>${options(categories)}</select></div><div><label for="edit-status">Status</label><select id="edit-status" name="status" required>${options(statuses)}</select></div><div><label for="stock">Stock quantity</label><input id="stock" name="stock" type="number" min="0" step="1" required aria-describedby="stock-error"><p id="stock-error" class="field-error" hidden></p></div><div><label for="price">Price (USD)</label><input id="price" name="price" type="number" min="0.01" step="0.01" required aria-describedby="price-error"><p id="price-error" class="field-error" hidden></p></div></div><p class="draft-state" id="draft-state" role="status">No changes yet</p></div><div class="dialog-actions"><button type="button" id="cancel">Cancel</button><button class="primary" type="submit">Save changes</button></div></form></dialog>
<dialog id="discard" aria-labelledby="discard-title"><div class="confirm-content"><p class="eyebrow">UNSAVED CHANGES</p><h2 id="discard-title">Discard your changes?</h2><p>Your edits haven’t been saved. Keep editing to preserve your work.</p><div class="confirm-actions"><button id="keep" class="primary" autofocus>Keep editing</button><button id="discard-confirm" class="danger-button">Discard changes</button></div></div></dialog>`;
function filters() {return {q:$('#search').value.trim(),status:$('#status').value,category:$('#category').value,low:$('#low').checked};}
function clearFilters(){ $('#search').value='';$('#status').value='';$('#category').value='';$('#low').checked=false;render();$('#search').focus(); }
function render(){
 const f=filters();const active=!!(f.q||f.status||f.category||f.low); const source=state==='populated'?items:[];
 const shown=source.filter(p=>(!f.q||`${p.name} ${p.id}`.toLowerCase().includes(f.q.toLowerCase()))&&(!f.status||p.status===f.status)&&(!f.category||p.category===f.category)&&(!f.low||p.stock<=5));
 $('#count').textContent=state==='loading'?'Loading products…':state==='error'?'Collection unavailable':`${shown.length} of ${source.length} products`;
 $('#clear').hidden=!active;const n=[f.status,f.category,f.low].filter(Boolean).length;$('#filter-count').textContent=n?`(${n})`:'';
 $('#active').innerHTML=[f.q&&['search',`Search: ${f.q}`],f.status&&['status',f.status],f.category&&['category',f.category],f.low&&['low','Stock ≤ 5']].filter(Boolean).map(([key,label])=>`<button class="chip" data-remove="${key}" aria-label="Remove ${esc(label)} filter">${esc(label)} <span aria-hidden="true">×</span></button>`).join('');
 $('#rows').innerHTML=shown.map(p=>`<tr><th scope="row">${esc(p.name)}</th><td class="sku">${p.id}</td><td>${esc(p.category)}</td><td><span class="badge ${p.status.toLowerCase()}"><span aria-hidden="true">${p.status==='Active'?'●':p.status==='Draft'?'◌':'−'}</span> ${p.status}</span></td><td class="numeric ${p.stock<=5?'low-stock':''}">${p.stock}<span class="stock-note">${p.stock===0?'Out of stock':p.stock<=5?'Low stock':'in stock'}</span></td><td class="numeric price">${money.format(p.price)}</td><td>${p.canEdit?`<button class="edit-button" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">Edit <span aria-hidden="true">↗</span></button>`:`<span class="read-only">Read only</span><span class="permission">Your role can’t edit</span>`}</td></tr>`).join('');
 const box=$('#collection-state');box.innerHTML='';box.removeAttribute('role');
 if(!shown.length){ let title,description,action='';
 if(state==='loading'){title='Loading your catalog';description='Product details are being prepared.';}
 else if(state==='error'){title='We couldn’t load the catalog';description='Your collection is unavailable. Try again to load the products.';action='<button class="primary" id="retry">Retry</button>';box.setAttribute('role','alert');}
 else if(state==='empty'){title='No products in this collection';description='There are no products available to manage yet.';}
 else{title='No products match your filters';description='Try a different name or SKU, or clear the filters to see your collection.';action='<button class="primary" id="empty-clear">Clear filters</button>';}
 box.innerHTML=`<div class="state-content"><span class="state-symbol" aria-hidden="true">${state==='error'?'!':state==='loading'?'◌':'⌕'}</span><h3>${title}</h3><p>${description}</p>${action}</div>`;
 } $('#collection-state').hidden=!!shown.length; $('.table-scroll').setAttribute('aria-busy',String(state==='loading'));
}
$('#search').addEventListener('input',render);['status','category','low'].forEach(id=>$('#'+id).addEventListener('change',render));
$('#filter-toggle').onclick=()=>{const open=$('#advanced').hidden;$('#advanced').hidden=!open;$('#filter-toggle').setAttribute('aria-expanded',String(open));};
$('#clear').onclick=clearFilters;
$('#active').onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;const c=$('#'+b.dataset.remove);if(c.type==='checkbox')c.checked=false;else c.value='';render();$('#clear').hidden?$('#search').focus():$('#clear').focus();};
$('#collection-state').onclick=e=>{if(e.target.id==='retry'){state='populated';render();$('#search').focus();}if(e.target.id==='empty-clear')clearFilters();};
$('#rows').onclick=e=>{const b=e.target.closest('[data-edit]');if(b)openEditor(b.dataset.edit);};
const form=$('#edit-form');
function values(){return Object.fromEntries(new FormData(form));}
function dirty(){return current&&JSON.stringify(values())!==baseline;}
function resetErrors(){ $('#errors').hidden=true;['name','stock','price'].forEach(k=>{$('#'+k).removeAttribute('aria-invalid');$('#'+k+'-error').hidden=true;}); }
function openEditor(id){ const p=items.find(p=>p.id===id);if(!p?.canEdit)return; current=p;returnId=id;resetErrors();$('#edit-sku').textContent=p.id+' · PRODUCT DETAILS'; for(const k of ['name','category','status','stock','price'])form.elements[k].value=p[k];baseline=JSON.stringify(values());$('#draft-state').textContent='No changes yet';$('#editor').showModal();$('#name').focus(); }
function closeEditor(){ $('#editor').close();current=null;const target=$(`[data-edit="${returnId}"]`);(target||$('#search')).focus(); }
function requestClose(){if(dirty())$('#discard').showModal();else closeEditor();}
$('#close-editor').onclick=requestClose;$('#cancel').onclick=requestClose;$('#editor').addEventListener('cancel',e=>{e.preventDefault();requestClose();});
$('#keep').onclick=()=>$('#discard').close();$('#discard-confirm').onclick=()=>{$('#discard').close();closeEditor();};
form.addEventListener('input',()=>{$('#draft-state').textContent=dirty()?'Unsaved changes':'No changes yet';});
form.onsubmit=e=>{e.preventDefault();if(!current?.canEdit)return;resetErrors();const v=values();const errors={};if(!v.name.trim())errors.name='Enter a product name.';if(v.stock===''||!Number.isInteger(Number(v.stock))||Number(v.stock)<0)errors.stock='Enter a whole number of 0 or more.';if(v.price===''||!Number.isFinite(Number(v.price))||Number(v.price)<=0)errors.price='Enter a price greater than $0.00.';
 if(Object.keys(errors).length){for(const [k,message]of Object.entries(errors)){$('#'+k).setAttribute('aria-invalid','true');$('#'+k+'-error').textContent=message;$('#'+k+'-error').hidden=false;}$('#errors').innerHTML='<strong>Check these details before saving</strong><ul>'+Object.entries(errors).map(([k,message])=>`<li><a href="#${k}">${k==='name'?'Product name':k==='stock'?'Stock':'Price'}: ${message}</a></li>`).join('')+'</ul>';$('#errors').hidden=false;$('#errors').focus();return;}
 if(!categories.includes(v.category)||!statuses.includes(v.status))return;
 const id=current.id;Object.assign(current,{name:v.name.trim(),category:v.category,status:v.status,stock:Number(v.stock),price:Number(v.price)});render();$('#notice').textContent=`Changes saved · ${id} has been updated for this session.`;$('#notice').hidden=false;closeEditor();};
$('#errors').onclick=e=>{const a=e.target.closest('a');if(a){e.preventDefault();$(a.getAttribute('href')).focus();}};
window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
render();if(state==='populated'&&params.get('edit'))openEditor(params.get('edit'));
