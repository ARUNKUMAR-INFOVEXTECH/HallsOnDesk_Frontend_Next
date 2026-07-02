'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Loader2, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Calendar,
  IndianRupee
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from 'sonner';

interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string; // Optional: Pre-fill and lock if opened from Booking Details
}

export function InvoiceBuilderModal({ isOpen, onClose, bookingId }: InvoiceBuilderModalProps) {
  const { data: bookings = [], isLoading: isBookingsLoading } = useBookings();
  const createInvoiceMutation = useCreateInvoice();

  // Selected booking ID state
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  
  // Form states
  const [dueDate, setDueDate] = useState<string>('');
  const [lineItems, setLineItems] = useState<InvoiceLineItemInput[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(18);

  // Set booking context from props if available
  useEffect(() => {
    if (bookingId) {
      setSelectedBookingId(bookingId);
    }
  }, [bookingId, isOpen]);

  // Prepopulate form when selected booking changes
  useEffect(() => {
    if (!selectedBookingId || bookings.length === 0) return;

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (booking) {
      // 1. Default line item based on booking price
      setLineItems([
        { 
          description: `${booking.eventType} Venue Booking Charges`, 
          quantity: 1, 
          unit_price: booking.subtotal || booking.bookingAmount || 0
        }
      ]);
      // 2. Default discount from booking
      setDiscountAmount(booking.discountAmount || 0);
      // 3. Tax settings
      setTaxEnabled(booking.taxEnabled ?? false);
      setTaxPercentage(booking.taxPercentage || 18);
      // 4. Default terms notes
      setNotes('Thank you for your business! Please remit payment via bank transfer or UPI QR code scan.');
    }
  }, [selectedBookingId, bookings]);

  if (!isOpen) return null;

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  // Dynamic calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxEnabled ? Math.round((taxableAmount * taxPercentage) / 100 * 100) / 100 : 0;
  const totalAmount = taxableAmount + taxAmount;
  const bookingTotalAmount = selectedBooking ? ((selectedBooking.subtotal || selectedBooking.bookingAmount || 0) - (selectedBooking.discountAmount || 0) + (selectedBooking.taxAmount || 0)) : 0;
  const amountPaid = selectedBooking ? Math.max(0, bookingTotalAmount - (selectedBooking.pendingAmount || 0)) : 0;
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  // Line item handlers
  const handleAddItemRow = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (lineItems.length === 1) {
      toast.error('Invoice must contain at least one line item.');
      return;
    }
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemRow = (index: number, fields: Partial<InvoiceLineItemInput>) => {
    const updated = lineItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...fields };
      }
      return item;
    });
    setLineItems(updated);
  };

  // Due Date helper presets
  const applyDueDatePreset = (days: number) => {
    const today = new Date();
    today.setDate(today.getDate() + days);
    
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookingId) {
      toast.error('Please select a booking reservation.');
      return;
    }

    const invalidItem = lineItems.find(item => !item.description.trim() || item.unit_price < 0 || item.quantity <= 0);
    if (invalidItem) {
      toast.error('Please fill in valid descriptions, positive quantities, and unit prices for all items.');
      return;
    }

    try {
      const payload = {
        booking_id: selectedBookingId,
        due_date: dueDate || undefined,
        line_items: lineItems.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        })),
        discount_amount: Number(discountAmount),
        notes: notes.trim() || undefined
      };

      await createInvoiceMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
      />

      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-premium border border-slate-200 flex flex-col max-h-[90vh] z-10 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                Interactive Invoice Builder
              </h3>
              <p className="text-[10px] text-slate-450 font-semibold uppercase mt-0.5 tracking-wider">
                Zoho CRM & Freshworks Layout Engine
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold text-slate-600">
          
          {/* Top Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Booking Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                  Booking Reservation
                </label>
                {bookingId ? (
                  <div className="h-9 px-3 flex items-center border border-slate-200 bg-slate-200/50 rounded-lg text-slate-700 font-bold uppercase tracking-wider">
                    {selectedBooking ? selectedBooking.bookingNumber : `BKG-${bookingId.slice(0, 8).toUpperCase()}`}
                  </div>
                ) : isBookingsLoading ? (
                  <div className="h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 bg-white">
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Loading bookings...
                  </div>
                ) : (
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold text-xs"
                  >
                    <option value="">-- Choose Booking --</option>
                    {bookings
                      .filter(b => b.status !== 'cancelled')
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bookingNumber} - {b.customerName}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              {selectedBooking && (
                <div className="mt-3 text-[10px] text-slate-450 leading-relaxed border-t border-slate-200/60 pt-2 font-medium">
                  <strong>Customer:</strong> {selectedBooking.customerName} ({selectedBooking.customerPhone})<br />
                  <strong>Event:</strong> {selectedBooking.eventType} • {formatDate(selectedBooking.eventDate)}
                </div>
              )}
            </div>

            {/* Invoice Date */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">
                  Invoice Issue Date
                </label>
                <div className="h-9 px-3 flex items-center border border-slate-200 bg-slate-100 rounded-lg text-slate-500 font-bold">
                  Today (Auto-Generated)
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-450 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Generated based on local date helpers.</span>
              </div>
            </div>

            {/* Due Date & Presets */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">
                  Due Date
                </label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary shadow-sm font-semibold text-xs"
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded transition-colors"
                >
                  On Receipt
                </button>
                <button
                  type="button"
                  onClick={() => applyDueDatePreset(15)}
                  className="text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded transition-colors"
                >
                  Net 15
                </button>
                <button
                  type="button"
                  onClick={() => applyDueDatePreset(30)}
                  className="text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded transition-colors"
                >
                  Net 30
                </button>
              </div>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-150 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Line Items Details
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1 py-1 px-2.5 bg-primary hover:bg-primary-hover text-white rounded text-[10px] font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Item Row
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 min-w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] text-slate-450 uppercase border-b border-slate-100">
                    <th className="py-2.5 px-4 font-bold">Item Description</th>
                    <th className="py-2.5 px-4 font-bold text-center w-24">Quantity</th>
                    <th className="py-2.5 px-4 font-bold text-right w-40">Unit Price</th>
                    <th className="py-2.5 px-4 font-bold text-right w-44">Total Amount</th>
                    <th className="py-2.5 px-4 font-bold text-center w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateItemRow(index, { description: e.target.value })}
                          placeholder="e.g. Stage Decoration / Deluxe Catering Services"
                          className="w-full h-8 px-2 border border-slate-200 focus:border-primary rounded-lg text-slate-700 outline-none font-semibold text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemRow(index, { quantity: Math.max(1, Number(e.target.value)) })}
                          className="w-full h-8 px-2 border border-slate-200 focus:border-primary rounded-lg text-slate-700 outline-none text-center font-bold text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                            ₹
                          </span>
                          <input
                            type="number"
                            required
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => handleUpdateItemRow(index, { unit_price: Math.max(0, Number(e.target.value)) })}
                            className="w-full h-8 pl-6 pr-2 border border-slate-200 focus:border-primary rounded-lg text-slate-700 outline-none text-right font-mono font-bold text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 text-xs">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="p-1 rounded-md text-slate-350 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lower Grid: Notes & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes & Bank details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                  Invoice Terms & Footnote
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, bank account instructions, upi details..."
                  className="w-full p-3 border border-slate-200 focus:border-primary rounded-xl text-slate-700 outline-none font-semibold text-xs leading-relaxed resize-none"
                />
              </div>

              {selectedBooking && (
                <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 flex gap-3 text-xs font-semibold text-indigo-850 border-dashed">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1 font-medium text-[11px] leading-relaxed">
                    <strong className="text-indigo-900 block font-bold text-xs">GST Calculation Alert</strong>
                    <span>GST tax details are pre-calculated on the backend using state fallbacks. Invoices will automatically apply splits (CGST/SGST/IGST) dynamically.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-200/60 pb-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Invoice Calculations
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxCheckbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="h-3.5 w-3.5 accent-primary cursor-pointer"
                  />
                  <label htmlFor="taxCheckbox" className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer">
                    Apply Tax ({taxPercentage}%)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-550 text-xs">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="flex justify-between items-center text-slate-550 text-xs">
                  <span>Discount amount</span>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={subtotal}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.min(subtotal, Math.max(0, Number(e.target.value))))}
                      className="w-full h-7 pl-6 pr-2 border border-slate-200 focus:border-primary rounded-lg text-slate-700 outline-none text-right font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Tax Split */}
                {taxEnabled && (
                  <div className="flex justify-between text-slate-550 text-xs">
                    <span>Tax ({taxPercentage}%)</span>
                    <span className="font-mono">{formatCurrency(taxAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between text-slate-800 font-extrabold text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-slate-900">{formatCurrency(totalAmount)}</span>
                </div>

                {selectedBooking && (
                  <>
                    <div className="flex justify-between text-slate-550 text-[11px]">
                      <span>Payments Logged So Far</span>
                      <span className="font-mono text-emerald-600">- {formatCurrency(amountPaid)}</span>
                    </div>

                    <div className="border-t-2 border-primary my-2 pt-2 flex justify-between text-primary font-extrabold text-sm bg-primary/5 px-2.5 py-2 rounded-lg">
                      <span>Balance Due</span>
                      <span className="font-mono text-primary">{formatCurrency(balanceDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-650 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createInvoiceMutation.isPending || !selectedBookingId}
            className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {createInvoiceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Vector Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
