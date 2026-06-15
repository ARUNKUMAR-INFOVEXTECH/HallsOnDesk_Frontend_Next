'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanding } from '@/components/landing/LandingContext';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';

export default function PricingPage() {
  const { openDemoModal } = useLanding();

  return (
    <div className="bg-white pt-24">
      {/* Page Header */}
      <div className="py-16 bg-[#F8FAFC] border-b border-slate-200/80 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EE9B00]/10 border border-[#EE9B00]/25 rounded-full text-[10px] font-bold text-[#D48A00] uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#EE9B00]" />
            Founding Member Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0A2540] tracking-tight">
            Transparent Pricing. Permanent Lock.
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 max-w-xl mx-auto leading-relaxed font-semibold">
            Choose the package that matches your marriage hall operations. Join our Founding Hall Partner Program to lock in early rates permanently.
          </p>
        </div>
      </div>

      {/* Pricing Matrix Component */}
      <Pricing onBookDemoClick={openDemoModal} />

      {/* FAQ Component */}
      <FAQ />
    </div>
  );
}
