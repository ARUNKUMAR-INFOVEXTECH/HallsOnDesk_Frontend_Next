'use client';

import React from 'react';
import { Percent, Info } from 'lucide-react';

interface GstCalculatorPreviewProps {
  taxEnabled: boolean;
  gstRate: number;
  gstApplicableOn: 'all' | 'bookings_only' | 'custom';
}

export default function GstCalculatorPreview({
  taxEnabled,
  gstRate = 18,
  gstApplicableOn = 'all',
}: GstCalculatorPreviewProps) {
  const baseAmount = 100000; // Rs. 1 Lakh sample amount
  const taxRate = taxEnabled ? Number(gstRate) || 0 : 0;
  const taxAmount = (baseAmount * taxRate) / 100;
  const totalAmount = baseAmount + taxAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getScopeLabel = () => {
    if (gstApplicableOn === 'all') return 'Applies to all generated invoices';
    if (gstApplicableOn === 'bookings_only') return 'Applies to booking invoices only';
    return 'Manually chosen per document';
  };

  return (
    <div className="bg-gray-50 border border-gray-150 rounded-xl p-4.5 space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <Percent className="h-4.5 w-4.5 text-violet-650 shrink-0" />
        <span>Sample Invoice Calculation</span>
      </div>

      <div className="space-y-2 text-xs font-semibold text-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-450">Sample Booking Base Fee:</span>
          <span className="text-gray-900 font-mono">{formatCurrency(baseAmount)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-450">
            GST Output Tax ({taxRate}%):
          </span>
          <span className="text-gray-900 font-mono">
            {taxEnabled ? `+ ${formatCurrency(taxAmount)}` : 'Exempt (Tax Disabled)'}
          </span>
        </div>

        <hr className="border-gray-200/60 my-1" />

        <div className="flex justify-between text-sm font-bold">
          <span className="text-gray-950">Grand Total Invoice Cost:</span>
          <span className="text-violet-750 font-mono">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {taxEnabled && (
        <div className="flex gap-1.5 p-2 bg-violet-50/50 border border-violet-100/50 rounded-lg text-[9px] text-violet-850 font-bold leading-normal">
          <Info className="h-3.5 w-3.5 text-violet-600 shrink-0 mt-0.5" />
          <span>Scope: {getScopeLabel()}</span>
        </div>
      )}
    </div>
  );
}
