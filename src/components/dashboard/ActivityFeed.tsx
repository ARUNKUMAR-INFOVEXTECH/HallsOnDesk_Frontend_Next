'use client';

import React from 'react';
import { Calendar, CircleAlert, CheckCircle2, DollarSign, UserCheck } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'booking' | 'payment' | 'enquiry' | 'user' | 'alert';
}

interface ActivityFeedProps {
  title: string;
  items: ActivityItem[];
  loading?: boolean;
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  switch (type) {
    case 'booking':
      return (
        <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Calendar className="h-4 w-4" />
        </div>
      );
    case 'payment':
      return (
        <div className="h-7 w-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
          <DollarSign className="h-4 w-4" />
        </div>
      );
    case 'enquiry':
      return (
        <div className="h-7 w-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
          <CircleAlert className="h-4 w-4" />
        </div>
      );
    case 'user':
      return (
        <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <UserCheck className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
  }
}

export default function ActivityFeed({ title, items, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="border border-slate-200 bg-white rounded-lg p-5 animate-pulse shadow-custom-sm">
        <div className="h-4 bg-slate-100 rounded w-32 mb-5" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-3">
              <div className="h-7 w-7 bg-slate-100 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white rounded-lg p-5 shadow-custom-sm hover:border-slate-300 hover:shadow-premium transition-all duration-200">
      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-5">{title}</h4>
      
      {items.length > 0 ? (
        <div className="relative pl-3 border-l border-slate-100 space-y-5">
          {items.map((item) => (
            <div key={item.id} className="relative flex gap-3.5 items-start">
              {/* Timeline Connector Dot / Icon */}
              <div className="absolute -left-[27.5px] bg-white rounded-full">
                <ActivityIcon type={item.type} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <span className="font-semibold text-xs text-slate-800 leading-tight block">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-xs text-slate-400 font-medium">
          No recent activity logs.
        </div>
      )}
    </div>
  );
}
