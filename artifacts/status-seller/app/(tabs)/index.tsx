import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/ui/StatCard';
import OrderCard from '@/components/ui/OrderCard';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { MOCK_STATS } from '@/constants/mockData';

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <View style={styles.chart}>
      {data.map((val, i) => {
        const h = max === 0 ? 4 : Math.max(4, (val / max) * 44);
        const isLast = i === data.length - 1;
        return (
          <View
            key={i}
            style={[
              styles.bar,
              { height: h, backgroundColor: isLast ? 'rgba(255,255,255,0.95)' : color + '50', borderRadius: 3 },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { store, unreadCount, markAllRead, orders, groqEnabled } = useApp();
  const stats = MOCK_STATS;

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const recentOrders = orders.slice(0, 3);

  const quickActions = [
    { icon: 'add-circle' as const, label: 'Add Product', color: colors.primary, bg: colors.primary + '15', route: '/product/new' as const },
    { icon: 'link' as const, label: 'Share Link', color: colors.accent, bg: colors.accent + '15', route: '/link' as const },
    { icon: 'analytics' as const, label: 'Analytics', color: colors.warning, bg: colors.warning + '15', route: '/analytics/' as const },
    { icon: 'flash' as const, label: 'AI Agent', color: '#8B5CF6', bg: '#8B5CF615', route: '/(tabs)/ai' as const },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 108 : 112 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storeAvatar}
          >
            <Text style={[styles.storeAvatarText, { fontFamily: 'Inter_700Bold' }]}>
              {store?.name?.charAt(0) ?? 'S'}
            </Text>
          </LinearGradient>
          <View>
            <Text style={[styles.storeName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {store?.name ?? 'My Store'}
            </Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {' '}Verified Store
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={markAllRead}
          style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Revenue Hero — LinearGradient */}
      <LinearGradient
        colors={['#25D366', '#128C7E', '#075E54']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, { borderRadius: colors.radius, marginHorizontal: 16, marginBottom: 18 }]}
      >
        {/* Decorative circles */}
        <View style={styles.heroBg1} />
        <View style={styles.heroBg2} />
        <View style={styles.heroLeft}>
          <Text style={[styles.heroLabel, { fontFamily: 'Inter_500Medium' }]}>Today's Revenue</Text>
          <Text style={[styles.heroValue, { fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(stats.todayRevenue, stats.currency)}
          </Text>
          <View style={styles.heroTrend}>
            <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.heroTrendText, { fontFamily: 'Inter_500Medium' }]}>
              {' '}+12% from yesterday
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { fontFamily: 'Inter_700Bold' }]}>{stats.todayOrders}</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: 'Inter_400Regular' }]}>Orders</Text>
            </View>
            <View style={[styles.heroStatDivider]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { fontFamily: 'Inter_700Bold' }]}>{stats.linkClicks}</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: 'Inter_400Regular' }]}>Link Clicks</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { fontFamily: 'Inter_700Bold' }]}>{stats.conversionRate}%</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: 'Inter_400Regular' }]}>Conv.</Text>
            </View>
          </View>
        </View>
        <MiniBarChart data={stats.weekRevenue} color="rgba(255,255,255,0.7)" />
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders.toString()}
            icon="bag-outline"
            trend="+2"
            trendUp
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            icon="cube-outline"
            iconColor={colors.accent}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Link Clicks"
            value={stats.linkClicks.toString()}
            icon="link-outline"
            iconColor={colors.warning}
            trend="+48"
            trendUp
          />
          <StatCard
            title="Conv. Rate"
            value={`${stats.conversionRate}%`}
            icon="analytics-outline"
            iconColor={colors.info}
            subtitle="of clicks"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.bg, borderRadius: 14 }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Recent Orders
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
            <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              See all →
            </Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => router.push(`/order/${order.id}` as any)}
            />
          ))
        ) : (
          <View style={[styles.emptyOrders, { backgroundColor: colors.muted, borderRadius: 12 }]}>
            <Ionicons name="bag-outline" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No orders yet
            </Text>
          </View>
        )}
      </View>

      {/* AI Banner */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/ai')}
        activeOpacity={0.85}
        style={[styles.aiBannerWrap, { marginHorizontal: 16 }]}
      >
        <LinearGradient
          colors={['#1C1C2E', '#2D1B69', '#1C1C2E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.aiBanner, { borderRadius: colors.radius }]}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiDotRow}>
              <View style={[styles.aiDot, { backgroundColor: '#25D366' }]} />
              <Text style={[styles.aiStatus, { fontFamily: 'Inter_500Medium' }]}>
                {groqEnabled ? 'Groq AI active' : 'AI active'}
              </Text>
            </View>
            <Text style={[styles.aiBannerTitle, { fontFamily: 'Inter_700Bold' }]}>
              AI is answering customers
            </Text>
            <Text style={[styles.aiBannerSub, { fontFamily: 'Inter_400Regular' }]}>
              {stats.aiConversations} conversations today
            </Text>
          </View>
          <View style={[styles.aiIconCircle, { backgroundColor: '#25D366' }]}>
            <Ionicons name="flash" size={24} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeAvatarText: { fontSize: 18, color: '#fff' },
  storeName: { fontSize: 17 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 12 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  // Hero card
  heroCard: { padding: 22, overflow: 'hidden', position: 'relative' },
  heroBg1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -30,
  },
  heroBg2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -40,
    left: 20,
  },
  heroLeft: { gap: 5, flex: 1 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  heroValue: { fontSize: 30, color: '#fff', marginTop: 2 },
  heroTrend: { flexDirection: 'row', alignItems: 'center' },
  heroTrendText: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 0 },
  heroStat: { alignItems: 'center', paddingHorizontal: 14 },
  heroStatValue: { fontSize: 16, color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },

  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 50 },
  bar: { width: 8 },

  statsGrid: { paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  seeAll: { fontSize: 14 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  actionIconWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 14 },

  emptyOrders: { padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14 },

  aiBannerWrap: { marginBottom: 12 },
  aiBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  aiBannerLeft: { gap: 4 },
  aiDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  aiDot: { width: 7, height: 7, borderRadius: 4 },
  aiStatus: { fontSize: 12, color: '#25D366' },
  aiBannerTitle: { fontSize: 16, color: '#fff' },
  aiBannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  aiIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
