import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { UICard } from '../../../../src/components/ui/Card';
import { colors } from '../../../../src/lib/colors';
import { UIButton } from '../../../../src/components/ui/Button';
import { SegmentedControl } from '../../../../src/components/provider/SegmentedControl';
import { Tag } from '../../../../src/components/provider/Tag';
import {
  useProviderStore,
  type Slot as StoreSlot,
  type SlotState,
  type RepeatType
} from '../../../../src/state/provider-store';

const VIEW_MODES = [
  { label: '月', value: 'month' },
  { label: '週', value: 'week' },
  { label: '日', value: 'day' }
] as const;

type ViewMode = (typeof VIEW_MODES)[number]['value'];

type Slot = StoreSlot;

const cloneSlot = (slot: Slot): Slot => ({
  ...slot,
  tags: slot.tags ? [...slot.tags] : [],
  repeat: slot.repeat ? { ...slot.repeat } : undefined
});

const generateId = () => `SLOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const addDays = (iso: string, delta: number) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
};

const todayISO = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
  return formatter.format(date);
};

const formatDay = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const week = ['日', '月', '火', '水', '木', '金', '土'];
  const day = new Date(`${iso}T00:00:00`).getDay();
  return `${Number(m)}月${Number(d)}日（${week[day]}）`;
};

const formatMonthLabel = (iso: string) => {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long'
  });
  return formatter.format(new Date(`${iso}T00:00:00`));
};

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const buildMonthMatrix = (iso: string) => {
  const reference = new Date(`${iso}T00:00:00`);
  const year = reference.getFullYear();
  const month = reference.getMonth();

  const firstOfMonth = new Date(reference);
  firstOfMonth.setDate(1);
  const startOffset = firstOfMonth.getDay();

  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - startOffset);

  const matrix: string[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const row: string[] = [];
    for (let day = 0; day < 7; day += 1) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + week * 7 + day);
      row.push(current.toISOString().slice(0, 10));
    }
    matrix.push(row);
  }

  return { matrix, year, month };
};

const stateColor: Record<SlotState, string> = {
  公開中: '#16A34A',
  下書き: '#9CA3AF',
  満席: '#DB2777',
  クローズ: '#B45309'
};

const stateLabel: Record<SlotState, string> = {
  公開中: '公開中',
  下書き: '下書き',
  満席: '満席',
  クローズ: 'クローズ'
};

const deadlineOptions = [1, 3, 6, 12, 24];

const normalizeSlotState = (slot: Slot): Slot => {
  if (slot.remaining <= 0 && slot.state === '公開中') {
    return { ...slot, state: '満席' };
  }
  if (slot.remaining > 0 && slot.state === '満席') {
    return { ...slot, state: '公開中' };
  }
  return slot;
};

export default function ProviderSlots() {
  const slots = useProviderStore((state) => state.slots);
  const isOnline = useProviderStore((state) => state.isOnline);
  const offlineQueue = useProviderStore((state) => state.offlineQueue);
  const setOnline = useProviderStore((state) => state.setOnline);
  const processQueue = useProviderStore((state) => state.processQueue);
  const fetchData = useProviderStore((state) => state.fetchData);
  const addSlot = useProviderStore((state) => state.addSlot);
  const updateSlot = useProviderStore((state) => state.updateSlot);
  const toggleSlotPublish = useProviderStore((state) => state.toggleSlotPublish);
  const closeSlotAction = useProviderStore((state) => state.closeSlot);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [focusDate, setFocusDate] = useState(todayISO());
  const [detailSlotId, setDetailSlotId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotDraft, setSlotDraft] = useState<Slot>({
    id: generateId(),
    experience: '',
    date: focusDate,
    start: '10:00',
    end: '11:00',
    venue: '',
    capacity: 8,
    remaining: 8,
    ageRange: '',
    mentor: '',
    state: '下書き',
    price: undefined,
    category: undefined,
    tags: [],
    note: undefined,
    deadlineHours: 6,
    repeat: { type: 'none' },
    createdBy: 'demo-user',
    updatedAt: new Date().toISOString()
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    slots.forEach((slot) => {
      const list = map.get(slot.date) ?? [];
      list.push(slot);
      list.sort((a, b) => (a.start > b.start ? 1 : -1));
      map.set(slot.date, list);
    });
    return map;
  }, [slots]);

  const daysToRender = useMemo(() => {
    if (viewMode === 'day') return [focusDate];
    if (viewMode === 'week') {
      // 前後8週間を含めて合計17週間（119日）表示 - 無限スクロール風
      const startDate = addDays(focusDate, -56);
      return Array.from({ length: 119 }, (_, idx) => addDays(startDate, idx));
    }
    return [];
  }, [viewMode, focusDate]);

  const monthView = useMemo(() => {
    if (viewMode !== 'month') return null;
    return buildMonthMatrix(focusDate);
  }, [viewMode, focusDate]);

  const activeSlots = useMemo(() => slotsByDate.get(focusDate) ?? [], [slotsByDate, focusDate]);
  const detailSlot = useMemo(() => slots.find((slot) => slot.id === detailSlotId) ?? null, [slots, detailSlotId]);

  const resetDraft = (base?: Slot) => {
    const source: Slot = base
      ? cloneSlot(base)
      : {
          id: generateId(),
          experience: '',
          date: focusDate,
          start: '10:00',
          end: '11:00',
          venue: '',
          capacity: 8,
          remaining: 8,
          ageRange: '',
          mentor: '',
          state: '下書き',
          price: undefined,
          category: undefined,
          tags: [],
          note: undefined,
          deadlineHours: 6,
          repeat: { type: 'none' },
          createdBy: 'demo-user',
          updatedAt: new Date().toISOString()
        };
    setSlotDraft(source);
    setFormErrors({});
  };

  const openCreateModal = (base?: Slot) => {
    setEditingSlotId(null);
    resetDraft(base);
    setShowAdvanced(false);
    setModalVisible(true);
  };

  const openEditModal = (slot: Slot) => {
    setEditingSlotId(slot.id);
    resetDraft(slot);
    setShowAdvanced(false);
    setModalVisible(true);
  };

  const validateDraft = () => {
    const errors: Record<string, string> = {};
    if (!slotDraft.experience.trim()) errors.experience = '体験名を入力してください';
    if (!slotDraft.date) errors.date = '日付を入力してください';
    if (!slotDraft.start || !slotDraft.end) errors.time = '開始・終了時刻を入力してください';
    if (!slotDraft.venue.trim()) errors.venue = '会場を入力してください';
    if (!slotDraft.ageRange.trim()) errors.ageRange = '対象年齢を入力してください';
    if (!slotDraft.capacity || slotDraft.capacity < 1) errors.capacity = '定員は1以上を入力してください';
    if (!slotDraft.state) errors.state = '公開状態を選択してください';
    if (slotDraft.start && slotDraft.end && slotDraft.start >= slotDraft.end) errors.time = '終了時刻は開始より後にしてください';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasConflict = (candidate: Slot, ignoreId?: string) => {
    return slots.some((slot) => {
      if (ignoreId && slot.id === ignoreId) return false;
      if (slot.date !== candidate.date) return false;
      const overlap = !(candidate.end <= slot.start || candidate.start >= slot.end);
      const sameMentor = slot.mentor === candidate.mentor;
      const sameVenue = slot.venue === candidate.venue;
      return overlap && (sameMentor || sameVenue);
    });
  };

  const saveSlot = () => {
    if (!validateDraft()) return;
    if (hasConflict(slotDraft, editingSlotId ?? undefined)) {
      Alert.alert('競合を解消してください', '同じ時間帯に担当者または会場が重複しています。');
      return;
    }
    const normalized = normalizeSlotState(slotDraft);
    const updated = { ...normalized, updatedAt: new Date().toISOString() };
    if (editingSlotId) {
      updateSlot(updated);
      Alert.alert('保存しました', '体験枠を更新しました。');
    } else {
      addSlot(updated);
      Alert.alert('保存しました', '体験枠を追加しました。');
    }
    setModalVisible(false);
    setDetailSlotId(updated.id);
  };

  const togglePublish = (slot: Slot) => {
    toggleSlotPublish(slot.id);
  };

  const handleCloseSlot = (slot: Slot) => {
    closeSlotAction(slot.id);
  };

  const duplicateSlot = (slot: Slot) => {
    const base = cloneSlot(slot);
    const duplicate: Slot = {
      ...base,
      id: generateId(),
      remaining: base.capacity,
      state: '下書き',
      updatedAt: new Date().toISOString(),
      createdBy: 'demo-user'
    };
    openCreateModal(duplicate);
  };

  const shiftFocus = (direction: number) => {
    setFocusDate((prev) => {
      if (viewMode === 'month') {
        const current = new Date(`${prev}T00:00:00`);
        const currentDay = current.getDate();
        current.setDate(1);
        current.setMonth(current.getMonth() + direction);
        const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
        current.setDate(Math.min(currentDay, lastDay));
        return current.toISOString().slice(0, 10);
      }
      const delta = viewMode === 'week' ? direction * 7 : direction;
      return addDays(prev, delta);
    });
  };

  const renderSlotBadge = (slot: Slot) => (
    <TouchableOpacity
      key={slot.id}
      onPress={() => setDetailSlotId(slot.id)}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 8,
        backgroundColor: '#FFFFFF',
        marginTop: 8
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '700' }}>{slot.start} - {slot.end}</Text>
        <Text style={{ fontSize: 12, color: stateColor[slot.state] }}>{slot.state}</Text>
      </View>
      <Text style={{ fontSize: 14 }}>{slot.experience}</Text>
      <Text style={{ fontSize: 12, color: colors.muted }}>残席 {slot.remaining} / {slot.capacity}</Text>
    </TouchableOpacity>
  );

  const lastMinuteFlag = (slot: Slot) => {
    const now = new Date();
    const slotDate = new Date(`${slot.date}T${slot.start}:00`);
    const diff = slotDate.getTime() - now.getTime();
    return diff <= 24 * 60 * 60 * 1000;
  };

  const renderCalendar = () => {
    if (viewMode === 'day') {
      const timeSlots = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 - 23:00

      return (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F8F9FA' }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{formatDay(focusDate)}</Text>
          </View>

          <ScrollView style={{ maxHeight: 700 }}>
            {timeSlots.map((hour) => {
              const slotsInHour = activeSlots.filter((slot) => {
                const startHour = parseInt(slot.start.split(':')[0]);
                return startHour === hour;
              });

              return (
                <View key={hour} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', minHeight: 60 }}>
                  <View style={{ width: 80, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#F8F9FA', borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
                    <Text style={{ fontSize: 13, color: colors.muted }}>{`${hour}:00`}</Text>
                  </View>
                  <View style={{ flex: 1, padding: 8 }}>
                    {slotsInHour.map((slot) => {
                      const booked = Math.max(0, slot.capacity - slot.remaining);
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          onPress={() => setDetailSlotId(slot.id)}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: stateColor[slot.state],
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 8
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{slot.experience}</Text>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.9 }}>{stateLabel[slot.state]}</Text>
                          </View>
                          <Text style={{ fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginTop: 4 }}>
                            {slot.start} - {slot.end}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.9 }}>会場: {slot.venue}</Text>
                            <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.9 }}>予約{booked}/枠{slot.capacity}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    if (viewMode === 'month' && monthView) {
      const { matrix, month } = monthView;
      const selectedMonth = month;
      const today = todayISO();

      return (
        <View style={{ gap: 0, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
          {/* 曜日ヘッダー */}
          <View style={{ flexDirection: 'row', backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            {WEEKDAY_LABELS.map((label, idx) => (
              <View key={label} style={{ flex: 1, paddingVertical: 8, borderRightWidth: idx < 6 ? 1 : 0, borderRightColor: '#E5E7EB' }}>
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '600', color: idx === 0 ? '#EF4444' : idx === 6 ? '#3B82F6' : colors.muted }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* カレンダーグリッド */}
          {matrix.map((week, rowIndex) => (
            <View key={`week-${rowIndex}`} style={{ flexDirection: 'row', borderBottomWidth: rowIndex < matrix.length - 1 ? 1 : 0, borderBottomColor: '#E5E7EB' }}>
              {week.map((day, colIndex) => {
                const date = new Date(`${day}T00:00:00`);
                const isCurrentMonth = date.getMonth() === selectedMonth;
                const isSelected = day === focusDate;
                const isToday = day === today;
                const daySlots = slotsByDate.get(day) ?? [];

                return (
                  <TouchableOpacity
                    key={day}
                    style={{ flex: 1, borderRightWidth: colIndex < 6 ? 1 : 0, borderRightColor: '#E5E7EB' }}
                    onPress={() => setFocusDate(day)}
                    activeOpacity={0.7}
                  >
                    <View style={{ minHeight: 100, padding: 4 }}>
                      {/* 日付 */}
                      <View style={{ alignItems: 'center', marginBottom: 4 }}>
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: isToday ? '#1A73E8' : isSelected ? '#E8F0FE' : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: isToday || isSelected ? '700' : '400',
                              color: isToday ? '#FFFFFF' : !isCurrentMonth ? '#D1D5DB' : colIndex === 0 ? '#EF4444' : colIndex === 6 ? '#3B82F6' : colors.fg
                            }}
                          >
                            {date.getDate()}
                          </Text>
                        </View>
                      </View>

                      {/* イベント */}
                      <View style={{ gap: 2 }}>
                        {daySlots.slice(0, 3).map((slot) => {
                          const booked = Math.max(0, slot.capacity - slot.remaining);
                          return (
                            <TouchableOpacity
                              key={slot.id}
                              onPress={() => setDetailSlotId(slot.id)}
                              activeOpacity={0.8}
                              style={{
                                backgroundColor: stateColor[slot.state],
                                paddingHorizontal: 4,
                                paddingVertical: 2,
                                borderRadius: 4
                              }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
                                {slot.start} {slot.experience}
                              </Text>
                              <Text style={{ fontSize: 9, color: '#FFFFFF', opacity: 0.9 }}>
                                予{booked}/枠{slot.capacity}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                        {daySlots.length > 3 && (
                          <Text style={{ fontSize: 9, color: colors.muted, paddingLeft: 4 }}>+{daySlots.length - 3}件</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    // 週表示
    if (viewMode === 'week') {
      const today = todayISO();
      const timeSlots = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 - 23:00

      // 119日を7日ごとに17週に分割
      const totalWeeks = Math.ceil(daysToRender.length / 7);
      const weeks: string[][] = [];
      for (let i = 0; i < totalWeeks; i++) {
        weeks.push(daysToRender.slice(i * 7, (i + 1) * 7));
      }

      // 各日の固定幅（画面幅の1/7を想定、最小50px）
      const dayWidth = 50;

      return (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row' }}>
            {/* 固定の時間軸 */}
            <View>
              {/* ヘッダー部分（空白） */}
              <View style={{ width: 50, height: 60, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />

              {/* タイムグリッド */}
              <ScrollView style={{ maxHeight: 600 }} scrollEnabled={false}>
                {timeSlots.map((hour) => (
                  <View key={hour} style={{ width: 50, paddingVertical: 8, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', minHeight: 60 }}>
                    <Text style={{ textAlign: 'center', fontSize: 10, color: colors.muted }}>{`${hour}:00`}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 横スクロール可能な週表示 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {weeks.map((weekDays, weekIndex) => (
                <View key={`week-${weekIndex}`} style={{ flexDirection: 'column', width: dayWidth * 7 }}>
                  {/* ヘッダー */}
                  <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 60 }}>
                    {weekDays.map((day) => {
                      const date = new Date(`${day}T00:00:00`);
                      const dayOfWeek = date.getDay();
                      const isToday = day === today;
                      const isSelected = day === focusDate;
                      return (
                        <TouchableOpacity
                          key={day}
                          style={{ width: dayWidth, paddingVertical: 8, backgroundColor: '#F8F9FA', borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}
                          onPress={() => setFocusDate(day)}
                        >
                          <Text style={{ textAlign: 'center', fontSize: 9, color: dayOfWeek === 0 ? '#EF4444' : dayOfWeek === 6 ? '#3B82F6' : colors.muted }}>
                            {WEEKDAY_LABELS[dayOfWeek]}
                          </Text>
                          <View style={{ alignItems: 'center', marginTop: 2 }}>
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: isToday ? '#1A73E8' : isSelected ? '#E8F0FE' : 'transparent',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <Text style={{ fontSize: 12, fontWeight: isToday || isSelected ? '700' : '400', color: isToday ? '#FFFFFF' : colors.fg }}>
                                {date.getDate()}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* タイムグリッド */}
                  <ScrollView style={{ maxHeight: 600 }} scrollEnabled={false}>
                    {timeSlots.map((hour) => (
                      <View key={hour} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                        {weekDays.map((day) => {
                          const daySlots = slotsByDate.get(day) ?? [];
                          const slotsInHour = daySlots.filter((slot) => {
                            const startHour = parseInt(slot.start.split(':')[0]);
                            return startHour === hour;
                          });

                          return (
                            <View key={day} style={{ width: dayWidth, minHeight: 60, padding: 2, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}>
                              {slotsInHour.map((slot) => {
                                const booked = Math.max(0, slot.capacity - slot.remaining);
                                return (
                                  <TouchableOpacity
                                    key={slot.id}
                                    onPress={() => setDetailSlotId(slot.id)}
                                    activeOpacity={0.8}
                                    style={{
                                      backgroundColor: stateColor[slot.state],
                                      paddingHorizontal: 3,
                                      paddingVertical: 3,
                                      borderRadius: 4,
                                      marginBottom: 2
                                    }}
                                  >
                                    <Text style={{ fontSize: 9, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
                                      {slot.experience}
                                    </Text>
                                    <Text style={{ fontSize: 8, color: '#FFFFFF', opacity: 0.9 }} numberOfLines={1}>
                                      {slot.start}-{slot.end}
                                    </Text>
                                    <Text style={{ fontSize: 8, color: '#FFFFFF', opacity: 0.9 }}>
                                      予{booked}/枠{slot.capacity}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      );
    }

    // 日表示（デフォルト）
    return null;
  };

  const conflictPreview = editingSlotId ? hasConflict(slotDraft, editingSlotId) : hasConflict(slotDraft);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800' }}>体験枠の管理</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Tag label={isOnline ? 'オンライン' : 'オフライン'} active={!isOnline} onPress={() => setOnline(!isOnline)} />
          {offlineQueue.length > 0 ? (
            <UIButton variant="ghost" onPress={processQueue} style={{ minWidth: 100 }}>
              再試行
            </UIButton>
          ) : null}
        </View>
      </View>
      <UIButton variant="secondary" onPress={() => openCreateModal()} style={{ alignSelf: 'flex-end', minWidth: 120 }}>
        ＋新規
      </UIButton>

      {offlineQueue.length > 0 ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#1D4ED8', fontWeight: '700' }}>オフラインで保存された更新があります。ネットワークが復帰すると自動で同期します。</Text>
        </View>
      ) : null}

      <SegmentedControl
        segments={VIEW_MODES.map((item) => ({ label: item.label, value: item.value }))}
        value={viewMode}
        onChange={(value) => setViewMode(value as ViewMode)}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <UIButton variant="ghost" onPress={() => shiftFocus(-1)} style={{ minWidth: 100 }}>
          ← 前へ
        </UIButton>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>{viewMode === 'month' ? formatMonthLabel(focusDate) : formatDay(focusDate)}</Text>
        <UIButton variant="ghost" onPress={() => shiftFocus(1)} style={{ minWidth: 100 }}>
          次へ →
        </UIButton>
      </View>

      {renderCalendar()}

      {detailSlot ? (
        <UICard style={{ borderRadius: 20, padding: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{detailSlot.experience}</Text>
            <TouchableOpacity onPress={() => setDetailSlotId(null)}>
              <Text style={{ color: colors.muted }}>閉じる</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 15 }}>{formatDay(detailSlot.date)}</Text>
          <Text style={{ fontSize: 15 }}>{detailSlot.start} - {detailSlot.end}</Text>
          <Text style={{ fontSize: 15 }}>会場：{detailSlot.venue}</Text>
          <Text style={{ fontSize: 15 }}>担当：{detailSlot.mentor}</Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>残席 {detailSlot.remaining} / {detailSlot.capacity}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Tag label={detailSlot.state} active={detailSlot.state === '公開中'} />
            <Tag label={`対象 ${detailSlot.ageRange}`} />
            <Tag label={`締切 ${detailSlot.deadlineHours}h`} />
            {lastMinuteFlag(detailSlot) ? <Tag label="直前枠" active /> : null}
            {(detailSlot.tags ?? []).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
          {detailSlot.price ? <Text style={{ fontSize: 14 }}>価格：{detailSlot.price}</Text> : null}
          {detailSlot.category ? <Text style={{ fontSize: 14 }}>カテゴリ：{detailSlot.category}</Text> : null}
          {detailSlot.note ? <Text style={{ fontSize: 14, color: colors.muted }}>備考：{detailSlot.note}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            <UIButton variant="ghost" onPress={() => togglePublish(detailSlot)} style={{ flexGrow: 1, minWidth: 120 }}>
              {detailSlot.state === '公開中' ? '下書きに戻す' : '公開'}
            </UIButton>
            <UIButton variant="ghost" onPress={() => openEditModal(detailSlot)} style={{ flexGrow: 1, minWidth: 120 }}>
              編集
            </UIButton>
            <UIButton variant="ghost" onPress={() => duplicateSlot(detailSlot)} style={{ flexGrow: 1, minWidth: 120 }}>
              複製
            </UIButton>
            <UIButton variant="ghost" onPress={() => handleCloseSlot(detailSlot)} style={{ flexGrow: 1, minWidth: 120 }}>
              クローズ
            </UIButton>
          </View>
        </UICard>
      ) : null}

      <Modal visible={modalVisible} animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={() => setModalVisible(false)} presentationStyle="pageSheet">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '800' }}>{editingSlotId ? '体験枠を編集' : '体験枠を追加'}</Text>

          {/* 主要項目 */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700' }}>体験名 *</Text>
              <TextInput
                value={slotDraft.experience}
                onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, experience: text }))}
                placeholder="例）STEAM クリエイティブ"
                style={{ borderWidth: 1, borderColor: formErrors.experience ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
              />
              {formErrors.experience ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.experience}</Text> : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>日付 *</Text>
                <TextInput
                  value={slotDraft.date}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  style={{ borderWidth: 1, borderColor: formErrors.date ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
                />
                {formErrors.date ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.date}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>開始 *</Text>
                <TextInput
                  value={slotDraft.start}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, start: text }))}
                  placeholder="10:00"
                  style={{ borderWidth: 1, borderColor: formErrors.time ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>終了 *</Text>
                <TextInput
                  value={slotDraft.end}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, end: text }))}
                  placeholder="11:30"
                  style={{ borderWidth: 1, borderColor: formErrors.time ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
                />
                {formErrors.time ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.time}</Text> : null}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: '700' }}>会場 *</Text>
              <TextInput
                value={slotDraft.venue}
                onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, venue: text }))}
                placeholder="例）目黒スタジオA"
                style={{ borderWidth: 1, borderColor: formErrors.venue ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
              />
              {formErrors.venue ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.venue}</Text> : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>定員 *</Text>
                <TextInput
                  value={String(slotDraft.capacity)}
                  keyboardType="number-pad"
                  onChangeText={(text) => {
                    const capacity = Number(text) || 0;
                    setSlotDraft((prev) => ({ ...prev, capacity, remaining: Math.max(0, capacity - (prev.capacity - prev.remaining)) }));
                  }}
                  style={{ borderWidth: 1, borderColor: formErrors.capacity ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
                />
                {formErrors.capacity ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.capacity}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>対象年齢 *</Text>
                <TextInput
                  value={slotDraft.ageRange}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, ageRange: text }))}
                  placeholder="例）8-11歳"
                  style={{ borderWidth: 1, borderColor: formErrors.ageRange ? '#DC2626' : colors.border, borderRadius: 12, padding: 12 }}
                />
                {formErrors.ageRange ? <Text style={{ color: '#DC2626', marginTop: 4 }}>{formErrors.ageRange}</Text> : null}
              </View>
            </View>
          </View>

          {/* 詳細設定トグル */}
          <TouchableOpacity
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: '#F9FAFB'
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600' }}>詳細設定</Text>
            <Text style={{ fontSize: 18 }}>{showAdvanced ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* 詳細項目 */}
          {showAdvanced ? (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>担当メンター</Text>
                <TextInput
                  value={slotDraft.mentor}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, mentor: text }))}
                  placeholder="例）佐藤ひかり"
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>公開設定</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {(['公開中', '下書き', '満席', 'クローズ'] as SlotState[]).map((state) => (
                    <Tag key={state} label={state} active={slotDraft.state === state} onPress={() => setSlotDraft((prev) => ({ ...prev, state }))} />
                  ))}
                </ScrollView>
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>価格</Text>
                <TextInput
                  value={slotDraft.price ?? ''}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, price: text || undefined }))}
                  placeholder="例）無料 / ¥5,500"
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700' }}>カテゴリ</Text>
                  <TextInput
                    value={slotDraft.category ?? ''}
                    onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, category: text || undefined }))}
                    placeholder="例）プログラミング"
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700' }}>タグ</Text>
                  <TextInput
                    value={(slotDraft.tags ?? []).join(',')}
                    onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, tags: text ? text.split(',').map((t) => t.trim()).filter(Boolean) : [] }))}
                    placeholder="例）体験,未就学"
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>備考</Text>
                <TextInput
                  value={slotDraft.note ?? ''}
                  onChangeText={(text) => setSlotDraft((prev) => ({ ...prev, note: text || undefined }))}
                  placeholder="持ち物、注意事項など"
                  multiline
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>募集締切</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {deadlineOptions.map((option) => (
                    <Tag key={option} label={`${option}時間前`} active={slotDraft.deadlineHours === option} onPress={() => setSlotDraft((prev) => ({ ...prev, deadlineHours: option }))} />
                  ))}
                </ScrollView>
              </View>

              <View>
                <Text style={{ fontSize: 14, fontWeight: '700' }}>繰り返し</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {[
                    { label: 'なし', value: 'none' },
                    { label: '毎週', value: 'weekly' },
                    { label: '隔週', value: 'biweekly' },
                    { label: '毎月', value: 'monthly' }
                  ].map((option) => (
                    <Tag
                      key={option.value}
                      label={option.label}
                      active={(slotDraft.repeat?.type ?? 'none') === option.value}
                      onPress={() =>
                        setSlotDraft((prev) => ({
                          ...prev,
                          repeat: {
                            ...(prev.repeat ?? { type: 'none' as RepeatType }),
                            type: option.value as RepeatType
                          }
                        }))
                      }
                    />
                  ))}
                </ScrollView>
                {(slotDraft.repeat?.type ?? 'none') !== 'none' ? (
                  <TextInput
                    value={slotDraft.repeat?.until ?? ''}
                    onChangeText={(text) =>
                      setSlotDraft((prev) => ({
                        ...prev,
                        repeat: {
                          ...(prev.repeat ?? { type: 'none' as RepeatType }),
                          until: text || undefined
                        }
                      }))
                    }
                    placeholder="終了日（任意） YYYY-MM-DD"
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginTop: 8 }}
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {conflictPreview ? (
            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', padding: 12 }}>
              <Text style={{ color: '#B91C1C', fontWeight: '700' }}>担当者または会場が他の枠と重複しています。時間を調整してください。</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <UIButton variant="ghost" onPress={() => setModalVisible(false)} style={{ flex: 1 }}>
              キャンセル
            </UIButton>
            <UIButton variant="secondary" onPress={saveSlot} style={{ flex: 1 }}>
              {editingSlotId ? '更新' : '保存'}
            </UIButton>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
