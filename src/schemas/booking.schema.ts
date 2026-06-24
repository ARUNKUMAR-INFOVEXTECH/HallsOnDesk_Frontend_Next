import { z } from 'zod';

export const bookingFormSchema = z
  .object({
    customerId: z.string().min(1, 'Customer is required'),
    eventType: z.string().min(2, 'Event type must be at least 2 characters'),
    eventDate: z.string().min(1, 'Event date is required'),
    eventEndDate: z.string().optional(),
    guestCount: z
      .number({ invalid_type_error: 'Guest count must be a number' })
      .min(1, 'Guest count must be at least 1')
      .max(10000, 'Guest count cannot exceed 10000'),
    bookingAmount: z
      .number({ invalid_type_error: 'Booking amount must be a number' })
      .min(1, 'Booking amount must be at least 1'),
    advanceAmount: z
      .number({ invalid_type_error: 'Advance amount must be a number' })
      .min(0, 'Advance amount cannot be negative')
      .optional()
      .default(0),
    discountAmount: z
      .number({ invalid_type_error: 'Discount amount must be a number' })
      .min(0, 'Discount amount cannot be negative')
      .optional()
      .default(0),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
    notes: z.string().optional().default(''),
    coordinatorName: z.string().optional(),
    coordinatorPhone: z
      .string()
      .optional()
      .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
        message: 'Invalid Indian phone number (10 digits, starts with 6-9)',
      }),
  })
  .refine(
    (data) => {
      if (data.eventEndDate && data.eventDate) {
        return new Date(data.eventEndDate) >= new Date(data.eventDate);
      }
      return true;
    },
    {
      message: 'Event end date must be after event date',
      path: ['eventEndDate'],
    }
  )
  .refine(
    (data) => {
      return (data.advanceAmount || 0) <= data.bookingAmount;
    },
    {
      message: 'Advance amount cannot exceed booking amount',
      path: ['advanceAmount'],
    }
  )
  .refine(
    (data) => {
      return (data.discountAmount || 0) <= data.bookingAmount;
    },
    {
      message: 'Discount amount cannot exceed booking amount',
      path: ['discountAmount'],
    }
  );

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
