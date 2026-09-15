(function () {
  'use strict';
  const model = window.HealthcareLandscape;
  if (!model) return;
  const { entries, categories, brands } = model;
  const panel = document.querySelector('#entry-panel');
  const content = document.querySelector('#entry-panel-content');
  const searchInput = document.querySelector('#map-search');
  const poster = document.querySelector('#map-poster');
  const viewport = document.querySelector('#map-viewport');
  const workspace = document.querySelector('.explorer-workspace');
  const closeButton = document.querySelector('#entry-panel-close');
  const backButton = document.querySelector('#entry-panel-back');
  const status = document.querySelector('#map-status');
  const mobile = window.matchMedia('(max-width: 760px)');
  const byKey = new Map(entries.map(entry => [entry.key, entry]));
  const tiles = new Map([...document.querySelectorAll('[data-entry]')].map(tile => [tile.dataset.entry, tile]));
  let scope = 'all', query = '', selected = null, opener = null, resultLimit = 60, view = 'closed';
  poster.classList.add('expanded-landscape');

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (label, action, className) => { const node = el('button', className, label); node.type = 'button'; node.addEventListener('click', action); return node; };
  const link = (label, url, className) => {
    const node = el('a', className, label);
    node.href = HealthcareModel.safeUrl(url) || '#';
    node.target = '_blank'; node.rel = 'noopener noreferrer';
    return node;
  };
  const matchesScope = entry => scope === 'all' || entry.scope === scope || (scope === 'providers' && entry.scope === 'rcm');
  const filtered = () => HealthcareModel.search(entries, query, scope);
  function updateStatus() {
    const results = filtered();
    const brandCount = new Set(results.flatMap(entry => [entry.company, entry.parent].filter(Boolean))).size;
    status.textContent = `${results.length} ${results.length === 1 ? 'entry' : 'entries'} · ${brandCount} ${brandCount === 1 ? 'company / brand' : 'companies & brands'}`;
    const keys = new Set(results.map(entry => entry.key));
    for (const [key, tile] of tiles) tile.classList.toggle('search-dimmed', Boolean(query.trim()) && !keys.has(key));
  }
  function syncPanel() {
    workspace.classList.toggle('panel-open', !panel.hidden);
    // The toolbar remains available on mobile; the covered map is removed from tab order.
    viewport.inert = !panel.hidden && mobile.matches;
    window.dispatchEvent(new Event('healthcare:refit'));
  }
  function showPanel(nextView) {
    view = nextView;
    panel.hidden = false;
    panel.setAttribute('aria-label', nextView === 'results' ? 'Search results' : 'Entry information');
    backButton.hidden = nextView === 'results';
    syncPanel();
  }
  function clearSelection() {
    if (selected) {
      const tile = tiles.get(selected);
      tile?.classList.remove('is-selected');
      tile?.setAttribute('aria-expanded', 'false');
    }
    selected = null;
  }
  function closePanel(restoreFocus = true) {
    panel.hidden = true;
    view = 'closed';
    clearSelection();
    history.replaceState(null, '', location.pathname + location.search);
    syncPanel();
    if (restoreFocus) {
      if (opener?.isConnected && !opener.closest('[hidden]') && !opener.closest('[inert]')) opener.focus({ preventScroll: true });
      else document.querySelector('#map-browse').focus();
    }
  }
  function logo(id, className = '') {
    const brand = brands[id], wrapper = el('div', 'entry-brand ' + className);
    if (brand[1]) {
      const img = el('img');
      img.src = '/assets/health-plan-logos/' + brand[1] + '?v=20260915-8'; img.alt = brand[0];
      if (document.querySelector(`[data-company="${id}"] .white-logo`)) img.classList.add('white-logo');
      wrapper.append(img);
    } else wrapper.textContent = brand[0];
    return wrapper;
  }
  function field(label, value) {
    const group = el('section', 'entry-field');
    group.append(el('h3', '', label), el('p', '', value));
    return group;
  }
  function renderEntry(key, focus = true, updateUrl = true) {
    const entry = byKey.get(key);
    if (!entry) return;
    if (view === 'closed') opener = document.activeElement;
    clearSelection(); selected = key;
    const tile = tiles.get(key);
    tile?.classList.add('is-selected'); tile?.setAttribute('aria-expanded', 'true');
    content.replaceChildren();
    const heading = el('h2', 'entry-name', entry.name); heading.tabIndex = -1;
    const logos = el('div', 'entry-logos');
    if (entry.parent) logos.append(logo(entry.parent, 'parent-brand'), el('span', 'entry-relationship-line', '→'));
    logos.append(logo(entry.company));
    const categoryButton = button(entry.category.title, () => renderCategory(entry.bucket), 'entry-category-link');
    content.append(el('p', 'entry-region', entry.category.section), logos, heading, categoryButton);
    if (entry.note) content.append(el('p', 'entry-product', entry.note));
    content.append(el('p', 'entry-summary', entry.summary));
    if (entry.parent) content.append(field('Relationship shown', `${brands[entry.parent][0]} ${entry.relationship} ${entry.name}${entry.note ? '. ' + entry.note : '.'}`));
    content.append(field('Role in this part of the ecosystem', entry.category.description), field('Who uses or buys this', entry.category.buyer));
    const actions = el('div', 'entry-actions');
    actions.append(link('Company website ↗', entry.website, 'entry-website'));
    const share = button('Copy entry link', async () => {
      try {
        await navigator.clipboard.writeText(location.origin + location.pathname + '#entry=' + encodeURIComponent(key));
        share.textContent = 'Link copied';
      } catch { share.textContent = 'Copy the URL in the address bar'; }
    }, 'entry-share');
    actions.append(share); content.append(actions);
    const sourceSection = el('section', 'entry-sources');
    sourceSection.append(el('h3', '', 'Sources & further reading'));
    const sourceList = el('ul');
    const seen = new Set();
    for (const source of entry.sources) {
      if (seen.has(source.url)) continue;
      seen.add(source.url);
      const li = el('li'); li.append(link(source.title, source.url)); sourceList.append(li);
    }
    sourceSection.append(sourceList); content.append(sourceSection);
    const elsewhere = entries.filter(other => other.company === entry.company && other.key !== key);
    if (elsewhere.length) {
      const section = el('section', 'entry-elsewhere');
      section.append(el('h3', '', 'Also appears in'));
      for (const other of elsewhere) section.append(button(other.category.title + (other.note ? ' — ' + other.note : ''), () => { if (!matchesScope(other)) setScope('all', false); renderEntry(other.key); }, 'entry-related'));
      content.append(section);
    }
    content.append(el('p', 'entry-disclaimer', 'Reviewed September 15, 2026. Editorial classification based on company sources; inclusion is not an endorsement. Product scope, availability and contracts vary.'));
    showPanel('entry');
    content.scrollTop = 0;
    if (updateUrl) history.replaceState(null, '', '#entry=' + encodeURIComponent(key));
    if (focus) heading.focus({ preventScroll: true });
  }
  function renderResults(focus = false) {
    clearSelection();
    content.replaceChildren();
    history.replaceState(null, '', location.pathname + location.search);
    const results = filtered();
    const title = el('h2', 'entry-name', query.trim() ? 'Search results' : 'Browse the landscape'); title.tabIndex = -1;
    content.append(title, el('p', 'results-intro', `${results.length} specific entries. Companies may appear in several functions.`));
    if (!results.length) {
      content.append(el('p', 'search-empty', 'No matching entries in this view. Try a company name, a function such as “coding”, or switch to All.'), button('Clear search', () => { query = ''; searchInput.value = ''; updateStatus(); renderResults(); searchInput.focus(); }, 'clear-search'));
    } else {
      const list = el('div', 'entry-results');
      for (const entry of results.slice(0, resultLimit)) {
        const row = button('', () => renderEntry(entry.key), 'entry-result');
        row.setAttribute('aria-label', `${entry.name} — ${entry.category.title}${entry.note ? ' · ' + entry.note : ''}`);
        row.append(logo(entry.company), el('span', 'result-title', entry.name), el('span', 'result-category', entry.category.title + (entry.note ? ' · ' + entry.note : '')));
        list.append(row);
      }
      content.append(list);
      if (results.length > resultLimit) content.append(button(`Show more (${results.length - resultLimit} remaining)`, () => { const top = content.scrollTop; resultLimit += 60; renderResults(); content.scrollTop = top; }, 'load-more-entries'));
    }
    showPanel('results');
    if (focus) title.focus({ preventScroll: true });
  }
  function renderCategory(id) {
    const category = categories[id];
    if (!category) return;
    if (view === 'closed') opener = document.activeElement;
    clearSelection();
    content.replaceChildren();
    const title = el('h2', 'entry-name', category.title); title.tabIndex = -1;
    content.append(el('p', 'entry-region', category.section), title, el('p', 'entry-summary', category.description), field('Who uses or buys this', category.buyer));
    const list = el('div', 'entry-results');
    for (const entry of entries.filter(entry => entry.bucket === id)) {
      const row = button('', () => renderEntry(entry.key), 'entry-result');
      row.setAttribute('aria-label', `${entry.name} — ${entry.category.title}${entry.note ? ' · ' + entry.note : ''}`);
      row.append(logo(entry.company), el('span', 'result-title', entry.name), el('span', 'result-category', entry.note || entry.category.role)); list.append(row);
    }
    content.append(list);
    showPanel('category'); content.scrollTop = 0; title.focus({ preventScroll: true });
  }
  function setScope(next, rerender = true) {
    scope = next;
    poster.dataset.view = scope;
    for (const shell of document.querySelectorAll('#map-poster > [data-scope]')) shell.hidden = !(scope === 'all' || shell.dataset.scope === scope || (scope === 'providers' && shell.dataset.scope === 'rcm'));
    for (const control of document.querySelectorAll('[data-map-scope]')) control.setAttribute('aria-pressed', String(control.dataset.mapScope === scope));
    updateStatus();
    if (rerender && !panel.hidden) { resultLimit = 60; renderResults(); }
    window.dispatchEvent(new Event('healthcare:refit'));
  }
  for (const control of document.querySelectorAll('[data-map-scope]')) control.addEventListener('click', () => setScope(control.dataset.mapScope));
  for (const [key, tile] of tiles) tile.addEventListener('click', () => renderEntry(key));
  for (const bucket of document.querySelectorAll('[data-bucket]')) {
    const previous = bucket.previousElementSibling;
    const heading = previous?.matches('h2,h3,h4') ? previous : bucket.closest('.subgroup')?.querySelector('.subhead') || bucket.closest('.zone')?.querySelector('.zone-title');
    if (!heading || heading.querySelector('button')) continue;
    heading.replaceChildren(button(heading.textContent, () => renderCategory(bucket.dataset.bucket), 'category-info-trigger'));
  }
  searchInput.addEventListener('input', () => { query = searchInput.value; resultLimit = 60; updateStatus(); renderResults(); });
  searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); const first = filtered()[0]; if (first) renderEntry(first.key); } });
  document.querySelector('#map-browse').addEventListener('click', () => { opener = document.activeElement; resultLimit = 60; renderResults(true); });
  closeButton.addEventListener('click', () => closePanel());
  backButton.addEventListener('click', () => renderResults(true));
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); closePanel(); }
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { event.preventDefault(); searchInput.focus(); }
  });
  mobile.addEventListener('change', syncPanel);
  function fromHash() {
    const value = new URLSearchParams(location.hash.slice(1)).get('entry');
    if (value && byKey.has(value)) renderEntry(value, false, false);
  }
  window.addEventListener('hashchange', fromHash);
  updateStatus(); fromHash();
  window.dispatchEvent(new Event('healthcare:refit'));
})();
