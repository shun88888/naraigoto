import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { UIButton } from '../../../src/components/ui/Button';
import { useAppStore } from '../../../src/state/store';
import { useRouter } from 'expo-router';

const TAGS = ['科学', '工作', '料理', '音楽', 'スポーツ', '自然', 'プログラミング', 'アート'];

export default function InterestsScreen() {
  const router = useRouter();
  const interests = useAppStore((s) => s.interests);
  const toggle = useAppStore((s) => s.toggleInterest);
  const setDone = useAppStore((s) => s.setOnboardingCompleted);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 12 }}>興味・関心</Text>
      <Text style={{ color: '#666', marginBottom: 24 }}>当てはまるものを選んでください（複数選択可）。</Text>

      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map((t) => {
            const active = interests.includes(t);
            return (
              <TouchableOpacity
                key={t}
                onPress={() => toggle(t)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: active ? '#FF3366' : '#EFEFEF',
                  backgroundColor: active ? '#FFE4EC' : 'transparent'
                }}
              >
                <Text style={{ fontWeight: '600' }}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ flex: 1 }} />
      <UIButton
        variant="primary"
        onPress={() => {
          setDone(true);
          router.replace('/home');
        }}
      >
        はじめる
      </UIButton>
    </View>
  );
}




