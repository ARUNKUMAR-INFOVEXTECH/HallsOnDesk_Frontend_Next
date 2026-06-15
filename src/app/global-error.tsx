'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Captured global layout exception:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#0A2540] font-sans min-h-screen flex items-center justify-center p-4 m-0 overflow-hidden">
        {/* Background Decorative Radial Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.04),transparent_50%)] pointer-events-none select-none" />

        <div className="max-w-md w-full text-center border border-slate-200 bg-white rounded-2xl p-8 md:p-10 shadow-premium relative z-10">
          
          {/* Connection Error Icon */}
          <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-100 text-[#EF4444] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>

          {/* Text Copy */}
          <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest bg-rose-50 border border-rose-100 rounded-full px-3 py-1 inline-block mb-3">
            Critical Error
          </span>
          
          <h1 className="text-2xl font-black text-[#0A2540] tracking-tight leading-none mb-3">
            System Failure
          </h1>
          
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto mb-6">
            A critical error occurred while initializing the Infovex Halls layout. Please try refreshing or checking connection layers.
          </p>

          {/* Action Button */}
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-[#0A2540] hover:bg-[#081D33] text-white cursor-pointer w-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            <span>Try Resetting App Shell</span>
          </button>

          {/* Technical Details Accordion */}
          <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-4 py-2.5 flex justify-between items-center text-slate-500 font-bold text-[9.5px] uppercase tracking-wider hover:bg-slate-100/50 cursor-pointer transition-colors"
            >
              <span>Error Details</span>
              {showDetails ? '▲' : '▼'}
            </button>

            {showDetails && (
              <div className="px-4 pb-4 border-t border-slate-100 text-left font-mono text-[9px] text-slate-450 leading-relaxed overflow-x-auto break-all max-h-36 no-scrollbar">
                <div className="pt-3 font-extrabold text-[#EF4444] mb-1">
                  Digest ID: {error.digest || 'N/A'}
                </div>
                <div className="font-semibold text-slate-600">
                  Message: {error.message || 'A critical framework exception occurred.'}
                </div>
              </div>
            )}
          </div>

          {/* Branding Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 font-semibold select-none">
            <img src="/favicon.png" alt="Infovex Halls Logo" className="h-3 w-3 shrink-0" />
            <span>Infovex Halls • Powered by Infovex</span>
          </div>

        </div>
      </body>
    </html>
  );
}
