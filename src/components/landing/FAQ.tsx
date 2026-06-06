'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How does onboarding work?',
      answer: 'After scheduling a demo, our technical team gathers your marriage hall layout, rental rates, sub-contractor lists, and active calendars. We import everything and configure your private console so you can begin immediately.',
    },
    {
      question: 'How long does setup take?',
      answer: 'Onboarding is extremely fast. We typically set up your hall parameters, import existing dates, and provide access codes within 24 to 48 hours.',
    },
    {
      question: 'Do you provide training?',
      answer: 'Yes! We conduct interactive training webinars for hall owners, managers, and booking clerks. We ensure everyone is comfortable using the phone and laptop interfaces.',
    },
    {
      question: 'Can I manage multiple halls?',
      answer: 'Yes, our systems support multi-venue operators. You can manage multiple halls under a single login, maintaining separate booking logs, tax lines, and rental calculations for each venue.',
    },
    {
      question: 'What happens after the free maintenance period?',
      answer: 'The Founding Plan includes 2 months of free upgrades. Afterwards, you continue under our flat ₹999/mo rate. There are no additional charges or hidden percentages per booking.',
    },
    {
      question: 'Do you offer custom features?',
      answer: 'Yes, members of our Founding Hall Program can request direct custom features (e.g. customized receipts layouts or specific vendor tracking parameters) that our developers build specifically for them.',
    },
  ];

  return (
    <section className="py-24 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest block">
            Common Inquiries
          </span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Find answers to onboarding, pricing, custom setups, and staff training policies.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-xl transition-all duration-200 ${
                  isOpen ? 'border-primary-light/40 bg-white shadow-sm' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left px-5 py-4.5 focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-3">
                    <HelpCircle className={`h-4.5 w-4.5 shrink-0 ${isOpen ? 'text-primary-light' : 'text-slate-400'}`} />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary-light' : ''
                    }`}
                  />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50 animate-fadeIn">
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
