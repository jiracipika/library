import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { colors, fonts, radius, shadow } from '../../lib/theme';
import { getBooks } from '../../lib/storage';
import type { Book } from '../../lib/types';

const { width } = Dimensions.get('window');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: string | number;
  label: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barW = (width - 40 - 20 - (data.length - 1) * 6) / data.length;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((d) => (
          <View key={d.label} style={[styles.barCol, { width: barW }]}>
            <Text style={styles.barValue}>{d.count > 0 ? d.count : ''}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${(d.count / max) * 100}%` as any,
                    backgroundColor: d.count > 0 ? colors.indigo : colors.fill,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function computeStats(books: Book[]) {
  const read = books.filter((b) => b.status === 'read');
  const reading = books.filter((b) => b.status === 'reading');
  const totalPages = read.reduce((s, b) => s + b.pages, 0);
  const avgRating =
    read.length > 0
      ? (read.reduce((s, b) => s + b.rating, 0) / read.length).toFixed(1)
      : '–';

  const thisYear = new Date().getFullYear().toString();
  const thisYearCount = read.filter(
    (b) => b.finishDate && b.finishDate.startsWith(thisYear)
  ).length;

  // Monthly chart: last 6 months
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = d.getMonth();
    const label = MONTH_NAMES[m];
    const count = read.filter((b) => {
      if (!b.finishDate) return false;
      const fd = new Date(b.finishDate);
      return fd.getFullYear() === y && fd.getMonth() === m;
    }).length;
    months.push({ label, count });
  }

  // Genre breakdown
  const genreMap: Record<string, number> = {};
  books.forEach((b) => {
    genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
  });
  const genres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top rated
  const topRated = [...read]
    .filter((b) => b.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return { read, reading, totalPages, avgRating, thisYearCount, months, genres, topRated };
}

const GENRE_COLORS = [colors.indigo, colors.blue, colors.purple, colors.teal, colors.orange];

export default function StatsScreen() {
  const [books, setBooks] = useState<Book[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBooks().then(setBooks);
    }, [])
  );

  const { read, reading, totalPages, avgRating, thisYearCount, months, genres, topRated } =
    computeStats(books);

  const totalGenre = genres.reduce((s, g) => s + g[1], 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Stats</Text>

        {/* Key metrics */}
        <View style={styles.statsGrid}>
          <StatCard value={read.length} label="Books Read" color={colors.green} icon="✅" />
          <StatCard value={totalPages.toLocaleString()} label="Pages Read" color={colors.blue} icon="📖" />
          <StatCard value={`${avgRating}★`} label="Avg Rating" color={colors.yellow} icon="⭐" />
          <StatCard value={thisYearCount} label="This Year" color={colors.purple} icon="📅" />
        </View>

        {/* Monthly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Books Finished</Text>
          <Text style={styles.sectionSubtitle}>Last 6 months</Text>
          <View style={styles.card}>
            <BarChart data={months} />
          </View>
        </View>

        {/* Genre breakdown */}
        {genres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Genre</Text>
            <View style={styles.card}>
              {genres.map(([genre, count], i) => (
                <View key={genre} style={styles.genreRow}>
                  <View style={[styles.genreDot, { backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }]} />
                  <Text style={styles.genreName}>{genre}</Text>
                  <View style={styles.genreBarWrap}>
                    <View
                      style={[
                        styles.genreBar,
                        {
                          width: `${(count / totalGenre) * 100}%` as any,
                          backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] + '40',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.genreCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top rated */}
        {topRated.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            <View style={styles.card}>
              {topRated.map((book, i) => (
                <View key={book.id} style={[styles.topRow, i < topRated.length - 1 && styles.topRowBorder]}>
                  <Text style={styles.topRank}>#{i + 1}</Text>
                  <Text style={styles.topCover}>{book.cover}</Text>
                  <View style={styles.topInfo}>
                    <Text style={styles.topTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={styles.topAuthor}>{book.author}</Text>
                  </View>
                  <View style={styles.topStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Text key={s} style={{ fontSize: 12, color: s <= book.rating ? colors.yellow : colors.label4 }}>
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reading now */}
        {reading.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <View style={styles.card}>
              {reading.map((book, i) => (
                <View key={book.id} style={[styles.inProgressRow, i < reading.length - 1 && styles.topRowBorder]}>
                  <Text style={styles.topCover}>{book.cover}</Text>
                  <View style={styles.topInfo}>
                    <Text style={styles.topTitle} numberOfLines={1}>{book.title}</Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${book.progress}%` as any }]} />
                      </View>
                      <Text style={styles.progressLabel}>{book.progress}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = (width - 40 - 12) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontFamily: fonts.bold, color: colors.label, letterSpacing: -0.4, marginBottom: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    width: CARD_W,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'flex-start',
    ...shadow.sm,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 26, fontFamily: fonts.bold, letterSpacing: -0.5, marginBottom: 2 },
  statLabel: { fontSize: 12, fontFamily: fonts.regular, color: colors.label3 },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.label, letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, fontFamily: fonts.regular, color: colors.label3, marginBottom: 12, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow.sm },

  chartContainer: { paddingTop: 4 },
  chartBars: { flexDirection: 'row', gap: 6, height: 120, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 4 },
  barValue: { fontSize: 11, fontFamily: fonts.medium, color: colors.label3, height: 16 },
  barTrack: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.fill,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: radius.sm, minHeight: 4 },
  barLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.label3 },

  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  genreDot: { width: 8, height: 8, borderRadius: 4 },
  genreName: { width: 80, fontSize: 13, fontFamily: fonts.medium, color: colors.label },
  genreBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  genreBar: { height: '100%', borderRadius: radius.full },
  genreCount: { width: 20, fontSize: 13, fontFamily: fonts.semibold, color: colors.label3, textAlign: 'right' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  topRowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.separator },
  topRank: { fontSize: 13, fontFamily: fonts.bold, color: colors.label3, width: 24 },
  topCover: { fontSize: 28 },
  topInfo: { flex: 1 },
  topTitle: { fontSize: 14, fontFamily: fonts.semibold, color: colors.label },
  topAuthor: { fontSize: 12, fontFamily: fonts.regular, color: colors.label3, marginTop: 1 },
  topStars: { flexDirection: 'row', gap: 1 },

  inProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.blue, borderRadius: radius.full },
  progressLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.label3, width: 30 },
});
