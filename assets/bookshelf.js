/* Dependency-free bookshelf. Public metadata is refreshed offline, never per visitor. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const categories = { Startups: 'Business', Management: 'Business', Product: 'Business', Engineering: 'Technology', Education: 'Science', Writing: 'Culture' };
  const palette = ['#37544c', '#a8513c', '#dac5a2', '#334a64', '#9e7c49', '#583e47'];
  let books = [], filtered = [], rows = [], rowLimit = 3, activeIndex = -1, opener, initialized = false;
  let category = '', month = '', lastWidth = 0;
  const root = document.getElementById('bookshelf');
  if (!root) return;
  const shelf = root.querySelector('#books-list');
  const search = root.querySelector('#shelf-search');
  const year = root.querySelector('#shelf-year');
  const sort = root.querySelector('#shelf-sort');
  const result = root.querySelector('#shelf-results');
  const more = root.querySelector('#shelf-more');
  const clear = root.querySelector('#shelf-clear');
  const dialog = document.getElementById('book-dialog');
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const authorsOf = book => (book.meta.displayAuthors?.length ? book.meta.displayAuthors : book.authors.length ? book.authors : book.meta.authors || []).join(', ');
  const validCover = cover => /^\/images\/books\/[a-zA-Z0-9/_.% -]+$/.test(cover) || /^https:\/\//.test(cover);
  function dimensions(book) {
    const ratio = clamp(book.appearance.ratio || .66, .5, .85);
    const height = Math.round(clamp(142 / ratio, 188, 232));
    const depth = Math.round(clamp(21 + (book.meta.pageCount || 300) * .045, 27, 65));
    return { height, depth, width: Math.round(height * ratio) };
  }
  function model(book, featured = false, detail = false) {
    const { height, depth, width } = dimensions(book);
    const color = book.appearance.color || palette[book.index % palette.length];
    const ink = book.appearance.ink || '#f8f3e6';
    const cover = validCover(book.cover) ? book.cover : '';
    const author = authorsOf(book);
    const style = `--book-height:${height}px;--book-depth:${depth}px;--book-width:${width}px;--jacket:${color};--jacket-ink:${ink}`;
    const face = `<span class="shelf-book-front"><span class="shelf-cover-fallback"><span>${escape(author)}</span><strong>${escape(book.title)}</strong><span>Ethan’s library</span></span>${cover ? `<img ${featured || detail ? 'src' : 'data-src'}="${escape(cover)}" alt="" loading="${detail ? 'eager' : 'lazy'}" decoding="async">` : ''}</span>`;
    const body = `<span class="shelf-book-object" aria-hidden="true"><span class="shelf-book-pages"></span><span class="shelf-book-back"></span>${face}<span class="shelf-book-spine"><span class="shelf-spine-title">${escape(book.title)}</span><span class="shelf-spine-author">${escape(author)}</span><span class="shelf-spine-mark">ed.</span></span></span>`;
    if (detail) return `<div class="shelf-detail-model" style="${style}">${body}</div>`;
    return `<button type="button" class="shelf-book${featured ? ' is-featured' : ''}" style="${style}" data-book-id="${escape(book.id)}" aria-label="${escape(book.title)}${author ? ` by ${escape(author)}` : ''}" aria-haspopup="dialog">${body}<span class="shelf-book-tooltip" aria-hidden="true"><strong>${escape(book.title)}</strong><span>${escape(author)}</span></span></button>`;
  }
  function loadCover(button) {
    const image = button.querySelector('img[data-src]');
    if (image) { image.src = image.dataset.src; delete image.dataset.src; }
  }
  function groupRows() {
    const available = Math.max(225, shelf.clientWidth - 70);
    const groups = [];
    let group = [], width = 0;
    for (const book of filtered) {
      // One face-out cover per shelf, just like a small display in a real library.
      const featured = group.length === 3;
      const size = dimensions(book);
      const occupied = (featured ? size.width * .94 : size.depth) + 5;
      if (group.length && width + occupied > available) { groups.push(group); group = []; width = 0; }
      const showFace = group.length === 3;
      group.push({ book, featured: showFace });
      width += (showFace ? size.width * .94 : size.depth) + 5;
    }
    if (group.length) groups.push(group);
    return groups;
  }
  function renderRows() {
    rows = groupRows();
    const visibleRows = rows.slice(0, rowLimit);
    shelf.innerHTML = visibleRows.map((row, i) => `<section class="shelf-row" aria-label="Shelf ${i + 1}"><div class="shelf-books">${row.map(({ book, featured }) => model(book, featured)).join('')}</div><div class="shelf-plank"><span>Shelf ${String(i + 1).padStart(2, '0')}<i></i>${row.length} ${row.length === 1 ? 'book' : 'books'}</span></div></section>`).join('') || `<div class="shelf-empty"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v16"/></svg><h3>${books.length ? 'No books on this shelf.' : 'The collection is just beginning.'}</h3><p>${books.length ? 'Try another title or author, or clear your filters.' : 'Books added in the editor will appear here.'}</p></div>`;
    shelf.querySelectorAll('.shelf-books').forEach(row => {
      const items = [...row.querySelectorAll('.shelf-book')];
      items.forEach(item => {
        const previewWidth = Math.max(parseFloat(item.style.getPropertyValue('--book-width')), Math.min(240, row.clientWidth - 48));
        if (item.offsetLeft + previewWidth > row.clientWidth - 16) item.classList.add('is-near-edge');
      });
    });
    const shown = visibleRows.reduce((count, row) => count + row.length, 0);
    more.hidden = shown >= filtered.length;
    more.textContent = `Explore more shelves (${filtered.length - shown} more books)`;
    root.querySelector('#shelf-showing').textContent = filtered.length ? `Showing ${shown} of ${filtered.length} books` : '';
    root.querySelector('#shelf-total').textContent = books.length;
    root.querySelector('#shelf-years').textContent = new Set(books.map(b => b.dateFinished.slice(0, 4)).filter(Boolean)).size;
  }
  function filterBooks() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    filtered = books.filter(book => terms.every(term => book.searchText.includes(term)) && (!category || book.groups.includes(category)) && (!year.value || book.dateFinished.startsWith(year.value)) && (!month || book.dateFinished.startsWith(month)));
    filtered.sort(sort.value === 'title' ? (a, b) => a.title.localeCompare(b.title) : sort.value === 'author' ? (a, b) => authorsOf(a).localeCompare(authorsOf(b)) : sort.value === 'oldest' ? (a, b) => (a.dateFinished || '9999').localeCompare(b.dateFinished || '9999') : (a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
    rowLimit = 3;
    const hasFilters = Boolean(search.value || category || year.value || month);
    clear.hidden = !hasFilters;
    root.querySelector('#shelf-search-clear').hidden = !search.value;
    result.textContent = hasFilters ? `${filtered.length} ${filtered.length === 1 ? 'book' : 'books'} found${search.value.trim() ? ` for “${search.value.trim()}”` : ''}${month ? ` in ${new Date(month + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}` : 'A few favorites, a lot of rabbit holes.';
    renderRows();
  }
  function resetFilters() {
    search.value = ''; year.value = ''; category = ''; month = '';
    root.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === '')));
    filterBooks();
  }
  function formatDate(date) { return date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''; }
  function renderDetail() {
    const book = filtered[activeIndex];
    if (!book) return;
    const meta = book.meta, author = authorsOf(book);
    const source = /^https:\/\/openlibrary\.org\/(works|books)\/OL\d+[WM]$/.test(meta.source || '') ? meta.source : '';
    dialog.querySelector('#book-title').textContent = book.title;
    dialog.querySelector('#book-author').textContent = author || 'Author not listed';
    dialog.querySelector('#book-category').textContent = book.groups[0] || 'From my collection';
    dialog.querySelector('#book-stage').innerHTML = model(book, false, true);
    dialog.querySelector('#book-turn').textContent = 'Show spine';
    const facts = [
      ['Pages', meta.pageCount ? meta.pageCount.toLocaleString() : 'Not listed'],
      ['Catalog year', meta.publishedYear || 'Not listed'],
      ['Finished reading', formatDate(book.dateFinished) || (book.dateStarted ? 'In progress' : 'Not recorded')],
      ...(book.rating ? [['My rating', `${book.rating} / 5`]] : []),
      ...(book.daysTaken ? [['Time to read', `${book.daysTaken} ${book.daysTaken === 1 ? 'day' : 'days'}`]] : [])
    ];
    dialog.querySelector('#book-facts').innerHTML = facts.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('');
    const notes = dialog.querySelector('#book-notes');
    notes.hidden = !book.notes.trim();
    notes.querySelector('p').textContent = book.notes;
    const subjects = dialog.querySelector('#book-subjects');
    const labels = (meta.subjects || []).filter(x => x.length < 45 && !/nyt:|bestseller/i.test(x)).slice(0, 4);
    subjects.textContent = labels.join(' · '); subjects.hidden = !labels.length;
    const catalog = dialog.querySelector('#book-source');
    catalog.hidden = !source; catalog.href = source || '#';
    dialog.querySelector('#book-edition-note').textContent = meta.pageCount ? 'Page count is the median across catalog editions. Spine thickness is estimated; cover and edition may vary.' : 'Page count is not available yet. This book uses a standard spine thickness.';
    dialog.querySelector('#book-goodreads').href = `https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + author)}`;
    dialog.querySelector('#book-position').textContent = `${activeIndex + 1} / ${filtered.length}`;
    dialog.querySelector('#book-previous').disabled = activeIndex <= 0;
    dialog.querySelector('#book-next').disabled = activeIndex >= filtered.length - 1;
  }
  function openBook(button) {
    activeIndex = filtered.findIndex(book => book.id === button.dataset.bookId);
    if (activeIndex < 0) return;
    opener = button;
    renderDetail();
    dialog.showModal();
    document.body.classList.add('book-dialog-open');
    dialog.querySelector('#book-close').focus();
  }
  window.Bookshelf = {
    init(rawBooks, metadata = {}, appearances = {}) {
      if (initialized) return;
      initialized = true;
      books = rawBooks.map((book, index) => {
        const meta = metadata[book.id]?.lookupTitle === book.title ? metadata[book.id] : {};
        const appearance = appearances[book.id]?.cover === book.cover ? appearances[book.id] : {};
        const groups = [...new Set([...(book.categories || []).map(c => categories[c] || c), meta.category].filter(Boolean))];
        const value = { ...book, index, meta, appearance, groups };
        value.searchText = normalize([book.title, authorsOf(value), ...groups, ...(book.sagas || [])].join(' '));
        return value;
      });
      const years = [...new Set(books.map(b => b.dateFinished.slice(0, 4)).filter(Boolean))].sort().reverse();
      year.innerHTML = '<option value="">All years</option>' + years.map(y => `<option>${escape(y)}</option>`).join('');
      const tabs = ['', 'Business', 'Biography', 'Fiction', 'History', 'Technology', 'Science', 'Development', 'Culture'].filter(c => !c || books.some(b => b.groups.includes(c)));
      root.querySelector('#shelf-categories').innerHTML = tabs.map(c => `<button type="button" data-category="${escape(c)}" aria-pressed="${!c}">${escape(c || 'All books')}${!c ? `<span>${books.length}</span>` : ''}</button>`).join('');
      lastWidth = shelf.clientWidth;
      filterBooks();
      new ResizeObserver(entries => {
        const width = Math.round(entries[0].contentRect.width);
        if (Math.abs(width - lastWidth) < 2) return;
        lastWidth = width;
        renderRows();
      }).observe(shelf);
    },
    filterMonth(value) { if (!initialized) return; resetFilters(); month = value; filterBooks(); root.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' }); }
  };
  search.addEventListener('input', () => { month = ''; filterBooks(); });
  year.addEventListener('change', () => { month = ''; filterBooks(); });
  sort.addEventListener('change', filterBooks);
  clear.addEventListener('click', resetFilters);
  root.querySelector('#shelf-search-clear').addEventListener('click', () => { search.value = ''; filterBooks(); search.focus(); });
  root.querySelector('#shelf-categories').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    root.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filterBooks();
  });
  more.addEventListener('click', () => {
    const previousCount = shelf.querySelectorAll('.shelf-book').length;
    rowLimit += 3; renderRows();
    const firstNew = shelf.querySelectorAll('.shelf-book')[previousCount];
    firstNew?.focus({ preventScroll: true });
    firstNew?.closest('.shelf-row').scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'nearest' });
  });
  shelf.addEventListener('pointerover', event => { const book = event.target.closest('.shelf-book'); if (book) loadCover(book); });
  shelf.addEventListener('focusin', event => { const book = event.target.closest('.shelf-book'); if (book) loadCover(book); });
  shelf.addEventListener('click', event => { const book = event.target.closest('.shelf-book'); if (book) openBook(book); });
  // Broken or changed covers reveal the typographic jacket underneath.
  document.addEventListener('error', event => { if (event.target.matches?.('.shelf-book-front img')) event.target.remove(); }, true);
  dialog.querySelector('#book-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('book-dialog-open'); opener?.focus({ preventScroll: true }); });
  dialog.querySelector('#book-turn').addEventListener('click', event => { const turned = dialog.querySelector('.shelf-detail-model').classList.toggle('is-spine'); event.currentTarget.textContent = turned ? 'Show cover' : 'Show spine'; });
  dialog.querySelector('#book-previous').addEventListener('click', () => { if (activeIndex > 0) { activeIndex--; renderDetail(); } });
  dialog.querySelector('#book-next').addEventListener('click', () => { if (activeIndex < filtered.length - 1) { activeIndex++; renderDetail(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && activeIndex > 0) { event.preventDefault(); activeIndex--; renderDetail(); }
    if (event.key === 'ArrowRight' && activeIndex < filtered.length - 1) { event.preventDefault(); activeIndex++; renderDetail(); }
  });
  document.addEventListener('keydown', event => { if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !dialog.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); search.focus(); } });
})();
