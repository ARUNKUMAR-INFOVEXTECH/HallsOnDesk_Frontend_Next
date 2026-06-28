'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  Notebook, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Users, 
  CreditCard, 
  Globe,
  ArrowRight,
  Sparkles,
  Lock,
  FileSpreadsheet
} from 'lucide-react';

export default function Problems() {
  const manualProblems = [
    {
      title: 'High Double-Booking Risk',
      desc: 'Scribbling event reservations on paper diary pages leads to overlapping dates and high-stress wedding day conflicts.'
    },
    {
      title: 'Scattered Payment Tracking',
      desc: 'Unrecorded advance tokens, lost tax receipts, and payment logs scribbled in separate notebooks make tracking accounting chaotic.'
    },
    {
      title: 'No Digital Footprint',
      desc: 'No online availability page, forcing prospective brides and grooms to physically travel to the venue to check open slots.'
    },
    {
      title: 'GST Invoice Stress',
      desc: 'Manually calculating split CGST/SGST tax bills and spending hours sorting spreadsheets for GSTR-1 filing.'
    }
  ];

  const systemSolutions = [
    {
      icon: <Calendar className="h-4.5 w-4.5 text-emerald-500" />,
      title: 'Conflict-Free Calendar Scheduling',
      desc: 'Our engine automatically blocks double-bookings and highlights auspicious Muhurtham dates for premium pricing.'
    },
    {
      icon: <CreditCard className="h-4.5 w-4.5 text-emerald-500" />,
      title: 'Automated Billing & Ledger',
      desc: 'Track UPI advances and security deposits with an automatic billing ledger that generates split CGST/SGST invoice sheets.'
    },
    {
      icon: <Globe className="h-4.5 w-4.5 text-emerald-500" />,
      title: 'Dynamic Venue Website',
      desc: 'Includes a customized public booking website so clients can view calendar availability and send enquiries 24/7.'
    },
    {
      icon: <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />,
      title: 'GSTR-1 Excel Exporter',
      desc: 'Generate tax-ready invoices and download structured GSTR-1 reports for your auditor in one click.'
    }
  ];

  return (
    <section className="py-28 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden" id="problems">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 h-[350px] w-[350px] bg-red-500/3 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 h-[350px] w-[350px] bg-emerald-500/3 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-extrabold text-[#159DFC] bg-blue-50 border border-[#159DFC]/20 rounded-full px-3.5 py-1 inline-block uppercase tracking-widest">
            The Venue Operator Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Still Managing Auspicious Booking Seasons with Paper Registers?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-2xl mx-auto">
            Traditional notebooks and WhatsApp threads cost mandapam owners hours in lost time, double-booking errors, and missing advance payments.
          </p>
        </div>

        {/* Split Screen Panel Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Panel: The Manual Registry Chaos */}
          <div className="bg-red-50/20 border border-red-200/50 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-sm">
            {/* Visual Diary Header decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-400/40" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-red-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
                  <Notebook className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Traditional Register Book</h3>
                  <p className="text-[10px] text-red-700 font-black uppercase tracking-wider mt-0.5">High-Stress Manual Chaos</p>
                </div>
              </div>

              <div className="space-y-5">
                {manualProblems.map((prob, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <X className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 block leading-tight">{prob.title}</span>
                      <p className="text-[11px] text-slate-550 leading-relaxed font-medium">{prob.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-red-100 flex items-center gap-2 text-[10px] text-red-700 font-bold leading-none">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Prone to human errors, lost receipts, and calendar blindspots.</span>
            </div>
          </div>

          {/* Right Panel: The Infovex Halls Digital Console */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
            {/* Visual Header decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#159DFC]" />
            <div className="absolute -right-20 -top-20 w-44 h-44 bg-[#159DFC]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[#159DFC] shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm tracking-tight">Infovex Halls Workspace</h3>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider mt-0.5">Secure Cloud Platform</p>
                </div>
              </div>

              <div className="space-y-5">
                {systemSolutions.map((sol, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="h-5 w-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-100 block leading-tight">{sol.title}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{sol.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] text-emerald-400 font-bold leading-none z-10">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Multi-tenant isolation and row-level database security.</span>
            </div>
          </div>

        </div>

        {/* Bottom CTA Hook */}
        <div className="max-w-xl mx-auto mt-16 p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-3 text-[11.5px] font-bold text-slate-655 text-center leading-relaxed">
          <Sparkles className="h-4.5 w-4.5 text-[#159DFC] shrink-0" />
          <span>Transform your offline register books into a dynamic operations hub today.</span>
        </div>

      </div>
    </section>
  );
}
