export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  status: 'reading' | 'read';
  rating: number;
  progress: number;
  startDate: string;
  finishDate?: string;
  notes: string;
  genre: string;
  pages: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  priority: 'high' | 'medium' | 'low';
  addedDate: string;
}

export interface LendingItem {
  id: string;
  bookTitle: string;
  borrower: string;
  lentDate: string;
  dueDate: string;
  returned: boolean;
}
