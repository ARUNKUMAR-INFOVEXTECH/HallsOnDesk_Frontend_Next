'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminHallDetails, useAdminHalls, useAdminHallStats, useAdminHallActivity, useAdminHallSubscriptionPayments } from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Activity,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  BadgeAlert,
  Eye,
  EyeOff,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { deobfuscateId } from '@/utils/obfuscate';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function AdminHallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = deobfuscateId(params.id as string);

  const { data: hall, isLoading, isError } = useAdminHallDetails(id);
  const { data: hallStats, isLoading: statsLoading } = useAdminHallStats(id);
  const { data: hallActivity = [], isLoading: activityLoading } = useAdminHallActivity(id);
  const { data: subscriptionPayments = [] } = useAdminHallSubscriptionPayments(id);
  const { suspendHall, activateHall } = useAdminHalls();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'billing' | 'activity'>('overview');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loading Venue Profile...</p>
      </div>
    );
  }

  if (isError || !hall) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-lg mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Hall Not Found</h3>
        <p className="text-xs text-gray-450 mt-1">This hall might have been deleted, or the endpoint returned an error.</p>
        <button
          onClick={() => router.push('/admin/halls')}
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Halls
        </button>
      </div>
    );
  }

  const activeSub = hall.hall_subscriptions?.[0];
  const packageName = activeSub?.packages?.name || 'Free Trial';
  const subStatus = activeSub?.status || 'trial';
  
  const statusStyle = STATUS_STYLES.hall[hall.status === 'active' ? 'active' : 'inactive'];
  const subStyle = STATUS_STYLES.subscription[subStatus as 'active' | 'trial' | 'suspended' | 'expired'];

  // Real bookings and financial statistics from API
  const bookingsCount = hallStats?.bookingsCount ?? 0;
  const confirmedBookings = hallStats?.confirmedBookings ?? 0;
  const pendingBookings = hallStats?.pendingBookings ?? 0;
  const staffCount = hallStats?.staffCount ?? 0;
  const totalRevenue = hallStats?.totalRevenue ?? 0;
  const pendingRevenue = hallStats?.pendingBalance ?? 0;
  const maxUsers = hallStats?.maxUsers ?? activeSub?.packages?.max_users ?? null;
  const maxBookings = hallStats?.maxBookings ?? activeSub?.packages?.max_bookings ?? null;

  const handleStatusToggle = async () => {
    if (hall.status === 'active') {
      if (confirm('Suspend access for this venue? All tenant users will be blocked.')) {
        await suspendHall(hall.id);
      }
    } else {
      await activateHall(hall.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs and Action Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/admin/halls" className="hover:text-violet-600">Halls</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 truncate">{hall.hall_name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center font-bold text-base">
              {hall.hall_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">{hall.hall_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusStyle.bg}`}>
                  {statusStyle.label}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${subStyle.bg}`}>
                  {subStyle.label}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Since: {hall.created_at ? new Date(hall.created_at).toLocaleDateString('en-GB') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStatusToggle}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                hall.status === 'active'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {hall.status === 'active' ? (
                <>
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Suspend System Access</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Activate System Access</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-150 gap-6 text-sm font-semibold text-gray-500">
        {(['overview', 'users', 'billing', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-violet-600 text-violet-600 font-bold'
                : 'border-transparent hover:text-gray-800'
            }`}
          >
            {tab === 'billing' ? 'Subscription & Revenue' : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Changes based on selected Tab) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Hall Information */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Venue Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Registered Email</span>
                    <span className="text-gray-950 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-400" /> {hall.email}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Primary Contact Phone</span>
                    <span className="text-gray-950 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" /> {hall.phone}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">District / City</span>
                    <span className="text-gray-950 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" /> {hall.city}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Registered Owner Name</span>
                    <span className="text-gray-950 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" /> {hall.owner_name}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Full Venue Location Address</span>
                    <p className="text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-2.5 leading-relaxed font-medium">
                      {hall.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking & Payments statistics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bookings */}
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-50 pb-3 mb-4">
                    <Calendar className="h-4.5 w-4.5 text-violet-600" />
                    <span>Booking Volume Metrics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-violet-50/50 rounded-lg p-3 border border-violet-100">
                      <span className="text-xl font-extrabold text-violet-700 block font-mono">{bookingsCount}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Total</span>
                    </div>
                    <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                       <span className="text-xl font-extrabold text-green-700 block font-mono">{confirmedBookings}</span>
                       <span className="text-[9px] font-bold text-gray-400 uppercase">Confirmed</span>
                     </div>
                     <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                       <span className="text-xl font-extrabold text-amber-700 block font-mono">{pendingBookings}</span>
                       <span className="text-[9px] font-bold text-gray-400 uppercase">Pending</span>
                     </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-50 pb-3 mb-4">
                    <DollarSign className="h-4.5 w-4.5 text-violet-600" />
                    <span>Platform Billing Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Total MRR Collected</span>
                      <span className="text-lg font-bold text-gray-900 tracking-tight font-sans block mt-1">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Pending Due Balance</span>
                      <span className="text-lg font-bold text-red-650 tracking-tight font-sans block mt-1">
                        ₹{pendingRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-sm">Tenant Users Profile</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Staff Count: {staffCount}</span>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {(hall.users && hall.users.length > 0) ? (
                  hall.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs border border-violet-100">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-950 block">{user.name}</span>
                          <span className="text-[10px] text-gray-500 font-semibold">{user.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {user.backupPassword ? (
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block leading-none">Password Backup</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[11px] text-gray-700 bg-gray-150 border border-gray-200 px-1.5 py-0.5 rounded font-bold">
                                {visiblePasswords[user.id] ? user.backupPassword : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-gray-400 hover:text-gray-650 p-0.5 cursor-pointer inline-flex items-center"
                              >
                                {visiblePasswords[user.id] ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block leading-none">Password</span>
                            <span className="text-[10px] text-gray-450 font-bold block mt-1">Self-Updated / No Backup</span>
                          </div>
                        )}
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-150 rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {/* Fallback mock users representing typical hosts */}
                    {[
                      { name: hall.owner_name, email: hall.email, role: 'owner' },
                      { name: `Manager for ${hall.hall_name}`, email: `manager@${hall.email.split('@')[1]}`, role: 'manager' },
                    ].map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs border border-violet-100">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-950 block">{user.name}</span>
                            <span className="text-[10px] text-gray-500 font-semibold">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-150 rounded-full capitalize">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Subscription Detail Info */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Active Subscription Contract</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${subStyle.bg}`}>
                    {subStyle.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Pricing Package Plan</span>
                    <span className="text-gray-900 font-bold text-sm block">{packageName}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Monthly Recurring Fee</span>
                    <span className="text-gray-900 font-bold text-sm block">
                      {activeSub?.packages?.price ? `₹${activeSub.packages.price.toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Setup/Implementation Fee</span>
                    <span className="text-gray-900 font-bold text-sm block">
                      {activeSub?.packages?.setup_fee !== undefined && activeSub.packages.setup_fee !== null
                        ? `₹${activeSub.packages.setup_fee.toLocaleString('en-IN')}`
                        : '₹0'}
                    </span>
                  </div>

                  <hr className="col-span-1 sm:col-span-3 border-gray-50 my-1" />

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Contract Start Date</span>
                    <span className="text-gray-900 block">
                      {activeSub?.start_date ? new Date(activeSub.start_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Contract Expiry Date</span>
                    <span className="text-gray-900 block">
                      {activeSub?.end_date ? new Date(activeSub.end_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Billing Payment Status</span>
                    <span className="text-gray-900 capitalize block">
                      {activeSub?.payment_status || 'Paid / Current'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Setup Fee Payment Status */}
              {hall.setup_fee_payments && hall.setup_fee_payments.length > 0 && (() => {
                const setupPayment = hall.setup_fee_payments[0];
                const setupBalance = Math.max(0, setupPayment.setup_fee_amount - setupPayment.amount_paid);
                
                let badgeColor = '';
                let statusLabel = '';
                if (setupPayment.status === 'paid') {
                  badgeColor = 'bg-green-50 text-green-700 border-green-200';
                  statusLabel = 'Fully Paid';
                } else if (setupPayment.status === 'partially_paid') {
                  badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                  statusLabel = 'Partially Paid';
                } else {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  statusLabel = 'Unpaid';
                }

                return (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4.5 w-4.5 text-violet-600" />
                        <h3 className="font-bold text-gray-900 text-sm">Onboarding Setup Fee Ledger</h3>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Billed Amount</span>
                        <span className="text-gray-900 font-bold text-sm block font-mono">
                          {formatCurrency(setupPayment.setup_fee_amount)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Amount Paid</span>
                        <span className="text-emerald-600 font-bold text-sm block font-mono">
                          {formatCurrency(setupPayment.amount_paid)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Outstanding Balance</span>
                        <span className={`font-bold text-sm block font-mono ${setupBalance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {formatCurrency(setupBalance)}
                        </span>
                      </div>

                      <hr className="col-span-1 sm:col-span-3 border-gray-50 my-1" />

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment Channel</span>
                        <span className="text-gray-900 block capitalize">
                          {setupPayment.payment_method === 'none' ? 'N/A' : setupPayment.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block font-mono">UTR / Transaction Ref</span>
                        <span className="text-gray-900 font-mono block">
                          {setupPayment.transaction_ref_no || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment / Last Updated Date</span>
                        <span className="text-gray-900 block">
                          {setupPayment.updated_at ? new Date(setupPayment.updated_at).toLocaleDateString('en-GB') : (setupPayment.due_date ? new Date(setupPayment.due_date).toLocaleDateString('en-GB') : 'N/A')}
                        </span>
                      </div>

                      {setupPayment.notes && (
                        <div className="col-span-1 sm:col-span-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-500 italic mt-1">
                          <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block not-italic mb-0.5">Payment Remarks</span>
                          "{setupPayment.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Monthly Subscription Payments Log */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Monthly Subscription Payments Log</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Audit log of all subscription payments submitted by this hall owner.</p>
                </div>

                <div className="overflow-x-auto">
                  {subscriptionPayments.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-1">
                      <Info className="h-5 w-5 text-slate-400" />
                      <span>No subscription payments recorded yet.</span>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Submitted On</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Amount</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">UTR Ref No</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Method</th>
                          <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {subscriptionPayments.map((p) => {
                          let badgeColor = '';
                          let statusText = '';
                          if (p.status === 'approved') {
                            badgeColor = 'bg-green-50 text-green-700 border-green-200';
                            statusText = 'Approved';
                          } else if (p.status === 'rejected') {
                            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                            statusText = 'Rejected';
                          } else {
                            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                            statusText = 'Pending';
                          }

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/20">
                              <td className="px-5 py-3 text-slate-500 font-medium">
                                {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : 'N/A'}
                              </td>
                              <td className="px-5 py-3 font-mono font-bold text-slate-800">
                                {formatCurrency(p.amount)}
                              </td>
                              <td className="px-5 py-3 font-mono text-slate-650">
                                {p.transaction_ref_no}
                              </td>
                              <td className="px-5 py-3 text-slate-500 uppercase">
                                {p.payment_method}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Package features list */}
              {activeSub?.packages?.features && Array.isArray(activeSub.packages.features) && (
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3 mb-4">Plan Access Privileges</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                    {activeSub.packages.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-600 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3 mb-4">Venue Activity Timeline</h3>

              {activityLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs font-medium">Loading activity logs...</span>
                </div>
              ) : hallActivity.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs font-medium">No activity logs found for this venue.</p>
                </div>
              ) : (
                <div className="space-y-6 pl-3 relative border-l border-gray-100 py-2">
                  {hallActivity.map((act, i) => (
                    <div key={act.id} className="relative space-y-1">
                      <span className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                        <span className="h-1 w-1 bg-violet-600 rounded-full" />
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-gray-900">{act.title}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {new Date(act.timestamp).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{act.description}</p>
                      {act.actor && (
                        <span className="text-[10px] text-violet-600 font-semibold">by {act.actor}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar (Metadata and limits info) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Operational Limits</h4>

            <div className="space-y-3.5 text-xs font-semibold text-gray-600">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Staff Accounts</span>
                  <span className="text-gray-900">{staffCount} / {maxUsers !== null ? maxUsers : '∞'} used</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: `${maxUsers ? Math.min((staffCount / maxUsers) * 100, 100) : 50}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Monthly Bookings</span>
                  <span className="text-gray-900">{bookingsCount} / {maxBookings !== null ? maxBookings : '∞'} limit</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: `${maxBookings ? Math.min((bookingsCount / maxBookings) * 100, 100) : 50}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick links card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Admin Actions</h4>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <button
                onClick={() => router.push('/admin/halls')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left cursor-pointer"
              >
                <span>Return to Listings</span>
                <ArrowLeft className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
