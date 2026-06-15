'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import Features from '@/components/landing/Features';

export default function FeaturesPage() {
  return (
    <div className="bg-white pt-24">
      {/* Page Header */}
      <div className="py-16 bg-[#F8FAFC] border-b border-slate-200/80 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EE9B00]/10 border border-[#EE9B00]/25 rounded-full text-[10px] font-bold text-[#D48A00] uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#EE9B00]" />
            Deep-Dive Modules
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0A2540] tracking-tight">
            Features Built for Indian Mandapams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-semibold">
            See how Infovex Halls helps venue owners manage billing, Subha Muhurtham schedules, staff tasks, and digital receipts in a secure cloud dashboard.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <Features />

      {/* Psychological Transition CTA */}
      <section className="py-20 bg-[#F8FAFC] text-center border-b border-slate-200/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] bg-[#EE9B00]/4 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Simple Pricing with Lifetime Discounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-550 max-w-lg mx-auto leading-relaxed font-semibold">
            Check our plans and see how our Founding Partner Program locks in your subscription pricing forever before slots sell out.
          </p>
          <div className="pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#081D33] text-white text-xs font-extrabold px-8 py-3 rounded-xl transition-all shadow-md hover:scale-[1.02]"
            >
              See Pricing & Claim Slot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
