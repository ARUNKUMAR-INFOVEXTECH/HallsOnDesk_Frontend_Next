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
    <section className="py-24 bg-white border-b border-gray-150" id="why-us">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text & Trust Branding */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light/10 rounded-full text-[10px] font-bold text-primary-light uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5 text-primary-light" />
              Tailored For You
            </div>
            
            <h2 className="text-3xl font-bold text-primary tracking-tight leading-tight">
              Built Specifically For Indian Marriage Halls
            </h2>
            
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Unlike generic CRM databases or complex Western scheduling engines, HallsOnDesk is customized for the Subha Muhurtham calendars, local tax structures, and operational flows of marriage hall operators.
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center lg:justify-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-slate-800">
                OD
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Security Guaranteed By</span>
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
                  className="border border-slate-200 bg-slate-50/20 hover:bg-slate-50/65 rounded-xl p-5 hover:shadow-sm hover:border-slate-300 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center mb-4 shrink-0 border border-primary-light/10 shadow-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1.5 leading-snug">{reason.title}</h3>
                  <p className="text-xs text-slate-550 font-semibold leading-relaxed">{reason.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
