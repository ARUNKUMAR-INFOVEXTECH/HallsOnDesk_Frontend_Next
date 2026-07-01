'use client';

import React, { useState, useEffect } from 'react';
import { X, Share2, Download, Printer, Loader2, Eye, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentService } from '@/services/invoiceDocumentService';
import { toast } from 'sonner';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  amount: number;
  hallName: string;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  customerPhone,
  eventDate,
  amount,
  hallName,
}: InvoicePreviewModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Generate the PDF Blob on mount / open
  useEffect(() => {
    if (isOpen && invoiceId) {
      setIsLoading(true);
      setPdfBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

      const generatePdf = async () => {
        try {
          // Generate PDF once using the single source of truth component
          const blob = await DocumentService.generateInvoice(invoiceId);
          setPdfBlob(blob);
          
          // Create local URL for browser PDF reader preview
          const url = DocumentService.previewInvoice(blob);
          setPreviewUrl(url);
        } catch (err) {
          console.error('Failed to generate invoice PDF:', err);
          toast.error('Failed to generate high-fidelity invoice PDF.');
          onClose();
        } finally {
          setIsLoading(false);
        }
      };

      generatePdf();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, invoiceId]);

  if (!isOpen || !invoiceId) return null;

  const getPrefilledMessage = () => {
    return `Hello ${customerName},

Thank you for choosing ${hallName}.

Please find your booking invoice attached.

Invoice Number:
${invoiceNumber}

Event Date:
${eventDate}

Amount Due:
₹${amount.toLocaleString('en-IN')}

For any assistance, please contact us.

Regards,
${hallName}
Powered by Infovex Halls`;
  };

  const handleShare = async () => {
    if (!pdfBlob) return;
    try {
      setIsSharing(true);
      await DocumentService.shareInvoice(
        pdfBlob,
        invoiceNumber,
        customerPhone,
        getPrefilledMessage()
      );
    } catch (err) {
      console.error('Sharing failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfBlob) return;
    try {
      setIsDownloading(true);
      DocumentService.downloadInvoice(pdfBlob, invoiceNumber);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfBlob) return;
    try {
      setIsPrinting(true);
      await DocumentService.printInvoice(pdfBlob);
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal body container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl h-[85vh] bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden z-10 flex flex-col text-xs font-semibold text-slate-700"
        >
          {/* Header accent strip */}
          <div className="h-1 bg-primary" />

          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-primary-light" />
                Invoice Preview - #{invoiceNumber}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Verify layout design chosen by organization settings before sharing
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-1.5 text-primary text-[10px] bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Compiling PDF Document...</span>
                </div>
              )}
              {pdfBlob && (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <CheckCircle className="h-3 w-3" />
                  <span>PDF Ready (Unified Output)</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-slate-150 text-slate-405 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Iframe Preview Area */}
          <div className="flex-1 bg-slate-100 p-4 overflow-hidden relative flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-450">
                <Loader2 className="h-7 w-7 animate-spin text-primary-light" />
                <span className="font-semibold text-xs">Generating layout design...</span>
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200"
                title="Invoice Design Canvas"
              />
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-655 transition-all cursor-pointer shadow-sm"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={isLoading || !pdfBlob || isPrinting}
                className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="h-3.5 w-3.5" />
                )}
                Print PDF
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || !pdfBlob || isDownloading}
                className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download PDF
              </button>

              <button
                onClick={handleShare}
                disabled={isLoading || !pdfBlob || isSharing}
                className="flex items-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSharing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                Share PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
