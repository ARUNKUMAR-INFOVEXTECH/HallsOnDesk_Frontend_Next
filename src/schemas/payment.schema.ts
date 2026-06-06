import { z } from 'zod';

export const paymentFormSchema = z
  .object({
    bookingId: z.string().min(1, 'Booking reference is required'),
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .min(1, 'Amount must be at least ₹1'),
    paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'other']),
    referenceNumber: z.string().optional().default(''),
    paymentDate: z.string().min(1, 'Payment date is required'),
    notes: z.string().optional().default(''),
    status: z.enum(['completed', 'pending', 'failed', 'refunded']).default('completed'),
    
    // Optional parameter used to validate that payment amount does not exceed booking balance
    pendingAmount: z.number().optional(),
  })
  .refine(
    (data) => {
      const method = data.paymentMethod;
      if (['bank_transfer', 'cheque', 'upi'].includes(method)) {
        return !!data.referenceNumber && data.referenceNumber.trim() !== '';
      }
      return true;
    },
    {
      message: 'Reference number is required for bank transfer, cheque, or UPI',
      path: ['referenceNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.pendingAmount !== undefined) {
        return data.amount <= data.pendingAmount;
      }
      return true;
    },
    {
      message: 'Amount cannot exceed the pending balance of the booking',
      path: ['amount'],
    }
  )
  .refine(
    (data) => {
      if (data.paymentDate) {
        // Reset time component of dates to check date-only future conditions fairly
        const selected = new Date(data.paymentDate);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return selected <= today;
      }
      return true;
    },
    {
      message: 'Payment date cannot be in the future',
      path: ['paymentDate'],
    }
  );

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
