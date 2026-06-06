'use client';

import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api/client';
import { User } from '@/types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, login, logout, clearSession, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('hod_token');
      const refreshToken = Cookies.get('hod_refresh_token');
      const userCookie = Cookies.get('hod_user');

      if (!token || !refreshToken) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        // Attempt to fetch fresh profile details to validate the token
        const profileRes = await apiClient.get<{ message: string; user: User }>('/auth/profile');
        const userData = profileRes.data.user;

        // Restore active session details
        const rememberMe = localStorage.getItem('hod_remember') === 'true';
        login(token, refreshToken, userData, rememberMe);
      } catch (error) {
        console.error('Session restoration failed:', error);
        // Let the axios client's interceptor handle refreshes first.
        // If it still fails, wipe the invalid session.
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [login, clearSession, setLoading]);

  // Session Recovery loading placeholder view
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-xs w-full text-center space-y-4">
          {/* Spinner icon */}
          <div className="relative h-10 w-10 mx-auto">
            <div className="absolute inset-0 border-2 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Recovering Session
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              Verifying security tokens, please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
