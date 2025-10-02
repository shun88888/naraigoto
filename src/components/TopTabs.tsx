import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../lib/colors';

export type TopTabItem = {
  key: string;
  title: string;
  count?: number | string;
};

export function TopTabs({
  items,
  activeKey,
  onChange
}: {
  items: TopTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={{ backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 24, paddingVertical: 8 }}
      >
        {items.map((it) => {
          const active = it.key === activeKey;
          return (
            <TouchableOpacity key={it.key} onPress={() => onChange(it.key)} activeOpacity={0.7}>
              <View style={{ alignItems: 'center', paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
                  <Text
                    style={{
                      fontWeight: active ? '700' as const : '500' as const,
                      fontSize: 16,
                      color: active ? colors.fg : colors.muted
                    }}
                  >
                    {it.title}
                  </Text>
                  {it.count !== undefined ? (
                    <View style={{
                      backgroundColor: active ? colors.primary : colors.border,
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      minWidth: 20,
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        color: active ? '#fff' : colors.muted,
                        fontSize: 12,
                        fontWeight: '600'
                      }}>
                        {it.count}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View
                  style={{
                    height: 3,
                    marginTop: 4,
                    backgroundColor: active ? colors.primary : 'transparent',
                    width: '100%',
                    borderRadius: 2
                  }}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}





