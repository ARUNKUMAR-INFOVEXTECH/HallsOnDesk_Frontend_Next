'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Calendar, MessageCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { useLanding } from '@/components/landing/LandingContext';
import Hero from '@/components/landing/Hero';
import Problems from '@/components/landing/Problems';

export default function HomePage() {
  const { openDemoModal } = useLanding();

  const previewFeatures = [
    {
      icon: <Calendar className="h-5 w-5 text-[#EE9B00]" />,
      title: 'Interactive Event Calendar',
      desc: 'Visual timeline showing available and booked dates. Avoid embarrassing double-bookings instantly.'
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-[#EE9B00]" />,
      title: 'Automatic WhatsApp Alerts',
      desc: 'Send booking updates and digital receipts to clients automatically on WhatsApp.'
    },
    {
      icon: <CreditCard className="h-5 w-5 text-[#EE9B00]" />,
      title: 'Advance Payment Ledger',
      desc: 'Track UPI and cash advance payments, log expenses, and generate professional PDF bills.'
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <Hero onBookDemoClick={openDemoModal} />

      {/* 2. Problems & Old workflow comparison Section */}
      <Problems />

      {/* 3. Core Features Preview (Psychological Hook: Curiosity) */}
      <section className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-extrabold text-[#EE9B00] uppercase tracking-widest block">
              Core Modules
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Powerful Tools to Simplify Your Mandapam
            </h2>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              We replace confusing registers and messy papers with 8 specialized modules built specifically for Indian hall operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {previewFeatures.map((feat, i) => (
              <div 
                key={i}
                className="p-8 rounded-3xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-white hover:border-[#EE9B00]/40 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-5 shrink-0 shadow-sm">
                  {feat.icon}
                </div>
                <h3 className="font-extrabold text-[#0A2540] text-sm tracking-tight mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/features"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#EE9B00] hover:text-[#D48A00] transition-colors py-2 group"
            >
              Discover All 8 Core Modules 
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Founding Member Callout (Psychological Hook: Urgency & Scarcity) */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-[#EE9B00]/4 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EE9B00]/10 border border-[#EE9B00]/25 rounded-full text-[10px] font-bold text-[#D48A00] uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Exclusive Founder Partner Offer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Permanently Lock Your Subscription Rates
          </h2>
          <p className="text-xs sm:text-sm text-slate-550 max-w-xl mx-auto leading-relaxed font-semibold">
            We are extending special early-partner rates to the first 20 venues. Get lifetime price locks, VIP onboarding concierge, and direct feature requests.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/pricing"
              className="w-full sm:w-auto bg-[#0A2540] hover:bg-[#081D33] text-white text-xs font-extrabold px-7 py-3 rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              View Pricing Tiers & Slots
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openDemoModal}
              className="w-full sm:w-auto bg-white border border-slate-250 text-slate-700 hover:text-[#0A2540] text-xs font-bold px-7 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-sm"
            >
              Book Free Demo (₹0 Setup)
            </button>
          </div>
        </div>
      </section>

      {/* 5. Trust Signals (Psychological Hook: Social Proof) */}
      <section className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-extrabold text-[#EE9B00] uppercase tracking-widest block">
              Testimonials
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">
              Trusted by Leading Venue Owners
            </h2>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Read how mandapam operators across Tamil Nadu are digitizing their wedding season bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* Review 1 */}
            <div className="p-8 rounded-3xl border border-slate-200/80 bg-[#F8FAFC] space-y-5 shadow-sm">
              <div className="flex gap-1 text-[#EE9B00]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current shrink-0" />
                ))}
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed italic">
                "We used to write dates in register books, and once we had a double booking conflict. Since adopting Infovex Halls, our calendar is clean, and we check slots directly from our phones."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
                <div className="h-8 w-8 rounded-full bg-slate-200 text-[#0A2540] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-[11px] block leading-none">Sundaram P.</span>
                  <span className="text-[9px] text-slate-450 block mt-1 font-semibold">Owner, Sundar Mahal Palace • <span className="text-[#EE9B00] font-bold">Madurai</span></span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-8 rounded-3xl border border-slate-200/80 bg-[#F8FAFC] space-y-5 shadow-sm">
              <div className="flex gap-1 text-[#EE9B00]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current shrink-0" />
                ))}
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed italic">
                "Tracking customer payments and advance rentals was always chaotic. Now we log every receipt instantly. The pending collections alerts feature has saved us lakhs this season."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
                <div className="h-8 w-8 rounded-full bg-slate-200 text-[#0A2540] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  K
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-[11px] block leading-none">Karthik Raja</span>
                  <span className="text-[9px] text-slate-450 block mt-1 font-semibold">Manager, Sri Balaji Mandapam • <span className="text-[#EE9B00] font-bold">Chennai</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/why-us"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#EE9B00] hover:text-[#D48A00] transition-colors py-2 group"
            >
              Read More Success Stories
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Final Onboarding CTA Section */}
      <section className="py-24 bg-white flex items-center justify-center relative overflow-hidden">
        {/* Soft gold backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] bg-[#EE9B00]/4 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl w-full mx-6 bg-gradient-to-b from-white to-slate-50 text-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden border border-slate-200 text-center">
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-[#EE9B00]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight leading-tight">
              Ready to Digitize Your Marriage Hall Bookings?
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-semibold">
              Join marriage halls using Infovex Halls to manage registers, payments, staff tasks, and customer logs in one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6">
              <button
                onClick={openDemoModal}
                className="w-full sm:w-auto bg-[#EE9B00] hover:bg-[#D48A00] text-[#0A2540] h-12 px-8 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center hover:scale-[1.03] active:scale-95 shadow-[#EE9B00]/15"
              >
                Book Free Demo
              </button>
              <a
                href="mailto:info@infovex.in"
                className="w-full sm:w-auto flex items-center justify-center border border-slate-250 hover:bg-slate-50 text-slate-700 h-12 px-8 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.03]"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
