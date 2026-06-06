'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface PricingProps {
  onBookDemoClick: () => void;
}

export default function Pricing({ onBookDemoClick }: PricingProps) {
  const plans = [
    {
      name: 'Starter Plan',
      badge: null,
      setupFee: '₹9,999',
      monthlyPrice: '₹1,499',
      desc: 'Essential features for single-owner halls looking to digitize.',
      features: [
        'Booking Management',
        'Customer Database',
        'Event Calendar Grid',
        'Payments Logging',
        'Staff Sub-Logins (up to 3)',
        'Standard Support',
      ],
      ctaText: 'Get Started',
      popular: false,
    },
    {
      name: 'Founding Plan',
      badge: 'Most Popular',
      setupFee: '₹4,999',
      monthlyPrice: '₹999',
      desc: 'Exclusive pricing tier for the first 3 halls per district.',
      features: [
        'Everything in Starter Plan',
        'Lifetime Discount Lock (Save ₹500/mo)',
        'Staff Sub-Logins (up to 5)',
        'Priority Support with 2hr SLA',
        'Direct Feature Requests',
        '2 Months Free Maintenance',
      ],
      ctaText: 'Claim Founding Deal',
      popular: true,
    },
    {
      name: 'Professional Plan',
      badge: null,
      setupFee: '₹14,999',
      monthlyPrice: '₹2,499',
      desc: 'Advanced controls for busy halls & multi-venue convention centers.',
      features: [
        'Everything in Founding Plan',
        'Infinite Staff Logins',
        'Enquiry CRM Pipeline',
        'Automated GST Invoicing',
        'Advanced Revenue Reports',
        '24/7 Phone Support Access',
      ],
      ctaText: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-slate-50/50 border-b border-slate-100" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest block">
            Simple Transparent Pricing
          </span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Plans Fitted For Every Marriage Hall Size
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Choose a plan that fits your business. Save over 30% with our Founding Hall Program slots. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white border rounded-xl p-8 flex flex-col justify-between shadow-sm transition-all duration-200 ${
                plan.popular
                  ? 'border-primary-light ring-2 ring-primary-light/25 shadow-md scale-[1.02] z-10'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-custom-md'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {plan.badge}
                </span>
              )}

              {/* Plan Metadata */}
              <div>
                <h3 className="font-bold text-slate-850 text-base">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                  {plan.desc}
                </p>

                {/* Price indicators */}
                <div className="my-6 border-y border-slate-150 py-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Rent</span>
                    <span className="text-3xl font-extrabold text-primary leading-none">
                      {plan.monthlyPrice}
                      <span className="text-xs text-slate-400 font-medium tracking-normal">/mo</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-500">
                    <span>Setup & Onboarding Fee</span>
                    <span className="font-bold text-slate-850">{plan.setupFee}</span>
                  </div>
                </div>

                {/* Features checklists */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Features Included
                  </span>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-normal">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA trigger button */}
              <div className="pt-8">
                <button
                  onClick={onBookDemoClick}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm text-center ${
                    plan.popular
                      ? 'bg-primary-light text-primary hover:bg-primary-light/90'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
