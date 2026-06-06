import React from 'react';
import { CalendarEventType } from '@/types/calendar';

interface EventTypeBadgeProps {
  type: CalendarEventType;
  className?: string;
}

export function EventTypeBadge({ type, className = '' }: EventTypeBadgeProps) {
  const configs = {
    booking: { label: 'Booking', style: 'bg-primary-lighter text-primary-light border-primary-light/10' },
    blocked: { label: 'Blocked', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    maintenance: { label: 'Maintenance', style: 'bg-orange-50 text-orange-700 border-orange-200' },
    personal: { label: 'Personal', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    holiday: { label: 'Holiday', style: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
  };

  const config = configs[type] || configs.personal;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider ${config.style} ${className}`}
    >
      {config.label}
    </span>
  );
}
