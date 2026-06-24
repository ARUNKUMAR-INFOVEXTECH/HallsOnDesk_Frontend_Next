export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'owner' | 'manager' | 'staff';
  hall_id?: string | null;
  created_at?: string;
  multi_hall_enabled?: boolean;
  different_staff_management?: boolean;
  accessible_halls?: Array<{ id: string; hall_name: string }>;
  status?: 'active' | 'suspended';
  backupPassword?: string;
}

export interface Booking {
  id: string;
  hall_id: string;
  customer_id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  advance_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  customer?: Customer;
  customers?: Customer;
  payments?: Payment[];
}

export interface Customer {
  id: string;
  hall_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  company_name?: string;
  vip_status?: boolean;
}

export interface Payment {
  id: string;
  hall_id: string;
  booking_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque';
  payment_date: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  hall_id: string;
  vendor_name: string;
  service_type: string;
  phone: string;
  email?: string;
  address?: string;
  rate?: number;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  hall_id: string;
  booking_id?: string | null;
  event_title: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  bookings?: {
    id: string;
    event_name: string;
    event_type: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    total_amount: number;
    advance_amount: number;
    customers?: {
      id: string;
      customer_name: string;
      phone: string;
      email?: string;
    };
  } | null;
}

export interface Notification {
  id: string;
  hall_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  entity_type?: string;
  entity_id?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  max_users: number;
  max_bookings: number;
  features: string[];
}

export interface Hall {
  id: string;
  hall_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Enquiry {
  id: string;
  hall_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  event_type: string;
  expected_date: string;
  guest_count: number;
  budget?: number;
  notes?: string;
  status: 'pending' | 'converted' | 'lost';
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  hall_id: string;
  booking_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  hall_name: string;
  hall_phone: string;
  hall_email: string;
  hall_address: string;
  hall_logo_url?: string;
  hall_gstin?: string;
  event_name: string;
  event_type: string;
  event_date: string;
  event_end_date: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  discount_amount: number;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_label: string;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  currency: string;
  currency_symbol: string;
  notes?: string;
  status: 'paid' | 'unpaid' | 'partial';
}

export interface SupportTicketMessage {
  sender: 'admin' | 'user';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  hallId: string;
  hallName?: string;
  subject: string;
  description: string;
  category: 'bug' | 'billing' | 'enquiry' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}
