import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../../../src/lib/colors';
import { CalendarDays, ClipboardList, Settings } from 'lucide-react-native';

export default function ProviderTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1
        }
      }}
    >
      <Tabs.Screen
        name="reservations"
        options={{
          title: '予約確認',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="slots"
        options={{
          title: '体験枠の管理',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
