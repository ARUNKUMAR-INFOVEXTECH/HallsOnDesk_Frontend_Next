'use client';

import React, { useState } from 'react';
import { useAdminSetupFeePayments, useAdminUpdateSetupFee } from '@/hooks/useAdmin';
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit2,
  Search,
  Filter,
  DollarSign,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface UpdateFormData {
  amountPaid: number;
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'offline';
  transactionRefNo: string;
  notes: string;
}

export default function AdminPaymentsPage() {
  const { data: payments = [], isLoading, isError } = useAdminSetupFeePayments();
  const updateSetupFeeMutation = useAdminUpdateSetupFee();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [formData, setFormData] = useState<UpdateFormData>({
    amountPaid: 0,
    paymentMethod: 'upi',
    transactionRefNo: '',
    notes: ''
  });

  const handleOpenModal = (payment: any) => {
    setSelectedPayment(payment);
    const balance = Math.max(0, payment.setup_fee_amount - payment.amount_paid);
    setFormData({
      amountPaid: balance,
      paymentMethod: 'upi',
      transactionRefNo: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountPaid' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const remaining = selectedPayment.setup_fee_amount - selectedPayment.amount_paid;
    if (formData.amountPaid <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (formData.amountPaid > remaining) {
      if (!window.confirm(`The amount entered (₹${formData.amountPaid}) is greater than the outstanding balance (₹${remaining}). Do you want to record the payment anyway?`)) {
        return;
      }
    }

    const cumulativePaid = selectedPayment.amount_paid + formData.amountPaid;
    const defaultNotes = `Recorded payment installment of ${formatCurrency(formData.amountPaid)}. Total paid: ${formatCurrency(cumulativePaid)}.`;
    const finalNotes = formData.notes.trim() ? `${formData.notes.trim()} (${defaultNotes})` : defaultNotes;

    try {
      await updateSetupFeeMutation.mutateAsync({
        id: selectedPayment.id,
        data: {
          amount_paid: cumulativePaid,
          payment_method: formData.paymentMethod,
          transaction_ref_no: formData.transactionRefNo.trim() || undefined,
          notes: finalNotes
        }
      });
      handleCloseModal();
    } catch {
      // Error handled in hook toast
    }
  };

  // KPI Calculations
  const totalBilled = payments.reduce((sum, p) => sum + (p.setup_fee_amount || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  // Filtering Logic
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.marriage_halls?.hall_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.packages?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#062089]" />
        <span className="text-xs font-semibold text-slate-500">Loading setup fee ledger...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center max-w-md mx-auto my-12">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Ledger Error</h3>
        <p className="text-xs text-gray-450 mt-1">Failed to retrieve setup fee payments ledger. Please ensure the database schema migrations are executed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="border-b border-gray-150 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 font-sans">Setup Fee Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Record, track, and reconcile onboarding setup fees for all registered venues.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Setup Billed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-[#062089] shrink-0">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Billed</span>
            <span className="text-xl font-black text-slate-800 font-mono block mt-0.5">
              {formatCurrency(totalBilled)}
            </span>
          </div>
        </div>

        {/* Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Collected</span>
            <span className="text-xl font-black text-emerald-800 font-mono block mt-0.5">
              {formatCurrency(totalCollected)}
            </span>
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Balance</span>
            <span className="text-xl font-black text-amber-800 font-mono block mt-0.5">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>

      </div>

      {/* Filters & Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search and Filters Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by venue name or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs w-full rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#062089] bg-white text-slate-800 font-medium"
            />
          </div>

          {/* Filter badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
            {(['all', 'unpaid', 'partially_paid', 'paid'] as const).map((filter) => {
              const label = filter === 'all' ? 'All Plans' : filter.replace('_', ' ');
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                    isActive
                      ? 'bg-[#062089] text-white border-[#062089] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="py-16 text-center">
              <Banknote className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Payments Found</h3>
              <p className="text-xs text-slate-400 mt-1">There are no records matching your query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Venue Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Plan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Setup Fee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Amount Paid</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Balance Due</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => {
                  const balance = Math.max(0, payment.setup_fee_amount - payment.amount_paid);
                  
                  let badgeColor = '';
                  let statusLabel = '';
                  
                  if (payment.status === 'paid') {
                    badgeColor = 'bg-green-50 text-green-700 border-green-200';
                    statusLabel = 'Fully Paid';
                  } else if (payment.status === 'partially_paid') {
                    badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                    statusLabel = 'Partially Paid';
                  } else {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    statusLabel = 'Unpaid';
                  }

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-xs text-slate-900 block">
                          {payment.marriage_halls?.hall_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-semibold">
                          {payment.packages?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                        {formatCurrency(payment.setup_fee_amount)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-600 font-semibold">
                        {formatCurrency(payment.amount_paid)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-800 font-semibold">
                        <span className={balance > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-medium">
                          {formatDate(payment.due_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${badgeColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenModal(payment)}
                          disabled={payment.status === 'paid'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            payment.status === 'paid'
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-[#062089] border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer'
                          }`}
                        >
                          <Edit2 className="h-3 w-3" />
                          Record Collection
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Record Collection Modal Dialog */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Record Setup Fee Payment</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {selectedPayment.marriage_halls?.hall_name}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                              {/* Outstanding Details */}
                <div className="grid grid-cols-3 gap-3 bg-[#062089]/5 border border-[#062089]/10 rounded-xl p-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Billed Fee</span>
                    <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block">
                      {formatCurrency(selectedPayment.setup_fee_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Previously Paid</span>
                    <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block text-emerald-600">
                      {formatCurrency(selectedPayment.amount_paid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Remaining</span>
                    <span className="text-xs font-black text-amber-600 font-mono mt-0.5 block">
                      {formatCurrency(Math.max(0, selectedPayment.setup_fee_amount - selectedPayment.amount_paid))}
                    </span>
                  </div>
                </div>

                {/* Amount Paid Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    New Installment Received (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      name="amountPaid"
                      value={formData.amountPaid || ''}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="any"
                      placeholder="Enter amount"
                      className="pl-7 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Payment Method Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Payment Channel
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  >
                    <option value="upi">UPI Scan / GPay / PhonePe</option>
                    <option value="bank_transfer">Net Banking / NEFT / IMPS</option>
                    <option value="cash">Direct Cash Handover</option>
                    <option value="offline">Other Offline Method</option>
                  </select>
                </div>

                {/* Transaction Ref Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Transaction Ref No / UTR (Optional)
                  </label>
                  <input
                    type="text"
                    name="transactionRefNo"
                    value={formData.transactionRefNo}
                    onChange={handleInputChange}
                    placeholder="e.g. 314567890123"
                    className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reconciliation Remarks (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter internal ledger note..."
                    className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white resize-none"
                  />
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSetupFeeMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#062089] hover:bg-[#062089]/90 border border-blue-900 shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateSetupFeeMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm Collection
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
