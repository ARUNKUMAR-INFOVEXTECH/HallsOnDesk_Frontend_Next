'use client';

import React from 'react';
import { Calendar, UserPlus, FileEdit, Star, ToggleLeft } from 'lucide-react';
import { Vendor } from '@/types/vendor';
import { formatDate } from '@/utils/formatters';

interface VendorActivityTimelineProps {
  vendor: Vendor;
}

export function VendorActivityTimeline({ vendor }: VendorActivityTimelineProps) {
  const activities = [
    {
      id: 'added',
      title: 'Vendor Added',
      description: `Added "${vendor.name}" profile to the venue database directories.`,
      date: vendor.createdAt,
      icon: UserPlus,
      color: 'bg-emerald-500 ring-emerald-100 text-white',
    },
    {
      id: 'category',
      title: 'Category Set',
      description: `Assigned as a service provider under the "${vendor.category}" group.`,
      date: vendor.createdAt,
      icon: FileEdit,
      color: 'bg-blue-500 ring-blue-100 text-white',
    },
    {
      id: 'status',
      title: 'Status Updated',
      description: `Vendor profile marked as "${vendor.status}" for reservation bookings.`,
      date: vendor.updatedAt,
      icon: ToggleLeft,
      color: 'bg-violet-500 ring-violet-100 text-white',
    },
    {
      id: 'rating',
      title: 'Initial Rating Assigned',
      description: `Assigned a quality score ranking of ${vendor.rating} out of 5 stars.`,
      date: vendor.createdAt,
      icon: Star,
      color: 'bg-amber-500 ring-amber-100 text-white',
    },
  ];

  // Sort by date (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-5 select-none">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 font-sans">Activity Log</h3>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 font-sans">
          Audit timeline of changes and booking updates
        </p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {sortedActivities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="relative flex flex-col gap-1 text-xs font-semibold text-slate-700">
              {/* Bullet node */}
              <span className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full ring-4 flex items-center justify-center ${act.color}`}>
                {/* Micro bullet dot */}
              </span>

              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-800 font-extrabold font-sans">
                  {act.title}
                </span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatDate(act.date)}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-450 font-medium leading-relaxed max-w-xl">
                {act.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default VendorActivityTimeline;
