import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../lib/colors';

export type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  trend?: {
    label: string;
    value: string;
    tone?: 'up' | 'down' | 'neutral';
  };
  accent?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function MetricCard({ label, value, subtitle, trend, accent, compact, style }: MetricCardProps) {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: compact ? 12 : 16,
          backgroundColor: '#FFFFFF',
          flex: compact ? undefined : 1,
          minWidth: compact ? 140 : undefined
        },
        style
      ]}
    >
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: compact ? 20 : 28, fontWeight: '800', color: accent || colors.fg }}>{value}</Text>
      {subtitle ? <Text style={{ color: colors.muted, marginTop: 4 }}>{subtitle}</Text> : null}
      {trend ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor:
                trend.tone === 'up' ? 'rgba(22,163,74,0.1)' : trend.tone === 'down' ? 'rgba(220,38,38,0.1)' : '#F3F4F6'
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: trend.tone === 'up' ? '#15803D' : trend.tone === 'down' ? '#B91C1C' : colors.muted
              }}
            >
              {trend.value}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>{trend.label}</Text>
        </View>
      ) : null}
    </View>
  );
}
