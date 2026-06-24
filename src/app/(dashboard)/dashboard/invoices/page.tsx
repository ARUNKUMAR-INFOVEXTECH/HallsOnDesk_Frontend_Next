'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  DollarSign,
  TrendingUp,
  Inbox,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useInvoices, useCreateInvoice, useDeleteInvoice } from '@/hooks/useInvoices';
import { useBookings } from '@/hooks/useBookings';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { obfuscateId } from '@/utils/obfuscate';
import { toast } from 'sonner';
import { getInvoiceHtml } from '@/services/api/modules/invoices.service';
import { useAuthStore } from '@/store/authStore';
import { Invoice } from '@/types';

export default function InvoicesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const { role } = useAuthStore();
  const isAllowedToDelete = role === 'owner' || role === 'manager';

  // Queries
  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
    isError: isInvoicesError,
    refetch: refetchInvoices,
  } = useInvoices({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 20
  });

  const { data: bookings = [], isLoading: isBookingsLoading } = useBookings();
  const createInvoiceMutation = useCreateInvoice();
  const deleteInvoiceMutation = useDeleteInvoice();

  const handleRefresh = () => {
    refetchInvoices();
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

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      toast.error('Please select a booking to invoice.');
      return;
    }

    try {
      await createInvoiceMutation.mutateAsync(selectedBookingId);
      setIsDraftModalOpen(false);
      setSelectedBookingId('');
      refetchInvoices();
    } catch (err) {
      console.error('Draft invoice failed:', err);
    }
  };

  // Filter local rows by search (number or customer name) client-side for smoother interaction
  const filteredInvoices = React.useMemo(() => {
    const list = invoicesData?.data || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.customer_name && inv.customer_name.toLowerCase().includes(q)) ||
        (inv.event_name && inv.event_name.toLowerCase().includes(q))
    );
  }, [invoicesData, search]);

  const summary = invoicesData?.summary || {
    total_invoiced: 0,
    total_paid: 0,
    total_outstanding: 0,
    count: 0
  };

  // Loading skeletons
  if (isInvoicesLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="h-9 bg-slate-100 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[92px] bg-slate-100 border border-slate-200 rounded-xl" />
          ))}
        </div>
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
  if (isInvoicesError) {
    return (
      <div className="border border-red-200 bg-red-50/30 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 my-12 animate-fadeIn shadow-sm select-none">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-850">Failed to load invoices</h3>
        <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed font-semibold">
          Could not fetch invoice records. Please check database permissions or try again.
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
    <div className="space-y-6 select-none pb-8 text-xs font-semibold text-slate-655">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Invoices Registry
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5">
            Manage billing invoices, track collections, and print templates for venue clients.
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={() => setIsDraftModalOpen(true)}
          className="flex items-center justify-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm transition-all cursor-pointer font-bold text-xs"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Draft Invoice
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoiced */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-250 transition-colors flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Billed</span>
            <span className="text-base font-extrabold text-[#0F172A] font-mono block leading-none">{formatCurrency(summary.total_invoiced)}</span>
          </div>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-250 transition-colors flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Collected</span>
            <span className="text-base font-extrabold text-emerald-650 font-mono block leading-none">{formatCurrency(summary.total_paid)}</span>
          </div>
        </div>

        {/* Card 3: Total Outstanding */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-250 transition-colors flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Outstanding Balance</span>
            <span className="text-base font-extrabold text-rose-600 font-mono block leading-none">{formatCurrency(summary.total_outstanding)}</span>
          </div>
        </div>

        {/* Card 4: Invoice Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-250 transition-colors flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#159DFC] shrink-0">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Invoices</span>
            <span className="text-base font-extrabold text-[#0F172A] font-mono block leading-none">{summary.count} files</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs print:hidden">
        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, client..."
            className="w-full h-9 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-350 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-slate-755"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Table */}
      {filteredInvoices.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px] h-10">
              <tr>
                <th className="px-4 py-3 border-b border-slate-150">Invoice No</th>
                <th className="px-4 py-3 border-b border-slate-150">Client / Customer</th>
                <th className="px-4 py-3 border-b border-slate-150">Event Specification</th>
                <th className="px-4 py-3 border-b border-slate-150">Invoice Date</th>
                <th className="px-4 py-3 border-b border-slate-150 text-right">Total Amount</th>
                <th className="px-4 py-3 border-b border-slate-150 text-right">Outstanding</th>
                <th className="px-4 py-3 border-b border-slate-150 text-center">Status</th>
                <th className="px-4 py-3 border-b border-slate-150 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors h-12">
                  {/* Invoice No */}
                  <td className="px-4 py-3 font-bold text-slate-800 font-mono">
                    #{inv.invoice_number}
                  </td>
                  {/* Client */}
                  <td className="px-4 py-3 text-slate-850 font-bold">
                    {inv.customer_name || 'Guest Payer'}
                  </td>
                  {/* Event */}
                  <td className="px-4 py-3">
                    <span className="block text-slate-800 font-bold">{inv.event_name || 'Event Booking'}</span>
                    <span className="block text-[9.5px] text-slate-400 font-semibold font-mono mt-0.5">{formatDate(inv.event_date)}</span>
                  </td>
                  {/* Invoice Date */}
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {formatDate(inv.invoice_date)}
                  </td>
                  {/* Total */}
                  <td className="px-4 py-3 text-right font-bold font-mono text-slate-850">
                    {formatCurrency(inv.total_amount)}
                  </td>
                  {/* Outstanding */}
                  <td className={`px-4 py-3 text-right font-mono font-bold ${inv.balance_due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {formatCurrency(inv.balance_due)}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[9px] font-bold capitalize tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : inv.status === 'partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-250'
                          : 'bg-rose-50 text-rose-700 border-rose-250'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handlePrintInvoice(inv.id)}
                        title="Print/Download PDF"
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all cursor-pointer shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        href={`/dashboard/bookings/${obfuscateId(inv.booking_id)}`}
                        title="Go to Booking details"
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      {isAllowedToDelete && (
                        <button
                          onClick={() => setInvoiceToDelete(inv)}
                          title="Delete Invoice"
                          className="h-7 w-7 inline-flex items-center justify-center text-rose-500 hover:text-rose-700 border border-rose-100 hover:border-rose-350 bg-rose-50/50 rounded-md transition-all cursor-pointer shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-slate-200 bg-white rounded-xl py-16 px-6 text-center space-y-3.5 shadow-sm flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">No invoices matched your filters</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              We couldn't find any recorded billing invoices matching your search criteria or status.
            </p>
          </div>
        </div>
      )}

      {/* Draft New Invoice Modal */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsDraftModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-premium border border-slate-200 p-6 space-y-4 z-10 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Draft New Invoice
              </h3>
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">
                  Select Booking Reservation
                </label>
                {isBookingsLoading ? (
                  <div className="h-9 w-full bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0 mr-1.5" />
                    Loading bookings list...
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-slate-450 border border-amber-100 bg-amber-50/20 p-3 rounded-lg text-xs leading-relaxed">
                    No active booking records found to draft invoices. Go to Bookings screen to add a reservation first.
                  </div>
                ) : (
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold"
                  >
                    <option value="">-- Choose Booking --</option>
                    {bookings
                      .filter((b) => b.status !== 'cancelled')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingNumber} - {b.customerName} ({b.eventType} - {formatDate(b.eventDate)})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createInvoiceMutation.isPending || !selectedBookingId}
                  className="flex items-center justify-center gap-1.5 py-2 px-4.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {createInvoiceMutation.isPending && <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" />}
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setInvoiceToDelete(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-premium border border-slate-200 p-6 space-y-4 z-10 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-rose-600 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5" />
                Delete Invoice
              </h3>
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-600 leading-relaxed">
              <p>
                Are you sure you want to permanently delete invoice <strong className="text-slate-800 font-mono">#{invoiceToDelete.invoice_number}</strong>?
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                This action is irreversible and will remove all billing calculations associated with this invoice registry. The actual booking reservation itself will not be deleted.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteInvoiceMutation.mutateAsync(invoiceToDelete.id);
                    setInvoiceToDelete(null);
                    refetchInvoices();
                  } catch (err) {
                    console.error('Delete invoice failed:', err);
                  }
                }}
                disabled={deleteInvoiceMutation.isPending}
                className="flex items-center justify-center gap-1.5 py-2 px-4.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteInvoiceMutation.isPending && <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
