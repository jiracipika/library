/** @typedef {'reading' | 'read' | 'wishlist'} BookStatus */

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} cover
 * @property {BookStatus} status
 * @property {number} rating
 * @property {number} progress
 * @property {string} startDate
 * @property {string=} finishDate
 * @property {string} notes
 * @property {string} genre
 * @property {number} pages
 */

/** @type {ReadonlyArray<Readonly<Book>>} */
const books = Object.freeze([
  { id: 'b1', title: 'Project Hail Mary', author: 'Andy Weir', cover: '🚀', status: 'reading', rating: 5, progress: 67, startDate: 'Mar 20', genre: 'Sci-Fi', pages: 476, notes: 'Amazing so far!' },
  { id: 'b2', title: 'Atomic Habits', author: 'James Clear', cover: '🔵', status: 'read', rating: 4, progress: 100, startDate: 'Mar 10', finishDate: 'Mar 18', genre: 'Self-Help', pages: 320, notes: 'Practical advice' },
  { id: 'b3', title: 'Dune', author: 'Frank Herbert', cover: '🏜️', status: 'read', rating: 5, progress: 100, startDate: 'Feb 28', finishDate: 'Mar 8', genre: 'Sci-Fi', pages: 688, notes: 'Masterpiece' },
  { id: 'b4', title: 'The Midnight Library', author: 'Matt Haig', cover: '🌙', status: 'wishlist', rating: 0, progress: 0, startDate: '', genre: 'Fiction', pages: 288, notes: '' },
  { id: 'b5', title: 'Sapiens', author: 'Yuval Noah Harari', cover: '🌍', status: 'read', rating: 4, progress: 100, startDate: 'Feb 15', finishDate: 'Feb 27', genre: 'History', pages: 443, notes: 'Eye-opening' },
  { id: 'b6', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', cover: '💻', status: 'reading', rating: 5, progress: 42, startDate: 'Mar 25', genre: 'Tech', pages: 352, notes: 'Great for fundamentals' },
  { id: 'b7', title: 'Norwegian Wood', author: 'Haruki Murakami', cover: '🌲', status: 'wishlist', rating: 0, progress: 0, startDate: '', genre: 'Fiction', pages: 296, notes: '' },
  { id: 'b8', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', cover: '🧠', status: 'read', rating: 3, progress: 100, startDate: 'Jan 20', finishDate: 'Feb 14', genre: 'Psychology', pages: 499, notes: 'Dense but worthwhile' },
]);

/** @param {unknown} id @returns {Readonly<Book> | undefined} */
function getBookById(id) {
  return typeof id === 'string' && id.length > 0 ? books.find((book) => book.id === id) : undefined;
}

/** @param {string} query @returns {ReadonlyArray<Readonly<Book>>} */
function searchBooks(query) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return books;

  return books.filter((book) => {
    const searchable = `${book.title} ${book.author} ${book.genre}`.toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}

module.exports = { books, getBookById, searchBooks };
