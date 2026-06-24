'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useCheckAvailability } from '@/hooks/useBookings';

interface AvailabilityCheckerProps {
  eventDate: string;
  eventEndDate: string;
  excludeBookingId?: string;
}

export function AvailabilityChecker({
  eventDate,
  eventEndDate,
  excludeBookingId,
}: AvailabilityCheckerProps) {
  // Only query if both values are validly set
  const canCheck = eventDate && eventEndDate && eventDate.trim() !== '' && eventEndDate.trim() !== '';

  const { data, isLoading } = useCheckAvailability(
    eventDate,
    eventEndDate || eventDate,
    excludeBookingId
  );

  if (!canCheck) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-primary-light" />
        Checking availability...
      </div>
    );
  }

  const isAvailable = data?.available;

  if (isAvailable === false) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 animate-fadeIn shadow-sm">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">⚠️ Conflict Alert</p>
          <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed font-medium">
            {data?.message || 'Another booking exists for this slot. Please confirm availability before proceeding.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-250 rounded-xl text-xs font-bold text-emerald-800 animate-fadeIn shadow-sm">
      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
      <span>✓ Venue is available for this slot</span>
    </div>
  );
}
