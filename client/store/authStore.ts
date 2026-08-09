import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  phone: string;
  name?: string;
  role: "CUSTOMER" | "SHOPKEEPER" | "ADMIN";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, token, isLoading: false }),
      logout: () => set({ user: null, token: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage", // local storage key
    }
  )
);
