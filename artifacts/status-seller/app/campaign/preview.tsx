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
  Switch,
} from 'react-native';
import { getImageSource } from '@/utils/imageSource';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProductOverlay from '@/components/ui/ProductOverlay';
import type { ImageAdjustments } from '@/types';
import { toPublicUrl } from '@/utils/links';

const PLATFORMS = ['WhatsApp', 'Instagram', 'TikTok', 'More'] as const;

const SAMPLE_CAPTION =
  'Step up your style with the all new Nike Air Force 1 ✈️\nComfort, Quality, Classic.\nGet yours now! 🔥\n\n#Nike #AirForce1 #UrbanWear #NewArrival';
const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = { brightness: 0, contrast: 100, saturation: 100, warmth: 0 };
const ADJUSTMENT_CONTROLS: Array<{ key: keyof ImageAdjustments; label: string; min: number; max: number; suffix: string }> = [
  { key: 'brightness', label: 'Brightness', min: -50, max: 50, suffix: '' },
  { key: 'contrast', label: 'Contrast', min: 50, max: 150, suffix: '' },
  { key: 'saturation', label: 'Saturation', min: 0, max: 150, suffix: '' },
  { key: 'warmth', label: 'Warmth', min: -50, max: 50, suffix: '' },
];

export default function CampaignPreviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, campaignDraft, setCampaignDraft } = useApp();
  const [activePlatform, setActivePlatform] = useState<string>('WhatsApp');
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(campaignDraft?.caption ?? SAMPLE_CAPTION);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>(campaignDraft?.imageFit ?? 'cover');
  const [background, setBackground] = useState(campaignDraft?.background ?? '#1A1A2E');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>(
    campaignDraft?.imageAdjustments ?? DEFAULT_IMAGE_ADJUSTMENTS,
  );
  const [showLinkOnImage, setShowLinkOnImage] = useState(campaignDraft?.showLinkOnImage ?? true);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const product = products.find((p) => p.id === campaignDraft?.productId) ?? products.find((p) => p.status === 'active') ?? products[0];
  const posterImage = campaignDraft?.imageUri ?? product?.images?.[0];
  const publicLink = toPublicUrl(product?.shopLink);
  const webImageFilter =
    Platform.OS === 'web'
      ? ({
          filter: `brightness(${100 + imageAdjustments.brightness}%) contrast(${imageAdjustments.contrast}%) saturate(${imageAdjustments.saturation}%) sepia(${Math.max(imageAdjustments.warmth, 0) / 100})`,
        } as any)
      : undefined;

  const saveDraftChange = (changes: Partial<NonNullable<typeof campaignDraft>>) => {
    if (!campaignDraft) return;
    setCampaignDraft({ ...campaignDraft, ...changes });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          AI Generated Campaign
        </Text>
          <TouchableOpacity
            onPress={() => setIsEditing((value) => !value)}
            style={[styles.editBtn, { borderColor: isEditing ? colors.primary : colors.border }]}
            accessibilityLabel="Edit poster"
          >
          <Feather name="edit-2" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ready banner */}
        <View style={[styles.readyBanner, { backgroundColor: colors.primary + '15', marginHorizontal: 16 }]}>
          <Feather name="check-circle" size={16} color={colors.primary} />
          <Text style={[styles.readyText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {'  '}Here's your ready-to-publish campaign 🚀
          </Text>
        </View>

        {/* Platform tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformTabs}
        >
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setActivePlatform(p)}
              style={[
                styles.platformTab,
                activePlatform === p
                  ? { borderBottomColor: colors.primary, borderBottomWidth: 2 }
                  : {},
              ]}
            >
              <Text
                style={[
                  styles.platformTabText,
                  { fontFamily: 'Inter_500Medium' },
                  activePlatform === p ? { color: colors.primary } : { color: colors.mutedForeground },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Campaign preview card */}
        <View style={[styles.previewCard, { backgroundColor: '#111', marginHorizontal: 16, borderRadius: 20 }]}>
          <LinearGradient
            colors={[background, background + 'B8']}
            style={styles.previewGradient}
          >
            {/* Product visual */}
            <View style={styles.productVisual}>
              <View style={[styles.productBadge, { backgroundColor: '#25D366' }]}>
                <Text style={[styles.productBadgeText, { fontFamily: 'Inter_600SemiBold' }]}>
                  {campaignDraft?.badge ?? 'SHOP NOW'}
                </Text>
              </View>
              <View style={styles.imageFrame}>
                {posterImage ? (
                  <Image
                    source={getImageSource(posterImage)}
                    style={[styles.productImagePlaceholder, webImageFilter]}
                    resizeMode={imageFit}
                  />
                ) : (
                  <View style={[styles.productImagePlaceholder, { backgroundColor: '#2A2A3E', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={[styles.productImageText, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
                      {product?.title?.toUpperCase() ?? 'YOUR PRODUCT'}
                    </Text>
                  </View>
                )}
                {posterImage && Platform.OS !== 'web' && imageAdjustments.brightness !== 0 && (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: imageAdjustments.brightness > 0 ? '#fff' : '#000', opacity: Math.min(Math.abs(imageAdjustments.brightness) / 100, 0.5) },
                    ]}
                  />
                )}
                {posterImage && Platform.OS !== 'web' && imageAdjustments.warmth !== 0 && (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: imageAdjustments.warmth > 0 ? '#F59E0B' : '#38BDF8', opacity: Math.min(Math.abs(imageAdjustments.warmth) / 140, 0.35) },
                    ]}
                  />
                )}
                {showLinkOnImage && (
                  <View style={styles.linkOverlay}>
                    <Feather name="link" size={11} color="#fff" />
                    <Text style={styles.linkOverlayText} numberOfLines={1}>{publicLink}</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfoRow}>
                <View style={[styles.storePill, { backgroundColor: '#25D366' }]}>
                  <Text style={[styles.storePillText, { fontFamily: 'Inter_600SemiBold' }]}>
                    {product ? 'Your shop' : 'StatusSeller'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setOverlayVisible(true)}
                  style={[styles.shopNowBtn, { backgroundColor: '#25D366' }]}
                  accessibilityLabel="Preview shop now popup"
                >
                  <Text style={[styles.shopNowText, { fontFamily: 'Inter_700Bold' }]}>
                    KSh {product?.price?.toLocaleString() ?? '6,000'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {isEditing && (
          <View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
            <View style={styles.editorHeader}>
              <View>
                <Text style={[styles.editorTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Customize poster</Text>
                <Text style={[styles.editorSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Make the image and message feel like your brand.
                </Text>
              </View>
              <Feather name="sliders" size={19} color={colors.primary} />
            </View>
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>PHOTO FIT</Text>
            <View style={styles.fitRow}>
              {(['cover', 'contain'] as const).map((fit) => (
                <TouchableOpacity
                  key={fit}
                  onPress={() => {
                    setImageFit(fit);
                    saveDraftChange({ imageFit: fit });
                  }}
                  style={[styles.fitChip, { backgroundColor: imageFit === fit ? colors.primaryLight : colors.muted, borderColor: imageFit === fit ? colors.primary : colors.border }]}
                >
                  <Feather name={fit === 'cover' ? 'maximize' : 'minimize'} size={15} color={imageFit === fit ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.fitText, { color: imageFit === fit ? colors.primary : colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                    {fit === 'cover' ? 'Fill frame' : 'Show full photo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.linkSettingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginTop: 0 }]}>LINK ON IMAGE</Text>
                <Text style={[styles.editorSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Customers can tap the same link from your caption.
                </Text>
              </View>
              <Switch
                value={showLinkOnImage}
                onValueChange={(value) => {
                  setShowLinkOnImage(value);
                  saveDraftChange({ showLinkOnImage: value });
                }}
                trackColor={{ false: colors.muted, true: colors.primary + '70' }}
                thumbColor={showLinkOnImage ? colors.primary : colors.mutedForeground}
              />
            </View>
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>PHOTO ADJUSTMENTS</Text>
            {ADJUSTMENT_CONTROLS.map((control) => (
              <View key={control.key} style={styles.adjustmentRow}>
                <Text style={[styles.adjustmentLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{control.label}</Text>
                <TouchableOpacity
                  accessibilityLabel={`Decrease ${control.label}`}
                  onPress={() => {
                    const value = Math.max(control.min, imageAdjustments[control.key] - (control.key === 'contrast' || control.key === 'saturation' ? 10 : 5));
                    const next = { ...imageAdjustments, [control.key]: value };
                    setImageAdjustments(next);
                    saveDraftChange({ imageAdjustments: next });
                  }}
                  style={[styles.adjustmentButton, { borderColor: colors.border }]}
                >
                  <Feather name="minus" size={14} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.adjustmentValue, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                  {imageAdjustments[control.key]}{control.suffix}
                </Text>
                <TouchableOpacity
                  accessibilityLabel={`Increase ${control.label}`}
                  onPress={() => {
                    const value = Math.min(control.max, imageAdjustments[control.key] + (control.key === 'contrast' || control.key === 'saturation' ? 10 : 5));
                    const next = { ...imageAdjustments, [control.key]: value };
                    setImageAdjustments(next);
                    saveDraftChange({ imageAdjustments: next });
                  }}
                  style={[styles.adjustmentButton, { borderColor: colors.border }]}
                >
                  <Feather name="plus" size={14} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            ))}
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>BACKGROUND</Text>
            <View style={styles.swatchRow}>
              {['#1A1A2E', '#0F766E', '#7C2D12', '#312E81', '#111827'].map((swatch) => (
                <TouchableOpacity
                  key={swatch}
                  onPress={() => {
                    setBackground(swatch);
                    saveDraftChange({ background: swatch });
                  }}
                  style={[styles.swatch, { backgroundColor: swatch, borderColor: background === swatch ? colors.primary : 'transparent' }]}
                >
                  {background === swatch && <Feather name="check" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>CAPTION</Text>
            <TextInput
              value={caption}
              onChangeText={(value) => {
                setCaption(value);
                saveDraftChange({ caption: value });
              }}
              multiline
              placeholder="Write a caption for your status"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.captionInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, fontFamily: 'Inter_400Regular' }]}
            />
          </View>
        )}

        {/* AI Captions */}
        <View style={[styles.captionsCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
          <View style={styles.captionsHeader}>
            <View style={[styles.aiChip, { backgroundColor: '#8B5CF615' }]}>
              <Feather name="zap" size={12} color="#8B5CF6" />
              <Text style={[styles.aiChipText, { color: '#8B5CF6', fontFamily: 'Inter_600SemiBold' }]}>
                {'  '}AI Captions
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.editCaptions, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.captionText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            {caption}
          </Text>
        </View>
      </ScrollView>

      {/* Publish button */}
      <View style={[styles.publishWrap, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.push('/campaign/publish')}
          style={[styles.publishBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={[styles.publishText, { fontFamily: 'Inter_700Bold' }]}>Publish Now 🚀</Text>
        </TouchableOpacity>
      </View>
      <ProductOverlay product={product ?? null} visible={overlayVisible} onClose={() => setOverlayVisible(false)} />
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
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, textAlign: 'center' },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginTop: 16, marginBottom: 8 },
  readyText: { fontSize: 13 },
  platformTabs: { paddingHorizontal: 16, gap: 4, marginBottom: 16 },
  platformTab: { paddingHorizontal: 16, paddingVertical: 10 },
  platformTabText: { fontSize: 14 },
  previewCard: { marginBottom: 14, overflow: 'hidden' },
  previewGradient: { padding: 20, borderRadius: 20 },
  productVisual: { alignItems: 'center', gap: 12 },
  productBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  productBadgeText: { fontSize: 11, color: '#fff' },
  productImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageFrame: { width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  linkOverlay: { position: 'absolute', bottom: 8, left: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.62)' },
  linkOverlayText: { flex: 1, color: '#fff', fontSize: 10, fontWeight: '600' },
  productImageText: { fontSize: 20, textAlign: 'center', lineHeight: 28 },
  productInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  storePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  storePillText: { fontSize: 12, color: '#fff' },
  shopNowBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  shopNowText: { fontSize: 14, color: '#fff' },
  captionsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  captionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  aiChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  aiChipText: { fontSize: 12 },
  editCaptions: { fontSize: 13 },
  captionText: { fontSize: 14, lineHeight: 22 },
  editorCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  editorTitle: { fontSize: 16 },
  editorSub: { fontSize: 12, marginTop: 3 },
  controlLabel: { fontSize: 10, letterSpacing: 0.8, marginTop: 4 },
  fitRow: { flexDirection: 'row', gap: 8 },
  fitChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  fitText: { fontSize: 12 },
  swatchRow: { flexDirection: 'row', gap: 12, paddingVertical: 3 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  captionInput: { minHeight: 76, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, textAlignVertical: 'top' },
  linkSettingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  adjustmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  adjustmentLabel: { flex: 1, fontSize: 13 },
  adjustmentButton: { width: 30, height: 30, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adjustmentValue: { width: 42, textAlign: 'center', fontSize: 12 },
  publishWrap: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  publishText: { fontSize: 16, color: '#fff' },
});
