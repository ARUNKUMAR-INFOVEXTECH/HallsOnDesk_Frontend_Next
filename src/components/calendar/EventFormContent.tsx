'use client';

import React, { useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { SelectField } from '@/components/forms/SelectField';
import { calendarEventSchema, CalendarEventFormValues } from '@/schemas/calendar.schema';
import { BookingCombobox } from './BookingCombobox';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface EventFormContentProps {
  initialValues?: Partial<CalendarEventFormValues>;
  onSubmit: (data: CalendarEventFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  excludeEventId?: string;
}

// Sub-component: Overlap / Conflict Checker for Calendar events
function AvailabilityWarning({
  start,
  end,
  hallSection,
  excludeEventId,
}: {
  start: string;
  end: string;
  hallSection: string;
  excludeEventId?: string;
}) {
  const canCheck = start && start.trim() !== '' && hallSection && hallSection.trim() !== '';
  
  // Extract date part YYYY-MM-DD
  const startDay = start ? start.split('T')[0] : '';
  const endDay = end ? end.split('T')[0] : startDay;

  const { data: events, isLoading } = useCalendarEvents(
    canCheck ? { start: startDay, end: endDay } : {},
    { hallSection }
  );

  if (!canCheck) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 animate-pulse">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-light" />
        Checking schedule availability...
      </div>
    );
  }

  // Parse check start & end as time values
  const checkStart = new Date(start).getTime();
  const checkEnd = new Date(end || start).getTime();

  // Find overlaps in local events
  const conflict = events?.find((event) => {
    if (event.id === excludeEventId) return false;
    if (event.status === 'cancelled') return false;

    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    // Check overlap condition: start1 < end2 && end1 > start2
    return checkStart < eventEnd && checkEnd > eventStart;
  });

  if (conflict) {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2 bg-amber-50 border border-amber-250 rounded-lg text-xs font-semibold text-amber-800 animate-fadeIn">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-605 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">⚠️ Schedule Conflict Warning</p>
          <p className="mt-0.5 text-[10px] text-amber-700 leading-relaxed font-medium">
            "{conflict.title}" is already scheduled in this section at this time. Please verify slot availability.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 animate-fadeIn">
      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
      <span>✓ Time slot is clear in {hallSection}</span>
    </div>
  );
}

export function EventFormContent({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = 'Save Event',
  onCancel,
  excludeEventId,
}: EventFormContentProps) {
  // Setup React Hook Form
  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: '',
      start: '',
      end: '',
      allDay: false,
      type: 'personal',
      hallSection: 'Main Hall',
      guestCount: undefined,
      bookingId: '',
      notes: '',
      status: 'confirmed',
      ...initialValues,
    },
  });

  const {
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = form;

  // Sync initialValues when editing
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  // Watch inputs for dynamic updates
  const watchType = watch('type');
  const watchBookingId = watch('bookingId') || '';
  const watchStart = watch('start') || '';
  const watchEnd = watch('end') || '';
  const watchHallSection = watch('hallSection') || 'Main Hall';
  const watchAllDay = watch('allDay') || false;

  // Autofill form inputs when a booking is linked
  const handleBookingSelect = (booking: any) => {
    if (booking) {
      setValue('bookingId', booking.id, { shouldDirty: true, shouldValidate: true });
      setValue('title', `${booking.customerName} - ${booking.eventType}`, { shouldDirty: true, shouldValidate: true });
      setValue('hallSection', booking.hallSection || 'Main Hall', { shouldDirty: true, shouldValidate: true });
      setValue('guestCount', booking.guestCount || 100, { shouldDirty: true, shouldValidate: true });
      setValue('status', booking.status || 'confirmed', { shouldDirty: true, shouldValidate: true });
      
      // Sync date fields (assuming booking.eventDate is YYYY-MM-DD)
      if (booking.eventDate) {
        setValue('start', `${booking.eventDate}T09:00:00`, { shouldDirty: true, shouldValidate: true });
        setValue('end', `${booking.eventEndDate || booking.eventDate}T18:00:00`, { shouldDirty: true, shouldValidate: true });
      }
    } else {
      setValue('bookingId', '', { shouldDirty: true });
      setValue('title', '', { shouldDirty: true });
    }
  };

  const eventTypeOptions = [
    { value: 'personal', label: 'Personal Schedule' },
    { value: 'blocked', label: 'Blocked Out' },
    { value: 'maintenance', label: 'Maintenance Work' },
    { value: 'holiday', label: 'Public Holiday' },
    { value: 'booking', label: 'Linked Booking' },
  ];

  const hallSectionOptions = [
    { value: 'Main Hall', label: 'Main Hall' },
    { value: 'Garden Area', label: 'Garden Area' },
    { value: 'Terrace', label: 'Terrace' },
  ];

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-5">
      
      {/* Availability warning */}
      <AvailabilityWarning
        start={watchStart}
        end={watchEnd}
        hallSection={watchHallSection}
        excludeEventId={excludeEventId}
      />

      <div className="space-y-4 text-xs font-semibold text-slate-700">
        
        {/* Event Type Select */}
        <SelectField
          name="type"
          label="Event Category"
          placeholder="Select category"
          options={eventTypeOptions}
          disabled={loading}
        />

        {/* Searchable Booking List Combobox (only for Linked Bookings) */}
        {watchType === 'booking' && (
          <BookingCombobox
            selectedBookingId={watchBookingId}
            onSelect={handleBookingSelect}
            error={errors.bookingId?.message}
            disabled={loading}
          />
        )}

        {/* Event Title */}
        <InputField
          name="title"
          label="Event Title"
          placeholder="e.g. Annual AC Maintenance check"
          disabled={loading}
        />

        {/* Hall Section select */}
        <SelectField
          name="hallSection"
          label="Hall Section"
          placeholder="Select section"
          options={hallSectionOptions}
          disabled={loading}
        />

        {/* All day checkbox */}
        <div className="flex items-center gap-2 py-1 select-none">
          <input
            id="allDay"
            type="checkbox"
            className="h-4.5 w-4.5 rounded border-slate-200 text-primary focus:ring-primary-light shrink-0 cursor-pointer"
            {...form.register('allDay')}
            disabled={loading}
          />
          <label htmlFor="allDay" className="text-xs text-slate-500 font-semibold cursor-pointer">
            All Day Event (no specific times)
          </label>
        </div>

        {/* Start and End date time inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="start" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Start Date/Time
            </label>
            <input
              type={watchAllDay ? 'date' : 'datetime-local'}
              id="start"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                errors.start
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
              }`}
              {...form.register('start')}
            />
            {errors.start?.message && (
              <p className="text-xs text-red-550 font-semibold mt-1">{errors.start.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="end" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              End Date/Time
            </label>
            <input
              type={watchAllDay ? 'date' : 'datetime-local'}
              id="end"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                errors.end
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
              }`}
              {...form.register('end')}
            />
            {errors.end?.message && (
              <p className="text-xs text-red-550 font-semibold mt-1">{errors.end.message}</p>
            )}
          </div>
        </div>

        {/* Guest count input (only for Linked Bookings) */}
        {watchType === 'booking' && (
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="guestCount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Guest Count
            </label>
            <input
              type="number"
              id="guestCount"
              placeholder="e.g. 150"
              disabled={loading}
              className={`w-full h-9 px-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                errors.guestCount
                  ? 'border-red-500 focus:ring-red-450'
                  : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
              }`}
              {...form.register('guestCount', { valueAsNumber: true })}
            />
            {errors.guestCount?.message && (
              <p className="text-xs text-red-550 font-semibold mt-1">{errors.guestCount.message}</p>
            )}
          </div>
        )}

        {/* Status selection */}
        <SelectField
          name="status"
          label="Event Status"
          placeholder="Select status"
          options={statusOptions}
          disabled={loading}
        />

        {/* Notes / description */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes / Description
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Add schedule instructions, custom contacts, etc."
            disabled={loading}
            className={`w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-350 focus:ring-2 focus:ring-primary-light transition-all`}
            {...form.register('notes')}
          />
          {errors.notes?.message && (
            <p className="text-xs text-red-550 font-semibold mt-1">{errors.notes.message}</p>
          )}
        </div>

      </div>

      {/* Action panel footer */}
      <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-650 transition-colors shadow-sm cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>

    </FormProvider>
  );
}
