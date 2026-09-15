const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { brotliDecompressSync } = require('node:zlib');
const run = promisify(execFile);
const root = path.resolve(__dirname, '..');
const data = require('../data/healthcare-expansion.json');
const folder = path.join(root, 'assets/health-plan-logos');
const manifestPath = path.join(folder, 'provider-sources.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
const overrides = require('../data/healthcare-logo-overrides.json');
async function download(brand) {
  if (manifest[brand.id] && !process.argv.includes('--refresh')) return;
  const cacheFile = '/private/tmp/ethanding-healthcare-research/' + brand.id + '.json';
  const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile)) : { candidates: [] };
  const token = brand.name.toLowerCase().replace(/health|healthcare|technologies|software|solutions|\W/g, '');
  const candidates = cache.candidates.map(c => ({ ...c, score: /logo/i.test(c.url) ? 3 : /icon/i.test(c.url) ? 0 : 1 }))
    .map(c => ({ ...c, score: c.score + ((c.alt + c.url).toLowerCase().replace(/\W/g, '').includes(token) ? 5 : 0) - (/white|reverse|inverted|footer/i.test(c.url) ? 1 : 0) - (/client|customer|partner|award|badge|klas|trust/i.test(c.url + c.alt) ? 6 : 0) }))
    .sort((a, b) => b.score - a.score);
  // Refresh a reviewed asset in place; do not silently switch to a customer logo.
  const override = overrides[brand.id]?.url || brand.logoSource || manifest[brand.id]?.url;
  if (override) candidates.splice(0, candidates.length, { url: override, alt: brand.name });
  else candidates.push({ url: new URL('/favicon.ico', brand.website).href, alt: brand.name + ' official site icon' });
  for (const candidate of candidates) {
    try {
      let { stdout: buffer } = await run('curl', ['-f', '-L', '-sS', '-A', 'Mozilla/5.0', '--max-time', '15', candidate.url], { encoding: 'buffer', maxBuffer: 3 * 1024 * 1024 });
      // Some CDNs send Brotli even when curl has not advertised compression.
      try { buffer = brotliDecompressSync(buffer, { maxOutputLength: 3 * 1024 * 1024 }); } catch {}
      const start = buffer.subarray(0, 1000).toString();
      let ext = /<svg[\s>]/.test(start) ? 'svg' : buffer[0] === 137 && buffer[1] === 80 ? 'png' : buffer[0] === 255 && buffer[1] === 216 ? 'jpg' : buffer.toString('ascii', 0, 4) === 'RIFF' ? 'webp' : buffer[0] === 0 && buffer[2] === 1 ? 'ico' : null;
      if (!ext || (ext === 'svg' && /<script|<foreignObject|\son\w+\s*=/i.test(buffer.toString()))) continue;
      if (ext === 'svg') buffer = Buffer.from(buffer.toString().replace(/\r\n?/g, '\n').replace(/[\t ]+$/gm, '').trimEnd() + '\n');
      const file = brand.id + '-expanded.' + ext;
      fs.writeFileSync(path.join(folder, file), buffer);
      manifest[brand.id] = { file, url: candidate.url, page: overrides[brand.id]?.page || cache.url || brand.website, alt: candidate.alt, reviewed: '2026-09-15', bytes: buffer.length };
      console.log(brand.id + ': ' + file + ' ' + candidate.url);
      return;
    } catch {}
  }
  console.log(brand.id + ': NO LOGO');
}
(async () => {
  const filter = process.argv.find(a => a.startsWith('--ids='))?.slice(6).split(',');
  const queue = data.brands.filter(b => !filter || filter.includes(b.id));
  await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await download(queue.shift()); }));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
})();
