import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const vendorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum([
    'caterer',
    'decorator',
    'photographer',
    'videographer',
    'dj',
    'band',
    'florist',
    'lighting',
    'sound',
    'tent',
    'transport',
    'security',
    'cleaning',
    'other',
  ], {
    required_error: 'Category is required',
  }),
  phone: z.string().min(1, 'Phone number is required').regex(phoneRegex, 'Invalid Indian phone number (10 digits, starts with 6-9)'),
  alternatePhone: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid Indian phone number',
    }),
  email: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Invalid email address',
    }),
  address: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  gstNumber: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || gstRegex.test(val.toUpperCase()), {
      message: 'Invalid GST number format',
    })
    .transform((val) => val?.toUpperCase() || ''),
  bankName: z.string().optional().default(''),
  accountNumber: z.string().optional().default(''),
  ifscCode: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || ifscRegex.test(val.toUpperCase()), {
      message: 'Invalid IFSC code format',
    })
    .transform((val) => val?.toUpperCase() || ''),
  upiId: z.string().optional().default(''),
  contactPersonName: z.string().optional().default(''),
  contactPersonPhone: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid contact phone number',
    }),
  rating: z.number().min(1).max(5).optional().default(5),
  status: z.enum(['active', 'inactive', 'blacklisted']).default('active'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
