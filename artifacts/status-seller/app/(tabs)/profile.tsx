import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  iconColor?: string;
  destructive?: boolean;
}

function MenuItem({ icon, label, value, onPress, iconColor, destructive }: MenuItemProps) {
  const colors = useColors();
  const ic = iconColor ?? colors.primary;
  const textColor = destructive ? colors.destructive : colors.foreground;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.menuIconBox, { backgroundColor: ic + '18', borderRadius: 10 }]}>
        <Ionicons name={icon} size={18} color={ic} />
      </View>
      <Text style={[styles.menuLabel, { color: textColor, fontFamily: 'Inter_500Medium' }]}>
        {label}
      </Text>
      <View style={styles.menuRight}>
        {value && (
          <Text style={[styles.menuValue, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {value}
          </Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { store, user, logout, products, orders } = useApp();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const deliveredRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === 'web' ? 84 + 24 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: topInset + 12 }} />

      {/* Store Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.heroAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.heroAvatarText, { fontFamily: 'Inter_700Bold' }]}>
            {store?.name?.charAt(0) ?? 'S'}
          </Text>
        </View>

        <View style={styles.heroInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.storeName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {store?.name}
            </Text>
            {store?.verified && (
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.storeDesc, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {store?.description}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {'  '}{store?.location}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {'  '}Joined {store?.joinedDate ? formatDate(store.joinedDate) : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { paddingHorizontal: 16, marginVertical: 16 }]}>
        {[
          { label: 'Products', value: products.length.toString() },
          { label: 'Orders', value: orders.length.toString() },
          { label: 'Revenue', value: `KSh ${Math.round(deliveredRevenue / 1000)}K` },
          { label: 'Rating', value: `${store?.rating ?? 0} ★` },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statBox,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* WhatsApp connection */}
      <TouchableOpacity
        style={[
          styles.whatsappBanner,
          {
            backgroundColor: store?.whatsappLinked ? '#25D36615' : colors.card,
            borderColor: store?.whatsappLinked ? colors.primary : colors.border,
            borderRadius: colors.radius,
            marginHorizontal: 16,
            marginBottom: 16,
          },
        ]}
      >
        <Ionicons
          name="logo-whatsapp"
          size={22}
          color={store?.whatsappLinked ? colors.primary : colors.mutedForeground}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={[
              styles.waTitle,
              {
                color: store?.whatsappLinked ? colors.primary : colors.foreground,
                fontFamily: 'Inter_600SemiBold',
              },
            ]}
          >
            {store?.whatsappLinked ? 'WhatsApp Business Connected' : 'Connect WhatsApp Business'}
          </Text>
          <Text style={[styles.waSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {store?.whatsappLinked
              ? 'Your store is live on WhatsApp Status'
              : 'Reach customers through WhatsApp Status'}
          </Text>
        </View>
        <Ionicons
          name={store?.whatsappLinked ? 'checkmark-circle' : 'chevron-forward'}
          size={18}
          color={store?.whatsappLinked ? colors.primary : colors.mutedForeground}
        />
      </TouchableOpacity>

      {/* Menu sections */}
      {[
        {
          title: 'Store Settings',
          items: [
            { icon: 'storefront-outline' as const, label: 'Store Details', value: store?.name ?? '', iconColor: colors.primary },
            { icon: 'time-outline' as const, label: 'Business Hours', value: store?.businessHours ?? '', iconColor: colors.accent },
            { icon: 'bicycle-outline' as const, label: 'Delivery Settings', value: store?.deliveryRadius ?? '', iconColor: colors.warning },
            { icon: 'card-outline' as const, label: 'Payment Methods', iconColor: colors.success },
          ],
        },
        {
          title: 'AI & Integrations',
          items: [
            { icon: 'flash-outline' as const, label: 'AI Sales Agent', iconColor: colors.primary },
            { icon: 'share-social-outline' as const, label: 'Social Media Links', iconColor: colors.info },
            { icon: 'analytics-outline' as const, label: 'Analytics & Tracking', iconColor: colors.warning },
          ],
        },
        {
          title: 'Account',
          items: [
            { icon: 'person-outline' as const, label: 'Personal Info', value: user?.name ?? '', iconColor: colors.accent },
            { icon: 'shield-outline' as const, label: 'Security', iconColor: colors.info },
            { icon: 'notifications-outline' as const, label: 'Notifications', iconColor: colors.warning },
            { icon: 'help-circle-outline' as const, label: 'Help & Support', iconColor: colors.mutedForeground },
          ],
        },
      ].map((section) => (
        <View key={section.title} style={[styles.section, { marginHorizontal: 16, marginBottom: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            {section.title.toUpperCase()}
          </Text>
          <View
            style={[
              styles.menuCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            {section.items.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={'value' in item ? (item as { value: string }).value : undefined}
                iconColor={item.iconColor}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <View style={[styles.section, { marginHorizontal: 16 }]}>
        <View
          style={[
            styles.menuCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={logout}
            iconColor={colors.destructive}
            destructive
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  hero: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 32, color: '#fff' },
  heroInfo: { gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeName: { fontSize: 20 },
  storeDesc: { fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, alignItems: 'center', padding: 10, borderWidth: 1, gap: 3 },
  statValue: { fontSize: 17 },
  statLabel: { fontSize: 10 },
  whatsappBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
  },
  waTitle: { fontSize: 14 },
  waSub: { fontSize: 12 },
  section: {},
  sectionTitle: { fontSize: 11, letterSpacing: 0.8, marginBottom: 8 },
  menuCard: { borderWidth: 1, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuIconBox: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, maxWidth: 100 },
});
