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
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
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
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status: permStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 8));
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status: permStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (permStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 8));
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAIGenerate = () => {
    if (!title) {
      Alert.alert('Enter a title first', 'Please enter the product title before generating a description.');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setDescription(
        `Premium ${title} — crafted for quality, style, and performance. 100% authentic with manufacturer's warranty. Perfect for everyday use. Fast delivery across Kenya. Available in multiple variants to suit your style.`
      );
      setAiLoading(false);
    }, 1200);
  };

  const handleSave = async () => {
    if (!title || !price) {
      Alert.alert('Missing fields', 'Please fill in the product title and price.');
      return;
    }
    setLoading(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await addProduct({
        title,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        currency: 'KSh',
        images,
        category,
        stock: Number(stock) || 0,
        sku,
        variants: [],
        status,
        colorHex: CATEGORY_COLORS[category] ?? '#888',
      });
      router.back();
    } catch (err) {
      console.error('Failed to save product:', err);
      Alert.alert('Error', 'Could not save the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Add Product
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image picker */}
        {images.length === 0 ? (
          <View style={styles.imageActions}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={[styles.imagePickerBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Feather name="image" size={28} color={colors.primary} />
              <Text style={[styles.imagePickerTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Upload Photos
              </Text>
              <Text style={[styles.imagePickerSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                From gallery · Up to 8 photos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={[styles.cameraBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
            >
              <Feather name="camera" size={22} color={colors.primary} />
              <Text style={[styles.cameraBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Camera
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagesGrid}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumbWrap}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={[styles.imageRemoveBtn, { backgroundColor: colors.destructive }]}
                >
                  <Feather name="x" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 8 && (
              <TouchableOpacity
                onPress={handlePickImage}
                style={[styles.addMoreBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Feather name="plus" size={24} color={colors.mutedForeground} />
                <Text style={[styles.addMoreText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Add more
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Input label="Product Title *" placeholder="e.g., Nike Air Force 1" value={title} onChangeText={setTitle} leftIcon="cube-outline" />

          {/* Description + AI */}
          <View style={styles.descWrap}>
            <View style={styles.descHeader}>
              <Text style={[styles.descLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Description</Text>
              <TouchableOpacity
                onPress={handleAIGenerate}
                disabled={aiLoading}
                style={[styles.aiBtn, { backgroundColor: colors.primary + '15', borderRadius: 99 }]}
              >
                <Feather name="zap" size={13} color={colors.primary} />
                <Text style={[styles.aiBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {'  '}{aiLoading ? 'Generating…' : 'AI Generate'}
                </Text>
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Describe your product…"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Price (KSh) *" placeholder="0" value={price} onChangeText={setPrice} keyboardType="numeric" leftIcon="pricetag-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Original Price" placeholder="0 (optional)" value={originalPrice} onChangeText={setOriginalPrice} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Stock" placeholder="0" value={stock} onChangeText={setStock} keyboardType="numeric" leftIcon="archive-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="SKU" placeholder="e.g., NAF1-42" value={sku} onChangeText={setSku} autoCapitalize="characters" />
            </View>
          </View>

          {/* Category */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
              {PRODUCT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, { backgroundColor: category === cat ? colors.primary : colors.muted, borderRadius: 99 }]}
                >
                  <Text style={[styles.chipText, { color: category === cat ? '#fff' : colors.foreground, fontFamily: category === cat ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Status */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Status</Text>
          <View style={styles.statusRow}>
            {([['active', 'Active', '#22C55E'], ['draft', 'Draft', '#F59E0B'], ['out_of_stock', 'Out of Stock', '#EF4444']] as const).map(([val, label, color]) => (
              <TouchableOpacity
                key={val}
                onPress={() => setStatus(val)}
                style={[styles.statusChip, { backgroundColor: status === val ? color + '20' : colors.muted, borderColor: status === val ? color : 'transparent', borderRadius: 10 }]}
              >
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={[styles.statusText, { color: status === val ? color : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Save Product" onPress={handleSave} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  saveText: { fontSize: 16 },
  imageActions: { flexDirection: 'row', gap: 10, margin: 16 },
  imagePickerBtn: { flex: 2, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', padding: 20, alignItems: 'center', gap: 8 },
  imagePickerTitle: { fontSize: 15 },
  imagePickerSub: { fontSize: 12, textAlign: 'center' },
  cameraBtn: { flex: 1, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  cameraBtnText: { fontSize: 12 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, margin: 16 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 84, height: 84, borderRadius: 12 },
  imageRemoveBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addMoreBtn: { width: 84, height: 84, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addMoreText: { fontSize: 10 },
  form: { paddingHorizontal: 16 },
  descWrap: { marginBottom: 16 },
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  descLabel: { fontSize: 14 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 },
  aiBtnText: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1.5, gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12 },
  scroll: {},
});
