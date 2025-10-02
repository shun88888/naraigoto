import React, { useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
  Phone,
  Award
} from 'lucide-react-native';

import { getExperience } from '../../../src/lib/api';
import { UIButton } from '../../../src/components/ui/Button';
import { colors } from '../../../src/lib/colors';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=60';

type ExperienceMenu = {
  id: string;
  title: string;
  duration: string;
  price: string;
  description?: string;
  notes?: string[];
};

export default function ExperienceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [exp, setExp] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const detail = await getExperience(id);
      if (mounted) setExp(detail);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const heroImage = useMemo(() => exp?.image_url || FALLBACK_IMAGE, [exp?.image_url]);

  const rating = exp?.rating ?? 4.6;
  const reviewsCount = exp?.reviews_count ?? 24;
  const priceLabel = exp?.price ? `¥${exp.price.toLocaleString()}` : '¥3,500〜';
  const durationLabel = exp?.duration ?? '120分';
  const targetAge = exp?.target_age ?? '5歳〜';
  const teacher = exp?.mentor ?? 'Meguro Kids Studio';

  const menus: ExperienceMenu[] = useMemo(() => {
    if (Array.isArray(exp?.menus) && exp.menus.length > 0) {
      return exp.menus.map((item: any, index: number) => ({
        id: item.id ?? `menu-${index}`,
        title: item.title ?? `体験メニュー ${index + 1}`,
        duration: item.duration ?? durationLabel,
        price: item.price ? `¥${item.price.toLocaleString()}` : priceLabel,
        description: item.description ?? '体験の内容がここに入ります。',
        notes: item.notes ?? []
      }));
    }
    return [
      {
        id: 'menu-1',
        title: '親子で作る木工クリエイティブ体験',
        duration: '120分',
        price: '¥4,500',
        description: '講師と一緒に木工の基礎から作品づくりまで体験する定番コース。',
        notes: ['工具の使い方から丁寧にレクチャー', '作品はそのまま持ち帰り可能']
      },
      {
        id: 'menu-2',
        title: '少人数プレミアムレッスン',
        duration: '90分',
        price: '¥6,000',
        description: 'グループでじっくり体験できる少人数クラス。チャレンジ課題にも対応。',
        notes: ['最大3組までの少人数制', '経験者向けの応用テクニックあり']
      }
    ];
  }, [exp?.menus, durationLabel, priceLabel]);

  const flowSteps = useMemo(
    () =>
      exp?.flow ?? [
        { id: 'step-1', label: '受付 / カウンセリング', detail: 'お子さまの興味や体験の目的をヒアリング。' },
        { id: 'step-2', label: '安全ガイド / ウォームアップ', detail: '安全に工具を扱うためのレクチャーとウォーミングアップ。' },
        { id: 'step-3', label: '作品制作', detail: '講師がサポートしながら親子で作品作りに挑戦。' },
        { id: 'step-4', label: '振り返り / フィードバック', detail: '完成した作品をシェアし、次に挑戦したいことを整理。' }
      ],
    [exp?.flow]
  );

  if (!exp) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.muted }}>読み込み中…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.heroWrapper}>
          <ImageBackground source={{ uri: heroImage }} style={styles.heroImage}>
            <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']} style={styles.heroGradient} />
          </ImageBackground>
          <View style={styles.heroTopActions}>
            <TouchableOpacity style={styles.roundIcon} onPress={() => router.back()}>
              <ArrowLeft color={colors.fg} size={20} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.roundIcon}>
                <Share2 color={colors.fg} size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundIcon}>
                <Heart color={colors.fg} size={18} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroCategory}>{exp.genre ?? '親子体験ワークショップ'}</Text>
            <Text style={styles.heroTitle}>{exp.title}</Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatChip}>
                <Star size={14} color='#FACC15' />
                <Text style={styles.heroStatText}>{rating.toFixed(1)}</Text>
              </View>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatText}>クチコミ {reviewsCount}件</Text>
              </View>
              <View style={styles.heroStatChip}>
                <MapPin size={14} color={colors.fg} />
                <Text style={styles.heroStatText}>{exp.location ?? '恵比寿・目黒エリア'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>{exp.title}</Text>
              <Text style={styles.summarySubtitle}>{teacher}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceMain}>{priceLabel}</Text>
              <Text style={styles.priceNote}>1組（大人+子ども）</Text>
            </View>
          </View>

          <View style={styles.summaryMetrics}>
            <SummaryMetric icon={<Clock size={16} color={colors.fg} />} label={`所要 ${durationLabel}`} />
            <SummaryMetric icon={<Users size={16} color={colors.fg} />} label={`対象 ${targetAge}`} />
            <SummaryMetric icon={<Award size={16} color={colors.fg} />} label='作品持ち帰り可' />
          </View>

          <View style={styles.summaryActions}>
            <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
              <Heart size={18} color='#F87171' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
              <Phone size={18} color={colors.fg} />
            </TouchableOpacity>
          </View>
        </View>

        <Section title='おすすめメニュー'>
          <View style={{ gap: 16 }}>
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} onReserve={() => router.push({ pathname: '/booking/date', params: { expId: exp.id, menuId: menu.id } })} />
            ))}
          </View>
        </Section>

        <Section title='体験の流れ'>
          <View style={{ gap: 12 }}>
            {flowSteps.map((step: any, index: number) => (
              <View key={step.id ?? `step-${index}`} style={styles.stepRow}>
                <View style={styles.stepIndex}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title='スクール情報'>
          <View style={styles.infoGrid}>
            <InfoItem icon={<MapPin size={18} color={colors.fg} />} label='住所' value={exp.address ?? '東京都渋谷区恵比寿1-10-3'} />
            <InfoItem icon={<Phone size={18} color={colors.fg} />} label='電話' value={exp.phone ?? '03-1234-5678'} />
            <InfoItem icon={<Clock size={18} color={colors.fg} />} label='営業時間' value={exp.hours ?? '平日 10:00-18:00 / 土日祝 9:00-17:00'} />
          </View>
        </Section>

        <Section title='クチコミ'>
          <View style={{ gap: 12 }}>
            {(exp.reviews ?? sampleReviews).map((review: any, index: number) => (
              <ReviewCard
                key={review.id ?? `review-${index}`}
                author={review.author ?? '保護者A'}
                rating={review.rating ?? 4.5}
                date={review.date ?? '2025/05/10'}
                comment={review.comment ?? '講師の方がとても丁寧で、子どもが自信を持てるようになりました。'}
              />
            ))}
          </View>
        </Section>

        <Section title='アクセス'>
          <View style={styles.mapPlaceholder}>
            <Text style={{ color: colors.muted }}>地図がここに入ります（近日追加予定）</Text>
          </View>
        </Section>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>最安値</Text>
          <Text style={styles.bottomPrice}>{priceLabel}</Text>
        </View>
        <UIButton
          variant='primary'
          onPress={() => router.push({ pathname: '/booking/date', params: { expId: exp.id } })}
          style={styles.bottomButton}
        >
          予約に進む
        </UIButton>
      </View>
    </View>
  );
}

function SummaryMetric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.metricChip}>
      {icon}
      <Text style={styles.metricText}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MenuCard({ menu, onReserve }: { menu: ExperienceMenu; onReserve: () => void }) {
  return (
    <View style={styles.menuCard}>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={styles.menuTitle}>{menu.title}</Text>
        {menu.description ? <Text style={styles.menuDescription}>{menu.description}</Text> : null}
        <View style={styles.menuMetaRow}>
          <Text style={styles.menuMeta}>{menu.duration}</Text>
          <Text style={styles.menuPrice}>{menu.price}</Text>
        </View>
        {Array.isArray(menu.notes) && menu.notes.length > 0 ? (
          <View style={{ gap: 4 }}>
            {menu.notes.map((note, index) => (
              <View key={`${menu.id}-note-${index}`} style={styles.menuNoteRow}>
                <View style={styles.menuBullet} />
                <Text style={styles.menuNoteText}>{note}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <UIButton variant='secondary' onPress={onReserve} style={styles.menuButton}>
        このメニューを予約
      </UIButton>
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoItemLabel}>{label}</Text>
        <Text style={styles.infoItemValue}>{value}</Text>
      </View>
    </View>
  );
}

function ReviewCard({ author, rating, date, comment }: { author: string; rating: number; date: string; comment: string }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{author}</Text>
        <Text style={styles.reviewDate}>{date}</Text>
      </View>
      <View style={styles.reviewRatingRow}>
        <Star size={14} color='#FACC15' />
        <Text style={styles.reviewRatingText}>{rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.reviewComment}>{comment}</Text>
    </View>
  );
}

const sampleReviews = [
  {
    id: 'sample-1',
    author: '保護者A',
    rating: 4.8,
    date: '2025/05/02',
    comment: '初めての参加でしたが、講師の方が丁寧に教えてくださり、子どもも最後まで集中して取り組めました。'
  },
  {
    id: 'sample-2',
    author: '保護者B',
    rating: 4.5,
    date: '2025/04/21',
    comment: '作品を持ち帰れるのがうれしいです。安全面もしっかりしており、安心して参加できました。'
  }
];

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg
  },
  container: {
    flex: 1
  },
  contentContainer: {
    paddingBottom: 140
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroWrapper: {
    height: 320,
    position: 'relative'
  },
  heroImage: {
    flex: 1
  },
  heroGradient: {
    flex: 1
  },
  heroTopActions: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  roundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16
  },
  heroCategory: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 1
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap'
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  heroStatText: {
    color: colors.fg,
    fontSize: 12,
    fontWeight: '600'
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: -54,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 20
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg
  },
  summarySubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4
  },
  priceBadge: {
    alignItems: 'flex-end'
  },
  priceMain: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.fg
  },
  priceNote: {
    fontSize: 12,
    color: colors.muted
  },
  summaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  metricText: {
    color: colors.fg,
    fontSize: 12,
    fontWeight: '600'
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg
  },
  menuDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20
  },
  menuMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuMeta: {
    fontSize: 13,
    color: colors.fg,
    fontWeight: '600'
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.fg
  },
  menuNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  menuBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fg,
    marginTop: 6
  },
  menuNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18
  },
  menuButton: {
    alignSelf: 'flex-end',
    minWidth: 160
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.fg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepIndexText: {
    color: colors.accent,
    fontWeight: '700'
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.fg
  },
  stepDetail: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18
  },
  infoGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12
  },
  infoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoItemLabel: {
    fontSize: 13,
    color: colors.muted
  },
  infoItemValue: {
    fontSize: 15,
    color: colors.fg,
    marginTop: 2
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.fg
  },
  reviewDate: {
    fontSize: 12,
    color: colors.muted
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.fg
  },
  reviewComment: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19
  },
  mapPlaceholder: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  bottomLabel: {
    fontSize: 12,
    color: colors.muted
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.fg
  },
  bottomButton: {
    flex: 1,
    marginLeft: 12
  }
});

