'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

// Dynamically load client-side calendar workspace with ssr: false to prevent hydration mismatch errors
const CalendarDashboardClient = dynamic(
  () => import('@/components/calendar/CalendarDashboardClient').then((mod) => mod.CalendarDashboardClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-140px)] gap-6 items-stretch overflow-hidden animate-pulse select-none">
        
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r border-slate-200 bg-white h-full shrink-0 p-4 space-y-5">
          <div className="h-6 bg-slate-100 rounded w-3/4" />
          <div className="h-48 bg-slate-100 rounded-xl w-full" />
          <div className="h-44 bg-slate-150 rounded-xl w-full" />
        </div>
        
        {/* Main Content Space Skeleton */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
          <div className="h-20 bg-slate-100 rounded-xl w-full" />
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-custom-md flex flex-col gap-4">
            <div className="h-7 bg-slate-100 rounded w-1/3" />
            <div className="flex-1 bg-slate-50/60 border border-slate-150 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
                <span className="text-xs font-semibold text-slate-400">Loading Calendar Workspace...</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    ),
  }
);

export default function CalendarPage() {
  return <CalendarDashboardClient />;
}
