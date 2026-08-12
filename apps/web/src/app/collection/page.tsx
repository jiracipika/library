'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import booksData from '@/lib/books';

type BookStatus = 'reading' | 'read' | 'wishlist';
interface Book {
  id: string; title: string; author: string; cover: string; status: BookStatus;
  rating: number; progress: number; startDate: string; finishDate?: string;
  notes: string; genre: string; pages: number;
}

const books = booksData.books as readonly Book[];
const TABS = ['All', 'Reading', 'Read', 'Wishlist'] as const;
type Tab = typeof TABS[number];

export default function Collection() {
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return books.filter((book) => {
      if (tab !== 'All' && book.status !== tab.toLowerCase()) return false;
      const searchable = `${book.title} ${book.author} ${book.genre}`.toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [search, tab]);

  const stats = {
    reading: books.filter((book) => book.status === 'reading').length,
    read: books.filter((book) => book.status === 'read').length,
    wishlist: books.filter((book) => book.status === 'wishlist').length,
    pagesRead: books.filter((book) => book.status === 'read').reduce((sum, book) => sum + book.pages, 0),
  };

  return (
    <main style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>My Library</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 16 }}>
          {stats.reading} reading · {stats.read} read · {stats.wishlist} wishlist · {stats.pagesRead} pages
        </p>

        <label htmlFor="book-search" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Search your library</label>
        <input id="book-search" type="search" placeholder="Title, author, or genre" value={search} onChange={(event) => setSearch(event.target.value)} style={{
          width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--ios-separator)',
          fontSize: 16, background: 'var(--ios-bg2)', color: 'var(--ios-label)', marginBottom: 16,
        }} />

        <div role="tablist" aria-label="Filter books by reading status" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {TABS.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} style={{
              minHeight: 44, padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: tab === item ? 'var(--ios-label)' : 'var(--ios-bg2)', color: tab === item ? 'var(--ios-bg2)' : 'var(--ios-label2)',
            }}>{item}</button>
          ))}
        </div>

        <p aria-live="polite" style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 10 }}>
          {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
        </p>
        {filtered.length === 0 ? (
          <div role="status" style={{ padding: 24, borderRadius: 16, textAlign: 'center', background: 'var(--ios-bg2)', color: 'var(--ios-label2)' }}>
            No books match your search and filter.
          </div>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
            {filtered.map((book) => (
              <li key={book.id}>
                <Link href={`/collection/${book.id}`} aria-label={`View ${book.title} by ${book.author}`} style={{ padding: 16, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', gap: 16 }}>
                  <div aria-hidden="true" style={{ flex: '0 0 56px', width: 56, height: 80, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{book.cover}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 2 }}>{book.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 6 }}>{book.author} · {book.genre} · {book.pages}p</div>
                    {book.status === 'reading' && <progress aria-label={`${book.progress}% read`} max={100} value={book.progress} style={{ width: '100%', accentColor: 'var(--ios-blue)' }}>{book.progress}%</progress>}
                    {book.status === 'read' && <span aria-label={`${book.rating} out of 5 stars`} style={{ color: '#9A6700', fontSize: 14 }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>}
                    {book.status === 'wishlist' && <span style={{ fontSize: 12, color: 'var(--ios-orange)', fontWeight: 600 }}>Want to read</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
