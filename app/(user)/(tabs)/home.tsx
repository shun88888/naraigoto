import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SwipeDeck, SwipeItem } from '../../../src/components/SwipeCard';
import { useRouter } from 'expo-router';
import { CustomTabBar } from '../../../src/components/CustomTabBar';
import { useAppStore } from '../../../src/state/store';
import { listExperiences } from '../../../src/lib/api';

export default function HomeScreen() {
  const [items, setItems] = useState<SwipeItem[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const tabBarHeight = Platform.OS === 'ios' ? 90 : 70;
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
    addLike(item.id);
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <Text>読み込み中…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
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

      <View
        style={{
          flex: 1,
          paddingHorizontal: 16
        }}
      >
        <SwipeDeck
          data={filtered}
          index={index}
          onSwipeLeft={onSkip}
          onSwipeRight={onLike}
          onPressItem={(it: any) => router.push({ pathname: '/experience/[id]', params: { id: it.id } })}
          tabBarHeight={tabBarHeight}
        />
      </View>
      <CustomTabBar />
    </View>
  );
}
