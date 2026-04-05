import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token, isLoggedIn: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
