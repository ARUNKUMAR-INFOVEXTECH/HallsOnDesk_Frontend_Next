import apiClient from '../client';
import { SubscriptionPayment } from '@/types/settings';

export interface SubmitPaymentInput {
  package_id: string;
  amount: number;
  payment_method: 'upi' | 'bank_transfer';
  transaction_ref_no: string;
  notes?: string;
}

export async function submitSubscriptionPayment(data: SubmitPaymentInput): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/subscriptions/pay', data);
  return res.data;
}

export async function getSubscriptionPaymentsHistory(): Promise<SubscriptionPayment[]> {
  const res = await apiClient.get<SubscriptionPayment[]>('/subscriptions/payments/history');
  return res.data;
}

export async function getSubscriptionPaymentInvoiceHtml(id: string): Promise<string> {
  const res = await apiClient.get<string>(`/subscriptions/payments/${id}/html`);
  return res.data;
}
