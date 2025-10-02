import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';

export type TimelineItem = {
  title: string;
  time: string;
  description?: string;
  attachments?: string[];
};

type Props = {
  items: TimelineItem[];
};

export function Timeline({ items }: Props) {
  return (
    <View style={{ position: 'relative', paddingLeft: 12 }}>
      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 7,
          bottom: 4,
          width: 2,
          backgroundColor: colors.border
        }}
      />
      {items.map((item, index) => (
        <View key={`${item.title}-${index}`} style={{ marginBottom: index === items.length - 1 ? 0 : 16, flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: colors.fg,
              marginTop: 4
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.time}</Text>
            {item.description ? <Text style={{ color: colors.muted, marginTop: 8 }}>{item.description}</Text> : null}
            {item.attachments && item.attachments.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {item.attachments.map((att) => (
                  <View key={att} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12 }}>{att}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
