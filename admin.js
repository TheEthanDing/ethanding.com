const state = { books: [], site: {}, currentId: null, panel: 'books', dirty: false, githubConfigured: false };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function calculateDaysTaken(dateStarted, dateFinished) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStarted) || !/^\d{4}-\d{2}-\d{2}$/.test(dateFinished)) return null;
  const start = Date.parse(`${dateStarted}T00:00:00Z`);
  const finish = Date.parse(`${dateFinished}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(finish) || finish < start) return null;
  return Math.round((finish - start) / 86400000) + 1;
}

function allAuthors() {
  const authors = new Map();
  state.books.flatMap((book) => book.authors || []).forEach((author) => {
    const name = String(author).trim();
    if (name && !authors.has(name.toLocaleLowerCase())) authors.set(name.toLocaleLowerCase(), name);
  });
  return [...authors.values()].sort((a, b) => a.localeCompare(b));
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.add('hidden'), 4200);
}

function setDirty(value = true) {
  state.dirty = value;
  $('.brand').classList.toggle('unsaved', value);
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

async function checkSession() {
  const session = await api('/api/admin/session');
  state.githubConfigured = session.githubConfigured;
  if (session.authenticated) return openApp();
  $('#login').classList.remove('hidden');
}

async function openApp() {
  const [books, site] = await Promise.all([fetch('/data/books.json').then((r) => r.json()), fetch('/data/site.json').then((r) => r.json())]);
  state.books = books;
  state.site = site;
  state.currentId = books[0]?.id || null;
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderBooks();
  renderSite();
  if (!state.githubConfigured) toast('Local editing mode: saves stay on this computer until GitHub is connected.');
}

function currentBook() { return state.books.find((book) => book.id === state.currentId); }

function renderBooks() {
  const query = $('#search').value.trim().toLowerCase();
  const filtered = state.books.filter((book) => `${book.title} ${book.authors.join(' ')}`.toLowerCase().includes(query));
  $('#book-count-admin').textContent = `${state.books.length} books`;
  let year = null;
  $('#book-list').innerHTML = filtered.map((book) => {
    const bookYear = book.dateFinished?.slice(0, 4) || 'Undated';
    const marker = year !== bookYear ? `<div class="year-mark">${escapeHtml(bookYear)}</div>` : '';
    year = bookYear;
    return `${marker}<button class="book-row ${book.id === state.currentId ? 'active' : ''}" data-book-id="${escapeHtml(book.id)}">
      ${book.cover ? `<img class="mini-cover" src="${escapeHtml(book.cover)}" alt="">` : '<span class="mini-cover"></span>'}
      <span class="book-name"><strong>${escapeHtml(book.title || 'Untitled')}</strong><span>${escapeHtml(book.authors.join(', ') || 'No author')}</span></span>
      <span class="book-date">${escapeHtml(book.dateFinished ? new Date(`${book.dateFinished}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')}</span>
    </button>`;
  }).join('') || '<p style="padding:22px;color:var(--muted)">No books match that search.</p>';
  document.querySelectorAll('[data-book-id]').forEach((button) => button.addEventListener('click', () => {
    state.currentId = button.dataset.bookId;
    renderBooks();
    renderBookEditor();
  }));
  renderBookEditor();
}

function renderBookEditor() {
  const book = currentBook();
  if (!book) {
    $('#book-editor').innerHTML = '<p class="eyebrow">Reading log</p><h2>No book selected</h2><p>Add a book to begin.</p>';
    return;
  }
  $('#book-editor').innerHTML = `
    <div class="editor-head">
      <label class="cover-drop ${book.cover ? 'has-cover' : ''}" id="cover-drop" for="cover-file">
        <span class="cover-preview" id="cover-preview">${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover">` : ''}</span>
        <span class="cover-prompt" id="cover-prompt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"/></svg>
          <strong>${book.cover ? 'Change cover' : 'Drop cover here'}</strong>
          <span>${book.cover ? 'Drop or click' : 'or click to choose'}</span>
        </span>
        <input class="cover-input" id="cover-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label="Choose a cover image for ${escapeHtml(book.title)}">
      </label>
      <div><p class="eyebrow">Book entry</p><h2>${escapeHtml(book.title || 'Untitled')}</h2><p id="editor-authors">${escapeHtml(book.authors.join(', ') || 'Add the author below')}</p></div>
    </div>
    <form id="book-form" class="form-grid">
      <label class="span-2">Title<input name="title" value="${escapeHtml(book.title)}" required></label>
      <div class="field-group span-2">
        <label id="authors-label" for="author-input">Authors <span class="field-note">select or create</span></label>
        <div class="author-picker" id="author-picker">
          <div class="author-values" id="author-values"></div>
          <input id="author-input" type="text" autocomplete="off" role="combobox" aria-labelledby="authors-label" aria-controls="author-options" aria-expanded="false" aria-autocomplete="list" placeholder="Find or create an author">
          <div class="author-options hidden" id="author-options" role="listbox"></div>
        </div>
        <p class="field-help">Choose an existing author, or type a new name and press Enter.</p>
      </div>
      <label>Date started<input name="dateStarted" type="date" value="${escapeHtml(book.dateStarted)}"></label>
      <label>Date finished<input name="dateFinished" type="date" value="${escapeHtml(book.dateFinished)}"></label>
      <label>Days taken <span class="field-note">auto-calculated</span><input id="days-taken" name="daysTaken" type="number" value="${calculateDaysTaken(book.dateStarted, book.dateFinished) ?? ''}" placeholder="Select both dates" readonly aria-describedby="days-taken-help"><span class="field-help" id="days-taken-help">Includes both the start and finish date.</span></label>
      <label>Rating <span style="font-weight:400;color:var(--muted)">1–5</span><input name="rating" type="number" min="1" max="5" step="1" value="${book.rating ?? ''}"></label>
      <label class="span-2">Categories <span style="font-weight:400;color:var(--muted)">separated by commas</span><input name="categories" value="${escapeHtml((book.categories || []).join(', '))}"></label>
      <label class="span-2">Sagas <span style="font-weight:400;color:var(--muted)">separated by commas</span><input name="sagas" value="${escapeHtml((book.sagas || []).join(', '))}"></label>
      <label class="span-2">Notes<textarea name="notes">${escapeHtml(book.notes || '')}</textarea></label>
      <label class="span-2" style="display:flex;align-items:center;gap:9px;font-size:14px"><input name="owned" type="checkbox" style="width:auto;margin:0" ${book.owned ? 'checked' : ''}> I own this book</label>
      <label class="span-2">Cover path<input name="cover" value="${escapeHtml(book.cover)}" placeholder="/images/books/cover.jpg"></label>
    </form>
    <div class="form-actions"><button id="delete-book" class="button danger">Remove book</button><span class="count">ID ${escapeHtml(book.id)}</span></div>`;
  book.daysTaken = calculateDaysTaken(book.dateStarted, book.dateFinished);
  initializeAuthorPicker(book);
  $('#book-form').addEventListener('input', (event) => {
    if (!event.target.name) return;
    if (['categories', 'sagas'].includes(event.target.name)) book[event.target.name] = event.target.value.split(',').map((v) => v.trim()).filter(Boolean);
    else if (event.target.name === 'owned') book.owned = event.target.checked;
    else if (event.target.name === 'rating') book.rating = event.target.value === '' ? null : Number(event.target.value);
    else book[event.target.name] = event.target.value;
    if (event.target.name === 'dateStarted' || event.target.name === 'dateFinished') {
      book.daysTaken = calculateDaysTaken(book.dateStarted, book.dateFinished);
      $('#days-taken').value = book.daysTaken ?? '';
    }
    setDirty();
    if (event.target.name === 'title') renderBooksSoon();
  });
  $('#delete-book').addEventListener('click', () => {
    if (!confirm(`Remove “${book.title}” from the reading log?`)) return;
    state.books = state.books.filter((item) => item.id !== book.id);
    state.currentId = state.books[0]?.id || null;
    setDirty();
    renderBooks();
  });
  const coverInput = $('#cover-file');
  const coverDrop = $('#cover-drop');
  coverInput.addEventListener('change', () => uploadCoverFile(coverInput.files[0]));
  coverDrop.addEventListener('dragenter', (event) => { event.preventDefault(); coverDrop.classList.add('is-dragging'); });
  coverDrop.addEventListener('dragover', (event) => { event.preventDefault(); coverDrop.classList.add('is-dragging'); });
  coverDrop.addEventListener('dragleave', () => coverDrop.classList.remove('is-dragging'));
  coverDrop.addEventListener('drop', (event) => {
    event.preventDefault();
    coverDrop.classList.remove('is-dragging');
    uploadCoverFile(event.dataTransfer.files[0]);
  });
}

function initializeAuthorPicker(book) {
  const input = $('#author-input');
  const values = $('#author-values');
  const options = $('#author-options');
  let activeIndex = -1;
  let matches = [];

  function updateBookAuthorText() {
    const text = book.authors.join(', ') || 'Add the author below';
    $('#editor-authors').textContent = text;
    const rowAuthor = document.querySelector('.book-row.active .book-name span');
    if (rowAuthor) rowAuthor.textContent = book.authors.join(', ') || 'No author';
  }

  function renderValues() {
    values.innerHTML = book.authors.map((author) => `<span class="author-chip">${escapeHtml(author)}<button type="button" data-remove-author="${escapeHtml(author)}" aria-label="Remove ${escapeHtml(author)}">&times;</button></span>`).join('');
    input.placeholder = book.authors.length ? 'Add another author' : 'Find or create an author';
    values.querySelectorAll('[data-remove-author]').forEach((button) => button.addEventListener('click', () => {
      book.authors = book.authors.filter((author) => author !== button.dataset.removeAuthor);
      renderValues();
      renderOptions();
      updateBookAuthorText();
      setDirty();
      input.focus();
    }));
  }

  function closeOptions() {
    options.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function renderOptions() {
    const query = input.value.trim();
    const selected = new Set(book.authors.map((author) => author.toLocaleLowerCase()));
    matches = allAuthors().filter((author) => !selected.has(author.toLocaleLowerCase()) && (!query || author.toLocaleLowerCase().includes(query.toLocaleLowerCase()))).slice(0, 8);
    const exactMatch = allAuthors().find((author) => author.toLocaleLowerCase() === query.toLocaleLowerCase());
    const createOption = query && !exactMatch ? `<button type="button" class="author-option create-option" role="option" data-create-author="${escapeHtml(query)}"><span class="option-mark">+</span><span>Create <strong>“${escapeHtml(query)}”</strong></span><kbd>Enter</kbd></button>` : '';
    options.innerHTML = matches.map((author, index) => `<button type="button" class="author-option ${index === activeIndex ? 'active' : ''}" id="author-option-${index}" role="option" data-author="${escapeHtml(author)}" aria-selected="${index === activeIndex}"><span class="option-mark">✓</span><span>${escapeHtml(author)}</span></button>`).join('') + createOption;
    if (!options.innerHTML) return closeOptions();
    options.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
    if (activeIndex >= 0 && matches[activeIndex]) input.setAttribute('aria-activedescendant', `author-option-${activeIndex}`);
    else input.removeAttribute('aria-activedescendant');
    options.querySelectorAll('[data-author]').forEach((button) => button.addEventListener('mousedown', (event) => { event.preventDefault(); addAuthor(button.dataset.author); }));
    options.querySelectorAll('[data-create-author]').forEach((button) => button.addEventListener('mousedown', (event) => { event.preventDefault(); addAuthor(button.dataset.createAuthor); }));
  }

  function addAuthor(rawName) {
    const typedName = String(rawName || '').trim().replace(/\s+/g, ' ');
    if (!typedName) return;
    const existing = allAuthors().find((author) => author.toLocaleLowerCase() === typedName.toLocaleLowerCase());
    const name = existing || typedName;
    if (!book.authors.some((author) => author.toLocaleLowerCase() === name.toLocaleLowerCase())) book.authors.push(name);
    input.value = '';
    renderValues();
    closeOptions();
    updateBookAuthorText();
    setDirty();
    input.focus();
  }

  input.addEventListener('focus', renderOptions);
  input.addEventListener('input', () => { activeIndex = -1; renderOptions(); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = event.key === 'ArrowDown' ? Math.min(activeIndex + 1, matches.length - 1) : Math.max(activeIndex - 1, 0);
      renderOptions();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      addAuthor(activeIndex >= 0 ? matches[activeIndex] : input.value);
    } else if (event.key === 'Backspace' && !input.value && book.authors.length) {
      book.authors.pop();
      renderValues();
      updateBookAuthorText();
      setDirty();
    } else if (event.key === 'Escape') closeOptions();
  });
  input.addEventListener('blur', () => setTimeout(closeOptions, 100));
  renderValues();
}

let renderTimer;
function renderBooksSoon() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => { renderBooks(); }, 250);
}

async function uploadCoverFile(file) {
  const book = currentBook();
  if (!file || !book) return;
  if (!file.type.startsWith('image/')) return toast('Choose an image file for the cover.');
  if (file.size > 8 * 1024 * 1024) return toast('Choose an image smaller than 8 MB.');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const preview = $('#cover-preview');
  const drop = $('#cover-drop');
  const prompt = $('#cover-prompt');
  preview.innerHTML = `<img src="${dataUrl}" alt="${escapeHtml(book.title)} cover preview">`;
  drop.classList.add('has-cover');
  prompt.innerHTML = '<strong>Uploading…</strong><span>Saving to your library</span>';
  toast('Uploading cover…');
  try {
    const coverResult = await api('/api/admin/cover', { method: 'POST', body: JSON.stringify({ dataUrl, fileName: book.title }) });
    book.cover = coverResult.path;
    setDirty();
    prompt.innerHTML = '<strong>Saving…</strong><span>Publishing this book</span>';
    const booksResult = await api('/api/admin/books', { method: 'PUT', body: JSON.stringify({ books: state.books }) });
    state.books.sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
    setDirty(false);
    renderBooks();
    toast(booksResult.committed ? 'Cover uploaded and published.' : 'Cover saved locally.');
  } catch (error) {
    renderBookEditor();
    toast(error.message);
  }
}

function renderSite() {
  const form = $('#site-form');
  const values = {
    ...state.site,
    previous0Name: state.site.previous?.[0]?.name || '', previous0Url: state.site.previous?.[0]?.url || '',
    previous1Name: state.site.previous?.[1]?.name || '', previous1Url: state.site.previous?.[1]?.url || '',
  };
  for (const element of form.elements) if (element.name) element.value = values[element.name] || '';
}

function readSiteForm() {
  const values = Object.fromEntries(new FormData($('#site-form')));
  state.site = {
    name: values.name, role: values.role, company: values.company, companyUrl: values.companyUrl,
    previous: [{ name: values.previous0Name, url: values.previous0Url }, { name: values.previous1Name, url: values.previous1Url }].filter((item) => item.name),
    buildingLabel: values.buildingLabel, buildingUrl: values.buildingUrl, email: values.email,
    twitter: values.twitter, linkedin: values.linkedin, location: values.location,
  };
}

async function save() {
  const button = $('#save');
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    if (state.panel === 'books') {
      const result = await api('/api/admin/books', { method: 'PUT', body: JSON.stringify({ books: state.books }) });
      state.books.sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
      toast(result.committed ? `${result.count} books published. Railway will refresh shortly.` : `${result.count} books saved locally.`);
      renderBooks();
    } else {
      readSiteForm();
      const result = await api('/api/admin/site', { method: 'PUT', body: JSON.stringify({ site: state.site }) });
      toast(result.committed ? 'Site copy published. Railway will refresh shortly.' : 'Site copy saved locally.');
    }
    setDirty(false);
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; button.innerHTML = 'Save <span class="button-text">changes</span>'; }
}

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('#login-error').textContent = '';
  try {
    await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('#password').value }) });
    await openApp();
  } catch (error) { $('#login-error').textContent = error.message; }
});
$('#search').addEventListener('input', renderBooks);
$('#add-book').addEventListener('click', () => {
  const book = { id: crypto.randomUUID(), title: 'Untitled book', authors: [], categories: [], sagas: [], dateStarted: '', dateFinished: new Date().toISOString().slice(0, 10), daysTaken: null, rating: null, notes: '', owned: false, cover: '' };
  state.books.unshift(book);
  state.currentId = book.id;
  setDirty();
  renderBooks();
  setTimeout(() => $('#book-form [name="title"]')?.select(), 0);
});
$('#site-form').addEventListener('input', () => { readSiteForm(); setDirty(); });
$('#save').addEventListener('click', save);
$('#logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST', body: '{}' }); location.reload(); });
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  state.panel = tab.dataset.panel;
  document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
  $('#books-panel').classList.toggle('hidden', state.panel !== 'books');
  $('#site-panel').classList.toggle('hidden', state.panel !== 'site');
}));
window.addEventListener('beforeunload', (event) => { if (state.dirty) event.preventDefault(); });
checkSession().catch((error) => { $('#login-error').textContent = error.message; });
