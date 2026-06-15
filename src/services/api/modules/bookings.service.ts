import apiClient from '../client';
import { Booking } from '@/types';

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  total_revenue: number;
  total_paid: number;
  total_pending: number;
}

export interface BookingsQuery {
  status?: string;
  from_date?: string;
  to_date?: string;
  customer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingsListResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts: any[];
  message: string;
}

export async function getBookingStats(): Promise<BookingStats> {
  const res = await apiClient.get<BookingStats>('/bookings/stats');
  return res.data;
}

export async function getBookings(params: BookingsQuery = {}): Promise<BookingsListResponse> {
  const res = await apiClient.get<BookingsListResponse>('/bookings', { params });
  return res.data;
}

export async function getBookingById(id: string): Promise<Booking> {
  const res = await apiClient.get<Booking>(`/bookings/${id}`);
  return res.data;
}

export async function createBooking(data: any): Promise<{ message: string; data: Booking }> {
  const res = await apiClient.post<{ message: string; data: Booking }>('/bookings', data);
  return res.data;
}

export async function updateBooking(id: string, data: any): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/bookings/${id}`, data);
  return res.data;
}

export async function cancelBooking(id: string): Promise<{ message: string }> {
  const res = await apiClient.patch<{ message: string }>(`/bookings/${id}/cancel`);
  return res.data;
}

export async function checkAvailability(startDate: string, endDate: string): Promise<AvailabilityResponse> {
  const res = await apiClient.get<AvailabilityResponse>('/bookings/check-availability', {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data;
}

export async function deleteBooking(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/bookings/${id}`);
  return res.data;
}
