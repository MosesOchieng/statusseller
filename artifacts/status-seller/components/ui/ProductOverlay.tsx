/**
 * ProductOverlay — customer-facing shopping card bottom sheet.
 * Appears when a merchant previews their product link or shares from the link screen.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_H * 0.72, 560);

const GRADIENT_MAP: Record<string, [string, string]> = {
  '#E5E5E5': ['#E5E5E5', '#C8C8C8'],
  '#1A1A2E': ['#1A1A2E', '#16213E'],
  '#1D3A6B': ['#1D3A6B', '#0F2849'],
  '#7C3AED': ['#7C3AED', '#5B21B6'],
  '#EC4899': ['#EC4899', '#BE185D'],
  '#D97706': ['#D97706', '#B45309'],
};

export default function ProductOverlay({ product, visible, onClose }: Props) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleBuy = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Shop ${product.title} for ${formatCurrency(product.price, product.currency)} 🛍️\nhttps://${product.shopLink}`,
        title: product.title,
      });
    } catch {
      // dismissed
    }
  };

  if (!product) return null;

  const gradientColors = GRADIENT_MAP[product.colorHex ?? ''] ?? [colors.primary + 'CC', colors.primary];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            height: SHEET_HEIGHT,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Product image */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imageArea}
        >
          <Ionicons name="image-outline" size={52} color="rgba(255,255,255,0.4)" />
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: colors.destructive }]}>
              <Text style={[styles.discountText, { fontFamily: 'Inter_700Bold' }]}>
                -{discountPct}%
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Category chip */}
          <View style={[styles.categoryChip, { backgroundColor: colors.muted, borderRadius: 99 }]}>
            <Text style={[styles.categoryText, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              {product.category}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]} numberOfLines={2}>
            {product.title}
          </Text>

          {product.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}

          {/* Price row */}
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {formatCurrency(product.price, product.currency)}
              </Text>
              {hasDiscount && (
                <Text style={[styles.originalPrice, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {formatCurrency(product.originalPrice!, product.currency)}
                </Text>
              )}
            </View>
            <View style={styles.stockBadge}>
              <View style={[styles.stockDot, { backgroundColor: product.stock > 0 ? colors.success : colors.destructive }]} />
              <Text style={[styles.stockText, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          </View>

          {/* Variants preview */}
          {product.variants.length > 0 && (
            <View style={styles.variantsRow}>
              {product.variants[0].options.slice(0, 5).map((opt) => (
                <View key={opt} style={[styles.variantChip, { backgroundColor: colors.muted, borderRadius: 8 }]}>
                  <Text style={[styles.variantText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{opt}</Text>
                </View>
              ))}
              {product.variants[0].options.length > 5 && (
                <Text style={[styles.variantMore, { color: colors.mutedForeground }]}>+{product.variants[0].options.length - 5}</Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {/* Share to WhatsApp */}
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: colors.muted, borderRadius: 14, borderColor: colors.border }]}
            >
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>

            {/* Buy / Order button */}
            <TouchableOpacity
              onPress={handleBuy}
              disabled={product.stock === 0}
              style={[
                styles.buyBtn,
                {
                  backgroundColor: product.stock > 0 ? colors.primary : colors.muted,
                  borderRadius: 14,
                  opacity: product.stock === 0 ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="cart-outline" size={20} color={product.stock > 0 ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.buyText, { color: product.stock > 0 ? '#fff' : colors.mutedForeground, fontFamily: 'Inter_700Bold' }]}>
                {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Powered by */}
          <View style={styles.poweredRow}>
            <Text style={[styles.poweredText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Powered by StatusSeller · Secure checkout
            </Text>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  imageArea: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  discountText: { fontSize: 12, color: '#fff' },
  content: { paddingHorizontal: 20, gap: 10 },
  categoryChip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4 },
  categoryText: { fontSize: 12 },
  title: { fontSize: 22, lineHeight: 28 },
  description: { fontSize: 14, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 26 },
  originalPrice: { fontSize: 14, textDecorationLine: 'line-through' },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 13 },
  variantsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  variantChip: { paddingHorizontal: 10, paddingVertical: 5 },
  variantText: { fontSize: 13 },
  variantMore: { fontSize: 13, alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  shareBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  buyText: { fontSize: 16 },
  poweredRow: { alignItems: 'center', paddingBottom: 4 },
  poweredText: { fontSize: 11 },
});
