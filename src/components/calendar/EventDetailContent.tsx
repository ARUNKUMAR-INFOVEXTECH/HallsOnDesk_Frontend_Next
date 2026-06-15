'use client';

import React from 'react';
import { Calendar, Clock, Users, DollarSign, Mail, Phone, User, FileText, ArrowUpRight } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { EventTypeBadge } from './EventTypeBadge';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Link from 'next/link';
import { obfuscateId } from '@/utils/obfuscate';

interface EventDetailContentProps {
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetailContent({
  event,
  onEdit,
  onDelete,
}: EventDetailContentProps) {
  const isBooking = event.type === 'booking';

  // Format Event Time Range
  const formatTimeRange = (startStr: string, endStr: string, allDay: boolean) => {
    if (allDay) return 'All Day';
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      };
      
      return `${formatTime(start)} — ${formatTime(end)}`;
    } catch {
      return '';
    }
  };

  const timeRange = formatTimeRange(event.start, event.end, event.allDay);

  if (isBooking) {
    const initials = (event.customerName || 'C')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="space-y-6 text-xs font-semibold text-slate-600">
        {/* Drawer Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-mono text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">
            {event.bookingId ? `#BKG-${event.bookingId.slice(0, 8).toUpperCase()}` : 'BOOKING'}
          </span>
          <EventTypeBadge type="booking" />
        </div>

        {/* Event Title */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event Title</span>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug mt-1.5">
            {event.title}
          </h2>
        </div>

        {/* Customer Profile Section */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3.5 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Customer Profile</span>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-100 border border-violet-200/50 flex items-center justify-center font-extrabold text-sm text-violet-600 shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <span className="text-slate-800 font-bold block text-xs leading-none">
                {event.customerName}
              </span>
              <div className="flex flex-col gap-1 mt-1.5 leading-none">
                {event.customerPhone && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    {event.customerPhone}
                  </span>
                )}
                {event.customerEmail && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    {event.customerEmail}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event Date</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mt-1">
              <Calendar className="h-4 w-4 text-violet-650 shrink-0" />
              <span>{formatDate(event.start)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Schedule Time</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mt-1">
              <Clock className="h-4 w-4 text-violet-650 shrink-0" />
              <span className="truncate">{timeRange}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Hall Section</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mt-1">
              <FileText className="h-4 w-4 text-violet-650 shrink-0" />
              <span>{event.hallSection}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Guest Count</span>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mt-1">
              <Users className="h-4 w-4 text-violet-650 shrink-0" />
              <span>{event.guestCount ? `${event.guestCount} Guests` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3.5 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Payment Details</span>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-450">Booking Rate</span>
              <span className="text-slate-800 font-bold font-mono">{formatCurrency(event.bookingAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 font-semibold">
              <span>Advance Paid</span>
              <span className="font-bold font-mono">{formatCurrency(event.advanceAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>Balance Due</span>
              <span className={`font-mono ${event.pendingAmount && event.pendingAmount > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}`}>
                {formatCurrency(event.pendingAmount)}
              </span>
            </div>
            {event.paymentStatus && (
              <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px] uppercase font-bold text-slate-400">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded-full border tracking-wide capitalize ${
                  event.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : event.paymentStatus === 'partial'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {event.paymentStatus === 'partial' ? 'Partial Paid' : event.paymentStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Status Badge */}
        <div className="flex flex-col items-center justify-center p-3 border border-slate-150 rounded-xl bg-slate-50/50">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none mb-2">Reservation Status</span>
          <BookingStatusBadge status={event.status} />
        </div>

        {/* Notes section */}
        {event.notes && (
          <div className="p-3 bg-slate-100 border border-slate-200/50 rounded-xl font-medium text-slate-500 italic relative">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1.5 not-italic">Notes</span>
            "{event.notes}"
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
          <Link
            href={`/dashboard/bookings/${event.bookingId ? obfuscateId(event.bookingId) : ''}`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-sm transition-all cursor-pointer"
          >
            Inspect Full Booking
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm transition-all cursor-pointer font-bold"
            >
              Edit Event
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-1.5 py-2 border border-rose-200 hover:border-rose-350 bg-rose-50 text-rose-600 rounded-lg shadow-sm transition-all cursor-pointer font-bold"
            >
              Delete Event
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Type !== booking rendering
  return (
    <div className="space-y-6 text-xs font-semibold text-slate-600">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="font-mono text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">
          CUSTOM EVENT
        </span>
        <EventTypeBadge type={event.type} />
      </div>

      {/* Event Title */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event Title</span>
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug mt-1.5">
          {event.title}
        </h2>
      </div>

      {/* Details list */}
      <div className="space-y-4 border-t border-b border-slate-100 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event Date</span>
            <span className="text-slate-800 font-bold block mt-1.5 font-mono">{formatDate(event.start)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Schedule Time</span>
            <span className="text-slate-800 font-bold block mt-1.5">{timeRange}</span>
          </div>
        </div>

        {event.hallSection && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Hall Section</span>
              <span className="text-slate-800 font-bold block mt-1.5">{event.hallSection}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes section */}
      {event.notes && (
        <div className="p-3 bg-slate-100 border border-slate-200/50 rounded-xl font-medium text-slate-505 italic relative">
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1.5 not-italic">Notes / Context</span>
          "{event.notes}"
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-lg shadow-sm transition-all cursor-pointer font-bold"
        >
          Edit Event
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 py-2.5 border border-rose-200 hover:border-rose-350 bg-rose-50 text-rose-600 rounded-lg shadow-sm transition-all cursor-pointer font-bold"
        >
          Delete Event
        </button>
      </div>

    </div>
  );
}
