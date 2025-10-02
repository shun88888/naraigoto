import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { listChildren, upsertChild } from '../../../src/lib/api';

export default function ChildrenScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const load = async () => setItems(await listChildren());
  useEffect(() => { load(); }, []);
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: '800', fontSize: 18 }}>お子様プロフィール</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput placeholder="名前" value={name} onChangeText={setName} style={{ flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="アレルギー" value={allergies} onChangeText={setAllergies} style={{ flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={async ()=>{ try { await upsertChild({ name, allergies }); setName(''); setAllergies(''); await load(); } catch(e:any){ Alert.alert('保存失敗', e.message||''); } }} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>追加</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={items} keyExtractor={(it)=>String(it.id)} renderItem={({item})=> (
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text style={{ color: '#666' }}>{item.allergies}</Text>
        </View>
      )} />
    </View>
  );
}




