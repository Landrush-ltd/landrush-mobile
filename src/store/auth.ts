import { create } from 'zustand';
import { createAsyncStoragePersist } from '@react-native-async-storage/async-storage/lib/module';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setOnboardingComplete: () => void;
}

export const useAuthStore = create<AuthStore>(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    hasCompletedOnboarding: false,
    setUser: (user, token) => {
      AsyncStorage.setItem('auth_token', token);
      AsyncStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    },
    logout: async () => {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
    setLoading: (isLoading) => set({ isLoading }),
    setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
  })
);
