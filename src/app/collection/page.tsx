'use client';
import { useState, from 'react';
import Link from 'next/link';

interface Book {
  id: string; title: string; author: string; cover: string; status: 'reading' | 'read' | 'wishlist';
  rating: number; progress: number; startDate: string; finishDate?: string; notes: string; genre: string; pages: number;
}

const MOCK_BOOKS: Book[] = [
  { id: 'b1', title: 'Project Hail Mary', author: 'Andy Weir', cover: '🚀', status: 'reading', rating: 5, progress: 67, startDate: 'Mar 20', genre: 'Sci-Fi', pages: 476, notes: 'Amazing so far!' },
  { id: 'b2', title: 'Atomic Habits', author: 'James Clear', cover: '🔵', status: 'read', rating: 4, progress: 100, startDate: 'Mar 10', finishDate: 'Mar 18', genre: 'Self-Help', pages: 320, notes: 'Practical advice' },
  { id: 'b3', title: 'Dune', author: 'Frank Herbert', cover: '🏜️', status: 'read', rating: 5, progress: 100, startDate: 'Feb 28', finishDate: 'Mar 8', genre: 'Sci-Fi', pages: 688, notes: 'Masterpiece' },
  { id: 'b4', title: 'The Midnight Library', author: 'Matt Haig', cover: '🌙', status: 'wishlist', rating: 0, progress: 0, startDate: '', genre: 'Fiction', pages: 288, notes: '' },
  { id: 'b5', title: 'Sapiens', author: 'Yuval Noah Harari', cover: '🌍', status: 'read', rating: 4, progress: 100, startDate: 'Feb 15', finishDate: 'Feb 27', genre: 'History', pages: 443, notes: 'Eye-opening' },
  { id: 'b6', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', cover: '💻', status: 'reading', rating: 5, progress: 42, startDate: 'Mar 25', genre: 'Tech', pages: 352, notes: 'Great for fundamentals' },
  { id: 'b7', title: 'Norwegian Wood', author: 'Haruki Murakami', cover: '🌲', status: 'wishlist', rating: 0, progress: 0, startDate: '', genre: 'Fiction', pages: 296, notes: '' },
  { id: 'b8', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', cover: '🧠', status: 'read', rating: 3, progress: 100, startDate: 'Jan 20', finishDate: 'Feb 14', genre: 'Psychology', pages: 499, notes: 'Dense but worthwhile' },
];

const TABS = ['All', 'Reading', 'Read', 'Wishlist'] as const;
type Tab = typeof TABS[number];

export default function Collection() {
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_BOOKS.filter(b => {
    if (tab !== 'All' && b.status !== tab.toLowerCase()) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    reading: MOCK_BOOKS.filter(b => b.status === 'reading').length,
    read: MOCK_BOOKS.filter(b => b.status === 'read').length,
    wishlist: MOCK_BOOKS.filter(b => b.status === 'wishlist').length,
    pagesRead: MOCK_BOOKS.filter(b => b.status === 'read').reduce((s, b) => s + b.pages, 0),
  };

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>My Library</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 16 }}>
          {stats.reading} reading &middot; {stats.read} read &middot; {stats.wishlist} wishlist &middot; {stats.pagesRead} pages
        </p>

        <input type="text" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} style={{
          width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--ios-separator)',
          fontSize: 15, background: 'var(--ios-bg2)', color: 'var(--ios-label)', marginBottom: 16, outline: 'none',
        }} />

        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--ios-label)' : 'var(--ios-bg2)', color: tab === t ? '#fff' : 'var(--ios-label2)',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(book => (
            <div key={book.id} style={{ padding: 16, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', gap: 16 }}>
              <div style={{ width: 56, height: 80, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{book.cover}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 2 }}>{book.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 6 }}>{book.author} &middot; {book.genre} &middot; {book.pages}p</div>
                {book.status === 'reading' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--ios-label3)' }}>Progress</span>
                      <span style={{ fontWeight: 600, color: 'var(--ios-blue)' }}>{book.progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--ios-bg)' }}>
                      <div style={{ width: `${book.progress}%`, height: '100%', borderRadius: 2, background: 'var(--ios-blue)' }} />
                    </div>
                  </div>
                )}
                {book.status === 'read' && (
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} style={{ fontSize: 14, color: i < book.rating ? '#FFD700' : 'var(--ios-separator)' }}>★</span>
                    ))}
                  </div>
                )}
                {book.status === 'wishlist' && (
                  <span style={{ fontSize: 12, color: 'var(--ios-orange)', fontWeight: 500 }}>Want to read</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
