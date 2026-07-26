import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const ONBOARDING_KEY = 'has_completed_onboarding';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
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
      void AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [AUTH_USER_KEY, JSON.stringify(user)],
      ]).catch(() => {});
      set({ user, token, isAuthenticated: true, isLoading: false });
    },
    logout: async () => {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
    hydrate: async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          AUTH_TOKEN_KEY,
          AUTH_USER_KEY,
          ONBOARDING_KEY,
        ]);
        const stored = Object.fromEntries(entries);
        const token = stored[AUTH_TOKEN_KEY];
        const serializedUser = stored[AUTH_USER_KEY];
        const hasCompletedOnboarding = stored[ONBOARDING_KEY] === 'true';

        if (!token || !serializedUser) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            hasCompletedOnboarding,
            isLoading: false,
          });
          return;
        }

        const parsedUser: unknown = JSON.parse(serializedUser);
        if (!parsedUser || typeof parsedUser !== 'object') {
          throw new Error('Invalid stored user');
        }
        const user = parsedUser as User;
        set({
          user,
          token,
          isAuthenticated: true,
          hasCompletedOnboarding,
          isLoading: false,
        });
      } catch {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]).catch(() => {});
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
    setLoading: (isLoading) => set({ isLoading }),
    setOnboardingComplete: () => {
      void AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
      set({ hasCompletedOnboarding: true });
    },
  })
);
