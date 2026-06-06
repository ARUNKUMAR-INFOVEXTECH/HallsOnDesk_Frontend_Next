import apiClient from '../client';
import { Payment, Booking, Enquiry, Notification } from '@/types';

export interface DashboardSummary {
  total_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_customers: number;
}

export interface DashboardRevenue {
  total_revenue: number;
  total_collected: number;
  total_pending: number;
  this_month: number;
}

export interface DashboardSubscription {
  status: string;
  end_date: string;
  days_until_expiry: number | null;
  plan: string;
  max_users: number;
  max_bookings: number;
}

export interface UpcomingEvent {
  id: string;
  event_title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  bookings?: {
    event_name: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    customers?: {
      customer_name: string;
      phone: string;
    };
  };
}

export interface RecentBooking {
  id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  customers?: {
    customer_name: string;
    phone: string;
  };
}

export interface DashboardResponse {
  summary: DashboardSummary;
  revenue: DashboardRevenue;
  upcoming_events: UpcomingEvent[];
  recent_bookings: RecentBooking[];
  subscription: DashboardSubscription | null;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface BookingTrendPoint {
  month: string;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface Followup {
  id: string;
  customer_name: string;
  phone: string;
  followup_date: string;
  notes?: string;
  status: 'pending' | 'completed';
}

// 1. Primary Dashboard data
export async function getDashboardData(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/dashboard');
  return response.data;
}

// 2. Revenue Overview details
export async function getRevenueSummary(filter: string = '30days'): Promise<RevenueDataPoint[]> {
  const response = await apiClient.get<RevenueDataPoint[]>('/dashboard/revenue-summary', {
    params: { range: filter }
  });
  return response.data;
}

// 3. Monthly Booking counts
export async function getMonthlyBookings(): Promise<BookingTrendPoint[]> {
  const response = await apiClient.get<BookingTrendPoint[]>('/dashboard/monthly-bookings');
  return response.data;
}

// 4. Upcoming Bookings
export async function getUpcomingBookings(): Promise<UpcomingEvent[]> {
  const response = await apiClient.get<UpcomingEvent[]>('/dashboard/upcoming-bookings');
  return response.data;
}

// 5. Recent Payments List
export async function getRecentPayments(): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>('/dashboard/recent-payments');
  return response.data;
}

// 6. Enquiries Directory List
export async function getEnquiries(): Promise<Enquiry[]> {
  const response = await apiClient.get<Enquiry[]>('/enquiries');
  return response.data;
}

// 7. Today's Enquiries Followups
export async function getTodayFollowups(): Promise<Followup[]> {
  try {
    const response = await apiClient.get<Followup[]>('/enquiries/followups/today');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch today followups for dashboard. Safe-falling back to empty array.', error);
    return [];
  }
}

// 8. Unread Notifications Count
export async function getNotificationsUnreadCount(): Promise<{ unread: number }> {
  const response = await apiClient.get<{ unread: number }>('/notifications/unread-count');
  return response.data;
}

// 9. Subscription Health
export async function getSubscriptions(): Promise<DashboardSubscription[]> {
  const response = await apiClient.get<DashboardSubscription[]>('/subscriptions');
  return response.data;
}
