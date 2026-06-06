import apiClient from '../client';
import { Payment } from '@/types';

export interface PaymentStats {
  total_revenue: number;
  total_paid: number;
  total_pending: number;
  collection_rate: number;
}

export interface PaymentsQuery {
  page?: number;
  limit?: number;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  status?: string;
  booking_id?: string;
}

export interface PaymentsListResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreatePaymentResponse {
  message: string;
  data: Payment;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount_paid: number;
  balance_due: number;
}

export async function createPayment(data: {
  booking_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
  payment_date: string;
  notes?: string;
}): Promise<CreatePaymentResponse> {
  const res = await apiClient.post<CreatePaymentResponse>('/payments', data);
  return res.data;
}

export async function deletePayment(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/payments/${id}`);
  return res.data;
}

export async function getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
  const res = await apiClient.get<Payment[]>(`/payments/booking/${bookingId}`);
  return res.data;
}

export async function getPaymentStats(params: { from_date?: string; to_date?: string } = {}): Promise<PaymentStats> {
  const res = await apiClient.get<PaymentStats>('/payments/stats', { params });
  return res.data;
}

export async function getPaymentsList(params: PaymentsQuery = {}): Promise<PaymentsListResponse> {
  const res = await apiClient.get<PaymentsListResponse>('/payments', { params });
  return res.data;
}
