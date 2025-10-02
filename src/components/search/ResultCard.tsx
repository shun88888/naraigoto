import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../lib/colors';

export function ResultCard({ item, onPress, onLike }: { item: any; onPress: () => void; onLike: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 84, height: 84, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontWeight: '800' }}>{item.title}</Text>
          <Text style={{ color: '#6B7280' }}>{item.location || '東京都'}</Text>
          {item.price ? <Text style={{ color: '#111827' }}>¥{item.price}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {['新着', 'スキマ', '経験不問'].slice(0, Math.floor(Math.random() * 3) + 1).map((b) => (
              <View key={b} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F3F4F6', borderRadius: 999 }}>
                <Text style={{ fontSize: 12 }}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={onLike} accessibilityLabel="お気に入り">
          <Text style={{ fontSize: 20 }}>♡</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}





