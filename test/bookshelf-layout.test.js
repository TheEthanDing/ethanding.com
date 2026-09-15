const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRows, paginateRows, monthKey, periodKey, periodLabel } = require('../assets/bookshelf-layout');
const books = require('../data/books.json');
const metadata = require('../data/book-metadata.json').books;
const appearances = require('../data/book-appearance.json');
const collection = books.map(book => ({ ...book, meta: metadata[book.id], appearance: appearances[book.id] }))
  .sort((a, b) => (b.dateFinished || '').localeCompare(a.dateFinished || ''));
const unpack = rows => rows.flatMap(row => row.items.map(item => item.book.id));

test('quarter labels and undated books do not invent reading dates', () => {
  assert.equal(periodKey({ dateFinished: '2026-08-06' }), '2026-Q3');
  assert.equal(periodLabel('2026-Q3'), 'Jul–Sep 2026');
  assert.equal(periodLabel('2025-Q4'), 'Oct–Dec 2025');
  for (const dateFinished of ['', undefined, '2026-13-01']) {
    assert.equal(monthKey({ dateFinished }), '');
    assert.equal(periodKey({ dateFinished }), 'undated');
  }
  assert.equal(periodLabel('undated'), 'Date not recorded');
});

for (const width of [240, 289, 327, 480, 687, 942]) {
  test(`four-row sections preserve every book in order at ${width}px`, () => {
    const small = width < 600;
    const rows = buildRows(collection, { width, small });
    const pages = paginateRows(rows);
    assert.deepEqual(unpack(rows), collection.map(book => book.id));
    assert.ok(pages.length > 1);
    assert.ok(pages.every(page => page.length > 0 && page.length <= 4));
    assert.ok(pages.slice(0, -1).every(page => page.length === 4));
    for (const [i, row] of rows.entries()) {
      assert.ok(row.used <= width - (small ? 24 : 48), `row ${i} overflows: ${row.used}`);
      assert.ok(row.items.every(item => periodKey(item.book) === row.period));
      assert.equal(row.continuation, Boolean(i && rows[i - 1].period === row.period));
      row.items.forEach((item, j) => {
        const expected = j === 0 || monthKey(row.items[j - 1].book) !== monthKey(item.book);
        assert.equal(item.monthStart, expected ? monthKey(item.book) : '');
      });
    }
  });
}

test('alphabetical browsing preserves sort order without misleading month or quarter markers', () => {
  const sorted = [...collection].sort((a, b) => a.title.localeCompare(b.title));
  const rows = buildRows(sorted, { width: 942, chronological: false });
  assert.deepEqual(unpack(rows), sorted.map(book => book.id));
  assert.ok(rows.every(row => row.period === '' && row.items.every(item => !item.monthStart)));
});

test('sparse quarters remain distinct; dense quarters continue without dropping books', () => {
  const sparse = [{ id: 'aug', dateFinished: '2026-08-06' }, { id: 'jun', dateFinished: '2026-06-01' }];
  const rows = buildRows(sparse, { width: 942 });
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map(row => row.period), ['2026-Q3', '2026-Q2']);
  const dense = Array.from({ length: 90 }, (_, i) => ({ id: `${i}`, dateFinished: '2026-08-06', meta: { pageCount: 1500 } }));
  const packed = buildRows(dense, { width: 289, small: true });
  assert.deepEqual(unpack(packed), dense.map(book => book.id));
  assert.ok(packed.slice(1).every(row => row.continuation));
  assert.ok(packed.every(row => row.used <= 265));
});

test('empty and one-book results are well-defined', () => {
  assert.deepEqual(paginateRows(buildRows([], { width: 942 })), []);
  const pages = paginateRows(buildRows([collection[0]], { width: 240, small: true }));
  assert.equal(pages.length, 1);
  assert.deepEqual(unpack(pages[0]), [collection[0].id]);
});
