import React, { useState } from 'react';
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
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PRODUCT_CATEGORIES } from '@/constants/mockData';
import type { ProductStatus } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  Footwear: '#E5E5E5',
  Electronics: '#1A1A2E',
  Clothing: '#1D3A6B',
  Accessories: '#7C3AED',
  Beauty: '#EC4899',
  Home: '#D97706',
};

export default function NewProductScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addProduct } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const handleAIGenerate = () => {
    if (!title) {
      Alert.alert('Enter a title first', 'Please enter the product title before generating a description.');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setDescription(
        `Premium ${title} — designed for quality and performance. This product is 100% authentic and comes with a manufacturer's warranty. Perfect for everyday use with a sleek and modern design. Fast delivery available across Kenya.`
      );
      setAiLoading(false);
    }, 1200);
  };

  const handleSave = () => {
    if (!title || !price) {
      Alert.alert('Missing fields', 'Please fill in the product title and price.');
      return;
    }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      addProduct({
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        currency: 'KSh',
        images: [],
        category,
        stock: Number(stock) || 0,
        sku,
        variants: [],
        status,
        colorHex: CATEGORY_COLORS[category] ?? colors.muted,
      });
      setLoading(false);
      router.back();
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Add Product
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image placeholder */}
        <TouchableOpacity
          style={[
            styles.imagePlaceholder,
            { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="camera-outline" size={32} color={colors.mutedForeground} />
          <Text style={[styles.imagePlaceholderText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Tap to add photos
          </Text>
          <Text style={[styles.imagePlaceholderSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Up to 8 photos or 1 video
          </Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <Input
            label="Product Title *"
            placeholder="e.g., Nike Air Force 1"
            value={title}
            onChangeText={setTitle}
            leftIcon="cube-outline"
          />

          {/* Description with AI button */}
          <View style={styles.descContainer}>
            <View style={styles.descHeader}>
              <Text style={[styles.descLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                Description
              </Text>
              <TouchableOpacity
                onPress={handleAIGenerate}
                disabled={aiLoading}
                style={[
                  styles.aiBtn,
                  { backgroundColor: colors.primaryLight, borderRadius: 99 },
                ]}
              >
                <Ionicons name="flash" size={13} color={colors.primary} />
                <Text style={[styles.aiBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {'  '}{aiLoading ? 'Generating...' : 'AI Generate'}
                </Text>
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Describe your product..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Price (KSh) *"
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                leftIcon="pricetag-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Original Price"
                placeholder="0"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
                hint="Leave blank if no discount"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Stock"
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                leftIcon="archive-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="SKU"
                placeholder="e.g., NAF1-42"
                value={sku}
                onChangeText={setSku}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Category */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.categoryRow}>
              {PRODUCT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.muted,
                      borderRadius: 99,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: category === cat ? '#fff' : colors.foreground,
                        fontFamily: category === cat ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Status */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            Status
          </Text>
          <View style={styles.statusRow}>
            {([['active', 'Active', colors.success], ['draft', 'Draft', colors.warning], ['out_of_stock', 'Out of Stock', colors.destructive]] as const).map(([val, label, color]) => (
              <TouchableOpacity
                key={val}
                onPress={() => setStatus(val)}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: status === val ? color + '20' : colors.muted,
                    borderColor: status === val ? color : 'transparent',
                    borderRadius: 10,
                  },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={[styles.statusText, { color: status === val ? color : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Save Product"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
            icon={<Ionicons name="checkmark" size={18} color="#fff" />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  saveText: { fontSize: 16 },
  imagePlaceholder: {
    margin: 16,
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePlaceholderText: { fontSize: 14 },
  imagePlaceholderSub: { fontSize: 12 },
  scroll: { flex: 1 },
  form: { paddingHorizontal: 16 },
  descContainer: { marginBottom: 16 },
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  descLabel: { fontSize: 14 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  aiBtnText: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8 },
  categoryText: { fontSize: 13 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12 },
});
