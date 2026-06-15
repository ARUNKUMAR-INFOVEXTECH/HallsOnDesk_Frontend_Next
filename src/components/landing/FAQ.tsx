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
      question: 'Why do setup and onboarding fees exist?',
      answer: 'Setup fees cover the physical onboarding of your hall. This includes digitizing and importing all your historical register books, configuring your private cloud servers, and creating your custom premium website (for Plan 2 and 3). It also funds our hands-on staff training to ensure smooth operations from day one.',
    },
    {
      question: 'What happens after the 20 Founder Hall slots are filled?',
      answer: 'Once the 20 Founder Partner slots are claimed, the program closes. Subsequent halls will pay standard market setup fees (₹15,000+) and standard monthly subscription rates. Only Founder Partners retain their discounted rates permanently.',
    },
    {
      question: 'Will my monthly subscription price increase in the future?',
      answer: 'No. As a member of the Founder Hall Partner Program, your monthly pricing is locked for life. Even when we release major new modules or raise subscription pricing for new customers, your rates will never increase.',
    },
    {
      question: 'Who owns the custom premium website?',
      answer: 'You have complete ownership of your brand. We handle the technical setup, hosting infrastructure, domain registration, and continuous maintenance. If you ever decide to leave, you can export your records and point your domain wherever you choose.',
    },
    {
      question: 'What support is included in my package?',
      answer: 'All plans include direct customer support. Plan 2 and 3 features VIP priority support. You receive access to a dedicated WhatsApp and Slack support channel directly linking you to our senior product engineers, with a guaranteed sub-2-hour SLA response.',
    },
    {
      question: 'What training is included for our hall managers and staff?',
      answer: 'We provide unlimited interactive training sessions. Our team will host training webinars for your hall managers, billing clerks, and support staff to make sure everyone is comfortable. We also provide printable quick-reference guides for offline booking desks.',
    },
  ];

  return (
    <section className="py-28 bg-[#F8FAFC] border-b border-slate-200/80 relative overflow-hidden" id="faq">
      {/* Background spot glows */}
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-bold text-[#D48A00] uppercase tracking-widest block">
            Common Inquiries
          </span>
          <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-550 font-semibold leading-relaxed">
            Find answers to onboarding, pricing, custom setups, and staff training policies.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden backdrop-blur-sm ${
                  isOpen 
                    ? 'border-[#EE9B00]/50 bg-[#EE9B00]/5 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-[#F8FAFC]/50'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5 focus:outline-none cursor-pointer"
                >
                  <span className="font-extrabold text-sm text-[#0A2540] flex items-center gap-3.5 pr-4">
                    <HelpCircle className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isOpen ? 'text-[#EE9B00]' : 'text-slate-400'}`} />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-500 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#EE9B00]' : ''
                    }`}
                  />
                </button>
                
                {/* Expandable Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen 
                      ? 'max-h-[300px] border-t border-slate-200/60 opacity-100' 
                      : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="px-6 py-5">
                    <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
