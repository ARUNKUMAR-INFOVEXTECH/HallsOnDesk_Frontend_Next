'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Edit3,
  Check,
  AlertCircle,
  FileText,
  Save,
  Briefcase
} from 'lucide-react';
import { useVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useVendors';
import { VendorProfileHeader } from '@/components/vendors/VendorProfileHeader';
import { VendorForm } from '@/components/vendors/VendorForm';
import { VendorActivityTimeline } from '@/components/vendors/VendorActivityTimeline';
import { StarRating } from '@/components/vendors/StarRating';
import { VendorStatusBadge } from '@/components/vendors/VendorStatusBadge';
import { CategoryBadge } from '@/components/vendors/CategoryBadge';
import { copyToClipboard } from '@/utils/clipboard';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';

type TabType = 'overview' | 'contact' | 'business' | 'notes' | 'activity';

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const searchParams = useSearchParams();

  const vendorId = params.id;

  // Tabs navigation state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);

  // Bank details reveal state
  const [revealAccount, setRevealAccount] = useState(false);

  // Notes edit state
  const [notesEditMode, setNotesEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Check URL triggers for edit view
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Queries & Mutations
  const { data: vendor, isLoading, isError, refetch } = useVendor(vendorId);
  const updateVendorMutation = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();

  // Populate local notes state on data load
  useEffect(() => {
    if (vendor) {
      setEditedNotes(vendor.notes || '');
    }
  }, [vendor]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse select-none">
        <div className="h-6 bg-slate-100 rounded w-24" />
        <div className="h-32 bg-slate-100 border border-slate-200 rounded-xl w-full" />
        <div className="h-10 bg-slate-100 border border-slate-200 rounded-lg w-full" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 h-80 bg-slate-100 border border-slate-200 rounded-xl" />
          <div className="md:col-span-2 h-80 bg-slate-100 border border-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mx-auto">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">Vendor Profile Not Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The requested vendor does not exist or has been deleted from the venue workspace database.
        </p>
        <button
          onClick={() => router.push('/dashboard/vendors')}
          className="bg-primary hover:bg-primary-hover text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Back to Vendors Directory
        </button>
      </div>
    );
  }

  // Action handlers
  const handleUpdateVendor = (formData: any) => {
    updateVendorMutation.mutate(
      { id: vendor.id, data: formData },
      {
        onSuccess: () => {
          setIsEditing(false);
          router.replace(`/dashboard/vendors/${vendor.id}`);
          refetch();
        },
      }
    );
  };

  const handleDeleteVendor = () => {
    if (confirm(`Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`)) {
      deleteVendorMutation.mutate(vendor.id, {
        onSuccess: () => {
          router.push('/dashboard/vendors');
        },
      });
    }
  };

  const handleUpdateStatus = (newStatus: 'active' | 'inactive' | 'blacklisted') => {
    updateVendorMutation.mutate(
      { id: vendor.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleSaveNotes = () => {
    setAutoSaveStatus('saving');
    updateVendorMutation.mutate(
      { id: vendor.id, data: { notes: editedNotes } },
      {
        onSuccess: () => {
          setAutoSaveStatus('saved');
          setNotesEditMode(false);
          refetch();
          setTimeout(() => setAutoSaveStatus('idle'), 1500);
        },
        onError: () => {
          setAutoSaveStatus('idle');
        },
      }
    );
  };

  const getMaskedAccount = (num?: string) => {
    if (!num) return 'Not provided';
    if (num.length <= 4) return num;
    return `XXXX XXXX ${num.slice(-4)}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // ----------------------------------------------------
      // 1. OVERVIEW TAB
      // ----------------------------------------------------
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start animate-in fade-in duration-200">
            {/* Left column (60%) */}
            <div className="md:col-span-3 space-y-6">
              
              {/* Vendor Info Card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  Vendor Profile Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                    <span className="mt-1"><CategoryBadge category={vendor.category} /></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                    <span className="mt-1"><VendorStatusBadge status={vendor.status} /></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Rating Quality</span>
                    <span className="mt-1"><StarRating value={vendor.rating} readonly size="sm" /></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">HQ City / Region</span>
                    <span className="mt-1 text-slate-800">{vendor.city}, {vendor.state}</span>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Vendor Tags</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {vendor.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-violet-50 text-violet-750 border border-violet-100 rounded px-2 py-0.5 text-[10px] font-bold font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                      {vendor.tags.length === 0 && (
                        <span className="text-slate-400 italic font-medium">No tags assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Partner Since</span>
                    <span className="mt-1 text-slate-850">{formatDate(vendor.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Quick stats analytics card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  Engagement Summaries
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex flex-col gap-0.5 border-r border-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Bookings Linked</span>
                    <span className="text-lg font-black text-slate-800 font-mono mt-1">
                      {vendor.totalEngagements} times
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">All-Time Payments</span>
                    <span className="text-lg font-black text-emerald-600 font-mono mt-1">
                      {formatCurrency(vendor.totalAmountPaid)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-r border-slate-50 border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Last Roster Booking</span>
                    <span className="text-slate-800 font-bold mt-1">
                      {vendor.lastEngagementDate ? formatDate(vendor.lastEngagementDate) : 'Never engaged'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Avg. Rate Per Engagement</span>
                    <span className="text-slate-800 font-black font-mono mt-1">
                      {vendor.totalEngagements > 0
                        ? formatCurrency(Math.round(vendor.totalAmountPaid / vendor.totalEngagements))
                        : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column (40%) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Performance breakdown card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  Service Quality Review
                </h3>
                
                <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                  <span className="text-3xl font-black text-slate-800 font-mono">
                    {vendor.rating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating value={vendor.rating} readonly size="md" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">
                      Overall Quality Rating
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-12 shrink-0">5 Stars</span>
                    <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '60%' }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] font-bold">60%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 shrink-0">4 Stars</span>
                    <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '30%' }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] font-bold">30%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 shrink-0">3 Stars</span>
                    <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '10%' }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] font-bold">10%</span>
                  </div>
                </div>
              </div>

              {/* Status update quick action cards */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider mb-1">
                  Ledger Quick Actions
                </h3>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="h-4 w-4 shrink-0" />
                  Edit Vendor Profile
                </button>

                {vendor.status !== 'active' && (
                  <button
                    onClick={() => handleUpdateStatus('active')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-250 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Activate Vendor Profile
                  </button>
                )}

                {vendor.status !== 'inactive' && (
                  <button
                    onClick={() => handleUpdateStatus('inactive')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark as Inactive
                  </button>
                )}

                {vendor.status !== 'blacklisted' && (
                  <button
                    onClick={() => handleUpdateStatus('blacklisted')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-rose-250 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Blacklist Vendor Partner
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // 2. CONTACT TAB
      // ----------------------------------------------------
      case 'contact':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start animate-in fade-in duration-200">
            {/* Left column */}
            <div className="md:col-span-3 space-y-6">
              
              {/* Primary Contact details */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  Contact Information
                </h3>
                
                <div className="space-y-4.5 text-xs font-semibold text-slate-605">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Primary Phone</span>
                      <span className="block text-slate-800 font-mono font-bold text-sm mt-0.5">
                        {vendor.phone}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(vendor.phone)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                      title="Click to copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Alternate Phone</span>
                      <span className="block text-slate-800 font-mono font-bold text-sm mt-0.5">
                        {vendor.alternatePhone || <span className="text-slate-350 italic">Not provided</span>}
                      </span>
                    </div>
                    {vendor.alternatePhone && (
                      <button
                        onClick={() => copyToClipboard(vendor.alternatePhone!)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                        title="Click to copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                      <span className="block text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                        {vendor.email ? (
                          <>
                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{vendor.email}</span>
                          </>
                        ) : (
                          <span className="text-slate-350 italic">Not provided</span>
                        )}
                      </span>
                    </div>
                    {vendor.email && (
                      <button
                        onClick={() => copyToClipboard(vendor.email!)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                        title="Click to copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Point of Contact card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  Contact Person Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                    <span className="mt-1 text-slate-850">
                      {vendor.contactPersonName || <span className="text-slate-350 italic">Not provided</span>}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Phone</span>
                    <span className="mt-1 text-slate-850 font-mono">
                      {vendor.contactPersonPhone || <span className="text-slate-350 italic">Not provided</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Location details card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                  HQ Location
                </h3>
                
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Full Address</span>
                    <span className="mt-1 text-slate-800 leading-relaxed">
                      {vendor.address || <span className="text-slate-350 italic">No address provided</span>}
                    </span>
                  </div>

                  {/* Map placeholder */}
                  <div className="border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center gap-2">
                    <MapPin className="h-6 w-6 text-slate-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-450 tracking-wide uppercase">
                      Map View Unavailable
                    </span>
                    <p className="text-[9px] text-slate-400 max-w-[180px] leading-relaxed">
                      Verify address details or open direct search coordinates.
                    </p>
                  </div>

                  {vendor.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${vendor.address}, ${vendor.city}, ${vendor.state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-450 shrink-0" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // 3. BUSINESS TAB
      // ----------------------------------------------------
      case 'business':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* GST & Registration info */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                GSTIN & Business status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold text-slate-705">
                <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      GST Number
                    </span>
                    <span className="block text-slate-800 font-mono font-bold text-sm mt-0.5">
                      {vendor.gstNumber || <span className="text-slate-350 italic font-medium">Not provided</span>}
                    </span>
                  </div>
                  {vendor.gstNumber && (
                    <button
                      onClick={() => copyToClipboard(vendor.gstNumber!)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Business Class
                    </span>
                    <span className={`block font-bold mt-0.5 ${vendor.gstNumber ? 'text-violet-650' : 'text-slate-500 font-medium'}`}>
                      {vendor.gstNumber ? 'Registered mandapam provider' : 'Unregistered service partner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank detail allocations */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                Roster Bank Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                
                {/* Bank Name */}
                <div className="flex flex-col gap-0.5 border-b border-slate-50 pb-2">
                  <span className="text-[9px] text-slate-450 font-bold uppercase">Bank Name</span>
                  <span className="mt-1 text-slate-850">
                    {vendor.bankName || <span className="text-slate-350 italic font-medium">Not provided</span>}
                  </span>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-455 font-bold uppercase">Account Number</span>
                    <span className="block text-slate-850 font-mono font-bold mt-1">
                      {revealAccount ? vendor.accountNumber || 'Not provided' : getMaskedAccount(vendor.accountNumber)}
                    </span>
                  </div>
                  {vendor.accountNumber && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setRevealAccount(!revealAccount)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
                        title={revealAccount ? 'Hide account' : 'Reveal account'}
                      >
                        {revealAccount ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(vendor.accountNumber!)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* IFSC Code */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 md:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-450 font-bold uppercase">IFSC Code</span>
                    <span className="block text-slate-805 font-mono font-bold mt-1">
                      {vendor.ifscCode || <span className="text-slate-350 italic font-medium">Not provided</span>}
                    </span>
                  </div>
                  {vendor.ifscCode && (
                    <button
                      onClick={() => copyToClipboard(vendor.ifscCode!)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-655 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* UPI ID */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-2 md:border-b-0 md:pb-0">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-450 font-bold uppercase">UPI ID</span>
                    <span className="block text-slate-800 font-mono font-bold mt-1">
                      {vendor.upiId || <span className="text-slate-350 italic font-medium">Not provided</span>}
                    </span>
                  </div>
                  {vendor.upiId && (
                    <button
                      onClick={() => copyToClipboard(vendor.upiId!)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-655 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // 4. NOTES TAB
      // ----------------------------------------------------
      case 'notes':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Notes edit/display card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-violet-650 shrink-0" />
                  <h3 className="text-sm font-extrabold text-slate-800">Internal Billing Notes</h3>
                </div>
                
                {/* Autosave feedback badge */}
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                      <svg className="animate-spin h-3 w-3 text-slate-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving notes...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      Changes saved
                    </span>
                  )}
                  {!notesEditMode && (
                    <button
                      onClick={() => setNotesEditMode(true)}
                      className="text-xs font-bold text-violet-650 hover:text-violet-755 hover:underline cursor-pointer"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>
              </div>

              {notesEditMode ? (
                <div className="space-y-3">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter internal terms, contracts, or vendor descriptions here..."
                  />
                  <div className="flex justify-end gap-2.5">
                    <button
                      onClick={() => {
                        setEditedNotes(vendor.notes || '');
                        setNotesEditMode(false);
                      }}
                      className="h-8 px-3 border border-slate-200 hover:bg-slate-50 text-slate-605 rounded-md text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="h-8 px-3.5 bg-violet-650 hover:bg-violet-755 text-white rounded-md text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5 shrink-0" />
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : vendor.notes ? (
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-lg text-xs font-medium text-slate-700 leading-relaxed font-sans max-w-2xl whitespace-pre-wrap">
                  {vendor.notes}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl bg-slate-50/30 p-8 flex flex-col items-center justify-center text-center gap-3">
                  <FileText className="h-6 w-6 text-slate-400 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-800">No notes written yet</span>
                  <p className="text-xs text-slate-450 max-w-[240px] leading-relaxed">
                    Write billing contracts, rates breakdowns, or setup notes for this service partner.
                  </p>
                  <button
                    onClick={() => setNotesEditMode(true)}
                    className="mt-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Add Custom Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      // ----------------------------------------------------
      // 5. ACTIVITY TIMELINE TAB
      // ----------------------------------------------------
      case 'activity':
        return <VendorActivityTimeline vendor={vendor} />;

      default:
        return null;
    }
  };

  // Switch dynamically between Profile Display vs Edit view
  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
        {/* Header link */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              setIsEditing(false);
              router.replace(`/dashboard/vendors/${vendor.id}`);
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-850 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span>Cancel and View Profile</span>
          </button>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-850 tracking-tight leading-none">
              Edit Vendor Details
            </h2>
            <p className="text-xs text-slate-450 font-semibold">
              Modify details for "{vendor.name}" to keep statistics and bank details up to date.
            </p>
          </div>
        </div>

        {/* Edit form wrapping */}
        <VendorForm
          onSubmit={handleUpdateVendor}
          defaultValues={{
            name: vendor.name,
            category: vendor.category,
            phone: vendor.phone,
            alternatePhone: vendor.alternatePhone,
            email: vendor.email,
            address: vendor.address,
            city: vendor.city,
            state: vendor.state,
            gstNumber: vendor.gstNumber,
            bankName: vendor.bankName,
            accountNumber: vendor.accountNumber,
            ifscCode: vendor.ifscCode,
            upiId: vendor.upiId,
            contactPersonName: vendor.contactPersonName,
            contactPersonPhone: vendor.contactPersonPhone,
            rating: vendor.rating,
            status: vendor.status,
            tags: vendor.tags,
            notes: vendor.notes,
          }}
          isSubmitting={updateVendorMutation.isPending}
          onCancel={() => {
            setIsEditing(false);
            router.replace(`/dashboard/vendors/${vendor.id}`);
          }}
          submitButtonText="Save Changes"
        />
      </div>
    );
  }

  const tabs: { value: TabType; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'contact', label: 'Contact Details' },
    { value: 'business', label: 'Business & Bank' },
    { value: 'notes', label: 'Notes' },
    { value: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-12">
      {/* Back to list Link */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-650">
        <button
          onClick={() => router.push('/dashboard/vendors')}
          className="p-1 rounded-md hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-700 cursor-pointer"
          title="Back to Directory"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <span className="text-slate-400">Back to Vendors Directory</span>
      </div>

      {/* Header Profile card */}
      <VendorProfileHeader
        vendor={vendor}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDeleteVendor}
        isDeleting={deleteVendorMutation.isPending}
      />

      {/* Navigation tabs row */}
      <div className="border-b border-slate-150 flex items-center gap-6 text-xs font-extrabold text-slate-450 overflow-x-auto pb-0.5 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap px-0.5 ${
                isActive
                  ? 'border-violet-600 text-violet-650'
                  : 'border-transparent hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic tab panels display */}
      <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
        {renderTabContent()}
      </div>

    </div>
  );
}
