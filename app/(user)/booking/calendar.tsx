import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { nextNDays } from '../../../src/utils/format';

export default function CalendarScreen() {
  const { expId } = useLocalSearchParams<{ expId: string }>();
  const router = useRouter();
  const days = useMemo(() => nextNDays(14), []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ marginBottom: 12 }}>日付を選択</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {days.map((d) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={d}
            onPress={() => router.push({ pathname: '/booking/slots', params: { expId, date: d } })}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#EFEFEF',
              borderRadius: 8
            }}
          >
            <Text>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}




