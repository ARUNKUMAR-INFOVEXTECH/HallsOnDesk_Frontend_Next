import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - HallsOnDesk',
  description: 'Secure access keys login, recovery, and passwords reset.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      {children}
    </div>
  );
}
