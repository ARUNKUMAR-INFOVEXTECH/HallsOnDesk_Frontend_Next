import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hallsondesk-backend.onrender.com';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token from cookies
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('hod_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dynamic tenancy context for multiple product lines
    const activeProduct = Cookies.get('active_product') || 'halls';
    config.headers['X-Product-Context'] = activeProduct;

    // Attach Active Hall Scope header for multi-hall owners
    const activeHallId = Cookies.get('active_hall_id');
    if (activeHallId) {
      config.headers['X-Active-Hall-ID'] = activeHallId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage 401 token refresh and centralize errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // Check for 401 Unauthorized status
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh-token');

      if (!isLoginRequest && !isRefreshRequest) {
        originalRequest._retry = true;

        try {
          const refreshToken = Cookies.get('hod_refresh_token');
          if (!refreshToken) {
            throw new Error('Refresh token missing');
          }

          // Call refresh API endpoint to rotate tokens
          const refreshRes = await axios.post<{ token: string; refresh_token?: string }>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refresh_token: refreshToken }
          );

          const newAccessToken = refreshRes.data.token;
          const newRefreshToken = refreshRes.data.refresh_token;

          // Sync tokens to Zustand store & cookies
          useAuthStore.getState().refreshSession(newAccessToken, newRefreshToken);

          // Retry the original network request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Clear session on refresh failure and redirect to login
          useAuthStore.getState().clearSession();
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login?expired=true';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // Centralized log handling for server-side exceptions (5xx codes)
    if (error.response && error.response.status >= 500) {
      console.error('Core server exception occurred:', error.response.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
