import { z } from 'zod';

export const calendarEventSchema = z
  .object({
    title: z.string().min(2, 'Event title must be at least 2 characters'),
    start: z.string().min(1, 'Start date/time is required'),
    end: z.string().min(1, 'End date/time is required'),
    allDay: z.boolean().default(false),
    type: z.enum(['booking', 'blocked', 'maintenance', 'personal', 'holiday']),
    guestCount: z
      .number({ invalid_type_error: 'Guest count must be a number' })
      .min(1, 'Guest count must be at least 1')
      .optional(),
    bookingId: z.string().optional(),
    notes: z.string().optional().default(''),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).default('confirmed'),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        return new Date(data.end) >= new Date(data.start);
      }
      return true;
    },
    {
      message: 'End date/time must be after or equal to start date/time',
      path: ['end'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'booking') {
        return !!data.bookingId && data.bookingId.trim() !== '';
      }
      return true;
    },
    {
      message: 'A booking reference is required for booking events',
      path: ['bookingId'],
    }
  );

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>;
