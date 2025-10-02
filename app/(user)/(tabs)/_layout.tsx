import React from 'react';
import { Tabs } from 'expo-router';
import { Flame, Search, Calendar, User2 } from 'lucide-react-native';
import { colors } from '../../../src/lib/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Flame color={focused ? colors.accent : '#9CA3AF'} size={26} />
          )
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <Search color={focused ? colors.accent : '#9CA3AF'} size={26} />
          )
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ focused }) => (
            <Calendar color={focused ? colors.accent : '#9CA3AF'} size={26} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <User2 color={focused ? colors.accent : '#9CA3AF'} size={26} />
          )
        }}
      />
    </Tabs>
  );
}




