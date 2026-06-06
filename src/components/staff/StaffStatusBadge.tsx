'use client';

import React from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { StaffStatus } from '@/types/staff';

interface StaffStatusBadgeProps {
  status: StaffStatus;
  className?: string;
}

export function StaffStatusBadge({ status, className = '' }: StaffStatusBadgeProps) {
  const configs = {
    active: {
      label: 'Active',
      icon: UserCheck,
      style: 'bg-green-50 text-green-700 border-green-200',
    },
    inactive: {
      label: 'Inactive',
      icon: UserX,
      style: 'bg-gray-105 text-gray-600 border-gray-200',
    },
    on_leave: {
      label: 'On Leave',
      icon: Clock,
      style: 'bg-amber-50 text-amber-705 border-amber-250',
    },
  };

  const config = configs[status] || configs.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider ${config.style} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  );
}
export default StaffStatusBadge;
