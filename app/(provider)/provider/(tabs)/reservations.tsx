import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SegmentedControl } from '../../../../src/components/provider/SegmentedControl';
import { UIButton } from '../../../../src/components/ui/Button';
import { UICard } from '../../../../src/components/ui/Card';
import { colors } from '../../../../src/lib/colors';
import { Tag } from '../../../../src/components/provider/Tag';
import { ProgressBar } from '../../../../src/components/provider/ProgressBar';
import {
  useProviderStore,
  type Reservation,
  type ReservationStatus,
  type ReservationFeedback
} from '../../../../src/state/provider-store';

const STATUS_OPTIONS: ReservationStatus[] = ['予約済', '来場', '受講中', '完了', '欠席', 'キャンセル'];

const FEEDBACK_KEYS = [
  { key: 'focus', label: '集中' },
  { key: 'collaboration', label: '協調' },
  { key: 'challenge', label: '挑戦' },
  { key: 'creativity', label: '創造' },
  { key: 'stamina', label: '体力' }
] as const;

type FeedbackDraft = {
  focus: number;
  collaboration: number;
  challenge: number;
  creativity: number;
  stamina: number;
  note?: string;
  childSummary?: string;
  shareWithGuardian: boolean;
};

const formatDateLabel = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const week = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const day = date.getDay();
  return `${Number(m)}月${Number(d)}日（${week[day]}）`;
};

const addDays = (iso: string, delta: number) => {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const todayISO = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
  return formatter.format(date);
};

export default function ProviderReservations() {
  const reservations = useProviderStore((state) => state.reservations);
  const isOnline = useProviderStore((state) => state.isOnline);
  const offlineQueue = useProviderStore((state) => state.offlineQueue);
  const setOnline = useProviderStore((state) => state.setOnline);
  const processQueue = useProviderStore((state) => state.processQueue);
  const updateReservationStatus = useProviderStore((state) => state.updateReservationStatus);
  const saveReservationMemo = useProviderStore((state) => state.saveReservationMemo);
  const saveReservationContact = useProviderStore((state) => state.saveReservationContact);
  const saveFeedback = useProviderStore((state) => state.saveFeedback);

  const [currentDate, setCurrentDate] = useState(todayISO());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const hasPendingSync = useMemo(() => reservations.some((item) => item.pendingSync), [reservations]);

  const todaysReservations = useMemo(() => {
    return reservations
      .filter((item) => item.date === currentDate)
      .filter((item) => {
        if (!search) return true;
        const target = `${item.child.name} ${item.child.kana ?? ''} ${item.guardian.name}`.toLowerCase();
        return target.includes(search.toLowerCase());
      })
      .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
      .sort((a, b) => (a.start > b.start ? 1 : -1));
  }, [reservations, currentDate, search, statusFilter]);

  const duplicateWarning = useMemo(() => {
    const map = new Map<string, number>();
    todaysReservations.forEach((item) => {
      const key = `${item.child.name}-${item.start}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.values()).some((count) => count > 1);
  }, [todaysReservations]);

  const openDetail = (reservation: Reservation) => {
    setSelectedReservationId(reservation.id);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedReservationId(null);
  };

  const handleStatusUpdate = (reservation: Reservation, nextStatus: ReservationStatus) => {
    updateReservationStatus(reservation.id, nextStatus);
    Alert.alert('ステータス更新', `${reservation.child.name} を「${nextStatus}」に更新しました。`);
  };

  const handleMemoSave = (reservation: Reservation, memo: string) => {
    saveReservationMemo(reservation.id, memo);
    setMemoDraft(memo);
    Alert.alert('保存しました', '当日のメモを記録しました。');
  };

  const handleFeedbackSave = (reservation: Reservation, draft: FeedbackDraft) => {
    const payload: ReservationFeedback = {
      ...draft,
      updatedAt: new Date().toISOString()
    };
    saveFeedback(reservation.id, payload);
    setFeedbackDraft({
      focus: draft.focus,
      collaboration: draft.collaboration,
      challenge: draft.challenge,
      creativity: draft.creativity,
      stamina: draft.stamina,
      note: draft.note ?? '',
      childSummary: draft.childSummary ?? '',
      shareWithGuardian: draft.shareWithGuardian
    });
    Alert.alert('保存しました', 'フィードバックを記録しました。');
  };

  const [memoDraft, setMemoDraft] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft>({
    focus: 3,
    collaboration: 3,
    challenge: 3,
    creativity: 3,
    stamina: 3,
    note: '',
    childSummary: '',
    shareWithGuardian: true
  });
  const [contactDraft, setContactDraft] = useState({ phone: '', email: '' });

  useEffect(() => {
    const target = reservations.find((reservation) => reservation.id === selectedReservationId);
    if (!target) return;
    setMemoDraft(target.memo ?? '');
    setFeedbackDraft({
      focus: target.feedback?.focus ?? 3,
      collaboration: target.feedback?.collaboration ?? 3,
      challenge: target.feedback?.challenge ?? 3,
      creativity: target.feedback?.creativity ?? 3,
      stamina: target.feedback?.stamina ?? 3,
      note: target.feedback?.note ?? '',
      childSummary: target.feedback?.childSummary ?? '',
      shareWithGuardian: target.feedback?.shareWithGuardian ?? true
    });
    setContactDraft({
      phone: target.guardian.phone ?? '',
      email: target.guardian.email ?? ''
    });
  }, [reservations, selectedReservationId]);

  const handleContactSave = (reservation: Reservation, contact: { phone: string; email: string }) => {
    saveReservationContact(reservation.id, contact);
    setContactDraft(contact);
    Alert.alert('保存しました', '連絡先を更新しました。');
  };

  const selectedReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === selectedReservationId) ?? null,
    [reservations, selectedReservationId]
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800' }}>予約確認</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Tag label={isOnline ? 'オンライン' : 'オフライン'} active={!isOnline} onPress={() => setOnline(!isOnline)} />
            {offlineQueue.length > 0 ? (
              <UIButton variant="ghost" onPress={processQueue} style={{ minWidth: 100 }}>
                再試行
              </UIButton>
            ) : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const prevDate = addDays(currentDate, -1);
              console.log('Going to previous day:', prevDate);
              setCurrentDate(prevDate);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              minWidth: 80
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>← 前日</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setDatePickerVisible(true)}
            style={{ flex: 1 }}
          >
            <View style={{ alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }} key={currentDate}>{formatDateLabel(currentDate)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const nextDate = addDays(currentDate, 1);
              console.log('Going to next day:', nextDate);
              setCurrentDate(nextDate);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              minWidth: 80
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>翌日 →</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCurrentDate(todayISO())}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: '#FFFFFF',
                minWidth: 120
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>今日に戻る</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDatePickerVisible(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: '#FFFFFF',
                minWidth: 120
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>日付選択</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <UICard style={{ borderRadius: 20, padding: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>検索・絞り込み</Text>
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="受講者名／保護者名で検索"
            value={search}
            onChangeText={setSearch}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16 }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Tag label="すべて" active={statusFilter === 'ALL'} onPress={() => setStatusFilter('ALL')} />
            {STATUS_OPTIONS.map((status) => (
              <Tag key={status} label={status} active={statusFilter === status} onPress={() => setStatusFilter(status)} />
            ))}
          </ScrollView>
        </View>
      </UICard>

      {duplicateWarning ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#B91C1C', fontWeight: '700' }}>同じ時間帯に重複している予約があります。対応順を確認してください。</Text>
        </View>
      ) : null}

      {hasPendingSync ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#1D4ED8', fontWeight: '700' }}>オフラインで保存された更新があります。ネットワークが復帰すると自動で同期します。</Text>
        </View>
      ) : null}

      {todaysReservations.length === 0 ? (
        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>本日の予約はありません</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>新しい体験枠を公開すると、ここに予約が表示されます。</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {todaysReservations.map((reservation) => {
            const feedbackDone = Boolean(reservation.feedback);
            const contactMissing = !reservation.guardian.phone && !reservation.guardian.email;
            return (
              <TouchableOpacity key={reservation.id} onPress={() => openDetail(reservation)} activeOpacity={0.8}>
                <UICard style={{ borderRadius: 20, padding: 20, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ gap: 6 }}>
                      <Text style={{ fontSize: 16, color: colors.muted }}>{reservation.start} - {reservation.end}</Text>
                      <Text style={{ fontSize: 18, fontWeight: '800' }}>{reservation.experience}</Text>
                      <Text style={{ fontSize: 16 }}>{reservation.child.name}（{reservation.child.age}）</Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>ステータス：{reservation.status}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                      <Tag label={reservation.venue} />
                      {feedbackDone ? <Tag label="FB済" active /> : null}
                      {reservation.pendingSync ? <Tag label="同期待ち" /> : null}
                    </View>
                  </View>
                  {contactMissing ? (
                    <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1 }}>
                      <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '700' }}>連絡先未登録</Text>
                      <Text style={{ fontSize: 13, color: '#92400E' }}>詳細シートで保護者の電話またはメールを登録すると、次回以降自動で表示されます。</Text>
                    </View>
                  ) : null}
                </UICard>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Modal visible={detailVisible} animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={closeDetail} presentationStyle="pageSheet">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}>
          {selectedReservation ? (
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800' }}>{selectedReservation.child.name}（{selectedReservation.child.age}）</Text>
                <UIButton variant="ghost" onPress={closeDetail} style={{ minWidth: 80 }}>
                  閉じる
                </UIButton>
              </View>
              <Text style={{ fontSize: 16, color: colors.muted }}>
                {selectedReservation.start} - {selectedReservation.end} ／ {selectedReservation.experience}
              </Text>
              <Text style={{ fontSize: 15, color: colors.muted }}>担当メンター：{selectedReservation.mentor}</Text>

              <UICard style={{ borderRadius: 16, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>連絡手段</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <UIButton
                    variant="ghost"
                    onPress={() => {
                      const phone = selectedReservation.guardian.phone;
                      if (!phone) {
                        Alert.alert('連絡先未登録', '保護者の電話番号を登録してください。');
                        return;
                      }
                      Linking.openURL(`tel:${phone}`);
                    }}
                    style={{ flexGrow: 1, minWidth: 140 }}
                  >
                    電話する
                  </UIButton>
                  <UIButton
                    variant="ghost"
                    onPress={() => {
                      const email = selectedReservation.guardian.email;
                      if (!email) {
                        Alert.alert('連絡先未登録', '保護者のメールアドレスを登録してください。');
                        return;
                      }
                      Linking.openURL(`mailto:${email}`);
                    }}
                    style={{ flexGrow: 1, minWidth: 140 }}
                  >
                    メールする
                  </UIButton>
                </View>
                <View style={{ marginTop: 16, gap: 8 }}>
                  <Text style={{ fontSize: 14, color: colors.muted }}>保護者連絡先（更新すると次回から自動表示）</Text>
                  <TextInput
                    placeholder="電話番号"
                    keyboardType="phone-pad"
                    value={contactDraft.phone}
                    onChangeText={(text) => setContactDraft((prev) => ({ ...prev, phone: text }))}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                  />
                  <TextInput
                    placeholder="メールアドレス"
                    keyboardType="email-address"
                    value={contactDraft.email}
                    onChangeText={(text) => setContactDraft((prev) => ({ ...prev, email: text }))}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                  />
                  <UIButton
                    variant="ghost"
                    onPress={() => handleContactSave(selectedReservation, contactDraft)}
                    style={{ alignSelf: 'flex-end', minWidth: 120 }}
                  >
                    保存
                  </UIButton>
                </View>
              </UICard>

              <UICard style={{ borderRadius: 16, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>得意なこと</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedReservation.profile.strengths.map((item) => (
                    <Tag key={item} label={item} />
                  ))}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', marginVertical: 8 }}>苦手なこと</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedReservation.profile.weakPoints.map((item) => (
                    <Tag key={item} label={item} />
                  ))}
                </View>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 12 }}>{selectedReservation.profile.recent}</Text>
              </UICard>

              <UICard style={{ borderRadius: 16, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>直近の体験履歴</Text>
                <View style={{ gap: 12 }}>
                  {selectedReservation.history.slice(0, 3).map((item) => (
                    <View key={`${item.date}-${item.experience}`} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700' }}>{item.date} {item.experience}</Text>
                      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>{item.memo}</Text>
                    </View>
                  ))}
                </View>
              </UICard>

              <UICard style={{ borderRadius: 16, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>当日操作</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {STATUS_OPTIONS.filter((status) => status !== selectedReservation.status).map((status) => (
                    <UIButton
                      key={status}
                      variant="ghost"
                      onPress={() => handleStatusUpdate(selectedReservation, status)}
                      style={{ flexGrow: 1, minWidth: 120 }}
                    >
                      {status}
                    </UIButton>
                  ))}
                </View>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 12 }}>現在：{selectedReservation.status}</Text>
              </UICard>

              <UICard style={{ borderRadius: 16, padding: 16, gap: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>当日のメモ</Text>
                <TextInput
                  placeholder="観察・注意点を記録"
                  value={memoDraft}
                  onChangeText={setMemoDraft}
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 100,
                    textAlignVertical: 'top'
                  }}
                />
                <UIButton
                  variant="ghost"
                  onPress={() => handleMemoSave(selectedReservation, memoDraft)}
                  style={{ alignSelf: 'flex-end', minWidth: 120 }}
                >
                  メモを保存
                </UIButton>
              </UICard>

              <UICard style={{ borderRadius: 16, padding: 16, gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>体験後フィードバック</Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  体験終了後に1分で記録。保存すると一覧に「FB済」が表示されます。
                </Text>
                {FEEDBACK_KEYS.map((item) => (
                  <View key={item.key} style={{ gap: 8 }}>
                    <Text style={{ fontSize: 15 }}>{item.label}</Text>
                    <SegmentedControl
                      segments={[1, 2, 3, 4, 5].map((value) => ({ label: String(value), value: String(value) }))}
                      value={String(feedbackDraft[item.key])}
                      onChange={(value) => setFeedbackDraft((prev) => ({ ...prev, [item.key]: Number(value) }))}
                    />
                    <ProgressBar value={feedbackDraft[item.key] / 5} height={8} tone="success" />
                  </View>
                ))}
                <TextInput
                  placeholder="自由記述（家庭への共有用メモなど）"
                  value={feedbackDraft.note}
                  onChangeText={(text) => setFeedbackDraft((prev) => ({ ...prev, note: text }))}
                  multiline
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
                />
                <TextInput
                  placeholder="子ども向け要約（150字以内）"
                  value={feedbackDraft.childSummary}
                  onChangeText={(text) => setFeedbackDraft((prev) => ({ ...prev, childSummary: text }))}
                  maxLength={150}
                  multiline
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15 }}>保護者共有の下書きを作成</Text>
                  <Tag
                    label={feedbackDraft.shareWithGuardian ? 'ON' : 'OFF'}
                    active={feedbackDraft.shareWithGuardian}
                    onPress={() => setFeedbackDraft((prev) => ({ ...prev, shareWithGuardian: !prev.shareWithGuardian }))}
                  />
                </View>
                <UIButton
                  variant="secondary"
                  onPress={() => handleFeedbackSave(selectedReservation, feedbackDraft)}
                  style={{ alignSelf: 'flex-end', minWidth: 160 }}
                >
                  フィードバックを記録
                </UIButton>
              </UICard>
            </View>
          ) : null}
        </ScrollView>
      </Modal>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>日付を選択</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={currentDate}
              onChangeText={setCurrentDate}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
            />
            <ScrollView style={{ maxHeight: 240 }}>
              {Array.from({ length: 14 }).map((_, index) => {
                const date = addDays(todayISO(), index);
                return (
                  <TouchableOpacity
                    key={date}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      setCurrentDate(date);
                      setDatePickerVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{formatDateLabel(date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <UIButton variant="ghost" onPress={() => setDatePickerVisible(false)}>
              閉じる
            </UIButton>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
