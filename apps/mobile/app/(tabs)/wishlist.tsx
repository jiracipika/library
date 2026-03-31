import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors, fonts, radius, shadow } from '../../lib/theme';
import { getWishlist, addWishlistItem, deleteWishlistItem } from '../../lib/storage';
import type { WishlistItem } from '../../lib/types';

const PRIORITY_CONFIG = {
  high: { label: 'High', color: colors.red, bg: colors.red + '15' },
  medium: { label: 'Medium', color: colors.orange, bg: colors.orange + '15' },
  low: { label: 'Low', color: colors.green, bg: colors.green + '15' },
};

const COVERS = ['📚', '🔵', '🚀', '🌙', '🌍', '💻', '🧠', '🎨', '🏛️', '🎵', '🌲', '🏜️', '🔴', '🟢', '🟡'];
const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Tech', 'Self-Help', 'History', 'Psychology', 'Philosophy', 'Design', 'Other'];

function WishCard({ item, onDelete }: { item: WishlistItem; onDelete: (id: string) => void }) {
  const p = PRIORITY_CONFIG[item.priority];
  return (
    <View style={styles.card}>
      <Text style={styles.cover}>{item.cover}</Text>
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={colors.label4} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardAuthor}>{item.author}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.indigo + '15' }]}>
            <Text style={[styles.badgeText, { color: colors.indigo }]}>{item.genre}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: p.bg }]}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function WishlistScreen() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    cover: '📚',
    genre: 'Fiction',
    priority: 'high' as 'high' | 'medium' | 'low',
  });

  useFocusEffect(
    useCallback(() => {
      getWishlist().then(setItems);
    }, [])
  );

  async function handleDelete(id: string) {
    Alert.alert('Remove from wishlist?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteWishlistItem(id);
          setItems(updated);
        },
      },
    ]);
  }

  async function handleAdd() {
    if (!form.title.trim() || !form.author.trim()) return;
    const item: WishlistItem = {
      id: Date.now().toString(),
      title: form.title.trim(),
      author: form.author.trim(),
      cover: form.cover,
      genre: form.genre,
      priority: form.priority,
      addedDate: new Date().toISOString().split('T')[0],
    };
    const updated = await addWishlistItem(item);
    setItems(updated);
    setShowAdd(false);
    setForm({ title: '', author: '', cover: '📚', genre: 'Fiction', priority: 'high' });
  }

  const byPriority = {
    high: items.filter((i) => i.priority === 'high'),
    medium: items.filter((i) => i.priority === 'medium'),
    low: items.filter((i) => i.priority === 'low'),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Wishlist</Text>
          <Text style={styles.subtitle}>{items.length} book{items.length !== 1 ? 's' : ''} to read</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <WishCard item={item} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.prioritySummary}>
              {(['high', 'medium', 'low'] as const).map((p) => (
                <View key={p} style={styles.priorityStat}>
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_CONFIG[p].color }]} />
                  <Text style={styles.priorityCount}>{byPriority[p].length}</Text>
                  <Text style={styles.priorityLabel}>{PRIORITY_CONFIG[p].label}</Text>
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>Add a book</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add to Wishlist</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.modalDone, (!form.title || !form.author) && { opacity: 0.4 }]}>Add</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Cover Emoji</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4, marginBottom: 8 }}>
                    {GENRES.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genreBtn, form.genre === g && styles.genreBtnActive]}
                        onPress={() => setForm((f) => ({ ...f, genre: g }))}
                      >
                        <Text style={[styles.genreBtnText, form.genre === g && { color: '#fff' }]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.formLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityBtn,
                        { borderColor: PRIORITY_CONFIG[p].color + '50' },
                        form.priority === p && { backgroundColor: PRIORITY_CONFIG[p].bg, borderColor: PRIORITY_CONFIG[p].color },
                      ]}
                      onPress={() => setForm((f) => ({ ...f, priority: p }))}
                    >
                      <View style={[styles.dot, { backgroundColor: PRIORITY_CONFIG[p].color }]} />
                      <Text style={[styles.priorityBtnText, { color: PRIORITY_CONFIG[p].color }]}>
                        {PRIORITY_CONFIG[p].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  prioritySummary: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    gap: 0,
    ...shadow.sm,
  },
  priorityStat: { flex: 1, alignItems: 'center', gap: 4 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityCount: { fontSize: 20, fontFamily: fonts.bold, color: colors.label },
  priorityLabel: { fontSize: 12, fontFamily: fonts.regular, color: colors.label3 },
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
  cardAuthor: { fontSize: 13, fontFamily: fonts.regular, color: colors.label3, marginTop: 2, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontFamily: fonts.semibold },
  dot: { width: 6, height: 6, borderRadius: 3 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: fonts.regular, color: colors.label3, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  emptyBtnText: { fontSize: 15, fontFamily: fonts.semibold, color: '#fff' },
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
  modalDone: { fontSize: 17, fontFamily: fonts.semibold, color: colors.orange },
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
  emojiBtnActive: { backgroundColor: colors.blue + '20', borderWidth: 2, borderColor: colors.blue },
  genreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.fill,
  },
  genreBtnActive: { backgroundColor: colors.indigo },
  genreBtnText: { fontSize: 13, fontFamily: fonts.medium, color: colors.label3 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.separator,
  },
  priorityBtnText: { fontSize: 14, fontFamily: fonts.semibold },
});
