export interface HallSection {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  isActive: boolean;
}

export interface HallProfile {
  id: string;
  hallName: string;
  ownerName: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  description?: string;
  establishedYear?: number;
  totalCapacity?: number;
  hallSections: HallSection[];
  logoUrl?: string;
  coverImageUrl?: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GstApplicableOn = 'all' | 'bookings_only' | 'custom';

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  newBookingAlert: boolean;
  paymentReceivedAlert: boolean;
  enquiryAlert: boolean;
  followupReminder: boolean;
  bookingReminderDaysBefore: number;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
}

export interface BookingSettings {
  requireAdvancePayment: boolean;
  minimumAdvancePercent: number;
  allowDoubleBooking: boolean;
  bookingCancellationHours: number;
  defaultBookingDurationHours: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
}

export interface HallSettings {
  id: string;
  hallId: string;
  invoicePrefix: string;
  bookingPrefix: string;
  receiptPrefix: string;
  invoiceStartNumber: number;
  bookingStartNumber: number;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  taxEnabled: boolean;
  gstRate: number;
  gstNumber?: string;
  gstApplicableOn: GstApplicableOn;
  autoInvoice: boolean;
  invoiceFooterNote: string;
  termsAndConditions: string;
  notifications: NotificationSettings;
  bookingSettings: BookingSettings;
  updatedAt: string;
}
