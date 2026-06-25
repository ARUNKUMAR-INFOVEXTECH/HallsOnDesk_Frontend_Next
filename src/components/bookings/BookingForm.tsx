'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { bookingFormSchema, BookingFormValues } from '@/schemas/booking.schema';
import { CustomerCombobox } from './CustomerCombobox';
import { AvailabilityChecker } from './AvailabilityChecker';
import { BookingPaymentSummary } from './BookingPaymentSummary';
import { useHallSettings } from '@/hooks/useSettings';
import { Calendar, Users, Percent, HelpCircle } from 'lucide-react';

interface BookingFormProps {
  initialValues?: Partial<BookingFormValues>;
  onSubmit: (data: BookingFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  excludeBookingId?: string;
}

export function BookingForm({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = 'Save Booking',
  onCancel,
  excludeBookingId,
}: BookingFormProps) {
  const { data: settings } = useHallSettings();

  const formatToDatetimeLocal = (dateStr?: string, isEnd = false) => {
    if (!dateStr) return '';
    if (dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr + (isEnd ? 'T21:00' : 'T09:00');
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerId: '',
      eventType: 'Wedding Reception',
      guestCount: 100,
      bookingAmount: 0,
      advanceAmount: 0,
      discountAmount: 0,
      status: 'pending',
      notes: '',
      coordinatorName: '',
      coordinatorPhone: '',
      taxEnabled: initialValues?.taxEnabled !== undefined ? initialValues.taxEnabled : (settings?.taxEnabled || false),
      taxPercentage: initialValues?.taxPercentage !== undefined ? initialValues.taxPercentage : (settings?.gstRate || 0),
      ...initialValues,
      eventDate: initialValues?.eventDate ? formatToDatetimeLocal(initialValues.eventDate, false) : '',
      eventEndDate: initialValues?.eventEndDate ? formatToDatetimeLocal(initialValues.eventEndDate, true) : '',
    },
  });

  const {
    reset,
    watch,
    setValue,
    formState: { isDirty, errors },
  } = form;

  // Sync initialValues when editing
  useEffect(() => {
    if (initialValues) {
      reset({
        taxEnabled: initialValues.taxEnabled !== undefined ? initialValues.taxEnabled : (settings?.taxEnabled || false),
        taxPercentage: initialValues.taxPercentage !== undefined ? initialValues.taxPercentage : (settings?.gstRate || 0),
        ...initialValues,
        eventDate: initialValues.eventDate ? formatToDatetimeLocal(initialValues.eventDate, false) : '',
        eventEndDate: initialValues.eventEndDate ? formatToDatetimeLocal(initialValues.eventEndDate, true) : '',
      });
    }
  }, [initialValues, reset, settings]);

  // Autofill settings defaults for new bookings
  useEffect(() => {
    if (settings) {
      if (initialValues) {
        if (initialValues.taxEnabled !== undefined) {
          setValue('taxEnabled', initialValues.taxEnabled);
        } else {
          setValue('taxEnabled', settings.taxEnabled || false);
        }
        if (initialValues.taxPercentage !== undefined) {
          setValue('taxPercentage', initialValues.taxPercentage);
        } else {
          setValue('taxPercentage', settings.gstRate || 0);
        }
      } else {
        setValue('taxEnabled', settings.taxEnabled || false);
        setValue('taxPercentage', settings.gstRate || 0);
      }
    }
  }, [settings, initialValues, setValue]);

  // Unsaved Changes warning before window unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Watch form inputs for payment summary and overlap check
  const watchCustomerId = watch('customerId') || '';
  const watchEventDate = watch('eventDate') || '';
  const watchEventEndDate = watch('eventEndDate') || '';
  const watchBookingAmount = watch('bookingAmount') || 0;
  const watchDiscountAmount = watch('discountAmount') || 0;
  const watchAdvanceAmount = watch('advanceAmount') || 0;
  const watchTaxEnabled = watch('taxEnabled') || false;
  const watchTaxPercentage = watch('taxPercentage') || 0;

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-8">
      {/* Dynamic Overlap Checker Banner */}
      <AvailabilityChecker
        eventDate={watchEventDate}
        eventEndDate={watchEventEndDate}
        excludeBookingId={excludeBookingId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Customer & Event Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Customer & Event Information</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Primary contact and schedule details</p>
            </div>

            {/* Customer Search & Select Combobox */}
            <CustomerCombobox
              selectedCustomerId={watchCustomerId}
              onSelect={(customer) => {
                setValue('customerId', customer?.id || '', { shouldDirty: true, shouldValidate: true });
              }}
              error={errors.customerId?.message}
            />

            {/* Event Type select */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="eventType" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Event Type
              </label>
              <select
                id="eventType"
                disabled={loading}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700 font-semibold cursor-pointer shadow-sm"
                {...form.register('eventType')}
              >
                <option value="Wedding Reception">Wedding Reception</option>
                <option value="Engagement Ceremony">Engagement Ceremony</option>
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Other">Other</option>
              </select>
              {errors.eventType?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.eventType.message}</p>
              )}
            </div>

            {/* Date Pickers columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="eventDate" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Event Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="eventDate"
                  disabled={loading}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  {...form.register('eventDate')}
                />
                {errors.eventDate?.message && (
                  <p className="text-xs text-red-550 font-semibold mt-1">{errors.eventDate.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="eventEndDate" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Event End Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="eventEndDate"
                  disabled={loading}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  {...form.register('eventEndDate')}
                />
                {errors.eventEndDate?.message && (
                  <p className="text-xs text-red-555 font-semibold mt-1">{errors.eventEndDate.message}</p>
                )}
              </div>
            </div>



            {/* Guest Count input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="guestCount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Guest Count
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  id="guestCount"
                  disabled={loading}
                  placeholder="e.g. 250"
                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  onChange={(e) => setValue('guestCount', Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                  value={form.watch('guestCount') || ''}
                />
              </div>
              {errors.guestCount?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.guestCount.message}</p>
              )}
            </div>
          </div>

          {/* Card 1.5: On-Site Coordinator Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Event Coordinator details (Optional)</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">On-site event organizer contact coordinates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="coordinatorName"
                label="Coordinator Full Name"
                placeholder="e.g. Suresh Kumar (Brother / Event Manager)"
                disabled={loading}
              />
              <InputField
                name="coordinatorPhone"
                label="Coordinator Phone Number"
                placeholder="9876543210"
                disabled={loading}
              />
            </div>
          </div>

          {/* Card 2: Additional details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Additional Information</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Booking logs context and requirements</p>
            </div>

            {/* Booking Status select */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Booking Status
              </label>
              <select
                id="status"
                disabled={loading}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700 font-semibold cursor-pointer shadow-sm"
                {...form.register('status')}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Notes textarea */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Event Requirements / Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                disabled={loading}
                placeholder="Add catering selections, decorator contact parameters, audio configurations..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700 font-semibold shadow-sm"
                {...form.register('notes')}
              />
              {errors.notes?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Details & Calculated Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Payment Configuration</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Define rental rates and advances</p>
            </div>

            {/* Booking Amount */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="bookingAmount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Booking Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  id="bookingAmount"
                  disabled={loading}
                  placeholder="e.g. 150000"
                  className="w-full h-10 pl-7 pr-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  onChange={(e) => setValue('bookingAmount', Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                  value={form.watch('bookingAmount') || ''}
                />
              </div>
              {errors.bookingAmount?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.bookingAmount.message}</p>
              )}
            </div>

            {/* Discount Amount */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="discountAmount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Discount Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  id="discountAmount"
                  disabled={loading}
                  placeholder="e.g. 10000"
                  className="w-full h-10 pl-7 pr-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  onChange={(e) => setValue('discountAmount', Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                  value={form.watch('discountAmount') || ''}
                />
              </div>
            </div>

            {/* GST Enabled Toggle */}
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 my-1">
              <div>
                <span className="font-bold text-xs text-slate-700 block">Apply GST to this booking</span>
                <span className="text-[10px] text-slate-400 font-semibold">Toggles tax calculations dynamically</span>
              </div>
              <input
                type="checkbox"
                disabled={loading}
                className="h-4 w-4 text-primary border-slate-200 rounded focus:ring-primary cursor-pointer"
                {...form.register('taxEnabled')}
              />
            </div>

            {/* GST Rate Input */}
            {watchTaxEnabled && (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="taxPercentage" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  GST Rate (%)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm">%</span>
                  <input
                    type="number"
                    id="taxPercentage"
                    disabled={loading}
                    placeholder="e.g. 18"
                    className="w-full h-10 px-3 pr-7 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                    onChange={(e) => setValue('taxPercentage', Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                    value={form.watch('taxPercentage') ?? ''}
                  />
                </div>
                {errors.taxPercentage?.message && (
                  <p className="text-xs text-red-500 font-semibold mt-1">{errors.taxPercentage.message}</p>
                )}
              </div>
            )}

            {/* Advance Paid */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="advanceAmount" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Advance Paid (INR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  id="advanceAmount"
                  disabled={loading}
                  placeholder="e.g. 40000"
                  className="w-full h-10 pl-7 pr-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  onChange={(e) => setValue('advanceAmount', Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                  value={form.watch('advanceAmount') || ''}
                />
              </div>
              {errors.advanceAmount?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.advanceAmount.message}</p>
              )}
            </div>
          </div>

          {/* Live calculator summary component */}
          <BookingPaymentSummary
            bookingAmount={Number(watchBookingAmount)}
            discountAmount={Number(watchDiscountAmount)}
            advanceAmount={Number(watchAdvanceAmount)}
            taxEnabled={watchTaxEnabled}
            taxPercentage={Number(watchTaxPercentage)}
          />

          {/* Buttons panel */}
          <div className="flex items-center gap-3 justify-end pt-2">
            {onCancel && (
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
