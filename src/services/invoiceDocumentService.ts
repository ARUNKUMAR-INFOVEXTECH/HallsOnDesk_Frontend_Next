import { pdf } from '@react-pdf/renderer';
import React from 'react';
import apiClient from './api/client';
import { getHallProfile } from './api/modules/settings.service';
import { Invoice } from '@/types';
import { InvoiceDocument, ReceiptDocument } from '@/components/payments/InvoiceDocument';
import { toast } from 'sonner';

/**
 * Enterprise Document Service for high-fidelity PDF Generation
 * Bypasses fragile DOM screenshotting by compiling vector PDFs directly from React code.
 */

// Helper to convert any image URL to Base64 to bypass CORS canvas issues
const fetchAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error(`Failed to pre-fetch image ${url} for PDF:`, err);
    throw err;
  }
};

export class DocumentService {
  /**
   * Compiles the unified vector PDF Blob from the single source of truth InvoiceDocument component
   */
  static async generateInvoice(invoiceId: string): Promise<Blob> {
    try {
      // 1. Fetch raw JSON Invoice and Hall Profile data
      const [invoiceRes, profile] = await Promise.all([
        apiClient.get<Invoice>(`/invoices/${invoiceId}`),
        getHallProfile()
      ]);
      const invoice = invoiceRes.data;

      // 2. Pre-fetch and convert logo image to Base64 (if configured)
      let logoBase64 = '';
      if (profile.logoUrl) {
        try {
          logoBase64 = await fetchAsBase64(profile.logoUrl);
        } catch {
          // Continue without logo if it fails
        }
      }

      // 3. Generate UPI QR Code URL & pre-fetch as Base64 (if UPI ID exists)
      let qrBase64 = '';
      const upiId = profile.upiId;
      if (upiId && invoice.balance_due > 0) {
        try {
          const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${encodeURIComponent(invoice.balance_due)}&tn=${encodeURIComponent(invoice.invoice_number)}&pn=${encodeURIComponent(invoice.hall_name)}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;
          qrBase64 = await fetchAsBase64(qrUrl);
        } catch (err) {
          console.error('Failed to pre-fetch payment QR code:', err);
        }
      }

      // 4. Instantiate the InvoiceDocument React component
      const docElement = React.createElement(InvoiceDocument, {
        invoice,
        logoBase64: logoBase64 || undefined,
        qrBase64: qrBase64 || undefined,
        bankDetails: {
          bank_name: profile.bankName,
          account_number: profile.accountNumber,
          ifsc_code: profile.ifscCode,
          upi_id: profile.upiId
        }
      });

      // 5. Compile vector PDF Blob on the client-side
      const pdfInstance = pdf(docElement as any);
      const blob = await pdfInstance.toBlob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF Blob is empty');
      }

      return blob;
    } catch (err) {
      console.error('Error inside generateInvoice PDF compiling:', err);
      throw err;
    }
  }

  /**
   * Compiles the unified vector PDF Blob from the single source of truth ReceiptDocument component
   */
  static async generateReceipt(receiptData: {
    receiptNumber: string;
    customerName: string;
    customerPhone: string;
    bookingNumber: string;
    eventType: string;
    eventDate: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    hallName: string;
    hallAddress: string;
    hallPhone: string;
    hallEmail: string;
    logoUrl?: string;
  }): Promise<Blob> {
    try {
      // 1. Pre-fetch and convert logo image to Base64 (if configured)
      let logoBase64 = '';
      if (receiptData.logoUrl) {
        try {
          logoBase64 = await fetchAsBase64(receiptData.logoUrl);
        } catch {
          // Continue without logo if it fails
        }
      }

      // 2. Instantiate the ReceiptDocument React component
      const docElement = React.createElement(ReceiptDocument, {
        receiptNumber: receiptData.receiptNumber,
        customerName: receiptData.customerName,
        customerPhone: receiptData.customerPhone,
        bookingNumber: receiptData.bookingNumber,
        eventType: receiptData.eventType,
        eventDate: receiptData.eventDate,
        amount: receiptData.amount,
        paymentDate: receiptData.paymentDate,
        paymentMethod: receiptData.paymentMethod,
        hallName: receiptData.hallName,
        hallAddress: receiptData.hallAddress,
        hallPhone: receiptData.hallPhone,
        hallEmail: receiptData.hallEmail,
        logoBase64: logoBase64 || undefined
      });

      // 3. Compile vector PDF Blob on the client-side
      const pdfInstance = pdf(docElement as any);
      const blob = await pdfInstance.toBlob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF Blob is empty');
      }

      return blob;
    } catch (err) {
      console.error('Error inside generateReceipt PDF compiling:', err);
      throw err;
    }
  }

  /**
   * Generates a preview object URL from the PDF Blob
   */
  static previewInvoice(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Triggers native file download of the PDF Blob
   */
  static downloadInvoice(blob: Blob, invoiceNumber: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceNumber.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Shares the PDF Blob using native sharing or falls back to WhatsApp
   */
  static async shareInvoice(
    blob: Blob,
    invoiceNumber: string,
    customerPhone: string,
    prefilledText: string
  ): Promise<void> {
    const fileName = `Invoice_${invoiceNumber.replace(/\s+/g, '_')}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Invoice ${invoiceNumber}`,
        text: prefilledText,
      });
      toast.success('Invoice shared successfully!');
    } else {
      // Fallback
      DocumentService.downloadInvoice(blob, invoiceNumber);
      const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const baseUrl = isMobile ? 'whatsapp://send' : 'https://web.whatsapp.com/send';
      window.open(`${baseUrl}?phone=${cleanPhone}&text=${encodeURIComponent(prefilledText)}`, '_blank');
      toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
    }
  }

  /**
   * Prints the PDF Blob natively using an invisible print iframe
   */
  static printInvoice(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          resolve();
        }, 3000);
      };
    });
  }
}
