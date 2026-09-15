// Editorial research helper. Downloads public source pages and proposes logo
// candidates; never interprets web content as instructions or publishes it.
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/healthcare-expansion.json'), 'utf8'));
const cache = '/private/tmp/ethanding-healthcare-research';
fs.mkdirSync(cache, { recursive: true });
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, ' ');
const clean = s => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
async function get(url) {
  const { stdout } = await run('curl', ['-L', '--max-time', '22', '--connect-timeout', '8', '-sS', '-A', 'Mozilla/5.0 (compatible; editorial-research)', url], { maxBuffer: 8 * 1024 * 1024 });
  return stdout;
}
async function research(brand) {
  const file = path.join(cache, brand.id + '.json');
  if (fs.existsSync(file) && !process.argv.includes('--refresh')) return;
  try {
    const url = brand.sources?.[0]?.url || brand.website;
    const html = await get(url);
    const tags = [...html.matchAll(/<img\b[^>]*>|<link\b[^>]*>|<meta\b[^>]*>/gi)].map(m => m[0]);
    const attr = (tag, key) => decode(tag.match(new RegExp('(?:^|\\s)' + key + '=["\']([^"\']+)["\']', 'i'))?.[1] || '');
    const candidates = tags.filter(t => /logo|apple-touch-icon|rel=["'](?:shortcut )?icon/i.test(t)).map(t => ({ url: attr(t, 'src') || attr(t, 'href') || attr(t, 'content'), alt: attr(t, 'alt') })).filter(t => t.url && !t.url.startsWith('data:')).map(t => ({ ...t, url: new URL(t.url, url).href }));
    const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
    const descriptionTag = tags.find(t => /(?:name|property)=["'](?:description|og:description)["']/i.test(t)) || '';
    const description = attr(descriptionTag, 'content');
    const headings = [...html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(m => clean(m[1])).filter(Boolean);
    const body = clean(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''));
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ url: m[1], title: clean(m[2]) })).filter(l => /solution|product|service|about|platform/i.test(l.url + ' ' + l.title)).slice(0, 45);
    fs.writeFileSync(file, JSON.stringify({ id: brand.id, url, title, description, headings, candidates: [...new Map(candidates.map(c => [c.url, c])).values()], links, text: body.slice(0, 22000), researched: '2026-09-15' }, null, 2));
    console.log(brand.id + ': ' + (description || title).slice(0, 160));
  } catch (error) { console.log(brand.id + ': ERROR ' + error.message.slice(0, 100)); }
}
async function main() {
  const filter = process.argv.find(a => a.startsWith('--ids='))?.slice(6).split(',');
  let brands = catalog.brands;
  const legacy = process.argv.find(a => a.startsWith('--legacy='))?.slice(9).split(',');
  if (legacy) {
    const code = fs.readFileSync(path.join(root, 'health-plan-landscape.js'), 'utf8').split('if (EXPANSION) for')[0];
    const records = require('node:vm').runInNewContext(code + '\nBRANDS;');
    brands = legacy.map(id => ({ id, name: records[id][0], website: records[id][2] }));
  }
  const queue = brands.filter(b => !filter || filter.includes(b.id));
  await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await research(queue.shift()); }));
}
main();
