(() => {
  const chartWrap = document.getElementById('chart-wrap');
  const chart = document.getElementById('chart');
  const events = document.getElementById('events');
  const header = document.querySelector('body > header');
  const nav = document.querySelector('body > .site-nav');
  const instrument = document.querySelector('body > .signal-console');

  if (!chartWrap || !chart || !events || !header || document.body.classList.contains('timeline-shell-mode')) return;
  document.body.classList.add('timeline-shell-mode');

  const compactLabel = (title) => {
    if (/^Chain of/.test(title)) return title.split('—')[0].trim();
    if (/^How Every/.test(title)) return 'Fates';
    if (/^The Great/.test(title)) return 'Profiles';
    if (/Research Anchors/i.test(title)) return 'Sources';
    if (/Unclosed Gate/i.test(title)) return "What's next";
    const short = title.split('—')[0].trim();
    return short.length > 34 ? `${short.slice(0, 31).trim()}…` : short;
  };

  const introNodes = [];
  const intro = header.querySelector('.sub');
  const legend = header.querySelector('.legend-box');
  if (intro) introNodes.push(intro);
  if (legend) introNodes.push(legend);

  const sections = [];
  const titles = Array.from(document.querySelectorAll('body > .section-title'));

  titles.forEach((title) => {
    const nodes = [];
    let node = title.nextSibling;
    while (node && !(node.nodeType === 1 && node.classList.contains('section-title')) && !(node.nodeType === 1 && node.tagName === 'SCRIPT') && !(node.nodeType === 1 && node.tagName === 'FOOTER')) {
      const next = node.nextSibling;
      nodes.push(node);
      node = next;
    }

    title.remove();
    if (nodes.some((item) => item === events || (item.nodeType === 1 && item.contains?.(events)))) return;
    sections.push({
      title: title.textContent.trim(),
      label: compactLabel(title.textContent.trim()),
      actionLabel: title.dataset.actionLabel || '',
      featured: title.classList.contains('timeline-featured-section'),
      nodes,
    });
  });

  if (introNodes.length) sections.unshift({ title: 'How to read this timeline', label: 'Guide', nodes: introNodes });

  const footer = document.querySelector('body > footer');
  if (footer) {
    const sources = sections.find((section) => section.label === 'Sources');
    if (sources) sources.nodes.push(footer);
    else sections.push({ title: 'Notes and definitions', label: 'Notes', nodes: [footer] });
  }

  sections.forEach((section) => section.nodes.forEach((node) => node.remove()));

  const app = document.createElement('main');
  app.className = 'timeline-app';

  const topbar = document.createElement('div');
  topbar.className = 'timeline-topbar';
  if (nav) topbar.appendChild(nav);

  const actions = document.createElement('div');
  actions.className = 'timeline-actions';
  const explore = document.createElement('button');
  explore.type = 'button';
  explore.className = 'timeline-action';
  explore.textContent = 'Browse story chapters';
  actions.appendChild(explore);
  const featuredIndex = sections.findIndex((section) => section.featured);
  let featuredAction = null;
  if (featuredIndex >= 0) {
    featuredAction = document.createElement('button');
    featuredAction.type = 'button';
    featuredAction.className = 'timeline-action timeline-action-primary';
    featuredAction.textContent = sections[featuredIndex].actionLabel || sections[featuredIndex].label;
    actions.prepend(featuredAction);
  }
  header.appendChild(actions);
  topbar.appendChild(header);

  const stage = document.createElement('section');
  stage.className = 'timeline-stage';
  stage.setAttribute('aria-label', 'Timeline chart');
  if (instrument) {
    stage.classList.add('timeline-stage-instrumented');
    stage.appendChild(instrument);
  }
  stage.appendChild(chartWrap);

  Array.from(chart.querySelectorAll('g')).forEach((group) => {
    const children = Array.from(group.children);
    const circles = children.filter((child) => child.tagName?.toLowerCase() === 'circle');
    const label = children.find((child) => child.tagName?.toLowerCase() === 'text');
    if (circles.length >= 2 && label) {
      group.classList.add('chart-fate-marker');
      group.setAttribute('aria-label', label.textContent.trim());
    }
  });

  const bottom = document.createElement('section');
  bottom.className = 'timeline-bottom';
  bottom.setAttribute('aria-label', 'Timeline events');

  const railHead = document.createElement('div');
  railHead.className = 'timeline-rail-head';
  railHead.innerHTML = '<span>Events · click to pin</span><span>Choose a moment to highlight it on the chart</span>';

  const popover = document.createElement('aside');
  popover.className = 'timeline-event-popover';
  popover.hidden = true;
  popover.setAttribute('aria-live', 'polite');
  popover.innerHTML = '<button type="button" class="timeline-popover-close" aria-label="Close event details">×</button><div class="timeline-event-date"></div><h2></h2><p></p>';
  popover.querySelector('.timeline-popover-close').addEventListener('click', () => { popover.hidden = true; });

  events.classList.add('timeline-event-rail');
  const featuredYear = document.body.dataset.featuredEventYear;
  const chartHandlesEventDetails = document.body.dataset.eventDetail === 'chart';
  Array.from(events.querySelectorAll('.ev')).forEach((eventButton) => {
    const year = eventButton.querySelector('.yr')?.textContent.trim() || '';
    const name = eventButton.querySelector('.nm')?.textContent.trim() || '';
    const copyNodes = Array.from(eventButton.childNodes).filter((node) => node.nodeType === 3 && node.textContent.trim());
    const copy = copyNodes.map((node) => node.textContent.trim()).join(' ');
    copyNodes.forEach((node) => node.remove());
    eventButton.setAttribute('aria-label', `${year}. ${name}. ${copy}`);
    if (featuredYear && (eventButton.dataset.year === featuredYear || year.includes(featuredYear))) {
      eventButton.classList.add('timeline-featured-event');
    }
    eventButton.setAttribute('aria-pressed', eventButton.classList.contains('active') ? 'true' : 'false');
    eventButton.addEventListener('click', () => {
      events.querySelectorAll('.ev').forEach((button) => button.setAttribute('aria-pressed', button === eventButton ? 'true' : 'false'));
      if (chartHandlesEventDetails) return;
      popover.querySelector('.timeline-event-date').textContent = year;
      popover.querySelector('h2').textContent = name;
      popover.querySelector('p').textContent = copy;
      popover.hidden = false;
    });
  });

  bottom.append(railHead, popover, events);
  app.append(topbar, stage, bottom);

  const drawer = document.createElement('dialog');
  drawer.className = 'timeline-drawer';
  drawer.setAttribute('aria-label', 'Timeline story explorer');
  drawer.innerHTML = '<div class="timeline-drawer-head"><div><div class="timeline-drawer-kicker">Interactive history</div><h2 class="timeline-drawer-title"></h2></div><button type="button" class="timeline-drawer-close" aria-label="Close story explorer">×</button></div><div class="timeline-drawer-tabs" role="tablist" aria-label="Story sections"></div><div class="timeline-drawer-content" role="tabpanel"></div>';

  const drawerTitle = drawer.querySelector('.timeline-drawer-title');
  const drawerTabs = drawer.querySelector('.timeline-drawer-tabs');
  const drawerContent = drawer.querySelector('.timeline-drawer-content');
  const tabButtons = [];

  const showSection = (index) => {
    const section = sections[index];
    if (!section) return;
    drawerTitle.textContent = index === 0 ? 'Choose a chapter' : section.title;
    drawerContent.replaceChildren(...section.nodes);
    if (index === 0 && sections.length > 1) {
      const map = document.createElement('div');
      map.className = 'timeline-chapter-map';
      map.innerHTML = '<div class="timeline-chapter-map-title">Follow the argument, not just the dates</div><p>Each chapter isolates one change in who held the power. Start anywhere.</p>';
      const grid = document.createElement('div');
      grid.className = 'timeline-chapter-grid';
      let chapterNumber = 0;
      sections.forEach((candidate, candidateIndex) => {
        if (candidateIndex === 0 || candidate.label === 'Sources' || candidate.label === 'Notes') return;
        chapterNumber += 1;
        const chapter = document.createElement('button');
        chapter.type = 'button';
        chapter.className = 'timeline-chapter';
        chapter.innerHTML = `<span class="timeline-chapter-number">${String(chapterNumber).padStart(2, '0')}</span><strong>${candidate.title}</strong><span class="timeline-chapter-open">Open chapter →</span>`;
        chapter.addEventListener('click', () => showSection(candidateIndex));
        grid.appendChild(chapter);
      });
      map.appendChild(grid);
      drawerContent.appendChild(map);
    }
    tabButtons.forEach((button, buttonIndex) => button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false'));
    drawerContent.scrollTop = 0;
    if (!drawer.open) drawer.showModal();
  };

  sections.forEach((section, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'timeline-drawer-tab';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.textContent = section.label;
    button.addEventListener('click', () => showSection(index));
    tabButtons.push(button);
    drawerTabs.appendChild(button);
  });

  explore.addEventListener('click', () => showSection(0));
  featuredAction?.addEventListener('click', () => showSection(featuredIndex));
  drawer.querySelector('.timeline-drawer-close').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', (event) => { if (event.target === drawer) drawer.close(); });

  document.body.replaceChildren(app, drawer);
})();
