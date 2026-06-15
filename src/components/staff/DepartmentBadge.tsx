'use client';

import React from 'react';
import { Building2, Settings, Calculator, Shield, Sparkles, Grid, LucideIcon } from 'lucide-react';
import { StaffDepartment } from '@/types/staff';

interface DepartmentBadgeProps {
  department: StaffDepartment;
  className?: string;
}

export function DepartmentBadge({ department, className = '' }: DepartmentBadgeProps) {
  const configs: Record<StaffDepartment, { label: string; icon: LucideIcon; style: string }> = {
    management: {
      label: 'Management',
      icon: Building2,
      style: 'bg-primary-lighter text-primary-light border-primary-light/10',
    },
    operations: {
      label: 'Operations',
      icon: Settings,
      style: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    accounts: {
      label: 'Accounts',
      icon: Calculator,
      style: 'bg-amber-50 text-amber-705 border-amber-100',
    },
    security: {
      label: 'Security',
      icon: Shield,
      style: 'bg-red-50 text-red-700 border-red-100',
    },
    housekeeping: {
      label: 'Housekeeping',
      icon: Sparkles,
      style: 'bg-teal-50 text-teal-700 border-teal-100',
    },
    other: {
      label: 'Other Department',
      icon: Grid,
      style: 'bg-slate-100 text-slate-655 border-slate-205',
    },
  };

  const config = configs[department] || configs.other;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${config.style} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
}
export default DepartmentBadge;
