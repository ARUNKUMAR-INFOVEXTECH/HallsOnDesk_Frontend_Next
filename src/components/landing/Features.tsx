'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Calendar,
  Users,
  CreditCard,
  UserCheck,
  TrendingUp,
  MessageCircle,
  Globe,
} from 'lucide-react';

export default function Features() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section className="py-28 bg-white border-b border-slate-200/80 relative overflow-hidden" id="features">
      {/* Background spot glows */}
      <div className="absolute top-1/4 right-0 h-[400px] w-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 h-[400px] w-[400px] bg-[#159DFC]/4 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-extrabold text-[#159DFC] uppercase tracking-widest block">
            Features & Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Everything Your Hall Needs In One Dashboard
          </h2>
          <p className="text-sm text-slate-550 font-semibold leading-relaxed">
            Infovex Halls maps entire wedding hall workflows into a single system, removing the need for papers, manual audits, and chaotic phone calls.
          </p>
        </div>

        {/* Features Bento Grid (Vice-Versa: Navy outer cards with White inner mockups) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Card 1: Booking Management */}
          <motion.div
            custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Booking Management</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Create bookings, record hall rentals, lock dates, assign session details, and track statuses from pending to completed.
              </p>
            </div>
            
            {/* Visual element: Mini Booking Card (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 text-[10px] text-slate-550 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-800">Booking #1042</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[8px] uppercase tracking-wider">Confirmed</span>
              </div>
              <div className="h-[1px] bg-slate-200" />
              <div className="flex justify-between font-semibold">
                <span>Rajesh Weds Swetha</span>
                <span className="text-slate-800 font-bold">12 Jun 2026</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Interactive Event Calendar */}
          <motion.div
            custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 lg:col-span-2 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Interactive Event Calendar</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                A full visual timeline displaying booking schedules. Quickly inspect date availability and avoid booking overlaps.
              </p>
            </div>

            {/* Visual element: Mini Timeline calendar row (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-[10px] text-slate-500 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-extrabold text-slate-800">Availability Timeline</span>
                <span className="text-[9px] font-bold text-[#159DFC]">June 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-bold">
                {['10', '11', '12', '13', '14', '15', '16'].map((day, i) => (
                  <div key={day} className={`p-1.5 rounded-xl border ${
                    i === 2 
                      ? 'bg-[#159DFC]/10 border-[#159DFC]/25 text-[#159DFC] font-extrabold'
                      : i === 4
                      ? 'bg-blue-500/10 border-blue-500/25 text-blue-600 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}>
                    <span className="block text-[8px] opacity-65">S</span>
                    <span className="block text-[10px] mt-0.5">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Payment Tracking */}
          <motion.div
            custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Payment Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Log cash or digital receipts, calculate remaining balances, and trigger automatic reminders for unpaid amounts.
              </p>
            </div>

            {/* Visual element: Mini Invoice slip (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 text-[10px] text-slate-500 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-[9px]">
                <span className="font-extrabold uppercase tracking-wider text-slate-400">Transaction log</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">Success</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 text-sm">₹25,000</span>
                <span className="font-semibold text-slate-400">Advance Paid</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1">
                <div className="bg-[#159DFC] h-full rounded-full w-[45%]" />
              </div>
            </div>
          </motion.div>

          {/* Card 4: WhatsApp Integration */}
          <motion.div
            custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 lg:col-span-2 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">WhatsApp Integration</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Automatically dispatch booking confirmations, payment receipts, and balance reminders to clients directly on WhatsApp.
              </p>
            </div>

            {/* Visual element: Mini WhatsApp chat bubble (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-[10px] text-slate-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-405 text-[9px] uppercase tracking-wider">WhatsApp Auto Dispatcher</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 max-w-[280px]">
                <span className="font-bold text-slate-700 block text-[9.5px]">Infovex Halls Bot</span>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal">
                  "Dear Suresh, your booking at Raj Mahal for 12/06/2026 is confirmed. Advance ₹25,000 received. Thank you!"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Website Integration */}
          <motion.div
            custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Website Integration</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Get a dedicated public website for your hall. Allow prospective clients to view your hall features and send enquiry requests online.
              </p>
            </div>

            {/* Visual element: Mini website browser tab (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-100 px-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500/85" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/85" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/85" />
              </div>
              <div className="p-3 text-[9px] text-slate-500 space-y-1.5">
                <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">www.rajmahalpalace.com</span>
                <span className="text-[8px] font-extrabold text-[#159DFC] uppercase tracking-wider block">Interactive Availability Log</span>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Customer Directory */}
          <motion.div
            custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Customer Directory</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Build detailed client archives. Search by phone, view event histories, check receipts, and access contact records.
              </p>
            </div>

            {/* Visual element: Mini customer list (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 text-[9px] text-slate-500 space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-extrabold uppercase tracking-wider text-slate-400">Clients</span>
                <span className="text-[#159DFC] font-bold">140 Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[8px] text-[#0F172A]">A</div>
                <div className="font-semibold leading-tight">
                  <span className="block text-slate-800 font-extrabold">Anand Kumar</span>
                  <span className="block text-[8px] text-slate-450 font-semibold">+91 91234 56789</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 7: Staff Management */}
          <motion.div
            custom={6} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Staff Management</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Add sub-logins for managers and cleaning staff. Gated authorization limits data viewing based on designated roles.
              </p>
            </div>

            {/* Visual element: Mini Staff Gated options (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 text-[9px] text-slate-500 space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-extrabold uppercase tracking-wider text-slate-400">Operator profiles</span>
                <span className="text-emerald-600 font-bold bg-white px-1 rounded border border-slate-200">Gated</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Owner Dashboard</span>
                <span className="text-emerald-600 font-bold">Full Access</span>
              </div>
              <div className="flex justify-between items-center text-slate-455">
                <span>Manager Login</span>
                <span>Limited</span>
              </div>
            </div>
          </motion.div>

          {/* Card 8: Reports & Insights */}
          <motion.div
            custom={7} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={cardVariants}
            className="border border-slate-800/60 bg-[#0F172A] hover:bg-[#062089] hover:border-[#159DFC]/45 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between cursor-default group col-span-1 shadow-lg"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/5 text-[#159DFC] flex items-center justify-center mb-5 border border-white/10 shadow-sm transition-colors duration-300 group-hover:bg-[#159DFC] group-hover:text-[#0F172A] group-hover:border-[#159DFC]/25">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight mb-2">Reports & Insights</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                Inspect metrics on total earnings, pending collections, tax rates, and monthly collections via clean chart cards.
              </p>
            </div>

            {/* Visual element: Mini Sparkline graph (White) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 text-[9px] text-slate-550 space-y-2 shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-extrabold uppercase tracking-wider text-slate-400">Revenue MoM</span>
                <span className="text-emerald-600 font-bold">+18.4%</span>
              </div>
              <div className="flex items-end gap-1 h-8 pt-1.5">
                <div className="bg-slate-200 h-2 w-3 rounded-sm" />
                <div className="bg-slate-200 h-3.5 w-3 rounded-sm" />
                <div className="bg-slate-300 h-5 w-3 rounded-sm" />
                <div className="bg-slate-200 h-4 w-3 rounded-sm" />
                <div className="bg-[#159DFC] h-7 w-3 rounded-sm animate-pulse" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
