import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUser = {
  id: number;
  identifier: string;
  displayName?: string;
  totalCapacity?: number;
  earlyBirdLimit?: number;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setSession: (token: string, user: AuthUser) => void;
  patchUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setSession: (token, user) => set({ token, user }),
      patchUser: (partial) =>
        set((s) => (s.user ? { user: { ...s.user, ...partial } } : {})),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "evently-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
