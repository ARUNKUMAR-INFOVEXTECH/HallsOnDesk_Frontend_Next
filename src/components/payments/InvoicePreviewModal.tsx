'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Printer, Loader2, Eye, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInvoiceHtml } from '@/services/api/modules/invoices.service';
import { 
  convertImagesToBase64, 
  waitForIframeResources, 
  generatePdfInsideIframe, 
  printPdfBlob 
} from '@/utils/pdfEngine';
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
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch HTML invoice template from API
  useEffect(() => {
    if (isOpen && invoiceId) {
      setIsLoading(true);
      setPdfBlob(null);
      getInvoiceHtml(invoiceId)
        .then((html) => {
          setHtmlContent(html);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load invoice HTML:', err);
          toast.error('Failed to load invoice preview.');
          setIsLoading(false);
        });
    }
  }, [isOpen, invoiceId]);

  // Inject content inside iframe and generate single source-of-truth PDF Blob in background
  useEffect(() => {
    if (!isLoading && htmlContent && iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document || iframeRef.current.contentDocument;
      if (doc) {
        setIsGeneratingPdf(true);
        
        const setupIframe = async () => {
          try {
            // Pre-convert images to Base64 to prevent CORS tainted canvas crashes
            const cleanHtml = await convertImagesToBase64(htmlContent);
            
            doc.open();
            doc.write(cleanHtml);
            doc.close();

            // Wait until images and custom serif fonts are loaded and painted
            await waitForIframeResources(iframeRef.current!);
            
            // Compile PDF once inside the iframe window context
            const blob = await generatePdfInsideIframe(iframeRef.current!, `Invoice_${invoiceNumber}`);
            setPdfBlob(blob);
          } catch (err) {
            console.error('Failed to compile PDF Blob in background:', err);
            toast.error('Could not pre-render high fidelity PDF layout.');
          } finally {
            setIsGeneratingPdf(false);
          }
        };

        setupIframe();
      }
    }
  }, [isLoading, htmlContent, invoiceNumber]);

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

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceNumber.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openWhatsAppFallback = () => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const text = getPrefilledMessage();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'whatsapp://send' : 'https://web.whatsapp.com/send';
    window.open(`${baseUrl}?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShare = async () => {
    if (!pdfBlob) {
      toast.warning('Wait for PDF generation to finish before sharing.');
      return;
    }
    
    try {
      setIsSharing(true);
      const fileName = `Invoice_${invoiceNumber.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoiceNumber}`,
          text: getPrefilledMessage(),
        });
        toast.success('Invoice shared successfully!');
      } else {
        triggerDownload(pdfBlob);
        openWhatsAppFallback();
        toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error('Sharing failed. Triggering automatic download as fallback.');
      triggerDownload(pdfBlob);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfBlob) {
      toast.warning('Wait for PDF generation to finish before downloading.');
      return;
    }
    
    try {
      setIsDownloading(true);
      triggerDownload(pdfBlob);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to export PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfBlob) {
      toast.warning('Wait for PDF generation to finish before printing.');
      return;
    }

    try {
      setIsPrinting(true);
      await printPdfBlob(pdfBlob);
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Failed to trigger printing.');
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
              {isGeneratingPdf && (
                <div className="flex items-center gap-1.5 text-primary text-[10px] bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Compiling PDF Blob...</span>
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

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={isLoading || isGeneratingPdf || isPrinting}
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
                disabled={isLoading || isGeneratingPdf || isDownloading}
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
                disabled={isLoading || isGeneratingPdf || isSharing}
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
