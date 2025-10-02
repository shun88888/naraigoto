import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { UIButton } from '../../../src/components/ui/Button';

export default function BookingDoneScreen() {
  const { bookingId, slotId } = useLocalSearchParams<{ bookingId: string; slotId?: string }>();
  const router = useRouter();
  const payload = JSON.stringify({ booking_id: bookingId, slot_id: slotId, issued_at: Date.now() });

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 16 }}>予約が完了しました</Text>
      <QRCode value={payload} size={220} />
      <Text style={{ marginTop: 12, color: '#666', textAlign: 'center' }}>
        入場時にこのQRコードを提示してください。オフライン時も再表示できます。
      </Text>
      <View style={{ height: 24 }} />
      <UIButton variant="secondary" onPress={() => router.replace({ pathname: '/ticket/[id]', params: { id: bookingId, slotId } })}>
        全画面で表示
      </UIButton>
    </View>
  );
}




