(() => {
  'use strict';

  const vendors = [
    { name: 'Power BI', model: 'per seat', tiers: [['Pro', 120, 'starter'], ['Premium', 240, 'pro'], ['Premium', 600, 'enterprise']] },
    { name: 'Metabase', model: 'per seat', tiers: [['Starter', 60, 'starter'], ['Pro', 180, 'pro'], ['Enterprise', 600, 'enterprise']] },
    { name: 'Tableau', model: 'per seat', tiers: [['Viewer', 180, 'starter'], ['Explorer', 504, 'pro'], ['Creator', 900, 'enterprise']] },
    { name: 'Qlik Sense', model: 'per seat', tiers: [['Standard', 360, 'starter'], ['Premium', 840, 'pro'], ['Enterprise', 1800, 'enterprise']] },
    { name: 'Hex', model: 'per seat', tiers: [['Team', 900, 'pro'], ['Business', null, 'enterprise']] },
    { name: 'Sigma', model: 'per seat', tiers: [['Team', 360, 'starter'], ['Pro', 600, 'pro'], ['Enterprise', 1200, 'enterprise']] },
    { name: 'ThoughtSpot', model: 'per seat', tiers: [['Team', 1140, 'starter'], ['Essentials', 2400, 'pro'], ['Pro', null, 'enterprise']] },
    { name: 'Preset', model: 'per seat', tiers: [['Starter', 396, 'starter'], ['Professional', 756, 'pro'], ['Enterprise', 1200, 'enterprise']] },
    { name: 'Zoho Analytics', model: 'per seat', tiers: [['Basic', 288, 'starter'], ['Standard', 576, 'pro'], ['Premium', 1380, 'enterprise']] },
    { name: 'GoodData', model: 'per seat', tiers: [['Starter', 300, 'starter'], ['Professional', 1020, 'pro'], ['Enterprise', 1800, 'enterprise']] },
  ];
  const colors = { starter: '#8fa98f', pro: '#447f9e', enterprise: '#d97745' };
  const svg = document.getElementById('pricing-chart');
  const detail = document.getElementById('vendor-detail');
  const maxPrice = 2500;
  const plot = { left: 74, top: 24, right: 20, bottom: 86, width: 1026, height: 450 };
  let selected = 0;

  const money = (value) => value == null ? 'Custom' : `$${value.toLocaleString()}/yr`;
  const y = (value) => plot.top + plot.height - (value / maxPrice) * plot.height;

  function renderChart() {
    const ticks = [0, 500, 1000, 1500, 2000, 2500];
    const grid = ticks.map((tick) => `<line class="grid-line${tick % 1000 === 0 ? ' major' : ''}" x1="${plot.left}" y1="${y(tick)}" x2="${plot.left + plot.width}" y2="${y(tick)}"/>
      <text class="axis-label" x="${plot.left - 14}" y="${y(tick) + 4}" text-anchor="end">${tick >= 1000 ? `$${tick / 1000}k` : `$${tick}`}</text>`).join('');
    const columnWidth = plot.width / vendors.length;
    const columns = vendors.map((vendor, vendorIndex) => {
      const center = plot.left + columnWidth * vendorIndex + columnWidth / 2;
      const barWidth = Math.min(58, columnWidth * .62);
      let previous = 0;
      const segments = vendor.tiers.map(([label, value, kind], tierIndex) => {
        if (value == null) {
          const last = vendor.tiers.filter((tier) => tier[1] != null).at(-1)?.[1] || 0;
          const capY = Math.max(plot.top, y(last) - 24);
          return `<rect class="custom-cap tier-segment" data-vendor="${vendorIndex}" data-tier="${tierIndex}" x="${center - barWidth / 2}" y="${capY}" width="${barWidth}" height="18" rx="1" tabindex="0" aria-label="${vendor.name} ${label}: custom pricing"/>`;
        }
        const top = y(value);
        const bottom = y(previous);
        const height = Math.max(2, bottom - top);
        previous = value;
        return `<rect class="tier-segment" data-vendor="${vendorIndex}" data-tier="${tierIndex}" x="${center - barWidth / 2}" y="${top}" width="${barWidth}" height="${height}" fill="${colors[kind]}" fill-opacity=".55" stroke="${colors[kind]}" tabindex="0" aria-label="${vendor.name} ${label}: ${money(value)}"/>
          <circle class="tier-dot" cx="${center}" cy="${top}" r="3.5"/>`;
      }).join('');
      return `<g class="vendor-group${vendorIndex === selected ? ' is-selected' : ''}" data-vendor="${vendorIndex}">
        <rect class="vendor-hit" data-vendor="${vendorIndex}" x="${center - columnWidth / 2}" y="${plot.top}" width="${columnWidth}" height="${plot.height + 58}" tabindex="0" aria-label="Show ${vendor.name} pricing"/>
        <line class="vendor-rule" x1="${center - barWidth / 2}" y1="${plot.top + plot.height + 23}" x2="${center + barWidth / 2}" y2="${plot.top + plot.height + 23}"/>
        ${segments}
        <text class="vendor-label" x="${center}" y="${plot.top + plot.height + 22}">${vendor.name.length > 13 ? vendor.name.split(' ')[0] : vendor.name}</text>
        <text class="vendor-label" x="${center}" y="${plot.top + plot.height + 38}" opacity=".68">${vendor.name.length > 13 ? vendor.name.split(' ').slice(1).join(' ') : vendor.model}</text>
      </g>`;
    }).join('');
    svg.innerHTML = `<title id="pricing-title">Annual per-seat pricing across ten business intelligence tools</title>
      <desc id="pricing-desc">A vertical pricing ladder from zero to twenty-five hundred dollars per user per year. Select a vendor to inspect its plan prices.</desc>
      <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#64717a" stroke-width="2" opacity=".35"/></pattern></defs>
      <text class="axis-label" transform="translate(17 ${plot.top + plot.height / 2}) rotate(-90)" text-anchor="middle">$ PER USER / YEAR</text>
      ${grid}${columns}`;

    svg.querySelectorAll('.vendor-hit').forEach((hit) => {
      const activate = () => selectVendor(Number(hit.dataset.vendor));
      hit.addEventListener('click', activate);
      hit.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
    });
    svg.querySelectorAll('.tier-segment').forEach((segment) => {
      const vendorIndex = Number(segment.dataset.vendor);
      segment.addEventListener('pointerenter', () => highlightVendor(vendorIndex));
      segment.addEventListener('pointerleave', clearHighlight);
      segment.addEventListener('focus', () => highlightVendor(vendorIndex));
      segment.addEventListener('blur', clearHighlight);
      segment.addEventListener('click', () => selectVendor(vendorIndex));
    });
  }

  function renderDetail() {
    const vendor = vendors[selected];
    detail.innerHTML = `<div><h2>${vendor.name}</h2><p>Annual pricing · ${vendor.model}</p></div>
      <div class="tier-list">${vendor.tiers.map(([label, value, kind]) => `<div class="tier" data-kind="${kind}"><span>${label}</span><strong>${money(value)}</strong></div>`).join('')}</div>`;
  }

  function selectVendor(index) {
    selected = index;
    renderChart();
    renderDetail();
  }

  function highlightVendor(index) {
    svg.querySelectorAll('.tier-segment').forEach((segment) => segment.classList.toggle('is-muted', Number(segment.dataset.vendor) !== index));
  }

  function clearHighlight() {
    svg.querySelectorAll('.tier-segment').forEach((segment) => segment.classList.remove('is-muted'));
  }

  renderChart();
  renderDetail();
})();
