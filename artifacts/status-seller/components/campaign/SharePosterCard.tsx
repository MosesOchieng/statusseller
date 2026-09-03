import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getImageSource } from '@/utils/imageSource';
import type { ImageAdjustments, PosterEffect, Product } from '@/types';

type SharePosterCardProps = {
  posterImage?: string | number | object;
  backgroundSource?: ImageSourcePropType;
  backgroundColor: string;
  logoSource?: ImageSourcePropType;
  product: Product | undefined;
  title: string;
  price: string;
  badge: string;
  link: string;
  showLogo: boolean;
  showLink: boolean;
  fit: 'cover' | 'contain';
  adjustments: ImageAdjustments;
  effect: PosterEffect;
  style?: StyleProp<ViewStyle>;
};

const SharePosterCard = React.forwardRef<View, SharePosterCardProps>(function SharePosterCard({
  posterImage,
  backgroundSource,
  backgroundColor,
  logoSource,
  title,
  price,
  badge,
  link,
  showLogo,
  showLink,
  fit,
  adjustments,
  style,
}, ref) {
  const imageFilter = {
    filter: `brightness(${100 + adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) sepia(${Math.max(adjustments.warmth, 0) / 100})`,
  } as any;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, { backgroundColor }, style]}
      accessibilityLabel={`${title} product poster`}
    >
      {backgroundSource && <Image source={backgroundSource} style={styles.background} resizeMode="cover" />}
      <LinearGradient
        colors={[backgroundColor + '18', '#111827E8']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge || 'NEW ARRIVAL'}</Text>
          </View>
          {showLogo && logoSource && <Image source={logoSource} style={styles.logo} resizeMode="contain" />}
        </View>

        <Text style={styles.title}>{title.toUpperCase()}</Text>

        <View style={styles.imageFrame}>
          {posterImage ? (
            <Image
              source={getImageSource(posterImage)}
              style={[styles.productImage, imageFilter]}
              resizeMode={fit}
            />
          ) : (
            <View style={styles.emptyImage}>
              <Feather name="image" size={28} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>Add a product photo</Text>
            </View>
          )}
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.delivery}>Free Delivery Nairobi</Text>
        </View>

        {showLink && (
          <View style={styles.shopButton}>
            <Feather name="shopping-bag" size={15} color="#111827" />
            <Text style={styles.shopText}>Shop Now</Text>
          </View>
        )}

        {link ? (
          <Text style={styles.link} numberOfLines={1}>
            Shop now: {link}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

export default SharePosterCard;

const styles = StyleSheet.create({
  card: {
    width: 360,
    minHeight: 560,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  background: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  content: { padding: 22, gap: 12, minHeight: 560 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#25D366', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  logo: { width: 105, height: 42 },
  title: { color: '#fff', fontSize: 23, lineHeight: 28, fontWeight: '800', maxWidth: '92%' },
  imageFrame: {
    width: '100%',
    height: 250,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(17,24,39,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: { width: '100%', height: '100%' },
  emptyImage: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  priceBlock: { gap: 2 },
  price: { color: '#25D366', fontSize: 25, fontWeight: '800' },
  delivery: { color: 'rgba(255,255,255,0.78)', fontSize: 13 },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
  },
  shopText: { color: '#111827', fontSize: 16, fontWeight: '800' },
  link: { color: 'rgba(255,255,255,0.78)', fontSize: 11, textAlign: 'center', marginTop: 2 },
});