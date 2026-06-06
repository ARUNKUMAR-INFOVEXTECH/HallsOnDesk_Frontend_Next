import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  role: 'super_admin' | 'owner' | 'manager' | 'staff' | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeHallId: string | null;
  
  // Core Methods
  login: (accessToken: string, refreshToken: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  setUser: (user: User) => void;
  refreshSession: (accessToken: string, refreshToken?: string) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setActiveHall: (hallId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // starts true to check sessions on initial mount
  activeHallId: typeof window !== 'undefined' ? Cookies.get('active_hall_id') || null : null,

  login: (accessToken, refreshToken, user, rememberMe = false) => {
    // Cookie Config: If rememberMe is false, we omit 'expires' to make it a session cookie
    const cookieOptions: Cookies.CookieAttributes = {
      secure: true,
      sameSite: 'strict',
    };
    if (rememberMe) {
      cookieOptions.expires = 7; // 7 days persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('hod_remember', 'true');
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hod_remember');
      }
    }

    // Save tokens in cookies (visible to client and Edge Middleware)
    Cookies.set('hod_token', accessToken, cookieOptions);
    Cookies.set('hod_refresh_token', refreshToken, cookieOptions);
    Cookies.set('hod_user', JSON.stringify(user), cookieOptions);
    Cookies.set('active_hall_id', user.hall_id || '', cookieOptions);

    set({
      user,
      role: user.role,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      activeHallId: user.hall_id || null,
    });
  },

  logout: () => {
    // Clear cookies
    Cookies.remove('hod_token');
    Cookies.remove('hod_refresh_token');
    Cookies.remove('hod_user');
    Cookies.remove('active_hall_id');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hod_remember');
    }

    set({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      activeHallId: null,
    });

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  setUser: (user) => {
    // Retain existing expiry policy when updating profile
    const rememberMe = typeof window !== 'undefined' && localStorage.getItem('hod_remember') === 'true';
    const cookieOptions: Cookies.CookieAttributes = {
      secure: true,
      sameSite: 'strict',
      ...(rememberMe ? { expires: 7 } : {}),
    };

    Cookies.set('hod_user', JSON.stringify(user), cookieOptions);
    
    set({
      user,
      role: user.role,
    });
  },

  refreshSession: (accessToken, refreshToken) => {
    const rememberMe = typeof window !== 'undefined' && localStorage.getItem('hod_remember') === 'true';
    const cookieOptions: Cookies.CookieAttributes = {
      secure: true,
      sameSite: 'strict',
      ...(rememberMe ? { expires: 7 } : {}),
    };

    Cookies.set('hod_token', accessToken, cookieOptions);
    if (refreshToken) {
      Cookies.set('hod_refresh_token', refreshToken, cookieOptions);
    }

    set((state) => ({
      accessToken,
      refreshToken: refreshToken || state.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    }));
  },

  clearSession: () => {
    Cookies.remove('hod_token');
    Cookies.remove('hod_refresh_token');
    Cookies.remove('hod_user');
    Cookies.remove('active_hall_id');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hod_remember');
    }

    set({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      activeHallId: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setActiveHall: (hallId) => {
    const rememberMe = typeof window !== 'undefined' && localStorage.getItem('hod_remember') === 'true';
    const cookieOptions: Cookies.CookieAttributes = {
      secure: true,
      sameSite: 'strict',
      ...(rememberMe ? { expires: 7 } : {}),
    };

    Cookies.set('active_hall_id', hallId, cookieOptions);
    set({ activeHallId: hallId });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
}));
