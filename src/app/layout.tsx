import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Track your books, movies, and games. Rate, review, and discover what to experience next.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
