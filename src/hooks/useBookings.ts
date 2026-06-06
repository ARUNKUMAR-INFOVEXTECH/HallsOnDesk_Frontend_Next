'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  checkAvailability,
  BookingsQuery,
} from '@/services/api/modules/bookings.service';
import { Booking as FrontendBooking, BookingStatus, PaymentStatus } from '@/types/booking';
import { Booking as BackendBooking } from '@/types';
import { BookingFormValues } from '@/schemas/booking.schema';

// ----------------------------------------------------
// 1. DATA MAPPERS (Backend <-> Frontend Adapter Layer)
// ----------------------------------------------------

export const mapBackendToFrontend = (b: BackendBooking): FrontendBooking => {
  // Sum up payment records to calculate paid vs pending
  const totalPaid = b.paid_amount || b.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const pending = Math.max(0, (b.total_amount || 0) - totalPaid);
  
  // Cast statuses safely
  const status: BookingStatus = (b.status as BookingStatus) || 'pending';
  const paymentStatus: PaymentStatus =
    totalPaid >= (b.total_amount || 0) ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';

  // Extract nested customer parameters
  const cust = b.customer || b.customers;
  const customerName = cust?.customer_name || 'Guest';
  const customerPhone = cust?.phone || '';
  const customerEmail = cust?.email || '';

  // Access extra properties safely from backend columns if they exist, or mock them
  const anyB = b as any;
  const hallName = anyB.hall_name || 'Raj Mahal Palace';
  const hallSection = anyB.hall_section || b.event_name?.split(' - ')[0] || 'Main Hall';
  const guestCount = anyB.guest_count || 150;
  const discountAmount = anyB.discount_amount || 0;
  const bookingAmount = (b.total_amount || 0) + discountAmount;
  const advanceAmount = b.advance_amount || 0;

  return {
    id: b.id,
    bookingNumber: anyB.booking_number || `BKG-${b.id.slice(0, 8).toUpperCase()}`,
    customerId: b.customer_id,
    customerName,
    customerPhone,
    customerEmail,
    eventType: b.event_type || 'Wedding',
    eventDate: b.start_date,
    eventEndDate: b.end_date || b.start_date,
    hallName,
    hallSection,
    guestCount,
    bookingAmount,
    advanceAmount,
    pendingAmount: pending,
    discountAmount,
    status,
    paymentStatus,
    notes: b.notes || '',
    createdAt: anyB.created_at || new Date().toISOString(),
    updatedAt: anyB.updated_at || new Date().toISOString(),
  };
};

export const mapFrontendToBackend = (data: BookingFormValues) => {
  return {
    customer_id: data.customerId,
    event_type: data.eventType,
    event_name: `${data.hallSection} - ${data.eventType}`,
    start_date: data.eventDate,
    end_date: data.eventEndDate || data.eventDate,
    // total_amount inside database corresponds to net billing amount
    total_amount: data.bookingAmount - (data.discountAmount || 0),
    advance_amount: data.advanceAmount || 0,
    status: data.status,
    notes: data.notes || '',
    // Include custom fields as properties the database saves/accepts
    hall_section: data.hallSection,
    guest_count: data.guestCount,
    discount_amount: data.discountAmount || 0,
  };
};

// ----------------------------------------------------
// 2. QUERY & MUTATION HOOKS
// ----------------------------------------------------

interface FilterParams extends BookingsQuery {
  search?: string;
}

export function useBookings(params: FilterParams = {}) {
  const { search, status, from_date, to_date, page, limit } = params;

  return useQuery<FrontendBooking[], Error>({
    queryKey: ['bookings', params],
    queryFn: async () => {
      // Fetch list from backend API
      const res = await getBookings({
        status,
        from_date,
        to_date,
        page,
        limit,
      });

      // Map snake_case backend items to camelCase frontend model
      let mapped = res.data.map(mapBackendToFrontend);

      // Support client-side search logic
      if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        mapped = mapped.filter((b) => {
          return (
            b.bookingNumber.toLowerCase().includes(query) ||
            b.customerName.toLowerCase().includes(query) ||
            b.customerPhone.toLowerCase().includes(query) ||
            b.customerEmail.toLowerCase().includes(query) ||
            b.eventType.toLowerCase().includes(query) ||
            b.hallSection.toLowerCase().includes(query)
          );
        });
      }

      return mapped;
    },
    staleTime: 30 * 1000, // 30 seconds cache validity
  });
}

export function useBooking(id: string) {
  return useQuery<FrontendBooking, Error>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await getBookingById(id);
      return mapBackendToFrontend(res);
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 60 seconds
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const backendPayload = mapFrontendToBackend(data);
      return createBooking(backendPayload);
    },
    onSuccess: (res) => {
      toast.success('Booking created successfully!', {
        description: `Booking #${res.data.id.slice(0, 8).toUpperCase()} has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BookingFormValues }) => {
      const backendPayload = mapFrontendToBackend(data);
      return updateBooking(id, backendPayload);
    },
    onSuccess: (_, variables) => {
      toast.success('Booking updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to save updates. Please try again.';
      toast.error(errMsg);
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      toast.success('Booking deleted');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to delete booking.';
      toast.error(errMsg);
    },
  });
}
