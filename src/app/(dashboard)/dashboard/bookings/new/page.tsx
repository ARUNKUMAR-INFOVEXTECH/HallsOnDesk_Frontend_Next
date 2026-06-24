'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingForm } from '@/components/bookings/BookingForm';
import { useCreateBooking } from '@/hooks/useBookings';
import { BookingFormValues } from '@/schemas/booking.schema';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useDeleteEnquiry } from '@/hooks/useEnquiries';

function CreateBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateBooking();
  const deleteEnquiryMutation = useDeleteEnquiry();

  // Read query parameters for prefilling
  const customerId = searchParams.get('customerId') || '';
  const eventType = searchParams.get('eventType') || 'Wedding Reception';
  const eventDate = searchParams.get('eventDate') || '';
  const guestCount = searchParams.get('guestCount') ? Number(searchParams.get('guestCount')) : 100;
  const bookingAmount = searchParams.get('bookingAmount') ? Number(searchParams.get('bookingAmount')) : 0;
  const notes = searchParams.get('notes') || '';
  const enquiryId = searchParams.get('enquiryId') || '';

  // Event type mapping if lowercase
  const mapEventType = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'wedding') return 'Wedding Reception';
    if (t === 'engagement') return 'Engagement Ceremony';
    if (t === 'reception') return 'Wedding Reception';
    if (t === 'birthday') return 'Birthday Celebration';
    if (t === 'corporate') return 'Corporate Event';
    if (t === 'anniversary') return 'Anniversary';
    return 'Other';
  };

  const initialValues: Partial<BookingFormValues> = {
    customerId,
    eventType: mapEventType(eventType),
    eventDate,
    guestCount,
    bookingAmount,
    notes,
  };

  const handleSubmit = async (data: BookingFormValues) => {
    try {
      const res = await createMutation.mutateAsync(data);
      
      // If we came from an enquiry, delete the enquiry records from database (no details stored in enquiry/followup tables upon conversion)
      if (enquiryId) {
        try {
          await deleteEnquiryMutation.mutateAsync(enquiryId);
        } catch (enqErr) {
          console.error('Failed to purge enquiry records:', enqErr);
        }
      }
      
      router.push('/dashboard/bookings');
    } catch (err) {
      console.error('Booking submission failed:', err);
    }
  };

  const handleCancel = () => {
    if (enquiryId) {
      router.back();
    } else {
      router.push('/dashboard/bookings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Breadcrumb back navigation link */}
      <div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Header details */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Booking Record
        </h2>
        <p className="text-sm text-slate-550 mt-1 font-medium">
          Fill in the details to create a new wedding or convention hall booking reservation.
        </p>
      </div>

      {/* Main Booking Form */}
      <BookingForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={createMutation.isPending}
        submitLabel="Create Booking"
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-slate-400 animate-pulse font-bold">
        Loading Booking Form...
      </div>
    }>
      <CreateBookingContent />
    </Suspense>
  );
}
