'use client';

import React, { useState } from 'react';
import { Plus, Download, CalendarRange, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { usePayments, usePaymentSummary, useDeletePayment } from '@/hooks/usePayments';
import { PaymentStatsCards } from '@/components/payments/PaymentStatsCards';
import { RevenueChart } from '@/components/payments/RevenueChart';
import { PaymentMethodChart } from '@/components/payments/PaymentMethodChart';
import { PaymentTable } from '@/components/payments/PaymentTable';
import { RecordPaymentDrawer } from '@/components/payments/RecordPaymentDrawer';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import { Payment } from '@/types/payment';
import { formatDate } from '@/utils/formatters';
import { toast } from 'sonner';

export default function PaymentsListPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Date Range Filters State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected receipt state
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  // Queries
  const {
    data: paymentsData = { data: [], total: 0 },
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = usePayments({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = usePaymentSummary();

  const deletePaymentMutation = useDeletePayment();

  const handleRefresh = () => {
    refetchList();
    refetchSummary();
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    const list = paymentsData.data || [];
    if (list.length === 0) {
      toast.error('No payments matching current filter criteria to export.');
      return;
    }

    toast.success(`Exporting ${list.length} payment records...`);

    const headers = [
      'Payment Date',
      'Customer Name',
      'Customer Phone',
      'Booking Number',
      'Event Type',
      'Event Date',
      'Payment Amount',
      'Payment Method',
      'Reference Number',
      'Status',
      'Notes',
    ];

    const csvRows = [headers.join(',')];

    list.forEach((p) => {
      const row = [
        formatDate(p.paymentDate),
        p.customerName,
        p.customerPhone,
        p.bookingNumber,
        p.eventType,
        formatDate(p.eventDate),
        p.amount,
        p.paymentMethod,
        p.referenceNumber || '',
        p.status,
        (p.notes || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      ];
      csvRows.push(row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hallsondesk-payments-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeletePayment = (paymentId: string, amount: number) => {
    if (confirm(`Are you sure you want to reverse this payment transaction of ₹${amount.toLocaleString('en-IN')}?`)) {
      deletePaymentMutation.mutate(paymentId);
    }
  };

  const handleBulkDelete = (paymentIds: string[]) => {
    // Delete payments sequentially or trigger alert
    // Since deletePayment takes a single ID in mutation, we run them sequentially
    Promise.all(paymentIds.map((id) => deletePaymentMutation.mutateAsync(id)))
      .then(() => {
        toast.success('Selected payments deleted successfully.');
      })
      .catch((err) => {
        console.error('Bulk deletion failed:', err);
      });
  };

  // Loading skeletons
  if (isListLoading || isSummaryLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="h-9 bg-slate-100 rounded w-32" />
        </div>

        {/* 5 KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[92px] bg-slate-100 border border-slate-200 rounded-xl" />
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-[350px] bg-slate-100 border border-slate-200 rounded-xl" />
          <div className="lg:col-span-2 h-[350px] bg-slate-100 border border-slate-200 rounded-xl" />
        </div>

        {/* Table skeleton */}
        <div className="border border-slate-200 rounded-xl bg-white p-5 space-y-4">
          <div className="h-10 bg-slate-100 rounded-lg w-full" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50/50 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error boundary
  if (isListError) {
    return (
      <div className="border border-red-200 bg-red-50/30 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 my-12 animate-fadeIn shadow-sm select-none">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-850">Failed to load payments</h3>
        <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed font-semibold">
          {listError?.message || 'A network error occurred. Please verify your connection and try again.'}
        </p>
        <button
          onClick={handleRefresh}
          className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Payments Ledger
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold shadow-sm shrink-0 font-mono">
            {paymentsData.total} Transactions
          </span>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-605">
          {/* Date Picker trigger */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-3 h-9 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm text-slate-650 cursor-pointer"
            >
              <CalendarRange className="h-4 w-4 text-slate-400" />
              Date Filter
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-premium z-30 flex flex-col gap-3.5 w-64 text-slate-700 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                  Range Selection
                </span>
                <div className="flex flex-col gap-2 font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setShowDatePicker(false);
                    }}
                    className="text-center text-[10px] text-rose-600 hover:underline cursor-pointer border-t border-slate-50 pt-2"
                  >
                    Clear Filter Selection
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 h-9 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm text-slate-650 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-400" />
            Export CSV
          </button>

          {/* Record button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm transition-all cursor-pointer font-bold"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {summary && <PaymentStatsCards summary={summary} />}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <PaymentMethodChart />
        </div>
      </div>

      {/* Main Transactions Table */}
      <PaymentTable
        payments={paymentsData.data || []}
        onViewReceipt={setSelectedReceiptPayment}
        onDeletePayment={handleDeletePayment}
        onBulkDelete={handleBulkDelete}
        isDeleting={deletePaymentMutation.isPending}
      />

      {/* Add payment drawer overlay */}
      <RecordPaymentDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Printable Receipt modal overlay */}
      <ReceiptModal
        isOpen={!!selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />

    </div>
  );
}
