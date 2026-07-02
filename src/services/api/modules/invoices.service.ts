import apiClient from '../client';
import { Invoice } from '@/types';

export interface CreateInvoicePayload {
  booking_id: string;
  due_date?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  discount_amount?: number;
  notes?: string;
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<{ message: string; data: Invoice }> {
  const res = await apiClient.post<{ message: string; data: Invoice }>('/invoices', payload);
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

export interface InvoicesResponse {
  data: Invoice[];
  summary: {
    total_invoiced: number;
    total_paid: number;
    total_outstanding: number;
    count: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function getInvoices(params?: {
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}): Promise<InvoicesResponse> {
  const res = await apiClient.get<InvoicesResponse>('/invoices', { params });
  return res.data;
}

export async function deleteInvoice(id: string): Promise<{ message: string; invoice_number: string }> {
  const res = await apiClient.delete<{ message: string; invoice_number: string }>(`/invoices/${id}`);
  return res.data;
}

export async function downloadGstr1Report(fromDate: string, toDate: string): Promise<void> {
  const res = await apiClient.get(`/invoices/export/gstr1`, {
    params: { from_date: fromDate, to_date: toDate },
    responseType: 'blob'
  });
  
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `GSTR1_Report_${fromDate}_to_${toDate}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
