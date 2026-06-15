'use client';

import React, { useState } from 'react';
import { useAdminDashboardData, useAdminAnalytics } from '@/hooks/useAdmin';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Users,
  Server,
  Database,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [timePeriod, setTimePeriod] = useState<'30d' | '3m' | '6m' | '1y'>('30d');
  const { kpis, systemHealth, activities, isLoading: dashboardLoading } = useAdminDashboardData();
  const { analyticsData, isLoading: analyticsLoading } = useAdminAnalytics(timePeriod);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  const COLORS = ['#7C3AED', '#EE9B00', '#10B981', '#3B82F6', '#EF4444'];

  const isLoading = dashboardLoading || analyticsLoading;

  // Render Loader Skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="h-4 w-48 bg-gray-150 rounded-lg mt-2" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-100 rounded-full" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded mt-4" />
            </div>
          ))}
        </div>

        {/* Charts skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-white border border-gray-100 rounded-xl p-6" />
          <div className="lg:col-span-4 h-96 bg-white border border-gray-100 rounded-xl p-6" />
        </div>
      </div>
    );
  }

  const kpiList = [
    { label: 'Total Halls', value: kpis.totalHalls.value, growth: kpis.totalHalls.growth, trend: kpis.totalHalls.trend, icon: Building2, color: 'text-violet-600 bg-violet-50 border-violet-100' },
    { label: 'Active Halls', value: kpis.activeHalls.value, growth: kpis.activeHalls.growth, trend: kpis.activeHalls.trend, icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Trial Halls', value: kpis.trialHalls.value, growth: kpis.trialHalls.growth, trend: kpis.trialHalls.trend, icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Expired Subs', value: kpis.expiredSubscriptions.value, growth: kpis.expiredSubscriptions.growth, trend: kpis.expiredSubscriptions.trend, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100' },
    { label: 'Monthly Revenue', value: formatCurrency(kpis.monthlyRevenue.value), growth: kpis.monthlyRevenue.growth, trend: kpis.monthlyRevenue.trend, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Annual Revenue', value: formatCurrency(kpis.annualRevenue.value), growth: kpis.annualRevenue.growth, trend: kpis.annualRevenue.trend, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'New Signups', value: kpis.newSignups.value, growth: kpis.newSignups.growth, trend: kpis.newSignups.trend, icon: UserPlus, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { label: 'Total Users', value: kpis.totalUsers.value, growth: kpis.totalUsers.growth, trend: kpis.totalUsers.trend, icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Infovex venue hosting management, revenue performance, and system diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/halls/new"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Hall</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth >= 0;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
                  {kpi.value}
                </span>
                <div
                  className={`flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isPositive
                      ? 'bg-green-50 text-green-700 border border-green-150'
                      : 'bg-red-50 text-red-700 border border-red-150'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{Math.abs(kpi.growth)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Analytics Area Chart */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-8 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Revenue Collections</h3>
              <p className="text-[11px] text-gray-400 font-medium">Monthly recurring subscription revenues & setup fees.</p>
            </div>
            {/* Filter buttons */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-150 shrink-0 self-start sm:self-center">
              {(['30d', '3m', '6m', '1y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTimePeriod(p)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    timePeriod === p
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {p === '30d' ? '30 Days' : p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '1 Year'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSetup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EE9B00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EE9B00" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={8} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${formatNumber(val)}`}
                  dx={-5}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(value: any) => [`₹${formatNumber(value)}`]}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="mrr" fill="url(#colorMrr)" stroke="#7C3AED" strokeWidth={2} name="Monthly Recurring (MRR)" />
                <Area type="monotone" dataKey="setupFees" fill="url(#colorSetup)" stroke="#EE9B00" strokeWidth={2} name="Setup Fees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Distribution Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="border-b border-gray-50 pb-4 mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Package Distribution</h3>
            <p className="text-[11px] text-gray-400 font-medium">Breakdown of registered venues by package tiers.</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.packageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {analyticsData?.packageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [value, 'Halls']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-gray-800">{analyticsData?.packageDistribution.reduce((acc, c) => acc + c.count, 0) || 11}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Halls</span>
            </div>
          </div>

          {/* Pie Custom Legend */}
          <div className="space-y-1.5 pt-4 border-t border-gray-50 mt-4">
            {analyticsData?.packageDistribution.map((pkg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{pkg.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <span>{pkg.count} halls</span>
                  <span className="text-[11px] text-gray-400">({pkg.value}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activities & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activities */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-6 flex flex-col">
          <div className="border-b border-gray-50 pb-4 mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Recent Activities</h3>
            <p className="text-[11px] text-gray-400 font-medium">Real-time operational events from host instances.</p>
          </div>

          <div className="flex-1 space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {activities.map((act) => {
              const signup = act.type === 'hall_signup';
              const payment = act.type === 'payment_received';
              const ticket = act.type === 'ticket_created';
              const change = act.type === 'package_changed';
              
              let typeColor = 'bg-violet-50 text-violet-600 border-violet-150';
              if (payment) typeColor = 'bg-green-50 text-green-600 border-green-150';
              if (ticket) typeColor = 'bg-yellow-50 text-yellow-600 border-yellow-150';
              if (act.type === 'subscription_expired') typeColor = 'bg-red-50 text-red-600 border-red-150';

              return (
                <div key={act.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${typeColor}`}>
                    {signup && <Building2 className="h-4.5 w-4.5" />}
                    {payment && <IndianRupee className="h-4.5 w-4.5" />}
                    {ticket && <Activity className="h-4.5 w-4.5" />}
                    {change && <TrendingUp className="h-4.5 w-4.5" />}
                    {!signup && !payment && !ticket && !change && <Activity className="h-4.5 w-4.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{act.title}</p>
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health Status */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-6 flex flex-col justify-between">
          <div className="border-b border-gray-50 pb-4 mb-4">
            <h3 className="font-bold text-gray-900 text-sm">System Diagnostics & Health</h3>
            <p className="text-[11px] text-gray-400 font-medium">Monitoring metrics for main production servers.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Server */}
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase">Web Server</span>
                <Server className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 capitalize shadow-sm">
                  {systemHealth.serverStatus}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Uptime: 99.99%</p>
              </div>
            </div>

            {/* DB */}
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase">Database Core</span>
                <Database className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 capitalize shadow-sm">
                  {systemHealth.databaseStatus}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Supabase PostgreSQL</p>
              </div>
            </div>

            {/* API Status */}
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between bg-gray-50/50 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase">API Gateway</span>
                <Activity className="h-4 w-4 text-violet-600" />
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 rounded px-2 py-0.5 shadow-sm">Operational</span>
                <span className="text-[10px] text-gray-400 font-semibold">All endpoints responding</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4 text-[10px] font-bold text-gray-400">
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-gray-450" />
              <span>Status as of {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <span className="text-emerald-600">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
