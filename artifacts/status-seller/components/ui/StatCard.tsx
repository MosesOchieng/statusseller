import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  trend,
  trendUp,
  subtitle,
}: StatCardProps) {
  const colors = useColors();
  const ic = iconColor ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: ic + '18', borderRadius: colors.radius - 4 }]}>
        <Ionicons name={icon} size={20} color={ic} />
      </View>
      <Text
        style={[styles.value, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.title, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {title}
      </Text>
      {(trend || subtitle) && (
        <View style={styles.trendRow}>
          {trend && (
            <>
              <Ionicons
                name={trendUp ? 'trending-up' : 'trending-down'}
                size={12}
                color={trendUp ? colors.success : colors.destructive}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trendUp ? colors.success : colors.destructive, fontFamily: 'Inter_500Medium' },
                ]}
              >
                {' '}{trend}
              </Text>
            </>
          )}
          {subtitle && !trend && (
            <Text style={[styles.trendText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  iconBox: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  value: { fontSize: 20, marginBottom: 2 },
  title: { fontSize: 12 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  trendText: { fontSize: 11 },
});
