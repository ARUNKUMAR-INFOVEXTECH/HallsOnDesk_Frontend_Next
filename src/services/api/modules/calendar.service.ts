import apiClient from '../client';
import { CalendarEvent } from '@/types';

export interface UpcomingEventsResponse {
  data: CalendarEvent[];
  days_ahead: number;
}

// 1. Fetch calendar events by date ranges or filter criteria
export async function getCalendarEvents(params: {
  start?: string;
  end?: string;
  type?: string;
  status?: string;
  year?: number;
  month?: number;
} = {}): Promise<CalendarEvent[]> {
  const res = await apiClient.get<CalendarEvent[]>('/calendar/events', { params });
  return res.data;
}

// 2. Fetch specific event details by ID
export async function getCalendarEventById(id: string): Promise<CalendarEvent> {
  const res = await apiClient.get<CalendarEvent>(`/calendar/events/${id}`);
  return res.data;
}

// 3. Create a new calendar event
export async function createCalendarEvent(data: any): Promise<{ message: string; data: CalendarEvent }> {
  const res = await apiClient.post<{ message: string; data: CalendarEvent }>('/calendar/events', data);
  return res.data;
}

// 4. Update an existing calendar event
export async function updateCalendarEvent(id: string, data: any): Promise<{ message: string; data: CalendarEvent }> {
  const res = await apiClient.put<{ message: string; data: CalendarEvent }>(`/calendar/events/${id}`, data);
  return res.data;
}

// 5. Delete a calendar event
export async function deleteCalendarEvent(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/calendar/events/${id}`);
  return res.data;
}

// Legacy creation wrapper to support existing calls if any
export async function createEvent(data: {
  event_title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  booking_id?: string | null;
}): Promise<{ message: string; data: CalendarEvent }> {
  return createCalendarEvent({
    title: data.event_title,
    start: `${data.event_date}T${data.start_time}`,
    end: `${data.event_date}T${data.end_time}`,
    bookingId: data.booking_id || undefined,
    type: data.booking_id ? 'booking' : 'blocked',
  });
}

// Fetch upcoming events log
export async function getUpcomingEvents(days: number = 30): Promise<UpcomingEventsResponse> {
  const res = await apiClient.get<UpcomingEventsResponse>('/calendar/upcoming', {
    params: { days },
  });
  return res.data;
}
