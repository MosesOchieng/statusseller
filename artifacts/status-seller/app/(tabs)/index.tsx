import React from 'react';
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
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
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
  const { store, orders, unreadCount, markAllRead, products, stats } = useApp();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;
  const recentOrders = orders.slice(0, 3);

  const conversionRate = stats.conversionRate > 0 ? `${stats.conversionRate}%` : '—';
  const statCards = [
    { label: 'Orders', value: String(stats.totalSales || orders.length), change: '', up: true, icon: 'shopping-bag' as const },
    { label: 'Products', value: String(stats.totalProducts || products.length), change: '', up: true, icon: 'eye' as const },
    { label: 'Conversion', value: conversionRate, change: '', up: true, icon: 'percent' as const },
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
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>S</Text>
          </View>
          <Text style={[styles.brandText, { fontFamily: 'Inter_700Bold', color: colors.foreground }]}>
            Status<Text style={{ color: colors.primary }}>Seller</Text>
          </Text>
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
          Here's your business overview for today.
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
            {stats.currency} {stats.weekRevenue.reduce((a, b) => a + b, 0).toLocaleString()}
          </Text>
          <View style={styles.heroTrendRow}>
            <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.heroTrend, { fontFamily: 'Inter_500Medium' }]}> {stats.totalSales || orders.length} orders this week</Text>
          </View>
        </View>
        <MiniSparkline data={stats.weekRevenue.length ? stats.weekRevenue : [0,0,0,0,0,0,0]} color="#25D366" />
      </LinearGradient>

      {/* Stats Row — Orders / Visitors / Conversion */}
      <View style={styles.statsRow}>
        {statCards.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.primary + '15' }]}>
              <Feather name={s.icon} size={15} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {s.label}
            </Text>
            <Text style={[styles.statChange, { color: '#16A34A', fontFamily: 'Inter_500Medium' }]}>
              {s.change}
            </Text>
          </View>
        ))}
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
            // Find product image
            const prod = products.find((p) => p.id === item?.productId);
            const imgUrl = prod?.images?.[0] ?? null;
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/order/${order.id}` as any)}
                style={[styles.orderRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {imgUrl ? (
                  <Image
                    source={getImageSource(imgUrl)}
                    style={[styles.orderAvatar, { borderRadius: 10 }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.orderAvatar, { backgroundColor: colors.primary + '18', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={[styles.orderAvatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                      {order.customer.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderCustomer, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                    {order.customer.name}
                  </Text>
                  <Text style={[styles.orderItem, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {item?.productTitle}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
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

      {/* Products Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Your Products
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
            <Text style={[styles.viewAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              View all
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          {products.filter((p) => p.status === 'active').slice(0, 5).map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => router.push(`/product/${p.id}` as any)}
              style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {p.images?.[0] ? (
                <Image source={getImageSource(p.images[0])} style={styles.productThumb} resizeMode="cover" />
              ) : (
                <View style={[styles.productThumb, { backgroundColor: (p.colorHex ?? '#25D366') + '22', alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name="package" size={22} color={p.colorHex ?? '#25D366'} />
                </View>
              )}
              <View style={{ padding: 8 }}>
                <Text style={[styles.productName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
                  {p.title}
                </Text>
                <Text style={[styles.productPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                  {formatCurrency(p.price, p.currency)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 3,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 10 },
  statChange: { fontSize: 10 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17 },
  viewAll: { fontSize: 14 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  orderAvatar: { width: 44, height: 44 },
  orderAvatarText: { fontSize: 16 },
  orderCustomer: { fontSize: 14 },
  orderItem: { fontSize: 12, marginTop: 2 },
  orderAmount: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10 },
  empty: { padding: 32, alignItems: 'center' },
  productCard: {
    width: 130,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 10,
  },
  productThumb: { width: '100%', height: 100 },
  productName: { fontSize: 12, marginBottom: 2 },
  productPrice: { fontSize: 13 },
});
