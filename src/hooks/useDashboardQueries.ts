'use client';

import { useQuery } from '@tanstack/react-query';
import { Payment } from '@/types';
import {
  getDashboardData,
  getRevenueSummary,
  getMonthlyBookings,
  getUpcomingBookings,
  getRecentPayments,
  getTodayFollowups,
  getNotificationsUnreadCount,
  getSubscriptions,
  DashboardResponse,
  RevenueDataPoint,
  BookingTrendPoint,
  UpcomingEvent,
  Followup,
  DashboardSubscription,
} from '@/services/api/modules/dashboard.service';

// 1. Core Summary metrics query
export function useDashboardQuery() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardData,
    staleTime: 2 * 60 * 1000,
  });
}

// 2. Revenue chart history query
export function useRevenueQuery(filter: string) {
  return useQuery<RevenueDataPoint[], Error>({
    queryKey: ['dashboard', 'revenue', filter],
    queryFn: () => getRevenueSummary(filter),
    staleTime: 5 * 60 * 1000,
  });
}

// 3. Monthly bookings trends query
export function useBookingTrendsQuery() {
  return useQuery<BookingTrendPoint[], Error>({
    queryKey: ['dashboard', 'booking-trends'],
    queryFn: getMonthlyBookings,
    staleTime: 5 * 60 * 1000,
  });
}

// 4. Upcoming events schedule query
export function useUpcomingBookingsQuery() {
  return useQuery<UpcomingEvent[], Error>({
    queryKey: ['dashboard', 'upcoming-bookings'],
    queryFn: getUpcomingBookings,
    staleTime: 1 * 60 * 1000,
  });
}

// 5. Recent payments lists query
export function useRecentPaymentsQuery() {
  return useQuery<Payment[], Error>({
    queryKey: ['dashboard', 'recent-payments'],
    queryFn: getRecentPayments,
    staleTime: 30 * 1000,
  });
}

// 6. Today's follow-up logs query
export function useFollowupsQuery() {
  return useQuery<Followup[], Error>({
    queryKey: ['dashboard', 'followups-today'],
    queryFn: getTodayFollowups,
    staleTime: 1 * 60 * 1000,
  });
}

// 7. Notifications count query
export function useUnreadNotificationsQuery() {
  return useQuery<{ unread: number }, Error>({
    queryKey: ['dashboard', 'notifications-unread'],
    queryFn: getNotificationsUnreadCount,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
}

// 8. Subscription status checks query
export function useSubscriptionQuery() {
  return useQuery<DashboardSubscription[], Error>({
    queryKey: ['dashboard', 'subscriptions'],
    queryFn: getSubscriptions,
    staleTime: 10 * 60 * 1000,
  });
}
