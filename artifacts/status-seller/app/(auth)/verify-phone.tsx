import React, { useRef, useState } from 'react';
import {
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
import { LinearGradient } from 'expo-linear-gradient';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(28);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const topInset = Platform.OS === 'web' ? 0 : insets.top;

  const handleInput = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    router.replace('/(auth)/kyb' as any);
  };

  const fullCode = code.join('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Shield icon */}
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          style={styles.shieldWrap}
        >
          <Feather name="shield" size={40} color="#fff" />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Verify Your Phone Number
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>+254 712 345 678</Text>
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  fontFamily: 'Inter_700Bold',
                },
              ]}
              value={digit}
              onChangeText={(v) => handleInput(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={[styles.resendInfo, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Code sent. Resend in{' '}
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>00:{countdown.toString().padStart(2, '0')}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setCountdown(28)}>
              <Text style={[styles.resendLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          onPress={handleVerify}
          style={[
            styles.verifyBtn,
            { backgroundColor: fullCode.length === CODE_LENGTH ? colors.primary : colors.muted },
          ]}
        >
          <Text style={[styles.verifyText, { fontFamily: 'Inter_700Bold', color: fullCode.length === CODE_LENGTH ? '#fff' : colors.mutedForeground }]}>
            Verify Phone
          </Text>
        </TouchableOpacity>

        {/* Security note */}
        <View style={[styles.securityNote, { backgroundColor: colors.muted, borderRadius: 12 }]}>
          <Feather name="lock" size={14} color={colors.primary} />
          <Text style={[styles.securityText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {'  '}We use this to keep your account secure and verify your business.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { alignSelf: 'flex-start', padding: 4 },
  content: { flex: 1, paddingHorizontal: 24, alignItems: 'center', paddingTop: 16 },
  shieldWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 22,
  },
  resendRow: { marginBottom: 32 },
  resendInfo: { fontSize: 14, textAlign: 'center' },
  resendLink: { fontSize: 14 },
  verifyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyText: { fontSize: 17 },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    width: '100%',
  },
  securityText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
