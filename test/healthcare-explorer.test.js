const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const data = require('../assets/healthcare-data.js');
const model = require('../assets/healthcare-model.js');
function node(tag) {
  return { tag, children: [], dataset: {}, attributes: {}, className: '', textContent: '',
    append(...children) { this.children.push(...children); },
    setAttribute(key, value) { this.attributes[key] = value; },
    classList: { add() {} }, addEventListener() {},
  };
}
const document = { createElement: node, createTextNode: text => ({ textContent: text }), querySelectorAll: () => [], querySelector: () => node('div') };
const context = vm.createContext({ document, HealthcareData: data });
vm.runInContext(fs.readFileSync(path.join(root, 'health-plan-landscape.js'), 'utf8'), context);
const evaluate = expression => vm.runInContext(expression, context);
const brands = evaluate('BRANDS'), buckets = evaluate('BUCKETS');
const catalog = model.build(brands, buckets, data);
const descendants = element => [element, ...(element.children || []).flatMap(descendants)];

test('compiled healthcare data stays synchronized with editorial sources', () => {
  execFileSync(process.execPath, ['scripts/build-healthcare-data.cjs', '--check'], { cwd: root });
});
test('all original and expanded entries have distinct keys, researched profiles and primary sources', () => {
  assert.equal(Object.keys(brands).length, 332);
  assert.equal(Object.keys(buckets).length, 97);
  assert.ok(catalog.entries.length > 490);
  assert.equal(new Set(catalog.entries.map(e => e.key)).size, catalog.entries.length);
  for (const entry of catalog.entries) {
    assert.ok(entry.summary?.length > 40, entry.key + ' needs a company description');
    assert.ok(entry.category.description.length > 40, entry.key + ' needs its role');
    assert.ok(entry.category.buyer, entry.key + ' needs buyers');
    assert.ok(entry.sources.length, entry.key + ' needs sources');
    for (const source of entry.sources) { assert.ok(source.title); assert.ok(model.safeUrl(source.url)); }
  }
});
test('every brand has a profile and every new company has a real local image with provenance', () => {
  const provenance = require('../assets/health-plan-logos/provider-sources.json');
  for (const id of Object.keys(brands)) assert.ok(data.profiles[id]?.length > 40, id);
  for (const [id, brand] of Object.entries(data.newBrands)) {
    assert.ok(brand.logo, id + ' needs a logo');
    assert.ok(fs.statSync(path.join(root, 'assets/health-plan-logos', brand.logo)).size > 100);
    assert.equal(provenance[id].file, brand.logo);
    assert.ok(model.safeUrl(provenance[id].url));
    assert.ok(model.safeUrl(provenance[id].page));
    if (brand.logo.endsWith('.svg')) assert.doesNotMatch(fs.readFileSync(path.join(root, 'assets/health-plan-logos', brand.logo), 'utf8'), /<script|<foreignObject|\son\w+\s*=/i);
  }
});
test('each placement is one accessible button, including multi-logo relationships', () => {
  for (const [bucket, items] of Object.entries(buckets)) items.forEach((raw, i) => {
    const tile = evaluate(`makeEntry(BUCKETS[${JSON.stringify(bucket)}][${i}], ${JSON.stringify(bucket)}, ${i})`);
    assert.equal(tile.tag, 'button');
    assert.equal(tile.dataset.entry, model.keyFor(bucket, raw, i));
    assert.equal(tile.attributes['aria-controls'], 'entry-panel');
    assert.equal(tile.attributes['aria-expanded'], 'false');
    assert.equal(descendants(tile).filter(n => n.tag === 'button').length, 1);
    assert.equal(descendants(tile).filter(n => n.tag === 'a').length, 0);
  });
});
test('repeated brands retain their placement-specific role and buyer context', () => {
  const epic = catalog.entries.filter(e => e.company === 'epic');
  assert.ok(epic.length >= 8);
  const ehr = epic.find(e => e.bucket === 'enterprise-ehr');
  const claims = epic.find(e => e.scope === 'rcm');
  assert.ok(ehr && claims);
  assert.notEqual(ehr.key, claims.key);
  assert.notEqual(ehr.category.description, claims.category.description);
  assert.ok(epic.every(e => e.sources.some(s => /epic.com/.test(s.url))));
});
test('search supports parent names, multiple terms, case folding and functional scopes', () => {
  assert.equal(model.search(catalog.entries, '  ePiC  ').length, catalog.entries.filter(e => e.company === 'epic').length);
  assert.ok(model.search(catalog.entries, 'UnitedHealth').some(e => e.parentName.includes('UnitedHealth')));
  assert.ok(model.search(catalog.entries, 'epic revenue', 'rcm').length > 0);
  assert.equal(model.search(catalog.entries, 'epic', 'payers').length, 0);
  assert.ok(model.search(catalog.entries, '', 'providers').every(e => ['providers', 'rcm'].includes(e.scope)));
  assert.equal(model.search(catalog.entries, 'nonexistent-company-xyz').length, 0);
});
test('unsafe source protocols are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'http://example.com', '/relative', 'not a url']) assert.equal(model.safeUrl(url), null);
  assert.equal(model.safeUrl('https://example.com/'), 'https://example.com/');
});
