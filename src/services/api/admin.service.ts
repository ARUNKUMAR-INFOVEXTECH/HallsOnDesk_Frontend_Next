import apiClient from './client';
import { User, Package, Hall } from '@/types';

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
