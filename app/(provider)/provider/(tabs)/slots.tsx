import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  User,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';

import { UIButton } from '../../../../src/components/ui/Button';
import { SegmentedControl } from '../../../../src/components/provider/SegmentedControl';
import { colors } from '../../../../src/lib/colors';
import {
  useProviderStore,
  type Slot as StoreSlot,
  type SlotState
} from '../../../../src/state/provider-store';

const VIEW_MODES = [
  { label: '月', value: 'month' },
  { label: '週', value: 'week' },
  { label: '日', value: 'day' }
] as const;

type ViewMode = (typeof VIEW_MODES)[number]['value'];

type Slot = StoreSlot;

type SlotDraft = Pick<
  Slot,
  | 'id'
  | 'experience'
  | 'date'
  | 'start'
  | 'end'
  | 'venue'
  | 'capacity'
  | 'remaining'
  | 'mentor'
  | 'ageRange'
  | 'state'
  | 'price'
  | 'category'
  | 'tags'
  | 'note'
  | 'deadlineHours'
  | 'repeat'
>;

const stateColors: Record<SlotState, string> = {
  公開中: '#22C55E',
  下書き: '#9CA3AF',
  満席: '#F97316',
  クローズ: '#EF4444'
};

const stateLabels: Record<SlotState, string> = {
  公開中: '公開中',
  下書き: '下書き',
  満席: '満席',
  クローズ: 'クローズ'
};

type EventLayout = {
  slot: Slot;
  top: number;
  height: number;
  column: number;
  columns: number;
};

const HOUR_HEIGHT = 64;
const START_HOUR = 6;
const END_HOUR = 22;

const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, idx) => START_HOUR + idx);
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const windowWidth = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;

if (Platform.OS === 'android' && LayoutAnimation?.configureNext) {
  const UIManager = require('react-native').UIManager;
  if (UIManager?.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseISODate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const todayISO = () => {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

const addDays = (iso: string, delta: number) => {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + delta);
  return formatDate(date);
};

const startOfWeek = (iso: string) => {
  const date = parseISODate(iso);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return formatDate(date);
};

const formatMonthTitle = (iso: string) => {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long'
  });
  return formatter.format(new Date(`${iso}T00:00:00`));
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const buildMonthMatrix = (iso: string) => {
  const reference = parseISODate(iso);
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - offset);

  const matrix: string[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const row: string[] = [];
    for (let day = 0; day < 7; day += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + week * 7 + day);
      row.push(formatDate(current));
    }
    matrix.push(row);
  }
  return matrix;
};

const defaultDraft = (date: string): SlotDraft => ({
  id: `SLOT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  experience: '',
  date,
  start: '10:00',
  end: '11:00',
  venue: '',
  capacity: 8,
  remaining: 8,
  mentor: '',
  ageRange: '8-12歳',
  state: '下書き',
  price: '',
  category: '',
  tags: [],
  note: '',
  deadlineHours: 6,
  repeat: { type: 'none' }
});

export default function ProviderSlots() {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 12);
  const slots = useProviderStore((state) => state.slots);
  const offlineQueue = useProviderStore((state) => state.offlineQueue);
  const processQueue = useProviderStore((state) => state.processQueue);
  const fetchData = useProviderStore((state) => state.fetchData);
  const addSlot = useProviderStore((state) => state.addSlot);
  const updateSlot = useProviderStore((state) => state.updateSlot);
  const toggleSlotPublish = useProviderStore((state) => state.toggleSlotPublish);
  const closeSlot = useProviderStore((state) => state.closeSlot);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [focusDate, setFocusDate] = useState(todayISO());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<SlotDraft>(defaultDraft(todayISO()));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFocused = useIsFocused();
  const translateX = useRef(new Animated.Value(0)).current;
  const isAnimatingRef = useRef(false);
  const calendarRef = useRef<View | null>(null);
  const [calendarBounds, setCalendarBounds] = useState<{ top: number; bottom: number }>({ top: 0, bottom: Number.MAX_SAFE_INTEGER });

  const updateCalendarBounds = useCallback(() => {
    calendarRef.current?.measureInWindow?.((_, y, __, height) => {
      setCalendarBounds({ top: y, bottom: y + height });
    });
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    const timer = setTimeout(updateCalendarBounds, 0);
    return () => clearTimeout(timer);
  }, [updateCalendarBounds, viewMode, focusDate, slots.length, isFocused]);

  const animateSwipe = (direction: -1 | 1) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    Animated.timing(translateX, {
      toValue: direction * -windowWidth,
      duration: 160,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      handleShiftFocus(direction);
      translateX.setValue(direction * windowWidth);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 160,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }).start(() => {
        isAnimatingRef.current = false;
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const y0 = gestureState.y0 ?? evt.nativeEvent.pageY;
        const withinCalendar = y0 >= calendarBounds.top && y0 <= calendarBounds.bottom;
        if (!withinCalendar) return false;
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > SWIPE_THRESHOLD;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_evt, gestureState) => {
        if (isAnimatingRef.current) return;
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (isAnimatingRef.current) return;
        if (gestureState.dx > SWIPE_THRESHOLD) {
          animateSwipe(-1);
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          animateSwipe(1);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            stiffness: 200,
            damping: 20,
            mass: 0.6,
            useNativeDriver: true
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          stiffness: 200,
          damping: 20,
          mass: 0.6,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

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

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selectedSlotId) ?? null, [slots, selectedSlotId]);

  const weekDates = useMemo(() => {
    if (viewMode !== 'week') return [];
    const start = startOfWeek(focusDate);
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
  }, [viewMode, focusDate]);

  const dayDates = viewMode === 'day' ? [focusDate] : [];

  const handleShiftFocus = (direction: -1 | 1) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (viewMode === 'month') {
      const date = new Date(`${focusDate}T00:00:00`);
      date.setDate(1);
      date.setMonth(date.getMonth() + direction);
      setFocusDate(formatDate(date));
    } else if (viewMode === 'week') {
      setFocusDate(addDays(focusDate, direction * 7));
    } else {
      setFocusDate(addDays(focusDate, direction));
    }
  };

  const openEditor = (slot?: Slot, suggestedDate?: string, suggestedStart?: string) => {
    if (slot) {
      setDraft({
        id: slot.id,
        experience: slot.experience,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        venue: slot.venue,
        capacity: slot.capacity,
        remaining: slot.remaining,
        mentor: slot.mentor,
        ageRange: slot.ageRange,
        state: slot.state,
        price: slot.price ?? '',
        category: slot.category ?? '',
        tags: slot.tags ?? [],
        note: slot.note ?? '',
        deadlineHours: slot.deadlineHours,
        repeat: slot.repeat ?? { type: 'none' }
      });
    } else {
      setDraft({
        ...defaultDraft(suggestedDate ?? focusDate),
        start: suggestedStart ?? '10:00'
      });
    }
    setErrors({});
    setEditorVisible(true);
  };

  const validateDraft = () => {
    const next: Record<string, string> = {};
    if (!draft.experience.trim()) next.experience = '体験名を入力してください';
    if (!draft.date) next.date = '日付を入力してください';
    if (!draft.start || !draft.end) next.time = '時刻を入力してください';
    if (draft.start >= draft.end) next.time = '終了時刻は開始より後にしてください';
    if (!draft.venue.trim()) next.venue = '会場を入力してください';
    if (!draft.mentor.trim()) next.mentor = '担当を入力してください';
    if (!draft.capacity || draft.capacity < 1) next.capacity = '定員は1以上で入力してください';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveDraft = () => {
    if (!validateDraft()) return;
    const payload: Slot = {
      id: draft.id,
      experience: draft.experience,
      date: draft.date,
      start: draft.start,
      end: draft.end,
      venue: draft.venue,
      capacity: draft.capacity,
      remaining: Math.min(draft.remaining, draft.capacity),
      mentor: draft.mentor,
      ageRange: draft.ageRange,
      state: draft.state,
      price: draft.price || undefined,
      category: draft.category || undefined,
      tags: draft.tags,
      note: draft.note || undefined,
      deadlineHours: draft.deadlineHours,
      repeat: draft.repeat,
      createdBy: 'provider-demo',
      updatedAt: new Date().toISOString()
    };

    const exists = slots.some((slot) => slot.id === draft.id);
    if (exists) {
      updateSlot(payload);
    } else {
      addSlot(payload);
    }
    setEditorVisible(false);
  };

  const handleDuplicate = (slot: Slot) => {
    setDraft({
      ...defaultDraft(slot.date),
      experience: slot.experience,
      start: slot.start,
      end: slot.end,
      venue: slot.venue,
      capacity: slot.capacity,
      remaining: slot.capacity,
      mentor: slot.mentor,
      ageRange: slot.ageRange,
      price: slot.price ?? '',
      category: slot.category ?? '',
      tags: slot.tags ?? [],
      note: slot.note ?? '',
      deadlineHours: slot.deadlineHours,
      repeat: slot.repeat ?? { type: 'none' }
    });
    setErrors({});
    setEditorVisible(true);
  };

  const handleTogglePublish = (slot: Slot) => {
    toggleSlotPublish(slot.id);
  };

  const handleCloseSlot = (slot: Slot) => {
    closeSlot(slot.id);
  };

  const renderCalendar = () => {
    if (viewMode === 'month') {
      return (
        <MonthCalendar
          matrix={buildMonthMatrix(focusDate)}
          focusDate={focusDate}
          today={todayISO()}
          eventsByDate={slotsByDate}
          onSelectDate={(date) => setFocusDate(date)}
          onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
          onLongPressDate={(date) => openEditor(undefined, date)}
        />
      );
    }

    const dates = viewMode === 'week' ? weekDates : dayDates;
    return (
      <TimelineCalendar
        dates={dates}
        eventsByDate={slotsByDate}
        focusDate={focusDate}
        onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
        onCreateSlot={(date, start) => openEditor(undefined, date, start)}
      />
    );
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 120 : 100) }
          ]}
          bounces={false}
          scrollEnabled={viewMode !== 'month'}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.monthButton} onPress={() => setViewMode('month')}>
              <CalendarIcon size={18} color={colors.fg} />
              <Text style={styles.monthTitle}>{formatMonthTitle(focusDate)}</Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIcon} onPress={() => animateSwipe(-1)}>
                <ChevronLeft size={20} color={colors.fg} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setFocusDate(todayISO());
                }}
              >
                <Text style={styles.headerIconText}>今日</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon} onPress={() => animateSwipe(1)}>
                <ChevronRight size={20} color={colors.fg} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.segmentContainer}>
            <SegmentedControl
              segments={VIEW_MODES.map((mode) => ({ label: mode.label, value: mode.value }))}
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
          </View>

          {offlineQueue.length > 0 ? (
            <View style={styles.syncBanner}>
              <RefreshCw size={16} color={colors.fg} />
              <Text style={styles.syncBannerText}>オフラインで保存された更新があります</Text>
              <TouchableOpacity onPress={processQueue}>
                <Text style={styles.syncBannerAction}>再試行</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Animated.View
            pointerEvents='box-none'
            style={[styles.swipeContainer, { transform: [{ translateX }] }]}
            {...(isFocused ? panResponder.panHandlers : {})}
          >
            <View
              style={styles.calendarWrapper}
              ref={(node) => {
                calendarRef.current = node;
              }}
              onLayout={updateCalendarBounds}
            >
              {renderCalendar()}
            </View>
          </Animated.View>
        </ScrollView>

        <View
          pointerEvents='box-none'
          style={[
            styles.fabContainer,
            { bottom: safeBottom + (Platform.OS === 'ios' ? 48 : 56) }
          ]}
        >
          <TouchableOpacity style={styles.fab} onPress={() => openEditor()} activeOpacity={0.85}>
            <Plus size={28} color='#FFFFFF' />
          </TouchableOpacity>
        </View>

        {offlineQueue.length > 0 ? (
          <View
            pointerEvents='box-none'
            style={[
              styles.syncContainer,
              { bottom: safeBottom + (Platform.OS === 'ios' ? 104 : 96) }
            ]}
          >
            <TouchableOpacity style={styles.syncButton} onPress={processQueue} activeOpacity={0.85}>
              <RefreshCw size={18} color='#FFFFFF' style={{ marginRight: 6 }} />
              <Text style={styles.syncButtonText}>同期</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <SlotDetailSheet
        slot={selectedSlot}
        visible={Boolean(selectedSlot)}
        onClose={() => setSelectedSlotId(null)}
        onEdit={(slot) => openEditor(slot)}
        onDuplicate={handleDuplicate}
        onTogglePublish={handleTogglePublish}
        onCloseSlot={handleCloseSlot}
      />

      <SlotEditorModal
        visible={editorVisible}
        draft={draft}
        errors={errors}
        onChange={setDraft}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveDraft}
      />
    </>
  );
}

type MonthCalendarProps = {
  matrix: string[][];
  focusDate: string;
  today: string;
  eventsByDate: Map<string, Slot[]>;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: Slot) => void;
  onLongPressDate: (date: string) => void;
};

function MonthCalendar({ matrix, focusDate, today, eventsByDate, onSelectDate, onSelectSlot, onLongPressDate }: MonthCalendarProps) {
  const selectedMonth = new Date(`${focusDate}T00:00:00`).getMonth();

  return (
    <View style={styles.monthContainer}>
      <View style={styles.monthWeekRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.monthWeekText}>{label}</Text>
        ))}
      </View>
      {matrix.map((week, index) => (
        <View key={`week-${index}`} style={styles.monthRow}>
          {week.map((date) => {
            const dayDate = new Date(`${date}T00:00:00`);
            const isCurrentMonth = dayDate.getMonth() === selectedMonth;
            const isToday = date === today;
            const isSelected = date === focusDate;
            const dayEvents = eventsByDate.get(date) ?? [];
            const visibleEvents = isCurrentMonth ? dayEvents : [];
            const totalCapacity = visibleEvents.reduce((acc, slot) => acc + slot.capacity, 0);
            const reservedCount = visibleEvents.reduce(
              (acc, slot) => acc + Math.max(0, slot.capacity - slot.remaining),
              0
            );

            return (
              <TouchableOpacity
                key={date}
                style={[styles.monthCell, !isCurrentMonth && { opacity: 0.35 }]}
                onPress={() => onSelectDate(date)}
                onLongPress={() => onLongPressDate(date)}
                activeOpacity={0.85}
              >
                <View style={styles.monthCellHeader}>
                  <View
                    style={[
                      styles.monthDateBadge,
                      isSelected && styles.monthDateBadgeSelected,
                      isToday && !isSelected && styles.monthDateBadgeToday
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthDateText,
                        isSelected && { color: colors.accent },
                        !isSelected && isToday && { color: colors.fg }
                      ]}
                    >
                      {dayDate.getDate()}
                    </Text>
                  </View>
                </View>

                <View style={styles.monthEventList}>
                  {isCurrentMonth ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.monthEventSummary}
                      onPress={() => {
                        if (visibleEvents.length === 1) {
                          onSelectSlot(visibleEvents[0]);
                        }
                      }}
                    >
                      <Text style={styles.monthEventSummaryText}>{reservedCount}/{totalCapacity || visibleEvents.length}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.monthEventSummary, { opacity: 0.4 }]}> 
                      <Text style={styles.monthEventSummaryText}>0/0</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}


type TimelineCalendarProps = {
  dates: string[];
  eventsByDate: Map<string, Slot[]>;
  focusDate: string;
  onSelectSlot: (slot: Slot) => void;
  onCreateSlot: (date: string, start?: string) => void;
};

function TimelineCalendar({ dates, eventsByDate, focusDate, onSelectSlot, onCreateSlot }: TimelineCalendarProps) {
  const contentHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;
  const timeColumnWidth = 60;
  const horizontalPadding = 16;
  const availableWidth = windowWidth - horizontalPadding * 2 - timeColumnWidth;
  const dayColumnWidth = availableWidth / Math.max(1, dates.length);
  const gridWidth = dayColumnWidth * dates.length;
  const horizontalScrollable = gridWidth > availableWidth + 1;

  const headerScrollRef = useRef<ScrollView | null>(null);
  const bodyScrollRef = useRef<ScrollView | null>(null);
  const syncingRef = useRef(false);

  const handleHorizontalScroll = (x: number, source: 'header' | 'body') => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (source === 'header') {
      bodyScrollRef.current?.scrollTo({ x, animated: false });
    } else {
      headerScrollRef.current?.scrollTo({ x, animated: false });
    }
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  };

  return (
    <View style={[styles.timelineContainer, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.timelineHeaderRow}>
        <View style={[styles.timeColumn, styles.timelineHeaderLabel]}>
          <Text style={styles.timelineHeaderText}>時間</Text>
        </View>
        <ScrollView
          horizontal={horizontalScrollable}
          ref={headerScrollRef}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={(e) => handleHorizontalScroll(e.nativeEvent.contentOffset.x, 'header')}
        >
          <View style={{ flexDirection: 'row', width: horizontalScrollable ? gridWidth : availableWidth }}>
            {dates.map((date) => {
              const dateObj = new Date(`${date}T00:00:00`);
              const weekday = WEEKDAY_LABELS[dateObj.getDay()];
              const isSelected = date === focusDate;
              const isToday = date === todayISO();
              return (
                <View key={date} style={[styles.timelineDayHeader, { width: dayColumnWidth }]}> 
                  <Text
                    style={[
                      styles.timelineDayWeek,
                      (isToday || isSelected) && styles.timelineDayWeekToday
                    ]}
                  >
                    {weekday}
                  </Text>
                  <View
                    style={[
                      styles.timelineDayBadge,
                      isSelected && styles.timelineDayBadgeSelected,
                      isToday && styles.timelineDayBadgeToday
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineDayDate,
                        isToday && styles.timelineDayDateToday,
                        !isToday && isSelected && styles.timelineDayDateSelected
                      ]}
                    >
                      {dateObj.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={{ maxHeight: 520 }}
        contentContainerStyle={{ height: contentHeight }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.timeColumn, { height: contentHeight }]}> 
            {HOURS.map((hour) => (
              <View key={hour} style={styles.timeLabelRow}>
                <Text style={styles.timeLabelText}>{`${hour}:00`}</Text>
              </View>
            ))}
          </View>
          <ScrollView
            horizontal={horizontalScrollable}
            ref={bodyScrollRef}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onScroll={(e) => handleHorizontalScroll(e.nativeEvent.contentOffset.x, 'body')}
          >
            <View style={{ flexDirection: 'row', width: horizontalScrollable ? gridWidth : availableWidth }}>
              {dates.map((date) => (
                <TimelineDayColumn
                  key={date}
                  date={date}
                  width={dayColumnWidth}
                  events={eventsByDate.get(date) ?? []}
                  onSelectSlot={onSelectSlot}
                  onCreateSlot={onCreateSlot}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

type TimelineDayColumnProps = {
  date: string;
  width: number;
  events: Slot[];
  onSelectSlot: (slot: Slot) => void;
  onCreateSlot: (date: string, start?: string) => void;
};

function TimelineDayColumn({ date, width, events, onSelectSlot, onCreateSlot }: TimelineDayColumnProps) {
  const layouts = useMemo<EventLayout[]>(() => computeEventLayouts(events), [events]);

  const handlePressBackground = (event: GestureResponderEvent) => {
    const y = event.nativeEvent.locationY;
    const minutesFromStart = Math.max(0, y / HOUR_HEIGHT * 60);
    const hour = Math.floor(minutesFromStart / 60) + START_HOUR;
    const minute = Math.round((minutesFromStart % 60) / 15) * 15;
    const time = `${String(Math.min(23, hour)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onCreateSlot(date, time);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePressBackground}
      style={[styles.timelineDayColumn, { width }]}
    >
      {HOURS.map((hour) => (
        <View key={hour} style={styles.timelineHourRow} />
      ))}

      {layouts.map(({ slot, top, height, column, columns }) => {
        const margin = 4;
        const availableWidth = width - margin * 2;
        const colWidth = availableWidth / columns;
        return (
          <TouchableOpacity
            key={slot.id}
            activeOpacity={0.9}
            onPress={() => onSelectSlot(slot)}
            style={[
              styles.timelineEvent,
              {
                top,
                height,
                left: margin + column * colWidth,
                width: colWidth - 4,
                borderColor: `${stateColors[slot.state]}66`
              }
            ]}
          >
            <Text style={styles.timelineEventTime}>{slot.start} - {slot.end}</Text>
            <Text style={styles.timelineEventTitle} numberOfLines={2}>{slot.experience}</Text>
            <Text style={styles.timelineEventMeta}>{slot.venue}</Text>
          </TouchableOpacity>
        );
      })}
    </TouchableOpacity>
  );
}

function computeEventLayouts(events: Slot[]): EventLayout[] {
  if (events.length === 0) return [];
  const prepared = events.map((event) => ({
    slot: event,
    start: toMinutes(event.start),
    end: toMinutes(event.end),
    column: 0,
    columns: 1
  }));

  const adjacency: number[][] = prepared.map(() => []);
  for (let i = 0; i < prepared.length; i += 1) {
    for (let j = i + 1; j < prepared.length; j += 1) {
      if (isOverlap(prepared[i], prepared[j])) {
        adjacency[i].push(j);
        adjacency[j].push(i);
      }
    }
  }

  const visited = new Array(prepared.length).fill(false);

  for (let i = 0; i < prepared.length; i += 1) {
    if (visited[i]) continue;
    const queue = [i];
    const group: number[] = [];
    visited[i] = true;
    while (queue.length) {
      const current = queue.shift()!;
      group.push(current);
      adjacency[current].forEach((next) => {
        if (!visited[next]) {
          visited[next] = true;
          queue.push(next);
        }
      });
    }

    const groupEvents = group.sort((a, b) => prepared[a].start - prepared[b].start);
    const columns: number[] = [];
    let maxColumns = 1;
    groupEvents.forEach((index) => {
      const event = prepared[index];
      let columnIndex = 0;
      while (columns[columnIndex] && columns[columnIndex] > event.start) {
        columnIndex += 1;
      }
      columns[columnIndex] = event.end;
      event.column = columnIndex;
      maxColumns = Math.max(maxColumns, columnIndex + 1);
    });
    groupEvents.forEach((index) => {
      prepared[index].columns = maxColumns;
    });
  }

  return prepared.map((event) => ({
    slot: event.slot,
    top: ((event.start - START_HOUR * 60) / 60) * HOUR_HEIGHT,
    height: Math.max(40, ((event.end - event.start) / 60) * HOUR_HEIGHT),
    column: event.column,
    columns: event.columns
  }));
}

const isOverlap = (a: { start: number; end: number }, b: { start: number; end: number }) => {
  return Math.max(a.start, b.start) < Math.min(a.end, b.end);
};

type SlotDetailSheetProps = {
  slot: Slot | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (slot: Slot) => void;
  onDuplicate: (slot: Slot) => void;
  onTogglePublish: (slot: Slot) => void;
  onCloseSlot: (slot: Slot) => void;
};

function SlotDetailSheet({ slot, visible, onClose, onEdit, onDuplicate, onTogglePublish, onCloseSlot }: SlotDetailSheetProps) {
  if (!slot) return null;

  return (
    <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailSheet}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{slot.experience}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailMetaRow}>
            <Clock size={16} color={colors.muted} />
            <Text style={styles.detailMetaText}>{slot.date} / {slot.start} - {slot.end}</Text>
          </View>
          <View style={styles.detailMetaRow}>
            <MapPin size={16} color={colors.muted} />
            <Text style={styles.detailMetaText}>{slot.venue}</Text>
          </View>
          <View style={styles.detailMetaRow}>
            <User size={16} color={colors.muted} />
            <Text style={styles.detailMetaText}>{slot.mentor}</Text>
          </View>

          <View style={styles.detailChipRow}>
            <Text style={[styles.detailChip, { backgroundColor: `${stateColors[slot.state]}20`, color: stateColors[slot.state] }]}>
              {stateLabels[slot.state]}
            </Text>
            <Text style={styles.detailChip}>定員 {slot.capacity}</Text>
            <Text style={styles.detailChip}>残席 {slot.remaining}</Text>
          </View>

          {slot.note ? <Text style={styles.detailNote}>{slot.note}</Text> : null}

          <View style={styles.detailActions}>
            <UIButton variant='ghost' onPress={() => onDuplicate(slot)} style={styles.detailButton}>
              複製
            </UIButton>
            <UIButton variant='ghost' onPress={() => onTogglePublish(slot)} style={styles.detailButton}>
              {slot.state === '公開中' ? '下書きに戻す' : '公開する'}
            </UIButton>
          </View>
          <View style={styles.detailActions}>
            <UIButton variant='ghost' onPress={() => onEdit(slot)} style={styles.detailButton}>
              編集
            </UIButton>
            <UIButton variant='ghost' onPress={() => onCloseSlot(slot)} style={styles.detailButton}>
              クローズ
            </UIButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type SlotEditorModalProps = {
  visible: boolean;
  draft: SlotDraft;
  errors: Record<string, string>;
  onChange: (draft: SlotDraft) => void;
  onClose: () => void;
  onSave: () => void;
};

function SlotEditorModal({ visible, draft, errors, onChange, onClose, onSave }: SlotEditorModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType={Platform.OS === 'ios' ? 'slide' : 'fade'} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          paddingTop: insets.top + 16
        }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.editorContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 32 }
          ]}
          keyboardShouldPersistTaps='handled'
        >
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color={colors.muted} />
          </TouchableOpacity>
          <Text style={styles.editorTitle}>{draft.id.startsWith('SLOT-') ? '体験枠の編集' : '体験枠の作成'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.editorField}>
          <Text style={styles.editorLabel}>体験名 *</Text>
          <TextInput
            value={draft.experience}
            onChangeText={(value) => onChange({ ...draft, experience: value })}
            placeholder='例）STEAM クリエイティブ体験'
            style={[styles.editorInput, errors.experience && styles.editorInputError]}
          />
          {errors.experience ? <Text style={styles.editorErrorText}>{errors.experience}</Text> : null}
        </View>

        <View style={styles.editorRow}>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>日付 *</Text>
            <TextInput
              value={draft.date}
              onChangeText={(value) => onChange({ ...draft, date: value })}
              placeholder='YYYY-MM-DD'
              style={[styles.editorInput, errors.date && styles.editorInputError]}
            />
            {errors.date ? <Text style={styles.editorErrorText}>{errors.date}</Text> : null}
          </View>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>開始 *</Text>
            <TextInput
              value={draft.start}
              onChangeText={(value) => onChange({ ...draft, start: value })}
              placeholder='10:00'
              style={[styles.editorInput, errors.time && styles.editorInputError]}
            />
          </View>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>終了 *</Text>
            <TextInput
              value={draft.end}
              onChangeText={(value) => onChange({ ...draft, end: value })}
              placeholder='11:30'
              style={[styles.editorInput, errors.time && styles.editorInputError]}
            />
            {errors.time ? <Text style={styles.editorErrorText}>{errors.time}</Text> : null}
          </View>
        </View>

        <View style={styles.editorField}>
          <Text style={styles.editorLabel}>会場 *</Text>
          <TextInput
            value={draft.venue}
            onChangeText={(value) => onChange({ ...draft, venue: value })}
            placeholder='例）目黒スタジオA'
            style={[styles.editorInput, errors.venue && styles.editorInputError]}
          />
          {errors.venue ? <Text style={styles.editorErrorText}>{errors.venue}</Text> : null}
        </View>

        <View style={styles.editorRow}>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>定員 *</Text>
            <TextInput
              value={String(draft.capacity)}
              onChangeText={(value) => onChange({ ...draft, capacity: Number(value.replace(/[^0-9]/g, '')) || 0 })}
              placeholder='8'
              keyboardType='numeric'
              style={[styles.editorInput, errors.capacity && styles.editorInputError]}
            />
            {errors.capacity ? <Text style={styles.editorErrorText}>{errors.capacity}</Text> : null}
          </View>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>残席</Text>
            <TextInput
              value={String(draft.remaining)}
              onChangeText={(value) => onChange({ ...draft, remaining: Number(value.replace(/[^0-9]/g, '')) || 0 })}
              placeholder='8'
              keyboardType='numeric'
              style={styles.editorInput}
            />
          </View>
        </View>

        <View style={styles.editorRow}>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>担当</Text>
            <TextInput
              value={draft.mentor}
              onChangeText={(value) => onChange({ ...draft, mentor: value })}
              placeholder='担当メンター'
              style={[styles.editorInput, errors.mentor && styles.editorInputError]}
            />
            {errors.mentor ? <Text style={styles.editorErrorText}>{errors.mentor}</Text> : null}
          </View>
          <View style={[styles.editorField, { flex: 1 }]}> 
            <Text style={styles.editorLabel}>対象年齢</Text>
            <TextInput
              value={draft.ageRange}
              onChangeText={(value) => onChange({ ...draft, ageRange: value })}
              placeholder='8-12歳'
              style={styles.editorInput}
            />
          </View>
        </View>

        <View style={styles.editorField}>
          <Text style={styles.editorLabel}>メモ</Text>
          <TextInput
            value={draft.note}
            onChangeText={(value) => onChange({ ...draft, note: value })}
            placeholder='持ち物、注意事項など'
            multiline
            style={[styles.editorInput, styles.editorTextarea]}
          />
        </View>

        <View style={styles.editorActions}>
          <UIButton variant='ghost' onPress={onClose} style={{ minWidth: 120 }}>
            キャンセル
          </UIButton>
          <UIButton variant='primary' onPress={onSave} style={{ minWidth: 160 }}>
            保存する
          </UIButton>
        </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerIconText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.fg
  },
  segmentContainer: {
    paddingHorizontal: 16,
    marginTop: 12
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6'
  },
  syncBannerText: {
    fontSize: 13,
    color: colors.fg
  },
  syncBannerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB'
  },
  swipeContainer: {
    width: '100%'
  },
  calendarWrapper: {
    width: '100%',
    flexShrink: 0
  },
  monthContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12
  },
  monthWeekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4
  },
  monthWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted
  },
  monthRow: {
    flexDirection: 'row',
    marginVertical: -0.5
  },
  monthCell: {
    flex: 1,
    minHeight: 108,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB'
  },
  monthCellHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  monthDateBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14
  },
  monthDateBadgeSelected: {
    backgroundColor: '#1C64F2'
  },
  monthDateBadgeToday: {
    backgroundColor: '#DBEAFE'
  },
  monthDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.fg
  },
  monthEventList: {
    marginTop: 6,
    gap: 4
  },
  monthEventSummary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  monthEventSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.fg
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timelineHeaderLabel: {
    justifyContent: 'flex-end',
    paddingBottom: 6
  },
  timelineHeaderText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600'
  },
  timelineDayHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4
  },
  timelineDayWeek: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600'
  },
  timelineDayWeekToday: {
    color: '#2563EB'
  },
  timelineDayBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timelineDayBadgeSelected: {
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#E0ECFF'
  },
  timelineDayBadgeToday: {
    backgroundColor: '#2563EB'
  },
  timelineDayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.fg
  },
  timelineDayDateToday: {
    color: '#FFFFFF'
  },
  timelineDayDateSelected: {
    color: '#2563EB'
  },
  timeColumn: {
    width: 60,
    paddingTop: 16,
    paddingRight: 8
  },
  timeLabelRow: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start'
  },
  timeLabelText: {
    fontSize: 11,
    color: colors.muted
  },
  timelineDayColumn: {
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6'
  },
  timelineHourRow: {
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  timelineEvent: {
    position: 'absolute',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 4
  },
  timelineEventTime: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600'
  },
  timelineEventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.fg
  },
  timelineEventMeta: {
    fontSize: 10,
    color: colors.muted
  },
  fabContainer: {
    position: 'absolute',
    right: 24
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  syncContainer: {
    position: 'absolute',
    right: 24
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end'
  },
  detailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  detailMetaText: {
    fontSize: 13,
    color: colors.muted
  },
  detailChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  detailChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    color: colors.muted,
    backgroundColor: '#F3F4F6'
  },
  detailNote: {
    fontSize: 13,
    color: colors.fg,
    lineHeight: 18
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12
  },
  detailButton: {
    flex: 1,
    minWidth: 140
  },
  editorContainer: {
    padding: 20,
    gap: 16
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg
  },
  editorField: {
    gap: 6
  },
  editorLabel: {
    fontSize: 13,
    color: colors.muted
  },
  editorInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.fg
  },
  editorInputError: {
    borderColor: '#EF4444'
  },
  editorErrorText: {
    fontSize: 12,
    color: '#EF4444'
  },
  editorRow: {
    flexDirection: 'row',
    gap: 12
  },
  editorTextarea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  }
});
