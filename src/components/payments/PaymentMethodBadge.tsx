'use client';

import React from 'react';
import { Banknote, Smartphone, Building2, FileText, CreditCard, Coins, LucideIcon } from 'lucide-react';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
}

interface MethodConfig {
  label: string;
  icon: LucideIcon;
  badgeStyle: string;
  iconStyle: string;
}

export function PaymentMethodBadge({ method, className = '' }: PaymentMethodBadgeProps) {
  const configs: Record<PaymentMethod, MethodConfig> = {
    cash: {
      label: 'Cash',
      icon: Banknote,
      badgeStyle: 'bg-slate-50 text-slate-700 border-slate-200',
      iconStyle: 'text-slate-650',
    },
    upi: {
      label: 'UPI',
      icon: Smartphone,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      iconStyle: 'text-blue-600',
    },
    bank_transfer: {
      label: 'Bank Transfer',
      icon: Building2,
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconStyle: 'text-emerald-600',
    },
    cheque: {
      label: 'Cheque',
      icon: FileText,
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      iconStyle: 'text-amber-600',
    },
    card: {
      label: 'Card',
      icon: CreditCard,
      badgeStyle: 'bg-violet-50 text-violet-750 border-violet-200',
      iconStyle: 'text-violet-600',
    },
    other: {
      label: 'Other',
      icon: Coins,
      badgeStyle: 'bg-slate-100 text-slate-600 border-slate-200',
      iconStyle: 'text-slate-500',
    },
  };

  const config = configs[method] || configs.other;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider ${config.badgeStyle} ${className}`}
    >
      <Icon className={`h-3 w-3 shrink-0 ${config.iconStyle}`} />
      {config.label}
    </span>
  );
}
