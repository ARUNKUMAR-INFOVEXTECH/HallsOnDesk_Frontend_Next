import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface BookingPaymentSummaryProps {
  bookingAmount: number;
  discountAmount: number;
  advanceAmount: number;
  taxEnabled?: boolean;
  taxPercentage?: number;
}

export function BookingPaymentSummary({
  bookingAmount,
  discountAmount,
  advanceAmount,
  taxEnabled = false,
  taxPercentage = 0,
}: BookingPaymentSummaryProps) {
  const taxableAmount = Math.max(0, bookingAmount - discountAmount);
  const taxAmount = taxEnabled ? Math.round((taxableAmount * taxPercentage) / 100 * 100) / 100 : 0;
  const netAmount = taxableAmount + taxAmount;
  const pendingAmount = Math.max(0, netAmount - advanceAmount);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 font-semibold text-xs text-slate-600 shadow-sm">
      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Payment Summary
      </h4>
      
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <span>Booking Amount</span>
          <span className="font-bold text-slate-800 font-mono">
            {formatCurrency(bookingAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-500 font-medium">
          <span>Discount Amount</span>
          <span className="font-mono font-bold text-rose-500">
            - {formatCurrency(discountAmount)}
          </span>
        </div>

        {taxEnabled && (
          <div className="flex justify-between items-center text-slate-500 font-medium">
            <span>GST ({taxPercentage}%)</span>
            <span className="font-mono font-bold text-slate-700">
              + {formatCurrency(taxAmount)}
            </span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
          <span className="text-slate-800 font-bold">Net Amount</span>
          <span className="font-extrabold text-primary font-mono">
            {formatCurrency(netAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-emerald-600 font-medium">
          <span>Advance Paid</span>
          <span className="font-bold font-mono">
            {formatCurrency(advanceAmount)}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
          <span className="text-slate-800 font-bold">Pending Balance</span>
          <span className="font-extrabold text-rose-600 font-mono">
            {formatCurrency(pendingAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
