'use client';

import React from 'react';
import { Landmark, Compass, HeartHandshake, Sparkles, ShieldCheck } from 'lucide-react';

export default function WhyUs() {
  const reasons = [
    {
      title: 'Tamil Nadu Localized Focus',
      desc: 'Built specifically keeping Tamil marriage seasons, Subha Muhurtham dates, and localized venue billing calculations in mind.',
      icon: Compass,
    },
    {
      title: 'Direct Phone & Local Support',
      desc: 'Get fast phone assistance in Tamil and English from representatives who understand the venue operating context.',
      icon: HeartHandshake,
    },
    {
      title: 'No Tech Experience Needed',
      desc: 'Clean interfaces designed for simplicity. Managers and hall cleaners can view schedules and register booking details easily.',
      icon: Sparkles,
    },
    {
      title: 'Affordable Pricing Strategy',
      desc: 'Save on subscription rentals. Simple pricing blocks designed specifically to make digitizing small community halls viable.',
      icon: Landmark,
    },
  ];

  return (
    <section className="py-28 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden" id="why-us">
      {/* Background spot glows */}
      <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left: Text & Trust Branding */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-[#D48A00] uppercase tracking-widest shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-[#EE9B00]" />
              Tailored For You
            </div>
            
            <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight leading-tight font-display">
              Built Specifically For Indian Marriage Halls
            </h2>
            
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Unlike generic CRM databases or complex Western scheduling engines, Infovex Halls is customized for the Subha Muhurtham calendars, local tax structures, and operational flows of marriage hall operators.
            </p>

            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center lg:justify-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#0A2540] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-inner border border-slate-300">
                IH
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Security Guaranteed By</span>
                <span className="text-xs font-bold text-slate-700 block mt-1.5">Infovex Technologies</span>
              </div>
            </div>
          </div>

          {/* Right: Feature Grid Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 bg-white hover:bg-[#F8FAFC]/30 rounded-2xl p-6.5 hover:shadow-md hover:border-[#EE9B00]/25 transition-all duration-300 group backdrop-blur-sm"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#F8FAFC] text-[#EE9B00] flex items-center justify-center mb-5 shrink-0 border border-slate-200 shadow-sm group-hover:bg-[#EE9B00] group-hover:text-[#0A2540] group-hover:border-[#EE9B00]/25 transition-colors duration-300">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-extrabold text-[#0A2540] text-sm mb-2 leading-snug">{reason.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{reason.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
