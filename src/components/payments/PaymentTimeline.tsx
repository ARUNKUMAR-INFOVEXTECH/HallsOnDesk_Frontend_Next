'use client';

import React from 'react';
import { Receipt, Trash2, Calendar, Coins } from 'lucide-react';
import { Payment, PaymentMethod } from '@/types/payment';
import { formatDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/currency';
import { PaymentMethodBadge } from './PaymentMethodBadge';

interface PaymentTimelineProps {
  payments: Payment[];
  onDeletePayment: (id: string, amount: number) => void;
  onRecordPaymentClick: () => void;
  isDeleting?: boolean;
}

export function PaymentTimeline({
  payments,
  onDeletePayment,
  onRecordPaymentClick,
  isDeleting = false,
}: PaymentTimelineProps) {
  const methodColors: Record<PaymentMethod, string> = {
    cash: 'bg-slate-500 ring-slate-100',
    upi: 'bg-blue-500 ring-blue-100',
    bank_transfer: 'bg-green-500 ring-green-100',
    cheque: 'bg-amber-500 ring-amber-100',
    card: 'bg-violet-500 ring-violet-100',
    other: 'bg-slate-400 ring-slate-50',
  };

  const statusBadgeStyle = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-purple-50 text-purple-750 border-purple-200',
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center select-none flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Receipt className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">No payments recorded</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
          Record the first payment installment for this booking reservation to start tracking collection status.
        </p>
        <button
          onClick={onRecordPaymentClick}
          className="mt-4 bg-primary hover:bg-primary-hover text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Record Payment
        </button>
      </div>
    );
  }

  // Sort chronological descending (newest on top)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-5 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Payment History</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Chronological record of transactions</p>
        </div>
        <button
          onClick={onRecordPaymentClick}
          className="bg-primary hover:bg-primary-hover text-white h-8 px-3 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Record Payment
        </button>
      </div>

      {/* Timeline Grid */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {sortedPayments.map((p, idx) => {
          const colorClass = methodColors[p.paymentMethod] || 'bg-slate-400 ring-slate-50';
          const badgeClass = statusBadgeStyle[p.status] || statusBadgeStyle.completed;

          return (
            <div key={p.id} className="relative flex items-start justify-between gap-4 text-xs font-semibold text-slate-700">
              
              {/* Timeline Bullet Node */}
              <span className={`absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ${colorClass} shrink-0`} />

              {/* Event details block */}
              <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-800 font-extrabold font-mono">
                    {formatDate(p.paymentDate)}
                  </span>
                  <PaymentMethodBadge method={p.paymentMethod} />
                  {p.referenceNumber && p.referenceNumber !== '—' && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                      Ref: {p.referenceNumber}
                    </span>
                  )}
                </div>

                {p.notes && (
                  <p className="text-[11px] text-slate-450 italic font-medium leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100 max-w-lg">
                    "{p.notes}"
                  </p>
                )}
              </div>

              {/* Right content: Financial details and delete buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="font-extrabold text-slate-800 font-mono text-sm">
                    {formatCurrency(p.amount)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize tracking-wider ${badgeClass}`}>
                    {p.status}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeletePayment(p.id, p.amount)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-md border border-slate-150 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer disabled:opacity-50"
                  title="Reverse Transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
