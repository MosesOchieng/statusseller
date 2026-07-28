import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
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
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !name) {
      setError('Please enter your store name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login('urbanwear@gmail.com', 'demo1234');
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary, borderRadius: 22 }]}>
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <Text style={[styles.brand, { fontFamily: 'Inter_700Bold' }]}>
              <Text style={{ color: colors.foreground }}>Status</Text>
              <Text style={{ color: colors.primary }}>Seller</Text>
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              The fastest way to sell on social media
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            {/* Mode toggle */}
            <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              {(['login', 'register'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => { setMode(m); setError(''); }}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: mode === m ? colors.background : 'transparent',
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeBtnText,
                      {
                        color: mode === m ? colors.foreground : colors.mutedForeground,
                        fontFamily: mode === m ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mode === 'register' && (
              <Input
                label="Store Name"
                placeholder="e.g., Urban Wear KE"
                value={name}
                onChangeText={setName}
                leftIcon="storefront-outline"
                autoCapitalize="words"
              />
            )}
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock-closed-outline"
              isPassword
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + '15', borderRadius: 10 }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: 'Inter_400Regular' }]}>
                  {'  '}{error}
                </Text>
              </View>
            ) : null}

            <Button
              title={mode === 'login' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 4 }}
            />

            {mode === 'login' && (
              <>
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    or
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <TouchableOpacity
                  onPress={handleDemoLogin}
                  style={[
                    styles.demoBtn,
                    { borderColor: colors.border, borderRadius: colors.radius - 4 },
                  ]}
                >
                  <Ionicons name="flash-outline" size={18} color={colors.primary} />
                  <Text
                    style={[styles.demoBtnText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}
                  >
                    {'  '}Try Demo Store
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Features */}
          <View style={styles.features}>
            {[
              { icon: 'logo-whatsapp' as const, text: 'Sell through WhatsApp Status' },
              { icon: 'flash-outline' as const, text: 'AI-powered sales assistant' },
              { icon: 'analytics-outline' as const, text: 'Real-time analytics' },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Ionicons name={f.icon} size={16} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                  {'  '}{f.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  brand: { fontSize: 28, marginBottom: 4 },
  tagline: { fontSize: 14, textAlign: 'center' },
  card: { padding: 20, borderWidth: 1, marginBottom: 24 },
  modeToggle: { flexDirection: 'row', padding: 4, marginBottom: 20 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  modeBtnText: { fontSize: 14 },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12 },
  errorText: { fontSize: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  demoBtnText: { fontSize: 15 },
  features: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontSize: 13 },
});
