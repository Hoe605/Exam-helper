import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

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
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token, isLoggedIn: true });
      },
      logout: async () => {
        // 尝试服务端登出
        try {
           await authService.logout();
        } catch (e) {
           console.error("Logout failed on server", e);
        }
        
        // 清除所有持久化状态
        set({ user: null, token: null, isLoggedIn: false });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');

          // 从当前路径提取 locale 前缀，确保跳转到正确的国际化路由
          const pathSegments = window.location.pathname.split('/');
          const supportedLocales = ['zh', 'en'];
          const currentLocale = supportedLocales.includes(pathSegments[1]) ? pathSegments[1] : 'zh';
          window.location.href = `/${currentLocale}`;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
