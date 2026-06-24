export type CalendarEventType = 'booking' | 'blocked' | 'maintenance' | 'personal' | 'holiday';

export type EventStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export interface CalendarFilters {
  eventTypes: CalendarEventType[];
  status: EventStatus[];
  search: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO DateTime string
  end: string;   // ISO DateTime string
  allDay: boolean;
  type: CalendarEventType;
  
  // Optional booking metadata context
  bookingId?: string;
  eventType?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  hallName?: string;
  hallSection?: string;
  guestCount?: number;
  bookingAmount?: number;
  advanceAmount?: number;
  pendingAmount?: number;
  discountAmount?: number;
  status: EventStatus;
  paymentStatus?: PaymentStatus;
  
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
