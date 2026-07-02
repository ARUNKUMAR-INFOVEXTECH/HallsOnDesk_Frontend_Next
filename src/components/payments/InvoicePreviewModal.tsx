'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Loader2, 
  Eye, 
  CheckCircle,
  LayoutGrid
} from 'lucide-react';
import { getInvoiceHtml } from '@/services/api/modules/invoices.service';
import { DocumentService } from '@/services/invoiceDocumentService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
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
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Template select state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch HTML preview and pre-compile PDF when modal opens or template changes
  useEffect(() => {
    if (isOpen && invoiceId) {
      setIsLoading(true);
      setHtmlContent('');
      setPdfBlob(null);

      // 1. Fetch HTML layout preview
      getInvoiceHtml(invoiceId, selectedTemplate)
        .then((html) => {
          setHtmlContent(html);
        })
        .catch((err) => {
          console.error('Failed to fetch HTML preview:', err);
          toast.error('Failed to load invoice preview layout.');
        })
        .finally(() => {
          setIsLoading(false);
        });

      // 2. Fetch or warm-cache PDF blob in background
      setIsGeneratingPdf(true);
      DocumentService.getInvoicePdf(invoiceId, selectedTemplate)
        .then((blob) => {
          setPdfBlob(blob);
        })
        .catch((err) => {
          console.warn('Server PDF fetch unavailable, falling back to local compilation:', err);
        })
        .finally(() => {
          setIsGeneratingPdf(false);
        });
    }
  }, [isOpen, invoiceId, selectedTemplate]);

  // Inject HTML preview content into iframe doc context safely
  useEffect(() => {
    if (htmlContent && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, isLoading]);

  if (!isOpen || !invoiceId) return null;

  // Helper to ensure we have a PDF Blob (either from backend cache or compiled client-side)
  const getOrCompilePdfBlob = async (): Promise<Blob> => {
    if (pdfBlob) return pdfBlob;
    
    // If backend PDF isn't loaded yet, compile it client-side on the fly
    toast.info('Compiling vector PDF document...');
    const compiled = await DocumentService.generateInvoice(htmlContent, `Invoice_${invoiceNumber}`);
    setPdfBlob(compiled);
    return compiled;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await getOrCompilePdfBlob();
      DocumentService.downloadInvoice(blob, invoiceNumber);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download PDF document.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      // 1. Try printing the PDF blob natively
      try {
        const blob = await getOrCompilePdfBlob();
        await DocumentService.printInvoice(blob);
        return;
      } catch (blobPrintErr) {
        console.warn('PDF blob printing failed, falling back to window print:', blobPrintErr);
      }

      // 2. Fallback: Print HTML preview content directly in a new tab
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      } else {
        throw new Error('Popup window blocked by browser');
      }
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Failed to print document.');
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
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 animate-pulse">
                Select template style and download instantly
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isGeneratingPdf && (
                <div className="flex items-center gap-1.5 text-primary text-[10px] bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Compiling PDF...</span>
                </div>
              )}
              {pdfBlob && (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <CheckCircle className="h-3 w-3" />
                  <span>PDF Ready</span>
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
                <span className="font-semibold text-xs animate-pulse">Loading design template...</span>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
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

            <div className="flex items-center gap-3">
              {/* Template Style Selector dropdown */}
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-slate-450" />
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="h-8.5 px-2 border border-slate-200 rounded-lg bg-white outline-none cursor-pointer text-slate-800 text-[11px] font-bold"
                >
                  <option value="classic">Classic Style</option>
                  <option value="modern">Modern Style</option>
                  <option value="elegant">Elegant Style</option>
                </select>
              </div>

              <button
                onClick={handlePrint}
                disabled={isLoading || !htmlContent || isPrinting}
                className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="h-3.5 w-3.5" />
                )}
                Print Layout
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || !htmlContent || isDownloading}
                className="flex items-center gap-1.5 py-2 px-4.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
