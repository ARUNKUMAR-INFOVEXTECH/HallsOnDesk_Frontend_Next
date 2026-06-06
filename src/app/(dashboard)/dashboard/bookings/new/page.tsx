'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookingForm } from '@/components/bookings/BookingForm';
import { useCreateBooking } from '@/hooks/useBookings';
import { BookingFormValues } from '@/schemas/booking.schema';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBookingPage() {
  const router = useRouter();
  const createMutation = useCreateBooking();

  const handleSubmit = async (data: BookingFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/dashboard/bookings');
    } catch (err) {
      console.error('Booking submission failed:', err);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/bookings');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Breadcrumb back navigation link */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </div>

      {/* Header details */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Booking Record
        </h2>
        <p className="text-sm text-slate-505 mt-1 font-medium">
          Fill in the details to create a new wedding or convention hall booking reservation.
        </p>
      </div>

      {/* Main Booking Form */}
      <BookingForm
        onSubmit={handleSubmit}
        loading={createMutation.isPending}
        submitLabel="Create Booking"
        onCancel={handleCancel}
      />
    </div>
  );
}
