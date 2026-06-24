import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const enquiryFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(phoneRegex, 'Invalid Indian phone number (10 digits, starts with 6-9)'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    city: z.string().optional().default(''),
    eventType: z.enum(
      ['wedding', 'engagement', 'reception', 'birthday', 'corporate', 'anniversary', 'other'],
      { required_error: 'Event type is required' }
    ),
    eventDate: z.string().optional().or(z.literal('')),
    guestCount: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(1, 'Guest count must be at least 1').optional()
    ),
    budgetMin: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(0, 'Budget cannot be negative').optional()
    ),
    budgetMax: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : Number(val)),
      z.number().min(0, 'Budget cannot be negative').optional()
    ),
    source: z.enum(
      ['walk_in', 'phone', 'whatsapp', 'instagram', 'facebook', 'google', 'referral', 'justdial', 'other'],
      { required_error: 'Source is required' }
    ),
    stage: z
      .enum(['new', 'interested', 'visit_scheduled', 'visited', 'booked', 'lost'])
      .default('new'),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    notes: z.string().optional().default(''),
    assignedTo: z.string().optional().default(''),
    
    // For scheduling first followup inside the form
    scheduleFollowup: z.boolean().default(false),
    followupDate: z.string().optional().or(z.literal('')),
    followupType: z.enum(['call', 'whatsapp', 'visit', 'email', 'other']).optional(),
    followupNotes: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: 'Maximum budget must be greater than or equal to minimum budget',
      path: ['budgetMax'],
    }
  )
  .refine(
    (data) => {
      if (data.eventDate) {
        const selected = new Date(data.eventDate);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      }
      return true;
    },
    {
      message: 'Event date must be in the future',
      path: ['eventDate'],
    }
  )
  .refine(
    (data) => {
      if (data.scheduleFollowup) {
        return !!data.followupDate;
      }
      return true;
    },
    {
      message: 'Followup date is required when scheduling a followup',
      path: ['followupDate'],
    }
  )
  .refine(
    (data) => {
      if (data.scheduleFollowup && data.followupDate) {
        const selected = new Date(data.followupDate);
        const now = new Date();
        return selected > now;
      }
      return true;
    },
    {
      message: 'Followup scheduled time must be in the future',
      path: ['followupDate'],
    }
  );

export const followupFormSchema = z
  .object({
    scheduledAt: z.string().min(1, 'Scheduled time is required'),
    type: z.enum(['call', 'whatsapp', 'visit', 'email', 'other'], {
      required_error: 'Followup type is required',
    }),
    notes: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      if (data.scheduledAt) {
        const selected = new Date(data.scheduledAt);
        const now = new Date();
        return selected > now;
      }
      return true;
    },
    {
      message: 'Followup scheduled time must be in the future',
      path: ['scheduledAt'],
    }
  );

export const convertFormSchema = z.object({
  eventDate: z.string().min(1, 'Event date is required'),
  guestCount: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(1, 'Guest count must be at least 1')
  ),
  bookingAmount: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().min(1, 'Booking amount must be at least ₹1')
  ),
  advanceAmount: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : Number(val)),
    z.number().min(0, 'Advance amount cannot be negative').optional().default(0)
  ),
  notes: z.string().optional().default(''),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
export type FollowupFormValues = z.infer<typeof followupFormSchema>;
export type ConvertFormValues = z.infer<typeof convertFormSchema>;
