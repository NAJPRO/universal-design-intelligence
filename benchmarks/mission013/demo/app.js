const sessions = {
  empreinte: { title: 'Première empreinte', facts: '14 novembre · 10:00–12:30 · 45 €' },
  couleur: { title: 'La couleur en partage', facts: '21 novembre · 14:00–17:00 · 60 €' },
  affiche: { title: 'Une affiche pour demain', facts: '28 novembre · 10:00–12:00 · 35 €' }
};
const form = document.querySelector('#draft-form');
const name = document.querySelector('#visitor-name');
const error = document.querySelector('#name-error');
const status = document.querySelector('#draft-status');
const button = document.querySelector('#prepare');
const clear = document.querySelector('#clear-draft');
let busy = false;
function selected() { return form.elements.workshop.value; }
form.addEventListener('change', event => {
  if (event.target.name !== 'workshop') return;
  const session = sessions[selected()];
  document.querySelector('#chosen-title').textContent = session.title;
  document.querySelector('#chosen-facts').textContent = session.facts;
  if (!busy) { status.textContent = 'Choix modifié. Préparez le brouillon pour conserver cette version.'; status.dataset.state = 'changed'; }
});
name.addEventListener('input', () => { error.hidden = true; name.removeAttribute('aria-invalid'); });
function store(value) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('morrow-print-room-demo', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('drafts');
    open.onerror = () => reject(new Error('Local storage unavailable'));
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('drafts', 'readwrite');
      const drafts = transaction.objectStore('drafts');
      if (value === null) drafts.delete('current'); else drafts.put(value, 'current');
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error('Local write failed')); };
    };
  });
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  if (!name.value.trim()) { error.hidden = false; name.setAttribute('aria-invalid', 'true'); name.focus(); return; }
  busy = true;
  const draft = { workshop: selected(), name: name.value.trim() };
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  document.querySelector('#button-label').textContent = 'Enregistrement local…';
  status.dataset.state = 'pending';
  status.textContent = 'Écriture du brouillon sur cet appareil… Aucun envoi en cours.';
  try {
    await store(draft);
    status.dataset.state = 'saved';
    status.textContent = `Brouillon « ${sessions[draft.workshop].title} » enregistré sur cet appareil. Rien n’a été envoyé. Aucune place réservée.`;
    clear.hidden = false;
  } catch {
    status.dataset.state = 'error';
    status.textContent = 'Le brouillon n’a pas pu être enregistré. Votre saisie est conservée ; réessayez ou vérifiez le stockage du navigateur.';
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    document.querySelector('#button-label').textContent = 'Préparer mon brouillon';
    busy = false;
  }
});
clear.addEventListener('click', async () => {
  if (busy) return;
  busy = true;
  try {
    await store(null);
    clear.hidden = true;
    status.dataset.state = 'deleted';
    status.textContent = 'Brouillon supprimé de cet appareil. Aucune donnée envoyée.';
    button.focus();
  } catch { status.dataset.state = 'error'; status.textContent = 'Suppression impossible. Réessayez pour retirer le brouillon de cet appareil.'; }
  finally { busy = false; }
});
