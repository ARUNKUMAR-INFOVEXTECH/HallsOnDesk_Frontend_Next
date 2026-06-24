'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Building, MapPin, Lock } from 'lucide-react';

interface FoundingProgramProps {
  onBookDemoClick: () => void;
}

export default function FoundingProgram({ onBookDemoClick }: FoundingProgramProps) {
  const benefits = [
    'Lifetime Founder Price Lock (Save thousands as monthly rates scale in the future)',
    'Direct Feature Request Influence (Request custom modules built directly for your hall)',
    'VIP Onboarding Concierge (We import your ledger books, calendars, and vendor directories)',
    'Interactive Staff Training (Step-by-step webinars for managers, owner operators, and clerks)',
    'Priority Slack & WhatsApp Hotline (Bypass queues with sub-2-hour SLA support)',
  ];

  const focusDistricts = [
    'Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Salem',
    'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur', 'Thanjavur'
  ];

  return (
    <section className="py-28 bg-white border-b border-slate-200/80 text-slate-800 relative overflow-hidden" id="founding-program">
      {/* Absolute Glow indicators */}
      <div className="absolute -bottom-48 -left-48 h-96 w-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-48 -right-48 h-96 w-96 bg-[#159DFC]/2 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left: Program Explanation & Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-[#002499] uppercase tracking-widest backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#159DFC]" />
              Founding Hall Partner Program
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] leading-tight font-display">
              Co-Design the Future of Mandapam Operations
            </h2>
            
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              We are expanding across Tamil Nadu. The first <span className="text-[#159DFC] font-extrabold">20 partner venues</span> get lifetime onboarding privileges, permanently locked subscription rates, and custom feature developments designed specifically for their business.
            </p>

            {/* Benefits checks */}
            <div className="space-y-4 pt-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="h-5.5 w-5.5 rounded-full bg-[#159DFC]/10 border border-[#159DFC]/25 text-[#159DFC] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-slate-650 font-semibold leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={onBookDemoClick}
                className="py-3 px-7 rounded-xl text-xs font-extrabold bg-[#159DFC] hover:bg-[#002499] text-[#0F172A] transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-[#159DFC]/20 hover:scale-[1.03] active:scale-95 border border-[#159DFC]/25 shadow-[#159DFC]/10"
              >
                <Lock className="h-4 w-4" />
                Claim Your Founder Slot
              </button>
            </div>
          </div>

          {/* Right: Tamil Nadu Districts Focus Grid */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200/80 backdrop-blur-md rounded-2xl p-8 shadow-xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#159DFC]/3 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="font-bold text-sm border-b border-slate-200/80 pb-3.5 mb-5 flex items-center gap-2 text-[#0F172A]">
              <MapPin className="h-4.5 w-4.5 text-[#159DFC] shrink-0" />
              Tamil Nadu Launch Districts
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed font-semibold">
              Slots are allocated across focus districts. Request a demo to check if your district has remaining Founder Partner vacancies.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {focusDistricts.map((district, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3.5 py-3 bg-white border border-slate-200/60 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-650 transition-all duration-200 cursor-default hover:border-[#159DFC]/25"
                >
                  <span className="h-1.5 w-1.5 bg-[#159DFC] rounded-full shrink-0" />
                  {district}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
