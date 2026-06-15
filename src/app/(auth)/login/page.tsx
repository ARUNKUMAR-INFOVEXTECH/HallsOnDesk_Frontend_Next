'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginRequest } from '@/services/api/auth.service';
import { useAuthStore } from '@/store/authStore';
import { FormProvider } from '@/components/forms/FormProvider';
import { EmailField, PasswordField, RememberMeCheckbox } from '@/components/auth/AuthFields';
import { AuthButton } from '@/components/auth/AuthButtons';
import { AuthErrorAlert, AuthSuccessAlert } from '@/components/auth/AuthAlerts';
import { Check } from 'lucide-react';

// Validation Schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Read URL query triggers
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const sessionExpired = searchParams.get('expired') === 'true';

  useEffect(() => {
    if (sessionExpired) {
      setErrorMsg('Your session has expired. Please sign in again to continue.');
    }
  }, [sessionExpired]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Send login request to backend
      const res = await loginRequest({
        email: data.email,
        password: data.password,
      });

      setSuccessMsg('Authentication successful! Redirecting...');

      // Save tokens and user info in cookies & Zustand store
      login(res.token, res.refresh_token, res.user, data.rememberMe);

      // Perform role-based redirection boundaries
      setTimeout(() => {
        if (res.role === 'super_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push(redirectPath);
        }
      }, 500);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setErrorMsg(errorText);
    }
  };

  const featureHighlights = [
    'Real-time Subha Muhurtham schedules & visual calendar logs.',
    'Cloud-synchronized advance records & payment registries.',
    'Automated invoices & receipt vouchers.',
    'Role-gated staff sub-accounts & permissions management.',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-screen bg-white text-gray-700 antialiased overflow-hidden">
      
      {/* Left panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-16 bg-[#0B1A30] text-white relative">
        {/* Subtle grid backdrop overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2E44_1px,transparent_1px),linear-gradient(to_bottom,#1E2E44_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-20 pointer-events-none" />
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-[#071426] overflow-hidden flex items-center justify-center border border-[#1E2E44] shrink-0 shadow-sm">
            <img src="/favicon.png" alt="Infovex Halls Icon" className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Infovex <span className="text-[#EE9B00]">Halls</span>
          </span>
        </div>

        {/* Center Pitch & Features */}
        <div className="space-y-8 max-w-md relative z-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              The complete venue operations engine.
            </h1>
            <p className="text-sm text-slate-350 font-semibold leading-relaxed">
              Ditch the notebook registers. Manage hall schedules, client billing accounts, catering rosters, and vendor assignments inside one secure cloud platform.
            </p>
          </div>

          <div className="space-y-4">
            {featureHighlights.map((feat, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="h-5 w-5 rounded-full bg-[#EE9B00]/10 border border-[#EE9B00]/20 text-[#EE9B00] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 font-bold" />
                </div>
                <span className="text-gray-300 font-semibold leading-relaxed">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright info / gradient glow overlay */}
        <div className="text-xs text-gray-500 relative z-10 font-bold uppercase tracking-wider">
          Infovex Technologies • India's First Marriage Hall CRM & ERP
        </div>

        {/* Left glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#EE9B00]/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Right panel: Centered form */}
      <div className="col-span-12 lg:col-span-6 flex items-center justify-center p-8 bg-white relative">
        <div className="max-w-sm w-full mx-auto space-y-6">
          
          {/* Small Top Logo on mobile only */}
          <div className="flex items-center gap-2.5 lg:hidden mb-6">
            <div className="h-8.5 w-8.5 rounded-xl bg-[#071426] overflow-hidden flex items-center justify-center border border-[#1E2E44] shrink-0">
              <img src="/favicon.png" alt="Infovex Halls Icon" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">
              Infovex <span className="text-[#EE9B00]">Halls</span>
            </span>
          </div>

          {/* Welcome Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
              Welcome back
            </h2>
            <p className="text-xs text-gray-500 font-semibold">
              Access your platform operator workspace.
            </p>
          </div>

          {/* Alerts slots */}
          <AuthErrorAlert message={errorMsg} />
          <AuthSuccessAlert message={successMsg} />

          {/* Form */}
          <FormProvider form={form} onSubmit={onSubmit} className="space-y-4 pt-2">
            <EmailField name="email" label="Work Email" placeholder="e.g. name@mandapam.com" />
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Password
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-light hover:text-primary hover:underline font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordField name="password" label="" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <RememberMeCheckbox name="rememberMe" label="Remember my login key" />
            </div>

            <AuthButton loading={isSubmitting} loadingText="Verifying account credentials...">
              Sign In
            </AuthButton>
          </FormProvider>

          {/* SaaS restriction note */}
          <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest pt-4 border-t border-gray-50">
            Internal SaaS tool • Access restricted
          </p>

        </div>
      </div>

    </div>
  );
}
