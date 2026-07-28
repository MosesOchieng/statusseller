import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Order } from '@/types';
import Badge from './Badge';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const colors = useColors();

  const statusVariant = {
    pending: 'warning' as const,
    accepted: 'info' as const,
    processing: 'info' as const,
    shipped: 'default' as const,
    delivered: 'success' as const,
    cancelled: 'error' as const,
    refunded: 'muted' as const,
  }[order.status];

  const payIcon = order.paymentMethod === 'M-Pesa' ? 'phone-portrait-outline' : 'card-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.orderNum, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {order.orderNumber}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {formatRelativeTime(order.createdAt)}
          </Text>
        </View>
        <Badge label={order.status} variant={statusVariant} />
      </View>

      <View style={styles.divider} />

      <View style={styles.customerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
            {order.customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            {order.customer.name}
          </Text>
          <Text style={[styles.customerPhone, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {order.customer.phone}
          </Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={[styles.amount, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(order.total, order.currency)}
          </Text>
          <View style={styles.payRow}>
            <Ionicons name={payIcon} size={11} color={colors.mutedForeground} />
            <Text style={[styles.payText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {' '}{order.paymentMethod}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.itemsRow, { borderTopColor: colors.border }]}>
        <Ionicons name="cube-outline" size={13} color={colors.mutedForeground} />
        <Text style={[styles.itemsText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {'  '}
          {order.items.map((i) => `${i.productTitle} ×${i.quantity}`).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { gap: 2 },
  orderNum: { fontSize: 15 },
  time: { fontSize: 12 },
  divider: { height: 1, marginVertical: 10 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14 },
  customerPhone: { fontSize: 12 },
  amountCol: { alignItems: 'flex-end' },
  amount: { fontSize: 16 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payText: { fontSize: 11 },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  itemsText: { fontSize: 12, flex: 1 },
});
