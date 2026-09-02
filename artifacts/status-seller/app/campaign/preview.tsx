import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
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
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProductOverlay from '@/components/ui/ProductOverlay';
import { BRAND_ASSETS, CAMPAIGN_BACKGROUNDS } from '@/constants/localImages';
import type { ImageAdjustments, PosterEffect } from '@/types';
import { removeShopLinkLine, toPublicUrl } from '@/utils/links';
import { removeImageBackground, renderPosterToDataUrl } from '@/utils/imageProcessing';

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
const BACKGROUND_OPTIONS: Array<{ id: string; label: string; source: ImageSourcePropType }> = [
  { id: 'pink', label: 'Pink haze', source: CAMPAIGN_BACKGROUNDS.pink },
  { id: 'mint', label: 'Mint cloud', source: CAMPAIGN_BACKGROUNDS.mint },
  { id: 'lilac', label: 'Lilac sky', source: CAMPAIGN_BACKGROUNDS.lilac },
];
const EFFECT_PRESETS: Record<PosterEffect, ImageAdjustments> = {
  original: DEFAULT_IMAGE_ADJUSTMENTS,
  vivid: { brightness: 4, contrast: 115, saturation: 132, warmth: 0 },
  dreamy: { brightness: 8, contrast: 88, saturation: 112, warmth: -8 },
  mono: { brightness: 0, contrast: 112, saturation: 0, warmth: 0 },
  warm: { brightness: 4, contrast: 106, saturation: 118, warmth: 24 },
};
const EFFECT_OPTIONS: Array<{ id: PosterEffect; label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = [
  { id: 'original', label: 'Original', icon: 'circle' },
  { id: 'vivid', label: 'Vivid', icon: 'sun' },
  { id: 'dreamy', label: 'Dreamy', icon: 'cloud' },
  { id: 'mono', label: 'Mono', icon: 'moon' },
  { id: 'warm', label: 'Warm', icon: 'thermometer' },
];

export default function CampaignPreviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, campaignDraft, setCampaignDraft } = useApp();
  const [activePlatform, setActivePlatform] = useState<string>('WhatsApp');
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(removeShopLinkLine(campaignDraft?.caption ?? SAMPLE_CAPTION));
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>(campaignDraft?.imageFit ?? 'cover');
  const [background, setBackground] = useState(campaignDraft?.background ?? '#1A1A2E');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>(
    campaignDraft?.imageAdjustments ?? DEFAULT_IMAGE_ADJUSTMENTS,
  );
  const [showLinkOnImage, setShowLinkOnImage] = useState(campaignDraft?.showLinkOnImage ?? true);
  const [backgroundImage, setBackgroundImage] = useState(campaignDraft?.backgroundImage ?? 'pink');
  const [showLogoOnImage, setShowLogoOnImage] = useState(campaignDraft?.showLogoOnImage ?? true);
  const [backgroundRemoved, setBackgroundRemoved] = useState(campaignDraft?.removeBackground ?? false);
  const [effect, setEffect] = useState<PosterEffect>(campaignDraft?.effect ?? 'original');
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const product = products.find((p) => p.id === campaignDraft?.productId) ?? products.find((p) => p.status === 'active') ?? products[0];
  const originalImage = campaignDraft?.imageUri ?? product?.images?.[0];
  const posterImage = backgroundRemoved && campaignDraft?.processedImageUri
    ? campaignDraft.processedImageUri
    : originalImage;
  const publicLink = toPublicUrl(product?.shopLink);
  const selectedBackground = BACKGROUND_OPTIONS.find((option) => option.id === backgroundImage);
  const backgroundSource = selectedBackground?.source ?? (backgroundImage ? { uri: backgroundImage } : undefined);
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

  const applyEffect = (nextEffect: PosterEffect) => {
    const nextAdjustments = EFFECT_PRESETS[nextEffect];
    setEffect(nextEffect);
    setImageAdjustments(nextAdjustments);
    saveDraftChange({ effect: nextEffect, imageAdjustments: nextAdjustments });
  };

  const pickBackgroundImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setBackgroundImage(result.assets[0].uri);
      saveDraftChange({ backgroundImage: result.assets[0].uri });
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      Alert.alert('Add a product photo first', 'Choose a product image before creating a cutout.');
      return;
    }
    if (Platform.OS !== 'web') {
      Alert.alert('Use the web editor', 'Automatic cutout is available in the Expo web/PWA editor.');
      return;
    }
    setIsRemovingBackground(true);
    try {
      const cutout = await removeImageBackground(getImageSource(originalImage));
      setBackgroundRemoved(true);
      saveDraftChange({ processedImageUri: cutout, removeBackground: true });
    } catch (error) {
      Alert.alert('Could not remove the background', error instanceof Error ? error.message : 'Try a different photo.');
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleDownload = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Download on web', 'Open StatusSeller in a browser to download the finished poster.');
      return;
    }
    setIsDownloading(true);
    try {
      const dataUrl = await renderPosterToDataUrl({
        productSource: posterImage ? getImageSource(posterImage) : undefined,
        backgroundSource,
        logoSource: getImageSource(BRAND_ASSETS.logo),
        title: product?.title ?? 'Your product',
        price: `KSh ${product?.price?.toLocaleString() ?? '6,000'}`,
        badge: campaignDraft?.badge ?? 'SHOP NOW',
        link: publicLink,
        backgroundColor: background,
        showLogo: showLogoOnImage,
        showLink: showLinkOnImage,
        fit: imageFit,
        ...imageAdjustments,
        effect,
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${(product?.title ?? 'statusseller-poster').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Alert.alert('Could not download poster', error instanceof Error ? error.message : 'Try again after the image loads.');
    } finally {
      setIsDownloading(false);
    }
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
          <View style={[styles.previewGradient, { backgroundColor: background }]}>
            {backgroundSource && (
              <Image source={backgroundSource} style={styles.backgroundImage} resizeMode="cover" />
            )}
            <LinearGradient
              colors={[background + '25', background + 'E3']}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            {/* Product visual */}
            <View style={styles.productVisual}>
              <View style={styles.posterTopRow}>
                <View style={[styles.productBadge, { backgroundColor: '#25D366' }]}>
                  <Text style={[styles.productBadgeText, { fontFamily: 'Inter_600SemiBold' }]}>
                    {campaignDraft?.badge ?? 'NEW ARRIVAL'}
                  </Text>
                </View>
                {showLogoOnImage && (
                  <Image source={getImageSource(BRAND_ASSETS.logo)} style={styles.posterLogo} resizeMode="contain" />
                )}
              </View>
              <Text style={[styles.posterTitle, { fontFamily: 'Inter_700Bold' }]}>
                {product?.title?.toUpperCase() ?? 'YOUR PRODUCT'}
              </Text>
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
              </View>
              <View style={styles.posterPriceBlock}>
                <Text style={[styles.posterPrice, { fontFamily: 'Inter_700Bold' }]}>
                  KSh {product?.price?.toLocaleString() ?? '6,000'}
                </Text>
                <Text style={[styles.posterDelivery, { fontFamily: 'Inter_400Regular' }]}>
                  Free Delivery Nairobi
                </Text>
              </View>
              {showLinkOnImage && (
                <TouchableOpacity
                  onPress={() => setOverlayVisible(true)}
                  style={styles.shopNowPosterBtn}
                  accessibilityLabel="Preview shop now popup"
                >
                  <Feather name="shopping-bag" size={15} color="#111827" />
                  <Text style={[styles.shopNowPosterText, { fontFamily: 'Inter_700Bold' }]}>Shop Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>EFFECTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.effectRow}>
              {EFFECT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => applyEffect(option.id)}
                  style={[
                    styles.effectChip,
                    {
                      backgroundColor: effect === option.id ? colors.primaryLight : colors.background,
                      borderColor: effect === option.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather name={option.icon} size={14} color={effect === option.id ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.effectText, { color: effect === option.id ? colors.primary : colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>BACKGROUND IMAGE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.backgroundRow}>
              {BACKGROUND_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setBackgroundImage(option.id);
                    saveDraftChange({ backgroundImage: option.id });
                  }}
                  style={[styles.backgroundChoice, { borderColor: backgroundImage === option.id ? colors.primary : colors.border }]}
                  accessibilityLabel={`Use ${option.label} background`}
                >
                  <Image source={option.source} style={styles.backgroundThumb} />
                  {backgroundImage === option.id && (
                    <View style={[styles.backgroundCheck, { backgroundColor: colors.primary }]}>
                      <Feather name="check" size={11} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={pickBackgroundImage} style={[styles.uploadBackground, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Feather name="upload" size={17} color={colors.primary} />
                <Text style={[styles.uploadBackgroundText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Your photo</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.linkSettingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.controlLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginTop: 0 }]}>BRAND LOGO</Text>
                <Text style={[styles.editorSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Add StatusSeller to the poster.</Text>
              </View>
              <Switch
                value={showLogoOnImage}
                onValueChange={(value) => {
                  setShowLogoOnImage(value);
                  saveDraftChange({ showLogoOnImage: value });
                }}
                trackColor={{ false: colors.muted, true: colors.primary + '70' }}
                thumbColor={showLogoOnImage ? colors.primary : colors.mutedForeground}
              />
            </View>
            <View style={styles.cutoutRow}>
              <View style={[styles.cutoutIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="scissors" size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cutoutTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                  {backgroundRemoved ? 'Product cutout ready' : 'Remove photo background'}
                </Text>
                <Text style={[styles.editorSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {backgroundRemoved ? 'Your product is blended into the selected design.' : 'Keep the product and blend it into your design.'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (backgroundRemoved) {
                    setBackgroundRemoved(false);
                    saveDraftChange({ removeBackground: false });
                  } else {
                    void handleRemoveBackground();
                  }
                }}
                style={[styles.cutoutButton, { borderColor: colors.primary, backgroundColor: backgroundRemoved ? colors.primaryLight : colors.primary }]}
                disabled={isRemovingBackground}
              >
                {isRemovingBackground ? <ActivityIndicator size="small" color={colors.primary} /> : (
                  <Text style={[styles.cutoutButtonText, { color: backgroundRemoved ? colors.primary : '#fff', fontFamily: 'Inter_600SemiBold' }]}>
                    {backgroundRemoved ? 'Keep photo' : 'Auto cutout'}
                  </Text>
                )}
              </TouchableOpacity>
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
              value={removeShopLinkLine(caption)}
              onChangeText={(value) => {
                const cleanCaption = removeShopLinkLine(value);
                setCaption(cleanCaption);
                saveDraftChange({ caption: cleanCaption });
              }}
              multiline
              placeholder="Write a caption for your status"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.captionInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, fontFamily: 'Inter_400Regular' }]}
            />
            <TouchableOpacity onPress={handleDownload} style={[styles.downloadButton, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]} disabled={isDownloading}>
              {isDownloading ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="download" size={17} color={colors.primary} />}
              <Text style={[styles.downloadText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {isDownloading ? 'Preparing poster…' : 'Download finished image'}
              </Text>
            </TouchableOpacity>
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
            {removeShopLinkLine(caption)}
          </Text>
          {publicLink ? (
            <TouchableOpacity
              onPress={() => setOverlayVisible(true)}
              style={[styles.captionLinkRow, { borderTopColor: colors.border }]}
            >
              <Feather name="link" size={14} color={colors.primary} />
              <Text style={[styles.captionLinkText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Shop now: {publicLink}
              </Text>
            </TouchableOpacity>
          ) : null}
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
  previewGradient: { padding: 20, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  backgroundImage: { ...StyleSheet.absoluteFillObject },
  posterTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  posterLogo: { width: 112, height: 46 },
  productVisual: { alignItems: 'center', gap: 12 },
  productBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  productBadgeText: { fontSize: 11, color: '#fff' },
  posterTitle: { alignSelf: 'flex-start', color: '#fff', fontSize: 22, lineHeight: 28, maxWidth: '90%' },
  productImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageFrame: { width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  productImageText: { fontSize: 20, textAlign: 'center', lineHeight: 28 },
  posterPriceBlock: { alignSelf: 'flex-start', gap: 2 },
  posterPrice: { fontSize: 22, color: '#25D366' },
  posterDelivery: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  shopNowPosterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', paddingVertical: 13, borderRadius: 14, backgroundColor: '#fff' },
  shopNowPosterText: { fontSize: 15, color: '#111827' },
  captionsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  captionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  aiChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  aiChipText: { fontSize: 12 },
  editCaptions: { fontSize: 13 },
  captionText: { fontSize: 14, lineHeight: 22 },
  captionLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, paddingTop: 12, marginTop: 12 },
  captionLinkText: { flex: 1, fontSize: 13, lineHeight: 19 },
  editorCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  editorTitle: { fontSize: 16 },
  editorSub: { fontSize: 12, marginTop: 3 },
  controlLabel: { fontSize: 10, letterSpacing: 0.8, marginTop: 4 },
  fitRow: { flexDirection: 'row', gap: 8 },
  fitChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  fitText: { fontSize: 12 },
  effectRow: { gap: 8, paddingBottom: 2 },
  effectChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  effectText: { fontSize: 12 },
  backgroundRow: { gap: 10, paddingBottom: 2 },
  backgroundChoice: { width: 76, height: 58, borderRadius: 12, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  backgroundThumb: { width: '100%', height: '100%' },
  backgroundCheck: { position: 'absolute', right: 5, top: 5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  uploadBackground: { width: 82, height: 58, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 3 },
  uploadBackgroundText: { fontSize: 10 },
  swatchRow: { flexDirection: 'row', gap: 12, paddingVertical: 3 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  captionInput: { minHeight: 76, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, textAlignVertical: 'top' },
  linkSettingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  cutoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  cutoutIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cutoutTitle: { fontSize: 13 },
  cutoutButton: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9, minWidth: 86, alignItems: 'center' },
  cutoutButtonText: { fontSize: 11 },
  downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 13, marginTop: 4 },
  downloadText: { fontSize: 13 },
  adjustmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  adjustmentLabel: { flex: 1, fontSize: 13 },
  adjustmentButton: { width: 30, height: 30, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adjustmentValue: { width: 42, textAlign: 'center', fontSize: 12 },
  publishWrap: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  publishText: { fontSize: 16, color: '#fff' },
});
