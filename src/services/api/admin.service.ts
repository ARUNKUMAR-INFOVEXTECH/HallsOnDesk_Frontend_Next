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
import { SubscriptionPayment } from '@/types/settings';

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
      setup_fee?: number;
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
      setup_fee?: number;
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
  setup_fee_amount?: number;
  amount_paid?: number;
  setup_fee_status?: 'unpaid' | 'partially_paid' | 'paid';
  payment_method?: 'upi' | 'bank_transfer' | 'cash' | 'offline' | 'none';
  transaction_ref_no?: string;
  notes?: string;
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
  setup_fee?: number;
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
    setup_fee?: number;
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

export async function getPendingSubscriptionPayments(): Promise<SubscriptionPayment[]> {
  const res = await apiClient.get<SubscriptionPayment[]>('/admin/billing/pending');
  return res.data;
}

export async function verifySubscriptionPayment(
  id: string,
  data: { action: 'approve' | 'reject'; rejection_reason?: string }
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(`/admin/billing/${id}/verify`, data);
  return res.data;
}

export async function sendTestEmail(email: string): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.post<{ success: boolean; message: string }>('/admin/billing/test-email', { email });
  return res.data;
}

export async function getHallSubscriptionPayments(id: string): Promise<SubscriptionPayment[]> {
  const res = await apiClient.get<SubscriptionPayment[]>(`/admin/halls/${id}/payments`);
  return res.data;
}

export async function recordManualSubscriptionPayment(
  id: string,
  data: {
    package_id: string;
    amount: number;
    payment_method?: string;
    transaction_ref_no?: string;
    notes?: string;
    tax_enabled?: boolean;
  }
): Promise<{ message: string; data: SubscriptionPayment }> {
  const res = await apiClient.post<{ message: string; data: SubscriptionPayment }>(`/admin/halls/${id}/payments`, data);
  return res.data;
}

export async function getAdminSubscriptionInvoiceHtml(id: string): Promise<string> {
  const res = await apiClient.get<string>(`/admin/billing/payments/${id}/html`);
  return res.data;
}

export interface SetupFeePayment {
  id: string;
  hall_id: string;
  package_id: string;
  setup_fee_amount: number;
  amount_paid: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  due_date: string;
  payment_method: 'upi' | 'bank_transfer' | 'cash' | 'offline' | 'none';
  transaction_ref_no?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  marriage_halls?: {
    hall_name: string;
  };
  packages?: {
    name: string;
  };
}

export interface CustomInvoiceData {
  hallId: string;
  billToName: string;
  billToPhone?: string;
  billToEmail?: string;
  billToAddress?: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNo?: string;
  taxEnabled: boolean;
  taxPercentage: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
  notes?: string;
  amountPaid?: number;
  balanceDue?: number;
}

export async function getSetupFeePayments(): Promise<SetupFeePayment[]> {
  const res = await apiClient.get<SetupFeePayment[]>('/admin/setup-fee-payments');
  return res.data;
}

export async function updateSetupFeePayment(
  id: string,
  data: {
    amount_paid: number;
    payment_method: string;
    transaction_ref_no?: string;
    notes?: string;
  }
): Promise<{ message: string; data: SetupFeePayment }> {
  const res = await apiClient.put<{ message: string; data: SetupFeePayment }>(`/admin/setup-fee-payments/${id}`, data);
  return res.data;
}

export async function generateCustomInvoice(data: CustomInvoiceData): Promise<string> {
  const payload = {
    hall_id: data.hallId,
    invoice_no: data.invoiceNo || undefined,
    invoice_date: data.invoiceDate,
    tax_enabled: data.taxEnabled,
    notes: data.notes || undefined,
    items: data.items.map(item => ({
      description: item.description,
      qty: item.quantity,
      rate: item.rate
    }))
  };
  const res = await apiClient.post<string>('/admin/generate-custom-invoice', payload);
  return res.data;
}

export async function changeAdminUserPassword(userId: string, password: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(`/admin/users/${userId}/change-password`, { password });
  return res.data;
}

export async function adjustSubscription(
  subscriptionId: string,
  data: { end_date?: string; grace_days?: number; status?: string }
): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/admin/subscriptions/${subscriptionId}/adjust`, data);
  return res.data;
}


