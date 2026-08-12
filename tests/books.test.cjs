const test = require('node:test');
const assert = require('node:assert/strict');

const { getBookById, searchBooks } = require('../apps/web/src/lib/books.js');

test('getBookById returns the matching catalog record', () => {
  assert.equal(getBookById('b3')?.title, 'Dune');
});

test('getBookById rejects unknown and malformed identifiers', () => {
  assert.equal(getBookById('missing'), undefined);
  assert.equal(getBookById(''), undefined);
  assert.equal(getBookById(undefined), undefined);
});

test('searchBooks normalizes whitespace and matches title, author, and genre', () => {
  assert.deepEqual(searchBooks('  project   hail  ').map((book) => book.id), ['b1']);
  assert.deepEqual(searchBooks('murakami').map((book) => book.id), ['b7']);
  assert.deepEqual(searchBooks('sci-fi').map((book) => book.id), ['b1', 'b3']);
});
