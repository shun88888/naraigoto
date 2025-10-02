import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Experience = {
  id: string;
  title: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  price?: number;
  location?: string;
  image_url?: string;
};

export type Slot = {
  id: string;
  experience_id: string;
  date: string;
  remaining: number;
  status: 'open' | 'closed' | 'canceled';
};

export type Booking = {
  id: string;
  user_id: string;
  slot_id: string;
  experience_id: string;
  created_at: string;
  updated_at?: string;
};

export type Filters = {
  category?: string;
  minAge?: number;
  maxAge?: number;
  location?: string;
  priceMax?: number;
};

export type AbilityScores = {
  creativity: number;
  problemSolving: number;
  collaboration: number;
  communication: number;
  persistence: number;
};

type Store = {
  likes: string[];
  addLike: (experienceId: string) => void;
  removeLike: (experienceId: string) => void;

  filters: Filters;
  setFilters: (next: Partial<Filters>) => void;

  ability: AbilityScores;
  setAbility: (next: Partial<AbilityScores>) => void;

  // onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (v: boolean) => void;
  maxDistanceKm: number; // e.g., 5-200
  setMaxDistanceKm: (v: number) => void;
  interests: string[]; // simple tag list for MVP
  toggleInterest: (tag: string) => void;

  // search page state
  searchQuery: string;
  searchLocation: string;
  searchSort: 'relevance' | 'new' | 'distance' | 'priceLow' | 'priceHigh';
  searchHistory: Array<{ q: string; when: number }>; // newest first
  savedQueries: Array<{ q: string; name?: string }>; 
  hiddenTip: boolean;
  setSearchQuery: (q: string) => void;
  setSearchLocation: (loc: string) => void;
  setSearchSort: (s: Store['searchSort']) => void;
  addSearchHistory: (q: string) => void;
  saveCurrentQuery: (q: string, name?: string) => void;
  hideTipBanner: () => void;

  // auth/roles (client-side gate for MVP)
  role: 'user' | 'provider' | null;
  setRole: (r: 'user' | 'provider' | null) => void;
  providerId?: string; // active provider profile id (for provider user)
  setProviderId: (id?: string) => void;
  testLoginActive: boolean;
  setTestLoginActive: (v: boolean) => void;
};

const initialAbility: AbilityScores = {
  creativity: 3,
  problemSolving: 3,
  collaboration: 3,
  communication: 3,
  persistence: 3
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      likes: [],
      addLike: (experienceId) => {
        const setLike = new Set(get().likes);
        setLike.add(experienceId);
        set({ likes: Array.from(setLike) });
      },
      removeLike: (experienceId) => {
        const setLike = new Set(get().likes);
        setLike.delete(experienceId);
        set({ likes: Array.from(setLike) });
      },

      filters: {},
      setFilters: (next) => set({ filters: { ...get().filters, ...next } }),

      ability: initialAbility,
      setAbility: (next) => set({ ability: { ...get().ability, ...next } }),

      onboardingCompleted: false,
      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
      maxDistanceKm: 20,
      setMaxDistanceKm: (v) => set({ maxDistanceKm: v }),
      interests: [],
      toggleInterest: (tag) => {
        const setTags = new Set(get().interests);
        if (setTags.has(tag)) setTags.delete(tag);
        else setTags.add(tag);
        set({ interests: Array.from(setTags) });
      },

      searchQuery: '',
      searchLocation: '',
      searchSort: 'relevance',
      searchHistory: [],
      savedQueries: [],
      hiddenTip: false,
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchLocation: (loc) => set({ searchLocation: loc }),
      setSearchSort: (s) => set({ searchSort: s }),
      addSearchHistory: (q) => set({ searchHistory: [{ q, when: Date.now() }, ...get().searchHistory].slice(0, 20) }),
      saveCurrentQuery: (q, name) => set({ savedQueries: [...get().savedQueries, { q, name }] }),
      hideTipBanner: () => set({ hiddenTip: true }),
      role: null,
      setRole: (r) => set({ role: r }),
      providerId: undefined,
      setProviderId: (id) => set({ providerId: id }),
      testLoginActive: false,
      setTestLoginActive: (v) => set({ testLoginActive: v })
    }),
    {
      name: 'kikkake-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
