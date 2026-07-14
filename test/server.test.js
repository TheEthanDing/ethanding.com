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
});

test('serves the repository-owned reading data', async () => {
  const books = await fetch(`${base}/data/books.json`).then((response) => response.json());
  assert.equal(books.length, 389);
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
