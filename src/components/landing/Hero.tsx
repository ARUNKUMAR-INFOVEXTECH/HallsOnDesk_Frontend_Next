'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, ArrowRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DashboardMockup from './DashboardMockup';

interface HeroProps {
  onBookDemoClick: () => void;
}

export default function Hero({ onBookDemoClick }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showDashboard = mounted && isAuthenticated;

  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-white text-center">
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Beautiful Multi-Colored Radial Backdrop Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 h-[350px] w-[350px] bg-blue-400/5 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[450px] w-[650px] bg-[#EE9B00]/4 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 space-y-8 relative z-10 flex flex-col items-center">
        
        {/* Top Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 px-4.5 py-1.5 bg-[#EE9B00]/10 border border-[#EE9B00]/25 rounded-full text-[10px] font-extrabold text-[#D48A00] uppercase tracking-widest shadow-md backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#EE9B00]" />
          India's First Dedicated Marriage Hall CRM
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0A2540] tracking-tight leading-[1.08] max-w-4xl font-display"
        >
          India's First Dedicated Marriage Hall <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-[#EE9B00]">CRM & ERP</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Ditch notebook registers. Automate booking logs, calendar schedules, WhatsApp updates, and client accounts in one premium, secure cloud dashboard.
        </motion.p>

        {/* CTA Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto"
        >
          {showDashboard ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#EE9B00] hover:bg-[#D48A00] text-[#0A2540] h-12 px-8 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[#EE9B00]/20 hover:scale-[1.03] flex items-center justify-center gap-2 shadow-[#EE9B00]/15"
            >
              Go to Dashboard
              <ArrowRight className="h-4.5 w-4.5 font-bold" />
            </Link>
          ) : (
            <>
              <button
                onClick={onBookDemoClick}
                className="w-full sm:w-auto bg-[#EE9B00] hover:bg-[#D48A00] text-[#0A2540] h-12 px-8 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[#EE9B00]/20 hover:scale-[1.03] flex items-center justify-center gap-2 shadow-[#EE9B00]/15"
              >
                Book Free Demo & Claim Slot
                <ArrowRight className="h-4.5 w-4.5 font-bold" />
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full sm:w-auto bg-white text-slate-650 hover:text-slate-900 border border-slate-250 h-12 px-8 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:scale-[1.03]"
              >
                <Play className="h-3 w-3 fill-slate-500 stroke-none" />
                Login to Platform
              </button>
            </>
          )}
        </motion.div>

        {/* Social Proof / Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="pt-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[9px] text-slate-400 font-extrabold uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#EE9B00] rounded-full animate-ping" />
            Loved by 14+ Tamil Nadu Venues
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#EE9B00] rounded-full" />
            No Credit Card Required
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#EE9B00] rounded-full" />
            ₹0 Onboarding Setup to Demo
          </div>
        </motion.div>

        {/* Floating Mockup Card (Dashboard Screen Embed with interactive overlay badges) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.48, ease: 'easeOut' }}
          className="w-full pt-12 relative max-w-5xl mx-auto"
        >
          {/* Glowing border element */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-[#EE9B00]/5 to-purple-500/5 blur-3xl pointer-events-none" />
          
          <div className="relative border border-slate-200 rounded-2xl bg-white shadow-2xl p-2.5 overflow-visible group">
            {/* Ambient inner glows */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#EE9B00]/3 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400/3 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Interactive Badge 1: WhatsApp notification bubble */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 md:-left-12 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex items-center gap-3 z-20 max-w-[200px] text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-600 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">WhatsApp</span>
                <span className="block text-[10px] text-[#0A2540] font-bold mt-0.5">Booking Alert Sent!</span>
              </div>
            </motion.div>

            {/* Interactive Badge 2: Onboarding success badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-6 md:-right-10 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex items-center gap-3 z-20 max-w-[190px] text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200 text-blue-600 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Cloud Security</span>
                <span className="block text-[10px] text-[#0A2540] font-bold mt-0.5">SSL Secured Sync</span>
              </div>
            </motion.div>

            {/* Mockup Component itself */}
            <DashboardMockup />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
