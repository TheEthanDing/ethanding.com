/** Refresh the checked-in public catalog cache; never runs in a visitor's browser.
 * Open Library asks for batch search requests, caching, and <= 1 request/second.
 * Usage: node scripts/enrich-books.cjs [--refresh]
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const titleTokens = value => normalize(value.split(':')[0]).split(' ').filter(x => !['the', 'a', 'an', 'and', 'of', 'to', 'in'].includes(x));
function scoreMatch(book, doc) {
  const wanted = titleTokens(book.title), found = titleTokens(doc.title);
  if (/workbook|study guide|summary|summaries|analysis|journal/i.test(doc.title) && !/workbook|study guide|summary|summaries|analysis|journal/i.test(book.title)) return 0;
  const overlap = wanted.filter(x => found.includes(x)).length;
  const titleScore = 2 * overlap / Math.max(1, wanted.length + found.length);
  const exact = wanted.join(' ') === found.join(' ');
  const authors = normalize((doc.author_name || []).join(' '));
  const authorMatch = book.authors.some(author => authors.includes(normalize(author).split(' ').at(-1)));
  // A missing author needs a particularly strong title match. Never match on title alone if the log has an author.
  if ((book.authors.length && !authorMatch) || (!exact && titleScore < .84)) return 0;
  if (!book.authors.length && !exact) return 0;
  return (exact ? 2 : titleScore) + (authorMatch ? 1 : 0) + (doc.number_of_pages_median ? .1 : 0);
}
function categoryFor(subjects) {
  for (const subject of subjects.slice(0, 12)) {
    const text = subject.toLowerCase();
    if (/biograph|memoir/.test(text)) return 'Biography';
    if (/science fiction|fantasy|novel|fiction/.test(text) && !/nonfiction|non-fiction/.test(text)) return 'Fiction';
    if (/business|entrepreneur|management|corporation|industries|finance|economics/.test(text)) return 'Business';
    if (/computer|engineering|technology|programming/.test(text)) return 'Technology';
    if (/history|civilization|warfare/.test(text)) return 'History';
    if (/science|physics|mathematics|biology/.test(text)) return 'Science';
    if (/psychology|self-help|personal|success/.test(text)) return 'Development';
  }
  return '';
}
async function main() {
  const books = JSON.parse(await fs.readFile(path.join(root, 'data/books.json'), 'utf8'));
  const file = path.join(root, 'data/book-metadata.json');
  let cache = { version: 1, books: {} };
  try { cache = JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const aliases = JSON.parse(await fs.readFile(path.join(root, 'data/book-lookup-aliases.json'), 'utf8'));
  const lookup = book => ({ ...book, ...aliases[book.title] });
  const pending = books.filter(b => process.argv.includes('--refresh') || (process.argv.includes('--retry-missing') && !cache.books[b.id]?.pageCount) || cache.books[b.id]?.lookupTitle !== b.title || !cache.books[b.id]?.fetchedAt);
  for (let offset = 0; offset < pending.length; offset += 10) {
    const batch = pending.slice(offset, offset + 10);
    const clauses = batch.map(original => {
      const b = lookup(original);
      const title = b.title.split(':')[0].replace(/[\"\\]/g, ' ').trim();
      const author = normalize(b.authors[0] || '').split(' ').at(-1);
      return `(title:"${title}"${author ? ` AND author:${author}` : ''})`;
    });
    const url = new URL('https://openlibrary.org/search.json');
    url.search = new URLSearchParams({ q: clauses.join(' OR '), fields: 'key,title,author_name,number_of_pages_median,first_publish_year,subject', limit: '200', lang: 'en' });
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'EthanDingBookshelf/1.0 (https://ethanding.com)' } });
        if (response.ok) break;
        if (response.status !== 429 && response.status < 500) throw new Error(`Open Library returned ${response.status}`);
      } catch (error) { if (attempt === 2) throw error; }
      await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)));
    }
    if (!response?.ok) throw new Error('Open Library unavailable; existing cache has been preserved.');
    const { docs = [] } = await response.json();
    for (const book of batch) {
      const matches = docs.map(doc => ({ doc, score: scoreMatch(lookup(book), doc) })).filter(x => x.score).sort((a, b) => b.score - a.score);
      const doc = matches[0]?.doc;
      cache.books[book.id] = { ...(cache.books[book.id]?.lookupTitle === book.title ? cache.books[book.id] : {}), lookupTitle: book.title, fetchedAt: new Date().toISOString().slice(0, 10) };
      if (doc) Object.assign(cache.books[book.id], {
        source: `https://openlibrary.org${doc.key}`, catalogTitle: doc.title, authors: doc.author_name || [],
        ...(aliases[book.title] ? { displayAuthors: doc.author_name || [] } : {}),
        pageCount: doc.number_of_pages_median > 0 ? doc.number_of_pages_median : null,
        pageCountBasis: 'Median across catalog editions', publishedYear: doc.first_publish_year || null,
        category: categoryFor(doc.subject || []), subjects: (doc.subject || []).slice(0, 8)
      });
    }
    await fs.writeFile(file, JSON.stringify(cache, null, 2) + '\n');
    console.log(`Catalog: ${Math.min(offset + 10, pending.length)}/${pending.length}; ${Object.values(cache.books).filter(x => x.pageCount).length} page counts cached`);
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
}
if (require.main === module) main().catch(error => { console.error(error.message, error.cause?.message || ""); process.exitCode = 1; });
module.exports = { scoreMatch, categoryFor };
