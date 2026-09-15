const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { calculateDaysTaken, validateBooks } = require('../server');

const root = path.resolve(__dirname, '..');
let child;
const base = 'http://127.0.0.1:4199';

test.before(async () => {
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: '4199', HOST: '127.0.0.1', ADMIN_PASSWORD: 'test-only-password' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start.')), 5000);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('listening')) { clearTimeout(timeout); resolve(); }
    });
    child.on('error', reject);
  });
});

test.after(() => child?.kill());

test('calculates inclusive reading days from the start and finish dates', () => {
  assert.equal(calculateDaysTaken('2026-07-10', '2026-07-12'), 3);
  assert.equal(calculateDaysTaken('2026-07-10', '2026-07-10'), 1);
  assert.equal(calculateDaysTaken('2026-07-12', '2026-07-10'), null);
  assert.equal(calculateDaysTaken('', '2026-07-10'), null);
  assert.equal(calculateDaysTaken('2026-02-30', '2026-03-02'), null);
});

test('recalculates reading days when book data is saved', () => {
  const [book] = validateBooks([{ id: 'book-1', title: 'Test book', authors: ['Test Author'], dateStarted: '2026-07-10', dateFinished: '2026-07-12', daysTaken: 99 }]);
  assert.equal(book.daysTaken, 3);
});

test('serves the homepage and health check', async () => {
  const health = await fetch(`${base}/healthz`).then((response) => response.json());
  assert.equal(health.ok, true);
  const homepageResponse = await fetch(base);
  assert.equal(homepageResponse.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(homepageResponse.headers.get('cache-control'), 'no-cache');
  const homepage = await homepageResponse.text();
  assert.match(homepage, /Ethan Ding/);
  assert.match(homepage, /class="project-showcase"/);
  assert.match(homepage, /Interactive work/);
  assert.match(homepage, /window\.setTimeout\(\(\) => showProject\(current \+ 1\), 5000\)/);
  assert.match(homepage, /Foundry docs complexity map/);
  assert.match(homepage, /id="bookshelf"/);
  assert.match(homepage, /id="shelf-search"/);
  assert.match(homepage, /id="book-dialog"/);
  assert.match(homepage, /Healthcare ecosystem map/);
  assert.match(homepage, /BI tool per-seat pricing/);
  assert.match(homepage, /One agent, your whole stack/);
  assert.match(homepage, /Analytics token TAM model/);
  assert.match(homepage, /href: '\/foundry-viz\/'/);
  assert.match(homepage, /href: '\/healthcare-map'/);
  assert.match(homepage, /href: '\/health-plan-landscape'/);
  assert.match(homepage, /href: '\/diadochi'/);
  assert.match(homepage, /href="\/health-plan-landscape"/);
  assert.match(homepage, /Power of the Sengoku clans/);
  assert.match(homepage, /Wars of the semis/);
  assert.match(homepage, /Wars of the airlines/);
  assert.match(homepage, /The houses of Wall Street/);
  assert.match(homepage, /The iron railroad empires/);
  assert.match(homepage, /The oil wars/);
  assert.match(homepage, /The Bell wars/);
  assert.match(homepage, /images\/project-previews\/foundry\.png/);
  assert.doesNotMatch(homepage, /<iframe class="showcase-frame/);
  assert.doesNotMatch(homepage, /class="interactive-links"/);

  for (const preview of ['health-plan', 'ancient-world', 'foundry', 'healthcare', 'data-agent', 'bi-pricing', 'analytics-token', 'sengoku', 'semiconductor', 'airlines', 'wall-street', 'railroads', 'oil', 'bell']) {
    const image = await fetch(`${base}/images/project-previews/${preview}.png`);
    assert.equal(image.status, 200, `${preview} preview should be available`);
    assert.match(image.headers.get('content-type'), /^image\/png/);
  }
});

test('serves the Foundry docs complexity map and its dataset', async () => {
  const redirect = await fetch(`${base}/foundry-viz`, { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/foundry-viz/');

  const response = await fetch(`${base}/foundry-viz/`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /Palantir Foundry/);
  assert.match(page, /data\.json/);

  const foundry = await fetch(`${base}/foundry-viz/data.json`).then((result) => result.json());
  assert.ok(foundry.length > 4000);
});

test('does not serve the Palantir essay from personal-site slugs', async () => {
  for (const slug of ['palantir', 'what-people-misunderstand-about-palantir', 'what-do-people-misunderstand-about-palantir']) {
    const response = await fetch(`${base}/${slug}`);
    assert.equal(response.status, 404);
  }
});

test('serves the interactive Bell wars visualization', async () => {
  const response = await fetch(`${base}/bell-wars`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /THE BELL WARS/);
  assert.match(page, /Chain of Succession/);
  assert.match(page, /1984 — The Divestiture/);
  assert.match(page, /EVENT_IMPACTS/);
  assert.match(page, /Bell network/);
  assert.match(page, /pinArtifact/);
  assert.match(page, /data-event-detail="chart"/);
  assert.match(page, /timeline-shell\.js/);
});

test('serves the interactive ancient-world campaign map and geography', async () => {
  const response = await fetch(`${base}/diadochi`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  const page = await response.text();
  assert.match(page, /The Ancient World/);
  assert.match(page, /Milestone chronology/);
  assert.match(page, /499 BCE–476 CE/);
  assert.match(page, /Play the timeline/);
  assert.match(page, /Jump to an era/);
  assert.match(page, /Full-screen campaign table/);
  assert.match(page, /<details class="sources">/);
  assert.doesNotMatch(page, /The empire was a road network wearing a crown/);
  assert.match(page, /City dossier/);
  assert.match(page, /Pleiades ancient-world gazetteer/);
  assert.match(page, /\/diadochi\.js/);

  const script = await fetch(`${base}/diadochi.js`).then((result) => result.text());
  assert.match(script, /Corupedium/);
  assert.match(script, /Alexandria Eschate/);
  assert.match(script, /selectCity/);
  assert.match(script, /snapshot-layer current/);
  assert.match(script, /duration\(980\)/);
  assert.match(script, /state-reveal-/);
  assert.match(script, /easeBackOut/);
  assert.match(script, /battle-icon-swords/);
  assert.match(script, /city-icon-capital/);
  assert.match(script, /naval-unit/);
  assert.match(page, /city-dossier-icon/);
  assert.match(page, /The active cast/);
  assert.match(page, /Character dossier/);
  assert.match(page, /Army in the field/);
  assert.match(page, /Battle dossier/);
  assert.match(page, /Natural Earth vector data/);
  assert.match(page, /Current objective/);
  assert.match(page, /campaign-sweep-forward/);
  assert.match(script, /BACKGROUND_LABELS/);
  assert.match(script, /peopleForYear/);
  assert.match(script, /Dies this year/);
  assert.match(script, /Antigonus Gonatas/);
  assert.match(script, /const ARMIES/);
  assert.match(script, /army-camp-hit/);
  assert.match(script, /BATTLE_DETAILS/);
  assert.match(script, /MOUNTAIN_RANGES/);
  assert.match(script, /armyMovement/);
  assert.match(script, /Gabiene winter camp/);
  assert.match(script, /THRACE/);
  assert.match(script, /YEAR_STATES/);
  assert.match(script, /d3\.range\(323, 275, -1\)/);
  assert.match(script, /countries-50m\.json/);

  const expansion = await fetch(`${base}/assets/diadochi/ancient-world-data.js`).then((result) => result.text());
  assert.match(expansion, /The Persian Wars/);
  assert.match(expansion, /Hannibal/);
  assert.match(expansion, /Maximum extent/);
  assert.match(expansion, /The western court ends/);
  assert.match(expansion, /window\.DIADOCHI_EXPANSION/);

  const geography = await fetch(`${base}/assets/diadochi/countries-50m.json`).then((result) => result.json());
  assert.ok(geography.objects.land);
  assert.ok(geography.objects.countries);
  assert.ok(geography.arcs.length > 1500);

  const rivers = await fetch(`${base}/assets/diadochi/rivers-50m.geojson`).then((result) => result.json());
  const lakes = await fetch(`${base}/assets/diadochi/lakes-50m.geojson`).then((result) => result.json());
  assert.ok(rivers.features.length > 400);
  assert.ok(lakes.features.length > 400);

  const offlineGeography = await fetch(`${base}/assets/diadochi/countries-50m.js`).then((result) => result.text());
  assert.match(offlineGeography, /^window\.DIADOCHI_WORLD = /);

  const portrait = await fetch(`${base}/images/diadochi/people/ptolemy.jpg`);
  assert.equal(portrait.status, 200);
  assert.match(portrait.headers.get('content-type'), /^image\/jpeg/);
});

test('serves the researched railroad empires visualization', async () => {
  const response = await fetch(`${base}/railroad-empires`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /THE IRON DAIMYŌ/);
  assert.match(page, /Research Anchors/);
  assert.match(page, /UP proposes to acquire NS/);
  assert.match(page, /timeline-shell\.js/);
});

test('serves the oil wars and makes the Baby Standards explicit', async () => {
  const response = await fetch(`${base}/oil-wars`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /THE OIL WARS/);
  assert.match(page, /34-way Breakup/);
  assert.match(page, /Standard Oil of New Jersey/);
  assert.match(page, /Sun Oil was independent/);
  assert.match(page, /Click any colored band/);
  assert.match(page, /company-selection/);
  assert.match(page, /EVENT_IMPACTS/);
  assert.match(page, /data-event-detail="chart"/);
  assert.match(page, /timeline-shell\.js/);
});

test('serves the shared one-page timeline interface', async () => {
  const script = await fetch(`${base}/timeline-shell.js`);
  assert.equal(script.status, 200);
  const scriptBody = await script.text();
  assert.doesNotMatch(scriptBody, /Browse story chapters/);
  assert.match(scriptBody, /timeline-story-pins/);
  assert.match(scriptBody, /timeline-story-panel/);
  assert.match(scriptBody, /timeline-stage-instrumented/);
  assert.match(scriptBody, /click to pin/);
  const styles = await fetch(`${base}/timeline-shell.css`);
  assert.equal(styles.status, 200);
  assert.match(await styles.text(), /timeline-event-rail/);
});

test('serves the researched Wall Street houses visualization', async () => {
  const response = await fetch(`${base}/wall-street-houses`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /THE HOUSES OF THE STREET/);
  assert.match(page, /Research Anchors/);
  assert.match(page, /Lehman \(reborn 1994\)/);
});

test('serves the U.S. airline consolidation visualization', async () => {
  const response = await fetch(`${base}/airline-wars`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /U\.S\. AIRLINES/);
  assert.match(page, /Chain of Consolidation/);
});

test('serves the semiconductor wars visualization', async () => {
  const response = await fetch(`${base}/semiconductor-wars`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /WARS OF THE SEMIS/);
  assert.match(page, /Chain of Succession/);
});

test('serves the Sengoku clan power visualization', async () => {
  const response = await fetch(`${base}/sengoku-clans`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /POWER OF THE GREAT CLANS/);
  assert.match(page, /Chain of Conquest/);
});

test('serves the BI pricing comparison and its script', async () => {
  const response = await fetch(`${base}/bi-pricing`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /The price of one more seat/);
  const script = await fetch(`${base}/bi-pricing.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /Power BI/);
});

test('serves the autonomous data agent stack and its script', async () => {
  const response = await fetch(`${base}/data-agent-stack`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /So you want an autonomous data agent/);
  const script = await fetch(`${base}/data-agent-stack.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /Snowflake/);
});

test('serves the updated analytics token TAM model and its script', async () => {
  const response = await fetch(`${base}/analytics-token-tam`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /How many tokens will analytics consume/);
  const script = await fetch(`${base}/analytics-token-tam.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /analyticsQ/);
});

test('serves the healthcare ecosystem map and its script', async () => {
  const response = await fetch(`${base}/healthcare-map`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Who sells what to whom/);
  const script = await fetch(`${base}/healthcare-map.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /const SEGMENTS/);
});

test('serves bookshelf assets and cached public enrichment', async () => {
  for (const [file, type] of [['/assets/bookshelf.js', /javascript/], ['/assets/bookshelf.css', /text\/css/], ['/data/book-metadata.json', /json/], ['/data/book-appearance.json', /json/]]) {
    const response = await fetch(`${base}${file}`);
    assert.equal(response.status, 200, file);
    assert.match(response.headers.get('content-type'), type, file);
    if (file.startsWith('/data/')) assert.equal(response.headers.get('cache-control'), 'no-cache');
  }
});

test('serves the health-plan landscape and its assets', async () => {
  const response = await fetch(`${base}/health-plan-landscape`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /<title>The Health Plan Landscape/);
  assert.match(page, /health-plan-landscape\.js/);

  const script = await fetch(`${base}/health-plan-landscape.js`);
  assert.equal(script.status, 200);
  assert.match(await script.text(), /Elevance Health/);

  const logo = await fetch(`${base}/assets/health-plan-logos/yuzu-health.png`);
  assert.equal(logo.status, 200);
  assert.match(logo.headers.get('content-type'), /^image\/png/);
});

test('serves the repository-owned reading data', async () => {
  const books = await fetch(`${base}/data/books.json`).then((response) => response.json());
  assert.ok(books.length >= 389);
  assert.ok(books.every((book) => !book.cover || book.cover.startsWith('/images/books/')));
  assert.ok(books.some((book) => book.notes));
  assert.ok(books.some((book) => book.rating));
  assert.ok(books.some((book) => book.categories.length));
});

test('protects writes and serves the private editor', async () => {
  const admin = await fetch(`${base}/admin`).then((response) => response.text());
  assert.match(admin, /Your library desk/);
  const response = await fetch(`${base}/api/admin/books`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"books":[]}',
  });
  assert.equal(response.status, 401);
});
