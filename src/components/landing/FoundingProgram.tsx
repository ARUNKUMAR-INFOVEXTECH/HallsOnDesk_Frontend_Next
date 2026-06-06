'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Building, MapPin } from 'lucide-react';

interface FoundingProgramProps {
  onBookDemoClick: () => void;
}

export default function FoundingProgram({ onBookDemoClick }: FoundingProgramProps) {
  const benefits = [
    'Lifetime Discounted Pricing (₹999/mo instead of ₹1,499/mo)',
    'Priority Support with 2-Hour SLA Responses',
    'Direct Line to Product Advisory Team for Feature Requests',
    'Early Access to Premium Addons (Advanced SMS, Analytics, Invoicing)',
    '2 Months Free Maintenance and Upgrades',
  ];

  const focusDistricts = [
    'Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Salem',
    'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur', 'Thanjavur'
  ];

  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden" id="founding-program">
      {/* Absolute Glow indicators */}
      <div className="absolute -bottom-48 -left-48 h-96 w-96 bg-primary-light/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-48 -right-48 h-96 w-96 bg-primary-light/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Program Explanation & Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-primary-light uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-primary-light" />
              Limited Beta Opportunity
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Founding Hall Program
            </h2>
            
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              We are expanding across Tamil Nadu. The first <span className="text-primary-light font-bold">3 marriage halls</span> in each focus district will get lifetime onboarding privileges, discounted subscription rates, and custom feature developments.
            </p>

            {/* Benefits checks */}
            <div className="space-y-4 pt-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="h-5 w-5 rounded-full bg-primary-light/10 border border-primary-light/20 text-primary-light flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-slate-300 font-semibold leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={onBookDemoClick}
                className="py-2.5 px-6 rounded-lg text-xs font-bold bg-primary-light hover:bg-primary-light/90 text-primary transition-all duration-150 cursor-pointer inline-flex items-center gap-2 shadow-md border border-primary-light/80"
              >
                <Building className="h-4 w-4" />
                Apply for Founding Plan
              </button>
            </div>
          </div>

          {/* Right: Tamil Nadu Districts Focus Grid */}
          <div className="lg:col-span-5 bg-white/5 border border-slate-800 backdrop-blur-sm rounded-xl p-8">
            <h3 className="font-bold text-sm border-b border-slate-800 pb-3.5 mb-5 flex items-center gap-2 text-white">
              <MapPin className="h-4.5 w-4.5 text-primary-light" />
              Tamil Nadu Target Expansion
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-semibold">
              We are active in the following selected focus districts. Check slot availability by applying for a demo today.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {focusDistricts.map((district, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-3 bg-[#081D33]/40 border border-slate-800 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 transition-all cursor-default"
                >
                  <span className="h-1.5 w-1.5 bg-primary-light rounded-full shrink-0" />
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
