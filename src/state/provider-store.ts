import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { providerService } from '../services/provider-service';

type ReservationStatus = '予約済' | '来場' | '受講中' | '完了' | '欠席' | 'キャンセル';

type ReservationHistory = {
  date: string;
  experience: string;
  memo: string;
};

type ReservationFeedback = {
  focus: number;
  collaboration: number;
  challenge: number;
  creativity: number;
  stamina: number;
  note?: string;
  childSummary?: string;
  shareWithGuardian: boolean;
  updatedAt: string;
};

type Reservation = {
  id: string;
  date: string;
  start: string;
  end: string;
  experience: string;
  venue: string;
  mentor: string;
  child: {
    name: string;
    kana?: string;
    age: string;
  };
  guardian: {
    name: string;
    phone?: string;
    email?: string;
  };
  profile: {
    strengths: string[];
    weakPoints: string[];
    recent: string;
  };
  history: ReservationHistory[];
  status: ReservationStatus;
  memo?: string;
  feedback?: ReservationFeedback;
  pendingSync?: boolean;
};

type SlotState = '公開中' | '下書き' | '満席' | 'クローズ';

type RepeatType = 'none' | 'weekly' | 'biweekly' | 'monthly';

type Slot = {
  id: string;
  experience: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  capacity: number;
  remaining: number;
  ageRange: string;
  mentor: string;
  state: SlotState;
  price?: string;
  category?: string;
  tags?: string[];
  note?: string;
  deadlineHours: number;
  repeat?: { type: RepeatType; until?: string; count?: number };
  createdBy: string;
  updatedAt: string;
};

type OfflineOperation =
  | { type: 'updateStatus'; payload: { id: string; status: ReservationStatus } }
  | { type: 'saveMemo'; payload: { id: string; memo?: string } }
  | { type: 'saveFeedback'; payload: { id: string; feedback: ReservationFeedback } }
  | { type: 'saveContact'; payload: { id: string; phone?: string; email?: string } }
  | { type: 'upsertSlot'; payload: { slot: Slot } }
  | { type: 'togglePublish'; payload: { id: string } }
  | { type: 'closeSlot'; payload: { id: string } };

type KpiCounters = {
  checkInCount: number;
  feedbackSaved: number;
  slotPublished: number;
};

type ProviderState = {
  reservations: Reservation[];
  slots: Slot[];
  offlineQueue: OfflineOperation[];
  isOnline: boolean;
  kpi: KpiCounters;
  isLoading: boolean;
  setOnline: (online: boolean) => void;
  processQueue: () => void;
  fetchData: () => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  saveReservationMemo: (id: string, memo?: string) => void;
  saveReservationContact: (id: string, contact: { phone?: string; email?: string }) => void;
  saveFeedback: (id: string, feedback: ReservationFeedback) => void;
  addSlot: (slot: Slot) => void;
  updateSlot: (slot: Slot) => void;
  toggleSlotPublish: (id: string) => void;
  closeSlot: (id: string) => void;
};

const initialReservations: Reservation[] = [
  {
    id: 'RSV-001',
    date: '2025-05-18',
    start: '10:00',
    end: '11:30',
    experience: 'STEAM クリエイティブ体験',
    venue: '目黒スタジオA',
    mentor: '佐藤ひかり',
    child: { name: '山本 ゆう', kana: 'やまもと ゆう', age: '小3' },
    guardian: { name: '山本 さやか', phone: '080-0000-1111', email: 's_yamamoto@example.jp' },
    profile: {
      strengths: ['集中力が高い', 'リーダーシップあり'],
      weakPoints: ['初対面で緊張しやすい'],
      recent: 'グループ課題のまとめ役を意欲的に行っている。'
    },
    history: [
      { date: '2025/05/11', experience: 'STEAMクリエイティブ', memo: '主体的に発表できた' },
      { date: '2025/04/28', experience: 'メイカーズラボ', memo: '3Dモデルの設計を最後までやり切った' },
      { date: '2025/04/14', experience: 'サイエンス実験', memo: '質問を積極的に行っていた' }
    ],
    status: '予約済'
  },
  {
    id: 'RSV-002',
    date: '2025-05-18',
    start: '13:00',
    end: '14:00',
    experience: '英会話アクティビティ',
    venue: 'オンライン',
    mentor: '大友しゅん',
    child: { name: '伊藤 かい', age: '小5' },
    guardian: { name: '伊藤 まい', phone: '090-1234-5678', email: 'ito_family@example.jp' },
    profile: {
      strengths: ['論理的思考', '質問力'],
      weakPoints: ['長時間の座学で集中が切れやすい'],
      recent: 'プログラミング体験でチームをサポートしていた。'
    },
    history: [{ date: '2025/05/05', experience: 'メンタープログラミング', memo: 'ゲームのロジックを完成させた' }],
    status: '来場'
  },
  {
    id: 'RSV-003',
    date: '2025-05-18',
    start: '15:00',
    end: '16:30',
    experience: 'リズム体操',
    venue: '渋谷スタジオB',
    mentor: '加藤ハル',
    child: { name: '西田 もも', kana: 'にしだ もも', age: '小2' },
    guardian: { name: '西田 ひろみ' },
    profile: {
      strengths: ['表現力がある'],
      weakPoints: ['初対面で緊張しやすい'],
      recent: '発表会に向けて練習中。家でも頑張っているとのこと。'
    },
    history: [{ date: '2025/05/10', experience: 'キッズダンス', memo: '笑顔で最後まで踊り切った' }],
    status: '予約済',
    pendingSync: true
  }
];

const initialSlots: Slot[] = [
  // 10月2日（今日）
  {
    id: 'SLOT-001',
    experience: 'STEAM クリエイティブ',
    date: '2025-10-02',
    start: '10:00',
    end: '11:30',
    venue: '目黒スタジオA',
    capacity: 8,
    remaining: 2,
    ageRange: '8-11歳',
    mentor: '佐藤ひかり',
    state: '公開中',
    price: '¥6,600',
    category: 'STEAM',
    tags: ['人気'],
    deadlineHours: 3,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-01T09:00:00Z'
  },
  {
    id: 'SLOT-002',
    experience: 'プログラミング入門',
    date: '2025-10-02',
    start: '14:00',
    end: '15:30',
    venue: '渋谷スタジオB',
    capacity: 10,
    remaining: 5,
    ageRange: '10-14歳',
    mentor: '田中けんた',
    state: '公開中',
    price: '¥7,200',
    category: 'プログラミング',
    tags: ['初心者歓迎'],
    deadlineHours: 6,
    repeat: { type: 'none' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-01T10:00:00Z'
  },
  {
    id: 'SLOT-003',
    experience: '英会話アクティビティ',
    date: '2025-10-02',
    start: '16:00',
    end: '17:00',
    venue: 'オンライン',
    capacity: 6,
    remaining: 0,
    ageRange: '7-10歳',
    mentor: '大友しゅん',
    state: '満席',
    price: '¥4,500',
    category: '語学',
    tags: ['オンライン'],
    deadlineHours: 1,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-01T11:00:00Z'
  },
  // 10月3日
  {
    id: 'SLOT-004',
    experience: 'ロボット工作',
    date: '2025-10-03',
    start: '10:00',
    end: '12:00',
    venue: '目黒スタジオA',
    capacity: 8,
    remaining: 8,
    ageRange: '9-12歳',
    mentor: '佐藤ひかり',
    state: '公開中',
    price: '¥8,800',
    category: 'STEAM',
    tags: ['工作', '体験'],
    deadlineHours: 12,
    repeat: { type: 'none' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-01T12:00:00Z'
  },
  {
    id: 'SLOT-005',
    experience: 'アート＆クラフト',
    date: '2025-10-03',
    start: '14:00',
    end: '15:30',
    venue: '渋谷スタジオB',
    capacity: 12,
    remaining: 10,
    ageRange: '6-10歳',
    mentor: '加藤ハル',
    state: '公開中',
    price: '¥5,500',
    category: 'アート',
    tags: ['クリエイティブ'],
    deadlineHours: 6,
    repeat: { type: 'biweekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-01T13:00:00Z'
  },
  // 10月4日
  {
    id: 'SLOT-006',
    experience: 'サイエンス実験',
    date: '2025-10-04',
    start: '10:00',
    end: '11:30',
    venue: '目黒スタジオA',
    capacity: 10,
    remaining: 3,
    ageRange: '8-12歳',
    mentor: '佐藤ひかり',
    state: '公開中',
    price: '¥6,800',
    category: '科学',
    tags: ['実験', '人気'],
    deadlineHours: 6,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-02T09:00:00Z'
  },
  {
    id: 'SLOT-007',
    experience: 'ダンス＆リズム',
    date: '2025-10-04',
    start: '15:00',
    end: '16:00',
    venue: '渋谷スタジオB',
    capacity: 15,
    remaining: 12,
    ageRange: '5-9歳',
    mentor: '加藤ハル',
    state: '公開中',
    price: '¥4,800',
    category: '運動',
    tags: ['体験', '初心者歓迎'],
    deadlineHours: 3,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-02T10:00:00Z'
  },
  // 10月5日
  {
    id: 'SLOT-008',
    experience: 'マインクラフトプログラミング',
    date: '2025-10-05',
    start: '10:00',
    end: '12:00',
    venue: 'オンライン',
    capacity: 8,
    remaining: 1,
    ageRange: '9-13歳',
    mentor: '田中けんた',
    state: '公開中',
    price: '¥7,800',
    category: 'プログラミング',
    tags: ['オンライン', '人気'],
    deadlineHours: 12,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-03T09:00:00Z'
  },
  {
    id: 'SLOT-009',
    experience: '料理体験',
    date: '2025-10-05',
    start: '14:00',
    end: '16:00',
    venue: '目黒スタジオA',
    capacity: 6,
    remaining: 6,
    ageRange: '7-11歳',
    mentor: '山田さくら',
    state: '下書き',
    price: '¥5,800',
    category: '料理',
    tags: ['体験'],
    deadlineHours: 24,
    repeat: { type: 'none' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-03T10:00:00Z'
  },
  // 10月6日（日曜日）
  {
    id: 'SLOT-010',
    experience: 'プログラミングコンテスト準備講座',
    date: '2025-10-06',
    start: '09:00',
    end: '12:00',
    venue: '渋谷スタジオB',
    capacity: 12,
    remaining: 7,
    ageRange: '10-15歳',
    mentor: '田中けんた',
    state: '公開中',
    price: '¥9,800',
    category: 'プログラミング',
    tags: ['特別講座'],
    deadlineHours: 24,
    repeat: { type: 'none' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-04T09:00:00Z'
  },
  {
    id: 'SLOT-011',
    experience: '親子でSTEAM',
    date: '2025-10-06',
    start: '14:00',
    end: '16:00',
    venue: '目黒スタジオA',
    capacity: 10,
    remaining: 4,
    ageRange: '6-10歳',
    mentor: '佐藤ひかり',
    state: '公開中',
    price: '¥8,500',
    category: 'STEAM',
    tags: ['親子', '週末'],
    deadlineHours: 12,
    repeat: { type: 'monthly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-04T10:00:00Z'
  },
  // 10月7日
  {
    id: 'SLOT-012',
    experience: '英語でゲーム',
    date: '2025-10-07',
    start: '16:00',
    end: '17:00',
    venue: 'オンライン',
    capacity: 8,
    remaining: 8,
    ageRange: '8-12歳',
    mentor: '大友しゅん',
    state: '公開中',
    price: '¥4,200',
    category: '語学',
    tags: ['オンライン', '初心者歓迎'],
    deadlineHours: 3,
    repeat: { type: 'weekly' },
    createdBy: 'tanaka',
    updatedAt: '2025-10-05T09:00:00Z'
  }
];

const normalizeSlotState = (slot: Slot): Slot => {
  if (slot.remaining <= 0 && slot.state === '公開中') {
    return { ...slot, state: '満席' };
  }
  if (slot.remaining > 0 && slot.state === '満席') {
    return { ...slot, state: '公開中' };
  }
  return slot;
};

const applyOperation = (state: ProviderState, op: OfflineOperation): ProviderState => {
  switch (op.type) {
    case 'updateStatus': {
      const { id, status } = op.payload;
      const updatedReservations = state.reservations.map((reservation) =>
        reservation.id === id ? { ...reservation, status, pendingSync: false } : reservation
      );
      return {
        ...state,
        reservations: updatedReservations,
        kpi: status === '来場' ? { ...state.kpi, checkInCount: state.kpi.checkInCount + 1 } : state.kpi
      };
    }
    case 'saveMemo': {
      const updatedReservations = state.reservations.map((reservation) =>
        reservation.id === op.payload.id ? { ...reservation, memo: op.payload.memo, pendingSync: false } : reservation
      );
      return { ...state, reservations: updatedReservations };
    }
    case 'saveContact': {
      const { id, phone, email } = op.payload;
      const updatedReservations = state.reservations.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              guardian: { ...reservation.guardian, phone, email },
              pendingSync: false
            }
          : reservation
      );
      return { ...state, reservations: updatedReservations };
    }
    case 'saveFeedback': {
      const { id, feedback } = op.payload;
      const updatedReservations = state.reservations.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              feedback,
              pendingSync: false,
              history: [
                { date: new Date().toISOString().slice(0, 10), experience: reservation.experience, memo: feedback.note ?? '' },
                ...reservation.history
              ].slice(0, 10)
            }
          : reservation
      );
      return {
        ...state,
        reservations: updatedReservations,
        kpi: { ...state.kpi, feedbackSaved: state.kpi.feedbackSaved + 1 }
      };
    }
    case 'upsertSlot': {
      const normalized = normalizeSlotState(op.payload.slot);
      const exists = state.slots.some((slot) => slot.id === normalized.id);
      const updatedSlots = exists
        ? state.slots.map((slot) => (slot.id === normalized.id ? normalized : slot))
        : [...state.slots, normalized];
      return {
        ...state,
        slots: updatedSlots,
        kpi: exists ? state.kpi : { ...state.kpi, slotPublished: state.kpi.slotPublished + (normalized.state === '公開中' ? 1 : 0) }
      };
    }
    case 'togglePublish': {
      const updatedSlots = state.slots.map((slot) => {
        if (slot.id !== op.payload.id) return slot;
        const nextState: SlotState = slot.state === '公開中' ? '下書き' : '公開中';
        return normalizeSlotState({ ...slot, state: nextState, updatedAt: new Date().toISOString() });
      });
      return { ...state, slots: updatedSlots };
    }
    case 'closeSlot': {
      const updatedSlots = state.slots.map((slot) =>
        slot.id === op.payload.id ? { ...slot, state: 'クローズ' as SlotState, updatedAt: new Date().toISOString() } : slot
      );
      return { ...state, slots: updatedSlots };
    }
    default:
      return state;
  }
};

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      reservations: initialReservations,
      slots: initialSlots,
      offlineQueue: [],
      isOnline: true,
      isLoading: false,
      kpi: { checkInCount: 0, feedbackSaved: 0, slotPublished: 0 },

      setOnline: (online) => {
        set({ isOnline: online });
        if (online) {
          get().processQueue();
        }
      },

      fetchData: async () => {
        if (!get().isOnline) return;

        set({ isLoading: true });
        try {
          const [slots, reservations] = await Promise.all([
            providerService.fetchSlots(),
            providerService.fetchReservations()
          ]);
          set({ slots, reservations, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch data:', error);
          set({ isLoading: false });
        }
      },

      processQueue: async () => {
        const queue = get().offlineQueue;
        if (queue.length === 0) return;

        try {
          for (const op of queue) {
            switch (op.type) {
              case 'updateStatus':
                await providerService.updateReservationStatus(op.payload.id, op.payload.status);
                break;
              case 'saveMemo':
                await providerService.saveReservationMemo(op.payload.id, op.payload.memo);
                break;
              case 'saveContact':
                await providerService.saveReservationContact(op.payload.id, {
                  phone: op.payload.phone,
                  email: op.payload.email
                });
                break;
              case 'saveFeedback':
                await providerService.saveFeedback(op.payload.id, op.payload.feedback);
                break;
              case 'upsertSlot':
                await providerService.upsertSlot(op.payload.slot);
                break;
              case 'togglePublish':
              case 'closeSlot':
                const slot = get().slots.find(s => s.id === op.payload.id);
                if (slot) {
                  await providerService.upsertSlot(slot);
                }
                break;
            }
          }

          // Fetch fresh data after processing queue
          await get().fetchData();
          set({ offlineQueue: [] });
        } catch (error) {
          console.error('Failed to process queue:', error);
        }
      },
      updateReservationStatus: (id, status) => {
        const op: OfflineOperation = { type: 'updateStatus', payload: { id, status } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.updateReservationStatus(id, status).catch((error) => {
            console.error('Failed to update status:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            reservations: state.reservations.map((reservation) =>
              reservation.id === id ? { ...reservation, status, pendingSync: true } : reservation
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      saveReservationMemo: (id, memo) => {
        const op: OfflineOperation = { type: 'saveMemo', payload: { id, memo } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.saveReservationMemo(id, memo).catch((error) => {
            console.error('Failed to save memo:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            reservations: state.reservations.map((reservation) =>
              reservation.id === id ? { ...reservation, memo, pendingSync: true } : reservation
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      saveReservationContact: (id, contact) => {
        const op: OfflineOperation = { type: 'saveContact', payload: { id, ...contact } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.saveReservationContact(id, contact).catch((error) => {
            console.error('Failed to save contact:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            reservations: state.reservations.map((reservation) =>
              reservation.id === id
                ? { ...reservation, guardian: { ...reservation.guardian, ...contact }, pendingSync: true }
                : reservation
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      saveFeedback: (id, feedback) => {
        const op: OfflineOperation = { type: 'saveFeedback', payload: { id, feedback } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.saveFeedback(id, feedback).catch((error) => {
            console.error('Failed to save feedback:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            reservations: state.reservations.map((reservation) =>
              reservation.id === id
                ? { ...reservation, feedback, pendingSync: true }
                : reservation
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      addSlot: (slot) => {
        const normalized = normalizeSlotState(slot);
        const op: OfflineOperation = { type: 'upsertSlot', payload: { slot: normalized } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.upsertSlot(normalized).catch((error) => {
            console.error('Failed to add slot:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            slots: [...state.slots, { ...normalized, updatedAt: new Date().toISOString() }],
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      updateSlot: (slot) => {
        const normalized = normalizeSlotState(slot);
        const op: OfflineOperation = { type: 'upsertSlot', payload: { slot: normalized } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          providerService.upsertSlot(normalized).catch((error) => {
            console.error('Failed to update slot:', error);
            set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
          });
        } else {
          set((state) => ({
            slots: state.slots.map((item) => (item.id === slot.id ? normalized : item)),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      toggleSlotPublish: (id) => {
        const op: OfflineOperation = { type: 'togglePublish', payload: { id } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          const slot = get().slots.find(s => s.id === id);
          if (slot) {
            providerService.upsertSlot(slot).catch((error) => {
              console.error('Failed to toggle publish:', error);
              set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
            });
          }
        } else {
          set((state) => ({
            slots: state.slots.map((slot) =>
              slot.id === id
                ? normalizeSlotState({
                    ...slot,
                    state: (slot.state === '公開中' ? '下書き' : '公開中') as SlotState,
                    updatedAt: new Date().toISOString()
                  })
                : slot
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      },
      closeSlot: (id) => {
        const op: OfflineOperation = { type: 'closeSlot', payload: { id } };
        if (get().isOnline) {
          set((state) => applyOperation(state, op));
          const slot = get().slots.find(s => s.id === id);
          if (slot) {
            providerService.upsertSlot(slot).catch((error) => {
              console.error('Failed to close slot:', error);
              set((state) => ({ offlineQueue: [...state.offlineQueue, op] }));
            });
          }
        } else {
          set((state) => ({
            slots: state.slots.map((slot) =>
              slot.id === id ? { ...slot, state: 'クローズ' as SlotState, updatedAt: new Date().toISOString() } : slot
            ),
            offlineQueue: [...state.offlineQueue, op]
          }));
        }
      }
    }),
    {
      name: 'provider-mini-spec-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export type { Reservation, Slot, SlotState, RepeatType, ReservationStatus, ReservationFeedback };
