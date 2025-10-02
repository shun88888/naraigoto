import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listSlots } from '../../../src/lib/api';

export default function SlotsScreen() {
  const { expId, date } = useLocalSearchParams<{ expId: string; date: string }>();
  const [slots, setSlots] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (expId && date) {
        const data = await listSlots(expId, date);
        setSlots(data);
      }
    })();
  }, [expId, date]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      <Text style={{ marginBottom: 8 }}>枠一覧（{date}）</Text>
      {slots.map((s) => (
        <TouchableOpacity
          key={s.id}
          disabled={s.remaining <= 0 || s.status !== 'open'}
          onPress={() => router.push({ pathname: '/booking/confirm', params: { slotId: s.id, expId } })}
          style={
            s.remaining > 0 && s.status === 'open'
              ? { padding: 12, borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 8 }
              : { padding: 12, borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 8, opacity: 0.5 }
          }
        >
          <Text>
            {s.date} / 残り {s.remaining}
            {s.remaining <= 0 ? '（Sold out）' : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}




