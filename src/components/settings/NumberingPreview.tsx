'use client';

import React from 'react';
import { FileText, CalendarRange, CreditCard } from 'lucide-react';

interface NumberingPreviewProps {
  invoicePrefix: string;
  invoiceStartNumber: number;
  bookingPrefix: string;
  bookingStartNumber: number;
  receiptPrefix: string;
  receiptStartNumber: number;
}

export default function NumberingPreview({
  invoicePrefix,
  invoiceStartNumber,
  bookingPrefix,
  bookingStartNumber,
  receiptPrefix,
  receiptStartNumber,
}: NumberingPreviewProps) {
  // Format numbers to a default 4-digit serial pad (e.g. 0001)
  const formatSerial = (num: number) => {
    const parsed = Number(num) || 1;
    return parsed.toString().padStart(4, '0');
  };

  return (
    <div className="bg-violet-50/40 border border-violet-100/50 rounded-xl p-4 space-y-3">
      <span className="text-[10px] font-bold text-violet-850 uppercase tracking-wider block">Live Document Numbering Preview</span>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Invoice */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3">
          <FileText className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] text-gray-450 font-bold uppercase block">Invoice Serial</span>
            <span className="text-xs font-bold text-gray-800 font-mono block truncate">
              {invoicePrefix || 'INV'}-{formatSerial(invoiceStartNumber)}
            </span>
          </div>
        </div>

        {/* Booking */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3">
          <CalendarRange className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] text-gray-450 font-bold uppercase block">Booking Serial</span>
            <span className="text-xs font-bold text-gray-800 font-mono block truncate">
              {bookingPrefix || 'BK'}-{formatSerial(bookingStartNumber)}
            </span>
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-3">
          <CreditCard className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] text-gray-450 font-bold uppercase block">Receipt Serial</span>
            <span className="text-xs font-bold text-gray-800 font-mono block truncate">
              {receiptPrefix || 'RCP'}-{formatSerial(receiptStartNumber)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
