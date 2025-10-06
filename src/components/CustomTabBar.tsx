import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Flame, Search, Calendar, User2 } from 'lucide-react-native';

export function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'home', label: 'ホーム', icon: Flame, path: '/(user)/(tabs)/home' },
    { name: 'search', label: '検索', icon: Search, path: '/(user)/(tabs)/search' },
    { name: 'bookings', label: '予約', icon: Calendar, path: '/(user)/(tabs)/bookings' },
    { name: 'profile', label: 'プロフィール', icon: User2, path: '/(user)/(tabs)/profile' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: Platform.OS === 'ios' ? 90 : 70,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
        zIndex: 9999
      }}
      pointerEvents="auto"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              console.log('Tab pressed:', tab.name);
              router.push(tab.path as any);
            }}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8
            }}
            pointerEvents="auto"
          >
            <Icon
              color={active ? '#FFD400' : '#6B7280'}
              size={24}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: active ? '#FFD400' : '#6B7280',
                marginTop: 4
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
