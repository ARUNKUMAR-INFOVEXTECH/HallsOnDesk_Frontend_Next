import React from 'react';
import type { Metadata } from 'next';
import QueryProvider from '@/providers/QueryProvider';
import ProductProvider from '@/providers/ProductProvider';
import AuthProvider from '@/providers/AuthProvider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: "Infovex Halls - India's First Marriage Hall CRM & ERP",
  description: "India's first dedicated marriage hall and convention center CRM. Manage bookings, payments, WhatsApp alerts, and visual calendars in one dashboard.",
  icons: {
    icon: [
      { url: '/favicon.png?v=4', type: 'image/png' },
      { url: '/favicon.ico?v=4', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/favicon.png?v=4',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Modern typography from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <QueryProvider>
          <ProductProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-right" richColors closeButton />
          </ProductProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
