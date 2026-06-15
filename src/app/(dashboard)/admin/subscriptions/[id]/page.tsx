'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminSubscriptions, useAdminHalls } from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Activity,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { deobfuscateId } from '@/utils/obfuscate';

export default function AdminSubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = deobfuscateId(params.id as string);

  const { subscriptions = [], isLoading } = useAdminSubscriptions();
  const { halls = [] } = useAdminHalls();

  const activeSub = subscriptions.find((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Timeline Ledger...</p>
      </div>
    );
  }

  if (!activeSub) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-lg mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Contract Record Not Found</h3>
        <p className="text-xs text-gray-450 mt-1">The requested subscription timeline does not exist or has expired.</p>
        <button
          onClick={() => router.push('/admin/subscriptions')}
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Subscriptions
        </button>
      </div>
    );
  }

  const subStyle = STATUS_STYLES.subscription[activeSub.status as 'active' | 'trial' | 'suspended' | 'expired'];

  // Mock list of invoices and payment receipts for premium visual ledger
  const invoiceHistory = [
    { number: 'INF-HOD-1024', date: 'May 29, 2026', amount: activeSub.price, status: 'paid' },
    { number: 'INF-HOD-1010', date: 'Apr 29, 2026', amount: activeSub.price, status: 'paid' },
    { number: 'INF-HOD-SETUP', date: 'Apr 15, 2026', amount: 4999, status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/admin/subscriptions" className="hover:text-violet-600">Subscriptions</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 truncate">Contract ID: {activeSub.id.slice(0, 8)}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
                Billing Lifecycle
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-semibold">{activeSub.hallName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${subStyle.bg}`}>
                  {subStyle.label}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/subscriptions')}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Ledger</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Subscription timeline changes */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Contract Timeline</h3>

          <div className="space-y-6 pl-4 relative border-l border-gray-100 ml-2 py-2">
            {/* Extended Node */}
            <div className="relative space-y-1">
              <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-gray-900">Current License Period Extended</span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  Ends: {new Date(activeSub.endDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Contract renewal processed. Cost: ₹{activeSub.price.toLocaleString('en-IN')}.
              </p>
            </div>

            {/* Invoices Node */}
            <div className="relative space-y-1">
              <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-gray-900">Monthly Billing Invoice Issued</span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {new Date(activeSub.startDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Plan initialized under the {activeSub.packageName} tier.
              </p>
            </div>

            {/* Signup Node */}
            <div className="relative space-y-1">
              <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-gray-900">Venue Hosting Registered</span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {new Date(activeSub.startDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Tenant registered from Infovex console. Setup fee paid and free trial initiated.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Invoices and Summary stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Billing Overview Summary */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Subscription Details</h4>
            <div className="space-y-3.5 text-xs font-semibold text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-450">Active Tier:</span>
                <span className="text-gray-950 font-bold">{activeSub.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450">Pricing Frequency:</span>
                <span className="text-gray-950 font-bold">Monthly Recurring</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450">Monthly Rate:</span>
                <span className="text-gray-950 font-bold">₹{activeSub.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Issued Invoices</h4>
            <div className="space-y-3">
              {invoiceHistory.map((invoice, idx) => {
                const style = STATUS_STYLES.invoice[invoice.status as 'paid' | 'unpaid' | 'partial'];
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-gray-950 block">{invoice.number}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{invoice.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-gray-900 block">₹{invoice.amount.toLocaleString('en-IN')}</span>
                      <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold rounded border ${style.bg} mt-0.5`}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
