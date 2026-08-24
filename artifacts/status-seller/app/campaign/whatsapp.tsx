import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getImageSource } from '@/utils/imageSource';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export default function WhatsAppPostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, store, campaignDraft } = useApp();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const product = products.find((p) => p.id === campaignDraft?.productId) ?? products.find((p) => p.status === 'active') ?? products[0];
  const posterImage = campaignDraft?.imageUri ?? product?.images?.[0]?.toString();

  const handlePost = async () => {
    const link = product?.shopLink ? `https://${product.shopLink}` : '';
    try {
      await Share.share({
        title: `${store?.name ?? 'Your shop'} status`,
        message: `${campaignDraft?.caption ?? `Shop ${product?.title ?? 'this product'}`}\n\nShop now: ${link}`,
      });
    } catch {
      // The native share sheet was dismissed.
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.whatsappIcon, { backgroundColor: '#25D366' }]}>
          <Feather name="message-circle" size={18} color="#fff" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          WhatsApp
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]}>
          <Feather name="edit-2" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* WhatsApp status preview */}
        <View style={[styles.statusPreview, { backgroundColor: '#111827', marginHorizontal: 16, borderRadius: 20 }]}>
          {/* WhatsApp header bar */}
          <View style={styles.waHeader}>
            <Text style={[styles.waTime, { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' }]}>9:41</Text>
            <Feather name="more-horizontal" size={18} color="rgba(255,255,255,0.6)" />
          </View>

          {/* Status name */}
          <View style={styles.waStatusName}>
            <Text style={[styles.waName, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
              {store?.name ?? 'Urban Wear'}
            </Text>
          </View>

          {/* Product card */}
          <View style={[styles.waProductCard, { backgroundColor: '#1F2937' }]}>
            {posterImage ? (
              <Image
                source={getImageSource(posterImage)}
                style={styles.waProductImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.waProductImage, { backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.waProductTitle, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
                  {product?.title?.toUpperCase() ?? 'NIKE\nAIR FORCE 1'}
                </Text>
              </View>
            )}
            <View style={styles.waProductInfo}>
              <Text style={[styles.waProductPrice, { color: '#25D366', fontFamily: 'Inter_700Bold' }]}>
                KSh {product?.price?.toLocaleString() ?? '6,000'}
              </Text>
              <TouchableOpacity style={[styles.waShopBtn, { backgroundColor: '#25D366' }]}>
                <Text style={[styles.waShopText, { fontFamily: 'Inter_700Bold', color: '#fff' }]}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Caption input */}
          <View style={styles.waCaptionRow}>
              <TextInput
              style={[styles.waCaptionInput, { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' }]}
                defaultValue={campaignDraft?.caption}
                placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <TouchableOpacity style={[styles.waSendBtn, { backgroundColor: '#25D366' }]}>
              <Feather name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            We prepare everything and open WhatsApp for you to post. Your customers tap the link in your status to shop.
          </Text>
        </View>

        {/* Status contacts */}
        <View style={[styles.contactsCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
          <View style={styles.contactsHeader}>
            <Feather name="users" size={16} color={colors.primary} />
            <Text style={[styles.contactsTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {'  '}Status (Contacts)
            </Text>
          </View>
          <Text style={[styles.contactsCount, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            All contacts will see this status
          </Text>
        </View>
      </ScrollView>

      {/* Post button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handlePost}
          style={[styles.postBtn, { backgroundColor: '#25D366' }]}
        >
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={[styles.postText, { fontFamily: 'Inter_700Bold' }]}>Post to WhatsApp Status</Text>
        </TouchableOpacity>
      </View>
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
    gap: 8,
  },
  backBtn: { padding: 4 },
  whatsappIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  editBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statusPreview: { marginTop: 16, marginBottom: 12, overflow: 'hidden' },
  waHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  waTime: { fontSize: 12 },
  waStatusName: { paddingHorizontal: 16, marginBottom: 12 },
  waName: { fontSize: 16 },
  waProductCard: { margin: 12, borderRadius: 16, overflow: 'hidden' },
  waProductImage: { height: 180, width: '100%', alignItems: 'center', justifyContent: 'center' },
  waProductTitle: { fontSize: 20, textAlign: 'center', lineHeight: 28 },
  waProductInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  waProductPrice: { fontSize: 20 },
  waShopBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  waShopText: { fontSize: 14 },
  waCaptionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  waCaptionInput: { flex: 1, fontSize: 14 },
  waSendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, marginBottom: 12 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 20 },
  contactsCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  contactsTitle: { fontSize: 14 },
  contactsCount: { fontSize: 13 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  postBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  postText: { fontSize: 16, color: '#fff' },
});
