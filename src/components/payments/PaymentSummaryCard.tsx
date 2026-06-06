'use client';

import React from 'react';
import { formatCurrency } from '@/utils/currency';

interface PaymentSummaryCardProps {
  bookingAmount: number;
  discountAmount: number;
  totalPaid: number;
  netAmount: number;
  pendingAmount: number;
}

export function PaymentSummaryCard({
  bookingAmount,
  discountAmount,
  totalPaid,
  netAmount,
  pendingAmount,
}: PaymentSummaryCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4 text-xs font-semibold text-slate-550 select-none">
      
      {/* Header */}
      <div className="border-b border-slate-50 pb-2.5">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Payment Financial Summary
        </h4>
      </div>

      <div className="space-y-3 font-medium text-slate-500">
        {/* Booking Amount */}
        <div className="flex justify-between items-center">
          <span>Booking Gross Rate</span>
          <span className="font-bold text-slate-700 font-mono">{formatCurrency(bookingAmount)}</span>
        </div>

        {/* Discount (if any) */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-rose-650 font-semibold">
            <span>Special Discount</span>
            <span className="font-bold font-mono">- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        {/* Net Amount */}
        <div className="flex justify-between items-center text-slate-800 font-bold border-t border-slate-50 pt-2 text-sm leading-none">
          <span>Net Billed Amount</span>
          <span className="font-extrabold font-mono">{formatCurrency(netAmount)}</span>
        </div>

        <hr className="border-slate-100 my-1" />

        {/* Total Collected */}
        <div className="flex justify-between items-center text-emerald-600 font-semibold">
          <span>Total Paid Collected</span>
          <span className="font-bold font-mono">{formatCurrency(totalPaid)}</span>
        </div>

        {/* Balance Due */}
        <div className="flex justify-between items-center text-slate-800 font-bold border-t border-slate-50 pt-2 text-sm leading-none">
          <span>Balance Outstanding</span>
          <span className={`font-mono font-extrabold ${pendingAmount > 0 ? 'text-rose-600 font-black' : 'text-slate-550'}`}>
            {formatCurrency(pendingAmount)}
          </span>
        </div>
      </div>

    </div>
  );
}
