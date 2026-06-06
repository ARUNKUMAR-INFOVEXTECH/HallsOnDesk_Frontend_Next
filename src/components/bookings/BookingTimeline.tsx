import React from 'react';
import { Calendar, DollarSign, UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Booking } from '@/types/booking';
import { Payment } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface BookingTimelineProps {
  booking: Booking;
  payments?: Payment[];
}

export function BookingTimeline({ booking, payments = [] }: BookingTimelineProps) {
  // Construct timeline events dynamically
  const events: {
    title: string;
    desc: string;
    date: string;
    icon: any;
    color: string;
  }[] = [];

  // 1. Booking Created
  events.push({
    title: 'Booking Created',
    desc: `Booking #${booking.bookingNumber} initialized for ${booking.eventType} in ${booking.hallSection}.`,
    date: formatDate(booking.createdAt),
    icon: Calendar,
    color: 'bg-primary-lighter border-primary-light/15 text-primary-light',
  });

  // 2. Advance Received
  if (booking.advanceAmount > 0) {
    events.push({
      title: 'Advance Deposit Paid',
      desc: `Logged deposit amount ${formatCurrency(booking.advanceAmount)} on registration.`,
      date: formatDate(booking.createdAt),
      icon: DollarSign,
      color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    });
  }

  // 3. Payments
  payments.forEach((pay) => {
    events.push({
      title: 'Payment Received',
      desc: `Logged transaction of ${formatCurrency(pay.amount)} via ${pay.payment_method.toUpperCase()}.`,
      date: formatDate(pay.payment_date),
      icon: DollarSign,
      color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    });
  });

  // 4. Booking Completed
  if (booking.status === 'completed') {
    events.push({
      title: 'Event Completed',
      desc: `Booking successfully cleared, event finished in ${booking.hallSection}.`,
      date: formatDate(booking.updatedAt),
      icon: CheckCircle2,
      color: 'bg-blue-50 border-blue-100 text-blue-700',
    });
  }

  // 5. Booking Cancelled
  if (booking.status === 'cancelled') {
    events.push({
      title: 'Event Cancelled',
      desc: `Booking has been marked as cancelled.`,
      date: formatDate(booking.updatedAt),
      icon: XCircle,
      color: 'bg-rose-50 border-rose-100 text-rose-700',
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-3.5 mb-6">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-primary-light" />
          Event Lifecycle Timeline
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          History of all actions, payments, and status changes for this event
        </p>
      </div>

      {events.length > 0 ? (
        <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-3">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={index} className="relative flex gap-4 items-start text-xs font-semibold">
                {/* Timeline connector circle */}
                <div className="absolute -left-[35px] bg-white rounded-full p-1 border border-slate-200">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${event.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3.5 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-800 font-bold text-xs">{event.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider shrink-0 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-505 mt-1.5 font-medium leading-relaxed">
                    {event.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs font-medium">
          No logs found.
        </div>
      )}
    </div>
  );
}
