import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/utils/formatters';

interface StatsResponse {
  todayRevenue: number;
  weekRevenue: number[];
  todayOrders: number;
  totalProducts: number;
  linkClicks: number;
  conversionRate: number;
  currency: string;
  totalSales: number;
  totalRevenue: number;
}

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const colors = useColors();
  const max = Math.max(...data);
  return (
    <View style={barStyles.container}>
      {data.map((val, i) => {
        const height = max === 0 ? 4 : Math.max(4, (val / max) * 120);
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={barStyles.col}>
            <Text style={[barStyles.value, { color: colors.mutedForeground }]}>
              {val >= 1000 ? `${Math.round(val / 1000)}K` : val}
            </Text>
            <View
              style={[
                barStyles.bar,
                {
                  height,
                  backgroundColor: isLast ? color : color + '50',
                  borderRadius: 5,
                },
              ]}
            />
            <Text style={[barStyles.label, { color: colors.mutedForeground }]}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingTop: 20 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '60%', minHeight: 4 },
  value: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 9, fontFamily: 'Inter_400Regular' },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products } = useApp();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    apiFetch<StatsResponse>('/stats')
      .then(setStats)
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setStatsLoading(false));
  }, []);

  const topProducts = [...products]
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 4);

  const displayStats = stats ?? {
    todayRevenue: 0,
    weekRevenue: [0, 0, 0, 0, 0, 0, 0],
    todayOrders: 0,
    totalProducts: 0,
    linkClicks: 0,
    conversionRate: 0,
    currency: 'KSh',
    totalSales: 0,
    totalRevenue: 0,
  };

  if (statsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[{ color: colors.mutedForeground, marginTop: 12, fontFamily: 'Inter_400Regular' }]}>Loading analytics…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Analytics
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.summaryGrid}>
          {[
            { label: 'Total Revenue', value: formatCurrency(displayStats.totalRevenue || displayStats.todayRevenue, displayStats.currency), icon: 'cash-outline' as const, color: colors.primary },
            { label: 'Total Orders', value: `${displayStats.totalSales || displayStats.todayOrders}`, icon: 'bag-outline' as const, color: colors.accent },
            { label: 'Link Clicks', value: `${displayStats.linkClicks}`, icon: 'link-outline' as const, color: colors.warning },
            { label: 'Conversion', value: `${displayStats.conversionRate}%`, icon: 'trending-up-outline' as const, color: colors.success },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: s.color + '18', borderRadius: 10 }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {s.value}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Revenue chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Revenue This Week
            </Text>
            <Text style={[styles.chartTotal, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {formatCurrency(displayStats.weekRevenue.reduce((a, b) => a + b, 0), displayStats.currency)}
            </Text>
          </View>
          <BarChart data={displayStats.weekRevenue} labels={WEEK_LABELS} color={colors.primary} />
        </View>

        {/* Link clicks chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Link Clicks
            </Text>
            <Text style={[styles.chartTotal, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
              {displayStats.linkClicks} total
            </Text>
          </View>
          <BarChart
            data={[32, 54, 41, 78, 63, 58, 68].map((v) => Math.round(v * (Math.max(displayStats.linkClicks, 1) / 68)))}
            labels={WEEK_LABELS}
            color={colors.accent}
          />
        </View>

        {/* Top Products */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Top Products
          </Text>
          {topProducts.map((p, i) => {
            const maxOrders = topProducts[0]?.orders ?? 1;
            const pct = maxOrders > 0 ? (p.orders / maxOrders) * 100 : 0;
            return (
              <View key={p.id} style={styles.productRow}>
                <Text style={[styles.rank, { color: colors.mutedForeground, fontFamily: 'Inter_700Bold' }]}>
                  #{i + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.productMeta}>
                    <Text
                      style={[styles.productName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}
                      numberOfLines={1}
                    >
                      {p.title}
                    </Text>
                    <Text style={[styles.productOrders, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                      {p.orders} orders
                    </Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: colors.muted, borderRadius: 4 }]}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${pct}%`, backgroundColor: colors.primary, borderRadius: 4 },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Conversion funnel */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Sales Funnel
          </Text>
          {[
            { label: 'Status Views', value: 3240, icon: 'eye-outline' as const, color: colors.info },
            { label: 'Link Clicks', value: displayStats.linkClicks, icon: 'link-outline' as const, color: colors.accent },
            { label: 'Product Views', value: 892, icon: 'bag-handle-outline' as const, color: colors.warning },
            { label: 'Orders Placed', value: displayStats.totalSales || displayStats.todayOrders, icon: 'checkmark-circle-outline' as const, color: colors.success },
          ].map((f, i, arr) => {
            const pct = i === 0 ? 100 : Math.round((f.value / arr[0].value) * 100);
            return (
              <View key={f.label} style={styles.funnelRow}>
                <View style={[styles.funnelIcon, { backgroundColor: f.color + '18', borderRadius: 10 }]}>
                  <Ionicons name={f.icon} size={16} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.funnelMeta}>
                    <Text style={[styles.funnelLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                      {f.label}
                    </Text>
                    <Text style={[styles.funnelValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                      {f.value.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.funnelBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.funnelBar, { width: `${pct}%`, backgroundColor: f.color }]} />
                  </View>
                  <Text style={[styles.funnelPct, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {pct}% of views
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, textAlign: 'center' },
  scroll: { padding: 16, gap: 14 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    width: '47%',
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  summaryIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 20 },
  summaryLabel: { fontSize: 12 },
  chartCard: { padding: 16, borderWidth: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chartTitle: { fontSize: 16 },
  chartTotal: { fontSize: 14 },
  card: { padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, marginBottom: 14 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  rank: { fontSize: 13, width: 24 },
  productMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  productName: { fontSize: 13, flex: 1 },
  productOrders: { fontSize: 13 },
  progressBg: { height: 6 },
  progressBar: { height: 6 },
  funnelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  funnelIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  funnelMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  funnelLabel: { fontSize: 13 },
  funnelValue: { fontSize: 13 },
  funnelBg: { height: 6, borderRadius: 3, marginBottom: 3 },
  funnelBar: { height: 6, borderRadius: 3 },
  funnelPct: { fontSize: 11 },
});
