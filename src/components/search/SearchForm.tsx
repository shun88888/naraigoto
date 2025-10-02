import React from 'react';
import { View, TextInput } from 'react-native';
import { UIButton } from '../../components/ui/Button';
import { colors } from '../../lib/colors';

export function SearchForm({
  location,
  query,
  onChangeLocation,
  onChangeQuery,
  onSubmit,
  onSave
}: {
  location: string;
  query: string;
  onChangeLocation: (v: string) => void;
  onChangeQuery: (v: string) => void;
  onSubmit: () => void;
  onSave: () => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          placeholder="地域（例: 東京）"
          value={location}
          onChangeText={onChangeLocation}
          style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44 }}
        />
        <UIButton variant="secondary" onPress={onSubmit}>検索</UIButton>
      </View>
      <TextInput
        placeholder="キーワード（カテゴリ/こだわり）"
        value={query}
        onChangeText={onChangeQuery}
        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <UIButton variant="ghost" onPress={onSave}>条件保存</UIButton>
      </View>
    </View>
  );
}





