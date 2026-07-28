import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const colors = useColors();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    default: { bg: colors.primaryLight, text: colors.primary },
    success: { bg: colors.success + '20', text: colors.success },
    warning: { bg: colors.warning + '20', text: colors.warning },
    error: { bg: colors.destructive + '20', text: colors.destructive },
    info: { bg: colors.info + '20', text: colors.info },
    muted: { bg: colors.muted, text: colors.mutedForeground },
  };

  const vs = variantStyles[variant];
  const fontSize = size === 'sm' ? 11 : 13;
  const paddingH = size === 'sm' ? 8 : 12;
  const paddingV = size === 'sm' ? 3 : 5;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: vs.bg,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderRadius: 99,
        },
      ]}
    >
      <Text style={[styles.text, { color: vs.text, fontSize, fontFamily: 'Inter_600SemiBold' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
  text: { textTransform: 'capitalize' },
});
