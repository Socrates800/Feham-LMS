import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { School, User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  school: School | null;
  setAuth: (user: User, token: string, school: School | null) => void;
  patchSchool: (partial: Partial<School>) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      school: null,
      isAuthenticated: false,
      setAuth: (user, token, school) =>
        set({ user, token, school, isAuthenticated: true }),
      patchSchool: (partial) =>
        set((state) => ({
          school: state.school ? { ...state.school, ...partial } : null,
        })),
      clearAuth: () =>
        set({ user: null, token: null, school: null, isAuthenticated: false }),
    }),
    { name: 'feham-auth' }
  )
);

export const selectIsAuthenticated = () => useAuthStore.getState().isAuthenticated;
