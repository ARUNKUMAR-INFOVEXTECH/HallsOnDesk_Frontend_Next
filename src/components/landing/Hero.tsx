'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Calendar, Users, DollarSign, ArrowRight, Globe } from 'lucide-react';

interface HeroProps {
  onBookDemoClick: () => void;
}

export default function Hero({ onBookDemoClick }: HeroProps) {
  // Mock data for dashboard graphic preview
  const mockStats = [
    { label: 'Confirmed Bookings', value: '38', change: '+12%', icon: Calendar },
    { label: 'Total Revenue', value: '₹4.82L', change: '+24%', icon: DollarSign },
    { label: 'Pending Collections', value: '₹1.15L', change: '-4%', icon: Users },
  ];

  const mockBookings = [
    { name: 'Arun & Divya Wedding', date: 'June 18, 2026', type: 'Muhurtham', amount: '₹1,20,000', status: 'Confirmed', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Priya Birthday Party', date: 'June 20, 2026', type: 'Reception', amount: '₹45,000', status: 'Pending', statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Infovex Corporate Meet', date: 'June 24, 2026', type: 'Conferencing', amount: '₹95,000', status: 'Confirmed', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ];

  return (
    <section className="relative pt-36 pb-28 overflow-hidden bg-[#0A192F] text-center">
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2E44_1px,transparent_1px),linear-gradient(to_bottom,#1E2E44_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Subtle Gold Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[500px] bg-[#EE9B00]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 space-y-8 relative z-10 flex flex-col items-center">
        {/* Top Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EE9B00]/10 border border-[#EE9B00]/20 rounded-full text-[10px] font-bold text-[#EE9B00] uppercase tracking-widest"
        >
          <Sparkles className="h-3 w-3 text-[#EE9B00]" />
          Tamil Nadu's Premium Marriage Hall SaaS
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] max-w-4xl"
        >
          Manage Your Marriage Hall Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-[#EE9B00]">In One Place</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-350 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Bookings, Payments, Calendar operations, Staff schedules, and Customer CRM built specifically for modern Venue owners.
        </motion.p>

        {/* CTA Controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto"
        >
          <button
            onClick={onBookDemoClick}
            className="w-full sm:w-auto bg-[#EE9B00] hover:bg-[#D48A00] text-white h-11 px-6 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            Book Free Demo
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full sm:w-auto hover:bg-[#1E2E44] text-slate-300 hover:text-white border border-[#1E2E44] h-11 px-6 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-[#071426]/30"
          >
            <Play className="h-3.5 w-3.5 fill-slate-300 stroke-none" />
            Login to Platform
          </button>
        </motion.div>

        {/* Floating Mockup Card Below CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full pt-10"
        >
          <div className="relative border border-[#1E2E44] rounded-xl bg-[#071426] shadow-2xl p-1.5 overflow-hidden max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#EE9B00]/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            
            {/* Inner Dashboard Frame Mockup */}
            <div className="bg-[#0A192F] border border-[#1E2E44]/40 rounded-lg overflow-hidden flex flex-col text-[11px] leading-relaxed text-left select-none text-slate-400">
              
              {/* Header Strip */}
              <div className="h-10 border-b border-[#1E2E44] bg-[#071426] px-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-lg bg-[#071426] flex items-center justify-center border border-[#1E2E44] shrink-0">
                    <Globe className="h-3.5 w-3.5 text-[#EE9B00]" />
                  </div>
                  <span className="font-bold text-slate-200">Raj Mahal Palace console</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Active Live</span>
                </div>
              </div>

              {/* Dashboard Metrics grid */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {mockStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="border border-[#1E2E44] bg-[#071426]/60 rounded-lg p-3">
                      <div className="flex justify-between items-center text-slate-500 mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
                        <Icon className="h-3.5 w-3.5 text-slate-550 shrink-0" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-100 text-sm leading-none">{stat.value}</span>
                        <span className="text-[8px] font-bold text-emerald-500">{stat.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main mock grid */}
              <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Table */}
                <div className="md:col-span-3 border border-[#1E2E44] bg-[#071426]/40 rounded-lg p-4">
                  <div className="font-bold text-slate-350 text-[10px] uppercase tracking-wider mb-3">Upcoming Weddings</div>
                  <div className="space-y-2">
                    {mockBookings.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border border-[#1E2E44]/30 hover:bg-[#071426]/30 rounded-lg transition-colors text-[10px]">
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-200 block truncate">{b.name}</span>
                          <span className="text-slate-500 block truncate mt-0.5">{b.date} • {b.type}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-300 block">{b.amount}</span>
                          <span className={`inline-block px-1.5 py-0.2 rounded border mt-0.5 text-[8px] font-bold ${b.statusColor}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar rate info */}
                <div className="md:col-span-2 space-y-3">
                  <div className="border border-[#1E2E44] bg-[#071426]/40 rounded-lg p-4 flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <div className="font-bold text-slate-350 text-[10px] uppercase tracking-wider">Capacity limits</div>
                      <div className="text-[10px] text-slate-500 mt-1">800 Guests Limit</div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold mb-1.5">
                        <span>Usage Rate</span>
                        <span>68% Filled</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#EE9B00] rounded-full w-[68%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
