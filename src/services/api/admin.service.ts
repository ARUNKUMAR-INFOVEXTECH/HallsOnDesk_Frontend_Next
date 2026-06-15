import apiClient from './client';
import { User, Package, Hall } from '@/types';
import {
  SystemHealth,
  SupportTicket,
  AdminSettings,
  AdminActivity,
  GlobalUser,
  AdminAnalyticsData
} from '@/types/admin';

export interface AdminStats {
  total: number;
  active: number;
  suspended: number;
}

export interface HallWithSubscription extends Hall {
  hall_subscriptions?: Array<{
    id: string;
    package_id: string;
    status: string;
    start_date: string;
    end_date: string;
    payment_status: string;
    packages?: {
      name: string;
      price: number;
      billing_cycle: string;
    };
  }>;
}

export interface HallDetails extends Hall {
  hall_subscriptions?: Array<{
    id: string;
    package_id: string;
    status: string;
    start_date: string;
    end_date: string;
    payment_status: string;
    packages?: {
      name: string;
      price: number;
      billing_cycle: string;
      features: string[];
      max_users?: number | null;
      max_bookings?: number | null;
    };
  }>;
  users?: User[];
  bookings_count?: number;
  staff_count?: number;
}

// 1. Overview Stats
export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get<AdminStats>('/admin/stats');
  return res.data;
}

// 2. Halls Management (CRUD)
export async function getAllHalls(): Promise<HallWithSubscription[]> {
  const res = await apiClient.get<HallWithSubscription[]>('/admin/halls');
  return res.data;
}

export async function getHallById(id: string): Promise<HallDetails> {
  const res = await apiClient.get<HallDetails>(`/admin/halls/${id}`);
  return res.data;
}

export async function createHall(data: {
  hall_name: string;
  owner_name: string;
  owner_email: string;
  password?: string;
  phone: string;
  city: string;
  address: string;
  package_id: string;
}): Promise<{ message: string; hall_id: string; owner_email: string }> {
  const res = await apiClient.post<{ message: string; hall_id: string; owner_email: string }>(
    '/admin/halls',
    data
  );
  return res.data;
}

export async function suspendHall(id: string): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>(`/admin/halls/${id}/suspend`);
  return res.data;
}

export async function activateHall(id: string): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>(`/admin/halls/${id}/activate`);
  return res.data;
}

export async function deleteHall(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/admin/halls/${id}`);
  return res.data;
}

// 3. Packages Management (CRUD)
export async function getPackagesList(): Promise<Package[]> {
  const res = await apiClient.get<Package[]>('/packages');
  return res.data;
}

export async function createPackage(data: {
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  max_users: number | null;
  max_bookings: number | null;
  features: string[];
}): Promise<{ message: string; data: Package }> {
  const res = await apiClient.post<{ message: string; data: Package }>('/packages', data);
  return res.data;
}

export async function updatePackage(
  id: string,
  data: {
    name?: string;
    price?: number;
    billing_cycle?: 'monthly' | 'yearly';
    max_users?: number | null;
    max_bookings?: number | null;
    features?: string[];
  }
): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/packages/${id}`, data);
  return res.data;
}

export async function deletePackage(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/packages/${id}`);
  return res.data;
}

// 4. Subscriptions Management
export async function renewSubscription(hallId: string, months: number): Promise<{ message: string; new_end_date: string }> {
  const res = await apiClient.put<{ message: string; new_end_date: string }>(
    `/subscriptions/${hallId}/renew`,
    { months }
  );
  return res.data;
}

export async function changePackage(hallId: string, packageId: string): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>(
    `/subscriptions/${hallId}/change-package`,
    { package_id: packageId }
  );
  return res.data;
}

export interface AdminDashboardStats {
  kpis: {
    totalHalls: { value: number; growth: number; trend: 'up' | 'down' };
    activeHalls: { value: number; growth: number; trend: 'up' | 'down' };
    trialHalls: { value: number; growth: number; trend: 'up' | 'down' };
    expiredSubscriptions: { value: number; growth: number; trend: 'up' | 'down' };
    monthlyRevenue: { value: number; growth: number; trend: 'up' | 'down' };
    annualRevenue: { value: number; growth: number; trend: 'up' | 'down' };
    newSignups: { value: number; growth: number; trend: 'up' | 'down' };
    totalUsers: { value: number; growth: number; trend: 'up' | 'down' };
  };
  systemHealth: SystemHealth;
  activities: AdminActivity[];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await apiClient.get<AdminDashboardStats>('/admin/dashboard-stats');
  return res.data;
}

export async function getAdminAnalytics(timePeriod: '30d' | '3m' | '6m' | '1y'): Promise<AdminAnalyticsData> {
  const res = await apiClient.get<AdminAnalyticsData>(`/admin/analytics?timePeriod=${timePeriod}`);
  return res.data;
}

export async function getAdminUsers(): Promise<GlobalUser[]> {
  const res = await apiClient.get<GlobalUser[]>('/admin/users');
  return res.data;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const res = await apiClient.get<AdminSettings>('/admin/settings');
  return res.data;
}

export async function updateAdminSettings(data: AdminSettings): Promise<{ message: string; data: any }> {
  const res = await apiClient.put<{ message: string; data: any }>('/admin/settings', data);
  return res.data;
}

export async function getAdminTickets(): Promise<SupportTicket[]> {
  const res = await apiClient.get<SupportTicket[]>('/admin/tickets');
  return res.data;
}

export async function updateAdminTicketStatus(
  id: string,
  data: { status?: SupportTicket['status']; assignedTo?: string }
): Promise<{ message: string; data: any }> {
  const res = await apiClient.patch<{ message: string; data: any }>(`/admin/tickets/${id}`, data);
  return res.data;
}

export async function addAdminTicketMessage(
  id: string,
  data: { message: string; senderName?: string }
): Promise<{ message: string; data: any }> {
  const res = await apiClient.post<{ message: string; data: any }>(`/admin/tickets/${id}/messages`, data);
  return res.data;
}

export async function toggleAdminUserStatus(id: string, status: 'active' | 'suspended'): Promise<{ message: string; data: any }> {
  const res = await apiClient.patch<{ message: string; data: any }>(`/admin/users/${id}/status`, { status });
  return res.data;
}

export async function resetAdminUserPassword(id: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`);
  return res.data;
}

export interface HallStats {
  bookingsCount: number;
  confirmedBookings: number;
  pendingBookings: number;
  staffCount: number;
  totalRevenue: number;
  pendingBalance: number;
  maxUsers: number | null;
  maxBookings: number | null;
}

export interface HallActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: 'activity' | 'subscription';
}

export async function getHallStats(id: string): Promise<HallStats> {
  const res = await apiClient.get<HallStats>(`/admin/halls/${id}/stats`);
  return res.data;
}

export async function getHallActivity(id: string): Promise<HallActivityItem[]> {
  const res = await apiClient.get<HallActivityItem[]>(`/admin/halls/${id}/activity`);
  return res.data;
}
