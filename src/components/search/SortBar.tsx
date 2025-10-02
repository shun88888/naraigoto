import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const items: Array<{ key: any; label: string }> = [
  { key: 'relevance', label: '関連性順' },
  { key: 'new', label: '新着' },
  { key: 'distance', label: '距離' },
  { key: 'priceLow', label: '価格が安い' },
  { key: 'priceHigh', label: '価格が高い' }
];

export function SortBar({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 18 }}>
        {items.map((it) => {
          const active = it.key === value;
          return (
            <TouchableOpacity key={it.key} onPress={() => onChange(it.key)}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: active ? '800' as const : '600' as const }}>{it.label}</Text>
                <View style={{ height: 3, backgroundColor: active ? '#000' : 'transparent', width: '100%', marginTop: 6 }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}





