import apiClient from '../client';
import { Notification } from '@/types';

export interface NotificationsListResponse {
  data: Notification[];
  unread_count: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function getNotifications(params: { page?: number; limit?: number; is_read?: boolean; type?: string } = {}): Promise<NotificationsListResponse> {
  const res = await apiClient.get<NotificationsListResponse>('/notifications', { params });
  return res.data;
}

export async function getUnreadCount(): Promise<{ unread_count: number }> {
  const res = await apiClient.get<{ unread_count: number }>('/notifications/unread-count');
  return res.data;
}

export async function markAsRead(id: string): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead(): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>('/notifications/read-all');
  return res.data;
}

export async function deleteNotification(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/notifications/${id}`);
  return res.data;
}
