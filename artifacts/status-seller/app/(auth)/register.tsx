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
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async () => {
    if (!businessName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password, businessName, phone);
      router.replace('/(auth)/kyb');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Create Your Business Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Join thousands of businesses growing with StatusSeller.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Business Name"
            placeholder="e.g. Urban Wear"
            value={businessName}
            onChangeText={setBusinessName}
            leftIcon="briefcase-outline"
            autoCapitalize="words"
          />
          <Input
            label="Full Name"
            placeholder="e.g. John Otieno"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
            autoCapitalize="words"
          />
          <Input
            label="Email Address"
            placeholder="john@urbanwear.com"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone Number"
            placeholder="+254 712 345 678"
            value={phone}
            onChangeText={setPhone}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />
          <Input
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed-outline"
            isPassword
          />

          {/* Terms */}
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: 'transparent', borderColor: colors.border },
              ]}
            >
              {agreedToTerms && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={[styles.termsText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              I agree to the{' '}
              <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>Terms</Text>
              {' '}&{' '}
              <Text style={{ color: colors.primary, fontFamily: 'Inter_500Medium' }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '12', borderRadius: 10 }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: 'Inter_400Regular' }]}>
                {'  '}{error}
              </Text>
            </View>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social buttons */}
          <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Feather name="globe" size={18} color="#4285F4" />
            <Text style={[styles.socialText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              Continue with Google
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

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.signinRow}>
            <Text style={[styles.signinText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
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
  title: { fontSize: 26, marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  form: { gap: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  termsText: { fontSize: 13, flex: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 4 },
  errorText: { fontSize: 13 },
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
  signinRow: { alignItems: 'center', marginTop: 8 },
  signinText: { fontSize: 14 },
});
