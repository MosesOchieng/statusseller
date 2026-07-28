import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { formatRelativeTime } from '@/utils/formatters';

const SUGGESTED = [
  'What sizes are available?',
  'Do you deliver to Kisumu?',
  'Is this authentic?',
  'What payment methods?',
  'Current stock levels?',
  'Return policy?',
];

function TypingDots({ color }: { color: string }) {
  // Three animated dots
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: color, opacity: 0.6 + i * 0.2 }]}
        />
      ))}
    </View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, sendMessage, clearChat, isAILoading, groqEnabled } = useApp();
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleSend = async () => {
    if (!input.trim() || isAILoading) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const handleSuggestion = async (text: string) => {
    if (isAILoading) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {/* Avatar with gradient */}
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiAvatar}
          >
            <Ionicons name="flash" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <View style={styles.nameRow}>
              <Text style={[styles.aiName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                Seller AI
              </Text>
              {groqEnabled && (
                <View style={[styles.groqBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.groqText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    Groq
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: isAILoading ? colors.warning : colors.success }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {' '}{isAILoading ? 'Thinking…' : 'Always on'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={clearChat}
          style={[styles.clearBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.msgList, { paddingBottom: 8 }]}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
                {!isUser && (
                  <LinearGradient
                    colors={['#25D366', '#128C7E']}
                    style={styles.msgAvatar}
                  >
                    <Ionicons name="flash" size={12} color="#fff" />
                  </LinearGradient>
                )}
                <View style={styles.bubbleCol}>
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isUser ? colors.primary : colors.card,
                        borderColor: isUser ? 'transparent' : colors.border,
                        borderTopLeftRadius: isUser ? 18 : 4,
                        borderTopRightRadius: isUser ? 18 : 18,
                        borderBottomLeftRadius: 18,
                        borderBottomRightRadius: isUser ? 4 : 18,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        { color: isUser ? '#fff' : colors.foreground, fontFamily: 'Inter_400Regular' },
                      ]}
                    >
                      {item.content}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timestamp,
                      {
                        color: colors.mutedForeground,
                        fontFamily: 'Inter_400Regular',
                        textAlign: isUser ? 'right' : 'left',
                      },
                    ]}
                  >
                    {formatRelativeTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isAILoading ? (
              <View style={styles.typingRow}>
                <LinearGradient colors={['#25D366', '#128C7E']} style={styles.msgAvatar}>
                  <Ionicons name="flash" size={12} color="#fff" />
                </LinearGradient>
                <View
                  style={[
                    styles.typingBubble,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <TypingDots color={colors.mutedForeground} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggestions */}
        {messages.length <= 2 && !isAILoading && (
          <FlatList
            data={SUGGESTED}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(s) => s}
            contentContainerStyle={styles.suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSuggestion(item)}
                style={[styles.suggestion, { backgroundColor: colors.primaryLight, borderRadius: 99, borderColor: colors.primary + '40', borderWidth: 1 }]}
              >
                <Text style={[styles.suggestionText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
              paddingBottom: bottomInset + 8,
            },
          ]}
        >
          <View
            style={[
              styles.inputBox,
              { backgroundColor: colors.muted, borderRadius: 24, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
              placeholder="Ask anything about your store…"
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
              editable={!isAILoading}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isAILoading}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() && !isAILoading ? colors.primary : colors.muted,
                borderRadius: 22,
              },
            ]}
          >
            {isAILoading ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Ionicons name="send" size={18} color={input.trim() ? '#fff' : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiName: { fontSize: 16 },
  groqBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  groqText: { fontSize: 10 },
  onlineRow: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 12 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  msgList: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCol: { maxWidth: '78%', gap: 3 },
  bubble: { padding: 13, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  timestamp: { fontSize: 11 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, marginTop: 10 },
  typingBubble: { padding: 14, borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1 },
  dotsRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  suggestions: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  inputBox: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, maxHeight: 100 },
  textInput: { fontSize: 15 },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
