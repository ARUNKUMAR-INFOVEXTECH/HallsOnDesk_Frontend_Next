import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const staffBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid Indian phone number (10 digits, starts with 6-9)'),
  role: z.enum(
    ['owner', 'manager', 'staff', 'receptionist', 'accountant', 'security', 'cleaner', 'other'],
    { required_error: 'Role is required' }
  ),
  department: z.enum(
    ['management', 'operations', 'accounts', 'security', 'housekeeping', 'other'],
    { required_error: 'Department is required' }
  ),
  employeeId: z.string().min(2, 'Employee ID must be at least 2 characters'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  salary: z.number().min(0, 'Salary cannot be negative').optional().default(0),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default('Tamil Nadu'),
  emergencyContactName: z.string().optional().default(''),
  emergencyContactPhone: z
    .string()
    .optional()
    .default('')
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid emergency contact phone number',
    }),
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
  permissions: z.array(z.string()).default([]),
  notes: z.string().optional().default(''),
});

const dateRefinement = (data: { joiningDate?: string }) => {
  if (data.joiningDate) {
    const selected = new Date(data.joiningDate);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selected <= today;
  }
  return true;
};

const dateRefinementConfig = {
  message: 'Joining date cannot be in the future',
  path: ['joiningDate'],
};

// Form schema for editing (password optional)
export const staffFormSchema = staffBaseSchema
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  })
  .refine(dateRefinement, dateRefinementConfig);

// Form schema for creation (password mandatory)
export const staffCreateSchema = staffBaseSchema
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(dateRefinement, dateRefinementConfig);

export type StaffFormValues = z.infer<typeof staffFormSchema>;
export type StaffCreateValues = z.infer<typeof staffCreateSchema>;
