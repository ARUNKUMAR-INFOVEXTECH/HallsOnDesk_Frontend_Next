'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Printer, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInvoiceHtml } from '@/services/api/modules/invoices.service';
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

const loadHtml2Pdf = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) {
      resolve((window as any).html2pdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
};

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
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      setIsLoading(true);
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

  // Inject content inside the sandboxed preview iframe
  useEffect(() => {
    if (!isLoading && htmlContent && iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document || iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [isLoading, htmlContent]);

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

  const generatePdfBlob = async (): Promise<Blob> => {
    const html2pdf = await loadHtml2Pdf();
    
    // Create an invisible container inside the main window context so style definitions apply fully
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.height = 'auto';
    container.style.opacity = '0.01';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const options = {
        margin: 10,
        filename: `Invoice_${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      const blob = await html2pdf().from(container).set(options).output('blob');
      document.body.removeChild(container);
      return blob;
    } catch (err) {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      throw err;
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const pdfBlob = await generatePdfBlob();
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
      try {
        const pdfBlob = await generatePdfBlob();
        triggerDownload(pdfBlob);
      } catch (dlErr) {
        console.error('Fallback download failed:', dlErr);
      }
    } finally {
      setIsSharing(false);
    }
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pdfBlob = await generatePdfBlob();
      triggerDownload(pdfBlob);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to generate PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.print();
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
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-150 text-slate-405 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
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
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-650 transition-all cursor-pointer shadow-sm"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={isLoading}
                className="flex items-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Print View
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || isDownloading}
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
                disabled={isLoading || isSharing}
                className="flex items-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSharing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                Share Invoice
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
