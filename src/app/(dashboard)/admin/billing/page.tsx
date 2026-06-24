'use client';

import React, { useState } from 'react';
import { useAdminPendingPayments, useAdminVerifyPayment } from '@/hooks/useAdmin';
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBillingPage() {
  const { data: pendingPayments = [], isLoading, isError } = useAdminPendingPayments();
  const verifyPaymentMutation = useAdminVerifyPayment();

  // State for rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy UTR utility
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('UTR copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to approve this subscription payment? This will update the venue subscription period immediately.')) {
      return;
    }

    try {
      await verifyPaymentMutation.mutateAsync({
        id: paymentId,
        data: { action: 'approve' }
      });
    } catch {
      // Error handled in hook toast
    }
  };

  const handleOpenRejectModal = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId) return;

    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      await verifyPaymentMutation.mutateAsync({
        id: selectedPaymentId,
        data: {
          action: 'reject',
          rejection_reason: rejectionReason.trim()
        }
      });
      setIsRejectModalOpen(false);
      setSelectedPaymentId(null);
    } catch {
      // Error handled in hook toast
    }
  };

  // KPIs Calculations
  const pendingCount = pendingPayments.length;
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#062089]" />
        <span className="text-xs font-semibold text-slate-500">Loading pending billing queue...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center max-w-md mx-auto my-12">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Queue Error</h3>
        <p className="text-xs text-gray-450 mt-1">Failed to fetch pending subscription payments. Ensure the backend is reachable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 font-sans">SaaS Billing Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Audit and verify manual UPI QR scans and bank transfer UTR logs against bank statement credits.</p>
      </div>

      {/* KPIs Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Approvals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-xl font-black text-slate-800 font-mono block mt-0.5">{pendingCount} requests</span>
          </div>
        </div>

        {/* Total Value Pending */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-[#062089] shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unverified Remittance</span>
            <span className="text-xl font-black text-slate-800 font-mono block mt-0.5">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPendingAmount)}
            </span>
          </div>
        </div>

        {/* Active Accounts Context */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status Environment</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2.5 py-0.5 inline-block mt-1 uppercase tracking-wide">
              Online & Guarded
            </span>
          </div>
        </div>

      </div>

      {/* Main Billing Queue */}
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Receipt className="h-5 w-5 text-slate-550" />
          <div>
            <h3 className="font-bold text-gray-950 text-sm">UTR Remittance Queue</h3>
            <p className="text-[10px] text-gray-450 font-semibold">Verify the 12-digit UTR numbers in your business bank statement before approving.</p>
          </div>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            All billing requests verified! No pending payments in the approvals queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-105 text-slate-450 uppercase text-[9px] font-black tracking-wider">
                  <th className="py-2.5">Venue Hall & Owner</th>
                  <th className="py-2.5">Target Plan</th>
                  <th className="py-2.5">12-Digit UTR Reference</th>
                  <th className="py-2.5">Submit Date</th>
                  <th className="py-2.5 text-right">Amount Due</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 font-semibold text-slate-705">
                {pendingPayments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/50">
                    <td className="py-4">
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-905 block text-xs">{pmt.marriage_halls?.hall_name || 'Unknown Hall'}</span>
                        <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" /> {pmt.marriage_halls?.owner_name || 'Owner'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-805 font-bold">
                      {pmt.packages?.name || 'SaaS Plan'}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-slate-800 font-extrabold">
                          {pmt.transaction_ref_no}
                        </span>
                        <button
                          onClick={() => copyToClipboard(pmt.transaction_ref_no, pmt.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedId === pmt.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">
                      {new Date(pmt.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-4 text-right font-mono text-slate-905 font-black text-sm">
                      ₹{pmt.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4">
                      <span className="uppercase text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-2 py-0.5">
                        {pmt.payment_method}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(pmt.id)}
                          disabled={verifyPaymentMutation.isPending}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm shadow-emerald-100 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(pmt.id)}
                          disabled={verifyPaymentMutation.isPending}
                          className="h-8 px-3 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-650" />
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm leading-tight">Reject Payment Submission</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Notification will log to venue dashboard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-colors"
              >
                <XCircle className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Reason for Rejection</label>
                <textarea
                  rows={4}
                  maxLength={250}
                  placeholder="e.g. Transaction reference (UTR) not matching bank credits statement. Please review amount or reference number."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="px-3 py-2 w-full text-xs font-medium border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-rose-500 leading-relaxed text-slate-800 placeholder-slate-400"
                  required
                />
              </div>

              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 flex gap-2.5 text-rose-800">
                <MessageSquare className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[9.5px] leading-normal font-semibold">
                  Rejecting this remittance will immediately mark the status as 'Rejected' on the Owner's billing history. 
                  They will be prompted to re-enter their payment transaction details.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="h-9 px-4 border border-slate-250 hover:bg-white text-slate-605 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyPaymentMutation.isPending}
                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-100 disabled:opacity-50"
              >
                {verifyPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Reject Submission</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
