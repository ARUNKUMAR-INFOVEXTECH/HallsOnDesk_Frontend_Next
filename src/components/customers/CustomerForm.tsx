'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';

// Zod Validation Schema
const customerSchema = z.object({
  customer_name: z.string().min(2, 'Customer Name must be at least 2 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits'),
  email: z
    .string()
    .optional()
    .or(z.string().email('Please enter a valid email address').optional()),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CustomerForm({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = 'Save Customer',
  onCancel,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      notes: '',
      ...initialValues,
    },
  });

  const { reset, formState: { isDirty } } = form;

  // Sync initialValues when editing
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  // Unsaved Changes warning before window unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Personal Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3 mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Personal Information</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Primary contact details for the customer</p>
          </div>
          
          <InputField
            name="customer_name"
            label="Customer Name"
            placeholder="e.g. Anand Srinivasan"
            disabled={loading}
          />
          <InputField
            name="phone"
            type="tel"
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            disabled={loading}
          />
          <InputField
            name="email"
            type="email"
            label="Email Address (Optional)"
            placeholder="e.g. anand@outlook.com"
            disabled={loading}
          />
        </div>

        {/* Right Card: Address & Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3 mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Address Details</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Location information for communication</p>
          </div>

          <InputField
            name="address"
            label="Street Address"
            placeholder="e.g. 14, Gandhi Nagar Road"
            disabled={loading}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              name="city"
              label="City"
              placeholder="e.g. Madurai"
              disabled={loading}
            />
            <InputField
              name="state"
              label="State"
              placeholder="e.g. Tamil Nadu"
              disabled={loading}
            />
          </div>
        </div>

      </div>

      {/* Internal Notes Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 mb-1">
          <h3 className="text-sm font-semibold text-slate-800">Internal Notes</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Add specific customer preferences or follow-up details</p>
        </div>
        <div className="flex flex-col gap-1.5 w-full">
          <textarea
            id="notes"
            rows={4}
            disabled={loading}
            placeholder="Add specific booking preferences, budget range, or customer follow-up notes..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            {...form.register('notes')}
          />
        </div>
      </div>

      {/* Button Tray */}
      <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 transition-colors shadow-sm cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 py-2 px-5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm cursor-pointer"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </FormProvider>
  );
}
