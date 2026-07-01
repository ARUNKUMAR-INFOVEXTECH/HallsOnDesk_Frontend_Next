'use client';

import React, { useState } from 'react';
import { Share2, Download, Printer, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentShareButtonProps {
  documentType: 'invoice' | 'receipt' | 'booking' | 'quotation' | 'customer';
  htmlContentFetcher: () => Promise<string>;
  customerName: string;
  customerPhone: string;
  documentTitle: string;
  documentNumber: string;
  eventDate: string;
  amount: number;
  hallName: string;
  disabled?: boolean;
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

export default function DocumentShareButton({
  documentType,
  htmlContentFetcher,
  customerName,
  customerPhone,
  documentTitle,
  documentNumber,
  eventDate,
  amount,
  hallName,
  disabled = false,
}: DocumentShareButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPrefilledMessage = () => {
    return `Hello ${customerName},

Thank you for choosing ${hallName}.

Please find your booking ${documentType} attached.

${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Number:
${documentNumber}

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
    const htmlContent = await htmlContentFetcher();
    const html2pdf = await loadHtml2Pdf();
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      const options = {
        margin: 10,
        filename: `${documentTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
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
      setIsProcessing(true);
      const pdfBlob = await generatePdfBlob();
      const fileName = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Check if navigator.share and file sharing is supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: documentTitle,
          text: getPrefilledMessage(),
        });
        toast.success('Document shared successfully!');
      } else {
        // Fallback: download automatically and open WhatsApp Web/App
        triggerDownload(pdfBlob);
        openWhatsAppFallback();
        toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error('Sharing failed. Triggering automatic PDF download as fallback.');
      try {
        const pdfBlob = await generatePdfBlob();
        triggerDownload(pdfBlob);
      } catch (dlErr) {
        console.error('Fallback download failed:', dlErr);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
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

  const handleDownloadOnly = async () => {
    try {
      setIsProcessing(true);
      const pdfBlob = await generatePdfBlob();
      triggerDownload(pdfBlob);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to generate PDF.');
    } finally {
      setIsProcessing(false);
      setDropdownOpen(false);
    }
  };

  const handlePrintOnly = async () => {
    try {
      const htmlContent = await htmlContentFetcher();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Failed to open print layout.');
    } finally {
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Primary Action Button */}
      <button
        onClick={handleShare}
        disabled={disabled || isProcessing}
        className="flex items-center gap-1.5 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-l-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 min-h-[38px]"
      >
        {isProcessing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Share2 className="h-3.5 w-3.5" />
        )}
        <span>Share</span>
      </button>

      {/* Dropdown Toggle */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={disabled || isProcessing}
        className="py-2 px-1.5 bg-primary/95 border-l border-white/20 hover:bg-primary-hover text-white rounded-r-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 min-h-[38px] flex items-center justify-center"
        title="More actions"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {/* Dropdown Options */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-premium z-50 py-1.5 min-w-[130px] text-left text-xs font-bold text-slate-700 animate-fadeIn">
            <button
              type="button"
              onClick={handleDownloadOnly}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrintOnly}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print View</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
