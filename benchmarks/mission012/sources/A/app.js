import { products } from './data.js';

// Catalogue permissions are an authority separate from editable form values and DOM attributes.
const permissions = new Map(products.map(p => [p.id, p.canEdit]));
let records = products.map(p => ({ ...p }));
const requestedState = new URLSearchParams(location.search).get('state');
let state = ['empty', 'loading', 'error'].includes(requestedState) ? requestedState : 'ready';
const filters = { search: '', category: '', status: '', stock: '' };
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const dialog = $('#record-dialog');
let editingId = null;
let returnTarget = null;
let originalValues = null;
let noticeTimer;
for (const key of ['category', 'status']) {
  for (const value of [...new Set(products.map(p => p[key]))]) {
    $(`#${key}`).add(new Option(value, value));
  }
}
function notify(message) {
  clearTimeout(noticeTimer);
  $('#notice').textContent = message;
  $('#notice').hidden = false;
  noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, 6500);
}
function matches(p) {
  const query = filters.search.trim().toLowerCase();
  return (!query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)) &&
    (!filters.category || p.category === filters.category) && (!filters.status || p.status === filters.status) &&
    (!filters.stock || (filters.stock === 'out' ? p.stock === 0 : filters.stock === 'low' ? p.stock > 0 && p.stock <= 10 : p.stock > 10));
}
function stockLabel(stock) { return stock === 0 ? 'Out of stock' : stock <= 10 ? 'Low stock' : 'In stock'; }
function badge(p) { return `<span class="badge ${p.status.toLowerCase()}">${escape(p.status)}</span>`; }
function renderSummary() {
  const available = state === 'ready' || state === 'empty';
  const list = state === 'empty' ? [] : records;
  const metrics = [
    ['Catalogue products', list.length, 'Across all lifecycle statuses', '▦', ''],
    ['Out of stock', list.filter(p => p.stock === 0).length, 'Products with no units on hand', '↘', 'alert'],
    ['Inventory value', money(list.reduce((sum,p) => sum + p.stock * p.price, 0)), 'On-hand stock × unit price', '＄', '']
  ];
  $('#summary').innerHTML = metrics.map(([label,value,hint,symbol,kind]) => `<div class="metric ${kind}"><div><p>${label}</p><strong>${available ? value : '—'}</strong><small>${hint}</small></div><span class="metric-symbol" aria-hidden="true">${symbol}</span></div>`).join('');
}
function renderChips() {
  const stockNames = {out:'Out of stock',low:'Low stock',healthy:'In stock'};
  $('#active-filters').innerHTML = Object.entries(filters).filter(([,v]) => v).map(([key,value]) => `<button class="chip" data-remove="${key}" aria-label="Remove ${key} filter: ${escape(value)}">${key === 'search' ? 'Search: ' : key === 'stock' ? 'Stock: ' : ''}${escape(key === 'stock' ? stockNames[value] : value)} <span aria-hidden="true">×</span></button>`).join('') + (Object.values(filters).some(Boolean) ? '<button class="quiet clear-filters" data-clear>Clear all</button>' : '');
}
function render() {
  renderSummary();
  renderChips();
  const visible = state === 'ready' ? records.filter(matches) : [];
  const total = state === 'empty' ? 0 : records.length;
  $('#result-count').textContent = state === 'loading' ? 'Loading inventory…' : state === 'error' ? 'Inventory unavailable' : `${visible.length} of ${total} products`;
  if (state !== 'ready' || !visible.length) {
    const content = state === 'loading' ? ['◌','Loading inventory','The catalogue is waiting to load. Load it when you’re ready.','Load inventory'] :
      state === 'error' ? ['!','We couldn’t load the inventory','Your catalogue is unavailable. Try loading it again.','Try again'] :
      state === 'empty' ? ['▦','Your catalogue is empty','There are no products in this workspace. Load the sample catalogue to get started.','Load sample catalogue'] :
      ['⌕','No matching products','Try a different search or clear your filters to see the catalogue.','Clear all filters'];
    $('#results').innerHTML = `<div class="state"><div class="state-symbol" aria-hidden="true">${content[0]}</div><h3>${content[1]}</h3><p>${content[2]}</p><button class="primary" ${state === 'ready' ? 'data-clear' : 'data-action="retry"'}>${content[3]}</button></div>`;
    return;
  }
  $('#results').innerHTML = `<p class="scroll-hint" id="scroll-help">Scroll across to compare all fields. Scroll down for more products.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Product comparison table; scroll for more products and columns"><table><caption class="sr-only">Product catalogue with stock, prices and supply details</caption><thead><tr><th scope="col">Product / SKU</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Stock</th><th scope="col">Unit price</th><th scope="col">Supplier</th><th scope="col">Lead time</th><th scope="col">Access</th></tr></thead><tbody>${visible.map(p => `<tr data-record-id="${p.id}">
    <td><button class="product-name" data-action="details" data-record-id="${p.id}">${escape(p.name)}</button><span class="identity">${p.sku} <span aria-hidden="true">/</span> ${p.id}</span></td>
    <td><span class="mobile-label">Category</span>${escape(p.category)}</td>
    <td><span class="mobile-label">Lifecycle status</span>${badge(p)}</td>
    <td class="number ${p.stock === 0 ? 'stock-zero' : p.stock <= 10 ? 'stock-low' : ''}"><span class="mobile-label">Stock · units</span>${p.stock}<span class="stock-caption">${stockLabel(p.stock)}</span></td>
    <td class="number"><span class="mobile-label">Unit price · USD</span>${money(p.price)}</td>
    <td><span class="mobile-label">Supplier</span>${escape(p.supplier)}</td>
    <td class="number"><span class="mobile-label">Lead time</span>${p.leadDays} days</td>
    <td class="action-cell">${permissions.get(p.id) ? `<button class="edit-button" data-action="edit" data-record-id="${p.id}" aria-label="Edit ${escape(p.name)}">Edit <span aria-hidden="true">↗</span></button>` : '<span class="view-only">Consult only</span>'}</td>
    </tr>`).join('')}</tbody></table></div>`;
}
function clearFilters() {
  for (const key in filters) { filters[key] = ''; $(`#${key}`).value = ''; }
  render();
  $('#search').focus();
}
for (const key in filters) {
  $(`#${key}`).addEventListener(key === 'search' ? 'input' : 'change', event => { filters[key] = event.target.value; render(); });
}
$('#app').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-clear')) return clearFilters();
  if (button.dataset.remove) {
    const key = button.dataset.remove;
    filters[key] = ''; $(`#${key}`).value = ''; render(); $(`#${key}`).focus(); return;
  }
  if (button.dataset.action === 'retry') { state = 'ready'; render(); $('#inventory').focus(); notify('Catalogue loaded. 18 products available.'); return; }
  if (['edit','details'].includes(button.dataset.action)) openRecord(button.dataset.recordId, button.dataset.action, button);
});
function openRecord(id, mode, trigger) {
  const p = records.find(p => p.id === id);
  if (!p) return;
  if (mode === 'edit' && permissions.get(id) !== true) { notify('This record is managed by procurement and can only be consulted.'); return; }
  returnTarget = { element: trigger, id, action: trigger.dataset.action };
  editingId = mode === 'edit' ? id : null;
  originalValues = {name:p.name,stock:String(p.stock),price:String(p.price)};
  const heading = `<div class="dialog-head"><div><p class="eyebrow">${mode === 'edit' ? 'UPDATE PRODUCT' : 'PRODUCT DETAILS'}</p><h2 id="dialog-title">${mode === 'edit' ? 'Edit product' : escape(p.name)}</h2></div><button class="close" data-action="cancel" aria-label="Close dialog">×</button></div>`;
  const permission = `<p class="permission"><strong>${permissions.get(id) ? 'Editing available' : 'Consult only'}</strong>${escape(p.permissionReason)}</p>`;
  if (mode === 'edit') {
    $('#dialog-content').innerHTML = `${heading}<form id="editor" novalidate><div class="dialog-body"><p class="dialog-identity">${p.sku} / ${p.id} · ${escape(p.category)} · ${escape(p.status)}</p><div class="editor"><label>Product name<textarea name="name" aria-describedby="name-error" required>${escape(p.name)}</textarea><span class="field-error" id="name-error"></span></label><div class="form-row"><label>Stock on hand<input name="stock" type="text" inputmode="numeric" value="${p.stock}" aria-describedby="stock-hint stock-error" required><span class="hint" id="stock-hint">Whole units, zero or more</span><span class="field-error" id="stock-error"></span></label><label>Unit price · USD<input name="price" type="text" inputmode="decimal" value="${p.price}" aria-describedby="price-hint price-error" required><span class="hint" id="price-hint">Greater than $0.00</span><span class="field-error" id="price-error"></span></label></div></div>${permission}</div><div class="dialog-actions"><button type="button" data-action="cancel">Cancel</button><button class="primary" type="submit" data-action="save">Save changes</button></div></form><div class="discard" hidden role="alert"><p>You have unsaved changes. Discard them?</p><div><button data-action="keep" class="primary">Keep editing</button><button data-action="discard">Discard changes</button></div></div>`;
  } else {
    $('#dialog-content').innerHTML = `${heading}<div class="dialog-body" data-record-id="${p.id}"><p class="dialog-identity">${p.sku} / ${p.id}</p><dl class="details"><div><dt>Category</dt><dd>${escape(p.category)}</dd></div><div><dt>Lifecycle status</dt><dd>${badge(p)}</dd></div><div><dt>Stock on hand</dt><dd>${p.stock} units · ${stockLabel(p.stock)}</dd></div><div><dt>Unit price · USD</dt><dd>${money(p.price)}</dd></div><div><dt>Supplier</dt><dd>${escape(p.supplier)}</dd></div><div><dt>Lead time</dt><dd>${p.leadDays} days</dd></div></dl>${permission}</div><div class="dialog-actions"><button data-action="cancel">Close</button>${permissions.get(id) ? `<button class="primary" data-action="edit" data-record-id="${id}">Edit product</button>` : ''}</div>`;
  }
  dialog.dataset.recordId = id;
  if (!dialog.open) dialog.showModal();
  if (mode === 'edit') $('[name="name"]').focus(); else $('.close').focus();
}
function dirty() {
  const form = $('#editor');
  return editingId && form && Object.keys(originalValues).some(key => form.elements[key].value !== originalValues[key]);
}
function closeDialog() {
  dialog.close();
  editingId = null;
  const target = returnTarget;
  if (target?.element?.isConnected && !dialog.contains(target.element)) target.element.focus();
  else {
    const replacement = target && document.querySelector(`#results [data-action="${target.action}"][data-record-id="${target.id}"]`);
    (replacement || $('#inventory')).focus();
  }
}
function requestClose() {
  if (!dirty()) return closeDialog();
  $('.discard').hidden = false;
  $('[data-action="keep"]').focus();
}
dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
dialog.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'cancel') { event.preventDefault(); requestClose(); }
  if (action === 'discard') closeDialog();
  if (action === 'keep') { $('.discard').hidden = true; $('[name="name"]').focus(); }
  if (action === 'edit') {
    // Keep the catalogue trigger for reliable focus restoration after switching dialog mode.
    const previous = returnTarget;
    openRecord(button.dataset.recordId, 'edit', previous.element);
    returnTarget = previous;
  }
});
dialog.addEventListener('submit', event => {
  event.preventDefault();
  const p = records.find(p => p.id === editingId);
  if (!p || permissions.get(editingId) !== true) { notify('You do not have permission to update this product.'); return; }
  const form = event.target;
  const name = form.elements.name.value.trim();
  const stockText = form.elements.stock.value.trim();
  const priceText = form.elements.price.value.trim();
  const stock = Number(stockText), price = Number(priceText);
  const errors = {
    name: name ? '' : 'Enter a product name.',
    stock: stockText && /^\d+$/.test(stockText) && Number.isSafeInteger(stock) && stock >= 0 ? '' : 'Enter a whole number of units, zero or more.',
    price: priceText && Number.isFinite(price) && price > 0 ? '' : 'Enter a finite price greater than zero.'
  };
  let firstInvalid;
  for (const [key,message] of Object.entries(errors)) {
    $(`#${key}-error`).textContent = message;
    form.elements[key].setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message && !firstInvalid) firstInvalid = form.elements[key];
  }
  if (firstInvalid) { firstInvalid.focus(); return; }
  p.name = name; p.stock = stock; p.price = price;
  render(); closeDialog(); notify(`Saved ${p.sku}. Product updated for this session.`);
});
window.addEventListener('beforeunload', event => { if (dirty()) { event.preventDefault(); event.returnValue = ''; } });
render();
