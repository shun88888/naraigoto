import React from 'react';
import { Stack } from 'expo-router';

export default function UserTabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        animation: 'none'
      }}
    >
      <Stack.Screen
        name='home'
        options={{
          title: 'ホーム'
        }}
      />
      <Stack.Screen
        name='search'
        options={{
          title: '検索'
        }}
      />
      <Stack.Screen
        name='bookings'
        options={{
          title: 'マイ予約'
        }}
      />
      <Stack.Screen
        name='profile'
        options={{
          title: 'プロフィール'
        }}
      />
    </Stack>
  );
}
