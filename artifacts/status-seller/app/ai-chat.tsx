import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
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

const QUICK_ACTIONS = ['Track Order', 'Delivery Info', 'Returns', 'Payment'];

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, sendMessage, isAILoading, clearChat } = useApp();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(text);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleQuickAction = (action: string) => {
    const map: Record<string, string> = {
      'Track Order': 'How do I track my order?',
      'Delivery Info': 'What are your delivery options and fees?',
      'Returns': 'What is your return policy?',
      'Payment': 'What payment methods do you accept?',
    };
    sendMessage(map[action] ?? action);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            AI Sales Assistant
          </Text>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, { backgroundColor: '#25D366' }]} />
            <Text style={[styles.onlineText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Online
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={[styles.clearBtn, { borderColor: colors.border }]}>
          <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isAI = item.role === 'assistant';
          return (
            <View style={[styles.bubbleRow, isAI ? styles.bubbleRowLeft : styles.bubbleRowRight]}>
              {isAI && (
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                  <Feather name="zap" size={14} color="#fff" />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isAI
                    ? [styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.border }]
                    : [styles.bubbleUser, { backgroundColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    { fontFamily: 'Inter_400Regular' },
                    isAI ? { color: colors.foreground } : { color: '#fff' },
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          isAILoading ? (
            <View style={styles.bubbleRow}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
                <Feather name="zap" size={14} color="#fff" />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.bubbleText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  ···
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick actions */}
      <View style={[styles.quickRow, { borderTopColor: colors.border }]}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a}
            onPress={() => handleQuickAction(a)}
            style={[styles.quickBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
          >
            <Text style={[styles.quickText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular', backgroundColor: colors.muted }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
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
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 12 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickText: { fontSize: 12 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
