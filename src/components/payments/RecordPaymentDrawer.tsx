'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { SelectField } from '@/components/forms/SelectField';
import { paymentFormSchema, PaymentFormValues } from '@/schemas/payment.schema';
import { useBookings } from '@/hooks/useBookings';
import { useCreatePayment } from '@/hooks/usePayments';
import { CalendarEventDrawer } from '../calendar/CalendarEventDrawer';
import { Search, ChevronDown, Check, Loader2, Calendar, AlertTriangle, Hash, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { getLocalDateString } from '@/utils/formatters';
import { PaymentMethod } from '@/types/payment';

interface RecordPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Option to pre-select a booking ID
  preselectedBookingId?: string;
}

export function RecordPaymentDrawer({
  isOpen,
  onClose,
  preselectedBookingId,
}: RecordPaymentDrawerProps) {
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const createPaymentMutation = useCreatePayment();

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(bookingSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [bookingSearchQuery]);

  // Load bookings for search selector
  const { data: bookingsList = [], isLoading: bookingsLoading } = useBookings({
    search: debouncedSearch,
  });

  // Filter bookings to show only those with pending balances, or the preselected one
  const pendingBookingsList = bookingsList.filter(
    (b) => b.pendingAmount > 0 || b.id === preselectedBookingId
  );

  // Setup form validation
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      bookingId: '',
      amount: 0,
      paymentMethod: 'cash',
      referenceNumber: '',
      paymentDate: getLocalDateString(),
      notes: '',
      status: 'completed',
      pendingAmount: undefined,
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const watchBookingId = watch('bookingId');
  const watchMethod = watch('paymentMethod');
  const watchAmount = watch('amount');
  const watchPendingAmount = watch('pendingAmount');

  // Load and pre-select booking if passed as prop
  useEffect(() => {
    if (preselectedBookingId && bookingsList.length > 0) {
      const selected = bookingsList.find((b) => b.id === preselectedBookingId);
      if (selected) {
        setValue('bookingId', selected.id, { shouldValidate: true });
        setValue('pendingAmount', selected.pendingAmount, { shouldValidate: true });
        setValue('amount', selected.pendingAmount, { shouldValidate: true });
      }
    }
  }, [preselectedBookingId, bookingsList, setValue]);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        bookingId: '',
        amount: 0,
        paymentMethod: 'cash',
        referenceNumber: '',
        paymentDate: getLocalDateString(),
        notes: '',
        status: 'completed',
        pendingAmount: undefined,
      });
      setBookingSearchQuery('');
    }
  }, [isOpen, reset]);

  // Close combobox on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBooking = bookingsList.find((b) => b.id === watchBookingId) || null;

  const handleBookingSelect = (booking: any) => {
    if (booking) {
      setValue('bookingId', booking.id, { shouldDirty: true, shouldValidate: true });
      setValue('pendingAmount', booking.pendingAmount, { shouldDirty: true, shouldValidate: true });
      // Default amount to the pending amount
      setValue('amount', booking.pendingAmount, { shouldDirty: true, shouldValidate: true });
    } else {
      setValue('bookingId', '', { shouldDirty: true });
      setValue('pendingAmount', undefined, { shouldDirty: true });
    }
    setComboboxOpen(false);
    setBookingSearchQuery('');
  };

  const onSubmit = async (values: PaymentFormValues) => {
    createPaymentMutation.mutate(
      {
        bookingId: values.bookingId,
        amount: values.amount,
        paymentMethod: values.paymentMethod as PaymentMethod,
        paymentDate: values.paymentDate,
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const paymentMethodOptions = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'upi', label: '📱 UPI' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'cheque', label: '📄 Cheque' },
    { value: 'card', label: '💳 Card' },
    { value: 'other', label: '➕ Other' },
  ];

  const showReferenceField = ['upi', 'bank_transfer', 'cheque'].includes(watchMethod);

  return (
    <CalendarEventDrawer isOpen={isOpen} onClose={onClose} title="Record Payment">
      <FormProvider form={form} onSubmit={onSubmit} className="space-y-5">
        
        {/* Step 1: Select Booking */}
        <div className="space-y-1.5 w-full text-xs font-semibold text-slate-700" ref={comboboxRef}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Select Booking Reference
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setComboboxOpen(!comboboxOpen)}
              className={`w-full h-10 px-3 flex items-center justify-between text-sm bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.bookingId ? 'border-red-500' : 'border-slate-200 hover:border-slate-350 shadow-sm'
              }`}
            >
              {selectedBooking ? (
                <span className="text-slate-800 font-bold">
                  {selectedBooking.bookingNumber} - {selectedBooking.customerName}
                </span>
              ) : (
                <span className="text-slate-400 font-medium">Search booking number or customer...</span>
              )}
              <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0 ml-2" />
            </button>

            {comboboxOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-premium z-20 overflow-hidden animate-fadeIn">
                {/* Search bar */}
                <div className="relative p-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Search by ID, name, event type..."
                    className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                {/* Dropdown list */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 text-xs">
                  {bookingsLoading ? (
                    <div className="p-4 text-center text-slate-450 font-semibold flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-light" />
                      Loading bookings...
                    </div>
                  ) : pendingBookingsList.length > 0 ? (
                    pendingBookingsList.map((booking) => {
                      const isSelected = booking.id === watchBookingId;
                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => handleBookingSelect(booking)}
                          className="w-full flex items-center justify-between text-left p-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 pr-2">
                            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center font-bold text-xs shrink-0 border border-primary-light/10">
                              <Calendar className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 block leading-tight font-mono">
                                {booking.bookingNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                                {booking.customerName} • {booking.eventType}
                              </span>
                              <span className="text-[9px] text-slate-450 block font-mono">
                                Date: {booking.eventDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-rose-600 block font-mono">
                              {formatCurrency(booking.pendingAmount)} pending
                            </span>
                            {isSelected && <Check className="h-4 w-4 text-primary-light inline-block mt-1" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 font-semibold">No bookings found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {errors.bookingId?.message && (
            <p className="text-xs text-red-500 font-semibold mt-1">{errors.bookingId.message}</p>
          )}
        </div>

        {/* Selected Booking Summary Card */}
        {selectedBooking && (
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-100 space-y-2.5 text-xs font-semibold text-violet-850 animate-slideDown shadow-sm">
            <div className="flex justify-between items-center border-b border-violet-200/40 pb-2">
              <span className="text-[10px] uppercase font-bold text-violet-500 tracking-wider">
                Booking Reference details
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded text-[10px] font-bold text-violet-600 border border-violet-100">
                {selectedBooking.bookingNumber}
              </span>
            </div>

            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-violet-600">Booking Rate</span>
                <span className="font-bold font-mono">{formatCurrency(selectedBooking.bookingAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700">
                <span>Total Paid Collected</span>
                <span className="font-bold font-mono">
                  {formatCurrency(selectedBooking.bookingAmount - selectedBooking.pendingAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-rose-700 font-bold border-t border-violet-200/30 pt-1.5 leading-none">
                <span>Outstanding Balance</span>
                <span className="font-extrabold font-mono">{formatCurrency(selectedBooking.pendingAmount)}</span>
              </div>
            </div>

            {/* Zero pending amount warning */}
            {selectedBooking.pendingAmount === 0 && (
              <div className="flex items-start gap-1.5 mt-2 bg-white/70 p-2 rounded border border-amber-200 text-amber-850 text-[10px] leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>⚠️ Fully Collected:</strong> This booking has no outstanding pending amount left.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment Details */}
        {selectedBooking && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            
            {/* Amount input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 font-bold text-sm">
                  ₹
                </span>
                <input
                  id="amount"
                  type="number"
                  placeholder="e.g. 15000"
                  disabled={createPaymentMutation.isPending}
                  className={`w-full h-9 pl-7 pr-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                    errors.amount
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
                  }`}
                  {...form.register('amount', { valueAsNumber: true })}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">
                Max available pending: {formatCurrency(watchPendingAmount)}
              </p>
              {errors.amount?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Date input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="paymentDate" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Date
              </label>
              <input
                type="date"
                id="paymentDate"
                disabled={createPaymentMutation.isPending}
                className={`w-full h-9 px-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                  errors.paymentDate
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
                }`}
                {...form.register('paymentDate')}
              />
              {errors.paymentDate?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.paymentDate.message}</p>
              )}
            </div>

            {/* Method input */}
            <SelectField
              name="paymentMethod"
              label="Payment Method"
              placeholder="Select method"
              options={paymentMethodOptions}
              disabled={createPaymentMutation.isPending}
            />

            {/* Reference Number input (optional, conditional) */}
            {showReferenceField && (
              <div className="flex flex-col gap-1.5 w-full animate-slideDown">
                <label htmlFor="referenceNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reference Number (UTR / Ref ID)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Hash className="h-4 w-4" />
                  </span>
                  <input
                    id="referenceNumber"
                    type="text"
                    placeholder="e.g. UTR1234567890"
                    disabled={createPaymentMutation.isPending}
                    className={`w-full h-9 pl-9 pr-3 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 ${
                      errors.referenceNumber
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-slate-200 hover:border-slate-350 focus:ring-primary-light'
                    }`}
                    {...form.register('referenceNumber')}
                  />
                </div>
                {errors.referenceNumber?.message && (
                  <p className="text-xs text-red-500 font-semibold mt-1">{errors.referenceNumber.message}</p>
                )}
              </div>
            )}

            {/* Notes input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Installment payment notes, check clearing notes..."
                disabled={createPaymentMutation.isPending}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-350 focus:ring-2 focus:ring-primary-light transition-all"
                {...form.register('notes')}
              />
              {errors.notes?.message && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.notes.message}</p>
              )}
            </div>

          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100 bg-white shrink-0 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={createPaymentMutation.isPending}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-350 rounded-lg text-xs font-bold text-slate-650 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPaymentMutation.isPending || !selectedBooking}
            className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {createPaymentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Recording...
              </>
            ) : (
              'Record Payment'
            )}
          </button>
        </div>

      </FormProvider>
    </CalendarEventDrawer>
  );
}
