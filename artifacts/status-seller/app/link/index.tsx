import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { BUTTON_STYLES } from '@/constants/mockData';
import ProductOverlay from '@/components/ui/ProductOverlay';
import { Image } from 'react-native';
import { getImageSource } from '@/utils/imageSource';

const LINK_COLORS = [
  '#25D366',
  '#1A73E8',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#0EA5E9',
];

export default function LinkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products } = useApp();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const activeProducts = products.filter((p) => p.status === 'active');

  const [selectedProduct, setSelectedProduct] = useState(activeProducts[0] ?? products[0]);
  const [selectedStyle, setSelectedStyle] = useState('shop_now');
  const [buttonColor, setButtonColor] = useState(colors.primary);
  const [copied, setCopied] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const link = selectedProduct?.shopLink ?? 'statusseller.app/p/demo';
  const fullLink = `https://${link}`;
  const buttonStyleObj = BUTTON_STYLES.find((b) => b.id === selectedStyle);

  const handleCopy = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!selectedProduct) return;
    try {
      await Share.share({
        message: `Shop ${selectedProduct.title} on StatusSeller 🛍️\n${fullLink}`,
        title: selectedProduct?.title,
      });
    } catch {
      // dismissed
    }
  };

  const handleWhatsApp = async () => {
    if (!selectedProduct) return;
    const msg = `Hi! Check out *${selectedProduct.title}* – only KSh ${selectedProduct.price.toLocaleString()} 🔥\n\nShop now: ${fullLink}`;
    try {
      await Share.share({ message: msg });
    } catch {
      // dismissed
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Shopping Link
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Select Product */}
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          SELECT PRODUCT
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 22 }}>
          <View style={styles.productRow}>
            {(activeProducts.length > 0 ? activeProducts : products).map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => setSelectedProduct(product)}
                style={[
                  styles.productChip,
                  {
                    backgroundColor: selectedProduct?.id === product.id ? colors.primaryLight : colors.card,
                    borderColor: selectedProduct?.id === product.id ? colors.primary : colors.border,
                    borderRadius: 14,
                  },
                ]}
              >
                <View style={[styles.productThumb, { backgroundColor: product.colorHex ?? colors.muted, borderRadius: 8 }]}>
                  <Ionicons name="cube-outline" size={16} color="rgba(255,255,255,0.6)" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.productChipTitle,
                      {
                        color: selectedProduct?.id === product.id ? colors.primary : colors.foreground,
                        fontFamily: 'Inter_600SemiBold',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {product.title}
                  </Text>
                  <Text style={[styles.productChipPrice, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    KSh {product.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Live Preview */}
        {selectedProduct && (
          <View style={{ marginBottom: 22 }}>
            <View style={styles.previewHeader}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                CUSTOMER PREVIEW
              </Text>
              <TouchableOpacity
                onPress={() => setOverlayVisible(true)}
                style={[styles.fullPreviewBtn, { backgroundColor: colors.primaryLight, borderRadius: 99 }]}
              >
                <Ionicons name="expand-outline" size={14} color={colors.primary} />
                <Text style={[styles.fullPreviewText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  Full preview
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.preview,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              {/* Mini product image */}
              {selectedProduct.images?.[0] ? (
                <Image
                  source={getImageSource(selectedProduct.images[0])}
                  style={[styles.previewImage, { borderRadius: 12 }]}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={[selectedProduct.colorHex ?? colors.primary + 'CC', selectedProduct.colorHex ? selectedProduct.colorHex + '88' : colors.primary + '44']}
                  style={[styles.previewImage, { borderRadius: 12 }]}
                >
                  <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.4)" />
                </LinearGradient>
              )}
              <Text style={[styles.previewTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {selectedProduct.title}
              </Text>
              <Text style={[styles.previewPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                KSh {selectedProduct.price.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => setOverlayVisible(true)}
                style={[styles.previewBtn, { backgroundColor: buttonColor, borderRadius: 12 }]}
                activeOpacity={0.85}
              >
                <Ionicons name={(buttonStyleObj?.icon ?? 'cart-outline') as any} size={18} color="#fff" />
                <Text style={[styles.previewBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
                  {'  '}{buttonStyleObj?.label ?? 'Shop Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Button Style */}
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          BUTTON STYLE
        </Text>
        <View style={[styles.buttonStylesGrid, { marginBottom: 20 }]}>
          {BUTTON_STYLES.map((bs) => (
            <TouchableOpacity
              key={bs.id}
              onPress={() => setSelectedStyle(bs.id)}
              style={[
                styles.buttonStyleChip,
                {
                  backgroundColor: selectedStyle === bs.id ? colors.primaryLight : colors.card,
                  borderColor: selectedStyle === bs.id ? colors.primary : colors.border,
                  borderRadius: 10,
                },
              ]}
            >
              <Ionicons name={bs.icon as any} size={16} color={selectedStyle === bs.id ? colors.primary : colors.mutedForeground} />
              <Text
                style={[
                  styles.buttonStyleText,
                  {
                    color: selectedStyle === bs.id ? colors.primary : colors.foreground,
                    fontFamily: selectedStyle === bs.id ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {' '}{bs.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Button Color */}
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginBottom: 12 }]}>
          BUTTON COLOR
        </Text>
        <View style={[styles.colorsRow, { marginBottom: 24 }]}>
          {LINK_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setButtonColor(c)}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: c,
                  borderWidth: buttonColor === c ? 3 : 0,
                  borderColor: colors.background,
                  shadowColor: c,
                  shadowOpacity: buttonColor === c ? 0.5 : 0,
                  shadowRadius: 8,
                  elevation: buttonColor === c ? 6 : 0,
                },
              ]}
            >
              {buttonColor === c && <Ionicons name="checkmark" size={14} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Generated Link */}
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', marginBottom: 10 }]}>
          YOUR SHOPPING LINK
        </Text>
        <TouchableOpacity
          onPress={handleCopy}
          style={[styles.linkBox, { backgroundColor: colors.card, borderColor: copied ? colors.success : colors.primary, borderRadius: 14 }]}
          activeOpacity={0.7}
        >
          <Ionicons name={copied ? 'checkmark-circle' : 'link-outline'} size={20} color={copied ? colors.success : colors.primary} />
          <Text
            style={[styles.linkText, { color: copied ? colors.success : colors.foreground, fontFamily: 'Inter_500Medium' }]}
            numberOfLines={1}
          >
            {'  '}{fullLink}
          </Text>
          <View style={[styles.copyTag, { backgroundColor: copied ? colors.success + '20' : colors.primaryLight, borderRadius: 8 }]}>
            <Text style={[styles.copyTagText, { color: copied ? colors.success : colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Share Actions */}
        <View style={[styles.shareGrid, { marginBottom: 24 }]}>
          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.shareCard, { backgroundColor: copied ? colors.success + '15' : colors.primaryLight, borderRadius: 14 }]}
          >
            <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={22} color={copied ? colors.success : colors.primary} />
            <Text style={[styles.shareCardText, { color: copied ? colors.success : colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWhatsApp}
            style={[styles.shareCard, { backgroundColor: '#25D36615', borderRadius: 14 }]}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <Text style={[styles.shareCardText, { color: '#25D366', fontFamily: 'Inter_600SemiBold' }]}>
              WhatsApp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareCard, { backgroundColor: colors.muted, borderRadius: 14 }]}
          >
            <Ionicons name="share-social-outline" size={22} color={colors.foreground} />
            <Text style={[styles.shareCardText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link Performance */}
        {selectedProduct && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.statsTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Link Performance
            </Text>
            <View style={styles.statsRow}>
              {[
                { icon: 'eye-outline' as const, label: 'Views', value: selectedProduct.views.toString(), color: colors.accent },
                { icon: 'cart-outline' as const, label: 'Orders', value: selectedProduct.orders.toString(), color: colors.success },
                {
                  icon: 'analytics-outline' as const,
                  label: 'Conv.',
                  value: selectedProduct.views > 0
                    ? `${Math.round((selectedProduct.orders / selectedProduct.views) * 100)}%`
                    : '0%',
                  color: colors.warning,
                },
              ].map((s) => (
                <View key={s.label} style={styles.statItem}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                  <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Product Preview Overlay */}
      <ProductOverlay
        product={selectedProduct ?? null}
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
      />
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
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  scroll: { padding: 16, gap: 0 },
  label: { fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  productRow: { flexDirection: 'row', gap: 10, paddingRight: 16 },
  productChip: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1.5, gap: 10, maxWidth: 200 },
  productThumb: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  productChipTitle: { fontSize: 13, maxWidth: 120 },
  productChipPrice: { fontSize: 12 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fullPreviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5 },
  fullPreviewText: { fontSize: 12 },
  preview: { padding: 20, alignItems: 'center', gap: 10, borderWidth: 1 },
  previewImage: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { fontSize: 17, textAlign: 'center' },
  previewPrice: { fontSize: 22 },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    justifyContent: 'center',
  },
  previewBtnText: { fontSize: 16, color: '#fff' },
  buttonStylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buttonStyleChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  buttonStyleText: { fontSize: 13 },
  colorsRow: { flexDirection: 'row', gap: 12 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.5, marginBottom: 14 },
  linkText: { flex: 1, fontSize: 13 },
  copyTag: { paddingHorizontal: 10, paddingVertical: 4 },
  copyTagText: { fontSize: 12 },
  shareGrid: { flexDirection: 'row', gap: 10, marginTop: 4 },
  shareCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 6 },
  shareCardText: { fontSize: 13 },
  statsCard: { padding: 16, borderWidth: 1 },
  statsTitle: { fontSize: 15, marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
});
