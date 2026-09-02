import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { PRODUCT_CATEGORIES } from '@/constants/mockData';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { getImageSource } from '@/utils/imageSource';
import { getPublicCode, toPublicUrl } from '@/utils/links';
import type { ProductStatus } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  Footwear: '#E5E5E5',
  Electronics: '#1A1A2E',
  Clothing: '#1D3A6B',
  Accessories: '#7C3AED',
  Beauty: '#EC4899',
  Home: '#D97706',
};

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct, deleteProduct } = useApp();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const product = products.find((p) => p.id === id);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [stock, setStock] = useState(product?.stock.toString() ?? '');
  const [category, setCategory] = useState(product?.category ?? 'Electronics');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'active');
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Product not found
        </Text>
      </View>
    );
  }

  const statusVariant = {
    active: 'success' as const,
    draft: 'muted' as const,
    out_of_stock: 'error' as const,
  }[product.status];

  const statusLabel = { active: 'Active', draft: 'Draft', out_of_stock: 'Out of Stock' }[product.status];

  const handleSave = async () => {
    if (!title || !price) return;
    setSaving(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await updateProduct(product.id, {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        status,
        colorHex: CATEGORY_COLORS[category] ?? colors.muted,
      });
      setEditing(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Product?', `"${product.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await deleteProduct(product.id);
            router.back();
          } catch (err) {
            console.error('Failed to delete product:', err);
            Alert.alert('Error', 'Could not delete the product. Please try again.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
          numberOfLines={1}
        >
          {product.title}
        </Text>
        <View style={styles.headerActions}>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.headerBtn}>
              <Ionicons name="pencil-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product image */}
        <View
          style={[
            styles.imageArea,
            { backgroundColor: product.colorHex ?? colors.muted, borderRadius: colors.radius },
          ]}
        >
          {product.images?.[0] ? (
            <Image source={getImageSource(product.images[0])} style={styles.imageArea} resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={52} color={colors.mutedForeground + '60'} />
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'eye-outline' as const, label: 'Views', value: product.views.toString(), color: colors.accent },
            { icon: 'cart-outline' as const, label: 'Orders', value: product.orders.toString(), color: colors.success },
            {
              icon: 'analytics-outline' as const,
              label: 'Conv.',
              value: product.views > 0 ? `${Math.round((product.orders / product.views) * 100)}%` : '0%',
              color: colors.warning,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.statBox,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 },
              ]}
            >
              <Ionicons name={s.icon} size={16} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {editing ? (
          /* Edit form */
          <View style={styles.form}>
            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              leftIcon="cube-outline"
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="Price (KSh)" value={price} onChangeText={setPrice} keyboardType="numeric" leftIcon="pricetag-outline" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" leftIcon="archive-outline" />
              </View>
            </View>

            {/* Category */}
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.categoryRow}>
                {PRODUCT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      { backgroundColor: category === cat ? colors.primary : colors.muted, borderRadius: 99 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: category === cat ? '#fff' : colors.foreground, fontFamily: category === cat ? 'Inter_600SemiBold' : 'Inter_400Regular' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Status */}
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Status</Text>
            <View style={[styles.row, { marginBottom: 20 }]}>
              {([['active', 'Active', colors.success], ['draft', 'Draft', colors.warning], ['out_of_stock', 'Out of Stock', colors.destructive]] as const).map(([val, label, color]) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setStatus(val)}
                  style={[
                    styles.statusChip,
                    { backgroundColor: status === val ? color + '20' : colors.muted, borderColor: status === val ? color : 'transparent', borderRadius: 10 },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <Text style={[styles.chipText, { color: status === val ? color : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.editActions}>
              <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title="Save Changes" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          /* View mode */
          <View style={styles.details}>
            {/* Price + status */}
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.price, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                  {formatCurrency(product.price, product.currency)}
                </Text>
                {product.originalPrice && (
                  <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                    {formatCurrency(product.originalPrice, product.currency)}
                  </Text>
                )}
              </View>
              <Badge label={statusLabel} variant={statusVariant} size="md" />
            </View>

            {/* Info rows */}
            {[
              { label: 'Category', value: product.category, icon: 'folder-outline' as const },
              { label: 'Stock', value: `${product.stock} units`, icon: 'archive-outline' as const },
              { label: 'SKU', value: product.sku || '—', icon: 'barcode-outline' as const },
              { label: 'Added', value: formatRelativeTime(product.createdAt), icon: 'calendar-outline' as const },
            ].map((row) => (
              <View
                key={row.label}
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
              >
                <Ionicons name={row.icon} size={17} color={colors.mutedForeground} />
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {'  '}{row.label}
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {row.value}
                </Text>
              </View>
            ))}

            {/* Description */}
            {product.description ? (
              <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
                <Text style={[styles.descTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Description</Text>
                <Text style={[styles.descText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {product.description}
                </Text>
              </View>
            ) : null}

            {/* Shopping link */}
            <View style={[styles.linkCard, { backgroundColor: colors.primaryLight, borderRadius: 12 }]}>
              <View style={styles.linkTop}>
                <Ionicons name="link-outline" size={16} color={colors.primary} />
                <Text style={[styles.linkLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {'  '}Shopping Link
                </Text>
              </View>
              <Text style={[styles.linkUrl, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                {toPublicUrl(product.shopLink)}
              </Text>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  onPress={() => {
                    const code = getPublicCode(product.shopLink);
                    if (code) router.push(`/shop/${code}` as any);
                  }}
                  style={[styles.linkBtn, { backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.primary }]}
                >
                  <Text style={[styles.linkBtnText, { fontFamily: 'Inter_600SemiBold', color: colors.primary }]}>
                    👁 Preview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/link')}
                  style={[styles.linkBtn, { backgroundColor: colors.primary, borderRadius: 8, flex: 1 }]}
                >
                  <Text style={[styles.linkBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
                    Customize & Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Variants */}
            {product.variants.length > 0 && (
              <View style={[styles.variantsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
                <Text style={[styles.descTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Variants</Text>
                {product.variants.map((v) => (
                  <View key={v.name} style={styles.variantRow}>
                    <Text style={[styles.variantName, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                      {v.name}:{'  '}
                    </Text>
                    <View style={styles.optionsRow}>
                      {v.options.map((opt) => (
                        <View key={opt} style={[styles.optChip, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                          <Text style={[styles.optText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                            {opt}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerBtn: { padding: 4, minWidth: 32 },
  headerTitle: { flex: 1, fontSize: 17 },
  headerActions: { flexDirection: 'row', gap: 4 },
  scroll: { padding: 16, gap: 14 },
  imageArea: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, alignItems: 'center', padding: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11 },
  form: { gap: 0 },
  row: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13 },
  statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1.5, gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  editActions: { flexDirection: 'row', gap: 10 },
  details: { gap: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 26 },
  originalPrice: { fontSize: 14, textDecorationLine: 'line-through' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  infoLabel: { flex: 1, fontSize: 14 },
  infoValue: { fontSize: 14 },
  descCard: { padding: 14, borderWidth: 1, gap: 6 },
  descTitle: { fontSize: 15 },
  descText: { fontSize: 14, lineHeight: 20 },
  linkCard: { padding: 14, gap: 8 },
  linkTop: { flexDirection: 'row', alignItems: 'center' },
  linkLabel: { fontSize: 14 },
  linkUrl: { fontSize: 13 },
  linkActions: { flexDirection: 'row', gap: 8 },
  linkBtn: { paddingVertical: 10, alignItems: 'center', flex: 0 },
  linkBtnText: { fontSize: 14, color: '#fff' },
  variantsCard: { padding: 14, borderWidth: 1, gap: 10 },
  variantRow: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' },
  variantName: { fontSize: 13 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optChip: { paddingHorizontal: 10, paddingVertical: 4 },
  optText: { fontSize: 12 },
});
