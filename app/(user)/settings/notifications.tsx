import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function NotificationsSettingsPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={{ gap: 12, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>通知設定</Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
          通知の個別設定は準備中です。
        </Text>
      </View>
    </SafeAreaView>
  );
}
