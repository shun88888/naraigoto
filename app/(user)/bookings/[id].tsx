import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getBooking } from '../../../src/lib/api';
import { dummyExperiences } from '../../../src/lib/dummyData';
import { findMockBooking } from '../../../src/lib/bookingMocks';
import { UIButton } from '../../../src/components/ui/Button';
import { colors } from '../../../src/lib/colors';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=60';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: '予約確定', color: '#047857', bg: 'rgba(16, 185, 129, 0.12)' },
  completed: { label: '完了', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)' },
  cancelled: { label: 'キャンセル', color: '#B91C1C', bg: 'rgba(239, 68, 68, 0.12)' }
};

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        const remote = await getBooking(id);
        if (mounted && remote) {
          setBooking(remote);
          return;
        }
      } catch (error) {
        console.warn('[bookingDetail] getBooking failed', error);
      }
      const fallback = findMockBooking(id);
      if (mounted) setBooking(fallback);
    })().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const experience = useMemo(() => {
    if (!booking) return null;
    return dummyExperiences.find((exp) => exp.id === booking.experience_id) || null;
  }, [booking]);

  const statusInfo = STATUS_MAP[booking?.status ?? 'confirmed'] || STATUS_MAP.confirmed;

  const bookingDate = useMemo(() => {
    if (!booking?.date) return null;
    const date = new Date(booking.date);
    if (Number.isNaN(date.getTime())) return null;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
    const formatted = new Intl.DateTimeFormat('ja-JP', options).format(date);
    return formatted;
  }, [booking?.date]);

  const handleOpenTicket = () => {
    if (!booking) return;
    router.push({ pathname: '/ticket/[id]', params: { id: booking.id, slotId: booking.slot_id } });
  };

  const handleCall = () => {
    const phone = (experience as any)?.phone || '03-1234-5678';
    const sanitized = phone.replace(/[^0-9]/g, '');
    if (!sanitized) return;
    Linking.openURL(`tel:${sanitized}`).catch((err) => {
      console.warn('[bookingDetail] failed to open dialer', err);
    });
  };

  if (loading || !booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.muted }}>{loading ? '読み込み中…' : '予約情報が見つかりませんでした'}</Text>
      </View>
    );
  }

  const priceDisplay = booking.price ? `¥${booking.price.toLocaleString()}` : '―';
  const timeDisplay = booking.time || '時間未定';
  const participants = booking.participants ? `${booking.participants}名` : '1名';
  const heroImage = experience?.image_url || FALLBACK_IMAGE;
  const locationDisplay = experience?.location ? `東京都・${experience.location}` : '場所未設定';
  const contactPhone = (experience as any)?.phone || '03-1234-5678';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Image source={{ uri: heroImage }} style={styles.heroImage} />
        <View style={styles.heroBody}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}> 
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
          <Text style={styles.heroTitle}>{experience?.title || '予約体験'}</Text>
          <Text style={styles.heroSubtitle}>{locationDisplay}</Text>

          <View style={styles.scheduleRow}>
            <View style={styles.scheduleColumn}>
              <Text style={styles.scheduleLabel}>実施日</Text>
              <Text style={styles.scheduleValue}>{bookingDate || booking.date}</Text>
            </View>
            <View style={[styles.scheduleColumn, { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#E5E7EB', paddingLeft: 16 }]}>
              <Text style={styles.scheduleLabel}>時間帯</Text>
              <Text style={styles.scheduleValue}>{timeDisplay}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <UIButton style={styles.primaryButton} onPress={handleOpenTicket}>
              <Text style={styles.primaryButtonText}>チケット（QR）を表示</Text>
            </UIButton>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85} onPress={handleCall}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>予約情報</Text>
        <DetailRow label="予約ID" value={`#${booking.id}`} />
        <DetailRow label="体験名" value={experience?.title ?? booking.experience_id ?? '不明'} />
        <DetailRow label="参加人数" value={participants} />
        <DetailRow label="料金" value={priceDisplay} />
        <DetailRow label="支払い状況" value={booking.status === 'completed' ? '決済済み' : '決済予定'} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>注意事項</Text>
        {[ 
          '開始10分前までに受付へお越しください。',
          '汚れても良い服装・靴でご来場ください。',
          'キャンセルは前日の正午までにご連絡ください。'
        ].map((item) => (
          <Text key={item} style={styles.bodyText}>• {item}</Text>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>施設情報</Text>
        <DetailRow label="住所" value={experience?.location ? `東京都渋谷区／${experience.location}` : '東京都渋谷区恵比寿1-2-3'} />
        <DetailRow label="連絡先" value={contactPhone} />
        <DetailRow label="持ち物" value="エプロン、タオル（汚れても良い服装）" />
      </View>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '―'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8'
  },
  contentContainer: {
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8'
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    marginBottom: 20
  },
  heroImage: {
    width: '100%',
    height: 170,
    backgroundColor: '#E5E7EB'
  },
  heroBody: {
    padding: 20
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700'
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.fg,
    marginBottom: 6
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 18
  },
  scheduleRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  scheduleColumn: {
    flex: 1
  },
  scheduleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.fg
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    marginRight: 12
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.fg
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: 15,
    color: colors.fg,
    fontWeight: '600'
  },
  bodyText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
    marginBottom: 6
  },
  footerSpacing: {
    height: 12
  }
});
