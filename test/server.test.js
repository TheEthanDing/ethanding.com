const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

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

test('serves the homepage and health check', async () => {
  const health = await fetch(`${base}/healthz`).then((response) => response.json());
  assert.equal(health.ok, true);
  const homepage = await fetch(base).then((response) => response.text());
  assert.match(homepage, /Ethan Ding/);
  assert.match(homepage, /href="\/foundry-viz\/"/);
  assert.match(homepage, /href="\/healthcare-map"/);
  assert.match(homepage, /href="\/bi-pricing"/);
  assert.match(homepage, /href="\/data-agent-stack"/);
  assert.match(homepage, /href="\/analytics-token-tam"/);
  assert.match(homepage, /href="\/sengoku-clans"/);
  assert.match(homepage, /href="\/semiconductor-wars"/);
  assert.match(homepage, /href="\/airline-wars"/);
  assert.match(homepage, /href="\/wall-street-houses"/);
  assert.match(homepage, /href="\/railroad-empires"/);
  assert.match(homepage, /href="\/oil-wars"/);
  assert.match(homepage, /href="\/bell-wars"/);
});

test('serves the Foundry docs complexity map and its datasets', async () => {
  const redirect = await fetch(`${base}/foundry-viz`, { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/foundry-viz/');

  const response = await fetch(`${base}/foundry-viz/`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /Palantir Foundry/);
  assert.match(page, /Braintrust/);
  assert.match(page, /data\.json/);

  const foundry = await fetch(`${base}/foundry-viz/data.json`).then((result) => result.json());
  const braintrust = await fetch(`${base}/foundry-viz/braintrust.json`).then((result) => result.json());
  assert.ok(foundry.length > 4000);
  assert.ok(braintrust.length > 100);
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
