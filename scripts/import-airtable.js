const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BOOKS_DIR = path.join(ROOT, 'images', 'books');
const DATA_PATH = path.join(ROOT, 'data', 'books.json');
let existingCovers = new Map();

const contentTypeExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function cleanFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

async function downloadCover(record) {
  if (existingCovers.has(record.id)) return `/images/books/${existingCovers.get(record.id)}`;
  const attachment = record.fields.cover?.[0];
  if (!attachment?.url) return '';

  const response = await fetch(attachment.url);
  if (!response.ok) throw new Error(`Cover download failed (${response.status}) for ${record.id}`);

  const type = (response.headers.get('content-type') || '').split(';')[0];
  const extension = contentTypeExtensions[type] || path.extname(new URL(attachment.url).pathname) || '.jpg';
  const title = cleanFileName(record.fields.Book || 'book');
  const fileName = `${record.id}-${title}${extension}`;
  await fs.writeFile(path.join(BOOKS_DIR, fileName), Buffer.from(await response.arrayBuffer()));
  return `/images/books/${fileName}`;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        console.warn(error.message);
        results[index] = '';
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

async function main() {
  const pagePaths = process.argv.slice(2);
  if (!pagePaths.length) throw new Error('Pass one or more Airtable export page files.');

  await fs.mkdir(BOOKS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  existingCovers = new Map((await fs.readdir(BOOKS_DIR)).map((file) => [file.split('-')[0], file]));

  const pages = await Promise.all(pagePaths.map(async (file) => JSON.parse(await fs.readFile(file, 'utf8'))));
  const records = pages.flatMap((page) => page.records || []).filter((record) => (record.fields.Book || '').trim());
  const covers = await mapLimit(records, 8, downloadCover);

  const books = records.map((record, index) => ({
    id: record.id,
    title: (record.fields.Book || '').trim(),
    authors: Array.isArray(record.fields.Author) ? record.fields.Author : [],
    categories: Array.isArray(record.fields.Category) ? record.fields.Category : [],
    sagas: Array.isArray(record.fields.Saga) ? record.fields.Saga : [],
    dateStarted: record.fields['Date Started'] || '',
    dateFinished: record.fields['Date Finished'] || '',
    daysTaken: Number.isFinite(record.fields['Days Taken']) ? record.fields['Days Taken'] : null,
    rating: Number.isFinite(record.fields.Rating) ? record.fields.Rating : null,
    notes: record.fields.Notes || '',
    owned: record.fields['Owned?'] === true,
    cover: covers[index],
  })).sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));

  await fs.writeFile(DATA_PATH, `${JSON.stringify(books, null, 2)}\n`);
  console.log(`Imported ${books.length} books with ${covers.filter(Boolean).length} local covers.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
