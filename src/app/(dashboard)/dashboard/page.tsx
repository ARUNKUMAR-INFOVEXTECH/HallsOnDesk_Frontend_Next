'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  CalendarDays,
  Users,
  CreditCard,
  AlertCircle,
  Briefcase,
  Inbox,
  UserCheck,
  CalendarCheck,
  Plus,
  RefreshCw,
  Activity,
  PhoneCall,
  UserPlus,
  Sparkles,
  Percent,
  TrendingUp,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

// Formatter Helpers
import { formatCurrency, formatDate } from '@/utils/formatters';

// Hooks & Store
import {
  useDashboardQuery,
  useUpcomingBookingsQuery,
  useRecentPaymentsQuery,
  useFollowupsQuery,
  useUnreadNotificationsQuery,
  useSubscriptionQuery,
} from '@/hooks/useDashboardQueries';
import { useAuthStore } from '@/store/authStore';

// Dynamic Charts Imports (improves page load & prevents Next.js hydration issues)
const RevenueChart = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then((m) => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-100" /> }
);
const PaymentStatusChart = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then((m) => m.PaymentStatusChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-100" /> }
);
const EnquiryFunnelChart = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then((m) => m.EnquiryFunnelChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-100" /> }
);
const EventCategoryChart = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then((m) => m.EventCategoryChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-100" /> }
);

// StatCard Component
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // TanStack Query Calls
  const dashboard = useDashboardQuery();
  const upcoming = useUpcomingBookingsQuery();
  const payments = useRecentPaymentsQuery();
  const followups = useFollowupsQuery();
  const unreadNotifs = useUnreadNotificationsQuery();
  const subscriptions = useSubscriptionQuery();

  const handleRefresh = () => {
    dashboard.refetch();
    upcoming.refetch();
    payments.refetch();
    followups.refetch();
    unreadNotifs.refetch();
    subscriptions.refetch();
  };

  // 1. Loading Skeletons
  const isLoading =
    dashboard.isLoading ||
    upcoming.isLoading ||
    payments.isLoading ||
    followups.isLoading ||
    subscriptions.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Top Skeletons */}
        <div className="h-10 bg-slate-100 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] bg-slate-100 rounded-xl border border-slate-200" />
          ))}
        </div>
        
        {/* Charts Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="lg:col-span-4 h-80 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
      </div>
    );
  }

  // 2. Error State Handler
  const hasError = dashboard.isError;
  if (hasError) {
    return (
      <div className="border border-red-100 bg-red-50/20 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 tracking-tight">
          Failed to load dashboard metrics
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          The connection to the backend service timed out or returned an error. Ensure your credentials are valid or trigger a manual refresh.
        </p>
        <button
          onClick={handleRefresh}
          className="bg-[#EE9B00] hover:bg-[#D48A00] text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const data = dashboard.data;
  const summary = data?.summary;
  const revenue = data?.revenue;
  const upcomingEvents = upcoming.data || [];
  const todayFollowups = followups.data || [];
  const activeSubscription = data?.subscription;

  // Subscription Banner warnings
  const showSubWarning =
    activeSubscription &&
    activeSubscription.days_until_expiry !== null &&
    activeSubscription.days_until_expiry <= 7 &&
    activeSubscription.days_until_expiry > 0;
  
  const showSubExpired =
    !activeSubscription || activeSubscription.status !== 'active';

  // Quick Action Handlers
  const quickActions = [
    { label: 'New Booking', href: '/dashboard/bookings', icon: Plus },
    { label: 'New Customer', href: '/dashboard/customers', icon: UserPlus },
    { label: 'New Enquiry', href: '/dashboard/enquiries', icon: Inbox },
    { label: 'Record Payment', href: '/dashboard/payments', icon: CreditCard },
  ];

  // Activities Log timeline mock data
  const activities = [
    { id: '1', title: 'Booking Confirmed', desc: 'Ramesh Kumar confirmed wedding Muhurtham booking.', time: '2 hours ago' },
    { id: '2', title: 'Payment Logged', desc: 'Received ₹50,000 deposit via Bank Transfer for Arun reception.', time: '4 hours ago' },
    { id: '3', title: 'New Enquiry', desc: 'Enquiry for Dec 12 wedding from Priya (800 guests).', time: '1 day ago' },
    { id: '4', title: 'Staff Onboarded', desc: 'Added Vijay Raghavan as Manager.', time: '2 days ago' },
  ];

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header Area */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {getGreeting()}, {user?.name || 'Partner'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-2">
            Manage your weddings, bookings, client payments, and analytics from the HallsOnDesk operator panel.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Subscription Warnings alerts */}
      {showSubExpired && (
        <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 text-red-800 text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
          <span>
            Critical: No active subscription. Renew your package to prevent booking portal blocks.
          </span>
          <Link href="/dashboard/settings" className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium shadow-sm transition-colors">
            Renew Plan
          </Link>
        </div>
      )}
      {showSubWarning && activeSubscription && (
        <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
          <span>
            Reminder: Your {activeSubscription.plan} plan expires in {activeSubscription.days_until_expiry} days.
          </span>
          <Link href="/dashboard/settings" className="px-3 py-1 bg-[#EE9B00] hover:bg-[#D48A00] text-white rounded-lg text-xs font-medium shadow-sm transition-colors">
            Renew
          </Link>
        </div>
      )}

      {/* Main KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={summary?.total_bookings || 0}
          icon={<CalendarDays className="h-5 w-5" />}
          change={8.5}
          changeType="increase"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(revenue?.this_month || revenue?.total_collected || 0)}
          icon={<CreditCard className="h-5 w-5" />}
          change={20.1}
          changeType="increase"
        />
        <StatCard
          title="Total Customers"
          value={summary?.total_customers || 0}
          icon={<Users className="h-5 w-5" />}
          change={12.4}
          changeType="increase"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(revenue?.total_pending || 0)}
          icon={<AlertCircle className="h-5 w-5" />}
          change={-5.2}
          changeType="decrease"
        />
      </div>

      {/* Advanced Performance Analytics Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Analytics Metrics</h4>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Core performance percentages for venue conversion and collections</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Enquiry Conversion</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">76.5%</span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono">+2.4%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-[#EE9B00]/10 text-[#EE9B00] flex items-center justify-center shrink-0 border border-[#EE9B00]/20">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Avg. Order Value</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">₹1.25L</span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono">+4.1%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Collection Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">91.2%</span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono">+1.8%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0 border border-primary-light/10">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">YoY Revenue Growth</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">+18.4%</span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono">+0.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row 1 (Revenue & Booking Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RevenueChart />
        <PaymentStatusChart
          total={revenue?.total_revenue || 0}
          confirmed={summary?.confirmed_bookings || 0}
          pending={revenue?.total_pending || 0}
        />
      </div>

      {/* Analytics Charts Row 2 (Enquiry Funnel & Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <EnquiryFunnelChart enquiries={upcomingEvents} />
        <EventCategoryChart />
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Tables */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upcoming events table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Upcoming Marriage Schedules</h3>
              <Link href="/dashboard/calendar" className="text-xs font-bold text-[#EE9B00] hover:text-[#D48A00] inline-flex items-center gap-1 transition-colors">
                View Calendar
              </Link>
            </div>

            <div className="overflow-x-auto text-xs text-slate-650">
              {upcomingEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">
                  No upcoming weddings scheduled.
                </div>
              ) : (
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200 h-10">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Event Name</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/50 transition-colors h-14 font-medium">
                        <td className="px-6 py-3 text-slate-800 font-mono">{formatDate(event.event_date)}</td>
                        <td className="px-6 py-3 text-slate-800 font-bold">{event.event_title || event.bookings?.event_name}</td>
                        <td className="px-6 py-3 text-slate-500 font-bold">{event.bookings?.customers?.customer_name || '-'}</td>
                        <td className="px-6 py-3 text-slate-500 font-mono font-bold">{event.bookings?.customers?.phone || '-'}</td>
                        <td className="px-6 py-3 text-right">
                          <Link href={`/dashboard/bookings?id=${event.id}`} className="text-[#EE9B00] hover:text-[#D48A00] font-bold transition-colors">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Bookings list */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Recent Bookings</h3>
              <Link href="/dashboard/bookings" className="text-xs font-bold text-[#EE9B00] hover:text-[#D48A00] inline-flex items-center gap-1 transition-colors">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto text-xs text-slate-650">
              {data?.recent_bookings && data.recent_bookings.length > 0 ? (
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200 h-10">
                    <tr>
                      <th className="px-6 py-3">Client Name</th>
                      <th className="px-6 py-3">Event Type</th>
                      <th className="px-6 py-3">Start Date</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {data.recent_bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors h-14 text-slate-700">
                        <td className="px-6 py-3">
                          <div className="font-bold text-slate-800">{booking.customers?.customer_name || 'Guest'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1 leading-none font-semibold">{booking.customers?.phone}</div>
                        </td>
                        <td className="px-6 py-3 capitalize text-slate-600">{booking.event_type}</td>
                        <td className="px-6 py-3 text-slate-500 font-mono">{formatDate(booking.start_date)}</td>
                        <td className="px-6 py-3 font-bold text-slate-800 font-mono">{formatCurrency(booking.total_amount)}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : booking.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-750 border-rose-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 font-medium">
                  No bookings found.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Followups, Quick Actions, Timeline Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Operations</h4>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-4 border border-slate-100 hover:border-[#EE9B00] rounded-xl text-center bg-slate-50 hover:bg-[#EE9B00]/5 transition-all duration-150 cursor-pointer"
                  >
                    <Icon className="h-5 w-5 mb-2 shrink-0 text-[#EE9B00]" />
                    <span className="text-[10px] font-bold text-slate-600 leading-tight block">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Today's Followups */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
              <span>Today's Follow-ups</span>
              <span className="h-2 w-2 rounded-full bg-[#EE9B00] animate-pulse" />
            </h4>
            
            <div className="space-y-3">
              {todayFollowups.length > 0 ? (
                todayFollowups.slice(0, 3).map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-3 border border-slate-100 hover:bg-slate-50/50 rounded-lg transition-colors text-xs font-semibold">
                    <div>
                      <div className="font-bold text-slate-800 leading-snug">{f.customer_name}</div>
                      <div className="text-[10px] text-slate-450 font-mono mt-1 leading-none">{f.phone}</div>
                      {f.notes && <p className="text-[10px] text-slate-400 mt-1.5 italic font-medium">"{f.notes}"</p>}
                    </div>
                    <a
                      href={`tel:${f.phone}`}
                      className="p-1.5 rounded-lg bg-[#EE9B00]/10 hover:bg-[#EE9B00]/20 text-[#EE9B00] shrink-0 border border-[#EE9B00]/25 shadow-sm transition-all"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  No telephone reminders today.
                </div>
              )}
            </div>
          </div>

          {/* Recent Operations Log (Recent Activity) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-[#EE9B00]" />
              Recent Operations Log
            </h4>
            
            <div className="relative pl-3 border-l border-slate-200 space-y-5 ml-1">
              {activities.map((act) => (
                <div key={act.id} className="relative flex gap-2.5 items-start text-xs font-semibold">
                  {/* Timeline connector dot */}
                  <div className="absolute -left-[16.5px] h-2 w-2 rounded-full bg-[#EE9B00] border-2 border-white mt-1 shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-800 text-[11px] truncate leading-none">{act.title}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider shrink-0 font-mono">{act.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-medium">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
