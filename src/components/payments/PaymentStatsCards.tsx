'use client';

import React from 'react';
import { IndianRupee, TrendingUp, Clock, Receipt, PieChart } from 'lucide-react';
import { PaymentSummary } from '@/types/payment';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';

interface PaymentStatsCardsProps {
  summary: PaymentSummary;
}

export function PaymentStatsCards({ summary }: PaymentStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-xs font-semibold text-slate-500">
      
      {/* Card 1: Total Revenue */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col gap-2.5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">Total Revenue</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1 font-mono">
              {formatCurrency(summary.totalRevenue)}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/30">
            <IndianRupee className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] leading-none mt-1 font-bold text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+12% vs last month</span>
        </div>
      </div>

      {/* Card 2: This Month Revenue */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col gap-2.5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">This Month</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1 font-mono">
              {formatCurrency(summary.thisMonthRevenue)}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/30">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="text-[10px] leading-none mt-1 font-medium text-slate-400">
          Month to date summary
        </div>
      </div>

      {/* Card 3: Pending Balance */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col gap-2.5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">Pending Amount</span>
            <h3 className={`text-lg font-extrabold mt-1 font-mono ${
              summary.pendingAmount > 0 ? 'text-amber-600' : 'text-slate-800'
            }`}>
              {formatCurrency(summary.pendingAmount)}
            </h3>
          </div>
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
            summary.pendingAmount > 0 
              ? 'bg-amber-50 text-amber-600 border-amber-100/30' 
              : 'bg-slate-50 text-slate-500 border-slate-100/30'
          }`}>
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="text-[10px] leading-none mt-1 font-medium text-slate-400">
          Across all active bookings
        </div>
      </div>

      {/* Card 4: Total Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col gap-2.5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">Total Transactions</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1 font-mono">
              {summary.totalTransactions}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/30">
            <Receipt className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="text-[10px] leading-none mt-1 font-medium text-slate-400">
          Payments recorded in ledger
        </div>
      </div>

      {/* Card 5: Collection Rate */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">Collection Rate</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1 font-mono">
              {summary.collectionRate}%
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-650 flex items-center justify-center shrink-0 border border-purple-100/30">
            <PieChart className="h-4.5 w-4.5" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, summary.collectionRate)}%` }}
          />
        </div>
      </div>

    </div>
  );
}
