import React, { useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { fetchProfile, upsertProfileRole } from '../../src/lib/profile';
import { getTestCredentials } from '../../src/lib/config';
import { useAuth } from '../../src/state/auth-context';
import { useAppStore } from '../../src/state/store';

export default function SignInScreen() {
  const params = useLocalSearchParams<{ role?: 'user' | 'provider' }>();
  const router = useRouter();
  const storeRole = useAppStore((s) => s.role);
  const onboardingDone = useAppStore((s) => s.onboardingCompleted);
  const setTestLoginActive = useAppStore((s) => s.setTestLoginActive);
  const { refreshProfile, setStoredRoleHint } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRole = useMemo<'user' | 'provider' | null>(() => {
    if (params.role === 'user' || params.role === 'provider') return params.role;
    if (storeRole === 'user' || storeRole === 'provider') return storeRole;
    return null;
  }, [params.role, storeRole]);

  const testCredentials = useMemo(() => {
    if (!activeRole) return null;
    return getTestCredentials(activeRole);
  }, [activeRole]);

  const executeSignIn = async (
    credentials: { email: string; password: string },
    role: 'user' | 'provider'
  ): Promise<{ ok: true } | { ok: false; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(credentials);
      if (authError) throw authError;

      const session = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!session?.user) {
        throw new Error('サインインに失敗しました。アカウント情報を確認してください。');
      }

      const userId = session.user.id;
      let nextRole: 'user' | 'provider' | null = role;
      const existing = await fetchProfile(userId);
      if (!existing || existing.role == null) {
        const updated = await upsertProfileRole(userId, role);
        nextRole = updated.role ?? role;
      } else if (existing.role !== role) {
        nextRole = existing.role;
        Alert.alert('ロールが異なります', 'このアカウントは既に別の区分で登録されています。自動的に登録済みの画面へ移動します。');
      }

      if (!nextRole) {
        throw new Error('ロールを取得できませんでした。管理者へお問い合わせください。');
      }

      setStoredRoleHint(nextRole);
      await refreshProfile();

      const nextPath: Href =
        nextRole === 'provider'
          ? '/(provider)/provider/(tabs)/reservations'
          : onboardingDone
            ? '/(user)/(tabs)/home'
            : '/(user)/onboarding/distance';

      setTestLoginActive(false);
      router.replace(nextPath);
      return { ok: true };
    } catch (err: any) {
      const message = err?.message ?? 'サインインに失敗しました。時間を置いて再度お試しください。';
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeRole) {
      setError('ロールを選択してください');
      return;
    }
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    await executeSignIn({ email, password }, activeRole);
  };

  const handleTestLogin = async () => {
    if (!activeRole) {
      setError('ロールを選択してください');
      return;
    }

    const credentials = testCredentials;
    if (!credentials) {
      Alert.alert(
        'テストアカウントが未設定です',
        '環境変数 EXPO_PUBLIC_TEST_* または app.json の extra.testAccounts にテスト用資格情報を設定してください。'
      );
      return;
    }

    setEmail(credentials.email);
    setPassword(credentials.password);
    const result = await executeSignIn(credentials, activeRole);
    if (!result.ok) {
      setStoredRoleHint(activeRole);
      setTestLoginActive(true);
      setError(null);
      const fallbackPath: Href =
        activeRole === 'provider'
          ? '/(provider)/provider/(tabs)/reservations'
          : onboardingDone
            ? '/(user)/(tabs)/home'
            : '/(user)/onboarding/distance';
      Alert.alert(
        'テストモードでログインしました',
        '実際のサインインには失敗しましたが、画面確認のためにオフライン状態でログインします。\n本番検証時は Supabase 上に該当アカウントを作成してください。'
      );
      router.replace(fallbackPath);
    }
  };

  const handleChangeRole = () => {
    setStoredRoleHint(null);
    router.push('/(auth)/role-select');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 12 }}>サインイン</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>選択中の区分：</Text>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>
            {activeRole === 'provider' ? '事業者様' : activeRole === 'user' ? 'ユーザー様' : '未選択'}
          </Text>
          <TouchableOpacity onPress={handleChangeRole} style={{ marginLeft: 12 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>変更する</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>メールアドレス</Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="example@example.com"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16
              }}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>パスワード</Text>
            <TextInput
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16
              }}
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {error ? (
          <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginTop: 20 }}>
            <Text style={{ color: '#B91C1C' }}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ padding: 20 }}>
        {activeRole ? (
          <TouchableOpacity
            onPress={handleTestLogin}
            disabled={loading || !testCredentials}
            style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              opacity: loading || !testCredentials ? 0.6 : 1
            }}
          >
            <Text style={{ color: '#111827', fontSize: 15, fontWeight: '600' }}>
              {testCredentials ? 'テストアカウントでログイン' : 'テストアカウント未設定'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9CA3AF' : '#111827',
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>{loading ? 'サインイン中…' : '続ける'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
