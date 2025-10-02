import React from 'react';
import { View, Text } from 'react-native';

const HOURS = ['AM', 'PM'];

const levelColor = (level: number) => {
  if (level >= 0.85) return '#1D4ED8';
  if (level >= 0.6) return '#2563EB';
  if (level >= 0.3) return '#60A5FA';
  if (level > 0) return '#BFDBFE';
  return '#E5E7EB';
};

type Props = {
  data: Array<{ day: string; slots: number[] }>;
};

export function Heatmap({ data }: Props) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: 48 }}>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }} />
        {data.map((row) => (
          <View key={row.day} style={{ height: 36, justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>{row.day}</Text>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          {HOURS.map((label) => (
            <Text key={label} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
              {label}
            </Text>
          ))}
        </View>
        {data.map((row) => (
          <View key={row.day} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {row.slots.map((value, idx) => (
              <View
                key={`${row.day}-${idx}`}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: levelColor(value)
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
