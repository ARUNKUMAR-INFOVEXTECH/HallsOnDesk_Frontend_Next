'use client';

import React, { useState } from 'react';
import { useAdminHalls, useAdminPackages } from '@/hooks/useAdmin';
import { Building2, Phone, Mail, MapPin, Lock, User, Key, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterHallPage() {
  const router = useRouter();
  const { createHall, isCreating } = useAdminHalls();
  const { packages = [], isLoading: packagesLoading } = useAdminPackages();

  const [formData, setFormData] = useState({
    hall_name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    city: '',
    address: '',
    package_id: '',
    password: '',
    confirm_password: '',
    // Setup fee fields
    setup_fee_amount: '',
    amount_paid: '',
    setup_fee_status: 'unpaid' as 'unpaid' | 'partially_paid' | 'paid',
    payment_method: 'none' as 'upi' | 'bank_transfer' | 'cash' | 'offline' | 'none',
    transaction_ref_no: '',
    notes: '',
  });

  // Automatically select default package and prefill setup fee
  React.useEffect(() => {
    if (packages.length > 0 && !formData.package_id) {
      const defaultPkg = packages[0];
      setFormData((prev) => ({
        ...prev,
        package_id: defaultPkg.id,
        setup_fee_amount: defaultPkg.setup_fee ? defaultPkg.setup_fee.toString() : '0',
        setup_fee_status: (defaultPkg.setup_fee && defaultPkg.setup_fee > 0) ? 'unpaid' : 'paid',
      }));
    }
  }, [packages, formData.package_id]);

  const handlePackageSelect = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    setFormData((prev) => ({
      ...prev,
      package_id: pkgId,
      setup_fee_amount: pkg?.setup_fee ? pkg.setup_fee.toString() : '0',
      setup_fee_status: (pkg?.setup_fee && pkg.setup_fee > 0) ? prev.setup_fee_status : 'paid',
      amount_paid: (pkg?.setup_fee && pkg.setup_fee > 0) ? prev.amount_paid : '0',
    }));
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.hall_name.trim()) errors.hall_name = 'Hall name is required';
    if (!formData.owner_name.trim()) errors.owner_name = 'Owner name is required';

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.owner_email) {
      errors.owner_email = 'Email address is required';
    } else if (!emailRegex.test(formData.owner_email)) {
      errors.owner_email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.package_id) errors.package_id = 'Please select a package';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set default package if not selected
    if (!formData.package_id && packages.length > 0) {
      formData.package_id = packages[0].id;
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors in the form.');
      return;
    }

    try {
      const payload = {
        hall_name: formData.hall_name,
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        package_id: formData.package_id,
        password: formData.password,
        // Setup fee fields
        setup_fee_amount: formData.setup_fee_amount ? parseFloat(formData.setup_fee_amount) : undefined,
        amount_paid: formData.setup_fee_status === 'unpaid' ? 0 : (formData.amount_paid ? parseFloat(formData.amount_paid) : 0),
        setup_fee_status: formData.setup_fee_status,
        payment_method: formData.setup_fee_status === 'unpaid' ? 'none' : formData.payment_method,
        transaction_ref_no: formData.setup_fee_status === 'unpaid' ? '' : formData.transaction_ref_no,
        notes: formData.notes,
      };

      await createHall(payload);
      router.push('/admin/halls');
    } catch {
      // Error is already handled by useAdminHalls hook/toast
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // Auto-handling setup fee fields based on status change
      if (name === 'setup_fee_status') {
        if (value === 'paid') {
          next.amount_paid = prev.setup_fee_amount;
        } else if (value === 'unpaid') {
          next.amount_paid = '0';
          next.payment_method = 'none';
          next.transaction_ref_no = '';
        } else if (value === 'partially_paid') {
          next.amount_paid = '';
        }
      }
      
      return next;
    });

    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const setupFeeAmt = parseFloat(formData.setup_fee_amount) || 0;
  const amtPaid = formData.setup_fee_status === 'unpaid' ? 0 : (parseFloat(formData.amount_paid) || 0);
  const pendingSetupFee = Math.max(0, setupFeeAmt - amtPaid);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/halls"
          className="p-2 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Register New Venue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details to deploy a new HallFlow instance for a partner venue.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {/* Progress header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-200">System Integration</span>
              <h3 className="text-base font-bold">Venue Information Profile</h3>
            </div>
          </div>
          <span className="text-xs bg-white/20 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Step 1 of 1</span>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Venue Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-gray-50 pb-2">1. Venue Space Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hall / Venue Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="hall_name"
                    required
                    placeholder="e.g. Infovex Tech Mahal"
                    value={formData.hall_name}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.hall_name ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.hall_name && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.hall_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">District / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Chennai"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.city ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.city && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.city}</p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Physical Address</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="Enter physical street location, landmark, pincode..."
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`px-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                    validationErrors.address ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                  }`}
                />
                {validationErrors.address && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Owner / Credentials */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-gray-50 pb-2">2. Owner profile & Admin Account</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Owner Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="owner_name"
                    required
                    placeholder="e.g. Rajesh Nair"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.owner_name ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.owner_name && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.owner_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number (10 Digits)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 9840123456"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.phone ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.phone}</p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Owner Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="owner_email"
                    required
                    placeholder="owner@infovexmahal.com"
                    value={formData.owner_email}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.owner_email ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.owner_email && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.owner_email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.password ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="Repeat default password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      validationErrors.confirm_password ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                    }`}
                  />
                </div>
                {validationErrors.confirm_password && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Billing Package */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-gray-50 pb-2">3. Subscription billing configuration</h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Billing Plan Tier</label>
              {packagesLoading ? (
                <div className="flex items-center gap-2 p-3 text-xs bg-gray-50 border border-gray-150 text-gray-400 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  <span>Loading available package plans...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = formData.package_id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageSelect(pkg.id)}
                        className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-sm ${
                          isSelected
                            ? 'border-violet-600 bg-violet-50/30 ring-1 ring-violet-600 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{pkg.name}</span>
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-violet-600 bg-violet-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div className="mt-2.5 flex items-baseline">
                            <span className="text-lg font-extrabold text-gray-900">₹{pkg.price.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                              /{pkg.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                            <span>Max Bookings</span>
                            <span className="text-gray-700">{pkg.max_bookings || 'Unlimited'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                            <span>Max Users</span>
                            <span className="text-gray-700">{pkg.max_users || 'Unlimited'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Onboarding Setup Fee Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider border-b border-gray-50 pb-2">4. Onboarding Setup Fee Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Setup Fee Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Setup Fee Amount (INR)</label>
                <input
                  type="number"
                  name="setup_fee_amount"
                  min="0"
                  value={formData.setup_fee_amount}
                  onChange={handleInputChange}
                  placeholder="e.g. 4999"
                  className="px-3.5 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800"
                />
              </div>

              {/* Setup Fee Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Status</label>
                <select
                  name="setup_fee_status"
                  value={formData.setup_fee_status}
                  onChange={handleInputChange}
                  className="px-3.5 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 cursor-pointer"
                >
                  <option value="unpaid">Unpaid / Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Fully Paid</option>
                </select>
              </div>

              {/* Amount Paid */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount Paid (INR)</label>
                <input
                  type="number"
                  name="amount_paid"
                  min="0"
                  disabled={formData.setup_fee_status === 'unpaid'}
                  value={formData.setup_fee_status === 'unpaid' ? '0' : formData.amount_paid}
                  onChange={handleInputChange}
                  placeholder="e.g. 2000"
                  className="px-3.5 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold"
                />
              </div>

              {/* Payment Method - Show only if not unpaid */}
              {formData.setup_fee_status !== 'unpaid' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Channel</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      className="px-3.5 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 cursor-pointer font-bold"
                    >
                      <option value="none">-- Select Payment Channel --</option>
                      <option value="upi">UPI / QR Code Scan</option>
                      <option value="bank_transfer">Net Banking / NEFT</option>
                      <option value="cash">Cash Payment</option>
                      <option value="offline">Other Offline Mode</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction Ref No / UTR</label>
                    <input
                      type="text"
                      name="transaction_ref_no"
                      value={formData.transaction_ref_no}
                      onChange={handleInputChange}
                      placeholder="e.g. 12-digit UTR reference"
                      className="px-3.5 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 font-mono font-bold"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="col-span-1 md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Internal Setup Payment Remarks</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Record any comments, discounts, or installment details..."
                  className="px-4 py-2.5 w-full text-xs font-semibold bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800"
                />
              </div>

              {/* Dynamic Pending Balance Display */}
              <div className="col-span-1 md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between mt-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reconciliation Summary</span>
                  <span className="text-xs font-bold text-slate-700 block">
                    Setup Fee: <span className="font-mono text-slate-900">₹{setupFeeAmt.toLocaleString('en-IN')}</span> 
                    {formData.setup_fee_status !== 'unpaid' && (
                      <> | Paid: <span className="font-mono text-emerald-600">₹{amtPaid.toLocaleString('en-IN')}</span></>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pending Setup Fee</span>
                  <span className={`text-sm font-black font-mono block ${pendingSetupFee > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    ₹{pendingSetupFee.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3.5">
          <Link
            href="/admin/halls"
            className="px-4 py-2.5 text-xs font-semibold border border-gray-250 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isCreating || packagesLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#062089] hover:bg-[#062089]/95 rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-violet-400 disabled:cursor-not-allowed font-bold"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Instance...</span>
              </>
            ) : (
              <span>Deploy Venue Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
