import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IClient } from '@/types/client';

export type ClientUser = Omit<IClient, 'password'>;

interface ClientStore {
  user: ClientUser | null;
  setAuth: (user: ClientUser) => void;
  setUser: (user: ClientUser) => void;
  clearAuth: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'sh-client',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
