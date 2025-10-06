import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { SwipeDeck, SwipeItem } from '../../src/components/SwipeCard';
import { useRouter } from 'expo-router';
import { UIButton } from '../../src/components/ui/Button';
import { useAppStore } from '../../src/state/store';
import { listExperiences } from '../../src/lib/api';

export default function HomeScreen() {
  const [items, setItems] = useState<SwipeItem[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [lastAction, setLastAction] = useState<{ type: 'like' | 'skip'; id: string } | null>(null);
  const addLike = useAppStore((s) => s.addLike);
  const removeLike = useAppStore((s) => s.removeLike);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const exps = await listExperiences({ page: 1, pageSize: 10, filters: {} });
      setItems(
        exps.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          image_url: e.image_url,
          category: e.category,
          type: e.type,
          genre: e.genre,
          method: e.method,
          price: e.price,
          location: e.location,
          min_age: e.min_age,
          max_age: e.max_age,
          school_name: e.school_name,
          school_icon: e.school_icon
        }))
      );
    })();
  }, []);

  const onLike = (item: any) => {
    // Optimistic like
    addLike(item.id);
    // Background send could be added here
    setIndex((i) => i + 1);
    setLastAction({ type: 'like', id: item.id });
  };

  const onSkip = (item: any) => {
    setIndex((i) => i + 1);
    setLastAction({ type: 'skip', id: item.id });
  };

  const undo = () => {
    if (!lastAction) return;
    setIndex((i) => Math.max(0, i - 1));
    if (lastAction.type === 'like') removeLike(lastAction.id);
    setLastAction(null);
  };

  const categories = useMemo(() => {
    const set = new Set(items.map((i: any) => i.category).filter(Boolean));
    return Array.from(set) as string[];
  }, [items]);

  const filtered = useMemo(() => {
    if (!category) return items;
    return items.filter((i: any) => i.category === category);
  }, [items, category]);

  if (!items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>読み込み中…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '800' }}>ホーム</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        style={{ flexGrow: 0, marginBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => setCategory(null)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: category === null ? '#FFD400' : '#EFEFEF',
            borderRadius: 20,
            backgroundColor: category === null ? '#FFD400' : '#FFFFFF',
            minWidth: 60,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 14 }}>すべて</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCategory(c)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: category === c ? '#FFD400' : '#EFEFEF',
              borderRadius: 20,
              backgroundColor: category === c ? '#FFD400' : '#FFFFFF',
              minWidth: 60,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 14 }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <SwipeDeck
          data={filtered}
          index={index}
          onSwipeLeft={onSkip}
          onSwipeRight={onLike}
          onPressItem={(it: any) => router.push({ pathname: '/experience/[id]', params: { id: it.id } })}
        />
      </View>

      {/* Main Action Buttons */}
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          {/* Dislike Button */}
          <TouchableOpacity
            onPress={() => onSkip(filtered[index % filtered.length])}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: '#FFFFFF',
              borderWidth: 3,
              borderColor: '#FF4757',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#FF4757',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4
            }}
          >
            <Text style={{ fontSize: 28, color: '#FF4757', fontWeight: '600' }}>✕</Text>
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            onPress={() => onLike(filtered[index % filtered.length])}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FF4757',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#FF4757',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6
            }}
          >
            <Text style={{ fontSize: 32, color: '#FFFFFF', fontWeight: '600' }}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Undo Button - Bottom Left */}
      <TouchableOpacity
        onPress={undo}
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }}
      >
        <Text style={{ fontSize: 24, color: '#666', fontWeight: '600' }}>⟲</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
