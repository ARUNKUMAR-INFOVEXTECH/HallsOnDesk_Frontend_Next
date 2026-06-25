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
  FileText,
  Printer
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getSubscriptionPaymentInvoiceHtml } from '@/services/api/modules/subscription-payment.service';

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

  const handlePrintSaaSInvoice = async (paymentId: string) => {
    try {
      const html = await getSubscriptionPaymentInvoiceHtml(paymentId);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (err) {
      console.error('Print SaaS invoice failed:', err);
      alert('Failed to load invoice layout.');
    }
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

      {subscription.status === 'trial' && (
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-950">
          <Clock className="h-5 w-5 text-[#062089] shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-xs text-[#062089]">Free Onboarding & Maintenance Active</h4>
            <p className="text-[11px] text-indigo-805 mt-1">
              Your venue is currently on the <strong>{activePackage?.name.toLowerCase().includes('basic') ? '30-day' : '60-day'}</strong> Free Onboarding & Maintenance period. 
              You have <strong>{daysRemaining} days left</strong> of complimentary operations and priority assistance. 
              Your regular billing will begin on <strong>{new Date(subscription.end_date).toLocaleDateString('en-GB')}</strong>.
            </p>
          </div>
        </div>
      )}      {/* Unified Billing Overview Card */}
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Active Workspace
              </span>
              {subscription.status === 'trial' ? (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Free Onboarding
                </span>
              ) : (
                <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  {activePackage?.billing_cycle || 'monthly'} plan
                </span>
              )}
              <span className="bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                ₹{activePackage?.price?.toLocaleString('en-IN') || '0'}/{activePackage?.billing_cycle === 'yearly' ? 'yr' : 'mo'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-sans">{activePackage?.name || 'Free Trial Plan'}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                {subscription.status === 'trial' ? 'First billing starts: ' : 'Next renewal: '}
                <strong className="text-slate-700 font-semibold">{new Date(subscription.end_date).toLocaleDateString('en-GB')}</strong> ({daysRemaining} days left)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleCheckoutRedirect(subscription.package_id)}
              className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
            >
              <QrCode className="h-4 w-4" />
              <span>Scan & Pay</span>
            </button>
            <a
              href="mailto:billing@infovex.com"
              className="h-9 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Contact Billing</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users Count progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Active User Accounts</span>
                <span className="text-slate-800 font-mono">
                  {totalUsersCount} / {activePackage?.max_users || 5}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalUsersCount / (activePackage?.max_users || 5)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {Math.round((totalUsersCount / (activePackage?.max_users || 5)) * 100)}% usage capacity
              </p>
            </div>

            {/* Bookings Count progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Active Bookings</span>
                <span className="text-slate-800 font-mono">
                  {bookingCount} / {activePackage?.max_bookings ? activePackage.max_bookings : 'Unlimited'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-650 rounded-full transition-all duration-500"
                  style={{ width: `${activePackage?.max_bookings ? Math.min(100, (bookingCount / activePackage.max_bookings) * 100) : 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {activePackage?.max_bookings 
                  ? `${Math.round((bookingCount / activePackage.max_bookings) * 100)}% usage capacity`
                  : 'Unlimited capacity'}
              </p>
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
                  <div className="space-y-2 border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-650">
                    <span className="text-[9px] uppercase tracking-wider text-slate-405 block font-black mb-1">Plan features & capabilities</span>
                    
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Core Booking & Event Calendar</span>
                    </div>

                    {packageHasFeature(pkg.name, 'crm') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Customer CRM (Leads/Enquiries)</span>
                      </div>
                    )}

                    {packageHasFeature(pkg.name, 'vendors') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Vendor Directory & Allocation</span>
                      </div>
                    )}

                    {packageHasFeature(pkg.name, 'reports') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Advanced Reports & Analytics</span>
                      </div>
                    )}

                    {packageHasFeature(pkg.name, 'multihall') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Multi-Hall Context Switcher</span>
                      </div>
                    )}

                    {packageHasFeature(pkg.name, 'whatsapp') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Premium WhatsApp Alerts</span>
                      </div>
                    )}

                    {packageHasFeature(pkg.name, 'support') && (
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Priority 24/7 Support Center</span>
                      </div>
                    )}
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
                  <th className="py-2.5 text-right">Actions</th>
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
                    <td className="py-3 text-right">
                      {pmt.status === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => handlePrintSaaSInvoice(pmt.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-violet-600 transition-colors cursor-pointer inline-block"
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-slate-350 font-semibold text-[10px] pr-2">-</span>
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
