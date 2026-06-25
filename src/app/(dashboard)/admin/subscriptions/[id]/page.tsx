'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAdminSubscriptions,
  useAdminHalls,
  useAdminHallSubscriptionPayments,
  useAdminRecordManualPayment,
  useAdminPackages
} from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Plus,
  X,
  Landmark,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { deobfuscateId } from '@/utils/obfuscate';
import { toast } from 'sonner';

export default function AdminSubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = deobfuscateId(params.id as string);

  const { subscriptions = [], isLoading: subLoading } = useAdminSubscriptions();
  const { halls = [] } = useAdminHalls();
  const { packages = [], isLoading: pkgLoading } = useAdminPackages();

  const activeSub = subscriptions.find((s) => s.id === id);
  const hall = halls.find((h) => h?.id === activeSub?.hallId);

  // Fetch real subscription payments for this hall
  const { data: payments = [], isLoading: paymentsLoading } = useAdminHallSubscriptionPayments(
    activeSub?.hallId || ''
  );

  // Manual payment mutation
  const recordManualPayment = useAdminRecordManualPayment(activeSub?.hallId || '');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionRefNo, setTransactionRefNo] = useState('');
  const [notes, setNotes] = useState('');

  // Update amount automatically when package changes
  useEffect(() => {
    if (selectedPackageId && packages.length > 0) {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (pkg) {
        // Preset with recurring price
        setAmount(pkg.price);
      }
    }
  }, [selectedPackageId, packages]);

  if (subLoading || paymentsLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Timeline Ledger...</p>
      </div>
    );
  }

  if (!activeSub) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-lg mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Contract Record Not Found</h3>
        <p className="text-xs text-gray-450 mt-1">The requested subscription timeline does not exist or has expired.</p>
        <button
          onClick={() => router.push('/admin/subscriptions')}
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Subscriptions
        </button>
      </div>
    );
  }

  const subStyle = STATUS_STYLES.subscription[activeSub.status as 'active' | 'trial' | 'suspended' | 'expired'];

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId) {
      toast.error('Please select a package plan');
      return;
    }
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await recordManualPayment.mutateAsync({
        package_id: selectedPackageId,
        amount,
        payment_method: paymentMethod,
        transaction_ref_no: transactionRefNo.trim() || undefined,
        notes: notes.trim() || undefined
      });
      setIsModalOpen(false);
      // Reset form
      setSelectedPackageId('');
      setAmount(0);
      setPaymentMethod('bank_transfer');
      setTransactionRefNo('');
      setNotes('');
    } catch {
      // Handled by hook onError toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link href="/admin/subscriptions" className="hover:text-violet-600">Subscriptions</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 truncate">Contract ID: {activeSub.id.slice(0, 8)}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
                Billing Lifecycle
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-semibold">{activeSub.hallName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${subStyle.bg}`}>
                  {subStyle.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Manual Payment</span>
            </button>
            <button
              onClick={() => router.push('/admin/subscriptions')}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Ledger</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Subscription timeline changes */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Contract Timeline</h3>

          <div className="space-y-6 pl-4 relative border-l border-gray-100 ml-2 py-2">
            {/* Extended Nodes from Real Payments */}
            {payments
              .filter((pmt) => pmt.status === 'approved')
              .map((pmt, index) => (
                <div key={pmt.id || index} className="relative space-y-1">
                  <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-gray-900">
                      License Period Extended ({pmt.packages?.name || 'SaaS Plan'})
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {pmt.verified_at ? new Date(pmt.verified_at).toLocaleDateString('en-GB') : new Date(pmt.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Payment verified. Ref: <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-bold">{pmt.transaction_ref_no}</code>. 
                    Amount credited: ₹{pmt.amount.toLocaleString('en-IN')}.
                  </p>
                </div>
              ))}

            {/* Pending Payments timeline */}
            {payments
              .filter((pmt) => pmt.status === 'pending')
              .map((pmt, index) => (
                <div key={pmt.id || index} className="relative space-y-1">
                  <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-amber-700">Payment Pending Verification</span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(pmt.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Remittance submitted via {pmt.payment_method.toUpperCase()} (UTR: {pmt.transaction_ref_no}) is awaiting admin verification.
                  </p>
                </div>
              ))}

            {/* Initial Registration Node */}
            <div className="relative space-y-1">
              <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-white border-2 border-violet-600 flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-violet-600 rounded-full" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-gray-900">Venue Hosting Registered</span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {hall?.created_at ? new Date(hall.created_at).toLocaleDateString('en-GB') : new Date(activeSub.startDate).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Tenant registered from Infovex console. Setup plan initialized under the {activeSub.packageName} tier.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Invoices and Summary stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Billing Overview Summary */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Subscription Details</h4>
            <div className="space-y-3.5 text-xs font-semibold text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-450">Active Plan Tier:</span>
                <span className="text-gray-950 font-bold">{activeSub.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450">Contract Frequency:</span>
                <span className="text-gray-950 font-bold">Monthly Recurring</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450">Base Monthly Rate:</span>
                <span className="text-gray-950 font-bold">₹{activeSub.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">Issued Invoices</h4>
            {payments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                No invoices recorded for this hall. Click "Record Manual Payment" to create the first entry.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {payments.map((invoice, idx) => {
                  const isPaid = invoice.status === 'approved';
                  const isPending = invoice.status === 'pending';
                  const style = isPaid 
                    ? STATUS_STYLES.invoice.paid 
                    : isPending 
                      ? STATUS_STYLES.invoice.partial 
                      : STATUS_STYLES.invoice.unpaid;

                  const dateLabel = new Date(invoice.created_at).toLocaleDateString('en-GB');

                  return (
                    <div
                      key={invoice.id || idx}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-gray-950 block">{invoice.transaction_ref_no}</span>
                        <span className="text-[10px] text-gray-500 font-semibold">{dateLabel}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs text-gray-900 block">₹{invoice.amount.toLocaleString('en-IN')}</span>
                        <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold rounded border ${style.bg} mt-0.5`}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Manual Payment Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-violet-650">
                <Landmark className="h-4.5 w-4.5" />
                <h3 className="font-bold text-gray-950 text-sm">Record Subscription Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 p-0.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4 text-xs font-semibold text-gray-700">
              
              {/* Package Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Package Plan</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select plan...</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} (₹{pkg.price.toLocaleString('en-IN')}/mo)
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Due */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Collection Amount (INR)</label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 2299"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="bank_transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                  <option value="upi">UPI QR Scan (GPay/PhonePe)</option>
                  <option value="cash">Cash Collection</option>
                  <option value="offline">Other Offline Method</option>
                </select>
              </div>

              {/* UTR / Invoice Reference */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transaction Ref (UTR / Receipt No)</label>
                <input
                  type="text"
                  value={transactionRefNo}
                  onChange={(e) => setTransactionRefNo(e.target.value)}
                  placeholder="Leave empty for auto-generation"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Internal Billing Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Setup fee + 1st month license fee. Cheque received."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordManualPayment.isPending}
                  className="px-4 py-2 bg-violet-650 hover:bg-violet-755 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {recordManualPayment.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Issue Invoice</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
