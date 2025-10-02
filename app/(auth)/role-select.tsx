import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../../src/state/store';
import { useAuth } from '../../src/state/auth-context';
import { upsertProfileRole } from '../../src/lib/profile';

const CARD_STYLE = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 16,
  paddingHorizontal: 20,
  paddingVertical: 24,
  backgroundColor: '#FFFFFF'
} as const;

export default function RoleSelectScreen() {
  const router = useRouter();
  const storedRole = useAppStore((s) => s.role);
  const { setStoredRoleHint, session, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<'user' | 'provider' | null>(storedRole);

  const canContinue = useMemo(() => !!selected, [selected]);

  const handleContinue = async () => {
    if (!selected) return;
    setStoredRoleHint(selected);

    if (session?.user) {
      try {
        await upsertProfileRole(session.user.id, selected);
        await refreshProfile();
        const target: Href =
          selected === 'provider'
            ? '/(provider)/provider/(tabs)/reservations'
            : '/(user)/(tabs)/home';
        router.replace(target);
      } catch (error: any) {
        console.warn('[role-select] upsert role failed', error);
        Alert.alert('ロールの更新に失敗しました', '通信状況を確認して再度お試しください。');
      }
      return;
    }

    router.push({ pathname: '/(auth)/sign-in', params: { role: selected } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 16 }}>ご利用区分を選択してください</Text>
        <Text style={{ color: '#6B7280', lineHeight: 20, marginBottom: 24 }}>
          事業者様とユーザー様では表示ページが異なります。当てはまる区分をお選びください。
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelected('provider')}
          style={{
            ...CARD_STYLE,
            borderColor: selected === 'provider' ? '#F59E0B' : CARD_STYLE.borderColor,
            backgroundColor: selected === 'provider' ? '#FFFBEB' : CARD_STYLE.backgroundColor,
            marginBottom: 16
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>事業者様はこちら</Text>
          <Text style={{ color: '#6B7280', lineHeight: 20 }}>
            教室や事業を運営されている方向けの管理画面に移動します。
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelected('user')}
          style={{
            ...CARD_STYLE,
            borderColor: selected === 'user' ? '#3B82F6' : CARD_STYLE.borderColor,
            backgroundColor: selected === 'user' ? '#EFF6FF' : CARD_STYLE.backgroundColor
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 6 }}>ユーザー様はこちら</Text>
          <Text style={{ color: '#6B7280', lineHeight: 20 }}>
            体験を探したり予約したりするユーザー専用ホームに移動します。
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          disabled={!canContinue}
          onPress={handleContinue}
          style={{
            backgroundColor: canContinue ? '#111827' : '#9CA3AF',
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>続ける</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
