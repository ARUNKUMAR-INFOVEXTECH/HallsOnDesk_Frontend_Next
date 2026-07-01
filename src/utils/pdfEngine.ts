'use client';

/**
 * Unified PDF Generation Engine for HallsOnDesk SaaS
 * Uses locally bundled html2pdf.js and executes inside isolated iframe contexts to prevent stylesheet leaks,
 * canvas coordinates mismatch, and CORS taint failures.
 */

/**
 * Pre-converts all images (logos, qr codes) to Base64 to avoid CORS canvas contamination
 */
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

/**
 * Wait for all images and stylesheets inside an iframe to finish loading
 */
export const waitForIframeResources = async (iframe: HTMLIFrameElement): Promise<void> => {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!win || !doc) return;

  // 1. Wait for images
  const imgs = Array.from(doc.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // 2. Wait for fonts
  if (doc.fonts && doc.fonts.ready) {
    await doc.fonts.ready;
  }

  // 3. Safety paint delay
  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * Generates the PDF Blob inside the iframe context using local html2pdf bundle
 */
export const generatePdfInsideIframe = async (
  iframe: HTMLIFrameElement,
  documentTitle: string
): Promise<Blob> => {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!win || !doc) {
    throw new Error('Iframe context unavailable for PDF compilation');
  }

  // Dynamically load html2pdf.js locally to prevent SSR build issues
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default;
  (win as any).html2pdf = html2pdf;

  const options = {
    margin: 10,
    filename: `${documentTitle}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  return await (win as any).html2pdf().from(doc.body).set(options).output('blob');
};

/**
 * Programmatically creates a temporary iframe in the main document context,
 * loads the styled HTML document, and returns a high-fidelity PDF Blob.
 */
export const getPdfBlobFromHtml = async (
  htmlContent: string,
  documentTitle: string
): Promise<Blob> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF Engine requires client-side execution environment');
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '800px';
  iframe.style.height = '1130px';
  iframe.style.opacity = '1';
  iframe.style.zIndex = '-9999';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error('Could not access iframe context');
    }

    const cleanHtml = await convertImagesToBase64(htmlContent);
    doc.open();
    doc.write(cleanHtml);
    doc.close();

    await waitForIframeResources(iframe);
    return await generatePdfInsideIframe(iframe, documentTitle);
  } finally {
    document.body.removeChild(iframe);
  }
};

/**
 * Natively prints a PDF Blob by loading it inside a temporary print iframe
 */
export const printPdfBlob = (blob: Blob): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();

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
      
      // Let print dialog execute, then cleanup
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
        resolve();
      }, 3000);
    };
  });
};
