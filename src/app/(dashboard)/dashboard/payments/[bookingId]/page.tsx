'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Plus, ExternalLink, Download, Search, AlertCircle, RefreshCw, Loader2, Coins, Printer } from 'lucide-react';
import { useBooking } from '@/hooks/useBookings';
import { usePaymentsByBooking, useDeletePayment } from '@/hooks/usePayments';
import { BookingPaymentProgress } from '@/components/payments/BookingPaymentProgress';
import { PaymentSummaryCard } from '@/components/payments/PaymentSummaryCard';
import { PaymentTimeline } from '@/components/payments/PaymentTimeline';
import { RecordPaymentDrawer } from '@/components/payments/RecordPaymentDrawer';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';
import { Payment, PaymentMethod } from '@/types/payment';
import { toast } from 'sonner';

export default function BookingPaymentsPage() {
  const router = useRouter();
  const { bookingId } = useParams() as { bookingId: string };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Queries
  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
    error: bookingErr,
    refetch: refetchBooking,
  } = useBooking(bookingId);

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = usePaymentsByBooking(bookingId);

  const deletePaymentMutation = useDeletePayment();

  // 1. Calculate live balance figures
  const bookingAmount = booking ? booking.bookingAmount : 0;
  const discountAmount = booking ? booking.discountAmount || 0 : 0;
  const netAmount = Math.max(0, bookingAmount - discountAmount);
  const advanceAmount = booking ? booking.advanceAmount : 0;

  // Calculate sum of payments recorded in database
  const totalPaidFromPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = advanceAmount + totalPaidFromPayments;
  const pendingAmount = Math.max(0, netAmount - totalPaid);

  const handleRefresh = () => {
    refetchBooking();
    refetchPayments();
  };

  const handleDeletePayment = (paymentId: string, amount: number) => {
    if (confirm(`Are you sure you want to reverse this payment transaction of ₹${amount.toLocaleString('en-IN')}?`)) {
      deletePaymentMutation.mutate(paymentId, {
        onSuccess: () => {
          refetchBooking();
          refetchPayments();
        },
      });
    }
  };

  // 2. Map Payment Method Stats specifically for this booking
  const bookingMethodStats = useMemo(() => {
    const stats: Record<PaymentMethod, number> = {
      cash: 0,
      upi: 0,
      bank_transfer: 0,
      cheque: 0,
      card: 0,
      other: 0,
    };

    // Add advance if set
    if (advanceAmount > 0) {
      stats.cash += advanceAmount; // default advance to cash method mapping
    }

    payments.forEach((p) => {
      if (stats[p.paymentMethod] !== undefined) {
        stats[p.paymentMethod] += p.amount;
      }
    });

    return Object.entries(stats)
      .map(([method, amount]) => ({
        method: method as PaymentMethod,
        amount,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [payments, advanceAmount]);

  const methodLabels: Record<PaymentMethod, string> = {
    cash: 'Cash / Handover',
    upi: 'UPI Transfer',
    bank_transfer: 'Bank Transfer UTR',
    cheque: 'Bank Cheque Clear',
    card: 'Credit/Debit Card',
    other: 'Other/Adjusted',
  };

  // Status Badge mappings
  const bookingStatusConfig = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-250',
  };

  const statusBadgeClass = booking
    ? bookingStatusConfig[booking.status as keyof typeof bookingStatusConfig] || 'bg-slate-50 text-slate-700'
    : '';

  // 3. Loading Skeletons
  if (bookingLoading || paymentsLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse select-none">
        <div className="h-6 bg-slate-100 rounded w-16" />
        {/* Header card skeleton */}
        <div className="h-32 bg-slate-100 border border-slate-200 rounded-xl w-full" />
        {/* Progress bar skeleton */}
        <div className="h-20 bg-slate-100 border border-slate-200 rounded-xl w-full" />
        {/* Two columns skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 h-80 bg-slate-100 border border-slate-200 rounded-xl" />
          <div className="md:col-span-2 space-y-6">
            <div className="h-44 bg-slate-100 border border-slate-200 rounded-xl" />
            <div className="h-32 bg-slate-100 border border-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 4. Deactivated/Not Found states
  if (bookingError || !booking) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mx-auto">
          <Search className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">Booking not found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The booking reference does not exist or has been deleted from the database console.
        </p>
        <button
          onClick={() => router.push('/dashboard/payments')}
          className="bg-primary hover:bg-primary-hover text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      
      {/* Navigation and Back button */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-650 print:hidden">
        <button
          onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
          className="p-1 rounded-md hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          title="Back to Booking details"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <span className="text-slate-400">Back to Reservation Details</span>
      </div>

      {/* Booking Summary Header Card */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-custom-md flex flex-col md:flex-row md:items-center justify-between gap-5 text-xs font-semibold text-slate-600">
        
        {/* Left Side detail panel */}
        <div className="space-y-1">
          <span className="font-mono text-violet-600 text-[10px] font-bold uppercase tracking-widest bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded shadow-sm inline-block">
            {booking.bookingNumber}
          </span>
          <h2 className="text-lg font-black text-slate-850 tracking-tight leading-snug mt-1">
            {booking.customerName}
          </h2>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 font-mono">
            <span>{booking.eventType}</span>
            <span>•</span>
            <span>Date: {formatDate(booking.eventDate)}</span>
          </div>
        </div>

        {/* Right Side Stats indicators */}
        <div className="flex items-center gap-5.5 self-start md:self-auto flex-wrap">
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Rate</span>
            <span className="text-slate-800 font-extrabold font-mono mt-1 text-sm">
              {formatCurrency(netAmount)}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Paid</span>
            <span className="text-emerald-600 font-extrabold font-mono mt-1 text-sm">
              {formatCurrency(totalPaid)}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Balance Due</span>
            <span className={`font-mono mt-1 text-sm font-extrabold ${pendingAmount > 0 ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
              {formatCurrency(pendingAmount)}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
            {booking.status}
          </span>
        </div>

      </div>

      {/* Progress Bar Component */}
      <BookingPaymentProgress
        totalPaid={totalPaid}
        netAmount={netAmount}
        advanceAmount={advanceAmount}
      />

      {/* Main Layout Grid split columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        
        {/* Left Column (60%): Payment Timeline list */}
        <div className="md:col-span-3">
          <PaymentTimeline
            payments={payments}
            onDeletePayment={handleDeletePayment}
            onRecordPaymentClick={() => setDrawerOpen(true)}
            isDeleting={deletePaymentMutation.isPending}
          />
        </div>

        {/* Right Column (40%): Summaries & Actions */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card A: Financial breakouts */}
          <PaymentSummaryCard
            bookingAmount={bookingAmount}
            discountAmount={discountAmount}
            totalPaid={totalPaid}
            netAmount={netAmount}
            pendingAmount={pendingAmount}
          />

          {/* Card B: Method splits details */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4.5 space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
              Payments Methods Splits
            </h4>
            <div className="space-y-2.5">
              {bookingMethodStats.map((item) => (
                <div key={item.method} className="flex justify-between items-center text-xs font-semibold text-slate-605">
                  <span className="capitalize">{methodLabels[item.method]}</span>
                  <span className="font-bold text-slate-800 font-mono">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {bookingMethodStats.length === 0 && (
                <div className="text-[10px] text-slate-400 italic">No method data recorded.</div>
              )}
            </div>
          </div>

          {/* Card C: Quick actions */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4.5 space-y-2.5">
            <h4 className="text-[10px] uppercase font-bold text-slate-405 tracking-wider mb-1">
              Ledger Quick Actions
            </h4>
            
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-violet-650 hover:bg-violet-750 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 shrink-0" />
              Record Installment
            </button>

            <Link
              href={`/dashboard/bookings/${bookingId}`}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
              Inspect Reservation Page
            </Link>

            {payments.length > 0 && (
              <button
                onClick={() => {
                  // Open modal for the latest payment receipt
                  const sorted = [...payments].sort(
                    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
                  );
                  setSelectedReceipt(sorted[0]);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 text-slate-400 shrink-0" />
                Print Latest Receipt
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Record payment slide drawer */}
      <RecordPaymentDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          refetchBooking();
          refetchPayments();
        }}
        preselectedBookingId={bookingId}
      />

      {/* Receipt details modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />

    </div>
  );
}
