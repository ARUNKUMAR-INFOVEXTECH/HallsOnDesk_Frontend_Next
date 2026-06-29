import * as z from 'zod';

const currentYear = new Date().getFullYear();

// Common Validation Patterns
const phoneRegex = /^[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

export const hallSectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Space name must be at least 2 characters'),
  capacity: z.preprocess((val) => Number(val), z.number().min(1, 'Capacity must be at least 1')),
  description: z.string().max(200, 'Description max 200 characters').optional(),
  isActive: z.boolean().default(true),
});

export const hallProfileSchema = z.object({
  hallName: z.string().min(2, 'Hall name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian phone number'),
  alternatePhone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian phone number').or(z.literal('')).nullable().optional(),
  email: z.string().email('Enter a valid email address'),
  website: z.string().url('Enter a valid URL (include http:// or https://)').or(z.literal('')).nullable().optional(),
  address: z.string().min(5, 'Enter a complete address'),
  city: z.string().min(2, 'City name is required'),
  state: z.string().min(2, 'State name is required'),
  pincode: z.string().regex(pincodeRegex, 'Enter a valid 6-digit PIN code'),
  country: z.string().default('India'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').nullable().optional(),
  establishedYear: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1900, 'Year must be after 1900').max(currentYear, 'Year cannot be in the future').nullable().optional()
  ),
  totalCapacity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1, 'Capacity must be at least 1').nullable().optional()
  ),
  gstNumber: z.string().regex(gstRegex, 'Enter a valid 15-digit GST number').or(z.literal('')).nullable().optional(),
  panNumber: z.string().regex(panRegex, 'Enter a valid 10-digit PAN number').or(z.literal('')).nullable().optional(),
  bankName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  ifscCode: z.string().regex(ifscRegex, 'Enter a valid 11-digit IFSC code').or(z.literal('')).nullable().optional(),
  upiId: z.string().nullable().optional(),
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  newBookingAlert: z.boolean(),
  paymentReceivedAlert: z.boolean(),
  enquiryAlert: z.boolean(),
  followupReminder: z.boolean(),
  bookingReminderDaysBefore: z.preprocess((val) => Number(val), z.number().min(1).max(30)),
  dailySummaryEnabled: z.boolean(),
  dailySummaryTime: z.string().regex(/^\d{2}:\d{2}$/, 'Enter time in HH:MM format'),
});

export const bookingSettingsSchema = z.object({
  requireAdvancePayment: z.boolean(),
  minimumAdvancePercent: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  allowDoubleBooking: z.boolean(),
  bookingCancellationHours: z.preprocess((val) => Number(val), z.number().min(0)),
  defaultBookingDurationHours: z.preprocess((val) => Number(val), z.number().min(1).max(24)),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  workingDays: z.array(z.string()),
});

export const hallSettingsSchema = z.object({
  invoicePrefix: z.string().min(1, 'Invoice prefix required').max(10, 'Max 10 characters'),
  bookingPrefix: z.string().min(1, 'Booking prefix required').max(10, 'Max 10 characters'),
  receiptPrefix: z.string().min(1, 'Receipt prefix required').max(10, 'Max 10 characters'),
  invoiceStartNumber: z.preprocess((val) => Number(val), z.number().min(1, 'Start number must be at least 1')),
  bookingStartNumber: z.preprocess((val) => Number(val), z.number().min(1, 'Start number must be at least 1')),
  currency: z.string().default('INR'),
  currencySymbol: z.string().default('₹'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  timezone: z.string().default('Asia/Kolkata'),
  taxEnabled: z.boolean().default(false),
  gstRate: z.preprocess((val) => Number(val), z.number().min(0).max(28)),
  gstApplicableOn: z.enum(['all', 'bookings_only', 'custom']).default('all'),
  autoInvoice: z.boolean().default(false),
  invoiceFooterNote: z.string().max(200, 'Max 200 characters').optional(),
  termsAndConditions: z.string().max(1000, 'Max 1000 characters').optional(),
  invoiceTemplate: z.string().default('classic'),
});
