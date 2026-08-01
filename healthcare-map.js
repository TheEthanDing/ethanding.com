(() => {
  'use strict';

  const SEGMENTS = [
    {
      id: 'providers', name: 'Providers & Health Systems', shortName: 'Providers', revenue: 1400, color: '#E63946',
      description: 'Hospitals, physician groups, ambulatory care, post-acute. Includes VBC enablers and MSO platforms (pass-through / nested revenue).',
      companies: [
        ['HCA Healthcare', 65, 95, ['provider']], ['Kaiser Permanente', 100, null, ['provider', 'payer'], 'Integrated payer + provider'],
        ['CommonSpirit Health', 34, null, ['provider'], 'Non-profit'], ['Ascension', 28, null, ['provider'], 'Non-profit'],
        ['Tenet Healthcare', 20, 14, ['provider']], ['Universal Health Svcs', 15, 12, ['provider']],
        ['Community Health Sys', 12, 3, ['provider']], ['DaVita', 12, 11, ['provider']],
      ],
      subsegments: [
        { name: 'VBC Enablers', note: 'Revenue mostly pass-through capitation', color: '#FF6B6B', companies: [
          ['agilon health', 5, 3, ['provider'], '~$5B gross / ~$200M net'], ['Evolent Health', 2, 3, ['provider', 'healthit'], 'Platform + services'],
          ['Lumeris', null, null, ['provider'], 'Private'], ['Aledade', null, null, ['provider'], 'Private, independent PCP VBC'],
          ['Oak Street (CVS)', 2, null, ['provider'], 'Acquired by CVS'],
        ] },
        { name: 'MSOs & Practice Platforms', note: 'Management fees, not additive', color: '#FF8787', companies: [
          ['Optum Health', 90, null, ['provider', 'payer'], 'UHG subsidiary, largest MSO'],
          ['Privia Health', 1.7, 3.5, ['provider'], 'Physician platform'], ['Aspen Dental (TAG)', 3, null, ['provider'], 'PE-backed dental DSO'],
        ] },
      ],
    },
    {
      id: 'payers', name: 'Payers & Health Insurance', shortName: 'Payers', revenue: 1200, color: '#457B9D',
      description: 'Commercial insurance, Medicare Advantage, and Medicaid managed care.',
      companies: [
        ['UnitedHealth Group', 372, 540, ['payer', 'pbm', 'provider', 'healthit'], 'Optum spans 4 segments'],
        ['Cigna Group', 195, 95, ['payer', 'pbm'], 'Express Scripts PBM'], ['Elevance Health', 171, 105, ['payer', 'pbm']],
        ['Centene', 154, 42, ['payer'], 'Medicaid focused'], ['Humana', 106, 38, ['payer']],
        ['CVS / Aetna', 90, null, ['payer'], 'Aetna segment of CVS'], ['Molina Healthcare', 36, 22, ['payer']],
      ],
    },
    {
      id: 'distribution', name: 'Wholesale & Distribution', shortName: 'Distribution', revenue: 800, color: '#F4A261',
      description: 'Drug wholesalers and medical supply distribution — massive revenue, thin margins.',
      companies: [
        ['McKesson', 309, 75, ['distribution', 'healthit']], ['Cencora', 262, 48, ['distribution'], 'fka AmerisourceBergen'],
        ['Cardinal Health', 205, 28, ['distribution']], ['Henry Schein', 13, 9, ['distribution']], ['Owens & Minor', 10, 2, ['distribution']],
      ],
    },
    {
      id: 'therapeutics', name: 'Therapeutics (Pharma + Biotech)', shortName: 'Therapeutics', revenue: 780, color: '#2A9D8F',
      description: 'Small molecules, biologics, and gene therapy — merged because the line barely matters.',
      companies: [
        ['Eli Lilly', 41, 740, ['therapeutics'], 'GLP-1 dominance'], ['Johnson & Johnson', 55, 380, ['therapeutics', 'medtech'], 'Innovative Medicine segment'],
        ['Merck & Co', 60, 260, ['therapeutics']], ['AbbVie', 54, 310, ['therapeutics']], ['Pfizer', 58, 140, ['therapeutics']],
        ['Novo Nordisk', 38, 480, ['therapeutics'], 'GLP-1 / Ozempic'], ['Roche', 50, 220, ['therapeutics', 'diagnostics']],
        ['Novartis', 50, 210, ['therapeutics']], ['AstraZeneca', 46, 220, ['therapeutics']], ['Sanofi', 46, 130, ['therapeutics']],
        ['Bristol-Myers Squibb', 45, 100, ['therapeutics']], ['Amgen', 27, 160, ['therapeutics']], ['Gilead Sciences', 27, 110, ['therapeutics']],
        ['Regeneron', 13, 90, ['therapeutics']], ['Vertex Pharma', 10, 110, ['therapeutics']], ['Moderna', 6, 18, ['therapeutics'], 'mRNA platform'],
        ['Teva Pharma', 16, 20, ['therapeutics'], 'Generics leader'],
      ],
    },
    {
      id: 'pbm', name: 'Pharmacy Benefit Managers', shortName: 'PBM', revenue: 500, color: '#9B5DE5',
      description: 'Drug formulary management and rebate negotiation — an oligopoly of three.',
      companies: [
        ['CVS / Caremark', 180, null, ['pbm', 'pharmacy'], 'CVS PBM arm'], ['Express Scripts (Cigna)', 150, null, ['pbm'], 'Cigna subsidiary'],
        ['OptumRx (UHG)', 120, null, ['pbm'], 'UHG subsidiary'], ['Humana Pharmacy', 30, null, ['pbm']],
        ['Prime Therapeutics', 25, null, ['pbm'], 'BCBS-owned'],
      ],
    },
    {
      id: 'pharmacy', name: 'Retail Pharmacy', shortName: 'Retail Rx', revenue: 350, color: '#F07167',
      description: 'Retail drug stores, mail-order, and specialty pharmacy.',
      companies: [
        ['CVS Health', 357, 78, ['pharmacy', 'pbm', 'payer'], 'Total CVS entity'], ['Walgreens Boots', 139, 10, ['pharmacy'], 'Going private'],
        ['Rite Aid', 6, null, ['pharmacy'], 'Post-bankruptcy'],
      ],
    },
    {
      id: 'medtech', name: 'MedTech & Devices', shortName: 'MedTech', revenue: 200, color: '#00BBF9',
      description: 'Medical devices, surgical robotics, diagnostics, and imaging.',
      companies: [
        ['Medtronic', 32, 110, ['medtech']], ['Abbott Laboratories', 40, 200, ['medtech', 'diagnostics']], ['Stryker', 20, 125, ['medtech']],
        ['Boston Scientific', 15, 110, ['medtech']], ['Intuitive Surgical', 7, 170, ['medtech'], 'Da Vinci robotics'],
        ['Becton Dickinson', 20, 65, ['medtech']], ['GE HealthCare', 19, 40, ['medtech', 'diagnostics']],
        ['Siemens Healthineers', 22, 55, ['medtech', 'diagnostics']], ['Zimmer Biomet', 7, 22, ['medtech']],
      ],
    },
    {
      id: 'lifesci', name: 'Life Sciences Tools & CRO', shortName: 'Life Sci Tools', revenue: 120, color: '#FFD166',
      description: 'CROs, CDMOs, lab equipment, research tools, and genomics.',
      companies: [
        ['Thermo Fisher', 42, 195, ['lifesci']], ['Danaher', 24, 170, ['lifesci', 'diagnostics']],
        ['IQVIA', 15, 42, ['lifesci', 'healthit'], 'CRO + data'], ['Agilent', 7, 38, ['lifesci']],
        ['Illumina', 4, 18, ['lifesci'], 'Genomics'], ['Charles River Labs', 4, 10, ['lifesci']],
      ],
    },
    {
      id: 'healthit', name: 'Health IT, RCM & Analytics', shortName: 'Health IT', revenue: 140, color: '#EF476F',
      description: 'EHR, RCM, clinical analytics, population health, claims processing, and AI.',
      companies: [
        ['Epic Systems', 4, null, ['healthit'], 'Private, dominant EHR'], ['Oracle Health', 6, null, ['healthit'], 'fka Cerner'],
        ['Change HC (Optum)', 4, null, ['healthit'], 'Claims clearinghouse'], ['R1 RCM', 2.3, null, ['healthit'], 'RCM, taken private'],
        ['Veeva Systems', 2.4, 34, ['healthit'], 'Life sci CRM'], ['Waystar', 0.8, 6, ['healthit'], 'RCM platform'],
        ['Ensemble Health Partners', 1.5, null, ['healthit'], 'RCM services'], ['Health Catalyst', 0.3, 0.6, ['healthit'], 'Data platform'],
        ['Phreesia', 0.4, 1.5, ['healthit'], 'Patient intake'], ['Evolent Health', 2, 3, ['healthit', 'provider'], 'VBC tech'],
      ],
    },
  ];

  SEGMENTS.forEach((segment) => {
    segment.companies = segment.companies.map(([name, rev, mcap, tags, note]) => ({ name, rev, mcap, tags, note }));
    segment.subsegments?.forEach((sub) => {
      sub.companies = sub.companies.map(([name, rev, mcap, tags, note]) => ({ name, rev, mcap, tags, note }));
    });
  });

  const EXTERNAL_NODES = [
    { id: 'patients', shortName: 'Patients', color: '#ffffff', isExternal: true },
    { id: 'employers', shortName: 'Employers', color: '#aab4c2', isExternal: true },
  ];
  const EDGES = [
    ['providers', 'patients', 'Care delivery', 3], ['pharmacy', 'patients', 'Prescriptions', 2],
    ['payers', 'patients', 'Insurance coverage', 2], ['payers', 'employers', 'Group insurance', 3],
    ['payers', 'providers', 'Reimbursement $$$', 3], ['pbm', 'payers', 'Drug benefit mgmt', 2],
    ['pbm', 'pharmacy', 'Formulary / network', 2], ['therapeutics', 'pbm', 'Rebates / pricing', 2],
    ['therapeutics', 'distribution', 'Drug manufacturing', 3], ['distribution', 'pharmacy', 'Drug wholesale', 3],
    ['distribution', 'providers', 'Supplies + drugs', 2], ['medtech', 'providers', 'Devices / equipment', 2],
    ['lifesci', 'therapeutics', 'R&D tools / CRO', 2], ['healthit', 'providers', 'EHR / RCM / analytics', 2],
    ['healthit', 'payers', 'Claims / analytics', 1],
  ].map(([from, to, label, weight]) => ({ from, to, label, weight }));
  const POSITIONS = {
    patients: [140, 70], employers: [720, 70], payers: [500, 195], providers: [260, 310], pbm: [680, 340],
    pharmacy: [130, 500], distribution: [430, 480], therapeutics: [680, 540], medtech: [100, 310],
    lifesci: [870, 610], healthit: [870, 195],
  };
  const TAG_LABELS = {
    provider: 'Providers', payer: 'Payers', distribution: 'Distribution', therapeutics: 'Therapeutics',
    pbm: 'PBM', pharmacy: 'Retail Rx', medtech: 'MedTech', lifesci: 'Life Sci Tools', healthit: 'Health IT', diagnostics: 'Diagnostics',
  };
  const totalRevenue = SEGMENTS.reduce((sum, segment) => sum + segment.revenue, 0);
  const maxRevenue = Math.max(...SEGMENTS.map((segment) => segment.revenue));
  const state = { active: null, view: 'network' };
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const fmt = (value) => {
    if (value == null) return '—';
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}T`;
    if (value >= 1) return `$${Number.isInteger(value) ? value : value.toFixed(1)}B`;
    return `$${Math.round(value * 1000)}M`;
  };
  const radius = (revenue) => revenue ? 18 + Math.sqrt(revenue / maxRevenue) * 52 : 24;
  const allNodes = [
    ...EXTERNAL_NODES.map((node) => ({ ...node, pos: POSITIONS[node.id], r: 24 })),
    ...SEGMENTS.map((segment) => ({ ...segment, pos: POSITIONS[segment.id], r: radius(segment.revenue) })),
  ];
  const nodeById = Object.fromEntries(allNodes.map((node) => [node.id, node]));

  function arrowPath(fromNode, toNode) {
    const [fromX, fromY] = fromNode.pos;
    const [toX, toY] = toNode.pos;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.hypot(dx, dy);
    const nx = dx / distance;
    const ny = dy / distance;
    const sx = fromX + nx * (fromNode.r + 4);
    const sy = fromY + ny * (fromNode.r + 4);
    const ex = toX - nx * (toNode.r + 10);
    const ey = toY - ny * (toNode.r + 10);
    const mx = (sx + ex) / 2 - ny * 20;
    const my = (sy + ey) / 2 + nx * 20;
    return `M${sx},${sy} Q${mx},${my} ${ex},${ey}`;
  }

  function renderNetwork() {
    const stage = document.getElementById('network-stage');
    const gradients = allNodes.map((node) => `
      <radialGradient id="grad-${node.id}" cx="35%" cy="35%">
        <stop offset="0%" stop-color="${node.color}" stop-opacity=".92"/>
        <stop offset="100%" stop-color="${node.color}" stop-opacity=".32"/>
      </radialGradient>`).join('');
    const edges = EDGES.map((edge, index) => {
      const from = nodeById[edge.from];
      const to = nodeById[edge.to];
      const path = arrowPath(from, to);
      const midpointX = (from.pos[0] + to.pos[0]) / 2;
      const midpointY = (from.pos[1] + to.pos[1]) / 2 - 13;
      return `<path id="edge-${index}" class="edge${edge.weight < 2 ? ' light' : ''}" data-from="${edge.from}" data-to="${edge.to}" d="${path}" marker-end="url(#arrowhead)"/>
        <g class="edge-label" data-from="${edge.from}" data-to="${edge.to}" transform="translate(${midpointX} ${midpointY})">
          <rect x="-${Math.max(38, edge.label.length * 3.15)}" y="-9" width="${Math.max(76, edge.label.length * 6.3)}" height="17" rx="2" fill="#080d16" opacity=".94"/>
          <text fill="#c0c9d4" font-size="9" text-anchor="middle" dominant-baseline="middle">${escapeHtml(edge.label)}</text>
        </g>`;
    }).join('');
    const nodes = allNodes.map((node) => {
      const [x, y] = node.pos;
      const active = state.active === node.id ? ' is-active' : '';
      const interactive = node.isExternal ? '' : ' role="button" tabindex="0"';
      return `<g class="map-node${node.isExternal ? ' external' : ''}${active}" data-node="${node.id}" transform="translate(${x} ${y})"${interactive} aria-label="${escapeHtml(node.shortName)}${node.revenue ? `, ${fmt(node.revenue)} annual revenue` : ''}">
        <title>${escapeHtml(node.shortName)}${node.revenue ? ` — ${fmt(node.revenue)} annual revenue` : ''}</title>
        <circle class="node-ring" r="${node.r + 6}" stroke="${node.color}"/>
        <circle class="node-circle" r="${node.r}" fill="url(#grad-${node.id})" stroke="${node.color}" stroke-opacity=".74"/>
        <text class="node-label" y="${node.revenue ? -2 : 3}">${escapeHtml(node.shortName)}</text>
        ${node.revenue ? `<text class="node-value" y="13">${fmt(node.revenue)}</text>` : ''}
      </g>`;
    }).join('');
    stage.innerHTML = `<svg viewBox="0 0 1000 700" role="img" aria-labelledby="map-title map-desc">
      <title id="map-title">US healthcare ecosystem market map</title>
      <desc id="map-desc">Nine healthcare market segments connected by directional seller-to-buyer flows. Bubble size represents approximate annual revenue.</desc>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#65748a"/></marker>
        ${gradients}
      </defs>
      ${edges}${nodes}
    </svg>`;

    stage.querySelectorAll('.map-node').forEach((element) => {
      const id = element.dataset.node;
      element.addEventListener('pointerenter', () => highlightNode(id));
      element.addEventListener('pointerleave', clearHighlight);
      if (!element.classList.contains('external')) {
        element.addEventListener('focus', () => highlightNode(id));
        element.addEventListener('blur', clearHighlight);
        element.addEventListener('click', () => selectNode(id));
        element.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectNode(id); }
        });
      }
    });
  }

  function highlightNode(id) {
    const connected = new Set([id]);
    EDGES.forEach((edge) => {
      if (edge.from === id || edge.to === id) { connected.add(edge.from); connected.add(edge.to); }
    });
    document.querySelectorAll('.map-node').forEach((node) => node.classList.toggle('is-muted', !connected.has(node.dataset.node)));
    document.querySelectorAll('.edge, .edge-label').forEach((edge) => {
      const matches = edge.dataset.from === id || edge.dataset.to === id;
      edge.classList.toggle('is-highlighted', matches);
      if (edge.classList.contains('edge')) edge.classList.toggle('is-muted', !matches);
    });
  }

  function clearHighlight() {
    document.querySelectorAll('.map-node, .edge, .edge-label').forEach((element) => element.classList.remove('is-muted', 'is-highlighted'));
  }

  function selectNode(id) {
    state.active = state.active === id ? null : id;
    renderNetwork();
    renderDetail();
  }

  function companyRow(company, color, max) {
    const width = company.rev ? Math.max(2, company.rev / max * 100) : 0;
    return `<div class="company-row">
      <div class="company-name"><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.note || ' ')}</small></div>
      <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%;background:${color}"></div></div>
      <div class="company-numbers">rev ${fmt(company.rev)} · cap ${fmt(company.mcap)}</div>
    </div>`;
  }

  function renderDetail() {
    const detail = document.getElementById('segment-detail');
    const segment = SEGMENTS.find((item) => item.id === state.active);
    if (!segment) { detail.className = ''; detail.innerHTML = ''; return; }
    const companies = [...segment.companies].sort((a, b) => (b.rev || 0) - (a.rev || 0));
    const max = Math.max(...companies.map((company) => company.rev || 0), 1);
    const subsegments = (segment.subsegments || []).map((subsegment) => {
      const subMax = Math.max(...subsegment.companies.map((company) => company.rev || 0), 1);
      return `<details><summary><strong>${escapeHtml(subsegment.name)}</strong><span>${escapeHtml(subsegment.note)}</span></summary>
        <div class="nested-list">${subsegment.companies.map((company) => companyRow(company, subsegment.color, subMax)).join('')}</div></details>`;
    }).join('');
    detail.className = 'detail';
    detail.innerHTML = `<div class="detail-head"><div><h2>${escapeHtml(segment.name)}</h2><p>${escapeHtml(segment.description)}</p></div>
      <div class="detail-total"><strong>${fmt(segment.revenue)}</strong><span>annual revenue</span></div></div>
      ${companies.map((company) => companyRow(company, segment.color, max)).join('')}${subsegments}`;
  }

  function renderBars() {
    document.getElementById('view-bars').innerHTML = SEGMENTS.map((segment) => {
      const companies = [...segment.companies].sort((a, b) => (b.rev || 0) - (a.rev || 0)).slice(0, 6);
      const listedRevenue = companies.reduce((sum, company) => sum + (company.rev || 0), 0);
      const denominator = Math.max(segment.revenue, listedRevenue);
      const pieces = companies.map((company) => {
        const width = Math.max(1, (company.rev || 0) / denominator * 100);
        return `<div class="stack-piece" title="${escapeHtml(company.name)}: ${fmt(company.rev)}" style="width:${width}%;background:${segment.color}">${width > 10 ? escapeHtml(company.name) : ''}</div>`;
      }).join('');
      const other = Math.max(0, segment.revenue - listedRevenue);
      return `<article class="segment-bar"><div class="segment-bar-head"><strong>${escapeHtml(segment.name)}</strong><span>${fmt(segment.revenue)} segment revenue</span></div>
        <div class="stack" aria-label="Largest companies by revenue in ${escapeHtml(segment.name)}">${pieces}${other ? `<div class="stack-piece" style="width:${other / denominator * 100}%;background:${segment.color};opacity:.25">Other</div>` : ''}</div>
        <div class="company-key">${companies.map((company) => `<span><b>${escapeHtml(company.name)}</b> ${fmt(company.rev)}</span>`).join('')}</div></article>`;
    }).join('');
  }

  function conglomerates() {
    const map = new Map();
    SEGMENTS.forEach((segment) => segment.companies.forEach((company) => {
      if (company.tags.length < 2) return;
      const key = company.name.split(' /')[0].split(' (')[0];
      const existing = map.get(key);
      if (!existing) map.set(key, { ...company, tags: [...company.tags], segments: [segment.id] });
      else {
        company.tags.forEach((tag) => { if (!existing.tags.includes(tag)) existing.tags.push(tag); });
        if (!existing.segments.includes(segment.id)) existing.segments.push(segment.id);
        existing.rev = Math.max(existing.rev || 0, company.rev || 0);
        existing.mcap = Math.max(existing.mcap || 0, company.mcap || 0) || null;
      }
    }));
    return [...map.values()].sort((a, b) => (b.mcap || b.rev || 0) - (a.mcap || a.rev || 0));
  }

  function renderCross() {
    document.getElementById('cross-list').innerHTML = conglomerates().map((company) => `<article class="cross-row">
      <div><h3>${escapeHtml(company.name)}</h3><p>${escapeHtml(company.note || 'Cross-segment operator')}</p></div>
      <div class="tags">${company.tags.map((tag) => `<span class="tag">${escapeHtml(TAG_LABELS[tag] || tag)}</span>`).join('')}</div>
      <div class="cross-value">rev ${fmt(company.rev)}<br>cap ${fmt(company.mcap)}</div>
    </article>`).join('');
  }

  function renderStats() {
    const companyCount = SEGMENTS.reduce((sum, segment) => sum + segment.companies.length, 0);
    const publicCount = SEGMENTS.flatMap((segment) => segment.companies).filter((company) => company.mcap != null).length;
    const values = [[fmt(totalRevenue), 'Combined revenue'], [SEGMENTS.length, 'Market segments'], [companyCount, 'Companies mapped'], [publicCount, 'Public market caps']];
    document.getElementById('market-stats').innerHTML = values.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    document.getElementById('total-market').textContent = fmt(totalRevenue);
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('.tab').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.view === view)));
    document.querySelectorAll('.view').forEach((panel) => { panel.hidden = panel.id !== `view-${view}`; });
  }

  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
  renderNetwork();
  renderDetail();
  renderBars();
  renderCross();
  renderStats();
})();
