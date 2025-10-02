import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UICard } from '../../../../src/components/ui/Card';
import { UIButton } from '../../../../src/components/ui/Button';
import { Tag } from '../../../../src/components/provider/Tag';
import { SegmentedControl } from '../../../../src/components/provider/SegmentedControl';
import { colors } from '../../../../src/lib/colors';
import { useProviderStore } from '../../../../src/state/provider-store';
import { useAuth } from '../../../../src/state/auth-context';

const SUPPORT_CHANNELS = [
  { label: 'メール', value: 'email' },
  { label: 'Slack', value: 'slack' },
  { label: 'LINE', value: 'line' }
] as const;

type SupportChannel = (typeof SUPPORT_CHANNELS)[number]['value'];

export default function ProviderSettings() {
  const isOnline = useProviderStore((state) => state.isOnline);
  const setOnline = useProviderStore((state) => state.setOnline);
  const { signOut } = useAuth();
  const router = useRouter();

  const [notificationPrefs, setNotificationPrefs] = useState({
    newReservation: true,
    reminder: true,
    sameDayAlert: true,
    marketing: false
  });

  const [supportChannel, setSupportChannel] = useState<SupportChannel>('email');
  const [calendarProvider, setCalendarProvider] = useState<'google' | 'apple' | 'other'>('google');
  const [supportNote, setSupportNote] = useState('');

  const togglePref = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    Alert.alert('保存しました', '設定を更新しました。');
  };

  const confirmLogout = () => {
    Alert.alert('ログアウト', 'ログイン画面に戻りますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.warn('[settings] signOut failed', error);
            Alert.alert('ログアウトできませんでした', '時間をおいて再度お試しください。');
            return;
          }
          router.replace('/(auth)/role-select');
        }
      }
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800' }}>設定</Text>
          <Tag label={isOnline ? 'オンライン' : 'オフライン'} active={!isOnline} onPress={() => setOnline(!isOnline)} />
        </View>

        <UICard style={{ borderRadius: 20, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>アカウント情報</Text>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>事業者名</Text>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Meguro Kids Studio</Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 12 }}>登録メール</Text>
            <Text style={{ fontSize: 16 }}>studio@example.jp</Text>
            <UIButton variant="ghost" onPress={() => Alert.alert('アカウント設定', 'プロフィール編集画面は近日公開予定です。')} style={{ alignSelf: 'flex-start', minWidth: 140 }}>
              プロフィールを編集
            </UIButton>
          </View>
        </UICard>

        <UICard style={{ borderRadius: 20, padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>通知設定</Text>

          {[
            { key: 'newReservation', label: '新しい予約', description: '予約が入ったらすぐに通知する' },
            { key: 'reminder', label: '前日リマインド', description: '前日に自動でリマインドを受け取る' },
            { key: 'sameDayAlert', label: '当日変更', description: '当日のキャンセルや変更をプッシュ通知' },
            { key: 'marketing', label: 'ニュースレター', description: 'サービスからのお知らせや活用例を受け取る' }
          ].map((item) => (
            <View key={item.key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{item.description}</Text>
              </View>
              <Switch
                value={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                onValueChange={() => togglePref(item.key as keyof typeof notificationPrefs)}
                trackColor={{ false: '#CBD5F5', true: colors.fg }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </UICard>

        <UICard style={{ borderRadius: 20, padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>カレンダー連携</Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            外部カレンダーに接続すると、予約が自動で同期されます。
          </Text>
          <SegmentedControl
            segments={[
              { label: 'Google', value: 'google' },
              { label: 'Apple', value: 'apple' },
              { label: 'その他', value: 'other' }
            ]}
            value={calendarProvider}
            onChange={(value) => {
              setCalendarProvider(value as 'google' | 'apple' | 'other');
              if (value !== 'google') {
                Alert.alert('準備中', `${value} カレンダーとの連携は現在準備中です。`);
              }
            }}
          />
          <UIButton
            variant="secondary"
            onPress={() =>
              Alert.alert('連携設定', `${calendarProvider === 'google' ? 'Google' : calendarProvider === 'apple' ? 'Apple' : 'その他' } カレンダーとの連携処理を開始します。`)
            }
            style={{ alignSelf: 'flex-end', minWidth: 160 }}
          >
            {calendarProvider === 'google' ? 'Google' : calendarProvider === 'apple' ? 'Apple' : 'その他'}と接続
          </UIButton>
        </UICard>

        <UICard style={{ borderRadius: 20, padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>サポートチャネル</Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            連絡を受け取りやすいチャネルを選択してください。運営からの対応がスムーズになります。
          </Text>

          <SegmentedControl
            segments={SUPPORT_CHANNELS.map((item) => ({ label: item.label, value: item.value }))}
            value={supportChannel}
            onChange={(value) => setSupportChannel(value as SupportChannel)}
          />

          <TextInput
            placeholder="問い合わせメモや希望時間帯などあれば入力してください"
            value={supportNote}
            onChangeText={setSupportNote}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              minHeight: 80,
              textAlignVertical: 'top'
            }}
          />

          <UIButton variant="ghost" onPress={() => Alert.alert('サポートへ送信', 'サポートチームに内容を送信しました。')} style={{ alignSelf: 'flex-end', minWidth: 140 }}>
            サポートに連絡
          </UIButton>
        </UICard>

        <UICard style={{ borderRadius: 20, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>その他</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>ダークモードを試す</Text>
            <Tag label="近日公開" />
          </View>
          <UIButton variant="ghost" onPress={confirmLogout} style={{ alignSelf: 'flex-start', minWidth: 120 }}>
            ログアウト
          </UIButton>
        </UICard>
      </View>

      <UIButton variant="secondary" onPress={handleSave} style={{ alignSelf: 'center', minWidth: 180 }}>
        変更を保存
      </UIButton>
    </ScrollView>
  );
}
