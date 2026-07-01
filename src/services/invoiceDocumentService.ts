import apiClient from './api/client';
import { toast } from 'sonner';

/**
 * Enterprise Document Service for high-fidelity PDF Generation
 * Compiles the backend-rendered HTML template (Classic, Modern, Elegant, Minimalist)
 * into a PDF Blob client-side using a locally-bundled compiler.
 */

// Helper to convert any image URL to Base64 to bypass CORS canvas issues
export const convertImagesToBase64 = async (htmlString: string): Promise<string> => {
  if (typeof window === 'undefined') return htmlString;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const images = doc.querySelectorAll('img');
  
  for (const img of Array.from(images)) {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        img.setAttribute('src', base64);
      } catch (err) {
        console.error(`Failed to convert image ${src} to Base64:`, err);
        img.remove(); // Remove to prevent canvas taint if CORS fails
      }
    }
  }
  return doc.documentElement.outerHTML;
};

export class DocumentService {
  /**
   * Compiles the unified HTML template into a high-fidelity PDF Blob client-side
   */
  static async generateInvoice(htmlContent: string, documentTitle: string): Promise<Blob> {
    if (typeof window === 'undefined') {
      throw new Error('PDF Engine requires client-side execution environment');
    }

    // Dynamically load html2pdf.js locally to prevent SSR build issues
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default;

    // Create an off-screen container inside the main window context so styles resolve natively
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.height = 'auto';
    container.style.opacity = '1';
    container.style.pointerEvents = 'none';

    // Pre-convert images to Base64 to prevent CORS tainted canvas crashes
    const cleanHtml = await convertImagesToBase64(htmlContent);
    container.innerHTML = cleanHtml;
    document.body.appendChild(container);

    // Wait until images inside the container are loaded
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    // Wait for custom Google Fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Brief safety delay for layout painting
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const options = {
        margin: 10,
        filename: `${documentTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const blob = await html2pdf().from(container).set(options as any).output('blob');
      document.body.removeChild(container);
      return blob;
    } catch (err) {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      throw err;
    }
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
      window.open(`${baseUrl}?phone=${cleanPhone}?text=${encodeURIComponent(prefilledText)}`, '_blank');
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
