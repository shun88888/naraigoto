import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../lib/colors';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Tag({ label, active, onPress, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? colors.fg : colors.border,
          backgroundColor: active ? colors.fg : '#FFFFFF'
        },
        style
      ]}
    >
      <Text style={{ color: active ? colors.accent : colors.muted, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
