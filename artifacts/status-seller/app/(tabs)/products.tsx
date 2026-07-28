import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ui/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import ProductOverlay from '@/components/ui/ProductOverlay';
import type { Product, ProductStatus } from '@/types';

type FilterTab = 'all' | ProductStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'out_of_stock', label: 'Out of Stock' },
];

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products } = useApp();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [overlayProduct, setOverlayProduct] = useState<Product | null>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, filter, search]);

  const counts: Record<FilterTab, number> = {
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    draft: products.filter((p) => p.status === 'draft').length,
    out_of_stock: products.filter((p) => p.status === 'out_of_stock').length,
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
        <View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Products
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {products.length} item{products.length !== 1 ? 's' : ''} in your store
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/product/new')}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 22 }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { paddingHorizontal: 16, paddingVertical: 10 }]}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.muted, borderRadius: 12, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search products…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              style={[
                styles.filterChip,
                { backgroundColor: active ? colors.primary : colors.muted, borderRadius: 99 },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: active ? '#fff' : colors.mutedForeground,
                    fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {item.label} ({counts[item.key]})
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Products list */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 84 + 20 : 110 },
        ]}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <ProductCard
                product={item}
                onPress={() => router.push(`/product/${item.id}` as any)}
              />
            </View>
            {/* Preview overlay button */}
            <TouchableOpacity
              onPress={() => setOverlayProduct(item)}
              style={[styles.previewBtn, { backgroundColor: colors.primaryLight, borderRadius: 10 }]}
            >
              <Ionicons name="eye-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title={search ? 'No products found' : 'No products yet'}
            subtitle={search ? 'Try a different search term' : 'Add your first product to start selling'}
            actionLabel={search ? undefined : 'Add Product'}
            onAction={search ? undefined : () => router.push('/product/new')}
          />
        }
        scrollEnabled
        showsVerticalScrollIndicator={false}
      />

      {/* Product preview overlay */}
      <ProductOverlay
        product={overlayProduct}
        visible={overlayProduct !== null}
        onClose={() => setOverlayProduct(null)}
      />
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24 },
  subtitle: { fontSize: 13, marginTop: 1 },
  addBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchRow: {},
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filters: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterText: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  previewBtn: { padding: 10, alignSelf: 'center' },
});
