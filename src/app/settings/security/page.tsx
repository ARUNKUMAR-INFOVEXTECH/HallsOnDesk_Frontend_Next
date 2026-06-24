'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useChangePassword } from '@/hooks/useSettings';
import SettingsCard from '@/components/settings/SettingsCard';
import { FormProvider } from '@/components/forms/FormProvider';
import { PasswordField } from '@/components/auth/AuthFields';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function SecuritySettingsPage() {
  const changePasswordMutation = useChangePassword();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccessMsg('Your password has been successfully updated.');
      form.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to change password. Please check your current password.';
      setErrorMsg(errorText);
    }
  };

  const newPasswordValue = form.watch('newPassword') || '';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Security Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account login credentials and security configurations.</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsCard
          title="Change Password"
          subtitle="Update your password periodically to keep your operator account secure."
          icon={Lock}
        >
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-green-200 bg-green-50/50 text-green-800 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-green-650" />
              <span>{successMsg}</span>
            </div>
          )}

          <FormProvider form={form} onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <PasswordField name="currentPassword" label="Current Password" />
              <PasswordField name="newPassword" label="New Password" />
              <PasswordField name="confirmPassword" label="Confirm New Password" />
            </div>

            {/* Password requirements helper box */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-semibold text-gray-400 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Password Requirements
              </span>
              <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                <li className={newPasswordValue.length >= 8 ? 'text-green-650 font-bold' : ''}>
                  Must be at least 8 characters long
                </li>
                <li className={/[A-Z]/.test(newPasswordValue) ? 'text-green-650 font-bold' : ''}>
                  Must contain at least one uppercase letter (A-Z)
                </li>
                <li className={/[0-9]/.test(newPasswordValue) ? 'text-green-650 font-bold' : ''}>
                  Must contain at least one numeric digit (0-9)
                </li>
                <li className={/[^A-Za-z0-9]/.test(newPasswordValue) ? 'text-green-650 font-bold' : ''}>
                  Must contain at least one special character (e.g. ! @ # $ % & *)
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Change Password</span>
                )}
              </button>
            </div>
          </FormProvider>
        </SettingsCard>
      </div>
    </div>
  );
}
