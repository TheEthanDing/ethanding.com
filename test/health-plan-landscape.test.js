const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// A small DOM boundary double keeps the real rendering functions under test.
function node(tag) {
  return { tag, children: [], dataset: {}, attributes: {}, className: '', textContent: '',
    append(...children) { this.children.push(...children); },
    setAttribute(key, value) { this.attributes[key] = value; },
    classList: { add() {} }, addEventListener() {},
  };
}
const document = {
  createElement: node, createTextNode: text => ({ textContent: text }),
  querySelectorAll: () => [], querySelector: () => node('div'),
};
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ document });
vm.runInContext(fs.readFileSync(path.join(root, 'health-plan-landscape.js'), 'utf8'), context);
const render = expression => vm.runInContext(expression, context);
const text = element => element.textContent + (element.children || []).map(text).join(' ');

test('preserves startup cohort and a16z provenance across repeated functional placements', () => {
  for (const expression of ["makeEntry('yuzu')", "makeEntry(marked('yuzu', 'Claims administration'))"]) {
    const mark = render(expression);
    assert.equal(mark.dataset.cohort, 'startup');
    assert.equal(mark.dataset.source, 'a16z');
    assert.match(text(mark), /AI \/ tech startup/);
  }
  const addition = render("makeEntry('collective')");
  assert.equal(addition.dataset.cohort, 'startup');
  assert.notEqual(addition.dataset.source, 'a16z');
});

test('labels parent and operating brand as incumbents without reversing ownership', () => {
  const group = render("makeEntry(pair('elevance', 'carelon'))");
  const marks = group.children.filter(child => child.dataset?.company);
  assert.deepEqual(marks.map(mark => mark.dataset.company), ['elevance', 'carelon']);
  for (const mark of marks) {
    assert.equal(mark.dataset.cohort, 'incumbent');
    assert.match(text(mark), /Incumbent/);
    assert.notEqual(mark.dataset.source, 'a16z');
  }
});

test('every mapped company has a local logo or an explicit product label, and a cohort', () => {
  const ids = render('Object.keys(BRANDS)');
  for (const id of ids) {
    const mark = render(`makeMark(${JSON.stringify(id)})`);
    assert.ok(['startup', 'incumbent'].includes(mark.dataset.cohort), id + ' has no cohort');
    const file = render(`BRANDS[${JSON.stringify(id)}][1]`);
    if (file) assert.ok(fs.existsSync(path.join(root, 'assets/health-plan-logos', file)), id + ' logo missing');
    else {
      assert.equal(render(`BRANDS[${JSON.stringify(id)}][3]`), 'product', id + ' logo missing');
      assert.ok(mark.children.some(child => child.className === 'product-name' && child.textContent));
    }
  }
});

const descendants = element => [element, ...(element.children || []).flatMap(descendants)];
function bucketMarks(name) {
  assert.ok(render(`BUCKETS[${JSON.stringify(name)}]`), name + ' must be rendered');
  return render(`BUCKETS[${JSON.stringify(name)}].map(makeEntry)`)
    .flatMap(descendants).filter(element => element.dataset?.company);
}

test('places Oscar in individual coverage and Clover in Medicare Advantage', () => {
  const individual = bucketMarks('individual-plans').map(mark => mark.dataset.company);
  const medicare = bucketMarks('medicare-plans').map(mark => mark.dataset.company);
  assert.ok(individual.includes('oscar'));
  assert.ok(!individual.includes('clover'));
  assert.ok(medicare.includes('clover'));
  assert.ok(!medicare.includes('oscar'));
});

test('shows independent Blues without implying that Elevance owns the federation', () => {
  const blues = bucketMarks('blues-plans');
  for (const id of ['hcsc', 'highmark', 'bcbsmi', 'blueshieldca', 'floridablue']) {
    assert.ok(blues.some(mark => mark.dataset.company === id), id + ' missing');
  }
  const groups = render("BUCKETS['blues-plans'].map(makeEntry)");
  for (const group of groups.filter(group => group.className === 'brand-pair')) {
    const ids = descendants(group).filter(mark => mark.dataset?.company).map(mark => mark.dataset.company);
    if (ids[0] === 'elevance') assert.deepEqual(ids, ['elevance', 'anthem']);
  }
});

test('can label affiliation without falsely announcing ownership', () => {
  const group = render("makeEntry(pair('elevance', 'anthem', 'Test affiliation', 'affiliated with'))");
  assert.match(group.attributes['aria-label'], /affiliated with/);
  assert.doesNotMatch(group.attributes['aria-label'], / owns /);
});

test('keeps an icon-only brand identifiable with a visible name', () => {
  assert.match(text(render("makeEntry('innovaccer')")), /Innovaccer/);
  assert.match(text(render("makeEntry('medimpact')")), /MedImpact/);
});

test('standalone Wellvana SVG supplies the color variable required by its original paths', () => {
  const svg = fs.readFileSync(path.join(root, 'assets/health-plan-logos/wellvana.svg'), 'utf8');
  assert.match(svg, /--icon-stroke-color\s*:/);
});

test('renders payment integrity and core software separately from care delivery', () => {
  assert.ok(bucketMarks('payment-integrity').some(mark => mark.dataset.company === 'cotiviti'));
  assert.ok(bucketMarks('risk-quality').some(mark => mark.dataset.company === 'cotiviti'));
  const core = bucketMarks('core-platforms').map(mark => mark.dataset.company);
  assert.ok(core.indexOf('cognizant') < core.indexOf('trizetto'));
  assert.ok(core.includes('trizetto'));
  assert.ok(bucketMarks('vbc-enablement').some(mark => mark.dataset.company === 'aledade'));
  assert.ok(bucketMarks('vbc-primary').some(mark => mark.dataset.company === 'oakstreet'));
});

test('separates a pharmacy optimizer from PBMs and administration technology', () => {
  const pbms = [...bucketMarks('incumbent-pbm'), ...bucketMarks('challenger-pbm')].map(mark => mark.dataset.company);
  for (const id of ['navitus','medimpact','liviniti','empirx','affirmedrx']) assert.ok(pbms.includes(id), id + ' PBM missing');
  assert.ok(!pbms.includes('rxbenefits'), 'An optimizer is not interchangeable with its contracted PBM');
  assert.ok(bucketMarks('rx-optimization').some(mark => mark.dataset.company === 'rxbenefits'));
  assert.ok(bucketMarks('rx-technology').some(mark => mark.dataset.company === 'rxsense'));
  assert.ok(bucketMarks('dispensing').some(mark => mark.dataset.company === 'lumicera'));
  assert.ok(bucketMarks('specialty-drugs').some(mark => mark.dataset.company === 'archimedes'));
});

test('distinguishes the Essence insurance plan from Lumeris VBC enablement', () => {
  for (const id of ['essence','scan','healthfirst']) assert.ok(bucketMarks('medicare-plans').some(mark => mark.dataset.company === id), id + ' MA plan missing');
  for (const id of ['lumeris','wellvana','vytalize']) assert.ok(bucketMarks('vbc-enablement').some(mark => mark.dataset.company === id), id + ' enabler missing');
  const groups = render("BUCKETS['medicare-plans'].map(makeEntry)");
  const essence = groups.find(group => descendants(group).some(mark => mark.dataset?.company === 'essence'));
  assert.doesNotMatch(essence.attributes['aria-label'] || '', /Lumeris owns Essence/);
});

test('makes insurers own care management visible without inventing service subsidiaries', () => {
  const care = bucketMarks('plan-care-management');
  for (const id of ['aetna','highmark','hcsc','molina']) assert.ok(care.some(mark => mark.dataset.company === id), id + ' care management missing');
  for (const bucket of ['individual-plans','medicare-plans','medicaid-plans']) assert.ok(bucketMarks(bucket).some(mark => mark.dataset.company === 'molina'));
});

test('maps exited businesses to current brands and keeps care programs distinct from VBC', () => {
  const programs = bucketMarks('care-programs').map(mark => mark.dataset.company);
  for (const id of ['teladoc','omada','hinge','headspace','optum']) assert.ok(programs.includes(id));
  assert.match(text(render("BUCKETS['care-programs'].map(makeEntry)[0]")), /Livongo/);
  const navigation = bucketMarks('challenger-care').map(mark => mark.dataset.company);
  for (const id of ['accolade','included','castlight']) assert.ok(navigation.includes(id));
  const primary = bucketMarks('vbc-primary').map(mark => mark.dataset.company);
  for (const id of ['amazon','onemedical','caremore','millennium']) assert.ok(primary.includes(id));
  const ids = render('Object.keys(BRANDS)');
  for (const legacy of ['iora','livongo','ginger','ableto']) assert.ok(!ids.includes(legacy));
});

test('every functional bucket is mounted once and every brand is actually placed', () => {
  const html = fs.readFileSync(path.join(root, 'health-plan-landscape.html'), 'utf8');
  const mounted = [...html.matchAll(/data-bucket="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(mounted.slice().sort(), Array.from(render('Object.keys(BUCKETS)')).sort());
  const placed = new Set(mounted.flatMap(bucket => bucketMarks(bucket).map(mark => mark.dataset.company)));
  for (const id of render('Object.keys(BRANDS)')) assert.ok(placed.has(id), id + ' is never shown');
  const groups = render("BUCKETS['incumbent-care'].map(makeEntry)");
  const ahn = groups.find(group => descendants(group).some(mark => mark.dataset?.company === 'ahn'));
  assert.match(ahn.attributes['aria-label'], /Highmark Health owns Allegheny/);
});
