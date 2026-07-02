'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  FileText, 
  Download, 
  LayoutGrid
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { DocumentService } from '@/services/invoiceDocumentService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from 'sonner';

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string; // Optional: Pre-fill and lock if opened from Booking Details
}

export function InvoiceBuilderModal({ isOpen, onClose, bookingId }: InvoiceBuilderModalProps) {
  const { data: bookings = [], isLoading: isBookingsLoading } = useBookings();
  const createInvoiceMutation = useCreateInvoice();

  // Selected state variables
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Set booking context from props or reset when opening
  useEffect(() => {
    if (isOpen) {
      if (bookingId) {
        setSelectedBookingId(bookingId);
      } else {
        setSelectedBookingId('');
      }
    }
  }, [bookingId, isOpen]);

  if (!isOpen) return null;

  // Filter bookings to exclude cancelled ones
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  const handleGenerate = async () => {
    if (!selectedBookingId) {
      toast.warning('Please select a booking reservation first.');
      return;
    }

    try {
      setIsGenerating(true);
      toast.info('Generating billing invoice...');

      let invoiceId = '';
      let invoiceNumber = '';

      try {
        // 1. Send create request to backend
        const result = await createInvoiceMutation.mutateAsync({
          booking_id: selectedBookingId
        });
        invoiceId = result.data.id;
        invoiceNumber = result.data.invoice_number;
      } catch (err: any) {
        // If the invoice already exists, handle it gracefully by retrieving the existing document
        if (err.response?.status === 409 && err.response?.data?.invoice_id) {
          invoiceId = err.response.data.invoice_id;
          invoiceNumber = err.response.data.invoice_number || 'Invoice';
        } else {
          throw err;
        }
      }

      // 2. Compile and download PDF based on selected template
      toast.info('Compiling template design to PDF...');
      const pdfBlob = await DocumentService.getInvoicePdf(invoiceId, selectedTemplate);
      DocumentService.downloadInvoice(pdfBlob, invoiceNumber);

      toast.success('Invoice generated and downloaded successfully!');
      onClose();
    } catch (err: any) {
      console.error('Invoice generation failed:', err);
      
      // Fallback: compile client-side using native print window if everything else fails
      if (selectedBooking) {
        toast.info('Direct compile triggered...');
        try {
          const { getInvoiceHtml } = await import('@/services/api/modules/invoices.service');
          const html = await getInvoiceHtml(selectedBookingId, selectedTemplate);
          const pdfBlob = await DocumentService.generateInvoice(html, `Invoice_${selectedBooking.bookingNumber}`);
          DocumentService.downloadInvoice(pdfBlob, selectedBooking.bookingNumber);
          toast.success('Invoice compiled and downloaded successfully!');
          onClose();
          return;
        } catch (fallbackErr) {
          console.error('Fallback compile failed:', fallbackErr);
        }
      }
      toast.error(err.response?.data?.message || 'Failed to generate invoice. Please check the backend connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden z-10 flex flex-col text-xs font-semibold text-slate-700 animate-fadeIn">
        {/* Header accent strip */}
        <div className="h-1 bg-primary" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-primary-light" />
              Generate Billing Invoice
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 animate-pulse">
              Fast, automated SaaS billing engine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-405 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Booking Selection (Only if not locked from Booking Details) */}
          {!bookingId ? (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Booking Reservation
              </label>
              {isBookingsLoading ? (
                <div className="flex items-center gap-2 h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading active reservations...</span>
                </div>
              ) : (
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:border-primary outline-none transition-colors cursor-pointer text-slate-800 font-bold"
                >
                  <option value="">-- Choose Booking --</option>
                  {activeBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customerName} - {b.eventType} ({formatDate(b.eventDate)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : null}

          {/* Design Layout Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <LayoutGrid className="h-3.5 w-3.5 text-slate-450" />
              Choose Template Style
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:border-primary outline-none transition-colors cursor-pointer text-slate-800 font-bold"
            >
              <option value="classic">Classic Layout (Default Corporate)</option>
              <option value="modern">Modern Layout (Digital Capsule)</option>
              <option value="elegant">Elegant Layout (Luxury Wedding Gold)</option>
            </select>
          </div>

          {/* Selected Booking Summary Card */}
          {selectedBooking ? (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Billing Summary
                </span>
                <span className="font-mono text-slate-800 font-bold">
                  #{selectedBooking.bookingNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                <div>
                  <span className="text-slate-400 block font-semibold">Client Name</span>
                  <span className="text-slate-800 font-bold">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Event Category</span>
                  <span className="text-slate-800 font-bold">{selectedBooking.eventType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Event Date</span>
                  <span className="text-slate-850 font-bold font-mono">{formatDate(selectedBooking.eventDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Total Base Rate</span>
                  <span className="text-slate-850 font-bold font-mono">
                    {formatCurrency(selectedBooking.subtotal || selectedBooking.bookingAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-medium">
              Select a booking reservation above to view the invoice preview summary.
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedBookingId || isGenerating || createInvoiceMutation.isPending}
            className="flex items-center justify-center gap-1.5 py-2 px-4.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating || createInvoiceMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Download className="h-4 w-4 shrink-0" />
            )}
            Generate & Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
