import React, { useState } from 'react';
import {
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

const PLATFORMS = [
  { id: 'whatsapp_status', name: 'WhatsApp Status', color: '#25D366' },
  { id: 'instagram_story', name: 'Instagram Story', color: '#E1306C' },
  { id: 'facebook_story', name: 'Facebook Story', color: '#1877F2' },
  { id: 'facebook_feed', name: 'Facebook Feed', color: '#1877F2' },
  { id: 'instagram_feed', name: 'Instagram Feed', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
] as const;

const PLATFORM_ICONS: Record<string, 'message-circle' | 'instagram' | 'facebook' | 'twitter' | 'send'> = {
  whatsapp_status: 'message-circle',
  instagram_story: 'instagram',
  instagram_feed: 'instagram',
  facebook_story: 'facebook',
  facebook_feed: 'facebook',
  telegram: 'send',
  x_twitter: 'twitter',
};

export default function PublishCampaignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set(['whatsapp_status']));
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const togglePlatform = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePublish = () => {
    if (selected.has('whatsapp_status')) {
      router.push('/campaign/whatsapp');
      return;
    }
    if (selected.has('instagram_story') || selected.has('instagram_feed')) {
      router.push('/campaign/instagram' as any);
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
          Publish Campaign
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Choose where to publish
        </Text>

        {PLATFORMS.map((platform) => {
          const isSelected = selected.has(platform.id);
          const icon = PLATFORM_ICONS[platform.id] ?? 'share-2';
          return (
            <TouchableOpacity
              key={platform.id}
              onPress={() => togglePlatform(platform.id)}
              style={[
                styles.platformRow,
                { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
              ]}
            >
              <View style={[styles.platformIcon, { backgroundColor: platform.color + '15' }]}>
                <Feather name={icon as any} size={20} color={platform.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.platformName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                  {platform.name}
                </Text>
                <Text style={[styles.platformStatus, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  Select it, then use your device share sheet
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isSelected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: 'transparent', borderColor: colors.border },
                ]}
              >
                {isSelected && <Feather name="check" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Publish button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.footerNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Publishing to {selected.size} platform{selected.size !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={selected.size === 0}
          style={[styles.publishBtn, { backgroundColor: selected.size > 0 ? colors.primary : colors.muted }]}
        >
          <Feather name="send" size={18} color={selected.size > 0 ? '#fff' : colors.mutedForeground} />
          <Text style={[styles.publishText, { fontFamily: 'Inter_700Bold', color: selected.size > 0 ? '#fff' : colors.mutedForeground }]}>
            Publish Now 🚀
          </Text>
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
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, textAlign: 'center' },
  subtitle: { fontSize: 14, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  platformIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  platformName: { fontSize: 14 },
  platformStatus: { fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  connectText: { fontSize: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, gap: 8 },
  footerNote: { fontSize: 13, textAlign: 'center' },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  publishText: { fontSize: 16 },
});
