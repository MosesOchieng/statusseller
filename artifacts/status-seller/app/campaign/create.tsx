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
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const CAMPAIGN_GOALS = ['New Arrival', 'Flash Sale', 'Weekend Offer', 'Clearance', 'Brand Awareness', 'Custom'] as const;

const CREATION_OPTIONS = [
  { id: 'images', icon: 'image' as const, title: 'Upload Images', subtitle: 'Add photos from your gallery', color: '#3B82F6' },
  { id: 'videos', icon: 'video' as const, title: 'Upload Videos', subtitle: 'Add videos from your gallery', color: '#8B5CF6' },
  { id: 'ai', icon: 'zap' as const, title: 'Generate with AI', subtitle: 'Let AI create content for you', color: '#F59E0B' },
  { id: 'products', icon: 'package' as const, title: 'Select Products', subtitle: 'Choose from your catalogue', color: '#10B981' },
];

export default function CreateCampaignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products } = useApp();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const [selectedGoal, setSelectedGoal] = useState<string>('New Arrival');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const activeProducts = products.filter((p) => p.status === 'active');

  const handlePickImages = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photo library.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setUploadedImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 10));
    }
  };

  const handleOptionPress = async (id: string) => {
    setActiveOption(id);
    if (id === 'images') {
      await handlePickImages();
    } else if (id === 'ai' || id === 'products') {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push('/campaign/preview');
    }
  };

  const handleContinue = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/campaign/preview');
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Create Campaign</Text>
        <TouchableOpacity style={[styles.helpBtn, { borderColor: colors.border }]}>
          <Feather name="help-circle" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient colors={['#25D366', '#128C7E']} style={styles.heroBanner}>
          <Text style={[styles.heroTitle, { fontFamily: 'Inter_700Bold' }]}>What are you{'\n'}selling today?</Text>
          <Text style={[styles.heroSub, { fontFamily: 'Inter_400Regular' }]}>Create once, publish everywhere</Text>
          <View style={styles.heroIcon}>
            <Feather name="zap" size={28} color="rgba(255,255,255,0.6)" />
          </View>
        </LinearGradient>

        {/* Creation options */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          CONTENT SOURCE
        </Text>
        <View style={styles.optionsGrid}>
          {CREATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleOptionPress(opt.id)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: activeOption === opt.id ? opt.color + '15' : colors.card,
                  borderColor: activeOption === opt.id ? opt.color : colors.border,
                },
              ]}
            >
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '15' }]}>
                <Feather name={opt.icon} size={24} color={opt.color} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {opt.title}
              </Text>
              <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {opt.subtitle}
              </Text>
              {activeOption === opt.id && (
                <View style={[styles.optionCheck, { backgroundColor: opt.color }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Uploaded images preview */}
        {uploadedImages.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={styles.row}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                UPLOADED ({uploadedImages.length})
              </Text>
              <TouchableOpacity onPress={handlePickImages}>
                <Text style={[styles.addMore, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>+ Add more</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageRow}>
                {uploadedImages.map((uri, i) => (
                  <View key={i} style={styles.imageWrap}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    <TouchableOpacity
                      onPress={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                      style={[styles.imageRemove, { backgroundColor: '#EF444490' }]}
                    >
                      <Feather name="x" size={11} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Products picker */}
        {activeOption === 'products' && activeProducts.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
              SELECT PRODUCTS
            </Text>
            {activeProducts.slice(0, 5).map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => toggleProduct(product.id)}
                style={[
                  styles.productRow,
                  {
                    backgroundColor: selectedProducts.includes(product.id) ? colors.primary + '10' : colors.card,
                    borderColor: selectedProducts.includes(product.id) ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.productThumb, { backgroundColor: product.colorHex ?? colors.muted }]}>
                  <Text style={[styles.productInitials, { fontFamily: 'Inter_700Bold' }]}>
                    {product.title.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
                    {product.title}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                    KSh {product.price.toLocaleString()}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: selectedProducts.includes(product.id) ? colors.primary : 'transparent',
                    borderColor: selectedProducts.includes(product.id) ? colors.primary : colors.border,
                  },
                ]}>
                  {selectedProducts.includes(product.id) && <Feather name="check" size={12} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Campaign Goal */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          CAMPAIGN GOAL
        </Text>
        <View style={styles.goalPills}>
          {CAMPAIGN_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              onPress={() => setSelectedGoal(goal)}
              style={[
                styles.goalPill,
                {
                  backgroundColor: selectedGoal === goal ? colors.primary : colors.muted,
                  borderColor: selectedGoal === goal ? colors.primary : 'transparent',
                  borderRadius: 99,
                },
              ]}
            >
              <Text style={[styles.goalText, { color: selectedGoal === goal ? '#fff' : colors.foreground, fontFamily: selectedGoal === goal ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate */}
        <TouchableOpacity onPress={handleContinue} style={[styles.generateBtn, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={18} color="#fff" />
          <Text style={[styles.generateBtnText, { fontFamily: 'Inter_700Bold' }]}>
            {'  '}Generate Campaign with AI
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18 },
  helpBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  heroBanner: { borderRadius: 20, padding: 24, marginBottom: 24, overflow: 'hidden', position: 'relative' },
  heroTitle: { fontSize: 24, color: '#fff', lineHeight: 32, marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  heroIcon: { position: 'absolute', right: 20, top: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  optionCard: { width: '47.5%', borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 8, position: 'relative' },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 14 },
  optionSub: { fontSize: 12, lineHeight: 16 },
  optionCheck: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addMore: { fontSize: 13 },
  imageRow: { flexDirection: 'row', gap: 8 },
  imageWrap: { position: 'relative' },
  imageThumb: { width: 90, height: 90, borderRadius: 12 },
  imageRemove: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 12, gap: 12, marginBottom: 8 },
  productThumb: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productInitials: { fontSize: 14, color: '#fff' },
  productTitle: { fontSize: 14 },
  productPrice: { fontSize: 12, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  goalPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  goalPill: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  goalText: { fontSize: 13 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 17, borderRadius: 16 },
  generateBtnText: { fontSize: 16, color: '#fff' },
});
