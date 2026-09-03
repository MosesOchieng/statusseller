import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageSourcePropType,
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
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { BRAND_ASSETS, CAMPAIGN_BACKGROUNDS } from '@/constants/localImages';
import type { ImageAdjustments } from '@/types';
import { buildShareCaption, toPublicUrl } from '@/utils/links';
import { sharePoster } from '@/utils/sharePoster';
import SharePosterCard from '@/components/campaign/SharePosterCard';

export default function InstagramPostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, store, campaignDraft } = useApp();
  const posterRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const product = products.find((p) => p.id === campaignDraft?.productId) ?? products.find((p) => p.status === 'active') ?? products[0];
  const posterImage = campaignDraft?.removeBackground && campaignDraft.processedImageUri
    ? campaignDraft.processedImageUri
    : campaignDraft?.imageUri ?? product?.images?.[0];
  const link = toPublicUrl(product?.shopLink, '');
  const backgroundImage = campaignDraft?.backgroundImage;
  const backgroundSource: ImageSourcePropType | undefined = backgroundImage === 'pink'
    ? CAMPAIGN_BACKGROUNDS.pink
    : backgroundImage === 'mint'
      ? CAMPAIGN_BACKGROUNDS.mint
      : backgroundImage === 'lilac'
        ? CAMPAIGN_BACKGROUNDS.lilac
        : backgroundImage
          ? { uri: backgroundImage }
          : undefined;
  const adjustments: ImageAdjustments = campaignDraft?.imageAdjustments ?? { brightness: 0, contrast: 100, saturation: 100, warmth: 0 };
  const caption = buildShareCaption(campaignDraft?.caption ?? `Shop ${product?.title ?? 'this product'}`, link);
  const fileName = `${(product?.title ?? 'statusseller-poster').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.jpg`;

  const handlePost = async () => {
    setIsSharing(true);
    try {
      await sharePoster({
        viewRef: posterRef,
        fileName,
        caption,
        title: `${store?.name ?? 'Your shop'} Instagram post`,
      });
    } catch (error) {
      if (error instanceof Error && !error.message.includes('dismiss')) {
        Alert.alert('Poster ready', error.message);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.instagramIcon}>
          <Feather name="instagram" size={17} color="#fff" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Instagram</Text>
        <View style={{ flex: 1 }} />
        <View style={[styles.storyPill, { backgroundColor: '#E1306C15' }]}>
          <Text style={[styles.storyText, { color: '#E1306C', fontFamily: 'Inter_600SemiBold' }]}>Story / Feed</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Your product card is ready to share as an Instagram Story or Feed post.
        </Text>

        <View style={[styles.instagramPreview, { backgroundColor: '#111827' }]}>
          <View style={styles.previewTop}>
            <View style={styles.avatar}><Feather name="user" size={14} color="#fff" /></View>
            <Text style={[styles.accountName, { fontFamily: 'Inter_700Bold' }]}>{store?.name ?? 'Urban Wear'}</Text>
            <Text style={styles.previewMore}>•••</Text>
          </View>
          <SharePosterCard
            ref={posterRef}
            style={styles.posterCard}
            posterImage={posterImage}
            backgroundSource={backgroundSource}
            backgroundColor={campaignDraft?.background ?? '#1A1A2E'}
            logoSource={BRAND_ASSETS.logo}
            product={product}
            title={product?.title ?? 'Your product'}
            price={`KSh ${product?.price?.toLocaleString() ?? '6,000'}`}
            badge={campaignDraft?.badge ?? 'NEW ARRIVAL'}
            link={link}
            showLogo={campaignDraft?.showLogoOnImage ?? true}
            showLink={campaignDraft?.showLinkOnImage ?? true}
            fit={campaignDraft?.imageFit ?? 'cover'}
            adjustments={adjustments}
            effect={campaignDraft?.effect ?? 'original'}
          />
          <View style={styles.instagramCaption}>
            <Feather name="heart" size={18} color="#fff" />
            <Feather name="message-circle" size={18} color="#fff" />
            <Feather name="send" size={18} color="#fff" />
            <Text style={styles.captionHint}>Tap the link in the poster to shop</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="image" size={17} color="#E1306C" />
          <Text style={[styles.infoText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            The image card is shared first. Choose Instagram Story or Feed from the native share sheet. The shop link is printed on the card and included in the caption where supported.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={handlePost} disabled={isSharing} style={[styles.postBtn, { backgroundColor: '#E1306C' }]}>
          {isSharing ? <ActivityIndicator color="#fff" /> : <Feather name="instagram" size={18} color="#fff" />}
          <Text style={[styles.postText, { fontFamily: 'Inter_700Bold' }]}>
            {isSharing ? 'Preparing poster…' : 'Post image to Instagram'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 8 },
  backBtn: { padding: 4 },
  instagramIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#E1306C', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  storyPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  storyText: { fontSize: 11 },
  intro: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, fontSize: 14, lineHeight: 20 },
  instagramPreview: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', paddingTop: 4 },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E1306C', alignItems: 'center', justifyContent: 'center' },
  accountName: { color: '#fff', fontSize: 13, flex: 1 },
  previewMore: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  posterCard: { width: 'auto', minHeight: 560, marginHorizontal: 12, borderRadius: 16 },
  instagramCaption: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14 },
  captionHint: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginLeft: 'auto' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  postBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  postText: { color: '#fff', fontSize: 16 },
});