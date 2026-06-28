'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActiveSubscription, useAllPackages, useSubmitSubscriptionPayment } from '@/hooks/useSettings';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');

  const { data: subscription } = useActiveSubscription();
  const { data: packages = [], isLoading: pkgLoading } = useAllPackages();
  const submitPaymentMutation = useSubmitSubscriptionPayment();

  // Selected payment method state
  const qrEnabled = subscription?.subscription_qr_enabled !== false;
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer'>('bank_transfer');

  // Sync default selection based on settings once loaded
  useEffect(() => {
    if (subscription) {
      setPaymentMethod(subscription.subscription_qr_enabled !== false ? 'upi' : 'bank_transfer');
    }
  }, [subscription]);

  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  if (pkgLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#062089]" />
        <span className="text-xs font-semibold text-slate-500">Loading invoice details...</span>
      </div>
    );
  }

  if (subscription && subscription.subscription_qr_enabled === false) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-md mx-auto my-12 shadow-sm space-y-4 select-none">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm mt-3">Payments Suspended</h3>
        <p className="text-xs text-slate-450 mt-1 leading-relaxed">
          SaaS subscription payments and renewals are currently disabled by the platform administrator. 
          Please contact our billing support team at <strong className="text-[#062089]">billing@infovex.com</strong> to process your renewal manually.
        </p>
        <button
          onClick={() => router.push('/settings/subscription')}
          className="mt-2 px-4 py-2 bg-indigo-650 text-white text-xs font-bold rounded-lg hover:bg-indigo-750 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  // Find the requested package
  const selectedPkg = packages.find(p => p.id === packageId) || (subscription ? subscription.packages : null);

  if (!selectedPkg) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center max-w-md mx-auto my-12">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Invalid checkout session</h3>
        <p className="text-xs text-gray-450 mt-1">We couldn't identify the plan you are trying to subscribe to. Please go back and select a package.</p>
        <button
          onClick={() => router.push('/settings/subscription')}
          className="mt-4 px-4 py-2 bg-indigo-650 text-white text-xs font-bold rounded-lg hover:bg-indigo-750 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  // Cost calculations
  const setupFee = selectedPkg.setup_fee || 0;
  const basePrice = selectedPkg.price;
  const subtotal = basePrice + setupFee;
  const cgst = subtotal * 0.09; // 9% CGST
  const sgst = subtotal * 0.09; // 9% SGST
  const totalAmount = subtotal + cgst + sgst;

  // Format currencies
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Generate UPI pay URI
  const upiId = subscription?.subscription_qr_upi_id || 'billing@infovex.com';
  const upiString = `upi://pay?pa=${upiId}&pn=Infovex%20Technologies&am=${totalAmount.toFixed(2)}&tn=INF-${selectedPkg.name.toUpperCase().replace(/\s+/g, '-')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

  // Handle UTR submission
  const handleSubmitUTR = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // UTR validation: exactly 12 numeric digits
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(utrNumber)) {
      setValidationError('Please enter a valid 12-digit numeric UTR reference number.');
      return;
    }

    try {
      await submitPaymentMutation.mutateAsync({
        package_id: selectedPkg.id,
        amount: totalAmount,
        payment_method: paymentMethod,
        transaction_ref_no: utrNumber,
        notes: notes.trim()
      });
      // Redirect on success
      router.push('/settings/subscription');
    } catch {
      // Errors handled by React Query toast
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 select-none">
      
      {/* Back to plans link */}
      <button
        onClick={() => router.push('/settings/subscription')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-extrabold cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Subscription Settings</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Checkout & Submission (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Checkout Remittance</h2>
            <p className="text-xs text-slate-450 font-semibold leading-relaxed">
              remit the invoice total through UPI or direct bank transfer, then input your bank's 12-digit UTR reference number below.
            </p>
          </div>

          {/* Payment Method Selector */}
          {qrEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'upi'
                    ? 'border-[#062089] bg-indigo-50/20 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-slate-800 block">Scan & Pay (UPI)</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">GPay, PhonePe, Paytm</span>
                </div>
                <QrCode className={`h-6 w-6 ${paymentMethod === 'upi' ? 'text-[#062089]' : 'text-slate-400'}`} />
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 border rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#062089] bg-indigo-50/20 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-slate-800 block">Bank Remittance</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">NEFT / IMPS Transfer</span>
                </div>
                <Building className={`h-6 w-6 ${paymentMethod === 'bank_transfer' ? 'text-[#062089]' : 'text-slate-400'}`} />
              </button>
            </div>
          )}

          {/* Payment Method Details */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            {paymentMethod === 'upi' && qrEnabled ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <div className="bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-[160px] h-[160px]" />
                </div>
                <div className="space-y-2.5 text-center sm:text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#062089] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Scan QR to Pay
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-850 pt-1">Infovex Technologies</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Open your standard UPI application (Google Pay, PhonePe, Paytm, or BHIM) and scan the QR code to auto-populate the exact amount.
                  </p>
                  <div className="text-[11px] font-semibold text-slate-800 bg-white/70 p-2 rounded-lg border border-slate-150 inline-block font-mono">
                    UPI: <span className="font-extrabold">{upiId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <Building className="h-4.5 w-4.5 text-[#062089]" />
                  <span className="text-xs font-bold text-slate-800">Infovex Corporate Settlement Account</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase">Bank Name</span>
                    <span className="text-slate-800">ICICI Bank Ltd</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase">Account Name</span>
                    <span className="text-slate-800">Infovex Technologies Private Limited</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase">Account Number</span>
                    <span className="text-slate-805 font-mono font-extrabold text-sm">50200067413809</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase">IFSC Code</span>
                    <span className="text-slate-850 font-mono font-extrabold text-sm">ICIC0000021</span>
                  </div>
                </div>
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 text-[10px] text-indigo-850 font-semibold leading-relaxed">
                  Make an IMPS or NEFT bank transfer for the exact invoice amount. Save the 12-digit transaction reference number generated by your bank.
                </div>
              </div>
            )}
          </div>

          {/* Form to submit UTR */}
          <form onSubmit={handleSubmitUTR} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                Bank Transaction Reference Number (12-Digit UTR)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value.replace(/\D/g, ''));
                    setValidationError('');
                  }}
                  placeholder="e.g. 214509874136"
                  className="px-3 py-2.5 w-full text-xs font-mono font-extrabold border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#062089] text-slate-800 placeholder-slate-400"
                  required
                />
                <CreditCard className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {validationError ? (
                <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> {validationError}
                </p>
              ) : (
                <p className="text-[10px] text-slate-450 leading-normal">
                  UTR is a unique 12-digit transaction reference generated by your bank. (Double-check to prevent verification delays).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                Additional Notes / Reference Name (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Remitted from SBI Account for Pro Plan setup"
                className="px-3 py-2 w-full text-xs font-semibold border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#062089] text-slate-800 placeholder-slate-450"
              />
            </div>

            <button
              type="submit"
              disabled={submitPaymentMutation.isPending}
              className="w-full h-11 bg-[#062089] hover:bg-[#002499] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-100 disabled:opacity-60"
            >
              {submitPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Submitting UTR Log...</span>
                </>
              ) : (
                <>
                  <span>Submit Remittance for Approval</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Invoice Details & Pricing Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-3xl p-6 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03] pointer-events-none" />
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="space-y-1 pb-4 border-b border-white/10">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Selected Plan</span>
            <h3 className="text-lg font-black tracking-tight">{selectedPkg.name}</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enterprise subscription for Marriage Halls and staff coordination workspaces.
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-3 pt-2 text-xs font-semibold text-slate-300">
            
            <div className="flex justify-between items-center">
              <span>Plan Base Price ({selectedPkg.billing_cycle})</span>
              <span className="font-mono text-white">{formatINR(basePrice)}</span>
            </div>

            {setupFee > 0 && (
              <div className="flex justify-between items-center text-indigo-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#159DFC]" /> One-Time Setup Fee
                </span>
                <span className="font-mono">{formatINR(setupFee)}</span>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <span>Subtotal</span>
              <span className="font-mono text-white">{formatINR(subtotal)}</span>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3 text-[11px] text-slate-400">
              <div className="flex justify-between items-center">
                <span>Central GST (CGST 9%)</span>
                <span className="font-mono">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>State GST (SGST 9%)</span>
                <span className="font-mono">{formatINR(sgst)}</span>
              </div>
            </div>

            {/* Total Billing */}
            <div className="flex justify-between items-center border-t border-white/10 pt-4 text-sm font-black text-white">
              <span>Total Billable Amount (INR)</span>
              <span className="font-mono text-[#159DFC] text-lg">{formatINR(totalAmount)}</span>
            </div>

          </div>

          {/* Features checkmarks */}
          <div className="space-y-3 pt-5 border-t border-white/10 text-[11px] font-bold text-slate-400">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">Workspace inclusions</span>
            
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Unlimited staff workspace access up to {selectedPkg.max_users} accounts</span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>{selectedPkg.max_bookings ? `Full system booking limits capped at ${selectedPkg.max_bookings} events` : 'Unlimited system booking volume'}</span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Tax configuration & SGST/CGST invoice automation ready</span>
            </div>
          </div>

          {/* Guarantee stamp */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-3 text-slate-400 leading-normal text-[10px]">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Your payment credentials and verification log are audited. Accounts verification is completed by certified Infovex billing operators.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
