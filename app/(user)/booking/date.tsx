import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { colors } from '../../../src/lib/colors';

export default function BookingDateScreen() {
  const { expId } = useLocalSearchParams<{ expId: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: 8, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>来店日時指定</Text>
      </View>
      <Calendar
        onDayPress={(d: DateData) => setSelected(d.dateString)}
        markedDates={
          selected
            ? { [selected]: { selected: true, selectedColor: colors.accent, selectedTextColor: colors.fg } }
            : {}
        }
        theme={{
          arrowColor: colors.accent,
          monthTextColor: '#111827',
          textSectionTitleColor: '#6B7280',
          selectedDayBackgroundColor: colors.accent,
          selectedDayTextColor: colors.fg,
          todayTextColor: colors.accent
        }}
      />
      <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => setSelected(null)}
          style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#E5E7EB' }}
        >
          <Text>クリア</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!selected}
          onPress={() => router.push({ pathname: '/booking/slots', params: { expId, date: selected || '' } })}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: selected ? colors.accent : '#D4D4D4'
          }}
        >
          <Text style={{ color: selected ? colors.fg : '#fff', fontWeight: '700' }}>完了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


