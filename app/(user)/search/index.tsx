import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { listExperiences } from '../../../src/lib/api';
import { colors } from '../../../src/lib/colors';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../../src/state/store';
import { SearchForm } from '../../../src/components/search/SearchForm';
import { TipBanner } from '../../../src/components/search/TipBanner';
import { SortBar } from '../../../src/components/search/SortBar';
import { ResultCard } from '../../../src/components/search/ResultCard';

export default function SearchScreen() {
  const router = useRouter();
  const likesAdd = useAppStore((s) => s.addLike);
  const q = useAppStore((s) => s.searchQuery);
  const location = useAppStore((s) => s.searchLocation);
  const sort = useAppStore((s) => s.searchSort);
  const setQ = useAppStore((s) => s.setSearchQuery);
  const setLocation = useAppStore((s) => s.setSearchLocation);
  const setSort = useAppStore((s) => s.setSearchSort);
  const addHistory = useAppStore((s) => s.addSearchHistory);
  const hiddenTip = useAppStore((s) => s.hiddenTip);
  const hideTip = useAppStore((s) => s.hideTipBanner);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (p: number, replace = false) => {
    if (loading) return;
    setLoading(true);
    const data = await listExperiences({ page: p, pageSize: 10, filters: { q, sort } });
    setItems((prev) => (replace ? data : [...prev, ...data]));
    setHasMore(data.length >= 10);
    setLoading(false);
  }, [q, sort, loading]);

  useEffect(() => {
    setPage(1);
    fetchPage(1, true);
  }, [q, sort]);

  const submit = useCallback(() => {
    addHistory(q);
    setPage(1);
    fetchPage(1, true);
  }, [q, addHistory, fetchPage]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F8F8F8' }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={items}
      keyExtractor={(it) => String(it.id)}
      renderItem={({ item }) => (
        <ResultCard
          item={item}
          onPress={() => router.push({ pathname: '/experience/[id]', params: { id: item.id } })}
          onLike={() => likesAdd(item.id)}
        />
      )}
      ListHeaderComponent={() => (
        <View style={{ gap: 12 }}>
          <SearchForm
            location={location}
            query={q}
            onChangeLocation={setLocation}
            onChangeQuery={setQ}
            onSubmit={submit}
            onSave={() => {/* TODO: persist saved query */}}
          />
          {!hiddenTip && (
            <TipBanner text="タップして条件変更" onClose={hideTip} />
          )}
          <SortBar value={sort} onChange={(s) => setSort(s as any)} />
          <Text>検索結果: {items.length}件</Text>
        </View>
      )}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPage(next);
        }
      }}
      ListFooterComponent={() => (
        <View style={{ paddingVertical: 16 }}>{loading ? <Text style={{ textAlign: 'center' }}>読み込み中…</Text> : null}</View>
      )}
    />
  );
}


