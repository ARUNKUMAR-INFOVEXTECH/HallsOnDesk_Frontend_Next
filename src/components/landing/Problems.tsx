'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  Notebook, 
  Smartphone, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Users, 
  CreditCard, 
  Globe,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Problems() {
  const comparisonRows = [
    {
      category: 'BOOKING RECORDS',
      manual: {
        title: 'Manual Register Tracking',
        desc: 'Scribbling reservation dates in physical notebooks, leading to records getting damaged, lost, or misplaced.',
      },
      system: {
        title: 'Centralized Dashboard',
        desc: 'Verify bookings, view client directories, and monitor calendar tasks from any phone or laptop.',
        icon: <Calendar className="h-4.5 w-4.5 text-amber-600" />
      }
    },
    {
      category: 'SEASONAL SCHEDULES',
      manual: {
        title: 'Double Booking Risks',
        desc: 'Writing overlapping dates in diary pages, causing high-stress wedding day schedule conflicts during heavy seasons.',
      },
      system: {
        title: 'Professional Operations',
        desc: 'Coordinate decorators, catering staff, and managers with secure, role-gated operator accounts.',
        icon: <Users className="h-4.5 w-4.5 text-amber-600" />
      }
    },
    {
      category: 'CUSTOMER REACH',
      manual: {
        title: 'No Online Presence',
        desc: 'No customer website, forcing prospective clients to physically visit the hall to verify open dates.',
      },
      system: {
        title: 'Website Included',
        desc: 'Receive a dedicated, premium website for your hall with a public-facing availability calendar.',
        icon: <Globe className="h-4.5 w-4.5 text-amber-600" />
      }
    },
    {
      category: 'FINANCIAL SECURITY',
      manual: {
        title: 'Payment Confusion',
        desc: 'Losing track of client advance amounts, scattered tax receipts, and pending collection dates.',
      },
      system: {
        title: 'Payment Tracking',
        desc: 'Record UPI/cash advance payments, log expenses, and generate professional receipts instantly.',
        icon: <CreditCard className="h-4.5 w-4.5 text-amber-600" />
      }
    }
  ];

  return (
    <section className="py-28 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden" id="problems">
      {/* Background soft lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(238,155,0,0.03),transparent_50%)] pointer-events-none select-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
          <span className="text-[10px] font-extrabold text-[#159DFC] bg-[#E0F2FE] border border-[#159DFC]/20 rounded-full px-3.5 py-1 inline-block uppercase tracking-widest">
            The Venue Operator Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Still Managing Your Venue With Notebooks And WhatsApp?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-2xl mx-auto">
            Manual registers cost you time, double-bookings, and missing advance payments. Compare the manual chaos directly with Infovex Halls operations.
          </p>
        </div>

        {/* Row-by-Row Comparison Grid */}
        <div className="max-w-5xl mx-auto space-y-12">
          {comparisonRows.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group"
            >
              {/* Category Subheader */}
              <div className="flex items-center gap-2 mb-3.5 px-1">
                <span className="text-[9px] font-black text-slate-400 tracking-wider font-mono">
                  {row.category}
                </span>
                <div className="h-[1px] bg-slate-200 flex-1" />
              </div>

              {/* Row Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-11 items-center gap-4 lg:gap-6">
                
                {/* 1. Manual Chaos Card (Left Side) */}
                <div className="lg:col-span-5 bg-[#F8FAFC] border border-red-150/50 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden flex items-start gap-4">
                  {/* Left warning vertical line */}
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-red-400/30" />
                  
                  <div className="h-8 w-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500 shadow-sm mt-0.5">
                    <X className="h-4.5 w-4.5" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-700 text-sm leading-none block line-through decoration-red-400/40">
                      {row.manual.title}
                    </span>
                    <p className="text-xs text-slate-450 font-semibold leading-relaxed font-serif italic pt-1.5">
                      {row.manual.desc}
                    </p>
                  </div>
                </div>

                {/* 2. Dotted Transition Arrow (Center) */}
                <div className="lg:col-span-1 flex lg:flex-col items-center justify-center py-2 lg:py-0 select-none pointer-events-none">
                  {/* Dotted connector */}
                  <div className="hidden lg:block h-1 w-8 border-t-2 border-dotted border-slate-300" />
                  <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm my-1 group-hover:bg-[#159DFC]/10 group-hover:text-[#159DFC] group-hover:border-[#159DFC]/25 transition-all duration-300">
                    <ArrowRight className="h-3.5 w-3.5 rotate-90 lg:rotate-0" />
                  </div>
                  <div className="hidden lg:block h-1 w-8 border-t-2 border-dotted border-slate-300" />
                </div>

                {/* 3. Infovex Halls Solution Card (Right Side) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 hover:border-[#159DFC]/40 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-custom-md transition-all duration-300 flex items-start gap-4 group-hover:scale-[1.01]">
                  <div className="h-9 w-9 rounded-xl bg-[#E0F2FE] border border-[#159DFC]/15 flex items-center justify-center shrink-0 shadow-inner">
                    {row.system.icon}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0F172A] text-sm leading-none block">
                        {row.system.title}
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase tracking-wider">
                        Secure
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed pt-1.5">
                      {row.system.desc}
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Summary Tagline */}
        <div className="max-w-xl mx-auto mt-20 p-4 rounded-2xl bg-white border border-slate-200 shadow-premium flex items-center justify-center gap-3 text-[11px] font-bold text-slate-655 text-center">
          <ShieldCheck className="h-5 w-5 text-emerald-500 animate-pulse shrink-0" />
          <span>Infovex Halls maps real-time records, cloud syncing, and role-gated access in one unified platform.</span>
        </div>

      </div>
    </section>
  );
}
