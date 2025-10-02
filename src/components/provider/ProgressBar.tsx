import React from 'react';
import { View } from 'react-native';
import { colors } from '../../lib/colors';

type Props = {
  value: number; // 0-1
  height?: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

export function ProgressBar({ value, height = 8, tone = 'default' }: Props) {
  const clamp = Math.max(0, Math.min(1, value));
  const tones: Record<typeof tone, string> = {
    default: colors.fg,
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626'
  };
  return (
    <View style={{ backgroundColor: '#E5E7EB', borderRadius: height, height }}>
      <View style={{ width: `${clamp * 100}%`, height, borderRadius: height, backgroundColor: tones[tone] }} />
    </View>
  );
}
