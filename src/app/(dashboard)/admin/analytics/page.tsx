'use client';

import React, { useState } from 'react';
import { useAdminAnalytics } from '@/hooks/useAdmin';
import {
  BarChart3,
  TrendingUp,
  Users,
  Percent,
  Map,
  Compass,
  ArrowUpRight,
  ChevronRight,
  TrendingDown,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<'30d' | '3m' | '6m' | '1y'>('30d');
  const { analyticsData, isLoading } = useAdminAnalytics(timePeriod);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val.toFixed(1)}%`;
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Analytics Platform...</p>
      </div>
    );
  }

  // Calculate TN aggregate metrics
  const tnTotals = analyticsData.districtStats.reduce(
    (acc, cur) => {
      acc.contacted += cur.contacted;
      acc.demos += cur.demosGiven;
      acc.trials += cur.trialsStarted;
      acc.paid += cur.paidCustomers;
      acc.mrr += cur.mrr;
      return acc;
    },
    { contacted: 0, demos: 0, trials: 0, paid: 0, mrr: 0 }
  );

  const avgConversion = tnTotals.contacted > 0 ? (tnTotals.paid / tnTotals.contacted) * 100 : 0;

  const statsList = [
    { label: 'Avg Revenue Per Hall (ARPU)', value: formatCurrency(analyticsData.arpu), growth: 4.8, description: 'Per venue licensing average fee.', icon: TrendingUp, color: 'text-violet-600 bg-violet-50 border-violet-100' },
    { label: 'Customer Retention Rate', value: formatPercent(analyticsData.retentionRate), growth: 0.5, description: 'Percentage of contracts sustained.', icon: Users, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Contract Churn Rate', value: formatPercent(analyticsData.churnRate), growth: -1.2, description: 'Percentage of cancelled trials/plans.', icon: TrendingDown, color: 'text-red-600 bg-red-50 border-red-100' },
    { label: 'Tamil Nadu MRR Total', value: formatCurrency(tnTotals.mrr), growth: 15.2, description: 'Total Tamil Nadu recurring revenue.', icon: Compass, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Business Analytics Console</h1>
          <p className="text-sm text-gray-500 mt-1">
            Observe hosting MRR/ARR trajectories, retention indicators, and district adoption levels.
          </p>
        </div>
        
        {/* Time period filter */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-150 shrink-0">
          {(['30d', '3m', '6m', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setTimePeriod(p)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, idx) => {
          const Icon = stat.icon;
          const isFavorable = stat.label.includes('Churn') ? stat.growth < 0 : stat.growth >= 0;
          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-extrabold text-gray-950 font-sans tracking-tight block">
                  {stat.value}
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400 font-semibold">{stat.description}</span>
                  <span className={`text-[10px] font-bold ${isFavorable ? 'text-green-700' : 'text-red-700'}`}>
                    {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adoption charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hall adoption chart (Active vs Trials) */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="border-b border-gray-50 pb-4 mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Venue Hosting Growth</h3>
            <p className="text-[11px] text-gray-400 font-medium">Monthly signups split by active billing accounts vs free trials.</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.hallGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                <Line type="monotone" dataKey="active" stroke="#7C3AED" strokeWidth={2.5} name="Active Venues" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="trials" stroke="#EE9B00" strokeWidth={2} strokeDasharray="3 3" name="Trial Accounts" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Halls by Revenue */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="border-b border-gray-50 pb-4 mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Top Halls by Revenue</h3>
            <p className="text-[11px] text-gray-400 font-medium">Venues with highest total payment collections.</p>
          </div>

          <div className="space-y-3 flex-1 mt-2">
            {analyticsData.topHalls && analyticsData.topHalls.length > 0 ? (
              analyticsData.topHalls.map((hall: any, idx: number) => (
                <div key={hall.hallId || idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs border border-violet-100 shrink-0">
                      {hall.rank || idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{hall.hallName}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{hall.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-gray-900 block">{formatCurrency(hall.totalRevenue)}</span>
                    <span className="text-[9px] text-violet-700 font-bold bg-violet-50 border border-violet-100 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                      collected
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p className="text-xs font-medium">No payment data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tamil Nadu Expansion Dashboard */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-gray-50 pb-3 flex items-center gap-2">
          <Map className="h-5 w-5 text-violet-600" />
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Tamil Nadu District Expansion Dashboard</h3>
            <p className="text-[11px] text-gray-450 font-medium">Geographical marketing funnels tracking regional conversions and MRR contributions.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3 text-center">Halls Contacted</th>
                <th className="px-4 py-3 text-center">Demos Given</th>
                <th className="px-4 py-3 text-center">Trials Started</th>
                <th className="px-4 py-3 text-center">Paid Customers</th>
                <th className="px-4 py-3 text-center">Conversion Rate</th>
                <th className="px-4 py-3 text-right">MRR contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
              {analyticsData.districtStats.map((dist, idx) => {
                const calculatedRate = dist.contacted > 0 ? (dist.paidCustomers / dist.contacted) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-950">{dist.district}</td>
                    <td className="px-4 py-3 text-center text-gray-550 font-medium font-mono">{dist.contacted}</td>
                    <td className="px-4 py-3 text-center text-gray-550 font-medium font-mono">{dist.demosGiven}</td>
                    <td className="px-4 py-3 text-center text-gray-550 font-medium font-mono">{dist.trialsStarted}</td>
                    <td className="px-4 py-3 text-center text-gray-950 font-mono">{dist.paidCustomers}</td>
                    <td className="px-4 py-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        calculatedRate >= 20
                          ? 'bg-green-50 text-green-700 border border-green-150'
                          : calculatedRate >= 10
                          ? 'bg-amber-50 text-amber-700 border border-amber-150'
                          : 'bg-gray-50 text-gray-500 border border-gray-150'
                      }`}>
                        {formatPercent(calculatedRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold font-sans text-gray-900">
                      {formatCurrency(dist.mrr)}
                    </td>
                  </tr>
                );
              })}
              {/* Summary Row */}
              <tr className="bg-violet-50/30 border-t-2 border-violet-100 font-bold text-gray-900">
                <td className="px-4 py-4 font-extrabold text-violet-850">Tamil Nadu Aggregates</td>
                <td className="px-4 py-4 text-center font-mono">{tnTotals.contacted}</td>
                <td className="px-4 py-4 text-center font-mono">{tnTotals.demos}</td>
                <td className="px-4 py-4 text-center font-mono">{tnTotals.trials}</td>
                <td className="px-4 py-4 text-center font-mono">{tnTotals.paid}</td>
                <td className="px-4 py-4 text-center font-mono">
                  <span className="px-2.5 py-0.5 bg-violet-600 text-white rounded text-[10px] font-bold">
                    {formatPercent(avgConversion)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-violet-850 font-extrabold font-sans">
                  {formatCurrency(tnTotals.mrr)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
