'use client';

import React from 'react';
import { CheckCircle, MinusCircle, XCircle } from 'lucide-react';
import { VendorStatus } from '@/types/vendor';

interface VendorStatusBadgeProps {
  status: VendorStatus;
  className?: string;
}

export function VendorStatusBadge({ status, className = '' }: VendorStatusBadgeProps) {
  const configs = {
    active: {
      label: 'Active',
      icon: CheckCircle,
      badgeStyle: 'bg-green-50 text-green-700 border-green-200',
    },
    inactive: {
      label: 'Inactive',
      icon: MinusCircle,
      badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200',
    },
    blacklisted: {
      label: 'Blacklisted',
      icon: XCircle,
      badgeStyle: 'bg-red-50 text-red-600 border-red-200',
    },
  };

  const config = configs[status] || configs.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider ${config.badgeStyle} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
}
export default VendorStatusBadge;
