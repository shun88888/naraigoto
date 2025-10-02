import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UIButton } from '../../../src/components/ui/Button';
import { reserve } from '../../../src/lib/api';
import { dummyExperiences } from '../../../src/lib/dummyData';

export default function ConfirmScreen() {
  const { slotId, expId } = useLocalSearchParams<{ slotId: string; expId: string }>();
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState<any>(null);

  useEffect(() => {
    // Get experience details from dummy data
    const exp = dummyExperiences.find(e => e.id === expId);
    setExperience(exp);
  }, [expId]);

  const onConfirm = async () => {
    if (!agree) return;
    setLoading(true);
    const res = await reserve({ slotId: String(slotId), participants: 1 });
    setLoading(false);
    if (!res.success) {
      Alert.alert('予約失敗', res.message || '残数を再取得して再試行してください。');
      return;
    }
    const bookingId = res.booking?.id || 'local';
    router.replace({ pathname: '/booking/done', params: { bookingId, slotId } });
  };

  if (!experience) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
            予約内容の確認
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            内容をご確認の上、予約を確定してください
          </Text>
        </View>

        {/* Experience Card */}
        <View style={{
          backgroundColor: '#FFFFFF',
          margin: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}>
          {/* Image */}
          <View style={{ position: 'relative' }}>
            {experience.image_url ? (
              <Image
                source={{ uri: experience.image_url }}
                style={{
                  width: '100%',
                  height: 180,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  backgroundColor: '#F3F4F6'
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                width: '100%',
                height: 180,
                backgroundColor: '#F3F4F6',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: '#9CA3AF' }}>画像なし</Text>
              </View>
            )}

            {/* Price Badge */}
            <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#FFD400',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16
            }}>
              <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>
                ¥{experience.price?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
              {experience.title}
            </Text>

            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 }}>
              {experience.description}
            </Text>

            {/* Details Grid */}
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>カテゴリー</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  {experience.category}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>対象年齢</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  {experience.min_age}-{experience.max_age}歳
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>場所</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  {experience.location}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>所要時間</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  約60分
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            予約詳細
          </Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>予約日時</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                2025年10月1日（火）14:00-15:00
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>参加人数</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                1名
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>合計金額</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFD400' }}>
                ¥{experience.price?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms Agreement */}
        <View style={{
          backgroundColor: '#FFFFFF',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>
            利用規約への同意
          </Text>

          <TouchableOpacity
            onPress={() => setAgree(!agree)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: agree ? '#FFD400' : '#D1D5DB',
              backgroundColor: agree ? '#FFD400' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {agree && (
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '700' }}>✓</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                <Text style={{ color: '#FFD400', textDecorationLine: 'underline' }}>利用規約</Text>
                および
                <Text style={{ color: '#FFD400', textDecorationLine: 'underline' }}>プライバシーポリシー</Text>
                に同意します
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
      }}>
        <UIButton
          variant="primary"
          onPress={onConfirm}
          disabled={!agree}
          loading={loading}
          style={{
            backgroundColor: agree ? '#FFD400' : '#D1D5DB',
            borderRadius: 8,
            paddingVertical: 16
          }}
        >
          <Text style={{
            color: agree ? '#000000' : '#FFFFFF',
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center'
          }}>
            予約を確定する
          </Text>
        </UIButton>
      </View>
    </SafeAreaView>
  );
}


