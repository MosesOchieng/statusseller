import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Product } from '@/types';
import Badge from './Badge';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useColors();

  const statusVariant = {
    active: 'success' as const,
    draft: 'muted' as const,
    out_of_stock: 'error' as const,
  }[product.status];

  const statusLabel = {
    active: 'Active',
    draft: 'Draft',
    out_of_stock: 'Out of Stock',
  }[product.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      {/* Product image placeholder */}
      <View
        style={[
          styles.image,
          { backgroundColor: product.colorHex ?? colors.muted, borderRadius: colors.radius - 4 },
        ]}
      >
        <Ionicons name="image-outline" size={28} color={colors.mutedForeground + '80'} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text
          style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
          numberOfLines={1}
        >
          {product.title}
        </Text>
        <Text
          style={[styles.category, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
        >
          {product.category}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.price, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {formatCurrency(product.price, product.currency)}
          </Text>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
              {formatCurrency(product.originalPrice, product.currency)}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Badge label={statusLabel} variant={statusVariant} />
          <View style={styles.statsRow}>
            <Ionicons name="eye-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.stat, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {' '}{product.views}
            </Text>
            <Ionicons name="cart-outline" size={12} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            <Text style={[styles.stat, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {' '}{product.orders}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, gap: 4 },
  title: { fontSize: 14 },
  category: { fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 15 },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { fontSize: 11 },
});
