'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Trash2, Edit3, ChevronLeft, Phone, Mail, User } from 'lucide-react';
import { Booking } from '@/types/booking';
import { BookingStatusBadge, BookingPaymentStatusBadge } from './BookingStatusBadge';
import { formatDate, formatEventSlot } from '@/utils/formatters';

interface BookingDetailHeaderProps {
  booking: Booking;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  isDeleting?: boolean;
}

export function BookingDetailHeader({
  booking,
  onEditClick,
  onDeleteClick,
  isDeleting = false,
}: BookingDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back button link */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3.5 flex-1">
          {/* Booking Number */}
          <span className="text-xs font-mono font-bold text-primary-light uppercase tracking-wider block bg-primary-lighter/60 border border-primary-light/10 px-2 py-0.5 rounded w-fit">
            #{booking.bookingNumber}
          </span>
          
          {/* Event Title */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {booking.eventType} in {booking.hallSection}
          </h2>

          {/* Customer Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {booking.customerName}
            </span>
            {booking.customerPhone && (
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {booking.customerPhone}
              </span>
            )}
            {booking.customerEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {booking.customerEmail}
              </span>
            )}
          </div>

          {/* Event Date Range */}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
            <Calendar className="h-4 w-4 text-primary-light shrink-0" />
            <span>
              {formatEventSlot(booking.eventDate, booking.eventEndDate)}
            </span>
          </div>
        </div>

        {/* Right side: Status and Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="flex items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <BookingPaymentStatusBadge status={booking.paymentStatus} />
          </div>

          <div className="flex items-center gap-2">
            {onEditClick && (
              <button
                onClick={onEditClick}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {onDeleteClick && (
              <button
                onClick={onDeleteClick}
                disabled={isDeleting}
                className="h-8 w-8 inline-flex items-center justify-center border border-rose-200 hover:border-rose-350 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
