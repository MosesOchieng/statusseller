import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Slide 1: Phone mockup showing WhatsApp status with Shop Now ──
function Slide1() {
  return (
    <View style={s1.root}>
      {/* Outer phone frame */}
      <View style={s1.phone}>
        {/* Status bar strip */}
        <View style={s1.statusBar}>
          <Text style={s1.statusTime}>9:41</Text>
          <View style={s1.statusIcons}>
            <Feather name="wifi" size={10} color="#fff" />
            <Feather name="battery" size={10} color="#fff" />
          </View>
        </View>
        {/* WhatsApp-style header */}
        <View style={s1.waHeader}>
          <View style={s1.storeAvatar}>
            <Text style={s1.storeAvatarText}>UW</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s1.storeName}>Urban Wear ✓</Text>
            <Text style={s1.storeTime}>Today, 10:30 AM</Text>
          </View>
          <Feather name="x" size={14} color="rgba(255,255,255,0.7)" />
        </View>

        {/* Product status image area */}
        <View style={s1.statusCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' }}
            style={s1.productImg}
            resizeMode="cover"
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={s1.imgOverlay}>
            <Text style={s1.newArrival}>NEW ARRIVAL</Text>
            <Text style={s1.productName}>Nike Air Force 1</Text>
            <Text style={s1.productPrice}>KSh 6,000</Text>
            <Text style={s1.deliveryTag}>Free Delivery Nairobi</Text>
          </LinearGradient>
        </View>

        {/* Shop Now button */}
        <View style={s1.shopNowWrap}>
          <TouchableOpacity style={s1.shopNowBtn}>
            <Feather name="shopping-bag" size={13} color="#fff" />
            <Text style={s1.shopNowText}>  Shop Now</Text>
          </TouchableOpacity>
          <Text style={s1.replyText}>↑ Reply</Text>
        </View>
      </View>

      {/* Platform icons row */}
      <View style={s1.platformsRow}>
        {[
          { label: 'WhatsApp', color: '#25D366', icon: '💬' },
          { label: 'Instagram', color: '#E1306C', icon: '📸' },
          { label: 'Facebook', color: '#1877F2', icon: '👍' },
          { label: 'TikTok', color: '#010101', icon: '🎵' },
          { label: 'Telegram', color: '#229ED9', icon: '✈️' },
        ].map((p) => (
          <View key={p.label} style={s1.platformPill}>
            <View style={[s1.platformIcon, { backgroundColor: p.color }]}>
              <Text style={{ fontSize: 10 }}>{p.icon}</Text>
            </View>
            <Text style={s1.platformLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s1 = StyleSheet.create({
  root: { alignItems: 'center', gap: 20 },
  phone: { width: 200, backgroundColor: '#0d1117', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0d1117' },
  statusTime: { color: '#fff', fontSize: 9, fontWeight: '700' },
  statusIcons: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  waHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1a1a2e' },
  storeAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' },
  storeAvatarText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  storeName: { color: '#fff', fontSize: 10, fontWeight: '700' },
  storeTime: { color: 'rgba(255,255,255,0.5)', fontSize: 8 },
  statusCard: { height: 160, position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  imgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  newArrival: { color: '#25D366', fontSize: 7, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  productName: { color: '#fff', fontSize: 12, fontWeight: '800' },
  productPrice: { color: '#fff', fontSize: 10, fontWeight: '600' },
  deliveryTag: { color: 'rgba(255,255,255,0.7)', fontSize: 7, marginTop: 2 },
  shopNowWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#0d1117' },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  shopNowText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  replyText: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
  platformsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 20 },
  platformPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  platformIcon: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  platformLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
});

// ── Slide 2: One Product. Every Platform. ──
function Slide2() {
  const platforms = [
    { label: 'WhatsApp', color: '#25D366', emoji: '💬' },
    { label: 'Instagram', color: '#E1306C', emoji: '📸' },
    { label: 'Facebook', color: '#1877F2', emoji: '👍' },
    { label: 'TikTok', color: '#010101', emoji: '🎵' },
  ];
  return (
    <View style={s2.root}>
      {/* Center product image */}
      <View style={s2.productWrap}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80' }}
          style={s2.productImg}
          resizeMode="cover"
        />
        <View style={s2.badge}>
          <Text style={s2.badgeText}>NEW ARRIVAL</Text>
        </View>
        <View style={s2.priceBadge}>
          <Text style={s2.priceText}>KSh 6,000</Text>
        </View>
      </View>

      {/* Platform grid */}
      <View style={s2.platformGrid}>
        {platforms.map((p) => (
          <View key={p.label} style={s2.platformCard}>
            <View style={[s2.platformCircle, { backgroundColor: p.color }]}>
              <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
            </View>
            <Text style={s2.platformName}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  root: { alignItems: 'center', gap: 24 },
  productWrap: { width: 160, height: 160, borderRadius: 28, overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  productImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#25D366', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  priceBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priceText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  platformGrid: { flexDirection: 'row', gap: 20 },
  platformCard: { alignItems: 'center', gap: 6 },
  platformCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  platformName: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
});

// ── Slide 3: Your Business Never Sleeps (AI chat demo) ──
function Slide3() {
  const msgs = [
    { role: 'customer', text: 'Is size 42 available? 🤔', time: '10:30 AM' },
    { role: 'seller', text: 'Yes! We have size 42 available in White and Black. Would you like me to place an order for you? 😊', time: '10:30 AM' },
  ];
  return (
    <View style={s3.root}>
      {/* Chat window mockup */}
      <View style={s3.chatCard}>
        {/* Header */}
        <View style={s3.chatHeader}>
          <View style={s3.chatAvatar}>
            <Text style={s3.chatAvatarText}>UW</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s3.chatName}>Urban Wear ✓</Text>
            <View style={s3.onlineRow}>
              <View style={s3.onlineDot} />
              <Text style={s3.onlineText}>Online · AI Active</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <View style={s3.msgs}>
          {msgs.map((m, i) => (
            <View
              key={i}
              style={[s3.msgRow, m.role === 'seller' ? s3.msgLeft : s3.msgRight]}
            >
              {m.role === 'seller' && (
                <View style={s3.sellerDot}>
                  <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>AI</Text>
                </View>
              )}
              <View style={[s3.bubble, m.role === 'seller' ? s3.sellerBubble : s3.customerBubble]}>
                <Text style={[s3.bubbleText, { color: m.role === 'seller' ? '#1a1a1a' : '#fff' }]}>{m.text}</Text>
                <Text style={[s3.bubbleTime, { color: m.role === 'seller' ? '#999' : 'rgba(255,255,255,0.7)' }]}>{m.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Stats row */}
      <View style={s3.statsRow}>
        {[
          { label: 'Response Time', value: '< 30s' },
          { label: 'Closed Sales', value: '94%' },
          { label: 'Availability', value: '24/7' },
        ].map((stat) => (
          <View key={stat.label} style={s3.statBox}>
            <Text style={s3.statValue}>{stat.value}</Text>
            <Text style={s3.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s3 = StyleSheet.create({
  root: { alignItems: 'center', gap: 20 },
  chatCard: { width: '100%', maxWidth: 300, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#25D366' },
  chatAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chatName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  onlineText: { color: 'rgba(255,255,255,0.9)', fontSize: 10 },
  msgs: { padding: 12, gap: 10 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  sellerDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { maxWidth: '78%', borderRadius: 14, padding: 10 },
  sellerBubble: { backgroundColor: '#F5F5F5', borderBottomLeftRadius: 4 },
  customerBubble: { backgroundColor: '#25D366', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 11, lineHeight: 16 },
  bubbleTime: { fontSize: 9, marginTop: 4, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, marginTop: 2, textAlign: 'center' },
});

// ── Slide 4: Grow Your Business Every Day (stats dashboard) ──
function Slide4() {
  const bars = [28, 45, 32, 67, 51, 43, 62];
  const maxBar = Math.max(...bars);
  return (
    <View style={s4.root}>
      <View style={s4.card}>
        {/* Revenue row */}
        <View style={s4.revenueRow}>
          <View>
            <Text style={s4.revenueLabel}>Total Sales (This Week)</Text>
            <Text style={s4.revenueValue}>KSh 48,500</Text>
            <View style={s4.trendRow}>
              <Feather name="trending-up" size={12} color="#25D366" />
              <Text style={s4.trendText}> +24.7%</Text>
            </View>
          </View>
          {/* Sparkline */}
          <View style={s4.sparkline}>
            {bars.map((v, i) => (
              <View
                key={i}
                style={[
                  s4.bar,
                  {
                    height: Math.max(4, (v / maxBar) * 40),
                    backgroundColor: i === bars.length - 1 ? '#25D366' : '#25D36640',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Metric cards */}
        <View style={s4.metricsRow}>
          {[
            { label: 'Orders', value: '128', change: '+12%' },
            { label: 'Visitors', value: '12.4K', change: '+18%' },
            { label: 'Conversion', value: '2.74%', change: '+15%' },
          ].map((m) => (
            <View key={m.label} style={s4.metric}>
              <Text style={s4.metricValue}>{m.value}</Text>
              <Text style={s4.metricLabel}>{m.label}</Text>
              <Text style={s4.metricChange}>{m.change}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s4 = StyleSheet.create({
  root: { alignItems: 'center' },
  card: { width: '100%', maxWidth: 300, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', padding: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  revenueLabel: { fontSize: 10, color: '#666', marginBottom: 2 },
  revenueValue: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  trendText: { color: '#25D366', fontSize: 11, fontWeight: '700' },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 40 },
  bar: { width: 8, borderRadius: 4 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, backgroundColor: '#F8FAF8', borderRadius: 12, padding: 10, alignItems: 'center' },
  metricValue: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  metricLabel: { fontSize: 9, color: '#666', marginTop: 2 },
  metricChange: { fontSize: 9, color: '#25D366', fontWeight: '700', marginTop: 2 },
});

// ── Slide data ──
const SLIDES = [
  {
    id: '1',
    title: 'Turn Every Status Into\na Store',
    subtitle: 'Create once, publish everywhere and sell 24/7.',
    bgColors: ['#0d1117', '#1a1a2e'] as [string, string],
    component: Slide1,
  },
  {
    id: '2',
    title: 'One Product.\nEvery Platform.',
    subtitle: 'Publish to WhatsApp, Instagram, Facebook, TikTok and more in one tap.',
    bgColors: ['#1a1a2e', '#0d2340'] as [string, string],
    component: Slide2,
  },
  {
    id: '3',
    title: 'Your Business\nNever Sleeps',
    subtitle: 'Our AI Assistant chats, negotiates, and closes sales while you focus on growth.',
    bgColors: ['#0d1117', '#1a0d2e'] as [string, string],
    component: Slide3,
  },
  {
    id: '4',
    title: 'Grow Your Business\nEvery Day',
    subtitle: 'Track performance, understand your customers, and grow revenue faster.',
    bgColors: ['#0d1a0d', '#0d2e14'] as [string, string],
    component: Slide4,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentIndex];

  return (
    <LinearGradient
      colors={currentSlide.bgColors}
      style={styles.container}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topInset + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>S</Text>
          </View>
          <Text style={[styles.brandText, { fontFamily: 'Inter_700Bold' }]}>
            Status<Text style={{ color: '#25D366' }}>Seller</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { fontFamily: 'Inter_400Regular' }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => {
          const SlideComponent = item.component;
          return (
            <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
              {/* Visual area */}
              <View style={styles.visualArea}>
                <SlideComponent />
              </View>
            </View>
          );
        }}
      />

      {/* Text + controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.slideTitle, { fontFamily: 'Inter_700Bold' }]}>
          {currentSlide.title}
        </Text>
        <Text style={[styles.slideSubtitle, { fontFamily: 'Inter_400Regular' }]}>
          {currentSlide.subtitle}
        </Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex
                  ? styles.dotActive
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {isLast ? (
          <View style={styles.lastButtons}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.getStartedBtn}
            >
              <Text style={[styles.getStartedText, { fontFamily: 'Inter_700Bold' }]}>Get Started →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.signinLink, { fontFamily: 'Inter_400Regular' }]}>
                Already have an account?{' '}
                <Text style={{ color: '#25D366', fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.navSkipBtn}
            >
              <Text style={[styles.navSkipText, { fontFamily: 'Inter_500Medium' }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.navNextBtn}
            >
              <Text style={[styles.navNextText, { fontFamily: 'Inter_600SemiBold' }]}>Next</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brandText: { fontSize: 18, color: '#fff' },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  slide: { paddingHorizontal: 20 },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  bottom: { paddingHorizontal: 20, gap: 16 },
  slideTitle: { fontSize: 26, color: '#fff', lineHeight: 34 },
  slideSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: '#25D366' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.25)' },
  navButtons: { flexDirection: 'row', gap: 12 },
  navSkipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  navSkipText: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  navNextBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navNextText: { fontSize: 15, color: '#fff' },
  lastButtons: { gap: 12 },
  getStartedBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#25D366',
  },
  getStartedText: { fontSize: 17, color: '#fff' },
  signinLink: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.65)' },
});
