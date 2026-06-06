'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import apiClient from '@/services/api/client';
import AuthCard from '@/components/auth/AuthCard';
import { FormProvider } from '@/components/forms/FormProvider';
import { EmailField } from '@/components/auth/AuthFields';
import { AuthButton } from '@/components/auth/AuthButtons';
import { AuthErrorAlert } from '@/components/auth/AuthAlerts';

// Validation Schema using Zod
const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ForgotFormValues) => {
    setErrorMsg('');

    try {
      // Call backend POST /auth/forgot-password
      await apiClient.post('/auth/forgot-password', { email: data.email });

      setSentEmail(data.email);
      setIsSent(true);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to request reset link. Please check your email and try again.';
      setErrorMsg(errorText);
    }
  };

  // Render Success State Confirmation card
  if (isSent) {
    return (
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <div className="p-8 text-center space-y-5">
          <div className="h-12 w-12 rounded-full bg-green-50 text-emerald-500 flex items-center justify-center mx-auto shadow-custom-sm">
            <MailCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-none">
              Recovery Link Dispatched
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We have sent a secure password reset link to:
              <span className="block text-slate-700 font-bold mt-1 truncate">{sentEmail}</span>
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-md text-xs font-semibold text-slate-600 border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-custom-sm cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="Recover Your Password"
      subtitle="Input your work email address below and we will dispatch a reset link."
    >
      <div className="space-y-4">
        {/* Error alerting slot */}
        <AuthErrorAlert message={errorMsg} />

        <FormProvider form={form} onSubmit={onSubmit} className="space-y-4">
          <EmailField name="email" label="Registered Email" placeholder="name@company.com" />

          <AuthButton loading={isSubmitting} loadingText="Dispatching recovery email...">
            Request Reset Link
          </AuthButton>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </FormProvider>
      </div>
    </AuthCard>
  );
}
