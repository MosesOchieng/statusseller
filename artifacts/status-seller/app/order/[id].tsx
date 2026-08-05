import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters';
import type { OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['pending', 'accepted', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, updateOrderStatus } = useApp();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Order not found</Text>
      </View>
    );
  }

  const statusVariant = {
    pending: 'warning' as const,
    accepted: 'info' as const,
    processing: 'info' as const,
    shipped: 'default' as const,
    delivered: 'success' as const,
    cancelled: 'error' as const,
    refunded: 'muted' as const,
  }[order.status];

  const currentIdx = STATUS_FLOW.indexOf(order.status as any);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null;

  const nextLabel: Record<string, string> = {
    accepted: 'Accept Order',
    processing: 'Start Processing',
    shipped: 'Mark as Shipped',
    delivered: 'Mark as Delivered',
  };

  const [statusLoading, setStatusLoading] = React.useState(false);

  const handleNextStatus = async () => {
    if (!nextStatus || statusLoading) return;
    setStatusLoading(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
      Alert.alert('Error', 'Could not update order status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order?', 'This action cannot be undone.', [
      { text: 'Keep Order', style: 'cancel' },
      {
        text: 'Cancel Order',
        style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await updateOrderStatus(order.id, 'cancelled');
            router.back();
          } catch (err) {
            console.error('Failed to cancel order:', err);
            Alert.alert('Error', 'Could not cancel the order. Please try again.');
          }
        },
      },
    ]);
  };

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
          {order.orderNumber}
        </Text>
        <Badge label={order.status} variant={statusVariant} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status timeline */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Order Progress
          </Text>
          <View style={styles.timeline}>
            {STATUS_FLOW.map((s, idx) => {
              const done = STATUS_FLOW.indexOf(order.status as any) >= idx;
              const isCurrent = order.status === s;
              return (
                <View key={s} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: done ? colors.primary : colors.border,
                          borderColor: isCurrent ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {done && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                    {idx < STATUS_FLOW.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: done ? colors.primary + '40' : colors.border }]} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      {
                        color: done ? colors.foreground : colors.mutedForeground,
                        fontFamily: isCurrent ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
          {order.trackingNumber && (
            <View style={[styles.trackingRow, { backgroundColor: colors.primaryLight, borderRadius: 10 }]}>
              <Ionicons name="navigate-outline" size={15} color={colors.primary} />
              <Text style={[styles.trackingText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                {'  '}Tracking: {order.trackingNumber}
              </Text>
            </View>
          )}
        </View>

        {/* Customer info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Customer
          </Text>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                {order.customer.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.customerName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {order.customer.name}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {order.customer.phone}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {order.customer.address}
              </Text>
            </View>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.primaryLight, borderRadius: 22 }]}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Items ({order.items.length})
          </Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.itemImage, { backgroundColor: item.colorHex ?? colors.muted, borderRadius: 8 }]}>
                <Ionicons name="cube-outline" size={16} color={colors.mutedForeground + '80'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {item.productTitle}
                </Text>
                {item.variant && (
                  <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {item.variant}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.itemPrice, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                  {formatCurrency(item.price * item.quantity, order.currency)}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>qty: {item.quantity}</Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsSection}>
            {[
              { label: 'Subtotal', value: formatCurrency(order.subtotal, order.currency) },
              { label: 'Delivery', value: formatCurrency(order.deliveryFee, order.currency) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
                <Text style={[styles.totalValue, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{value}</Text>
              </View>
            ))}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Total</Text>
              <Text style={[styles.grandTotalValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                {formatCurrency(order.total, order.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Payment</Text>
          <View style={styles.payRow}>
            <Ionicons
              name={order.paymentMethod === 'M-Pesa' ? 'phone-portrait-outline' : 'card-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.payMethod, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {'  '}{order.paymentMethod}
            </Text>
            <Badge
              label={order.paymentStatus}
              variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' && (
        <View
          style={[
            styles.actions,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {nextStatus && nextLabel[nextStatus] && (
            <Button
              title={nextLabel[nextStatus]}
              onPress={handleNextStatus}
              fullWidth
              icon={<Ionicons name="arrow-forward" size={16} color="#fff" />}
              iconPosition="right"
              style={{ flex: 1 }}
            />
          )}
          {order.status === 'pending' && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelBtn, { borderColor: colors.destructive, borderRadius: colors.radius }]}
            >
              <Text style={[styles.cancelText, { color: colors.destructive, fontFamily: 'Inter_600SemiBold' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17 },
  scroll: { padding: 16, gap: 12 },
  card: { padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, marginBottom: 4 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineLeft: { alignItems: 'center' },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  timelineLine: { width: 2, height: 20, marginTop: 2 },
  timelineLabel: { fontSize: 14, paddingVertical: 3 },
  trackingRow: { flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 4 },
  trackingText: { fontSize: 13 },
  customerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18 },
  customerName: { fontSize: 15 },
  meta: { fontSize: 12 },
  callBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  itemImage: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 13 },
  itemPrice: { fontSize: 14 },
  totalsSection: { gap: 6, paddingTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14 },
  grandTotal: { borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  grandTotalValue: { fontSize: 18 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payMethod: { flex: 1, fontSize: 15 },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15 },
});
