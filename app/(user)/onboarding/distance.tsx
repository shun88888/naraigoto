import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { UIButton } from '../../../src/components/ui/Button';
import { useAppStore } from '../../../src/state/store';
import { useRouter } from 'expo-router';

export default function DistanceScreen() {
  const router = useRouter();
  const defaultKm = useAppStore((s) => s.maxDistanceKm);
  const setMaxDistance = useAppStore((s) => s.setMaxDistanceKm);
  const [km, setKm] = useState(defaultKm);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 12 }}>通える距離は？</Text>
      <Text style={{ color: '#666', marginBottom: 24 }}>スライダーで最大距離を設定してください。</Text>

      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>距離</Text>
          <Text>{km} km</Text>
        </View>
        <Slider
          value={km}
          onValueChange={(v) => setKm(Math.round(v))}
          onSlidingComplete={(v) => setKm(Math.round(v))}
          minimumValue={1}
          maximumValue={200}
          minimumTrackTintColor="#FF3366"
          maximumTrackTintColor="#CBD5E1"
          step={1}
        />
      </View>

      <View style={{ flex: 1 }} />
      <UIButton
        variant="secondary"
        onPress={() => {
          setMaxDistance(km);
          router.push('/onboarding/interests');
        }}
      >
        次へ
      </UIButton>
    </View>
  );
}




