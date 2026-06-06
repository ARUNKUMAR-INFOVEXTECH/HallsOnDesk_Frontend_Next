'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';

interface BookingPaymentProgressProps {
  totalPaid: number;
  netAmount: number;
  advanceAmount: number;
}

export function BookingPaymentProgress({
  totalPaid,
  netAmount,
  advanceAmount,
}: BookingPaymentProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const totalProgress = netAmount > 0 ? Math.min(100, Math.round((totalPaid / netAmount) * 100)) : 0;
  const advanceProgress = netAmount > 0 ? Math.min(100, Math.round((advanceAmount / netAmount) * 100)) : 0;
  const pendingProgress = Math.max(0, 100 - totalProgress);

  // Trigger fill animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(totalProgress);
    }, 150);
    return () => clearTimeout(timer);
  }, [totalProgress]);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4 text-xs font-semibold text-slate-500 select-none">
      {/* Label Row */}
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
          Payment Progress
        </span>
        <span className="text-slate-550 font-medium">
          <strong className="text-slate-800 font-bold font-mono">{formatCurrency(totalPaid)}</strong> of{' '}
          <strong className="text-slate-800 font-bold font-mono">{formatCurrency(netAmount)}</strong> collected
        </span>
      </div>

      {/* Progress Track and Fill */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div
          className="bg-gradient-to-r from-violet-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Ratios row */}
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider pt-0.5">
        <span className="text-violet-600 flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-violet-500 rounded-full shrink-0" />
          Advance Billed: <strong className="font-mono">{advanceProgress}%</strong>
        </span>
        <span className="text-slate-700 flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-green-500 rounded-full shrink-0" />
          Total Collected: <strong className="font-mono">{totalProgress}%</strong>
        </span>
        <span className="text-rose-600 flex items-center gap-1">
          <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0" />
          Pending Balance: <strong className="font-mono">{pendingProgress}%</strong>
        </span>
      </div>

    </div>
  );
}
