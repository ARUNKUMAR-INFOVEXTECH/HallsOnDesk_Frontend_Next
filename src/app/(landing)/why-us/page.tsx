'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanding } from '@/components/landing/LandingContext';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';

export default function WhyUsPage() {
  const { openDemoModal } = useLanding();

  return (
    <div className="bg-[#F8FAFC] pt-24">
      {/* Page Header */}
      <div className="py-16 bg-white border-b border-slate-200/80 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#159DFC]/10 border border-[#159DFC]/25 rounded-full text-[10px] font-bold text-[#002499] uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#159DFC]" />
            Trust & Security
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Built for Indian Wedding Seasons
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 max-w-xl mx-auto leading-relaxed font-semibold">
            Discover how we customize our calendar grids, tax reports, and WhatsApp notifications specifically for the unique workflow of Indian marriage hall operators.
          </p>
        </div>
      </div>

      {/* Why Us Component */}
      <WhyUs />

      {/* Testimonials Component */}
      <Testimonials />

      {/* Final Action Callout */}
      <section className="py-24 bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-[#159DFC]/4 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Ready to Try India's First dedicated Mandapam ERP?
          </h2>
          <p className="text-xs sm:text-sm text-slate-550 max-w-lg mx-auto leading-relaxed font-semibold">
            See the platform live. Set up your operator login, import your ledger registries, and launch your customer-facing website in less than 24 hours.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={openDemoModal}
              className="w-full sm:w-auto bg-[#159DFC] hover:bg-[#002499] text-[#0F172A] h-12 px-8 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center hover:scale-[1.03] active:scale-95 shadow-[#159DFC]/15"
            >
              Book Free Demo
            </button>
            <a
              href="mailto:info@infovex.in"
              className="w-full sm:w-auto flex items-center justify-center border border-slate-250 hover:bg-slate-50 text-slate-700 h-12 px-8 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.03]"
            >
              Email Customer Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
