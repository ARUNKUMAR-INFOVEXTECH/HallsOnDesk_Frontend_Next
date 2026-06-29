'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPaymentsList,
  getPaymentsByBooking,
  getPaymentStats,
  createPayment,
  deletePayment,
  PaymentsQuery,
} from '@/services/api/modules/payments.service';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentSummary,
  RevenueChartData,
  PaymentMethodStats,
} from '@/types/payment';

// ----------------------------------------------------------------------
// Adapter Mapper: Safeguard database snake_case columns & relations
// ----------------------------------------------------------------------
export const mapBackendPaymentToFrontend = (p: any): Payment => {
  const booking = p.booking || p.bookings || {};
  const customer = p.customer || booking.customer || booking.customers || {};

  const bookingNumber =
    p.booking_number ||
    p.bookingNumber ||
    booking.booking_number ||
    (booking.id ? `BKG-${booking.id.slice(0, 8).toUpperCase()}` : '—');

  const customerName =
    p.customer_name ||
    p.customerName ||
    customer.customer_name ||
    customer.customerName ||
    booking.customerName ||
    'Guest';

  const customerPhone =
    p.customer_phone ||
    p.customerPhone ||
    customer.phone ||
    booking.customerPhone ||
    '—';

  const eventType =
    p.event_type ||
    p.eventType ||
    booking.event_type ||
    booking.eventType ||
    'Event';

  const eventDate =
    p.event_date ||
    p.eventDate ||
    booking.start_date ||
    booking.eventDate ||
    '—';

  const referenceNumber =
    p.reference_number ||
    p.referenceNumber ||
    p.ref_no ||
    '—';

  const status = p.status || 'completed';

  return {
    id: p.id,
    bookingId: p.booking_id || p.bookingId || booking.id || '',
    customerId: p.customer_id || p.customerId || customer.id || '',
    customerName,
    customerPhone,
    bookingNumber,
    eventType,
    eventDate,
    amount: p.amount || 0,
    paymentMethod: (p.payment_method || p.paymentMethod || 'cash') as PaymentMethod,
    referenceNumber,
    paymentDate: p.payment_date || p.paymentDate || new Date().toISOString(),
    status: status as PaymentStatus,
    notes: p.notes || '',
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
  };
};

// 1. Fetch payments list with optional search, method, and date filters
export function usePayments(params: {
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  bookingId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryParams: PaymentsQuery = {
    page: params.page,
    limit: params.limit,
    payment_method: params.method === 'all' || !params.method ? undefined : params.method,
    from_date: params.startDate || undefined,
    to_date: params.endDate || undefined,
    search: params.search || undefined,
    status: params.status === 'all' || !params.status ? undefined : params.status,
    booking_id: params.bookingId || undefined,
  };

  return useQuery<{ data: Payment[]; total: number }, Error>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const res = await getPaymentsList(queryParams);
      const mappedData = (res.data || []).map(mapBackendPaymentToFrontend);

      return {
        data: mappedData,
        total: res.meta?.total ?? mappedData.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// 2. Fetch payments list associated with a specific booking reference
export function usePaymentsByBooking(bookingId: string) {
  return useQuery<Payment[], Error>({
    queryKey: ['payments', 'booking', bookingId],
    queryFn: async () => {
      const res = await getPaymentsByBooking(bookingId);
      const paymentsArray = Array.isArray(res) ? res : (res as any)?.payments || [];
      return paymentsArray.map(mapBackendPaymentToFrontend);
    },
    enabled: !!bookingId,
    staleTime: 30 * 1000,
  });
}

// 3. Transform response payments list to construct PaymentSummary data
export function usePaymentSummary() {
  return useQuery<PaymentSummary, Error>({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const res = await getPaymentsList({ limit: 1000 });
      const payments = (res.data || []).map(mapBackendPaymentToFrontend);

      let pendingAmount = 0;
      let collectionRate = 0;

      try {
        const stats = await getPaymentStats();
        pendingAmount = stats.total_pending || 0;
        collectionRate = Math.round(stats.collection_rate * 100) || 0;
      } catch (err) {
        console.error('Failed to retrieve payments stats:', err);
      }

      // Sum completed payments
      const completed = payments.filter((p) => p.status === 'completed');
      const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

      // Sum monthly revenues
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      const thisMonthPayments = completed.filter((p) => {
        const pDate = new Date(p.paymentDate);
        return pDate.getFullYear() === curYear && pDate.getMonth() === curMonth;
      });
      const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

      const totalTransactions = payments.length;
      const averagePayment = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Estimate collection rate fallback if not provided
      if (collectionRate === 0 && totalRevenue > 0) {
        collectionRate = Math.round((totalRevenue / (totalRevenue + pendingAmount)) * 100);
      }

      return {
        totalRevenue,
        thisMonthRevenue,
        pendingAmount,
        totalTransactions,
        averagePayment,
        collectionRate,
      };
    },
    staleTime: 60 * 1000, // 60 seconds
  });
}

// 4. Transform payments list grouped by months for Recharts bar chart
export function useRevenueChart(period: '6M' | '1Y' | 'All') {
  return useQuery<RevenueChartData[], Error>({
    queryKey: ['revenue-chart', period],
    queryFn: async () => {
      const res = await getPaymentsList({ limit: 1000 });
      const payments = (res.data || []).map(mapBackendPaymentToFrontend);
      const completed = payments.filter((p) => p.status === 'completed');

      // Sort chronological ascending
      completed.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

      const cutoff = new Date();
      if (period === '6M') {
        cutoff.setMonth(cutoff.getMonth() - 6);
      } else if (period === '1Y') {
        cutoff.setMonth(cutoff.getMonth() - 12);
      } else {
        cutoff.setFullYear(cutoff.getFullYear() - 10);
      }

      const filtered = completed.filter((p) => new Date(p.paymentDate) >= cutoff);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const grouped: Record<string, { revenue: number; transactions: number; sortKey: string }> = {};

      filtered.forEach((p) => {
        const d = new Date(p.paymentDate);
        const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (!grouped[label]) {
          grouped[label] = { revenue: 0, transactions: 0, sortKey };
        }
        grouped[label].revenue += p.amount;
        grouped[label].transactions += 1;
      });

      return Object.entries(grouped)
        .map(([month, val]) => ({
          month,
          revenue: val.revenue,
          transactions: val.transactions,
          sortKey: val.sortKey,
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ month, revenue, transactions }) => ({
          month,
          revenue,
          transactions,
        }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 5. Transform payments list grouped by method for Recharts Pie/Donut Chart
export function usePaymentMethodStats() {
  return useQuery<PaymentMethodStats[], Error>({
    queryKey: ['payment-method-stats'],
    queryFn: async () => {
      const res = await getPaymentsList({ limit: 1000 });
      const payments = (res.data || []).map(mapBackendPaymentToFrontend);
      const completed = payments.filter((p) => p.status === 'completed');

      const methods: Record<string, { count: number; amount: number }> = {
        cash: { count: 0, amount: 0 },
        upi: { count: 0, amount: 0 },
        bank_transfer: { count: 0, amount: 0 },
        cheque: { count: 0, amount: 0 },
        card: { count: 0, amount: 0 },
        other: { count: 0, amount: 0 },
      };

      let totalAmount = 0;

      completed.forEach((p) => {
        const method = p.paymentMethod;
        if (methods[method]) {
          methods[method].count += 1;
          methods[method].amount += p.amount;
          totalAmount += p.amount;
        }
      });

      return Object.entries(methods)
        .map(([method, val]) => ({
          method: method as PaymentMethod,
          count: val.count,
          amount: val.amount,
          percentage: totalAmount > 0 ? Math.round((val.amount / totalAmount) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 6. Record/log payment mutation
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      bookingId?: string;
      booking_id?: string;
      amount: number;
      paymentMethod?: PaymentMethod;
      payment_method?: PaymentMethod;
      paymentDate?: string;
      payment_date?: string;
      referenceNumber?: string;
      reference_number?: string;
      notes?: string;
    }) => {
      const bId = payload.bookingId || payload.booking_id || '';
      const method = payload.paymentMethod || payload.payment_method || 'cash';
      const date = payload.paymentDate || payload.payment_date || new Date().toISOString().substring(0, 10);
      const refNum = payload.referenceNumber || payload.reference_number || undefined;

      // Map frontend payload to database columns
      const backendPayload = {
        booking_id: bId,
        amount: payload.amount,
        payment_method: method,
        payment_date: date,
        reference_number: refNum || null,
        notes: payload.notes || '',
      };
      return createPayment(backendPayload);
    },
    onSuccess: (res, variables) => {
      const bId = variables.bookingId || variables.booking_id;
      
      toast.success('Payment recorded successfully!', {
        description: `Logged payment of ₹${variables.amount.toLocaleString('en-IN')}.`,
      });

      // Invalidate target query states
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-chart'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      if (bId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'booking', bId] });
        queryClient.invalidateQueries({ queryKey: ['booking', bId] });
      }
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to log payment transaction.';
      toast.error(errMsg);
    },
  });
}

// 7. Delete / reverse payment mutation
export function useDeletePayment(bookingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success('Payment deleted successfully.');
      
      // Invalidate target caches
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-chart'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'booking', bookingId] });
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      }
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to delete payment.';
      toast.error(errMsg);
    },
  });
}
