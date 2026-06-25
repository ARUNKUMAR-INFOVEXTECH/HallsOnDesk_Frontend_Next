'use client';

import React from 'react';
import { useActiveSubscription, useAllPackages, useSubscriptionPaymentsHistory } from '@/hooks/useSettings';
import { useStaffList } from '@/hooks/useStaff';
import { useBookings } from '@/hooks/useBookings';
import { packageHasFeature } from '@/utils/subscription';
import SettingsCard from '@/components/settings/SettingsCard';
import {
  CreditCard,
  Check,
  X,
  Users,
  CalendarDays,
  Clock,
  Sparkles,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const { data: subscription, isLoading: subLoading, isError: subError } = useActiveSubscription();
  const { data: packages = [], isLoading: pkgLoading, isError: pkgError } = useAllPackages();
  const { data: paymentsHistory = [], isLoading: historyLoading } = useSubscriptionPaymentsHistory();
  
  // Fetch lists to calculate current usage metrics
  const { data: staffData } = useStaffList({ limit: 100 });
  const { data: bookings = [] } = useBookings();

  const staffCount = staffData?.data?.length || 0;
  const totalUsersCount = staffCount + 1; // Including the Owner account itself
  const bookingCount = bookings.length || 0;

  if (subLoading || pkgLoading || historyLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-48 bg-gray-200 rounded-xl w-full" />
        <div className="h-28 bg-white border border-gray-100 rounded-xl p-5" />
        <div className="h-56 bg-white border border-gray-100 rounded-xl p-5" />
      </div>
    );
  }

  if (subError || pkgError || !subscription) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-md mx-auto my-12">
        <CreditCard className="h-10 w-10 text-gray-400 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Subscription Data Mismatch</h3>
        <p className="text-xs text-gray-450 mt-1">We couldn't retrieve your active subscription or plan details. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 active:scale-98 transition-all duration-150 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const activePackage = subscription.packages;

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(subscription.end_date);
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));

  // Determine state warning banners
  const isExpired = subscription.status === 'expired' || subscription.status === 'suspended' || daysRemaining === 0;
  const pendingPayment = paymentsHistory.find(p => p.status === 'pending');

  const handleCheckoutRedirect = (pkgId: string) => {
    router.push(`/settings/subscription/checkout?packageId=${pkgId}`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Subscription & Plan</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your active package subscription, limits, and explore other available venue plans.</p>
        </div>
      </div>

      {/* WARNING BANNERS */}
      {isExpired && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          <AlertTriangle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Subscription Expired / Access Suspended</h4>
            <p className="text-[11px] text-red-700 mt-1">
              Your venue subscription period has elapsed. Access to create bookings is currently restricted. 
              Please select a package below and complete the UTR payment to reactivate your workspace immediately.
            </p>
          </div>
        </div>
      )}

      {pendingPayment && (
        <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4 text-violet-955">
          <Sparkles className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Payment Verification Pending</h4>
            <p className="text-[11px] text-violet-750 mt-1">
              We received your payment submission of <strong>₹{pendingPayment.amount.toLocaleString('en-IN')}</strong> (UTR: <strong>{pendingPayment.transaction_ref_no}</strong>). 
              Our billing administrators are verifying this transfer against bank statements. This verification usually resolves within 2 hours.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Active Subscription & Usage Tracker */}
        <div className="xl:col-span-2 space-y-6">
                   {/* Active Plan Detail Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600 via-indigo-950 to-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Engineered Grid Background Pattern */}
            <svg className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)] pointer-events-none" aria-hidden="true">
              <defs>
                <pattern id="grid-pattern-sub" width="20" height="20" patternUnits="userSpaceOnUse" x="100%" y="-1">
                  <path d="M.5 20V.5H20" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-sub)" strokeWidth="0" />
            </svg>
            
            {/* Glowing Neon Blobs */}
            <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/25 blur-3xl pointer-events-none" />
            <div className="absolute right-1/4 bottom-0 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active Workspace
                </span>
                <span className="bg-white/10 border border-white/15 text-violet-200 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full">
                  {activePackage?.billing_cycle || 'monthly'} plan
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-sans drop-shadow-sm">{activePackage?.name || 'Free Trial Plan'}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-350 font-bold">
                <Clock className="h-4 w-4 text-violet-300" />
                <span>Next renewal date: <strong className="text-white">{new Date(subscription.end_date).toLocaleDateString('en-GB')}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0 self-start sm:self-auto flex-wrap sm:flex-nowrap">
              {/* Cost Capsule */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 flex flex-col items-start sm:items-end justify-center min-h-[58px]">
                <span className="text-[8px] text-violet-250 font-black uppercase tracking-wider block font-sans">Plan Cost</span>
                <span className="text-lg font-black text-white font-mono leading-none mt-1">
                  ₹{activePackage?.price?.toLocaleString('en-IN') || '0'}
                  <span className="text-[10px] text-violet-300 font-bold lowercase">/{activePackage?.billing_cycle === 'yearly' ? 'yr' : 'mo'}</span>
                </span>
              </div>

              {/* Days Left Capsule */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4.5 py-2.5 flex flex-col items-center justify-center text-center shadow-inner min-w-[76px] min-h-[58px]">
                <span className="text-xl font-black text-amber-400 font-mono tracking-tight leading-none">
                  {daysRemaining}
                </span>
                <span className="text-[8px] text-slate-300 font-black uppercase tracking-wider mt-1.5 font-sans">
                  Days Left
                </span>
              </div>
            </div>
          </div>

          {/* Usage Tracker */}
          <SettingsCard title="Subscription Usage Limits" subtitle="Track your active usage metrics against your plan limitations." icon={TrendingUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Users Count progress */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-850 block">Active User Accounts</span>
                      <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Owner + Staff operators limit</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-805 font-mono font-extrabold">
                    {totalUsersCount} <span className="text-slate-400 font-bold">/ {activePackage?.max_users || 5}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-650 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totalUsersCount / (activePackage?.max_users || 5)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold block text-right">
                    {Math.round((totalUsersCount / (activePackage?.max_users || 5)) * 100)}% capacity filled
                  </span>
                </div>
              </div>

              {/* Bookings Count progress */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                      <CalendarDays className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-850 block">Active Bookings</span>
                      <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Event scheduling limit</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-805 font-mono font-extrabold">
                    {bookingCount} <span className="text-slate-400 font-bold">/ {activePackage?.max_bookings ? activePackage.max_bookings : 'Unlimited'}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-105 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-650 rounded-full transition-all duration-500"
                      style={{ width: `${activePackage?.max_bookings ? Math.min(100, (bookingCount / activePackage.max_bookings) * 100) : 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold block text-right">
                    {activePackage?.max_bookings 
                      ? `${Math.round((bookingCount / activePackage.max_bookings) * 100)}% capacity filled`
                      : 'Unlimited Capacity'}
                  </span>
                </div>
              </div>

            </div>
          </SettingsCard>
        </div>

        {/* Right Column: Support & Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Quick Remittance Actions</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
              Ready to renew your current plan or upload a new bank transaction details? Navigate straight to checkout scan page.
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleCheckoutRedirect(subscription.package_id)}
                className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>Go to Scan & Pay</span>
              </button>
              <a
                href="mailto:billing@infovex.com"
                className="w-full h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
              >
                <HelpCircle className="h-4 w-4 text-slate-500" />
                <span>Contact Billing Team</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Package comparison section */}
      <div className="space-y-5">
        <div className="border-b border-gray-150 pb-2">
          <h2 className="text-sm font-extrabold text-slate-800">Compare Plans & Upgrades</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">Explore available packages and select the best fit for your venue operation scaling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isCurrent = pkg.id === subscription.package_id;
            return (
              <div 
                key={pkg.id} 
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between gap-6 transition-all shadow-sm ${
                  isCurrent 
                    ? 'border-violet-650 ring-2 ring-violet-500/10 scale-[1.01]' 
                    : 'border-slate-205 hover:border-slate-350 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Package Badge */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-extrabold text-slate-805 text-base">{pkg.name}</span>
                    {isCurrent && (
                      <span className="text-[8px] font-extrabold text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Active Now
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-mono">₹{pkg.price.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase ml-1">/{pkg.billing_cycle}</span>
                  </div>

                  {/* Features Limits */}
                  <div className="space-y-2 py-3 border-t border-slate-50 text-[11px] font-semibold text-slate-655">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{pkg.max_users !== null && pkg.max_users !== undefined ? <>Up to <strong>{pkg.max_users}</strong> team members</> : <strong>Unlimited team members</strong>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-650 shrink-0" />
                      <span>{pkg.max_bookings ? <>Up to <strong>{pkg.max_bookings}</strong> active bookings</> : <strong>Unlimited active bookings</strong>}</span>
                    </div>
                    {pkg.setup_fee && (
                      <div className="flex items-center gap-2 text-indigo-700">
                        <Sparkles className="h-4 w-4 text-[#159DFC] shrink-0" />
                        <span>One-time setup fee: ₹{pkg.setup_fee.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Features List */}
                  <div className="space-y-2.5 border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-650">
                    <span className="text-[9px] uppercase tracking-wider text-slate-405 block font-black">Plan features & capabilities</span>
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Core Booking & Event Calendar</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'crm') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'crm') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Customer CRM (Leads/Enquiries)
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'vendors') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'vendors') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Vendor Directory & Allocation
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'reports') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'reports') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Advanced Reports & Analytics
                        </span>
                      </span>
                    </div>



                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'multihall') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'multihall') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Multi-Hall Context Switcher
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'whatsapp') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'whatsapp') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Premium WhatsApp Alerts
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        {packageHasFeature(pkg.name, 'support') ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span className={packageHasFeature(pkg.name, 'support') ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          Priority 24/7 Support Center
                        </span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Switch Action button */}
                <button
                  onClick={() => handleCheckoutRedirect(pkg.id)}
                  disabled={isCurrent}
                  className={`w-full h-9 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isCurrent 
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : 'Select Package'}</span>
                  {!isCurrent && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING HISTORY LOG */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <FileText className="h-5 w-5 text-slate-550" />
          <div>
            <h3 className="font-bold text-gray-950 text-sm">Remittance & Billing History</h3>
            <p className="text-[10px] text-gray-450 font-semibold">Track historical bank transfer remittance logs and approval outcomes.</p>
          </div>
        </div>

        {paymentsHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
            No subscription payments submitted or recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-105 text-slate-450 uppercase text-[9px] font-black tracking-wider">
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Reference (UTR)</th>
                  <th className="py-2.5">Remittance Date</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5">Admin Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 font-semibold text-slate-705">
                {paymentsHistory.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-extrabold text-slate-905">{pmt.packages?.name || 'SaaS Plan'}</td>
                    <td className="py-3 font-mono text-[11px]">{pmt.transaction_ref_no}</td>
                    <td className="py-3 text-slate-550 font-medium">
                      {new Date(pmt.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-905">₹{pmt.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 uppercase text-[10px] text-slate-550 font-extrabold">{pmt.payment_method}</td>
                    <td className="py-3">
                      <div className="flex justify-center">
                        {pmt.status === 'approved' && (
                          <span className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide font-black">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        )}
                        {pmt.status === 'pending' && (
                          <span className="flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide font-black">
                            <Clock className="h-3 w-3 animate-pulse" /> Pending
                          </span>
                        )}
                        {pmt.status === 'rejected' && (
                          <span className="flex items-center gap-1 text-[9px] bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide font-black">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-[11px] font-medium max-w-[200px] truncate text-slate-550">
                      {pmt.status === 'rejected' && pmt.rejection_reason ? (
                        <span className="text-rose-600 font-semibold" title={pmt.rejection_reason}>
                          Reason: {pmt.rejection_reason}
                        </span>
                      ) : (
                        pmt.notes || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
