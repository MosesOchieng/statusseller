import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getImageSource } from '@/utils/imageSource';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';
import { MOCK_STATS } from '@/constants/mockData';

const PERIODS = ['This Week', 'This Month', 'Last Month'] as const;

function LineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const W = 260;
  const H = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 8);
    return `${x},${y}`;
  });
  const d = `M ${pts.join(' L ')}`;
  const area = `${d} L ${W},${H} L 0,${H} Z`;

  return (
    <View style={{ height: H, marginTop: 8 }}>
      {/* Simple bar chart fallback since SVG isn't native */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: H, flex: 1 }}>
        {data.map((v, i) => {
          const h = Math.max(4, (v / max) * H);
          const isLast = i === data.length - 1;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: h,
                borderRadius: 6,
                backgroundColor: isLast ? color : color + '55',
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, orders } = useApp();
  const stats = MOCK_STATS;
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('This Week');
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const overviewCards = [
    { label: 'Views', value: '12.4K', change: '+18.8%', up: true },
    { label: 'Link Clicks', value: '842', change: '+23.1%', up: true },
    { label: 'Orders', value: '34', change: '+10.3%', up: true },
    { label: 'Conv. Rate', value: '2.74%', change: '+5.3%', up: true },
  ];

  const topProducts = products
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 4);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Analytics
        </Text>
        <TouchableOpacity
          onPress={() => {
            const idx = PERIODS.indexOf(period);
            setPeriod(PERIODS[(idx + 1) % PERIODS.length]);
          }}
          style={[styles.periodBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.periodText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            {period}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Hero revenue card */}
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
        <Text style={[styles.heroLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Total Sales
        </Text>
        <Text style={[styles.heroValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          {formatCurrency(stats.todayRevenue, stats.currency)}
        </Text>
        <View style={styles.heroTrendRow}>
          <Feather name="trending-up" size={14} color="#16A34A" />
          <Text style={[styles.heroTrend, { color: '#16A34A', fontFamily: 'Inter_500Medium' }]}>
            {'  '}+24.7% vs last 7 days
          </Text>
        </View>
        <LineChart data={stats.weekRevenue} color={colors.primary} />
        <View style={styles.chartLabels}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <Text key={d} style={[styles.chartLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {d}
            </Text>
          ))}
        </View>
      </View>

      {/* Overview grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Overview
        </Text>
        <View style={styles.overviewGrid}>
          {overviewCards.map((c) => (
            <View
              key={c.label}
              style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.overviewValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {c.value}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {c.label}
              </Text>
              <Text style={[styles.overviewChange, { color: c.up ? '#16A34A' : '#DC2626', fontFamily: 'Inter_500Medium' }]}>
                {c.change}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Conversion funnel */}
      <View style={[styles.section]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Conversion Funnel
        </Text>
        <View style={[styles.funnelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: 'Status Views', value: 12400, pct: 100 },
            { label: 'Link Clicks', value: 842, pct: 6.8 },
            { label: 'Overlay Opens', value: 510, pct: 4.1 },
            { label: 'Add to Cart', value: 120, pct: 1.0 },
            { label: 'Orders', value: 34, pct: 0.27 },
          ].map((row, i, arr) => (
            <View key={row.label} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>
              <View style={styles.funnelRow}>
                <Text style={[styles.funnelLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {row.label}
                </Text>
                <Text style={[styles.funnelValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {row.value.toLocaleString()} ({row.pct}%)
                </Text>
              </View>
              <View style={[styles.funnelBarBg, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.funnelBar,
                    { backgroundColor: colors.primary, width: `${row.pct}%` as any },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Top Products
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>View all</Text>
          </TouchableOpacity>
        </View>
        {topProducts.map((p, i) => (
          <View
            key={p.id}
            style={[styles.topProductRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.rank, { backgroundColor: i === 0 ? colors.primary : colors.muted }]}>
              <Text style={[styles.rankText, { color: i === 0 ? '#fff' : colors.mutedForeground, fontFamily: 'Inter_700Bold' }]}>
                {i + 1}
              </Text>
            </View>
            {p.images?.[0] ? (
              <Image source={getImageSource(p.images[0])} style={styles.prodThumb} resizeMode="cover" />
            ) : (
              <View style={[styles.prodThumb, { backgroundColor: (p.colorHex ?? '#25D366') + '22', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.prodInitials, { color: p.colorHex ?? '#25D366', fontFamily: 'Inter_700Bold' }]}>
                  {p.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.prodName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
                {p.title}
              </Text>
              <Text style={[styles.prodOrders, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {p.orders} orders
              </Text>
            </View>
            <Text style={[styles.prodRevenue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
              {formatCurrency(p.price * p.orders, p.currency)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22 },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodText: { fontSize: 13 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  heroLabel: { fontSize: 13, marginBottom: 4 },
  heroValue: { fontSize: 28 },
  heroTrendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  heroTrend: { fontSize: 13 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { fontSize: 10 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  viewAll: { fontSize: 14 },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  overviewValue: { fontSize: 20 },
  overviewLabel: { fontSize: 12 },
  overviewChange: { fontSize: 12 },
  funnelCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  funnelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  funnelLabel: { fontSize: 13 },
  funnelValue: { fontSize: 12 },
  funnelBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  funnelBar: { height: 6, borderRadius: 3 },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 12 },
  prodThumb: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  prodInitials: { fontSize: 13 },
  prodName: { fontSize: 13 },
  prodOrders: { fontSize: 11, marginTop: 2 },
  prodRevenue: { fontSize: 14 },
});
