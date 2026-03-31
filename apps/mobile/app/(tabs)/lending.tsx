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
import { getLending, addLendingItem, markReturned, deleteLendingItem } from '../../lib/storage';
import type { LendingItem } from '../../lib/types';

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function LoanCard({
  item,
  onReturn,
  onDelete,
}: {
  item: LendingItem;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const days = item.returned ? null : daysUntil(item.dueDate);
  const isOverdue = days !== null && days < 0;
  const isDueSoon = days !== null && days >= 0 && days <= 7;

  let dueBg = colors.fill;
  let dueColor = colors.label3;
  if (isOverdue) { dueBg = colors.red + '15'; dueColor = colors.red; }
  else if (isDueSoon) { dueBg = colors.orange + '15'; dueColor = colors.orange; }

  return (
    <View style={[styles.card, item.returned && styles.cardReturned]}>
      <View style={[styles.cardIcon, { backgroundColor: item.returned ? colors.green + '15' : colors.indigo + '15' }]}>
        <Ionicons
          name={item.returned ? 'checkmark-circle' : 'book-outline'}
          size={22}
          color={item.returned ? colors.green : colors.indigo}
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.bookTitle}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="person-outline" size={12} color={colors.label3} />
          <Text style={styles.cardBorrower}>{item.borrower}</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Lent {formatDate(item.lentDate)}</Text>
          {!item.returned && (
            <View style={[styles.dueBadge, { backgroundColor: dueBg }]}>
              <Text style={[styles.dueText, { color: dueColor }]}>
                {isOverdue
                  ? `${Math.abs(days!)}d overdue`
                  : days === 0
                  ? 'Due today'
                  : `Due in ${days}d`}
              </Text>
            </View>
          )}
          {item.returned && (
            <View style={[styles.dueBadge, { backgroundColor: colors.green + '15' }]}>
              <Text style={[styles.dueText, { color: colors.green }]}>Returned</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        {!item.returned && (
          <TouchableOpacity style={styles.returnBtn} onPress={() => onReturn(item.id)}>
            <Text style={styles.returnBtnText}>Return</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8} style={{ marginTop: 8 }}>
          <Ionicons name="trash-outline" size={16} color={colors.label4} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function LendingScreen() {
  const [items, setItems] = useState<LendingItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ bookTitle: '', borrower: '', dueDate: '' });

  useFocusEffect(
    useCallback(() => {
      getLending().then(setItems);
    }, [])
  );

  async function handleReturn(id: string) {
    Alert.alert('Mark as returned?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Returned',
        onPress: async () => {
          const updated = await markReturned(id);
          setItems(updated);
        },
      },
    ]);
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete record?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteLendingItem(id);
          setItems(updated);
        },
      },
    ]);
  }

  async function handleAdd() {
    if (!form.bookTitle.trim() || !form.borrower.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const due = form.dueDate.trim() || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })();
    const item: LendingItem = {
      id: Date.now().toString(),
      bookTitle: form.bookTitle.trim(),
      borrower: form.borrower.trim(),
      lentDate: today,
      dueDate: due,
      returned: false,
    };
    const updated = await addLendingItem(item);
    setItems(updated);
    setShowAdd(false);
    setForm({ bookTitle: '', borrower: '', dueDate: '' });
  }

  const active = items.filter((i) => !i.returned);
  const returned = items.filter((i) => i.returned);
  const overdue = active.filter((i) => daysUntil(i.dueDate) < 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lending</Text>
          <Text style={styles.subtitle}>
            {active.length} active · {overdue.length > 0 ? `${overdue.length} overdue · ` : ''}{returned.length} returned
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <LoanCard item={item} onReturn={handleReturn} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          overdue.length > 0 ? (
            <View style={styles.overdueBanner}>
              <Ionicons name="warning" size={16} color={colors.red} />
              <Text style={styles.overdueText}>
                {overdue.length} book{overdue.length !== 1 ? 's are' : ' is'} overdue
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤝</Text>
            <Text style={styles.emptyText}>No lending records yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>Record a loan</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Record Loan</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text
                style={[styles.modalDone, (!form.bookTitle || !form.borrower) && { opacity: 0.4 }]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Book Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Which book?"
                  placeholderTextColor={colors.label3}
                  value={form.bookTitle}
                  onChangeText={(t) => setForm((f) => ({ ...f, bookTitle: t }))}
                />
                <Text style={styles.formLabel}>Borrower</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Who's borrowing it?"
                  placeholderTextColor={colors.label3}
                  value={form.borrower}
                  onChangeText={(t) => setForm((f) => ({ ...f, borrower: t }))}
                />
                <Text style={styles.formLabel}>Due Date (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD (defaults to 30 days)"
                  placeholderTextColor={colors.label3}
                  value={form.dueDate}
                  onChangeText={(t) => setForm((f) => ({ ...f, dueDate: t }))}
                />
                <Text style={styles.formHint}>Leave blank to set due date 30 days from today</Text>
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
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.red + '12',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.red + '30',
  },
  overdueText: { fontSize: 14, fontFamily: fonts.medium, color: colors.red },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    ...shadow.sm,
  },
  cardReturned: { opacity: 0.65 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.label, marginBottom: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  cardBorrower: { fontSize: 13, fontFamily: fonts.regular, color: colors.label3 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 12, fontFamily: fonts.regular, color: colors.label3 },
  dueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  dueText: { fontSize: 11, fontFamily: fonts.semibold },
  cardActions: { alignItems: 'center' },
  returnBtn: {
    backgroundColor: colors.green + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  returnBtnText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.green },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: fonts.regular, color: colors.label3, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  emptyBtnText: { fontSize: 15, fontFamily: fonts.semibold, color: '#fff' },
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
  modalDone: { fontSize: 17, fontFamily: fonts.semibold, color: colors.green },
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
  },
  formHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.label3,
    marginTop: 6,
  },
});
