export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: string;
  eventEndDate: string;
  hallName: string;
  hallSection: string;
  guestCount: number;
  bookingAmount: number;
  advanceAmount: number;
  pendingAmount: number;
  discountAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  createdAt: string;
  updatedAt: string;
  taxEnabled?: boolean;
  taxPercentage?: number;
  taxAmount?: number;
  subtotal?: number;
}
