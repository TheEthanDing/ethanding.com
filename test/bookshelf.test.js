const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreMatch, categoryFor } = require('../scripts/enrich-books.cjs');
const books = require('../data/books.json');
const metadata = require('../data/book-metadata.json').books;
const appearances = require('../data/book-appearance.json');

test('catalog matching rejects another author and a related but different title', () => {
  const book = { title: 'The Little Kingdom', authors: ['Michael Moritz'] };
  assert.ok(scoreMatch(book, { title: 'The Little Kingdom', author_name: ['Michael Moritz'] }) > 0);
  assert.equal(scoreMatch(book, { title: 'The Little Kingdom', author_name: ['A Different Author'] }), 0);
  assert.equal(scoreMatch(book, { title: 'Return to the Little Kingdom: Steve Jobs', author_name: ['Michael Moritz'] }), 0);
  assert.equal(scoreMatch({ title: 'The Case Against Education', authors: ['Cixin Liu'] }, { title: 'The Case Against Education', author_name: ['Bryan Caplan'] }), 0);
});

test('missing authors require an exact catalog title', () => {
  assert.ok(scoreMatch({ title: 'Creativity Inc', authors: [] }, { title: 'Creativity, Inc.', author_name: ['Ed Catmull'] }) > 0);
  assert.equal(scoreMatch({ title: 'Creativity', authors: [] }, { title: 'Creativity Inc', author_name: ['Ed Catmull'] }), 0);
});

test('cached sizes are sourced and cover geometry refers to the current cover', () => {
  for (const book of books) {
    const meta = metadata[book.id];
    if (meta?.pageCount) {
      assert.ok(Number.isInteger(meta.pageCount) && meta.pageCount > 0, book.title);
      assert.match(meta.source, /^https:\/\/openlibrary\.org\/works\/OL\d+W$/, book.title);
      assert.equal(meta.lookupTitle, book.title);
    }
    if (appearances[book.id]) {
      assert.equal(appearances[book.id].cover, book.cover);
      assert.ok(appearances[book.id].ratio > 0);
      assert.match(appearances[book.id].color, /^#[0-9a-f]{6}$/);
    }
  }
});

test('catalog matching rejects workbooks and classification uses leading subjects', () => {
  assert.equal(scoreMatch({ title: 'Designing Your Life', authors: ['Bill Burnett'] }, { title: 'The Designing Your Life Workbook', author_name: ['Bill Burnett'], number_of_pages_median: 144 }), 0);
  assert.equal(categoryFor(['Biography', 'McDonalds Corporation', 'Fiction, general']), 'Biography');
  assert.equal(categoryFor(['Science fiction', 'Space exploration']), 'Fiction');
});
