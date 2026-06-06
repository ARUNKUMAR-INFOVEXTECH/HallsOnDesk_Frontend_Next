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
} from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      title: 'Booking Management',
      desc: 'Create bookings, record hall rentals, lock dates, assign session details, and track statuses from pending to completed.',
      icon: CalendarDays,
    },
    {
      title: 'Interactive Event Calendar',
      desc: 'A full visual timeline displaying booking schedules. Quickly inspect date availability and avoid booking overlaps.',
      icon: Calendar,
    },
    {
      title: 'Customer Directory',
      desc: 'Build detailed client archives. Search by phone, view event histories, check receipts, and access contact records.',
      icon: Users,
    },
    {
      title: 'Payment Tracking',
      desc: 'Log cash or digital receipts, calculate remaining balances, and trigger automatic reminders for unpaid amounts.',
      icon: CreditCard,
    },
    {
      title: 'Staff Access Roles',
      desc: 'Add sub-logins for managers and cleaning staff. Gated authorization limits data viewing based on designated roles.',
      icon: UserCheck,
    },
    {
      title: 'Revenue Analytics',
      desc: 'Inspect metrics on total earnings, pending collections, tax rates, and monthly collections via clean chart cards.',
      icon: TrendingUp,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
  };

  return (
    <section className="py-24 bg-white border-b border-slate-100" id="features">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest block">
            Features & Capabilities
          </span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Everything Your Hall Needs In One Dashboard
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            HallsOnDesk maps entire wedding hall workflows into a single system, removing the need for papers, manual audits, and chaotic phone calls.
          </p>
        </div>

        {/* Features Grid: 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                className="border border-slate-200/60 bg-[#F8FAFC]/50 hover:shadow-premium hover:-translate-y-1 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between shadow-sm cursor-default"
              >
                <div>
                  <div className="h-10 w-10 rounded-full bg-primary-lighter text-primary-light flex items-center justify-center mb-5 shrink-0 border border-primary-light/10 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-none mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
