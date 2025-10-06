import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { ClipboardList, CalendarDays, Settings } from 'lucide-react-native';

const TAB_ICONS: Record<string, React.ComponentType<{ color: string; size?: number }>> = {
  reservations: ClipboardList,
  slots: CalendarDays,
  settings: Settings
};

export default function ProviderTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const IconComponent = TAB_ICONS[route.name] ?? ClipboardList;

        return {
          headerShown: true,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => (
            <IconComponent color={color ?? '#6B7280'} size={size ?? 24} />
          ),
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 82 : 64,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 16 : 10
          }
        };
      }}
    >
      <Tabs.Screen
        name='reservations'
        options={{
          title: '予約確認',
          tabBarLabel: '予約確認'
        }}
      />
      <Tabs.Screen
        name='slots'
        options={{
          title: '体験枠の管理',
          tabBarLabel: '体験枠'
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: '設定',
          tabBarLabel: '設定'
        }}
      />
    </Tabs>
  );
}

