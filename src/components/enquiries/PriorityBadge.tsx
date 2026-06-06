import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { EnquiryPriority } from '@/types/enquiry';

interface PriorityBadgeProps {
  priority: EnquiryPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const configs: Record<EnquiryPriority, { label: string; className: string; icon: any; iconColor: string }> = {
    high: {
      label: 'High',
      className: 'bg-red-50 text-red-655 border-red-100',
      icon: ArrowUp,
      iconColor: 'text-red-505',
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-50 text-amber-705 border-amber-100',
      icon: Minus,
      iconColor: 'text-amber-505',
    },
    low: {
      label: 'Low',
      className: 'bg-slate-50 text-slate-550 border-slate-150',
      icon: ArrowDown,
      iconColor: 'text-slate-400',
    },
  };

  const config = configs[priority] || configs.medium;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${config.className}`}>
      <Icon className={`h-3 w-3 shrink-0 ${config.iconColor}`} />
      <span>{config.label}</span>
    </span>
  );
}

export default PriorityBadge;
