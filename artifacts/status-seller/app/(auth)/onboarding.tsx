import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Turn Every Status Into a Store',
    subtitle: 'Create once, publish everywhere and sell 24/7.',
    icon: 'shopping-bag' as const,
    color: '#25D366',
    gradient: ['#25D366', '#128C7E'] as [string, string],
    platforms: ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Telegram'],
  },
  {
    id: '2',
    title: 'One Product.\nEvery Platform.',
    subtitle: 'Publish to WhatsApp, Instagram, Facebook, TikTok and more in one tap.',
    icon: 'share-2' as const,
    color: '#3B82F6',
    gradient: ['#3B82F6', '#8B5CF6'] as [string, string],
    platforms: [],
  },
  {
    id: '3',
    title: 'Your Business Never Sleeps',
    subtitle: 'Our Business Assistant chats, negotiates, and closes sales while you focus on growth.',
    icon: 'zap' as const,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#EC4899'] as [string, string],
    platforms: [],
  },
  {
    id: '4',
    title: 'Grow Your Business Every Day',
    subtitle: 'Track performance, understand your customers, and grow revenue faster with smart insights.',
    icon: 'trending-up' as const,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#EF4444'] as [string, string],
    platforms: [],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={[styles.topBar, { paddingTop: topInset + 16 }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoMarkText}>S</Text>
          </View>
          <Text style={[styles.brandText, { fontFamily: 'Inter_700Bold', color: colors.foreground }]}>
            Status<Text style={{ color: colors.primary }}>Seller</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Skip
          </Text>
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
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {/* Illustration */}
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.illustration}
            >
              <View style={styles.illustrationInner}>
                <Feather name={item.icon} size={64} color="rgba(255,255,255,0.9)" />
              </View>
              {/* Floating platform pills */}
              {item.platforms.length > 0 && (
                <View style={styles.platformsRow}>
                  {item.platforms.map((p: string) => (
                    <View key={p} style={styles.platformPill}>
                      <Text style={styles.platformPillText}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>

            {/* Text */}
            <View style={styles.slideText}>
              <Text style={[styles.slideTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {item.title}
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : [styles.dotInactive, { backgroundColor: colors.border }],
              ]}
            />
          ))}
        </View>

        {isLast ? (
          <View style={styles.lastButtons}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.getStartedText, { fontFamily: 'Inter_700Bold' }]}>Get Started 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.signinLink, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Already have an account?{' '}
                <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[styles.navSkipBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.navSkipText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navNextBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.navNextText, { fontFamily: 'Inter_600SemiBold' }]}>Next</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
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
  logoMark: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brandText: { fontSize: 18 },
  skipText: { fontSize: 14 },
  slide: { paddingHorizontal: 20 },
  illustration: {
    borderRadius: 24,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  illustrationInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformsRow: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  platformPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  platformPillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  slideText: { alignItems: 'center', paddingHorizontal: 8 },
  slideTitle: { fontSize: 26, textAlign: 'center', marginBottom: 12, lineHeight: 34 },
  slideSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  bottom: { paddingHorizontal: 20, gap: 20 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  dotInactive: { width: 8 },
  navButtons: { flexDirection: 'row', gap: 12 },
  navSkipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  navSkipText: { fontSize: 15 },
  navNextBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
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
  },
  getStartedText: { fontSize: 17, color: '#fff' },
  signinLink: { fontSize: 14, textAlign: 'center' },
});
