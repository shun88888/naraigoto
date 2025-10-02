import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/colors';

type Segment = {
  label: string;
  value: string;
};

type Props = {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ segments, value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', borderRadius: 999, backgroundColor: '#F3F4F6', padding: 4 }}>
      {segments.map((segment) => {
        const active = value === segment.value;
        return (
          <TouchableOpacity
            key={segment.value}
            onPress={() => onChange(segment.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: active ? colors.fg : 'transparent'
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                color: active ? colors.accent : colors.muted,
                fontSize: 12
              }}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
