import React from 'react';
import { BookingStatus, PaymentStatus } from '@/types/booking';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className = '' }: BookingStatusBadgeProps) {
  const styles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize tracking-wide ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'} ${className}`}
    >
      {status}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function BookingPaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const styles = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize tracking-wide ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'} ${className}`}
    >
      {status === 'partial' ? 'Partial Paid' : status}
    </span>
  );
}
