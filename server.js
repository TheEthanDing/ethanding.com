const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'TheEthanDing/ethanding.com';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const sessions = new Map();
let articleCache = { expiresAt: 0, items: [] };

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...extra,
  };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, securityHeaders(headers));
  res.end(body);
}

function sendJson(res, status, value, headers = {}) {
  send(res, status, JSON.stringify(value), { 'Content-Type': 'application/json; charset=utf-8', ...headers });
}

async function readJson(req, maxBytes = 12 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON.'), { status: 400 });
  }
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}

function isAuthenticated(req) {
  const token = parseCookies(req).ethan_admin;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}

function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  sendJson(res, 401, { error: 'Sign in to continue.' });
  return false;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function escapeHtml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function decodeXml(value = '') {
  return value.replace(/^<!\[CDATA\[|\]\]>$/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
}

function stripHtml(value = '') {
  return decodeXml(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function xmlTag(block, tag) {
  const escaped = tag.replace(':', '\\:');
  return decodeXml(block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'))?.[1] || '');
}

async function getArticles() {
  if (articleCache.expiresAt > Date.now()) return articleCache.items;
  const response = await fetch('https://ethanding.substack.com/feed', { headers: { 'User-Agent': 'ethanding.com/1.0' } });
  if (!response.ok) throw new Error(`Substack returned ${response.status}.`);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const block = match[1];
    const title = xmlTag(block, 'title');
    const descriptionHtml = xmlTag(block, 'description');
    const content = xmlTag(block, 'content:encoded') || descriptionHtml;
    const image = content.match(/<img[^>]+src=["']([^"']+)/i)?.[1] || '';
    return {
      title,
      slug: slugify(title),
      link: xmlTag(block, 'link'),
      pubDate: xmlTag(block, 'pubDate'),
      description: stripHtml(descriptionHtml).slice(0, 500),
      image,
    };
  });
  articleCache = { expiresAt: Date.now() + 5 * 60 * 1000, items };
  return items;
}

async function githubCommit(relativePath, content, message) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return false;
  const apiPath = relativePath.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/contents/${apiPath}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'ethanding-admin',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const current = await fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
  const existing = current.ok ? await current.json() : null;
  if (!current.ok && current.status !== 404) throw new Error(`GitHub read failed (${current.status}).`);
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      branch: GITHUB_BRANCH,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });
  if (!response.ok) throw new Error(`GitHub save failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  return true;
}

async function saveRepositoryFile(relativePath, content, message) {
  const absolute = path.join(ROOT, relativePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, content);
  const committed = await githubCommit(relativePath, content, message);
  return { committed };
}

function validateBooks(value) {
  if (!Array.isArray(value)) throw Object.assign(new Error('Books must be a list.'), { status: 400 });
  return value.map((book) => ({
    id: String(book.id || crypto.randomUUID()),
    title: String(book.title || '').trim(),
    authors: Array.isArray(book.authors) ? book.authors.map(String).map((v) => v.trim()).filter(Boolean) : [],
    categories: Array.isArray(book.categories) ? book.categories.map(String).map((v) => v.trim()).filter(Boolean) : [],
    sagas: Array.isArray(book.sagas) ? book.sagas.map(String).map((v) => v.trim()).filter(Boolean) : [],
    dateStarted: String(book.dateStarted || ''),
    dateFinished: String(book.dateFinished || ''),
    daysTaken: book.daysTaken !== null && book.daysTaken !== '' && Number.isFinite(Number(book.daysTaken)) ? Number(book.daysTaken) : null,
    rating: book.rating !== null && book.rating !== '' && Number.isFinite(Number(book.rating)) ? Number(book.rating) : null,
    notes: String(book.notes || ''),
    owned: book.owned === true,
    cover: String(book.cover || ''),
  })).filter((book) => book.title).sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
}

async function serveStatic(res, relativePath) {
  const absolute = path.resolve(ROOT, relativePath.replace(/^\/+/, ''));
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) return send(res, 403, 'Forbidden');
  try {
    const body = await fs.readFile(absolute);
    const extension = path.extname(absolute).toLowerCase();
    const cache = relativePath.startsWith('/data/') ? 'no-cache' : relativePath.startsWith('/images/books/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
    send(res, 200, body, { 'Content-Type': mimeTypes[extension] || 'application/octet-stream', 'Cache-Control': cache });
  } catch (error) {
    send(res, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
}

async function renderArticlePreview(res, req, slug) {
  let html = await fs.readFile(path.join(ROOT, 'article-preview.html'), 'utf8');
  try {
    const article = (await getArticles()).find((item) => item.slug === slug);
    if (article) {
      const description = article.description.slice(0, 220);
      const image = article.image || 'https://ethanding.com/images/profile.png';
      const currentUrl = `https://${req.headers.host || 'ethanding.com'}/${encodeURIComponent(slug)}`;
      html = html
        .replace(/<title id="page-title">[^<]*<\/title>/, `<title id="page-title">${escapeHtml(article.title)}</title>`)
        .replace(/<meta id="og-title"[^>]*>/, `<meta id="og-title" property="og:title" content="${escapeHtml(article.title)}">`)
        .replace(/<meta id="og-description"[^>]*>/, `<meta id="og-description" property="og:description" content="${escapeHtml(description)}">`)
        .replace(/<meta id="og-image"[^>]*>/, `<meta id="og-image" property="og:image" content="${escapeHtml(image)}">`)
        .replace(/<meta id="og-url"[^>]*>/, `<meta id="og-url" property="og:url" content="${escapeHtml(currentUrl)}">`)
        .replace(/<meta id="twitter-title"[^>]*>/, `<meta id="twitter-title" name="twitter:title" content="${escapeHtml(article.title)}">`)
        .replace(/<meta id="twitter-description"[^>]*>/, `<meta id="twitter-description" name="twitter:description" content="${escapeHtml(description)}">`)
        .replace(/<meta id="twitter-image"[^>]*>/, `<meta id="twitter-image" name="twitter:image" content="${escapeHtml(image)}">`);
    }
  } catch (error) {
    console.error('Article metadata:', error.message);
  }
  send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/healthz') return sendJson(res, 200, { ok: true });
  if (pathname === '/api/admin/session' && req.method === 'GET') return sendJson(res, 200, { authenticated: isAuthenticated(req), githubConfigured: Boolean(process.env.GITHUB_TOKEN) });

  if (pathname === '/api/admin/login' && req.method === 'POST') {
    if (!ADMIN_PASSWORD) return sendJson(res, 503, { error: 'ADMIN_PASSWORD has not been configured.' });
    const { password } = await readJson(req, 4096);
    if (!safeEqual(password, ADMIN_PASSWORD)) return sendJson(res, 401, { error: 'That password is not correct.' });
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': `ethan_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${process.env.RAILWAY_ENVIRONMENT ? '; Secure' : ''}` });
  }

  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const token = parseCookies(req).ethan_admin;
    if (token) sessions.delete(token);
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': 'ethan_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
  }

  if (pathname === '/api/admin/books' && req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const books = validateBooks((await readJson(req)).books);
    const result = await saveRepositoryFile('data/books.json', `${JSON.stringify(books, null, 2)}\n`, 'Update reading log');
    return sendJson(res, 200, { ok: true, count: books.length, ...result });
  }

  if (pathname === '/api/admin/site' && req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    const { site } = await readJson(req, 256 * 1024);
    if (!site || typeof site !== 'object' || Array.isArray(site)) throw Object.assign(new Error('Site details are invalid.'), { status: 400 });
    const result = await saveRepositoryFile('data/site.json', `${JSON.stringify(site, null, 2)}\n`, 'Update site details');
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (pathname === '/api/admin/cover' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    const { dataUrl, fileName = 'cover' } = await readJson(req);
    const match = String(dataUrl || '').match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
    if (!match) throw Object.assign(new Error('Choose a JPG, PNG, WebP, or GIF image.'), { status: 400 });
    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const safeName = String(fileName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'cover';
    const relativePath = `images/books/custom/${Date.now()}-${safeName}.${extension}`;
    const result = await saveRepositoryFile(relativePath, Buffer.from(match[2], 'base64'), `Add cover for ${fileName}`);
    return sendJson(res, 200, { ok: true, path: `/${relativePath}`, ...result });
  }

  if (pathname === '/api/articles' && req.method === 'GET') {
    try {
      return sendJson(res, 200, { items: await getArticles() }, { 'Cache-Control': 'public, max-age=300' });
    } catch (error) {
      return sendJson(res, 502, { error: error.message });
    }
  }

  if (pathname === '/') return serveStatic(res, '/index.html');
  if (pathname === '/admin' || pathname === '/admin/') return serveStatic(res, '/admin.html');
  if (/^\/(assets|images|data)\//.test(pathname) || pathname === '/admin.js') return serveStatic(res, pathname);
  if (/^\/[a-z0-9-]+\/?$/.test(pathname)) return renderArticlePreview(res, req, pathname.replace(/^\/|\/$/g, ''));
  return send(res, 404, 'Not found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : 'Something went wrong.' });
    else res.end();
  });
});

server.listen(PORT, HOST, () => console.log(`ethanding.com listening on http://${HOST}:${PORT}`));
