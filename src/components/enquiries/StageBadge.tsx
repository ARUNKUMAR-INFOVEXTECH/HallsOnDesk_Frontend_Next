import React from 'react';
import { EnquiryStage } from '@/types/enquiry';

interface StageBadgeProps {
  stage: EnquiryStage;
  size?: 'sm' | 'md';
}

export function StageBadge({ stage, size = 'sm' }: StageBadgeProps) {
  const configs: Record<EnquiryStage, { label: string; className: string }> = {
    new: {
      label: 'New Lead',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    interested: {
      label: 'Interested',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    visit_scheduled: {
      label: 'Visit Scheduled',
      className: 'bg-amber-50 text-amber-705 border-amber-200',
    },
    visited: {
      label: 'Visited',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    booked: {
      label: 'Booked',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    lost: {
      label: 'Lost',
      className: 'bg-red-50 text-red-600 border-red-200',
    },
  };

  const config = configs[stage] || configs.new;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-bold tracking-wide uppercase rounded-full border ${padding} ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StageBadge;
