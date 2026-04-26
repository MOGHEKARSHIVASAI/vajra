import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface Profile {
  name: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goals?: any;
  gamification?: {
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
  };
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    geminiApiKey: string;
  };
}

interface StoreState {
  user: User | null;
  profile: Profile | null;
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
  aiCache: Record<string, { data: any; timestamp: number }>;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSettings: (settings: Partial<StoreState['settings']>) => void;
  updateAiCache: (key: string, data: any) => void;
  getCachedAiResponse: (key: string) => any | null;
  clearStore: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      settings: {
        darkMode: true,
        notifications: true,
      },
      aiCache: {},
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      
      updateAiCache: (key, data) => set((state) => ({
        aiCache: {
          ...state.aiCache,
          [key]: {
            data,
            timestamp: Date.now()
          }
        }
      })),
      
      getCachedAiResponse: (key) => {
        const cached = get().aiCache[key];
        if (!cached) return null;
        
        // Cache for 1 hour as requested
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - cached.timestamp > oneHour) {
          return null;
        }
        return cached.data;
      },
      
      clearStore: () => set({ user: null, profile: null, aiCache: {} }),
    }),
    {
      name: 'fit-os-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        aiCache: state.aiCache 
      }),
    }
  )
);
