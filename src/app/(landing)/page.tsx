'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  Lock, 
  HelpCircle, 
  AlertTriangle,
  Info,
  Layers,
  FileSpreadsheet,
  Users2,
  ChevronDown
} from 'lucide-react';
import { useLanding } from '@/components/landing/LandingContext';
import Hero from '@/components/landing/Hero';
import Problems from '@/components/landing/Problems';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';

export default function HomePage() {
  const { openDemoModal } = useLanding();
  const [simDate, setSimDate] = useState<'regular' | 'muhurtham'>('muhurtham');

  const coreModules = [
    {
      icon: <Calendar className="h-5 w-5 text-[#159DFC]" />,
      title: 'Interactive Event Calendar',
      desc: 'Visual timeline showing available and booked dates. Avoid embarrassing double-bookings instantly.'
    },
    {
      icon: <Sparkles className="h-5 w-5 text-[#159DFC]" />,
      title: 'Astro-Muhurtham Badges',
      desc: 'Spot high-demand astrological dates instantly on the calendar grid to block discounts.'
    },
    {
      icon: <Layers className="h-5 w-5 text-[#159DFC]" />,
      title: 'Multi-Hall Management',
      desc: 'Seamlessly switch between multiple wedding halls and banquets from one consolidated profile.'
    },
    {
      icon: <CreditCard className="h-5 w-5 text-[#159DFC]" />,
      title: 'Advance Rental Ledger',
      desc: 'Record customer advance amounts, UPI/cash transactions, and split payments.'
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-[#159DFC]" />,
      title: 'GSTR-1 Tax Exports',
      desc: 'Generate tax-compliant GST invoices and download GSTR-1 Excel reports for accounting.'
    },
    {
      icon: <Users2 className="h-5 w-5 text-[#159DFC]" />,
      title: 'Staff Access Controls',
      desc: 'Set custom permissions for managers, cleaners, decorators, and billing clerks.'
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-[#159DFC]" />,
      title: 'Automated WhatsApp Updates',
      desc: 'Send digital booking summaries, payment confirmations, and reminders to clients.'
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-[#159DFC]" />,
      title: 'Row Level Security',
      desc: 'Bank-grade database partitioning ensuring your bookings and billing logs remain fully private.'
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <Hero onBookDemoClick={openDemoModal} />

      {/* 2. Problems Section */}
      <Problems />

      {/* 3. Live Interactive Astro-Muhurtham Simulator (Conversion Hook) */}
      <section className="py-24 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden">
        <div className="absolute top-1/3 left-0 h-[300px] w-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1 uppercase tracking-widest inline-block">
              Interactive Preview
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Protect Your Profits on Auspicious Dates
            </h2>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Test how the booking dashboard identifies peak demand Muhurtham dates in real-time to alert your staff.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Control Panel (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Test Date</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Toggle the dates below to observe how the CRM alters the booking instructions.
                </p>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => setSimDate('regular')}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      simDate === 'regular'
                        ? 'border-[#159DFC] bg-blue-50/30'
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-800">15 October 2026</span>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Regular Weekday</span>
                    </div>
                    {simDate === 'regular' && <div className="h-2 w-2 rounded-full bg-[#159DFC]" />}
                  </button>

                  <button
                    onClick={() => setSimDate('muhurtham')}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      simDate === 'muhurtham'
                        ? 'border-amber-400 bg-amber-50/20'
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-800">08 November 2026</span>
                      <span className="block text-[10px] text-amber-700 font-extrabold mt-0.5 flex items-center gap-1">
                        🌟 Auspicious Muhurtham Day
                      </span>
                    </div>
                    {simDate === 'muhurtham' && <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-450 font-semibold leading-none">
                <Info className="h-4.5 w-4.5 text-[#159DFC]" />
                <span>Live demo of our Astro-Muhurtham engine.</span>
              </div>
            </div>

            {/* Simulated UI Screen (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-5 text-left flex flex-col justify-between min-h-[300px]">
              <div>
                {/* Browser bar mimic */}
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4 text-[9px] font-mono text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-bold">infovexhalls.in/bookings/new</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>New Client Booking Log</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] uppercase tracking-wide text-slate-300 font-mono">
                      Venue ID: HOD-MDR02
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Date Selected</span>
                      <span className="block text-slate-200 font-bold mt-0.5">
                        {simDate === 'regular' ? '15 October 2026' : '08 November 2026'}
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Venue Area</span>
                      <span className="block text-slate-200 font-bold mt-0.5">Main Mandapam</span>
                    </div>
                  </div>

                  {/* Warning Alerts Simulation */}
                  {simDate === 'muhurtham' ? (
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-4 flex gap-3 text-xs"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-amber-500 block">🌟 Auspicious Muhurtham Date (Peak Demand)</span>
                        <p className="text-[10.5px] text-amber-250/90 leading-relaxed font-medium">
                          This is a high-demand astrological date. Instruct booking staff to charge full premium rates. **Do not apply discount concessions.**
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex gap-3 text-xs"
                    >
                      <Info className="h-5 w-5 text-[#159DFC] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-[#159DFC] block">Standard Booking Date</span>
                        <p className="text-[10.5px] text-blue-200/90 leading-relaxed font-medium">
                          No peak demand detected. Apply standard pricing schedules and regular package rules.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <button className="bg-[#159DFC] hover:bg-[#002499] text-[#0F172A] text-[9.5px] font-black px-4 py-2 rounded-lg transition-colors cursor-pointer">
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete Modules List (Grid) */}
      <section className="py-28 bg-white border-b border-slate-200/80 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-extrabold text-[#159DFC] uppercase tracking-widest block">
              Core Modules
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Powerful Tools to Simplify Your Mandapam
            </h2>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              We replace confusing registers and messy papers with 8 specialized modules built specifically for Indian hall operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreModules.map((feat, i) => (
              <div 
                key={i}
                className="p-6.5 rounded-2xl border border-slate-200 bg-white hover:border-[#159DFC]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center mb-5 shrink-0">
                    {feat.icon}
                  </div>
                  <h3 className="font-extrabold text-[#0F172A] text-xs tracking-tight mb-2.5">{feat.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Tiers Section */}
      <Pricing onBookDemoClick={openDemoModal} />

      {/* 6. Social Proof / Testimonials */}
      <Testimonials />

      {/* 7. FAQs Accordion */}
      <FAQ />

      {/* 8. Final Conversion Banner */}
      <section className="py-24 bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] bg-[#159DFC]/4 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl w-full mx-6 bg-gradient-to-b from-white to-slate-50 text-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden border border-slate-200 text-center">
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-[#159DFC]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Ready to Digitize Your Marriage Hall Bookings?
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-semibold">
              Join marriage halls using Infovex Halls to manage registers, payments, staff tasks, and customer logs in one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6">
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
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
