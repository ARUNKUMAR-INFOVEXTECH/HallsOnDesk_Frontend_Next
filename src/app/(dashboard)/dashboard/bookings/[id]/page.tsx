'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  Users,
  FileText,
  DollarSign,
  Printer,
  Trash2,
  Plus,
  X,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Payment } from '@/types';

// Queries & Mutations
import {
  useBooking,
  useUpdateBooking,
  useDeleteBooking,
} from '@/hooks/useBookings';
import {
  usePaymentsByBooking,
  useCreatePayment,
  useDeletePayment,
} from '@/hooks/usePayments';
import {
  useInvoiceByBooking,
  useCreateInvoice,
} from '@/hooks/useInvoices';
import {
  getInvoiceHtml,
  getReceiptHtml,
} from '@/services/api/modules/invoices.service';

// Subcomponents & Helpers
import { BookingDetailHeader } from '@/components/bookings/BookingDetailHeader';
import { BookingTimeline } from '@/components/bookings/BookingTimeline';
import { BookingForm } from '@/components/bookings/BookingForm';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { BookingFormValues } from '@/schemas/booking.schema';

export default function BookingDetailPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 bg-slate-200 rounded-xl" />
            <div className="lg:col-span-4 h-96 bg-slate-200 rounded-xl" />
          </div>
        </div>
      }
    >
      <BookingDetailPage />
    </Suspense>
  );
}

function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Modal form states
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque'>('cash');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Sync edit mode from search query param (?tab=edit)
  useEffect(() => {
    if (searchParams && searchParams.get('tab') === 'edit') {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [searchParams]);

  // API Queries
  const {
    data: booking,
    isLoading: isBookingLoading,
    isError: isBookingError,
    refetch: refetchBooking,
  } = useBooking(id);

  const {
    data: rawPayments = [],
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = usePaymentsByBooking(id);

  const payments: Payment[] = Array.isArray(rawPayments) ? rawPayments : (rawPayments as any)?.data || [];

  const {
    data: rawInvoice,
    isLoading: isInvoiceLoading,
    refetch: refetchInvoice,
  } = useInvoiceByBooking(id);

  const invoice = rawInvoice && (rawInvoice as any).invoice_number === undefined && (rawInvoice as any).data ? (rawInvoice as any).data : rawInvoice;

  // Mutations
  const updateMutation = useUpdateBooking();
  const deleteMutation = useDeleteBooking();
  const createPaymentMutation = useCreatePayment();
  const deletePaymentMutation = useDeletePayment(id);
  const createInvoiceMutation = useCreateInvoice();

  const handleRefresh = () => {
    refetchBooking();
    refetchPayments();
    refetchInvoice();
  };

  // Perform updates
  const handleEditSubmit = async (data: BookingFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setIsEditing(false);
      router.push(`/dashboard/bookings/${id}`);
    } catch (err) {
      console.error('Update booking failed:', err);
    }
  };

  // Perform delete booking
  const handleDeleteBooking = async () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete booking #${booking?.bookingNumber}?`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
        router.push('/dashboard/bookings');
      } catch (err) {
        console.error('Delete booking failed:', err);
      }
    }
  };

  // Perform payment creation
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(payAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await createPaymentMutation.mutateAsync({
        booking_id: id,
        amount: parsedAmount,
        payment_method: payMethod,
        payment_date: payDate,
        notes: payNotes || undefined,
      });

      // Clear states & close modal
      setPayAmount('');
      setPayMethod('cash');
      setPayDate(new Date().toISOString().split('T')[0]);
      setPayNotes('');
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Record payment failed:', err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Perform invoice creation
  const handleGenerateInvoice = async () => {
    try {
      await createInvoiceMutation.mutateAsync(id);
    } catch (err) {
      console.error('Invoice creation failed:', err);
    }
  };

  // HTML Print triggers
  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      const html = await getInvoiceHtml(invoiceId);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (err) {
      console.error('Print invoice failed:', err);
      toast.error('Failed to load invoice layout.');
    }
  };

  const handlePrintReceipt = async (paymentId: string) => {
    try {
      const html = await getReceiptHtml(paymentId);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (err) {
      console.error('Print receipt failed:', err);
      toast.error('Failed to load receipt layout.');
    }
  };

  // Delete payment confirmation
  const handleDeletePayment = async (payId: string, payAmt: number) => {
    if (
      window.confirm(
        `Are you sure you want to reverse the payment of ${formatCurrency(payAmt)}?`
      )
    ) {
      try {
        await deletePaymentMutation.mutateAsync(payId);
      } catch (err) {
        console.error('Delete payment failed:', err);
      }
    }
  };

  if (isBookingLoading) {
    return (
      <div className="space-y-6 animate-pulse py-2">
        <div className="h-6 bg-slate-200 rounded w-1/6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isBookingError || !booking) {
    return (
      <div className="border border-red-200 bg-red-50/20 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4 my-12 animate-fadeIn">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-805 tracking-tight">
          Booking Record Not Found
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The requested booking record does not exist, or has been permanently deleted from the database registry.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/bookings"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 transition-colors shadow-sm"
          >
            Back to Bookings
          </Link>
          <button
            onClick={handleRefresh}
            className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate live financial figures
  const netAmount = Math.max(0, booking.bookingAmount - booking.discountAmount);
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaid = booking.advanceAmount + totalPaymentsAmount;
  const pendingBalance = Math.max(0, netAmount - totalPaid);
  const paymentProgress = netAmount > 0 ? Math.min(100, Math.round((totalPaid / netAmount) * 100)) : 0;

  // Determine status color configurations
  const paymentStatusConfig = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const customerInitials = (booking.customerName || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Toggle view state rendering
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-2">
        <div>
          <button
            onClick={() => {
              setIsEditing(false);
              router.push(`/dashboard/bookings/${id}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Booking Details
          </button>
        </div>

        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Booking Reservation
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Modify rate parameters, schedules, or specifications for booking #{booking.bookingNumber}.
          </p>
        </div>

        <BookingForm
          initialValues={{
            customerId: booking.customerId,
            eventType: booking.eventType,
            eventDate: booking.eventDate,
            eventEndDate: booking.eventEndDate,
            hallSection: booking.hallSection,
            guestCount: booking.guestCount,
            bookingAmount: booking.bookingAmount,
            advanceAmount: booking.advanceAmount,
            discountAmount: booking.discountAmount,
            status: booking.status,
            notes: booking.notes,
          }}
          onSubmit={handleEditSubmit}
          loading={updateMutation.isPending}
          submitLabel="Save Updates"
          onCancel={() => {
            setIsEditing(false);
            router.push(`/dashboard/bookings/${id}`);
          }}
          excludeBookingId={id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* 1. Header Details Panel */}
      <BookingDetailHeader
        booking={{
          ...booking,
          // Sync live calculated payment status
          paymentStatus: totalPaid >= netAmount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid',
        }}
        onEditClick={() => {
          setIsEditing(true);
          router.push(`/dashboard/bookings/${id}?tab=edit`);
        }}
        onDeleteClick={handleDeleteBooking}
        isDeleting={deleteMutation.isPending}
      />

      {/* 2. Main Two-Column Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Contact, Event Meta, and Activity Lifecycles */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card A: Customer details profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-305 transition-colors text-xs font-semibold">
            <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Customer Details</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Primary point of contact for reservation rates & invoicing</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-primary-lighter border border-primary-light/10 flex items-center justify-center font-bold text-lg text-primary-light shadow-sm shrink-0">
                {customerInitials}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 w-full">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Client Name</span>
                  <span className="text-slate-850 font-bold text-xs block pt-1.5">{booking.customerName}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Phone Number</span>
                  <span className="text-slate-850 font-bold block pt-1.5 font-mono">{booking.customerPhone || 'Not provided'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Email Address</span>
                  <span className="text-slate-855 font-bold block pt-1.5 truncate">{booking.customerEmail || 'No email registered'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Booking Details Metadata */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-305 transition-colors text-xs font-semibold">
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-sm font-semibold text-slate-800">Event Configuration & Specifications</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Schedules, sections, guest parameters, and custom logistics logs</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event Start Date</span>
                  <span className="text-slate-800 font-bold block mt-1.5 font-mono">{formatDate(booking.eventDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Event End Date</span>
                  <span className="text-slate-800 font-bold block mt-1.5 font-mono">{formatDate(booking.eventEndDate || booking.eventDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Venue Hall / Sections</span>
                  <span className="text-slate-800 font-bold block mt-1.5">{booking.hallSection}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light border border-primary-light/10 flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Guest Count</span>
                  <span className="text-slate-800 font-bold block mt-1.5 font-mono">{booking.guestCount.toLocaleString()} Guests</span>
                </div>
              </div>
            </div>

            {/* Render Notes if they exist */}
            {booking.notes && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200/50 rounded-xl font-medium text-slate-505 leading-relaxed relative">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Catering & Setup Requirements</span>
                "{booking.notes}"
              </div>
            )}
          </div>

          {/* Card C: Timeline log of events */}
          <BookingTimeline booking={booking} payments={payments} />
        </div>

        {/* Right Column: Billing statistics, Payment Forms, and Log tables */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card D: Dynamic calculated summary & payment progress */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-305 transition-colors space-y-5 text-xs font-semibold text-slate-650">
            <div className="border-b border-slate-100 pb-3 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Financial Overview</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Rates, adjustments, collections progress, and balance due</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Booking Amount (Gross)</span>
                <span className="font-bold text-slate-800 font-mono">{formatCurrency(booking.bookingAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Discount Amount</span>
                <span className="font-mono font-bold text-rose-500">- {formatCurrency(booking.discountAmount)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-slate-800 font-bold">
                <span>Net Billing Amount</span>
                <span className="font-extrabold text-primary font-mono">{formatCurrency(netAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 font-semibold">
                <span>Advance Deposit Paid</span>
                <span className="font-bold font-mono">{formatCurrency(booking.advanceAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 font-semibold">
                <span>Logged Installments</span>
                <span className="font-bold font-mono">+{formatCurrency(totalPaymentsAmount)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-850">Total Paid Collections</span>
                <span className="text-emerald-600 font-mono">{formatCurrency(totalPaid)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-850">Remaining Balance</span>
                <span className={`font-mono ${pendingBalance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {formatCurrency(pendingBalance)}
                </span>
              </div>
            </div>

            {/* Collection progress status bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                <span>Collection rate</span>
                <span className="font-mono text-slate-700">{paymentProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-150">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
            </div>

            {/* Payment CTAs */}
            <div className="pt-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#EE9B00] hover:bg-[#D48A00] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Record Client Payment
              </button>
            </div>
          </div>

          {/* Card E: Invoice generator details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-305 transition-colors text-xs font-semibold text-slate-600">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Invoice Registry</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Venue GST billing documentation and status</p>
              </div>
            </div>

            {isInvoiceLoading ? (
              <div className="flex items-center justify-center p-6 text-slate-450 gap-2 font-medium">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-[#EE9B00]" />
                Checking billing records...
              </div>
            ) : invoice ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Invoice ID</span>
                    <span className="text-slate-800 font-bold block mt-1.5 font-mono">#{invoice.invoice_number}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold capitalize ${
                      invoice.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : invoice.status === 'partial'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Invoice Date</span>
                    <span className="text-slate-700 block mt-1.5 font-mono">{formatDate(invoice.invoice_date)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold leading-none">Balance Due</span>
                    <span className="text-slate-800 font-bold block mt-1.5 font-mono">{formatCurrency(invoice.balance_due)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePrintInvoice(invoice.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer mt-1"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Download Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2 font-medium">
                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-450">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <p className="text-[11px] text-slate-450 leading-relaxed max-w-[220px] mx-auto">
                  No billing invoice drafted for this customer reservation.
                </p>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={createInvoiceMutation.isPending}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Draft Invoicing Record
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Card F: Installments payment logs list */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-305 transition-colors text-xs font-semibold text-slate-600">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Installments History Log</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Logs of individual collection transactions</p>
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800 font-mono text-xs">
                        {formatCurrency(payment.amount)}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">
                        <span>{payment.payment_method.replace('_', ' ')}</span>
                        <span>•</span>
                        <span className="font-mono">{formatDate(payment.payment_date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePrintReceipt(payment.id)}
                        title="Print Receipt"
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all cursor-pointer shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id, payment.amount)}
                        title="Reverse Payment"
                        disabled={deletePaymentMutation.isPending}
                        className="h-7 w-7 inline-flex items-center justify-center text-red-500 hover:text-red-750 border border-red-100 hover:border-red-200 bg-white hover:bg-rose-50 rounded-md transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-slate-150 rounded-xl bg-slate-50/50 font-medium">
                No installment payments logged yet.
              </div>
            )}
          </div>

        </div>
      </div>      {/* 3. Sliding / Modal record payment form overlay */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPaymentModal(false);
                setPayAmount('');
              }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-premium p-6 space-y-4 z-10 flex flex-col text-xs font-semibold text-slate-700"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-805 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4.5 w-4.5 text-[#EE9B00]" />
                  Record Installment Payment
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPayAmount('');
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreatePayment} className="space-y-4">
                
                {/* Payment Amount */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="payAmt" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Payment Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      id="payAmt"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full h-10 pl-7 pr-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                    />
                  </div>
                </div>

                {/* Payment Date & Method Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="payDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="payDate"
                      required
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="payMeth" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Payment Method
                    </label>
                    <select
                      id="payMeth"
                      required
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as any)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700 font-semibold cursor-pointer shadow-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI / QR Scan</option>
                      <option value="card">Card Payment</option>
                      <option value="cheque">Cheque Draft</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="payNote" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Transaction Notes (Optional)
                  </label>
                  <textarea
                    id="payNote"
                    rows={2}
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Cleared second installment check, reference code..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-750 font-semibold shadow-sm"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPayAmount('');
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-655 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      'Record Payment'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
