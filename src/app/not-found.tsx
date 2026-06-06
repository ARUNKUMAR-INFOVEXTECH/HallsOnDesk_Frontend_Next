'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center border border-slate-200 bg-white rounded-xl p-8 shadow-premium animate-fadeIn">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Ban className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 font-medium mb-6">
          The page you are looking for doesn't exist or has been moved to another path.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold btn-primary cursor-pointer w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
