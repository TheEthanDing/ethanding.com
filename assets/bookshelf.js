/* Dependency-free bookshelf. Public metadata is refreshed offline, never per visitor. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categories = { Startups: 'Business', Management: 'Business', Product: 'Business', Engineering: 'Technology', Education: 'Science', Writing: 'Culture' };
  const palette = ['#37544c', '#a8513c', '#dac5a2', '#334a64', '#9e7c49', '#583e47'];
  let books = [], filtered = [], pages = [], pageIndex = 0, activeIndex = -1, opener, initialized = false;
  let category = '', month = '', lastWidth = 0;
  const root = document.getElementById('bookshelf');
  if (!root) return;
  const shelf = root.querySelector('#books-list');
  const search = root.querySelector('#shelf-search');
  const year = root.querySelector('#shelf-year');
  const sort = root.querySelector('#shelf-sort');
  const result = root.querySelector('#shelf-results');
  const previousSection = root.querySelector('#shelf-previous-section');
  const nextSection = root.querySelector('#shelf-next-section');
  const timeline = root.querySelector('#shelf-timeline');
  const layout = window.BookshelfLayout;
  const clear = root.querySelector('#shelf-clear');
  const dialog = document.getElementById('book-dialog');
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const authorsOf = book => (book.meta.displayAuthors?.length ? book.meta.displayAuthors : book.authors.length ? book.authors : book.meta.authors || []).join(', ');
  const validCover = cover => /^\/images\/books\/[a-zA-Z0-9/_.% -]+$/.test(cover) || /^https:\/\//.test(cover);
  const chronological = () => sort.value === 'newest' || sort.value === 'oldest';
  const pageBooks = page => page.flatMap(row => row.items.map(item => item.book));
  function model(book, featured = false, detail = false) {
    const { height, depth, width } = layout.bookSize(book, matchMedia('(max-width: 600px)').matches, detail);
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
  function renderRow(row, index) {
    if (!row) return '<div class="shelf-row shelf-row-vacant" aria-hidden="true"><div class="shelf-books"></div><div class="shelf-plank"></div></div>';
    const label = row.period ? layout.periodLabel(row.period) : `Shelf ${index + 1}`;
    const items = row.items.map(({ book, featured, monthStart }) => `${monthStart ? `<span class="shelf-month-divider" aria-label="${escape(layout.monthLabel(monthStart))}"><span aria-hidden="true">${escape(layout.monthLabel(monthStart).split(' ')[0])}</span></span>` : ''}${model(book, featured)}`).join('');
    return `<section class="shelf-row" aria-label="${escape(label)}${row.continuation ? ', continued' : ''}"><div class="shelf-books">${items}</div><div class="shelf-plank"><span>${escape(label)}${row.continuation ? ' · continued' : ''}<i></i>${row.items.length} ${row.items.length === 1 ? 'book' : 'books'}</span></div></section>`;
  }
  function updateNavigation() {
    const current = pages[pageIndex];
    if (!current) return;
    const visible = pageBooks(current);
    const dated = visible.filter(book => layout.monthKey(book));
    const firstMonth = dated.length ? layout.monthKey(dated[0]) : '';
    const lastMonth = dated.length ? layout.monthKey(dated.at(-1)) : '';
    const range = dated.length ? `${layout.monthLabel(firstMonth)}${firstMonth !== lastMonth ? ` — ${layout.monthLabel(lastMonth)}` : ''}${dated.length !== visible.length ? ' + undated' : ''}` : 'Date not recorded';
    root.querySelector('#shelf-range').textContent = chronological() ? range : sort.value === 'title' ? 'By title, A–Z' : 'By author, A–Z';
    root.querySelector('#shelf-direction').textContent = chronological() ? `Three-month chapters. Slide right to read ${sort.value === 'newest' ? 'further back' : 'forward in time'}.` : 'Four shelves at a time. Use the arrows or swipe to browse.';
    root.querySelector('#shelf-page-status').textContent = `${pageIndex + 1} / ${pages.length} sections`;
    const before = pages.slice(0, pageIndex).reduce((sum, page) => sum + pageBooks(page).length, 0);
    root.querySelector('#shelf-showing').textContent = `Books ${before + 1}–${before + visible.length} of ${filtered.length}`;
    previousSection.disabled = pageIndex === 0;
    nextSection.disabled = pageIndex === pages.length - 1;
    previousSection.title = pageIndex ? `Previous section: ${pageIndex} of ${pages.length}` : 'Beginning of this collection';
    nextSection.title = pageIndex < pages.length - 1 ? `Next section: ${pageIndex + 2} of ${pages.length}` : 'End of this collection';
    const activePeriods = new Set(current.map(row => row.period));
    timeline.querySelectorAll('button').forEach(button => {
      if (activePeriods.has(button.dataset.period)) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    const active = timeline.querySelector('[aria-current]');
    if (active) {
      const offset = active.offsetLeft - timeline.offsetLeft;
      if (offset < timeline.scrollLeft || offset + active.offsetWidth > timeline.scrollLeft + timeline.clientWidth) {
        timeline.scrollTo({ left: Math.max(0, offset - 12), behavior: reducedMotion() ? 'instant' : 'smooth' });
      }
    }
  }
  function goToPage(index, animate = true) {
    const next = Math.max(0, Math.min(index, pages.length - 1));
    if (!pages.length) return;
    const moveFocus = shelf.contains(document.activeElement) && document.activeElement !== shelf;
    pageIndex = next;
    const track = shelf.querySelector('.shelf-track');
    track.classList.toggle('is-instant', !animate);
    track.style.transform = `translateX(-${pageIndex * 100}%)`;
    track.querySelectorAll('.shelf-bay').forEach((bay, i) => {
      bay.inert = i !== pageIndex;
      bay.setAttribute('aria-hidden', String(i !== pageIndex));
    });
    updateNavigation();
    if (moveFocus) shelf.focus({ preventScroll: true });
  }
  function renderRows(preservePosition = false) {
    const anchor = preservePosition ? pageBooks(pages[pageIndex] || [])[0]?.id : null;
    const restoreFocus = preservePosition && shelf.contains(document.activeElement);
    const rows = layout.buildRows(filtered, { width: shelf.clientWidth, small: matchMedia('(max-width: 600px)').matches, chronological: chronological() });
    pages = layout.paginateRows(rows);
    pageIndex = anchor ? Math.max(0, pages.findIndex(page => pageBooks(page).some(book => book.id === anchor))) : 0;
    shelf.innerHTML = pages.length ? `<div class="shelf-track is-instant">${pages.map((page, i) => `<div class="shelf-bay" role="group" aria-label="Section ${i + 1} of ${pages.length}" aria-hidden="${i !== pageIndex}"${i !== pageIndex ? ' inert' : ''}>${Array.from({ length: 4 }, (_, j) => renderRow(page[j], i * 4 + j)).join('')}</div>`).join('')}</div>` : `<div class="shelf-empty"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v16"/></svg><h3>${books.length ? 'No books on this shelf.' : 'The collection is just beginning.'}</h3><p>${books.length ? 'Try another title or author, or clear your filters.' : 'Books added in the editor will appear here.'}</p></div>`;
    shelf.querySelectorAll('.shelf-books').forEach(row => {
      const items = [...row.querySelectorAll('.shelf-book')];
      items.forEach(item => {
        const previewWidth = Math.max(parseFloat(item.style.getPropertyValue('--book-width')), Math.min(240, row.clientWidth - 48));
        if (item.offsetLeft + previewWidth > row.clientWidth - 16) item.classList.add('is-near-edge');
      });
    });
    root.querySelector('#shelf-chronology').hidden = !pages.length;
    previousSection.hidden = nextSection.hidden = pages.length < 2;
    timeline.hidden = !chronological();
    const periods = [...new Set(rows.map(row => row.period))];
    timeline.innerHTML = chronological() ? periods.map(key => `<button type="button" data-period="${escape(key)}">${escape(layout.periodLabel(key))}</button>`).join('') : '';
    root.querySelector('#shelf-showing').textContent = '';
    root.querySelector('#shelf-total').textContent = books.length;
    root.querySelector('#shelf-years').textContent = new Set(books.map(b => b.dateFinished.slice(0, 4)).filter(Boolean)).size;
    goToPage(pageIndex, false);
    if (restoreFocus) shelf.focus({ preventScroll: true });
  }
  function filterBooks() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    filtered = books.filter(book => terms.every(term => book.searchText.includes(term)) && (!category || book.groups.includes(category)) && (!year.value || book.dateFinished.startsWith(year.value)) && (!month || book.dateFinished.startsWith(month)));
    filtered.sort(sort.value === 'title' ? (a, b) => a.title.localeCompare(b.title) : sort.value === 'author' ? (a, b) => authorsOf(a).localeCompare(authorsOf(b)) : sort.value === 'oldest' ? (a, b) => (a.dateFinished || '9999').localeCompare(b.dateFinished || '9999') : (a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
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
        renderRows(true);
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
  previousSection.addEventListener('click', () => goToPage(pageIndex - 1));
  nextSection.addEventListener('click', () => goToPage(pageIndex + 1));
  timeline.addEventListener('click', event => {
    const button = event.target.closest('[data-period]');
    if (button) goToPage(pages.findIndex(page => page.some(row => row.period === button.dataset.period)));
  });
  shelf.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPage(pageIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let swipeStart, suppressClickUntil = 0;
  shelf.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' && event.isPrimary) swipeStart = { x: event.clientX, y: event.clientY };
  });
  shelf.addEventListener('pointercancel', () => { swipeStart = null; });
  shelf.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressClickUntil = performance.now() + 400;
      goToPage(pageIndex + (dx < 0 ? 1 : -1));
    }
  });
  // A horizontal trackpad gesture turns one section; vertical scrolling stays native.
  let wheelDistance = 0, wheelTurned = false, wheelTimer;
  shelf.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || pages.length < 2 || event.ctrlKey) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelDistance = 0; wheelTurned = false; }, 180);
    if (wheelTurned) return;
    wheelDistance += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? shelf.clientWidth : 1);
    if (Math.abs(wheelDistance) > 45) {
      goToPage(pageIndex + (wheelDistance > 0 ? 1 : -1));
      wheelTurned = true;
    }
  }, { passive: false });
  shelf.addEventListener('pointerover', event => { const book = event.target.closest('.shelf-book'); if (book) loadCover(book); });
  shelf.addEventListener('focusin', event => { const book = event.target.closest('.shelf-book'); if (book) loadCover(book); });
  shelf.addEventListener('click', event => { if (performance.now() < suppressClickUntil) { event.preventDefault(); return; } const book = event.target.closest('.shelf-book'); if (book) openBook(book); });
  // Broken or changed covers reveal the typographic jacket underneath.
  document.addEventListener('error', event => { if (event.target.matches?.('.shelf-book-front img')) event.target.remove(); }, true);
  dialog.querySelector('#book-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('book-dialog-open'); (opener?.isConnected && !opener.closest('[inert]') ? opener : shelf).focus({ preventScroll: true }); });
  dialog.querySelector('#book-turn').addEventListener('click', event => { const turned = dialog.querySelector('.shelf-detail-model').classList.toggle('is-spine'); event.currentTarget.textContent = turned ? 'Show cover' : 'Show spine'; });
  dialog.querySelector('#book-previous').addEventListener('click', () => { if (activeIndex > 0) { activeIndex--; renderDetail(); } });
  dialog.querySelector('#book-next').addEventListener('click', () => { if (activeIndex < filtered.length - 1) { activeIndex++; renderDetail(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && activeIndex > 0) { event.preventDefault(); activeIndex--; renderDetail(); }
    if (event.key === 'ArrowRight' && activeIndex < filtered.length - 1) { event.preventDefault(); activeIndex++; renderDetail(); }
  });
  document.addEventListener('keydown', event => { if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !dialog.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); search.focus(); } });
})();
