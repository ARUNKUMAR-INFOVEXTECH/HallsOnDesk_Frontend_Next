'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPinOff, Home, LifeBuoy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(238,155,0,0.06),transparent_50%)] pointer-events-none select-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(10,37,64,0.02),transparent_70%)] pointer-events-none select-none" />

      <div className="max-w-md w-full text-center border border-slate-200 bg-white rounded-2xl p-8 md:p-10 shadow-premium relative z-10">
        
        {/* Ornate Gold Emblem Header */}
        <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-100 text-[#159DFC] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <MapPinOff className="h-7 w-7" />
        </div>

        {/* Text Copy */}
        <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest bg-amber-50 border border-amber-100 rounded-full px-3 py-1 inline-block mb-3">
          Error 404
        </span>
        
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none mb-3">
          Path Not Found
        </h1>
        
        <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto mb-8">
          The booking register, calendar slot, or settings route you are searching for does not exist or has been relocated to another path.
        </p>

        {/* Action Button Grid */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold btn-primary cursor-pointer w-full shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer transition-all"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Go Home</span>
            </Link>

            <Link
              href="/dashboard/support"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer transition-all"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Help Center</span>
            </Link>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 font-semibold select-none">
          <img src="/favicon.png" alt="Infovex Halls Logo" className="h-3 w-3 shrink-0" />
          <span>Infovex Halls • Powered by Infovex</span>
        </div>

      </div>
    </div>
  );
}
