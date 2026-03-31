import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../../lib/theme';
import { getBooks, getWishlist, getLending } from '../../lib/storage';
import type { Book } from '../../lib/types';

const { width } = Dimensions.get('window');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={12}
          color={s <= rating ? colors.yellow : colors.label4}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ reading: 0, read: 0, wishlist: 0, activeLoans: 0 });
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function load() {
      const [books, wishlist, lending] = await Promise.all([
        getBooks(),
        getWishlist(),
        getLending(),
      ]);
      setStats({
        reading: books.filter((b) => b.status === 'reading').length,
        read: books.filter((b) => b.status === 'read').length,
        wishlist: wishlist.length,
        activeLoans: lending.filter((l) => !l.returned).length,
      });
      setCurrentBooks(books.filter((b) => b.status === 'reading').slice(0, 2));
    }
    load();
  }, []);

  const featureCards = [
    { label: 'Collection', icon: 'library' as const, color: colors.indigo, route: '/collection' },
    { label: 'Wishlist', icon: 'bookmark' as const, color: colors.orange, route: '/wishlist' },
    { label: 'Lending', icon: 'swap-horizontal' as const, color: colors.green, route: '/lending' },
    { label: 'Stats', icon: 'bar-chart' as const, color: colors.purple, route: '/stats' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.title}>Library</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Reading', value: stats.reading, color: colors.blue },
            { label: 'Finished', value: stats.read, color: colors.green },
            { label: 'Wishlist', value: stats.wishlist, color: colors.orange },
            { label: 'On Loan', value: stats.activeLoans, color: colors.purple },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Currently reading */}
        {currentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently Reading</Text>
            {currentBooks.map((book) => (
              <View key={book.id} style={styles.currentBookCard}>
                <Text style={styles.currentBookCover}>{book.cover}</Text>
                <View style={styles.currentBookInfo}>
                  <Text style={styles.currentBookTitle} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <Text style={styles.currentBookAuthor}>{book.author}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[styles.progressFill, { width: `${book.progress}%` as any }]}
                      />
                    </View>
                    <Text style={styles.progressLabel}>{book.progress}%</Text>
                  </View>
                </View>
                <StarRating rating={book.rating} />
              </View>
            ))}
          </View>
        )}

        {/* Feature grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse</Text>
          <View style={styles.featureGrid}>
            {featureCards.map((f) => (
              <TouchableOpacity
                key={f.label}
                style={styles.featureCard}
                onPress={() => router.push(f.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <Ionicons name={f.icon} size={26} color={f.color} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },

  header: { marginBottom: 24 },
  greeting: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.label3,
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    fontFamily: fonts.bold,
    color: colors.label,
    letterSpacing: -0.5,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadow.sm,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.label3,
    marginTop: 2,
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.label,
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  currentBookCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    ...shadow.sm,
  },
  currentBookCover: { fontSize: 40 },
  currentBookInfo: { flex: 1 },
  currentBookTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.label,
    marginBottom: 2,
  },
  currentBookAuthor: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.label3,
    marginBottom: 8,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue,
    borderRadius: radius.full,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.label3,
    width: 30,
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: CARD_W,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'flex-start',
    ...shadow.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.label,
  },
});
