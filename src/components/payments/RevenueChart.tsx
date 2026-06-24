'use client';

import React, { useState } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { useRevenueChart } from '@/hooks/usePayments';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/utils/currency';

interface RevenueChartProps {
  // Option to set default period, defaults to 6M
  initialPeriod?: '6M' | '1Y' | 'All';
}

export function RevenueChart({ initialPeriod = '6M' }: RevenueChartProps) {
  const [period, setPeriod] = useState<'6M' | '1Y' | 'All'>(initialPeriod);

  // Fetch transformed data
  const { data: chartData = [], isLoading, isError } = useRevenueChart(period);

  const periods: { value: '6M' | '1Y' | 'All'; label: string }[] = [
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: 'All', label: 'All' },
  ];

  // Custom styled Tooltip card
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-150 p-3 rounded-lg shadow-premium text-xs font-semibold text-slate-700 leading-normal flex flex-col gap-1">
          <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">
            {data.month}
          </p>
          <div className="flex justify-between items-center gap-4 mt-1">
            <span className="text-slate-400">Revenue</span>
            <span className="text-slate-800 font-bold font-mono">
              {formatCurrency(data.revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400">Transactions</span>
            <span className="text-slate-800 font-bold font-mono">
              {data.transactions}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col h-[350px]">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-slate-850">Revenue Overview</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Monthly revenue collection trends</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                period === p.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 min-h-0 relative mt-4">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400 animate-pulse">
            Loading revenue statistics...
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h4 className="text-xs font-bold text-slate-700">Failed to load statistics</h4>
            <p className="text-[10px] text-slate-400">Please try again later</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                stroke="#94A3B8"
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC', opacity: 0.8 }} />
              <Bar
                dataKey="revenue"
                fill="#159DFC"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Empty State */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2 border border-dashed border-slate-200 rounded-xl">
            <BarChart3 className="h-8 w-8 text-slate-300" />
            <h4 className="text-xs font-extrabold text-slate-700">Not enough data</h4>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              Revenue chart will appear as payments are recorded
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
