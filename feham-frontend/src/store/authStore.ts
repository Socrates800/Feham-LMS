import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { School, User } from '@/types';

interface PlatformBackup {
  user: User;
  token: string;
  school: School | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  school: School | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  platformBackup: PlatformBackup | null;
  setAuth: (user: User, token: string, school: School | null) => void;
  startImpersonation: (user: User, token: string, school: School) => void;
  exitImpersonation: () => void;
  patchSchool: (partial: Partial<School>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      school: null,
      isAuthenticated: false,
      isImpersonating: false,
      platformBackup: null,
      setAuth: (user, token, school) =>
        set({
          user,
          token,
          school,
          isAuthenticated: true,
          isImpersonating: false,
          platformBackup: null,
        }),
      startImpersonation: (user, token, school) => {
        const state = get();
        set({
          platformBackup: {
            user: state.user!,
            token: state.token!,
            school: state.school,
          },
          user,
          token,
          school,
          isAuthenticated: true,
          isImpersonating: true,
        });
      },
      exitImpersonation: () => {
        const backup = get().platformBackup;
        if (!backup) return;
        set({
          user: backup.user,
          token: backup.token,
          school: backup.school,
          isAuthenticated: true,
          isImpersonating: false,
          platformBackup: null,
        });
      },
      patchSchool: (partial) =>
        set((state) => ({
          school: state.school ? { ...state.school, ...partial } : null,
        })),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          school: null,
          isAuthenticated: false,
          isImpersonating: false,
          platformBackup: null,
        }),
    }),
    { name: 'feham-auth' }
  )
);

export const selectIsAuthenticated = () => useAuthStore.getState().isAuthenticated;
