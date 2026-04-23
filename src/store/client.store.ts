import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IClient } from '@/types/client';

export type ClientUser = Omit<IClient, 'password'>;

interface ClientStore {
  user: ClientUser | null;
  token: string | null;
  setAuth: (user: ClientUser, token: string) => void;
  clearAuth: () => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'sh-client',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
