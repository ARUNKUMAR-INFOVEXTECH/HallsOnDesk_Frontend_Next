'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Check,
  ClipboardList,
  Loader2
} from 'lucide-react';

// Formatter Helpers
import { formatCurrency, formatDate } from '@/utils/formatters';
import { obfuscateId } from '@/utils/obfuscate';

// Hooks & Store
import {
  useDashboardQuery,
  useUpcomingBookingsQuery,
  useRecentPaymentsQuery,
  useFollowupsQuery,
  useUnreadNotificationsQuery,
  useSubscriptionQuery,
  useRecentActivitiesQuery,
} from '@/hooks/useDashboardQueries';
import { useAuthStore } from '@/store/authStore';
import { useRequestSubscriptionChange } from '@/hooks/useSettings';
import { toast } from 'sonner';

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
const BookingTrendsChart = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then((m) => m.BookingTrendsChart),
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-100" /> }
);

// StatCard Component
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const requestChange = useRequestSubscriptionChange();

  const halls = user?.accessible_halls || [];
  const isConsolidated = activeHallId === 'all';
  const activeHall = halls.find((h) => h.id === activeHallId)
    || halls.find((h) => h.id === user?.hall_id)
    || halls[0];
  const activeHallName = isConsolidated ? 'Consolidated View (All Halls)' : (activeHall?.hall_name || 'Active Venue');

  // Daily Checklist state & logic
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hod_dashboard_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        const defaultTasks = [
          { id: '1', text: 'Verify pending wedding catering details', done: false },
          { id: '2', text: 'Confirm flower decorator arrival time', done: false },
          { id: '3', text: 'Review today\'s followup telephone logs', done: false },
          { id: '4', text: 'Cross-check client UPI advance receipt', done: false },
        ];
        setTasks(defaultTasks);
        localStorage.setItem('hod_dashboard_tasks', JSON.stringify(defaultTasks));
      }
    }
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    localStorage.setItem('hod_dashboard_tasks', JSON.stringify(updated));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = { id: Date.now().toString(), text: newTaskText.trim(), done: false };
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem('hod_dashboard_tasks', JSON.stringify(updated));
    setNewTaskText('');
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('hod_dashboard_tasks', JSON.stringify(updated));
  };

  // TanStack Query Calls
  const dashboard = useDashboardQuery();
  const upcoming = useUpcomingBookingsQuery();
  const payments = useRecentPaymentsQuery();
  const followups = useFollowupsQuery();
  const unreadNotifs = useUnreadNotificationsQuery();
  const subscriptions = useSubscriptionQuery();
  const activitiesQuery = useRecentActivitiesQuery();

  const handleRefresh = () => {
    dashboard.refetch();
    upcoming.refetch();
    payments.refetch();
    followups.refetch();
    unreadNotifs.refetch();
    subscriptions.refetch();
    activitiesQuery.refetch();
  };

  // 1. Loading Skeletons
  const isLoading =
    dashboard.isLoading ||
    upcoming.isLoading ||
    payments.isLoading ||
    followups.isLoading ||
    subscriptions.isLoading ||
    activitiesQuery.isLoading;

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
          className="btn-primary-grad text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
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
  const analytics = data?.analytics;
  const upcomingEvents = upcoming.data || [];
  const todayFollowups = followups.data || [];
  const activeSubscription = data?.subscription;
  const recentActivities = activitiesQuery.data || [];

  const growthRateVal = analytics?.growth_rate ?? 0;

  // Subscription Banner warnings
  const showSubWarning =
    activeSubscription &&
    activeSubscription.days_until_expiry !== null &&
    activeSubscription.days_until_expiry <= 7 &&
    activeSubscription.days_until_expiry > 0;
  
  const showSubExpired =
    !activeSubscription || (activeSubscription.status !== 'active' && activeSubscription.status !== 'trial');

  const handleRequestRenewal = async () => {
    if (!activeSubscription?.package_id) {
      toast.error('Unable to retrieve current package details for renewal.');
      return;
    }
    try {
      await requestChange.mutateAsync({
        package_id: activeSubscription.package_id,
        request_type: 'renewal',
        notes: 'Quick renewal requested directly from the dashboard alert banner.',
      });
    } catch {
      // Handled in mutation hook
    }
  };

  // Quick Action Handlers
  const quickActions = [
    { label: 'New Booking', href: '/dashboard/bookings', icon: Plus },
    { label: 'New Customer', href: '/dashboard/customers', icon: UserPlus },
    { label: 'New Enquiry', href: '/dashboard/enquiries/new', icon: Inbox },
    { label: 'Record Payment', href: '/dashboard/payments', icon: CreditCard },
  ];

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTimeAgo = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden select-none animate-fadeIn">
        {/* Dynamic background glass shapes for a premium look */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-full">
            {activeHallName}
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white mt-2">
            {getGreeting()}, {user?.name || 'Partner'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed mt-1">
            Manage your weddings, client bookings, phone enquiries, and venue payments from the Infovex Halls operator panel.
          </p>
          <div className="text-[10px] font-bold text-slate-400 font-mono pt-1">
            Logged in as: <span className="text-indigo-200">{user?.email}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Today Date Badge */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex flex-col text-left shrink-0">
            <span className="text-[9px] uppercase font-black text-indigo-300 tracking-wider">Today's Date</span>
            <span className="text-xs font-extrabold text-white font-mono mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-transparent rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Subscription Warnings alerts */}
      {showSubExpired ? (
        <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-md flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto my-6 animate-fadeIn">
          <div className="h-16 w-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center border border-red-200 shadow-sm shrink-0">
            <AlertCircle className="h-8 w-8 text-red-650 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">SaaS Subscription Expired</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Your venue subscription plan has expired. To restore normal dashboard operations and keep using the booking portal, please renew your platform plan.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-sans text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Last Plan Tier</span>
              <span className="text-gray-800 font-bold text-sm block">{activeSubscription?.plan || 'Free Trial Plan'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">End Date / Expired On</span>
              <span className="text-gray-800 font-bold text-sm block font-mono">
                {activeSubscription?.end_date ? new Date(activeSubscription.end_date).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Max Users Limit</span>
              <span className="text-gray-800 font-bold text-sm block">{activeSubscription?.max_users || 'N/A'} operators</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Max Bookings Limit</span>
              <span className="text-gray-800 font-bold text-sm block">
                {activeSubscription?.max_bookings ? `${activeSubscription.max_bookings} bookings` : 'Unlimited'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-md">
            <button
              onClick={handleRequestRenewal}
              disabled={requestChange.isPending}
              className="w-full flex items-center justify-center py-2.5 bg-violet-650 hover:bg-violet-750 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-650/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {requestChange.isPending ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5 text-white mr-1.5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Request Instant Renewal</span>
              )}
            </button>
            <Link
              href="/settings/subscription"
              className="w-full flex items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Compare Plans / Upgrade
            </Link>
          </div>
        </div>
      ) : (
        <>
          {showSubWarning && activeSubscription && (
            <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
              <span>
                Reminder: Your {activeSubscription.plan} plan expires in {activeSubscription.days_until_expiry} days.
              </span>
              <Link href="/settings/subscription" className="px-3 py-1 btn-primary-grad text-white rounded-lg text-xs font-medium shadow-sm transition-colors">
                Renew
              </Link>
            </div>
          )}

          {/* Main KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link href="/dashboard/bookings" className="w-full h-full flex select-none hover:-translate-y-0.5 transition-transform duration-150">
          <StatCard
            title="Total Bookings"
            value={summary?.total_bookings || 0}
            icon={<CalendarDays className="h-5 w-5" />}
            change={analytics?.bookings_growth !== undefined ? Math.abs(analytics.bookings_growth) : 0}
            changeType={analytics?.bookings_growth !== undefined && analytics.bookings_growth >= 0 ? "increase" : "decrease"}
          />
        </Link>
        <Link href="/dashboard/payments" className="w-full h-full flex select-none hover:-translate-y-0.5 transition-transform duration-150">
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(revenue?.this_month || revenue?.total_collected || 0)}
            icon={<CreditCard className="h-5 w-5" />}
            change={analytics?.growth_rate !== undefined ? Math.abs(analytics.growth_rate) : 0}
            changeType={analytics?.growth_rate !== undefined && analytics.growth_rate >= 0 ? "increase" : "decrease"}
          />
        </Link>
        <Link href="/dashboard/enquiries" className="w-full h-full flex select-none hover:-translate-y-0.5 transition-transform duration-150">
          <StatCard
            title="Active Enquiries"
            value={(summary as any)?.active_enquiries || 0}
            icon={<Inbox className="h-5 w-5" />}
            description="Leads in progress"
          />
        </Link>
        <Link href="/dashboard/customers" className="w-full h-full flex select-none hover:-translate-y-0.5 transition-transform duration-150">
          <StatCard
            title="Total Customers"
            value={summary?.total_customers || 0}
            icon={<Users className="h-5 w-5" />}
            change={analytics?.customers_growth !== undefined ? Math.abs(analytics.customers_growth) : 0}
            changeType={analytics?.customers_growth !== undefined && analytics.customers_growth >= 0 ? "increase" : "decrease"}
          />
        </Link>
        <Link href="/dashboard/payments" className="w-full h-full flex select-none hover:-translate-y-0.5 transition-transform duration-150">
          <StatCard
            title="Pending Payments"
            value={formatCurrency(revenue?.total_pending || 0)}
            icon={<AlertCircle className="h-5 w-5" />}
            change={analytics?.pending_payments_growth !== undefined ? Math.abs(analytics.pending_payments_growth) : 0}
            changeType={analytics?.pending_payments_growth !== undefined && analytics.pending_payments_growth >= 0 ? "increase" : "decrease"}
          />
        </Link>
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
                <span className="text-base text-slate-800 font-bold font-mono">
                  {analytics?.enquiry_conversion_rate !== undefined ? `${analytics.enquiry_conversion_rate}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-[#159DFC]/10 text-[#159DFC] flex items-center justify-center shrink-0 border border-[#159DFC]/20">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Avg. Order Value</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">
                  {formatCurrency(analytics?.avg_order_value || 0)}
                </span>
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
                <span className="text-base text-slate-800 font-bold font-mono">
                  {analytics?.collection_rate !== undefined ? `${analytics.collection_rate}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0 border border-primary-light/10">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">MoM Revenue Growth</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base text-slate-800 font-bold font-mono">
                  {growthRateVal >= 0 ? '+' : ''}{growthRateVal}%
                </span>
                <span className={`text-[9px] font-bold font-mono ${growthRateVal >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {growthRateVal >= 0 ? 'Increase MoM' : 'Decrease MoM'}
                </span>
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
        <EnquiryFunnelChart data={analytics?.enquiry_funnel} />
        <EventCategoryChart data={analytics?.event_distribution} />
      </div>

      {/* Analytics Charts Row 3 (Booking Trends month-over-month) */}
      <div className="grid grid-cols-1 gap-6">
        <BookingTrendsChart />
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Tables */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upcoming marriage schedules table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Upcoming Marriage Schedules</h3>
              <Link href="/dashboard/calendar" className="text-xs font-bold text-[#159DFC] hover:text-[#002499] inline-flex items-center gap-1 transition-colors">
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
                          <Link href={`/dashboard/bookings?id=${event.id}`} className="text-[#159DFC] hover:text-[#002499] font-bold transition-colors">
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
              <Link href="/dashboard/bookings" className="text-xs font-bold text-[#159DFC] hover:text-[#002499] inline-flex items-center gap-1 transition-colors">
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
            {isConsolidated ? (
              <div className="text-center py-4 bg-slate-50 border border-slate-100 rounded-xl px-3 space-y-2 select-none">
                <AlertCircle className="h-5 w-5 mx-auto text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 block">Single Venue Context Required</span>
                <p className="text-[9px] font-semibold text-slate-400 leading-relaxed">
                  Please select a specific wedding hall from the venue switcher above to register new bookings, enquiries, or payments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={i}
                      href={action.href}
                      className="flex flex-col items-center justify-center p-4 border border-slate-100 hover:border-[#159DFC] rounded-xl text-center bg-slate-50 hover:bg-[#159DFC]/5 transition-all duration-150 cursor-pointer"
                    >
                      <Icon className="h-5 w-5 mb-2 shrink-0 text-[#159DFC]" />
                      <span className="text-[10px] font-bold text-slate-600 leading-tight block">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Followups */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex justify-between items-center">
              <span>Today's Follow-ups</span>
              <span className="h-2 w-2 rounded-full bg-[#159DFC] animate-pulse" />
            </h4>
            
            <div className="space-y-3">
              {todayFollowups.length > 0 ? (
                todayFollowups.slice(0, 3).map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-3 border border-slate-100 hover:bg-slate-50/50 rounded-lg transition-colors text-xs font-semibold">
                    <div>
                      {f.enquiry_id ? (
                        <Link
                          href={`/dashboard/enquiries/${obfuscateId(f.enquiry_id)}`}
                          className="font-bold text-slate-800 hover:text-violet-650 hover:underline leading-snug block transition-colors cursor-pointer"
                        >
                          {f.customer_name}
                        </Link>
                      ) : (
                        <div className="font-bold text-slate-800 leading-snug">{f.customer_name}</div>
                      )}
                      <div className="text-[10px] text-slate-450 font-mono mt-1 leading-none">{f.phone}</div>
                      {f.notes && <p className="text-[10px] text-slate-400 mt-1.5 italic font-medium">"{f.notes}"</p>}
                    </div>
                    <a
                      href={`tel:${f.phone}`}
                      className="p-1.5 rounded-lg bg-[#159DFC]/10 hover:bg-[#159DFC]/20 text-[#159DFC] shrink-0 border border-[#159DFC]/25 shadow-sm transition-all"
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

          {/* Daily Operational Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200 animate-fadeIn">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-[#159DFC]" />
                Daily Checklist
              </span>
              <span className="text-[9px] text-slate-450 font-mono font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.done).length}/{tasks.length} done
              </span>
            </h4>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add daily operations task..."
                className="flex-1 h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-[#159DFC] transition-all font-semibold text-slate-705"
              />
              <button
                type="submit"
                className="h-8 w-8 rounded-lg btn-primary-grad text-white flex items-center justify-center shadow-sm shrink-0 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 border border-slate-100 hover:bg-slate-55 rounded-lg transition-colors text-xs font-semibold group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          task.done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-slate-300 hover:border-slate-400 text-transparent'
                        }`}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className={`truncate text-slate-700 ${task.done ? 'line-through text-slate-400 font-medium' : ''}`}>
                        {task.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50/50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  No checklist items.
                </div>
              )}
            </div>
          </div>

          {/* Recent Operations Log (Recent Activity) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all duration-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-[#159DFC]" />
              Recent Operations Log
            </h4>
            
            <div className="relative pl-3 border-l border-slate-200 space-y-5 ml-1">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((act) => {
                  const title = act.action
                    .split('.')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <div key={act.id} className="relative flex gap-2.5 items-start text-xs font-semibold">
                      {/* Timeline connector dot */}
                      <div className="absolute -left-[16.5px] h-2 w-2 rounded-full bg-[#159DFC] border-2 border-white mt-1 shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-slate-800 text-[11px] truncate leading-none">{title}</span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider shrink-0 font-mono">{formatTimeAgo(act.created_at)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-medium">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      </>
      )}

    </div>
  );
}
