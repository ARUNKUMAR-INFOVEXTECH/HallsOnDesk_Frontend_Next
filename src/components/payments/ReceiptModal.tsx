'use client';

import React, { useState } from 'react';
import { X, Printer, Globe, Download, Loader2 } from 'lucide-react';
import { Payment } from '@/types/payment';
import { formatDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { getReceiptHtml } from '@/services/api/modules/invoices.service';
import { DocumentService } from '@/services/invoiceDocumentService';
import { toast } from 'sonner';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !payment) return null;

  const receiptNumber = `REC-${payment.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = async () => {
    try {
      const html = await getReceiptHtml(payment.id);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (err) {
      console.error('Print receipt failed:', err);
      toast.error('Failed to print receipt.');
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // 1. Try to fetch PDF from backend
      try {
        const blob = await DocumentService.getReceiptPdf(payment.id);
        DocumentService.downloadInvoice(blob, receiptNumber);
        toast.success('Receipt PDF downloaded successfully!');
        return;
      } catch (backendErr) {
        console.warn('Backend receipt PDF fetch failed, falling back to local compilation:', backendErr);
      }

      // 2. Client-side fallback compilation
      const html = await getReceiptHtml(payment.id);
      const blob = await DocumentService.generateInvoice(html, receiptNumber);
      DocumentService.downloadInvoice(blob, receiptNumber);
      toast.success('Receipt PDF downloaded successfully!');
    } catch (err) {
      console.error('Download receipt failed:', err);
      toast.error('Failed to download receipt PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Printable CSS style definitions injected dynamically */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide all page markup */
            body * {
              visibility: hidden !important;
            }
            /* Show only the printable receipt block */
            #printable-receipt-area, #printable-receipt-area * {
              visibility: visible !important;
            }
            #printable-receipt-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              border: none !important;
              box-shadow: none !important;
              background: #FFFFFF !important;
              color: #000000 !important;
            }
          }
        `}} />

        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden"
        />

        {/* Modal body container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden z-10 flex flex-col text-xs font-semibold text-slate-700 print:shadow-none print:border-none"
        >
          {/* Header accent strip */}
          <div className="h-1 bg-violet-650 print:hidden" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md hover:bg-slate-100 text-slate-405 hover:text-slate-600 transition-colors cursor-pointer print:hidden"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Printable Receipt Card Body */}
          <div id="printable-receipt-area" className="p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Header: Brand and title */}
            <div className="text-center space-y-1.5 border-b border-dashed border-slate-200 pb-4">
              <div className="flex items-center justify-center gap-2 text-slate-800">
                <Globe className="h-5 w-5 text-violet-600" />
                <span className="font-extrabold text-base tracking-tight leading-none">
                  Infovex <span className="text-violet-600">Halls</span>
                </span>
              </div>
              <h2 className="text-sm font-black tracking-widest text-slate-800 uppercase">
                Payment Receipt
              </h2>
              <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150 inline-block">
                Receipt No: {receiptNumber}
              </span>
            </div>

            {/* Bill To Customer detail block */}
            <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-150">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">
                Billed To
              </span>
              <span className="text-slate-800 font-extrabold block text-[11px] mt-1.5 leading-none">
                {payment.customerName}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono mt-1 leading-none">
                {payment.customerPhone}
              </span>
            </div>

            {/* Receipt Parameters Grid */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-b border-dashed border-slate-200 py-4.5">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Booking Number
                </span>
                <span className="text-slate-800 font-bold block mt-1 font-mono leading-none">
                  {payment.bookingNumber}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Event Category
                </span>
                <span className="text-slate-800 font-bold block mt-1 leading-none">
                  {payment.eventType}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Event Date
                </span>
                <span className="text-slate-800 font-bold block mt-1 font-mono leading-none">
                  {formatDate(payment.eventDate)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Payment Date
                </span>
                <span className="text-slate-800 font-bold block mt-1 font-mono leading-none">
                  {formatDate(payment.paymentDate)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Payment Method
                </span>
                <span className="text-slate-800 font-bold block mt-1 capitalize leading-none">
                  {payment.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold leading-none">
                  Reference No.
                </span>
                <span className="text-slate-850 font-bold block mt-1 font-mono leading-none">
                  {payment.referenceNumber || '—'}
                </span>
              </div>
            </div>

            {/* Total Paid Collections */}
            <div className="flex flex-col items-center justify-center py-2.5 bg-violet-50/50 border border-violet-100 rounded-xl">
              <span className="text-[9px] text-violet-650 block font-bold uppercase tracking-wider mb-1">
                Amount Paid
              </span>
              <span className="text-2xl font-black text-slate-850 font-mono">
                {formatCurrency(payment.amount)}
              </span>
              <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Paid Successful
              </span>
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-slate-450 font-medium space-y-1 pt-2">
              <p>Thank you for your payment!</p>
              <p className="text-[9px] text-slate-400">
                Powered by Infovex Halls — Infovex Technologies
              </p>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center gap-3 justify-end p-4 border-t border-slate-100 bg-slate-50 shrink-0 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-slate-500" />
              ) : (
                <Download className="h-4 w-4 shrink-0" />
              )}
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-2 px-4.5 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4 shrink-0" />
              Print Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
