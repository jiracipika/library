import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book, WishlistItem, LendingItem } from './types';
import { SEED_BOOKS, SEED_WISHLIST, SEED_LENDING } from './data';

const KEYS = {
  books: '@library/books',
  wishlist: '@library/wishlist',
  lending: '@library/lending',
  seeded: '@library/seeded',
};

async function ensureSeeded() {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (!seeded) {
    await AsyncStorage.setItem(KEYS.books, JSON.stringify(SEED_BOOKS));
    await AsyncStorage.setItem(KEYS.wishlist, JSON.stringify(SEED_WISHLIST));
    await AsyncStorage.setItem(KEYS.lending, JSON.stringify(SEED_LENDING));
    await AsyncStorage.setItem(KEYS.seeded, '1');
  }
}

// Books
export async function getBooks(): Promise<Book[]> {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(KEYS.books);
  return raw ? JSON.parse(raw) : [];
}

export async function saveBooks(books: Book[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.books, JSON.stringify(books));
}

export async function addBook(book: Book): Promise<Book[]> {
  const books = await getBooks();
  const updated = [...books, book];
  await saveBooks(updated);
  return updated;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book[]> {
  const books = await getBooks();
  const updated = books.map((b) => (b.id === id ? { ...b, ...updates } : b));
  await saveBooks(updated);
  return updated;
}

export async function deleteBook(id: string): Promise<Book[]> {
  const books = await getBooks();
  const updated = books.filter((b) => b.id !== id);
  await saveBooks(updated);
  return updated;
}

// Wishlist
export async function getWishlist(): Promise<WishlistItem[]> {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(KEYS.wishlist);
  return raw ? JSON.parse(raw) : [];
}

export async function saveWishlist(items: WishlistItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.wishlist, JSON.stringify(items));
}

export async function addWishlistItem(item: WishlistItem): Promise<WishlistItem[]> {
  const items = await getWishlist();
  const updated = [...items, item];
  await saveWishlist(updated);
  return updated;
}

export async function deleteWishlistItem(id: string): Promise<WishlistItem[]> {
  const items = await getWishlist();
  const updated = items.filter((i) => i.id !== id);
  await saveWishlist(updated);
  return updated;
}

// Lending
export async function getLending(): Promise<LendingItem[]> {
  await ensureSeeded();
  const raw = await AsyncStorage.getItem(KEYS.lending);
  return raw ? JSON.parse(raw) : [];
}

export async function saveLending(items: LendingItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.lending, JSON.stringify(items));
}

export async function addLendingItem(item: LendingItem): Promise<LendingItem[]> {
  const items = await getLending();
  const updated = [...items, item];
  await saveLending(updated);
  return updated;
}

export async function markReturned(id: string): Promise<LendingItem[]> {
  const items = await getLending();
  const updated = items.map((i) => (i.id === id ? { ...i, returned: true } : i));
  await saveLending(updated);
  return updated;
}

export async function deleteLendingItem(id: string): Promise<LendingItem[]> {
  const items = await getLending();
  const updated = items.filter((i) => i.id !== id);
  await saveLending(updated);
  return updated;
}
