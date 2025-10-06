import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/state/auth-context';
import { useAppStore } from '../../../src/state/store';

type SettingsItem = {
  key: 'account' | 'notifications' | 'language' | 'signout' | 'withdraw';
  title: string;
  description?: string;
};

const PRIMARY_ITEMS: SettingsItem[] = [
  { key: 'account', title: 'アカウント', description: 'プロフィール情報の確認・編集' },
  { key: 'notifications', title: '通知設定', description: 'プッシュ通知やメール通知の管理' },
  { key: 'language', title: '言語', description: 'アプリ表示言語を切り替え' }
];

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const storedRole = useAppStore((s) => s.role);
  const [processing, setProcessing] = useState(false);

  const goTo = (key: SettingsItem['key']) => {
    switch (key) {
      case 'account':
        router.push('/(user)/settings/account');
        break;
      case 'notifications':
        router.push('/(user)/settings/notifications');
        break;
      case 'language':
        router.push('/(user)/settings/language');
        break;
    }
  };

  const confirmSignOut = () => {
    if (processing) return;
    Alert.alert('サインアウトしますか？', 'サインアウトすると再度ログインが必要になります。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'サインアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessing(true);
            await signOut();
            router.replace(
              storedRole
                ? { pathname: '/(auth)/sign-in', params: { role: storedRole } }
                : '/(auth)/sign-in'
            );
          } catch (error) {
            Alert.alert('サインアウトに失敗しました', '通信環境を確認して再度お試しください。');
          } finally {
            setProcessing(false);
          }
        }
      }
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      'アカウントを削除すると元に戻せません。よろしいですか？',
      '',
      [
        { text: 'あとで', style: 'cancel' },
        {
          text: '進める',
          style: 'destructive',
          onPress: () => Alert.alert('現在準備中です', '退会手続きは近日中にご案内予定です。')
        }
      ]
    );
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <ScrollView contentContainerStyle={{ paddingTop: statusBarHeight + 16, padding: 16, paddingBottom: 32 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8 }}>設定</Text>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>アカウントや通知の設定を管理できます</Text>
        </View>

        <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          {PRIMARY_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => goTo(item.key)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 18,
                borderBottomWidth: index === PRIMARY_ITEMS.length - 1 ? 0 : 1,
                borderBottomColor: '#E5E7EB',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.title}</Text>
                {item.description ? <Text style={{ fontSize: 13, color: '#6B7280' }}>{item.description}</Text> : null}
              </View>
              <View style={{ width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#9CA3AF', transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 32, gap: 12 }}>
          <TouchableOpacity
            onPress={confirmSignOut}
            disabled={processing}
            style={{
              backgroundColor: '#111827',
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: 'center',
              opacity: processing ? 0.6 : 1
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>サインアウト</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWithdraw}
            style={{
              backgroundColor: '#FFFFFF',
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FCA5A5'
            }}
          >
            <Text style={{ color: '#B91C1C', fontSize: 16, fontWeight: '700' }}>退会</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>naraigoto v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
