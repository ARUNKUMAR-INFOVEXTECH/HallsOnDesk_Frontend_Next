'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { SelectField } from '@/components/forms/SelectField';
import { PhoneField } from '@/components/forms/PhoneField';

// Validation Schema using Zod
const demoSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(10, 'Phone number cannot exceed 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  hall_name: z.string().min(3, 'Hall name must be at least 3 characters'),
  district: z.string().min(1, 'Please select your district'),
});

type DemoFormValues = z.infer<typeof demoSchema>;

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAMIL_NADU_DISTRICTS = [
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Trichy', label: 'Trichy' },
  { value: 'Salem', label: 'Salem' },
  { value: 'Tirunelveli', label: 'Tirunelveli' },
  { value: 'Erode', label: 'Erode' },
  { value: 'Vellore', label: 'Vellore' },
  { value: 'Tiruppur', label: 'Tiruppur' },
  { value: 'Thanjavur', label: 'Thanjavur' },
] as const;

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      email: '',
      hall_name: '',
      district: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: DemoFormValues) => {
    try {
      // Simulate API Submission Delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Demo Booking Data submitted:', data);
      
      // Success Notification
      toast.success('Demo Booked Successfully!', {
        description: `Thank you ${data.customer_name}. We will contact you shortly to configure ${data.hall_name}!`,
        duration: 5000,
      });

      form.reset();
      onClose();
    } catch (error) {
      toast.error('Submission Failed', {
        description: 'Something went wrong. Please try again or contact support directly.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden z-10 flex flex-col"
          >
            {/* Upper Accent Color Banner */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Book Your Free Demo
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                  Start digitizing your marriage hall bookings, payments, and calendar logs today.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body / Form */}
            <div className="p-6 pt-2">
              <FormProvider form={form} onSubmit={onSubmit} className="space-y-4">
                <InputField
                  name="customer_name"
                  label="Contact Name"
                  placeholder="e.g. Ramesh Kumar"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PhoneField
                    name="phone"
                    label="Mobile Number"
                    placeholder="98765 43210"
                  />
                  <InputField
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="ramesh@gmail.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    name="hall_name"
                    label="Marriage Hall Name"
                    placeholder="e.g. Raj Mahal Palace"
                  />
                  <SelectField
                    name="district"
                    label="District (Tamil Nadu)"
                    placeholder="Select district"
                    options={TAMIL_NADU_DISTRICTS}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 px-4 rounded-md text-xs font-semibold btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-custom-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Configuring Demo...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Demo Request
                    </>
                  )}
                </button>
              </FormProvider>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
