import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors, fonts, radius, shadow } from '../../lib/theme';
import { getBooks, addBook, deleteBook } from '../../lib/storage';
import type { Book } from '../../lib/types';

type Filter = 'all' | 'reading' | 'read';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'read', label: 'Read' },
];

const COVERS = ['📚', '🔵', '🚀', '🌙', '🌍', '💻', '🧠', '🎨', '🏛️', '🎵', '🌲', '🏜️', '🔴', '🟢', '🟡'];
const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Tech', 'Self-Help', 'History', 'Psychology', 'Philosophy', 'Design', 'Other'];

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange?.(s)} disabled={!onChange}>
          <Ionicons
            name={s <= rating ? 'star' : 'star-outline'}
            size={onChange ? 22 : 13}
            color={s <= rating ? colors.yellow : colors.label4}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BookCard({ book, onDelete }: { book: Book; onDelete: (id: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cover}>{book.cover}</Text>
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{book.title}</Text>
          <TouchableOpacity onPress={() => onDelete(book.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={colors.label4} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.genreBadge, { backgroundColor: colors.indigo + '15' }]}>
            <Text style={[styles.genreText, { color: colors.indigo }]}>{book.genre}</Text>
          </View>
          <Text style={styles.pagesText}>{book.pages} pp</Text>
        </View>
        {book.status === 'reading' ? (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${book.progress}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{book.progress}%</Text>
          </View>
        ) : (
          <StarRating rating={book.rating} />
        )}
      </View>
    </View>
  );
}

export default function CollectionScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    author: '',
    cover: '📚',
    genre: 'Fiction',
    pages: '',
    status: 'reading' as 'reading' | 'read',
    rating: 4,
    progress: 0,
  });

  useFocusEffect(
    useCallback(() => {
      getBooks().then(setBooks);
    }, [])
  );

  const filtered = books.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch =
      search === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function handleDelete(id: string) {
    Alert.alert('Remove book?', 'This will delete it from your collection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteBook(id);
          setBooks(updated);
        },
      },
    ]);
  }

  async function handleAdd() {
    if (!form.title.trim() || !form.author.trim()) return;
    const newBook: Book = {
      id: Date.now().toString(),
      title: form.title.trim(),
      author: form.author.trim(),
      cover: form.cover,
      genre: form.genre,
      pages: parseInt(form.pages) || 300,
      status: form.status,
      rating: form.status === 'read' ? form.rating : 0,
      progress: form.status === 'reading' ? form.progress : 100,
      startDate: new Date().toISOString().split('T')[0],
      finishDate: form.status === 'read' ? new Date().toISOString().split('T')[0] : undefined,
      notes: '',
    };
    const updated = await addBook(newBook);
    setBooks(updated);
    setShowAdd(false);
    setForm({ title: '', author: '', cover: '📚', genre: 'Fiction', pages: '', status: 'reading', rating: 4, progress: 0 });
  }

  const readCount = books.filter((b) => b.status === 'read').length;
  const readingCount = books.filter((b) => b.status === 'reading').length;
  const totalPages = books.filter((b) => b.status === 'read').reduce((s, b) => s + b.pages, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Collection</Text>
          <Text style={styles.subtitle}>{readCount} read · {readingCount} in progress · {totalPages.toLocaleString()} pages</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.label3} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books…"
          placeholderTextColor={colors.label3}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => <BookCard book={item} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No books here yet</Text>
          </View>
        }
      />

      {/* Add Book Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Book</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.modalDone, (!form.title || !form.author) && { opacity: 0.4 }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Book title"
                  placeholderTextColor={colors.label3}
                  value={form.title}
                  onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
                />
                <Text style={styles.formLabel}>Author</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Author name"
                  placeholderTextColor={colors.label3}
                  value={form.author}
                  onChangeText={(t) => setForm((f) => ({ ...f, author: t }))}
                />
                <Text style={styles.formLabel}>Pages</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Number of pages"
                  placeholderTextColor={colors.label3}
                  keyboardType="number-pad"
                  value={form.pages}
                  onChangeText={(t) => setForm((f) => ({ ...f, pages: t }))}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Cover Emoji</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                    {COVERS.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.emojiBtn, form.cover === c && styles.emojiBtnActive]}
                        onPress={() => setForm((f) => ({ ...f, cover: c }))}
                      >
                        <Text style={{ fontSize: 24 }}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.formLabel}>Genre</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                    {GENRES.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genreBtn, form.genre === g && styles.genreBtnActive]}
                        onPress={() => setForm((f) => ({ ...f, genre: g }))}
                      >
                        <Text style={[styles.genreBtnText, form.genre === g && styles.genreBtnTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.segmentRow}>
                  {(['reading', 'read'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.segment, form.status === s && styles.segmentActive]}
                      onPress={() => setForm((f) => ({ ...f, status: s }))}
                    >
                      <Text style={[styles.segmentText, form.status === s && styles.segmentTextActive]}>
                        {s === 'reading' ? 'Reading' : 'Finished'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.status === 'read' && (
                  <View>
                    <Text style={styles.formLabel}>Rating</Text>
                    <StarRating rating={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontFamily: fonts.bold, color: colors.label, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colors.label3, marginTop: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.label,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.fill,
  },
  filterTabActive: { backgroundColor: colors.blue },
  filterLabel: { fontSize: 13, fontFamily: fonts.medium, color: colors.label3 },
  filterLabelActive: { color: '#fff' },

  list: { paddingHorizontal: 20, paddingBottom: 32 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    ...shadow.sm,
  },
  cover: { fontSize: 42, lineHeight: 50 },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: colors.label, marginRight: 8 },
  cardAuthor: { fontSize: 13, fontFamily: fonts.regular, color: colors.label3, marginTop: 1, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  genreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  genreText: { fontSize: 11, fontFamily: fonts.semibold },
  pagesText: { fontSize: 12, fontFamily: fonts.regular, color: colors.label3 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.blue, borderRadius: radius.full },
  progressLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.label3, width: 30 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: fonts.regular, color: colors.label3 },

  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.card },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  modalTitle: { fontSize: 17, fontFamily: fonts.semibold, color: colors.label },
  modalCancel: { fontSize: 17, fontFamily: fonts.regular, color: colors.blue },
  modalDone: { fontSize: 17, fontFamily: fonts.semibold, color: colors.blue },
  modalScroll: { flex: 1 },
  formSection: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  formLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.label3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.label,
    marginBottom: 4,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: { backgroundColor: colors.blue + '25', borderWidth: 2, borderColor: colors.blue },
  genreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.fill,
  },
  genreBtnActive: { backgroundColor: colors.indigo },
  genreBtnText: { fontSize: 13, fontFamily: fonts.medium, color: colors.label3 },
  genreBtnTextActive: { color: '#fff' },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: 12,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: radius.sm - 1, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.card, ...shadow.sm },
  segmentText: { fontSize: 14, fontFamily: fonts.medium, color: colors.label3 },
  segmentTextActive: { color: colors.label },
});
