'use client';

import React, { useState } from 'react';
import { Share2, Download, Printer, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentService } from '@/services/invoiceDocumentService';
import { getHallProfile } from '@/services/api/modules/settings.service';

interface DocumentShareButtonProps {
  documentId?: string; // Invoice ID or Payment ID
  documentType: 'invoice' | 'receipt' | 'booking' | 'quotation' | 'customer';
  htmlContentFetcher?: () => Promise<string>; // kept for backward compatibility
  customerName: string;
  customerPhone: string;
  documentTitle: string;
  documentNumber: string;
  eventDate: string;
  amount: number;
  hallName: string;
  disabled?: boolean;

  // Receipt specific contextual props
  bookingNumber?: string;
  eventType?: string;
  paymentDate?: string;
  paymentMethod?: string;
}

export default function DocumentShareButton({
  documentId,
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
  bookingNumber,
  eventType,
  paymentDate,
  paymentMethod,
}: DocumentShareButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const getPrefilledMessage = () => {
    return `Hello ${customerName},

Thank you for choosing ${hallName}.

Please find your booking ${documentType} attached.

${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Number:
${documentNumber}

Event Date:
${eventDate}

Amount:
₹${amount.toLocaleString('en-IN')}

For any assistance, please contact us.

Regards,
${hallName}
Powered by Infovex Halls`;
  };

  // Helper to compile and cache the single PDF Blob from our DocumentService
  const resolvePdfBlob = async (): Promise<Blob> => {
    if (pdfBlob) return pdfBlob;

    if (documentType === 'invoice') {
      if (!documentId) {
        throw new Error('documentId is required to generate invoice PDF');
      }
      const blob = await DocumentService.generateInvoice(documentId);
      setPdfBlob(blob);
      return blob;
    } else if (documentType === 'receipt') {
      // Fetch latest hall profile details for layout header
      const profile = await getHallProfile();
      const blob = await DocumentService.generateReceipt({
        receiptNumber: documentNumber,
        customerName,
        customerPhone,
        bookingNumber: bookingNumber || 'N/A',
        eventType: eventType || 'N/A',
        eventDate,
        amount,
        paymentDate: paymentDate || eventDate,
        paymentMethod: paymentMethod || 'cash',
        hallName: profile.hallName || hallName,
        hallAddress: profile.address || '',
        hallPhone: profile.phone || '',
        hallEmail: profile.email || '',
        logoUrl: profile.logoUrl || undefined
      });
      setPdfBlob(blob);
      return blob;
    } else {
      throw new Error(`PDF export not supported for type: ${documentType}`);
    }
  };

  const handleShare = async () => {
    try {
      setIsProcessing(true);
      const activeBlob = await resolvePdfBlob();
      const fileName = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
      const file = new File([activeBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: documentTitle,
          text: getPrefilledMessage(),
        });
        toast.success('Document shared successfully!');
      } else {
        triggerDownload(activeBlob);
        openWhatsAppFallback();
        toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error('Invoice generation failed. Please try again.');
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
      const activeBlob = await resolvePdfBlob();
      triggerDownload(activeBlob);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Invoice generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setDropdownOpen(false);
    }
  };

  const handlePrintOnly = async () => {
    try {
      setIsProcessing(true);
      const activeBlob = await resolvePdfBlob();
      await DocumentService.printInvoice(activeBlob);
    } catch (err) {
      console.error('Print failed:', err);
      toast.error('Invoice generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative inline-flex items-center w-full">
      {/* Primary Action Button */}
      <button
        onClick={handleShare}
        disabled={disabled || isProcessing}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-l-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 min-h-[38px]"
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
        className="py-2 px-1.5 bg-primary/95 border-l border-white/20 hover:bg-primary-hover text-white rounded-r-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 min-h-[38px] flex items-center justify-center shrink-0"
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
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer border-t border-slate-100"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
