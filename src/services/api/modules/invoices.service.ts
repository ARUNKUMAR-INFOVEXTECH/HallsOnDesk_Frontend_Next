import apiClient from '../client';
import { Invoice } from '@/types';

export async function createInvoice(bookingId: string): Promise<{ message: string; data: Invoice }> {
  const res = await apiClient.post<{ message: string; data: Invoice }>('/invoices', { booking_id: bookingId });
  return res.data;
}

export async function getInvoiceByBooking(bookingId: string): Promise<Invoice> {
  const res = await apiClient.get<Invoice>(`/invoices/booking/${bookingId}`);
  return res.data;
}

export async function getInvoiceHtml(id: string): Promise<string> {
  const res = await apiClient.get<string>(`/invoices/${id}/html`);
  return res.data;
}

export async function getReceiptHtml(paymentId: string): Promise<string> {
  const res = await apiClient.get<string>(`/invoices/receipt/${paymentId}`);
  return res.data;
}
