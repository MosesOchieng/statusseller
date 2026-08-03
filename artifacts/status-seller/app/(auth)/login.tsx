import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SOCIAL_LOGOS } from '@/constants/localImages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(emailOrPhone, password);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('urbanwear@gmail.com', 'demo1234');
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.push('/(auth)/onboarding')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        {/* Greeting */}
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Welcome Back 👋
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Login to your StatusSeller account.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email or Phone"
            placeholder="john@urbanwear.com"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            leftIcon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed-outline"
            isPassword
          />

          {/* Remember me + Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberLeft}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: 'transparent', borderColor: colors.border },
                ]}
              >
                {rememberMe && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text style={[styles.rememberText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Remember me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.forgotText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '12', borderRadius: 10 }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: 'Inter_400Regular' }]}>
                {'  '}{error}
              </Text>
            </View>
          ) : null}

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          {/* Demo */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            style={[styles.demoBtn, { borderColor: colors.primary + '40', backgroundColor: colors.primary + '08' }]}
          >
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.demoBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {'  '}Try Demo Store
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Image source={SOCIAL_LOGOS.whatsapp} style={{ width: 22, height: 22, borderRadius: 4 }} resizeMode="contain" />
            <Text style={[styles.socialText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              Continue with WhatsApp
            </Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: '#000' }]}>
              <Feather name="smartphone" size={18} color="#fff" />
              <Text style={[styles.socialText, { color: '#fff', fontFamily: 'Inter_500Medium' }]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.signupRow}
          >
            <Text style={[styles.signupText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Don't have an account?{' '}
              <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  backBtn: { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
  title: { fontSize: 28, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 28 },
  form: { gap: 4 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  rememberLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: { fontSize: 13 },
  forgotText: { fontSize: 13 },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 4 },
  errorText: { fontSize: 13 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
  },
  demoBtnText: { fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 10,
  },
  socialText: { fontSize: 15 },
  signupRow: { alignItems: 'center', marginTop: 4 },
  signupText: { fontSize: 14 },
});
