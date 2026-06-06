export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card' | 'other';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  paymentDate: string;
  status: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingAmount: number;
  totalTransactions: number;
  averagePayment: number;
  collectionRate: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  transactions: number;
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}
