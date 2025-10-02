import React from 'react';
import { View, Text, Linking } from 'react-native';

export default function HelpScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>ヘルプ / お問い合わせ</Text>
      <Text>FAQ: 準備中です。</Text>
      <Text style={{ color: '#0000EE' }} onPress={() => Linking.openURL('mailto:support@example.com')}>
        メールで問い合わせる
      </Text>
    </View>
  );
}




