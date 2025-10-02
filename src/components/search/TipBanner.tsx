import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/colors';

export function TipBanner({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <View
      style={{
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Text style={{ color: '#111827' }}>{text}</Text>
      <TouchableOpacity onPress={onClose} accessibilityLabel="閉じる">
        <Text style={{ color: colors.muted, fontWeight: '700' }}>×</Text>
      </TouchableOpacity>
    </View>
  );
}





