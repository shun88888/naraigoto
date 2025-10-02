import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

export default function TicketScreen() {
  const { id, slotId } = useLocalSearchParams<{ id: string; slotId?: string }>();
  const payload = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const obj = {
      booking_id: id,
      slot_id: slotId,
      issued_at: now,
      exp: now + 60 * 60
    };
    // placeholder signature-like suffix
    return JSON.stringify(obj) + '.signed_placeholder';
  }, [id, slotId]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <QRCode value={payload} size={260} />
      <Text style={{ marginTop: 16, textAlign: 'center' }}>
        Expo Go ではスキャンできない場合があります。その際は受付で予約IDをお伝えください。
      </Text>
    </View>
  );
}




