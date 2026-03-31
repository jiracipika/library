'use client';
import { useState } from 'react';
import Link from 'next/link';

interface WishlistBook { id: string; title: string; author: string; cover: string; genre: string; priority: 'high' | 'medium' | 'low'; }

const MOCK_WISHLIST: WishlistBook[] = [
  { id: 'w1', title: 'The Midnight Library', author: 'Matt Haig', cover: '🌙', genre: 'Fiction', priority: 'high' },
  { id: 'w2', title: 'Norwegian Wood', author: 'Haruki Murakami', cover: '🌲', genre: 'Fiction', priority: 'medium' },
  { id: 'w3', title: 'The Design of Everyday Things', author: 'Don Norman', cover: '🎨', genre: 'Design', priority: 'high' },
  { id: 'w4', title: 'Clean Code', author: 'Robert C. Martin', cover: '🧹', genre: 'Tech', priority: 'medium' },
  { id: 'w5', title: 'Meditations', author: 'Marcus Aurelius', cover: '🏛️', genre: 'Philosophy', priority: 'low' },
  { id: 'w6', title: 'The Name of the Wind', author: 'Patrick Rothfuss', cover: '🎵', genre: 'Fantasy', priority: 'high' },
];

const PRIORITY_COLORS: Record<string, string> = { high: 'var(--ios-red)', medium: 'var(--ios-orange)', low: 'var(--ios-green)' };

export default function Wishlist() {
  const [books, setBooks] = useState(MOCK_WISHLIST);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const add = () => {
    if (!title) return;
    setBooks([{ id: `w${Date.now()}`, title, author: author || 'Unknown', cover: '📖', genre: 'Fiction', priority: 'medium' }, ...books]);
    setShowAdd(false); setTitle(''); setAuthor('');
  };

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Wishlist</h1>
            <p style={{ fontSize: 15, color: 'var(--ios-label3)' }}>{books.length} books to read</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-blue)', color: '#fff', transition: 'transform 150ms ease, opacity 150ms ease' }}>+ Add</button>
        </div>

        {showAdd && (
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20, display: 'flex', gap: 8 }}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ flex: 2, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }} />
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)' }} />
            <button onClick={add} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>Add</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {books.map(b => (
            <div key={b.id} style={{ padding: 16, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 64, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{b.cover}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)' }}>{b.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ios-label3)' }}>{b.author} &middot; {b.genre}</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[b.priority], background: `${PRIORITY_COLORS[b.priority]}15` }}>{b.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
