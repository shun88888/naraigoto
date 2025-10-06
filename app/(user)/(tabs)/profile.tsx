import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppStore } from '../../../src/state/store';
import { RadarChart } from '../../../src/components/RadarChart';
import { CustomTabBar } from '../../../src/components/CustomTabBar';

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
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#F8F8F8' }}>
        <TouchableOpacity
          onPress={openSettings}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'ios' ? 106 : 86 }}>
        {/* Profile Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          alignItems: 'center'
        }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#E5E7EB',
              marginBottom: 16
            }}
          />
          <Text style={{ fontWeight: '800', fontSize: 20, marginBottom: 4 }}>みさね</Text>
          <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 12 }}>@user</Text>

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: 18 }}>{likes.length}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>いいね</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: 18 }}>12</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>体験済み</Text>
            </View>
          </View>
        </View>

        {/* Ability Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB'
        }}>
          <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 16 }}>能力指数</Text>
          <View style={{ alignItems: 'center' }}>
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

        {/* Info Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB'
        }}>
          <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 12 }}>基本情報</Text>
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>年齢</Text>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>10歳</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>性別</Text>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>女性</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <CustomTabBar />
    </View>
  );
}

