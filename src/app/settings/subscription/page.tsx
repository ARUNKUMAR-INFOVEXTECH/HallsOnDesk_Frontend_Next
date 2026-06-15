'use client';

import React, { useState } from 'react';
import { useActiveSubscription, useAllPackages, useRequestSubscriptionChange } from '@/hooks/useSettings';
import { useStaffList } from '@/hooks/useStaff';
import { useBookings } from '@/hooks/useBookings';
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
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function SubscriptionSettingsPage() {
  const { data: subscription, isLoading: subLoading, isError: subError } = useActiveSubscription();
  const { data: packages = [], isLoading: pkgLoading, isError: pkgError } = useAllPackages();
  
  // Fetch lists to calculate current usage metrics
  const { data: staffData } = useStaffList({ limit: 100 });
  const { data: bookings = [] } = useBookings();
  
  const requestChangeMutation = useRequestSubscriptionChange();

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [requestType, setRequestType] = useState<'upgrade' | 'renewal'>('upgrade');
  const [notes, setNotes] = useState('');

  const staffCount = staffData?.data?.length || 0;
  const bookingCount = bookings.length || 0;

  if (subLoading || pkgLoading) {
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
          className="mt-4 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-750 transition-all cursor-pointer"
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

  const handleOpenRequest = (pkg: any, type: 'upgrade' | 'renewal') => {
    setSelectedPkg(pkg);
    setRequestType(type);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestChangeMutation.mutateAsync({
        package_id: selectedPkg?.id,
        request_type: requestType,
        notes,
      });
      setIsModalOpen(false);
    } catch {
      // Handled in query hook
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Active Subscription & Usage Tracker */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Plan Detail Card */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-150 shadow-md bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2E44_1px,transparent_1px),linear-gradient(to_bottom,#1E2E44_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-650/10 blur-3xl" />
            
            <div className="space-y-3 relative z-10">
              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full">
                Active Plan
              </span>
              <h2 className="text-2xl font-black tracking-tight">{activePackage?.name || 'Standard Plan'}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-350 font-semibold">
                <Clock className="h-4 w-4 text-[#EE9B00]" />
                <span>Next billing date: <strong>{format(endDate, 'dd MMM yyyy')}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 font-black uppercase block tracking-wider">Plan Cost</span>
                <span className="text-xl font-black text-white font-mono">
                  ₹{activePackage?.price?.toLocaleString('en-IN') || '2,499'}
                  <span className="text-xs text-slate-400 font-semibold">/{activePackage?.billing_cycle || 'month'}</span>
                </span>
              </div>
              <div className="h-16 w-16 bg-white/10 border border-white/20 rounded-2xl flex flex-col items-center justify-center p-2 text-center">
                <span className="text-lg font-black text-[#EE9B00] font-mono leading-none">{daysRemaining}</span>
                <span className="text-[8px] text-slate-300 font-black uppercase mt-1">Days Left</span>
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
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Registered Staff</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">User accounts limit</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {staffCount} <span className="text-slate-400 font-bold">/ {activePackage?.max_users || 5}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (staffCount / (activePackage?.max_users || 5)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold block text-right">
                    {Math.round((staffCount / (activePackage?.max_users || 5)) * 100)}% capacity filled
                  </span>
                </div>
              </div>

              {/* Bookings Count progress */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-650">
                      <CalendarDays className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">Active Bookings</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Event scheduling limit</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {bookingCount} <span className="text-slate-400 font-bold">/ {activePackage?.max_bookings || 150}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (bookingCount / (activePackage?.max_bookings || 150)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold block text-right">
                    {Math.round((bookingCount / (activePackage?.max_bookings || 150)) * 100)}% capacity filled
                  </span>
                </div>
              </div>

            </div>
          </SettingsCard>
        </div>

        {/* Right Column: Support & Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Subscription Management</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
              Need to extend your current plan billing date, increase booking caps, or request tax integration configuration?
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleOpenRequest(activePackage, 'renewal')}
                className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>Request Plan Renewal</span>
              </button>
              <a
                href="mailto:support@infovex.com"
                className="w-full h-9 border border-slate-250 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Contact Accounts Team</span>
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
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 scale-[1.01]' 
                    : 'border-slate-200 hover:border-slate-350 hover:shadow-custom-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Package Badge */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-base">{pkg.name}</span>
                    {isCurrent && (
                      <span className="text-[8px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
                      <span>Up to <strong>{pkg.max_users}</strong> team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Up to <strong>{pkg.max_bookings}</strong> active bookings</span>
                    </div>
                  </div>

                  {/* Dynamic Features List */}
                  <div className="space-y-2.5 border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-600">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Plan features</span>
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        {pkg.features?.staff_management !== false ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span>Staff Management Dashboard</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        {pkg.features?.vendors !== false ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span>Vendor Directory & Allocation</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        {pkg.features?.reports !== false ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span>Financial Reports & Analytics</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        {pkg.features?.priority_support !== false ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                        )}
                        <span>Priority 24/7 Account Support</span>
                      </span>
                    </div>

                  </div>
                </div>

                {/* Switch Action button */}
                <button
                  onClick={() => handleOpenRequest(pkg, 'upgrade')}
                  disabled={isCurrent}
                  className={`w-full h-9 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isCurrent 
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-md shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : 'Select Upgrade'}</span>
                  {!isCurrent && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAN REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleRequestSubmit}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm leading-tight">Submit Subscription Request</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Action logged under security audits</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Package</label>
                <input 
                  type="text" 
                  value={selectedPkg?.name || 'Standard Plan'} 
                  readOnly 
                  className="px-3 py-2 w-full text-xs font-extrabold bg-slate-50 border border-slate-205 rounded-lg outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Request Operation Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="px-3 py-2 w-full text-xs font-extrabold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="upgrade">Plan Upgrade / Package Shift</option>
                  <option value="renewal">Plan Billing Extension / Renewal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">
                  <span>Additional Request Notes</span>
                  <span className="text-[8px] text-slate-400 font-semibold">{notes.length} / 250 chars</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={250}
                  placeholder="e.g. Please approve plan upgrade to Deluxe. We need extra booking limits for wedding season..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="px-3 py-2 w-full text-xs font-medium border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-indigo-50/35 border border-indigo-100 rounded-xl p-3 flex gap-2.5 text-slate-600">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[9.5px] leading-normal font-semibold">
                  Upon submitting, this package request will log immediately inside active audit checklists. Our accounts department will process this and contact you for invoicing updates.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 border border-slate-250 hover:bg-white text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestChangeMutation.isPending}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {requestChangeMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
