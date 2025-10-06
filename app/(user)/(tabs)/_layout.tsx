import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Flame, Search, Calendar, User2 } from 'lucide-react-native';
import { CustomTabBar } from '../../../src/components/CustomTabBar';

const TAB_ICONS: Record<string, React.ComponentType<{ color: string; size?: number }>> = {
  home: Flame,
  search: Search,
  bookings: Calendar,
  profile: User2
};

export default function UserTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar />}
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 }
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'ホーム',
          tabBarLabel: 'ホーム'
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: '検索',
          tabBarLabel: '検索'
        }}
      />
      <Tabs.Screen
        name='bookings'
        options={{
          title: 'マイ予約',
          tabBarLabel: '予約'
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'プロフィール',
          tabBarLabel: 'プロフィール'
        }}
      />
    </Tabs>
  );
}
