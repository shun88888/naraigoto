// Import polyfills first
import '../polyfills';
import 'react-native-url-polyfill/auto';

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { config } from '@gluestack-ui/config';
import { AuthProvider, useAuth } from '../src/state/auth-context';
import { useAppStore } from '../src/state/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const storedRole = useAppStore((s) => s.role);
  const testLoginActive = useAppStore((s) => s.testLoginActive);
  const { session, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    const handler = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      if (parsed?.path?.startsWith('b/')) {
        const id = parsed.path.split('/')[1];
        if (id) router.push(`/bookings/${id}`);
      }
    };
    const sub = Linking.addEventListener('url', handler);
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (authLoading) return;

    const primary = segments[0];
    const secondary = segments[1];
    const inAuth = primary === '(auth)';
    const inRoleSelect = inAuth && secondary === 'role-select';
    const inSignIn = inAuth && secondary === 'sign-in';

    if (!session) {
      if (testLoginActive && storedRole) {
        const target = storedRole === 'provider' ? '/(provider)/provider/(tabs)/reservations' : '/(user)/(tabs)/home';
        if (inAuth) {
          router.replace(target as any);
          return;
        }
        if (storedRole === 'provider' && primary !== '(provider)') {
          router.replace(target as any);
        } else if (storedRole === 'user' && primary !== '(user)') {
          router.replace(target as any);
        }
        return;
      }
      if (storedRole && !inSignIn) {
        router.replace({ pathname: '/(auth)/sign-in', params: { role: storedRole } });
      } else if (!storedRole && !inRoleSelect) {
        router.replace('/(auth)/role-select');
      }
      return;
    }

    const role = profile?.role ?? (testLoginActive ? storedRole : null);
    if (!role) {
      if (!inRoleSelect) router.replace('/(auth)/role-select');
      return;
    }

    const target = role === 'provider' ? '/(provider)/provider/(tabs)/reservations' : '/(user)/(tabs)/home';
    const inProvider = primary === '(provider)';
    const inUser = primary === '(user)' || (!primary && !inAuth);

    if (inAuth) {
      router.replace(target as any);
      return;
    }

    if (role === 'provider' && !inProvider) {
      router.replace(target as any);
    } else if (role === 'user' && !inUser) {
      router.replace(target as any);
    }
  }, [authLoading, segments, session, profile?.role, storedRole, router, testLoginActive]);

  return (
    <GluestackUIProvider config={config}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#000000',
          headerTitleStyle: { fontWeight: '600' }
        }}
      >
        <Stack.Screen name="(auth)/role-select" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(user)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(provider)/provider/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(user)/home" options={{ title: 'ホーム' }} />
        <Stack.Screen name="(user)/onboarding/distance" options={{ title: '距離設定' }} />
        <Stack.Screen name="(user)/onboarding/interests" options={{ title: '興味・関心' }} />
        <Stack.Screen name="(user)/bookings/index" options={{ title: 'マイ予約' }} />
        <Stack.Screen name="(user)/bookings/[id]" options={{ title: '予約詳細' }} />
        <Stack.Screen name="(user)/experience/[id]" options={{ title: '体験詳細' }} />
        <Stack.Screen name="(user)/booking/calendar" options={{ title: '日付選択' }} />
        <Stack.Screen name="(user)/booking/date" options={{ title: '来店日時指定' }} />
        <Stack.Screen name="(user)/booking/slots" options={{ title: '枠を選択' }} />
        <Stack.Screen name="(user)/booking/confirm" options={{ title: '確認' }} />
        <Stack.Screen name="(user)/booking/done" options={{ title: '予約完了' }} />
        <Stack.Screen name="(user)/ticket/[id]" options={{ title: 'チケット' }} />
        <Stack.Screen name="(user)/profile/index" options={{ title: 'プロフィール' }} />
        <Stack.Screen name="(user)/search/index" options={{ title: '検索' }} />
        <Stack.Screen name="(user)/help/index" options={{ title: 'ヘルプ' }} />
        <Stack.Screen name="(user)/settings/index" options={{ title: '設定' }} />
        <Stack.Screen name="(user)/settings/account" options={{ title: 'アカウント' }} />
        <Stack.Screen name="(user)/settings/notifications" options={{ title: '通知設定' }} />
        <Stack.Screen name="(user)/settings/language" options={{ title: '言語' }} />
      </Stack>
    </GluestackUIProvider>
  );
}
