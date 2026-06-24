'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUpcomingEvents,
} from '@/services/api/modules/calendar.service';
import { getBookings } from '@/services/api/modules/bookings.service';
import { mapBackendToFrontend } from '@/hooks/useBookings';
import { CalendarEvent, CalendarEventType, EventStatus } from '@/types/calendar';

// Helper: Map calendar event color by its category/status
export const getEventColor = (type: CalendarEventType, status?: EventStatus): string => {
  if (type === 'booking') {
    switch (status) {
      case 'confirmed':
        return '#159DFC'; // violet-600
      case 'pending':
        return '#F59E0B'; // amber-500
      case 'cancelled':
        return '#EF4444'; // red-500
      case 'completed':
        return '#10B981'; // green-500
      default:
        return '#159DFC';
    }
  }

  switch (type) {
    case 'blocked':
      return '#6B7280'; // gray-500
    case 'maintenance':
      return '#F97316'; // orange-500
    case 'personal':
      return '#3B82F6'; // blue-500
    case 'holiday':
      return '#10B981'; // emerald-500 (standard success green)
    default:
      return '#159DFC';
  }
};

// Adapter: Map database booking to calendar event object
export const mapBookingToCalendarEvent = (booking: any): CalendarEvent => {
  const hasTime = booking.eventDate && (booking.eventDate.includes('T') || booking.eventDate.includes(' ') || booking.eventDate.includes(':'));
  return {
    id: `booking-${booking.id}`,
    title: `${booking.customerName} - ${booking.eventType}`,
    start: booking.eventDate,
    end: booking.eventEndDate || booking.eventDate,
    allDay: !hasTime,
    type: 'booking',
    bookingId: booking.id,
    eventType: booking.eventType,
    customerId: booking.customerId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    hallName: booking.hallName,
    hallSection: booking.hallSection,
    guestCount: booking.guestCount,
    bookingAmount: booking.bookingAmount,
    advanceAmount: booking.advanceAmount,
    pendingAmount: booking.pendingAmount,
    discountAmount: booking.discountAmount,
    status: booking.status as EventStatus,
    paymentStatus: booking.paymentStatus,
    color: getEventColor('booking', booking.status as EventStatus),
    notes: booking.notes,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

// 1. Fetch Calendar Events list
export function useCalendarEvents(
  dateRange: { start?: string; end?: string } = {},
  filters: { eventTypes?: CalendarEventType[]; status?: EventStatus[] } = {}
) {
  const { eventTypes = [], status = [] } = filters;

  return useQuery<CalendarEvent[], Error>({
    queryKey: ['calendar-events', dateRange, filters],
    queryFn: async () => {
      // Map API params
      const apiParams: any = {
        start: dateRange.start,
        end: dateRange.end,
      };

      const res = await getCalendarEvents(apiParams);

      // Map backend events to frontend interface and attach color properties
      let events: CalendarEvent[] = res.map((item: any) => ({
        id: item.id,
        title: item.event_title || item.title || 'Event',
        start: item.event_date || item.start_date || item.start,
        end: item.end_date || item.end || item.event_date || item.start_date || item.start,
        allDay: item.all_day ?? item.allDay ?? false,
        type: (item.type as CalendarEventType) || 'personal',
        bookingId: item.booking_id || item.bookingId,
        hallSection: item.hall_section || item.hallSection || 'Main Hall',
        status: (item.status as EventStatus) || 'confirmed',
        notes: item.notes || '',
        color: getEventColor((item.type as CalendarEventType) || 'personal', (item.status as EventStatus) || 'confirmed'),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      }));

      // Filter events client-side based on options
      if (eventTypes.length > 0) {
        events = events.filter((e) => eventTypes.includes(e.type));
      }

      if (status.length > 0) {
        events = events.filter((e) => status.includes(e.status));
      }

      return events;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// 2. Fetch specific Calendar Event details
export function useCalendarEvent(id: string) {
  return useQuery<CalendarEvent, Error>({
    queryKey: ['calendar-event', id],
    queryFn: async () => {
      const res = await getCalendarEventById(id) as any;
      return {
        id: res.id,
        title: res.event_title || res.title,
        start: res.event_date || res.start || (res as any).start_date,
        end: res.end_date || res.end || (res as any).end_date || res.event_date || res.start || (res as any).start_date,
        allDay: res.allDay ?? (res as any).all_day ?? false,
        type: res.type || 'personal',
        bookingId: res.bookingId || (res as any).booking_id,
        hallSection: res.hallSection || (res as any).hall_section || 'Main Hall',
        status: res.status || 'confirmed',
        notes: res.notes || '',
        color: getEventColor(res.type, res.status),
        createdAt: res.createdAt || (res as any).created_at,
        updatedAt: res.updatedAt || (res as any).updated_at,
      };
    },
    enabled: !!id && !id.startsWith('booking-'), // Only fetch custom events from calendar endpoint
    staleTime: 30 * 1000,
  });
}

// 3. Create Event Mutation
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      // Map frontend values to database columns
      const backendPayload = {
        event_title: payload.title,
        event_date: payload.start,
        end_date: payload.end || payload.start,
        all_day: payload.allDay ?? false,
        type: payload.type || 'personal',
        booking_id: payload.bookingId || null,
        hall_section: 'Main Hall',
        notes: payload.notes || '',
        status: payload.status || 'confirmed',
        guest_count: payload.guestCount || null,
      };
      return createCalendarEvent(backendPayload);
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to create calendar event.';
      toast.error(errMsg);
    },
  });
}

// 4. Update Event Mutation
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const backendPayload = {
        event_title: data.title,
        event_date: data.start,
        end_date: data.end || data.start,
        all_day: data.allDay ?? false,
        type: data.type || 'personal',
        booking_id: data.bookingId || null,
        hall_section: 'Main Hall',
        notes: data.notes || '',
        status: data.status || 'confirmed',
        guest_count: data.guestCount || null,
      };
      return updateCalendarEvent(id, backendPayload);
    },
    onSuccess: (_, variables) => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-event', variables.id] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to reschedule event.';
      toast.error(errMsg);
    },
  });
}

// 5. Delete Event Mutation
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to delete event.';
      toast.error(errMsg);
    },
  });
}

// 6. Fetch bookings to sync client-side into calendar events
export function useBookingsForCalendar() {
  return useQuery<CalendarEvent[], Error>({
    queryKey: ['bookings', 'calendar-sync'],
    queryFn: async () => {
      const res = await getBookings({ limit: 1000 });
      const frontendBookings = res.data.map(mapBackendToFrontend);
      return frontendBookings.map(mapBookingToCalendarEvent);
    },
    staleTime: 60 * 1000,
  });
}

// 7. Fetch upcoming events
export function useUpcomingEvents(days: number = 30) {
  return useQuery<CalendarEvent[], Error>({
    queryKey: ['upcoming-events', days],
    queryFn: async () => {
      const res = await getUpcomingEvents(days);
      // Map event objects safely
      return (res.data || []).map((item: any) => ({
        id: item.id,
        title: item.event_title || item.title || 'Event',
        start: item.event_date || item.start_date || item.start,
        end: item.end_date || item.end || item.event_date || item.start_date || item.start,
        allDay: item.all_day ?? item.allDay ?? false,
        type: (item.type as CalendarEventType) || 'personal',
        bookingId: item.booking_id || item.bookingId,
        hallSection: item.hall_section || item.hallSection || 'Main Hall',
        status: (item.status as EventStatus) || 'confirmed',
        notes: item.notes || '',
        color: getEventColor((item.type as CalendarEventType) || 'personal', (item.status as EventStatus) || 'confirmed'),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      }));
    },
    staleTime: 30 * 1000,
  });
}
