'use client';

import React, { useEffect, useState } from 'react';
import { useAdminSettings, useAdminSendTestEmail } from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Settings,
  Building,
  Mail,
  FileText,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

const settingsFormSchema = z.object({
  companyName: z.string().min(3, 'Company name is required'),
  gstin: z.string().min(15, 'GSTIN must be 15 characters').max(15, 'GSTIN must be 15 characters'),
  supportPhone: z.string().min(10, 'Valid phone number required'),
  supportEmail: z.string().email('Valid email required'),
  defaultTrialDays: z.preprocess((val) => Number(val), z.number().min(1, 'Minimum 1 day')),
  invoicePrefix: z.string().min(2, 'Invoice prefix is required'),
  nextInvoiceNumber: z.preprocess((val) => Number(val), z.number().min(1, 'Minimum invoice number 1')),
  subscriptionQrEnabled: z.boolean().default(true),
  subscriptionQrUpiId: z.string().min(3, 'UPI ID is required'),
  founderSlotsClaimed: z.preprocess((val) => Number(val ?? 14), z.number().min(0, 'Minimum slots claimed 0')),
  founderSlotsTotal: z.preprocess((val) => Number(val ?? 20), z.number().min(1, 'Minimum slots total 1')),
  emailTemplates: z.object({
    welcome: z.string().default(''),
    trialExpiring: z.string().default(''),
    paymentSuccess: z.string().default(''),
    subscriptionSuspended: z.string().default(''),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function AdminSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useAdminSettings();
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const sendTestEmailMutation = useAdminSendTestEmail();

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter a recipient email address');
      return;
    }
    try {
      await sendTestEmailMutation.mutateAsync(testEmailAddress);
    } catch {
      // Handled
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings
  });

  // Reset values when settings hydrate
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings(values);
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Platform Configurations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Adjust company profiles, configure default trial limits, and modify outgoing email alerts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company & Billing Address */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Building className="h-4.5 w-4.5 text-violet-600" />
            <span className="font-bold text-gray-900 text-sm">Company Details & GST</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Registered Entity Name</label>
              <input
                type="text"
                {...register('companyName')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.companyName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyName && <p className="text-[10px] text-red-500 font-semibold">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Tax GSTIN Number</label>
              <input
                type="text"
                {...register('gstin')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 uppercase ${
                  errors.gstin ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.gstin && <p className="text-[10px] text-red-500 font-semibold">{errors.gstin.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Support Contacts Email</label>
              <input
                type="email"
                {...register('supportEmail')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.supportEmail ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.supportEmail && <p className="text-[10px] text-red-500 font-semibold">{errors.supportEmail.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Support Telephone Helpline</label>
              <input
                type="text"
                {...register('supportPhone')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.supportPhone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.supportPhone && <p className="text-[10px] text-red-500 font-semibold">{errors.supportPhone.message}</p>}
            </div>
          </div>
        </div>

        {/* Trial Days & Invoicing Numbers */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Clock className="h-4.5 w-4.5 text-violet-600" />
            <span className="font-bold text-gray-900 text-sm">Default Trial Length & Serialization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Default Free Trial Duration (Days)</label>
              <input
                type="number"
                {...register('defaultTrialDays')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.defaultTrialDays ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.defaultTrialDays && <p className="text-[10px] text-red-500 font-semibold">{errors.defaultTrialDays.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Serial Prefix</label>
              <input
                type="text"
                {...register('invoicePrefix')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.invoicePrefix ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.invoicePrefix && <p className="text-[10px] text-red-500 font-semibold">{errors.invoicePrefix.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Next Invoice Serial Number</label>
              <input
                type="number"
                {...register('nextInvoiceNumber')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.nextInvoiceNumber ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.nextInvoiceNumber && <p className="text-[10px] text-red-500 font-semibold">{errors.nextInvoiceNumber.message}</p>}
            </div>
          </div>
        </div>

        {/* Subscription UPI QR Code Payments */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <QrCode className="h-4.5 w-4.5 text-violet-600" />
            <span className="font-bold text-gray-900 text-sm">SaaS Subscription Payments (UPI QR)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-gray-700">
            {/* Toggle Enable/Disable */}
            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Enable UPI QR payments for owners</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="checkbox"
                  id="subscriptionQrEnabled"
                  {...register('subscriptionQrEnabled')}
                  className="h-4.5 w-4.5 text-violet-600 focus:ring-violet-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="subscriptionQrEnabled" className="text-xs text-gray-650 cursor-pointer select-none">
                  Allow hall owners to pay subscriptions via dynamic UPI QR code
                </label>
              </div>
            </div>

            {/* UPI ID input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Target Merchant UPI ID</label>
              <input
                type="text"
                placeholder="e.g. billing@okaxis"
                {...register('subscriptionQrUpiId')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.subscriptionQrUpiId ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.subscriptionQrUpiId && <p className="text-[10px] text-red-500 font-semibold">{errors.subscriptionQrUpiId.message}</p>}
              <p className="text-[9px] text-gray-400 font-semibold leading-normal mt-1">
                UPI payments made by venue owners will be routed to this VPA. Example: billing@infovex.com
              </p>
            </div>
          </div>
        </div>

        {/* Founder Partner Program Slots */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Building className="h-4.5 w-4.5 text-violet-600" />
            <span className="font-bold text-gray-900 text-sm">Founder Partner Program Slots (Public Landing Counter)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-gray-700">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Founder Slots Claimed (Sold)</label>
              <input
                type="number"
                {...register('founderSlotsClaimed')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.founderSlotsClaimed ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.founderSlotsClaimed && <p className="text-[10px] text-red-500 font-semibold">{errors.founderSlotsClaimed.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Founder Slots Available</label>
              <input
                type="number"
                {...register('founderSlotsTotal')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.founderSlotsTotal ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              {errors.founderSlotsTotal && <p className="text-[10px] text-red-500 font-semibold">{errors.founderSlotsTotal.message}</p>}
            </div>
          </div>
          <p className="text-[9px] text-gray-400 font-semibold leading-normal">
            These values govern the live counter banner and progression bar displayed on the public landing page founder callouts.
          </p>
        </div>

        {/* Email Templates Editors */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <Mail className="h-4.5 w-4.5 text-violet-600" />
            <span className="font-bold text-gray-900 text-sm">Automated Email Alert Notifications Templates</span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-gray-700">
            {/* Welcome */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Welcome Setup Template</label>
                <span className="text-[9px] text-gray-400 font-semibold">Available variables: {'{{owner_name}}'}, {'{{hall_name}}'}</span>
              </div>
              <textarea
                rows={4}
                {...register('emailTemplates.welcome')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono leading-relaxed"
              />
            </div>

            {/* Trial Expiring */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Trial Expiring Warning Template</label>
                <span className="text-[9px] text-gray-400 font-semibold">Available variables: {'{{owner_name}}'}, {'{{hall_name}}'}</span>
              </div>
              <textarea
                rows={4}
                {...register('emailTemplates.trialExpiring')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono leading-relaxed"
              />
            </div>

            {/* Payment success */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Subscription Payment Success Template</label>
                <span className="text-[9px] text-gray-400 font-semibold">Available variables: {'{{owner_name}}'}, {'{{amount}}'}, {'{{expiry_date}}'}, {'{{invoice_number}}'}</span>
              </div>
              <textarea
                rows={4}
                {...register('emailTemplates.paymentSuccess')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono leading-relaxed"
              />
            </div>

            {/* Suspended */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Subscription Suspension Alert Template</label>
                <span className="text-[9px] text-gray-400 font-semibold">Available variables: {'{{hall_name}}'}</span>
              </div>
              <textarea
                rows={4}
                {...register('emailTemplates.subscriptionSuspended')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm cursor-pointer transition-colors disabled:bg-violet-400"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Saving configurations...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Save Configurations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* SMTP / Mail Connection Test */}
      <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4 mt-6">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Mail className="h-4.5 w-4.5 text-violet-650" />
          <span className="font-bold text-gray-900 text-sm">SMTP Mail Server Connectivity Test</span>
        </div>

        <div className="text-xs font-semibold text-slate-700 space-y-4">
          <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
            Send a mock verification email utilizing the Resend Edge Function integration to confirm the outgoing notification mailer is correctly authorized.
          </p>

          <div className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Recipient Email Address</label>
              <input
                type="email"
                placeholder="e.g. admin@infovex.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800"
              />
            </div>
            <button
              type="button"
              disabled={sendTestEmailMutation.isPending}
              onClick={handleSendTestEmail}
              className="h-9 px-4 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0"
            >
              {sendTestEmailMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <span>Dispatch Test Mail</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
