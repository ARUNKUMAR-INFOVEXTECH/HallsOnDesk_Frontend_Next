'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Notebook, Smartphone, HelpCircle } from 'lucide-react';

export default function Problems() {
  const oldWorkflow = [
    { text: 'Double Bookings', desc: 'Writing dates in physical register books leads to overlapping wedding bookings during heavy seasons.' },
    { text: 'Missed Collections', desc: 'Losing track of client advance amounts, due dates, and pending rental payments.' },
    { text: 'Coordination Gaps', desc: 'Relying on scattered WhatsApp threads to coordinate decorators, catering staff, and photographers.' },
    { text: 'Manual Record Loss', desc: 'Notebook register logs getting damaged or misplaced, wiping out booking and payment histories.' },
  ];

  const newWorkflow = [
    { text: 'Dynamic Visual Schedules', desc: 'Visual calendar logs automatically cross-reference dates and prevent booking conflicts.' },
    { text: 'Automated Invoices', desc: 'Track pending rentals, record UPI/cash receipts, and calculate due balances instantly.' },
    { text: 'Integrated Workflows', desc: 'Manage catering teams, cleaners, and audio operators with role-gated sub-accounts.' },
    { text: 'Secure Cloud Syncing', desc: 'Store data on secure, automated cloud servers accessible via phone or laptop anytime.' },
  ];

  return (
    <section className="py-24 bg-slate-50/50 border-b border-slate-100" id="problems">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest block">
            The Venue Operator Dilemma
          </span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Still Managing Your Venue With Notebooks And WhatsApp?
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Manual registers cost you time, double-bookings, and missing advance payments. Compare the manual chaos with HallsOnDesk operations.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: The Old Manual Chaos */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-slate-200 bg-white rounded-xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4 mb-6">
                <div className="h-10 w-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">
                  <Notebook className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-none">The Manual Registers Chaos</h3>
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mt-1">
                    Risk of Errors & Leakages
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {oldWorkflow.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="h-5 w-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5 text-red-650">
                      <X className="h-3 w-3" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm leading-none block">
                        {item.text}
                      </span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-slate-400 text-xs font-semibold flex items-center gap-2 mt-8">
              <HelpCircle className="h-4 w-4" />
              Unorganized, prone to manual mistakes and lost revenues.
            </div>
          </motion.div>

          {/* Card 2: The HallsOnDesk Peace */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-primary-light/20 bg-white rounded-xl p-8 shadow-sm flex flex-col justify-between hover:border-primary-light/50 transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-3.5 border-b border-primary-lighter pb-4 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center border border-primary-light/20">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 text-sm leading-none">The HallsOnDesk System</h3>
                  <span className="text-[9px] text-primary-light font-bold tracking-widest uppercase block mt-1">
                    Automated & 100% Secure
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {newWorkflow.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                      <Check className="h-3 w-3" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm leading-none block">
                        {item.text}
                      </span>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-primary-lighter text-primary/70 text-xs font-semibold flex items-center gap-2 mt-8">
              <Check className="h-4 w-4 text-emerald-600" />
              Real-time records, cloud synced, role-gated, and accessible anywhere.
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
