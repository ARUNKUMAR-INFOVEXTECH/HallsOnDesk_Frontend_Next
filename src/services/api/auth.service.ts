import apiClient from './client';
import { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refresh_token: string;
  role: string;
  user: User;
}

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

export async function logoutRequest(): Promise<{ message: string }> {
  // If the backend has a blacklist token route
  const response = await apiClient.post<{ message: string }>('/auth/logout');
  return response.data;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export async function changePasswordRequest(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/change-password', payload);
  return response.data;
}
