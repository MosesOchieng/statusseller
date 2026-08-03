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
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { MOCK_STATS } from '@/constants/mockData';
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#FEF9C3', text: '#92400E', label: 'Pending' },
  accepted:   { bg: '#DCFCE7', text: '#15803D', label: 'Accepted' },
  processing: { bg: '#FEF3C7', text: '#B45309', label: 'Processing' },
  shipped:    { bg: '#DBEAFE', text: '#1D4ED8', label: 'Shipped' },
  delivered:  { bg: '#D1FAE5', text: '#065F46', label: 'Delivered' },
  cancelled:  { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * 36);
        const isLast = i === data.length - 1;
        return (
          <View
            key={i}
            style={{
              width: 6,
              height: h,
              borderRadius: 3,
              backgroundColor: isLast ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
            }}
          />
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { store, orders, unreadCount, markAllRead } = useApp();
  const stats = MOCK_STATS;
  const topInset = Platform.OS === 'web' ? 0 : insets.top;
  const recentOrders = orders.slice(0, 3);

  const statCards = [
    { label: 'Orders', value: '34', change: '+0.3%', up: true, icon: 'shopping-bag' as const },
    { label: 'Products', value: '128', change: '+8.2%', up: true, icon: 'package' as const },
    { label: 'Views', value: '12.4K', change: '+18%', up: true, icon: 'eye' as const },
    { label: 'Messages', value: '12', change: '-8.3%', up: false, icon: 'message-circle' as const },
  ];

  const quickActions = [
    { label: 'Add Product', icon: 'plus-circle' as const, color: '#25D366', route: '/product/new' as const },
    { label: 'Share Link', icon: 'share-2' as const, color: '#3B82F6', route: '/link' as const },
    { label: 'AI Agent', icon: 'zap' as const, color: '#8B5CF6', route: '/ai-chat' as const },
    { label: 'Analytics', icon: 'bar-chart-2' as const, color: '#F59E0B', route: '/(tabs)/analytics' as const },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={[styles.menuBtn, { borderColor: colors.border }]}>
            <Feather name="menu" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>S</Text>
            </View>
            <Text style={[styles.brandText, { fontFamily: 'Inter_700Bold', color: colors.foreground }]}>
              Status<Text style={{ color: colors.primary }}>Seller</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={markAllRead}
          style={[styles.notifBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Good Morning, {store?.name ?? 'Urban Wear'} 👋
        </Text>
        <Text style={[styles.greetingSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Let's grow your business today!
        </Text>
      </View>

      {/* Hero Revenue Card */}
      <LinearGradient
        colors={['#25D366', '#1DA851', '#128C7E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, { marginHorizontal: 16, borderRadius: 20 }]}
      >
        <View style={styles.heroBg} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroLabel, { fontFamily: 'Inter_500Medium' }]}>Total Sales (This Week)</Text>
          <Text style={[styles.heroValue, { fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(stats.todayRevenue, stats.currency)}
          </Text>
          <View style={styles.heroTrendRow}>
            <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.heroTrend, { fontFamily: 'Inter_500Medium' }]}> +24.7% vs last 7 days</Text>
          </View>
        </View>
        <MiniSparkline data={stats.weekRevenue} color="#25D366" />
      </LinearGradient>

      {/* Stats Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScroll}
      >
        {statCards.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Feather name={s.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {s.label}
            </Text>
            <Text style={[styles.statChange, { color: s.up ? '#16A34A' : colors.destructive, fontFamily: 'Inter_500Medium' }]}>
              {s.change}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => router.push(a.route as any)}
              style={[styles.actionBtn, { backgroundColor: a.color + '12', borderColor: a.color + '30' }]}
            >
              <Feather name={a.icon} size={22} color={a.color} />
              <Text style={[styles.actionLabel, { color: a.color, fontFamily: 'Inter_600SemiBold' }]}>
                {a.label}
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
            <Text style={[styles.viewAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted, borderRadius: 16 }]}>
            <Feather name="shopping-bag" size={28} color={colors.mutedForeground} />
            <Text style={[{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 8, fontSize: 14 }]}>
              No orders yet
            </Text>
          </View>
        ) : (
          recentOrders.map((order) => {
            const st = STATUS_COLOR[order.status] ?? STATUS_COLOR.pending;
            const item = order.items[0];
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/order/${order.id}` as any)}
                style={[styles.orderRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.orderAvatar, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.orderAvatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                    {order.customer.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderCustomer, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                    {order.customer.name}
                  </Text>
                  <Text style={[styles.orderItem, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {item?.productTitle} {order.items.length > 1 ? `+${order.items.length - 1}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.orderAmount, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                    {formatCurrency(order.total, order.currency)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.text, fontFamily: 'Inter_600SemiBold' }]}>
                      {st.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* AI Business Coach Banner */}
      <TouchableOpacity
        onPress={() => router.push('/ai-coach' as any)}
        style={[styles.coachBanner, { marginHorizontal: 16, borderRadius: 20, backgroundColor: '#0D1117', overflow: 'hidden' }]}
      >
        <LinearGradient
          colors={['#1C1C2E', '#2D1B69']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.coachGradient}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.coachDotRow}>
              <View style={[styles.coachDot, { backgroundColor: '#25D366' }]} />
              <Text style={[styles.coachActive, { fontFamily: 'Inter_500Medium', color: '#25D366' }]}>AI Active</Text>
            </View>
            <Text style={[styles.coachTitle, { fontFamily: 'Inter_700Bold', color: '#fff' }]}>
              AI Business Coach
            </Text>
            <Text style={[styles.coachSub, { fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.6)' }]}>
              {stats.aiConversations} insights ready for you →
            </Text>
          </View>
          <View style={[styles.coachCircle, { backgroundColor: '#25D366' }]}>
            <Feather name="zap" size={22} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brandText: { fontSize: 18 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  greeting: { paddingHorizontal: 16, marginBottom: 16, marginTop: 4 },
  greetingText: { fontSize: 18 },
  greetingSub: { fontSize: 13, marginTop: 2 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -20,
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  heroValue: { fontSize: 28, color: '#fff' },
  heroTrendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  heroTrend: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  statsScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4, marginBottom: 12 },
  statCard: {
    width: 100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11 },
  statChange: { fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  viewAll: { fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { fontSize: 11, textAlign: 'center' },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  orderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAvatarText: { fontSize: 16 },
  orderCustomer: { fontSize: 14 },
  orderItem: { fontSize: 12, marginTop: 2 },
  orderAmount: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10 },
  empty: { padding: 32, alignItems: 'center' },
  coachBanner: { marginBottom: 20 },
  coachGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16, borderRadius: 20 },
  coachDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coachDot: { width: 8, height: 8, borderRadius: 4 },
  coachActive: { fontSize: 12 },
  coachTitle: { fontSize: 18, marginBottom: 4 },
  coachSub: { fontSize: 13 },
  coachCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
