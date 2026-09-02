import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ProductOverlay from '@/components/ui/ProductOverlay';
import { useApp, apiProductToProduct } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types';

export default function PublicPosterLink() {
  const colors = useColors();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { products } = useApp();
  const localProduct = products.find((product) => product.shopLink?.includes(code ?? ''));
  const [publicProduct, setPublicProduct] = useState<Product | null>(localProduct ?? null);

  useEffect(() => {
    if (!code || localProduct) return;
    apiFetch<{ product: Record<string, unknown> }>(`/public/shop/${encodeURIComponent(code)}`)
      .then((data) => setPublicProduct(apiProductToProduct(data.product)))
      .catch(() => setPublicProduct(null));
  }, [code, localProduct]);

  const product = localProduct ?? publicProduct;

  if (!product) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>
          Loading product…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ProductOverlay product={product} visible onClose={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: Platform.OS === 'web' ? 67 : 0 },
});