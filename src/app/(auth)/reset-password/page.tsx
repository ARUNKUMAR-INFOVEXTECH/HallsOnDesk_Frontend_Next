'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import apiClient from '@/services/api/client';
import AuthCard from '@/components/auth/AuthCard';
import { FormProvider } from '@/components/forms/FormProvider';
import { PasswordField } from '@/components/auth/AuthFields';
import { AuthButton } from '@/components/auth/AuthButtons';
import { AuthErrorAlert, AuthSuccessAlert } from '@/components/auth/AuthAlerts';
import Link from 'next/link';

// Validation Schema using Zod with refine matching logic
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ResetFormValues) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    try {
      // Call backend POST /auth/reset-password
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to reset password. The link may have expired or is invalid.';
      setErrorMsg(errorText);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
        <div className="p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-50 text-emerald-500 flex items-center justify-center mx-auto shadow-custom-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-none">
              Password Restored
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Your password has been reset successfully. Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      title="Create New Password"
      subtitle="Ensure your new password contains uppercase, numeric, and special symbols."
    >
      <div className="space-y-4">
        {/* Alerts slots */}
        <AuthErrorAlert message={errorMsg} />
        {!token && (
          <AuthErrorAlert message="No recovery token detected. Form submissions are disabled." />
        )}
        <AuthSuccessAlert message={successMsg} />

        <FormProvider form={form} onSubmit={onSubmit} className="space-y-4">
          <PasswordField name="password" label="New Password" />
          <PasswordField name="confirmPassword" label="Confirm New Password" />

          <AuthButton
            loading={isSubmitting}
            disabled={!token}
            loadingText="Saving new password..."
          >
            Reset Password
          </AuthButton>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </FormProvider>
      </div>
    </AuthCard>
  );
}
