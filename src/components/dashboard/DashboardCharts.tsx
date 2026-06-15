'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
} from 'recharts';
import { useRevenueQuery, useBookingTrendsQuery, useDashboardQuery } from '@/hooks/useDashboardQueries';
import { BookingTrendPoint } from '@/services/api/modules/dashboard.service';
import { Sparkles, TrendingUp, Info, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import ChartCard from './ChartCard';

// ----------------------------------------------------
// 1. REVENUE OVERVIEW CHART (Composed Area & Line Chart in Navy & Gold)
// ----------------------------------------------------
export function RevenueChart() {
  const [filter, setFilter] = useState<'30days' | '3months' | '6months' | '1year'>('30days');
  const { data, isLoading, error } = useRevenueQuery(filter);

  const formatYAxis = (tick: number) => {
    if (tick >= 100000) return `₹${(tick / 100000).toFixed(1)}L`;
    if (tick >= 1000) return `₹${(tick / 1000).toFixed(0)}k`;
    return `₹${tick}`;
  };

  // Fallback mock data in case API returns empty lists
  const defaultData = [
    { date: 'June 01', revenue: 45000, target: 50000 },
    { date: 'June 05', revenue: 78000, target: 70000 },
    { date: 'June 10', revenue: 120000, target: 100000 },
    { date: 'June 15', revenue: 95000, target: 110000 },
    { date: 'June 20', revenue: 155000, target: 130000 },
    { date: 'June 25', revenue: 210000, target: 180000 },
    { date: 'June 30', revenue: 185000, target: 190000 },
  ];

  const chartData = data && data.length > 0 
    ? data.map(item => ({ ...item, target: (item.revenue || 0) * 1.1 })) // compute dummy target from data
    : defaultData;

  const filtersList = [
    { value: '30days', label: '30 Days' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
  ] as const;

  const filterSelector = (
    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
      {filtersList.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            filter === f.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Revenue Trend & Targets"
      subtitle="Track monthly venue collections and comparison against targets."
      headerAction={filterSelector}
      loading={isLoading}
      className="lg:col-span-8"
    >
      {error ? (
        <div className="text-xs text-red-500 font-semibold">Failed to load revenue details.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A2540" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#0A2540" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
              formatter={(value: any, name: any) => [
                `₹${Number(value).toLocaleString('en-IN')}`, 
                name === 'revenue' ? 'Actual Revenue' : 'Projected Target'
              ]}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingBottom: '10px' }}
            />
            <Area type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#0A2540" strokeWidth={2} name="revenue" />
            <Line type="monotone" dataKey="target" stroke="#EE9B00" strokeWidth={2} strokeDasharray="5 5" name="target" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ----------------------------------------------------
// 2. PAYMENT STATUS CHART (DONUT)
// ----------------------------------------------------
interface BookingStatusChartProps {
  total?: number;
  confirmed?: number;
  pending?: number;
  cancelled?: number;
}

export function PaymentStatusChart({
  total = 38,
  confirmed = 28,
  pending = 8,
  cancelled = 2,
}: BookingStatusChartProps) {
  // Aggregate details dynamically
  const { data: dashboardData } = useDashboardQuery();

  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const halls = user?.accessible_halls || [];
  const activeHall = halls.find((h) => h.id === activeHallId)
    || halls.find((h) => h.id === user?.hall_id)
    || halls[0];
  const activeHallName = activeHall?.hall_name || 'venue';
  
  const totalVal = dashboardData?.summary?.total_bookings ?? total;
  const confirmedVal = dashboardData?.summary?.confirmed_bookings ?? confirmed;
  const pendingVal = totalVal - confirmedVal - (dashboardData?.summary?.cancelled_bookings ?? cancelled);
  const cancelledVal = dashboardData?.summary?.cancelled_bookings ?? cancelled;

  const chartData = [
    { name: 'Confirmed', value: confirmedVal || 28, color: '#0A2540' }, // Navy Primary
    { name: 'Pending', value: pendingVal > 0 ? pendingVal : 8, color: '#EE9B00' }, // Gold Accent
    { name: 'Cancelled', value: cancelledVal || 2, color: '#EF4444' }, // Danger Red
  ];

  const fillRate = totalVal > 0 ? (((confirmedVal) / totalVal) * 100).toFixed(0) : '0';

  return (
    <ChartCard
      title="Booking Fulfillment"
      subtitle={`Percentage breakdown of ${activeHallName} bookings states.`}
      className="lg:col-span-4"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Center Rate Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
          <span className="text-2xl font-extrabold text-slate-800 leading-none tracking-tight block font-mono">
            {fillRate}%
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">
            Confirmed
          </span>
        </div>

        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [value, 'Bookings']}
                contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="flex gap-4 text-[10px] font-bold text-slate-500 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0A2540]" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EE9B00]" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

// ----------------------------------------------------
// 3. BOOKING TRENDS CHART (NAVY & GOLD BARS)
// ----------------------------------------------------
export function BookingTrendsChart() {
  const { data, isLoading, error } = useBookingTrendsQuery();

  const defaultData: BookingTrendPoint[] = [
    { month: 'Jan', confirmed: 12, completed: 8, cancelled: 2, total: 22 },
    { month: 'Feb', confirmed: 15, completed: 10, cancelled: 1, total: 26 },
    { month: 'Mar', confirmed: 18, completed: 15, cancelled: 3, total: 36 },
    { month: 'Apr', confirmed: 8, completed: 20, cancelled: 0, total: 28 },
    { month: 'May', confirmed: 24, completed: 5, cancelled: 4, total: 33 },
    { month: 'Jun', confirmed: 28, completed: 2, cancelled: 1, total: 31 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <ChartCard
      title="Booking Trends"
      subtitle="Inspect confirmed and completed event counts month-on-month."
      loading={isLoading}
      className="lg:col-span-12"
    >
      {error ? (
        <div className="text-xs text-red-500 font-semibold">Failed to load booking trends.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 600, color: '#475569' }}
            />
            <Bar dataKey="confirmed" fill="#0A2540" radius={[3, 3, 0, 0]} name="Confirmed" />
            <Bar dataKey="completed" fill="#EE9B00" radius={[3, 3, 0, 0]} name="Completed" />
            <Bar dataKey="cancelled" fill="#EF4444" radius={[3, 3, 0, 0]} name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ----------------------------------------------------
// 4. ENQUIRY FUNNEL PIPELINE CHART (Navy/Gold/Amber composed)
// ----------------------------------------------------
interface EnquiryFunnelProps {
  data?: Array<{ stage: string; count: number }>;
}

export function EnquiryFunnelChart({ data }: EnquiryFunnelProps) {
  const defaultFunnel = [
    { stage: 'Enquiries', count: 0, fill: '#0A2540' },
    { stage: 'Interested', count: 0, fill: '#1E3D59' },
    { stage: 'Visit Scheduled', count: 0, fill: '#2D5F8A' },
    { stage: 'Visited', count: 0, fill: '#4385C2' },
    { stage: 'Booked', count: 0, fill: '#EE9B00' },
  ];

  const COLORS = ['#0A2540', '#1E3D59', '#2D5F8A', '#4385C2', '#EE9B00'];

  const chartData = data && data.length > 0
    ? data.map((item, idx) => ({
        stage: item.stage,
        count: item.count,
        fill: COLORS[idx % COLORS.length]
      }))
    : defaultFunnel;

  const totalEnquiries = chartData[0]?.count || 0;
  const bookedCount = chartData[chartData.length - 1]?.count || 0;
  const conversionRate = totalEnquiries > 0 ? ((bookedCount / totalEnquiries) * 100).toFixed(0) : '0';

  return (
    <ChartCard
      title="Lead Conversion Funnel"
      subtitle="Analyze conversion pipelines from wedding enquiries to confirmed hall bookings."
      headerAction={
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 shadow-sm">
          <TrendingUp className="h-3 w-3 shrink-0" />
          <span>{conversionRate}% Conversion Rate</span>
        </div>
      }
      className="lg:col-span-8"
    >
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex-1 min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                stroke="#475569"
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value: any) => [value, 'Conversions']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold leading-relaxed">
          <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          Analytics funnel tracks how many telephone enquiries successfully convert into confirmed venue rentals.
        </div>
      </div>
    </ChartCard>
  );
}

// ----------------------------------------------------
// 5. EVENT CATEGORIES PIE CHART (New Analytics Feature!)
// ----------------------------------------------------
interface EventCategoryProps {
  data?: Array<{ name: string; value: number }>;
}

export function EventCategoryChart({ data }: EventCategoryProps) {
  const COLORS = ['#0A2540', '#EE9B00', '#3B82F6', '#10B981', '#EF4444'];

  const defaultData = [
    { name: 'No Bookings', value: 100, color: '#94a3b8' }
  ];

  const chartData = data && data.length > 0
    ? data.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: COLORS[idx % COLORS.length]
      }))
    : defaultData;

  return (
    <ChartCard
      title="Event Types Distribution"
      subtitle="Classification of hall bookings by event categories."
      className="lg:col-span-4"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={65}
                paddingAngle={0}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value}%`, 'Percentage']}
                contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Custom Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-bold text-slate-500 mt-2 w-full px-2">
          {chartData.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
