import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { listBookings } from '../../../src/lib/api';
import { dummyExperiences } from '../../../src/lib/dummyData';
import { mockBookings } from '../../../src/lib/bookingMocks';
import { useRouter } from 'expo-router';

export default function MyBookingsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setItems(mockBookings);
  }, []);

  const today = new Date();
  const upcoming = items.filter((b) => new Date(b.date) >= today);
  const past = items.filter((b) => new Date(b.date) < today);

  const getExperience = (experienceId: string) => {
    return dummyExperiences.find(e => e.id === experienceId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日（${weekday}）`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '予約確定';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      default: return '不明';
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => {
    const experience = getExperience(booking.experience_id);
    if (!experience) return null;

    console.log('Booking experience:', experience.id, 'Image URL:', experience.image_url);

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/bookings/[id]', params: { id: booking.id } })}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Image */}
          <View style={{ width: 100, height: 100, position: 'relative' }}>
            {experience.image_url ? (
              <Image
                source={{ uri: experience.image_url }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  backgroundColor: '#F3F4F6'
                }}
                resizeMode="cover"
                onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
                onLoad={() => console.log('Image loaded successfully:', experience.image_url)}
              />
            ) : (
              <View style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#F3F4F6',
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>画像なし</Text>
              </View>
            )}

            {/* Status Badge */}
            <View style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: getStatusColor(booking.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '700'
              }}>
                {getStatusText(booking.status)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#111827',
                flex: 1,
                marginRight: 8
              }} numberOfLines={2}>
                {experience.title}
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#FFD400'
              }}>
                ¥{booking.price.toLocaleString()}
              </Text>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                📅 {formatDate(booking.date)} {booking.time}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                📍 {experience.location}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280' }}>
                👥 {booking.participants}名
              </Text>

              {/* School information */}
              {experience.school_name && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#F3F4F6',
                    overflow: 'hidden'
                  }}>
                    {experience.school_icon ? (
                      <Image
                        source={{ uri: experience.school_icon }}
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#FFD400',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#000' }}>
                          {experience.school_name.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {experience.school_name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            マイ予約
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>
            予約済みの体験を管理できます
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 8 }}>
              予約はまだありません
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
              ホーム画面から気になる体験を見つけて{'\n'}予約してみましょう！
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(user)/(tabs)/home')}
              style={{
                backgroundColor: '#FFD400',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 16
              }}
            >
              <Text style={{ color: '#000000', fontWeight: '700', fontSize: 14 }}>
                体験を探す
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                    今後の予約
                  </Text>
                  <View style={{
                    backgroundColor: '#FFD400',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginLeft: 8
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#000000' }}>
                      {upcoming.length}
                    </Text>
                  </View>
                </View>
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                    過去の予約
                  </Text>
                  <View style={{
                    backgroundColor: '#E5E7EB',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginLeft: 8
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280' }}>
                      {past.length}
                    </Text>
                  </View>
                </View>
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
