import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getImageSource } from '@/utils/imageSource';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

const TABS = ['All', 'Active', 'Inactive', 'Drafts'] as const;
type TabType = (typeof TABS)[number];

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  active:       { bg: '#DCFCE7', text: '#15803D' },
  draft:        { bg: '#F3F4F6', text: '#6B7280' },
  out_of_stock: { bg: '#FEE2E2', text: '#B91C1C' },
};

function ProductThumb({ images, title, colorHex }: { images: Array<string | number | object>; title: string; colorHex?: string }) {
  const c = colorHex ?? '#25D366';
  if (images?.[0]) {
    return (
      <Image
        source={getImageSource(images[0])}
        style={styles.productThumb}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.productThumb, { backgroundColor: c + '22' }]}>
      <Text style={[styles.productInitials, { color: c }]}>
        {title.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, deleteProduct } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [search, setSearch] = useState('');
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === 'Active') return p.status === 'active';
    if (activeTab === 'Inactive') return p.status === 'out_of_stock';
    if (activeTab === 'Drafts') return p.status === 'draft';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Products
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}>
            <Feather name="filter" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/product/new')}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, marginHorizontal: 16 }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
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

      {/* List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.muted, borderRadius: 16 }]}>
            <Feather name="package" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No products found
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/product/new')}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { fontFamily: 'Inter_600SemiBold' }]}>Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((p) => {
            const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.draft;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => router.push(`/product/${p.id}` as any)}
                style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <ProductThumb images={p.images} title={p.title} colorHex={p.colorHex} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.productName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
                    numberOfLines={1}
                  >
                    {p.title}
                  </Text>
                  <Text style={[styles.productCategory, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {p.category}
                  </Text>
                  <View style={styles.productMeta}>
                    <Text style={[styles.productPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                      {formatCurrency(p.price, p.currency)}
                    </Text>
                    <Text style={[styles.productStock, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                      · {p.stock} in stock
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text, fontFamily: 'Inter_600SemiBold' }]}>
                      {p.status === 'out_of_stock' ? 'Out of Stock' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
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
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInitials: { fontSize: 16, fontWeight: '700' },
  productName: { fontSize: 14 },
  productCategory: { fontSize: 12, marginTop: 2 },
  productMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 13 },
  productStock: { fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10 },
  empty: { padding: 40, alignItems: 'center', gap: 12, marginTop: 20 },
  emptyText: { fontSize: 15 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  emptyBtnText: { color: '#fff', fontSize: 14 },
});
