'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getInvoiceByBooking,
  createInvoice,
  getInvoices,
  InvoicesResponse,
  deleteInvoice,
} from '@/services/api/modules/invoices.service';
import { Invoice } from '@/types';

// 0. Fetch list of invoices
export function useInvoices(params?: {
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<InvoicesResponse, Error>({
    queryKey: ['invoices', 'list', params],
    queryFn: () => getInvoices(params),
  });
}

// 1. Fetch invoice associated with a booking
export function useInvoiceByBooking(bookingId: string) {
  return useQuery<Invoice, Error>({
    queryKey: ['invoices', 'booking', bookingId],
    queryFn: async () => {
      // It's possible for booking invoice to not exist (returns 404 or empty)
      // The API client or backend returns empty/error, we should handle gracefully
      return getInvoiceByBooking(bookingId);
    },
    enabled: !!bookingId,
    retry: false, // Don't retry if not found
    staleTime: 60 * 1000,
  });
}

// 2. Generate a new invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => createInvoice(bookingId),
    onSuccess: (res, bookingId) => {
      toast.success('Invoice generated successfully!', {
        description: `Invoice #${res.data.invoice_number} is ready.`,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to generate invoice.';
      toast.error(errMsg);
    },
  });
}

// 3. Delete an invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: (res) => {
      toast.success('Invoice deleted successfully!', {
        description: `Invoice #${res.invoice_number} has been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to delete invoice.';
      toast.error(errMsg);
    },
  });
}
