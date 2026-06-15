'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  useVendors,
  useVendorAllocations,
  useAllocateVendor,
  useUpdateVendorAllocation,
} from '@/hooks/useVendors';
import { BookingVendor } from '@/types/vendor';
import { CalendarEventDrawer } from '../calendar/CalendarEventDrawer';
import {
  Search,
  ChevronDown,
  Check,
  Loader2,
  AlertTriangle,
  Calendar,
  IndianRupee,
  FileText,
  User,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface AllocateVendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingStartDate: string;
  bookingEndDate?: string;
  bookingNumber?: string;
  editingAllocation?: BookingVendor | null;
}

export function AllocateVendorDrawer({
  isOpen,
  onClose,
  bookingId,
  bookingStartDate,
  bookingEndDate,
  bookingNumber,
  editingAllocation = null,
}: AllocateVendorDrawerProps) {
  const isEditMode = !!editingAllocation;

  // Mutations
  const allocateMutation = useAllocateVendor(bookingId);
  const updateMutation = useUpdateVendorAllocation(bookingId);

  // Form states
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [allocatedCost, setAllocatedCost] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Dropdown states
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Load active vendors
  const { data: vendorsRes, isLoading: vendorsLoading } = useVendors({
    status: 'active',
    limit: 1000,
  });
  const vendorsList = vendorsRes?.data || [];

  // Find selected vendor details
  const selectedVendor = vendorsList.find((v) => v.id === selectedVendorId) || null;

  // Load selected vendor's other allocations for real-time conflict check
  const { data: vendorAllocations = [], isLoading: allocationsLoading } = useVendorAllocations(
    selectedVendorId
  );

  const [conflict, setConflict] = useState<string | null>(null);

  // Synchronize edit values or reset
  useEffect(() => {
    if (isOpen) {
      if (editingAllocation) {
        setSelectedVendorId(editingAllocation.vendorId);
        setAllocatedCost(editingAllocation.allocatedCost);
        setAmountPaid(editingAllocation.amountPaid);
        setNotes(editingAllocation.notes || '');
      } else {
        setSelectedVendorId('');
        setAllocatedCost(0);
        setAmountPaid(0);
        setNotes('');
      }
      setVendorSearchQuery('');
      setComboboxOpen(false);
    }
  }, [isOpen, editingAllocation]);

  // Real-time Date Conflict Check
  useEffect(() => {
    if (!selectedVendorId || !bookingStartDate || vendorAllocations.length === 0) {
      setConflict(null);
      return;
    }

    const newStart = new Date(bookingStartDate.split('T')[0]).getTime();
    const newEnd = new Date((bookingEndDate || bookingStartDate).split('T')[0]).getTime();

    for (const alloc of vendorAllocations) {
      // Skip current booking in conflict checks during Edit Mode
      if (alloc.bookingId === bookingId) continue;
      if (!alloc.bookings) continue;

      const existStart = new Date(alloc.bookings.start_date.split('T')[0]).getTime();
      const existEnd = new Date(
        (alloc.bookings.end_date || alloc.bookings.start_date).split('T')[0]
      ).getTime();

      // Check overlap
      if (newStart <= existEnd && newEnd >= existStart) {
        setConflict(
          `Vendor "${
            selectedVendor?.name || 'this vendor'
          }" is already allocated to event "${alloc.bookings.event_name}" (${
            alloc.bookings.booking_number
          }) on this date (${alloc.bookings.start_date.split('T')[0]}).`
        );
        return;
      }
    }
    setConflict(null);
  }, [
    selectedVendorId,
    vendorAllocations,
    bookingStartDate,
    bookingEndDate,
    bookingId,
    selectedVendor,
  ]);

  // Close combobox on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVendorSelect = (vendor: any) => {
    setSelectedVendorId(vendor.id);
    setComboboxOpen(false);
    setVendorSearchQuery('');
  };

  // Auto-calculated Payment Status
  let autoPaymentStatus = 'unpaid';
  if (amountPaid >= allocatedCost && allocatedCost > 0) {
    autoPaymentStatus = 'paid';
  } else if (amountPaid > 0) {
    autoPaymentStatus = 'partial';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendorId) return;

    if (isEditMode) {
      updateMutation.mutate(
        {
          vendorId: selectedVendorId,
          payload: {
            allocated_cost: allocatedCost,
            amount_paid: amountPaid,
            notes,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      allocateMutation.mutate(
        {
          vendor_id: selectedVendorId,
          service_type: selectedVendor?.category || 'other',
          allocated_cost: allocatedCost,
          amount_paid: amountPaid,
          notes,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const isSubmitting = allocateMutation.isPending || updateMutation.isPending;

  // Filter vendors by search term
  const filteredVendors = vendorsList.filter((v) => {
    const q = vendorSearchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.phone.includes(q)
    );
  });

  return (
    <CalendarEventDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Vendor Allocation' : 'Allocate Vendor'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-700">
        
        {/* Vendor Selector Dropdown (disabled in Edit mode) */}
        <div className="space-y-1.5 w-full" ref={comboboxRef}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Select Vendor Partner
          </label>

          <div className="relative">
            <button
              type="button"
              disabled={isEditMode || isSubmitting}
              onClick={() => setComboboxOpen(!comboboxOpen)}
              className={`w-full h-10 px-3 flex items-center justify-between text-sm bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                isEditMode ? 'bg-slate-50 cursor-not-allowed border-slate-200' : 'border-slate-200 hover:border-slate-350 shadow-sm'
              }`}
            >
              {selectedVendor ? (
                <span className="text-slate-800 font-bold">
                  {selectedVendor.name} ({selectedVendor.category.toUpperCase()})
                </span>
              ) : (
                <span className="text-slate-400 font-medium">Select vendor...</span>
              )}
              {!isEditMode && <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0 ml-2" />}
            </button>

            {comboboxOpen && !isEditMode && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-premium z-20 overflow-hidden animate-fadeIn">
                {/* Search bar */}
                <div className="relative p-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={vendorSearchQuery}
                    onChange={(e) => setVendorSearchQuery(e.target.value)}
                    placeholder="Search name or service type..."
                    className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                {/* Dropdown list */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 text-xs">
                  {vendorsLoading ? (
                    <div className="p-4 text-center text-slate-450 font-semibold flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-light" />
                      Loading vendors...
                    </div>
                  ) : filteredVendors.length > 0 ? (
                    filteredVendors.map((vendor) => {
                      const isSelected = vendor.id === selectedVendorId;
                      return (
                        <button
                          key={vendor.id}
                          type="button"
                          onClick={() => handleVendorSelect(vendor)}
                          className="w-full flex items-center justify-between text-left p-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 pr-2">
                            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center font-bold text-xs shrink-0 border border-primary-light/10">
                              <User className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 block leading-tight">
                                {vendor.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                                {vendor.category.toUpperCase()} • {vendor.phone}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {isSelected && <Check className="h-4 w-4 text-primary-light inline-block" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-450 font-semibold">No vendor matches found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time scheduling conflict warning */}
        {conflict && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-850 animate-slideDown shadow-sm">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block text-[11px] leading-tight">Double-Booking Collision Alert</span>
              <p className="text-[10px] leading-relaxed font-medium">
                {conflict}
              </p>
            </div>
          </div>
        )}

        {/* Selected Vendor Info */}
        {selectedVendor && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Vendor Profile Details
              </span>
              <span className="font-mono bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 border border-slate-100 uppercase">
                {selectedVendor.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 font-medium text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Contact Phone</span>
                <span className="text-slate-700 font-semibold">{selectedVendor.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">GST Number</span>
                <span className="text-slate-700 font-semibold">{selectedVendor.gstNumber || 'Not provided'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">UPI ID / Bank details</span>
                <span className="text-slate-700 font-semibold truncate block">
                  {selectedVendor.upiId || (selectedVendor.bankName ? `${selectedVendor.bankName} - ${selectedVendor.accountNumber}` : 'Not provided')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cost and Payment Fields */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Allocated Cost */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="allocatedCost" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Allocated Cost (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 font-bold">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                id="allocatedCost"
                type="number"
                min={0}
                required
                disabled={isSubmitting}
                value={allocatedCost || ''}
                onChange={(e) => setAllocatedCost(Number(e.target.value))}
                placeholder="e.g. 25000"
                className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all hover:border-slate-350 focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>

          {/* Amount Paid */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="amountPaid" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount Paid (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 font-bold">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                id="amountPaid"
                type="number"
                min={0}
                max={allocatedCost}
                disabled={isSubmitting}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="e.g. 10000"
                className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all hover:border-slate-350 focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>

        </div>

        {/* Calculated Status Badge Preview */}
        {allocatedCost > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Info className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Projected Payment Status</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                autoPaymentStatus === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : autoPaymentStatus === 'partial'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {autoPaymentStatus === 'paid'
                ? 'Full Paid'
                : autoPaymentStatus === 'partial'
                ? 'Partially Paid'
                : 'Unpaid'}
            </span>
          </div>
        )}

        {/* Allocation Notes */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Allocation Notes
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 flex items-start text-slate-400 pointer-events-none">
              <FileText className="h-4 w-4" />
            </span>
            <textarea
              id="notes"
              rows={3}
              disabled={isSubmitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail specifics, food menu preferences, decor theme deliverables, delivery timings..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-350 focus:ring-2 focus:ring-primary-light transition-all"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100 bg-white shrink-0 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-350 rounded-lg text-xs font-bold text-slate-650 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedVendorId}
            className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Saving...
              </>
            ) : isEditMode ? (
              'Update Allocation'
            ) : (
              'Save Allocation'
            )}
          </button>
        </div>

      </form>
    </CalendarEventDrawer>
  );
}
