import Link from 'next/link';
import { notFound } from 'next/navigation';
import booksData from '@/lib/books';

type Book = {
  id: string; title: string; author: string; cover: string; status: 'reading' | 'read' | 'wishlist';
  rating: number; progress: number; startDate: string; finishDate?: string; notes: string; genre: string; pages: number;
};
const books = booksData.books as readonly Book[];

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const book = books.find((item) => item.id === params.id);
  if (!book) notFound();

  return (
    <main style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <article style={{ maxWidth: 680, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/collection" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 24, display: 'inline-block' }}>← Library</Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div aria-hidden="true" style={{ width: 120, height: 176, borderRadius: 16, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, boxShadow: 'var(--ios-shadow)' }}>{book.cover}</div>
          <div style={{ flex: '1 1 300px' }}>
            <p style={{ color: 'var(--ios-label3)', fontSize: 14, marginBottom: 6 }}>{book.genre}</p>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--ios-label)', marginBottom: 6 }}>{book.title}</h1>
            <p style={{ fontSize: 17, color: 'var(--ios-label2)', marginBottom: 20 }}>by {book.author}</p>
            <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 18px', padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
              <dt style={{ color: 'var(--ios-label3)' }}>Status</dt><dd style={{ textTransform: 'capitalize', fontWeight: 600 }}>{book.status === 'wishlist' ? 'Want to read' : book.status}</dd>
              <dt style={{ color: 'var(--ios-label3)' }}>Length</dt><dd>{book.pages} pages</dd>
              {book.startDate && <><dt style={{ color: 'var(--ios-label3)' }}>Started</dt><dd>{book.startDate}</dd></>}
              {book.finishDate && <><dt style={{ color: 'var(--ios-label3)' }}>Finished</dt><dd>{book.finishDate}</dd></>}
              {book.status === 'reading' && <><dt style={{ color: 'var(--ios-label3)' }}>Progress</dt><dd><progress aria-label={`${book.progress}% read`} max={100} value={book.progress}>{book.progress}%</progress> <span>{book.progress}%</span></dd></>}
              {book.rating > 0 && <><dt style={{ color: 'var(--ios-label3)' }}>Rating</dt><dd aria-label={`${book.rating} out of 5 stars`} style={{ color: '#9A6700' }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</dd></>}
            </dl>
          </div>
        </div>
        {book.notes && <section aria-labelledby="notes-heading" style={{ marginTop: 24, padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}><h2 id="notes-heading" style={{ fontSize: 18, marginBottom: 8 }}>Notes</h2><p style={{ color: 'var(--ios-label2)', lineHeight: 1.5 }}>{book.notes}</p></section>}
      </article>
    </main>
  );
}
