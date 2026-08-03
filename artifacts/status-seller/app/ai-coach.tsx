import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '@/utils/formatters';

const AI_INSIGHTS = [
  'Blue Sneakers are selling 40% better than black.',
  'Best time to post today is 7:30 PM – 9:30 PM',
  'You have 18 low stock products.',
  'Would you like me to create today\'s campaign?',
];

const SUGGESTED_QUESTIONS = [
  'What should I post today?',
  'Which products need restocking?',
  'How can I increase conversions?',
  'Analyze my best customers',
];

export default function AICoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { store, orders } = useApp();
  const [input, setInput] = useState('');
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const revenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            AI Business Coach
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Your Growth Partner
          </Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: colors.primary + '15' }]}>
          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.activeText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Active</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting card */}
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.greetingCard, { marginHorizontal: 16, borderRadius: 20 }]}
        >
          <Text style={[styles.greetingTitle, { fontFamily: 'Inter_700Bold' }]}>
            Good Morning, {store?.name ?? 'Urban Wear'}! 👋
          </Text>
          <Text style={[styles.greetingSub, { fontFamily: 'Inter_400Regular' }]}>
            Here's your business summary
          </Text>
        </LinearGradient>

        {/* Yesterday's performance */}
        <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
          <View>
            <Text style={[styles.perfLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Yesterday's Performance
            </Text>
            <Text style={[styles.perfValue, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {formatCurrency(revenue, 'KSh')}
            </Text>
          </View>
          <View style={[styles.perfBadge, { backgroundColor: '#DCFCE7' }]}>
            <Feather name="trending-up" size={14} color="#15803D" />
            <Text style={[styles.perfChange, { color: '#15803D', fontFamily: 'Inter_600SemiBold' }]}>
              {'  '}+22.1%
            </Text>
          </View>
          <Text style={[styles.perfSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            vs previous day
          </Text>
        </View>

        {/* AI Insights */}
        <View style={[styles.insightsCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16 }]}>
          <View style={styles.insightsHeader}>
            <View style={[styles.insightIcon, { backgroundColor: '#8B5CF615' }]}>
              <Feather name="cpu" size={16} color="#8B5CF6" />
            </View>
            <Text style={[styles.insightsTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              AI Insights
            </Text>
          </View>
          {AI_INSIGHTS.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <View style={[styles.insightBullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.insightText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                {insight}
              </Text>
            </View>
          ))}
        </View>

        {/* Generate Campaign CTA */}
        <TouchableOpacity
          onPress={() => router.push('/campaign/create')}
          style={{ marginHorizontal: 16 }}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ctaBtn, { borderRadius: 16 }]}
          >
            <Feather name="zap" size={20} color="#fff" />
            <Text style={[styles.ctaText, { fontFamily: 'Inter_700Bold' }]}>
              Generate Campaign 🚀
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Suggested Questions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Ask me anything
          </Text>
          <View style={styles.suggestGrid}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.suggestBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.suggestText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                  {q}
                </Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular', backgroundColor: colors.muted }]}
          placeholder="Ask anything..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
        >
          <Feather name="send" size={18} color={input.trim() ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 16 },
  headerSub: { fontSize: 12, marginTop: 2 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  activeDot: { width: 7, height: 7, borderRadius: 4 },
  activeText: { fontSize: 12 },
  greetingCard: { padding: 20, marginTop: 16, marginBottom: 12 },
  greetingTitle: { fontSize: 18, color: '#fff', marginBottom: 4 },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  perfCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  perfLabel: { fontSize: 13, marginBottom: 4 },
  perfValue: { fontSize: 24, marginBottom: 8 },
  perfBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 4 },
  perfChange: { fontSize: 13 },
  perfSub: { fontSize: 12 },
  insightsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  insightIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightsTitle: { fontSize: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  insightBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  insightText: { fontSize: 14, flex: 1, lineHeight: 20 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10, marginBottom: 20, marginTop: 4 },
  ctaText: { fontSize: 16, color: '#fff' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  suggestGrid: { gap: 8 },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  suggestText: { fontSize: 14, flex: 1 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 80 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
