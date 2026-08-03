import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { Order } from '@/types';

const TABS = ['All', 'Pending', 'Paid', 'Delivered'] as const;
type TabType = (typeof TABS)[number];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#FEF9C3', text: '#92400E', label: 'Pending' },
  accepted:   { bg: '#DCFCE7', text: '#15803D', label: 'Accepted' },
  processing: { bg: '#FEF3C7', text: '#B45309', label: 'Processing' },
  shipped:    { bg: '#DBEAFE', text: '#1D4ED8', label: 'Shipped' },
  delivered:  { bg: '#D1FAE5', text: '#065F46', label: 'Delivered' },
  cancelled:  { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' },
};

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [search, setSearch] = useState('');
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const filtered = orders.filter((o: Order) => {
    const q = search.toLowerCase();
    if (q && !o.orderNumber.toLowerCase().includes(q) && !o.customer.name.toLowerCase().includes(q)) {
      return false;
    }
    if (activeTab === 'Pending') return o.status === 'pending' || o.status === 'accepted';
    if (activeTab === 'Paid') return o.paymentStatus === 'paid' && o.status !== 'delivered';
    if (activeTab === 'Delivered') return o.status === 'delivered';
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Orders
        </Text>
        <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}>
          <Feather name="filter" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Revenue summary */}
      <View style={[styles.revRow, { backgroundColor: colors.primary + '10', marginHorizontal: 16, borderRadius: 14 }]}>
        <View>
          <Text style={[styles.revLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Total Revenue
          </Text>
          <Text style={[styles.revValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(totalRevenue, 'KSh')}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.revLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Total Orders
          </Text>
          <Text style={[styles.revValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {orders.length}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, marginHorizontal: 16 }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          placeholder="Search orders..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[
              styles.tab,
              activeTab === t
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.muted },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { fontFamily: 'Inter_500Medium' },
                activeTab === t ? { color: '#fff' } : { color: colors.mutedForeground },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders list */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted, borderRadius: 16 }]}>
            <Feather name="shopping-bag" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No orders found
            </Text>
          </View>
        ) : (
          filtered.map((order: Order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const item = order.items[0];
            const timeAgo = formatRelativeTime(order.createdAt);
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/order/${order.id}` as any)}
                style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Top row */}
                <View style={styles.orderTop}>
                  <View style={styles.orderTopLeft}>
                    <Text style={[styles.orderNum, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                      {order.orderNumber}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.badgeText, { color: cfg.text, fontFamily: 'Inter_600SemiBold' }]}>
                        {cfg.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.orderTime, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {timeAgo}
                  </Text>
                </View>

                {/* Customer + items */}
                <View style={styles.orderMid}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                      {order.customer.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.customerName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                      {order.customer.name}
                    </Text>
                    <Text style={[styles.itemName, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                      {item?.productTitle}{order.items.length > 1 ? ` +${order.items.length - 1} items` : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.orderTotal, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                      {formatCurrency(order.total, order.currency)}
                    </Text>
                    <View style={[
                      styles.payBadge,
                      { backgroundColor: order.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF9C3' },
                    ]}>
                      <Text style={[
                        styles.payText,
                        { color: order.paymentStatus === 'paid' ? '#15803D' : '#92400E', fontFamily: 'Inter_500Medium' },
                      ]}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment method */}
                <View style={[styles.orderBottom, { borderTopColor: colors.border }]}>
                  <Feather name="credit-card" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.payMethod, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {'  '}{order.paymentMethod}
                  </Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={{ marginLeft: 'auto' }} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginTop: 12, marginBottom: 4 },
  revLabel: { fontSize: 12 },
  revValue: { fontSize: 20, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13 },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  orderTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderNum: { fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10 },
  orderTime: { fontSize: 12 },
  orderMid: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16 },
  customerName: { fontSize: 14 },
  itemName: { fontSize: 12, marginTop: 2 },
  orderTotal: { fontSize: 14 },
  payBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 4 },
  payText: { fontSize: 10 },
  orderBottom: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  payMethod: { fontSize: 12 },
  empty: { padding: 40, alignItems: 'center', gap: 12, marginTop: 20 },
  emptyText: { fontSize: 15 },
});
