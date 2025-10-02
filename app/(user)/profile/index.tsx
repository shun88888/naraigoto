import React, { useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppStore } from '../../../src/state/store';
import { RadarChart } from '../../../src/components/RadarChart';

export default function ProfileScreen() {
  const router = useRouter();
  const likes = useAppStore((s) => s.likes);
  const ability = useAppStore((s) => s.ability);
  const navigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
      return () => {
        navigating.current = false;
      };
    }, [])
  );

  const openSettings = useCallback(() => {
    if (navigating.current) return;
    navigating.current = true;
    router.push('/(user)/settings');
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <View style={{ height: 220, backgroundColor: '#1F2937', position: 'relative' }}>
          {/* Settings gear icon */}
          <TouchableOpacity
            onPress={openSettings}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}
            activeOpacity={0.8}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: '#fff',
              position: 'relative'
            }}>
              {/* Gear teeth */}
              <View style={{ position: 'absolute', top: -2, left: 7, width: 2, height: 4, backgroundColor: '#fff' }} />
              <View style={{ position: 'absolute', bottom: -2, left: 7, width: 2, height: 4, backgroundColor: '#fff' }} />
              <View style={{ position: 'absolute', left: -2, top: 7, width: 4, height: 2, backgroundColor: '#fff' }} />
              <View style={{ position: 'absolute', right: -2, top: 7, width: 4, height: 2, backgroundColor: '#fff' }} />
              {/* Center circle */}
              <View style={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 6,
                height: 6,
                borderRadius: 3,
                borderWidth: 1,
                borderColor: '#fff',
                backgroundColor: 'transparent'
              }} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', marginTop: -48 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: '#D4D4D4',
              borderWidth: 4,
              borderColor: '#fff'
            }}
          />
        </View>

        <View style={{ padding: 16, alignItems: 'center', gap: 8 }}>
          <Text style={{ fontWeight: '800', fontSize: 22 }}>みさね（仮）</Text>
          <Text style={{ color: '#6B7280' }}>@user / WOMEN / 10歳</Text>
          <Text style={{ color: '#10B981', fontWeight: '700' }}>ブランド公認（仮）</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
            <Text><Text style={{ fontWeight: '800' }}>{likes.length}</Text> いいね</Text>
            <Text><Text style={{ fontWeight: '800' }}>3,912</Text> フォロワー</Text>
            <Text><Text style={{ fontWeight: '800' }}>42</Text> フォロー</Text>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 8,
              backgroundColor: '#111827',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 28
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFD400', fontWeight: '800' }}>フォローする</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Text style={{ fontWeight: '800', fontSize: 18 }}>プロフィール</Text>
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#fff' }}>
          <Text style={{ fontWeight: '700' }}>いいね数: {likes.length}</Text>
        </View>

        <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#fff', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>能力指数</Text>
          <RadarChart
            labels={["創造性", "問題解決", "協働", "コミュ", "やり抜く"]}
            values={[
              ability.creativity * 20,
              ability.problemSolving * 20,
              ability.collaboration * 20,
              ability.communication * 20,
              ability.persistence * 20
            ]}
            compareValues={[60, 60, 60, 60, 60]}
          />
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
