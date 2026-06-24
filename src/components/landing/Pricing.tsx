'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Lock, Crown, Zap, Gift, Shield, MessageSquare } from 'lucide-react';

interface PricingProps {
  onBookDemoClick: () => void;
}

export default function Pricing({ onBookDemoClick }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const slotsClaimed = 14;
  const totalSlots = 20;
  const progressPercent = (slotsClaimed / totalSlots) * 100;

  // Compute pricing values dynamically based on billing cycle
  const plans = [
    {
      name: 'Infovex Halls SaaS Only',
      tagline: 'Ideal for venues with existing websites looking for advanced back-office operations.',
      setupFee: '₹4,999',
      monthlyPrice: billingCycle === 'monthly' ? '₹1,999' : '₹1,599',
      savings: billingCycle === 'annual' ? 'Save ₹4,800/yr' : null,
      features: [
        'Infovex Halls Core Software',
        'Booking Management Console',
        'Customer Directory & History',
        'Payment Logging & Receipts',
        'Hall Availability Calendar Log',
        'Interactive Staff Training',
        'Lifetime Software Updates',
        'Priority Technical Support',
      ],
      ctaText: 'Secure SaaS Only Slot',
      popular: false,
    },
    {
      name: 'Digital Transformation',
      tagline: 'Complete digital setup including a premium, high-conversion customer website.',
      setupFee: '₹17,999',
      monthlyPrice: billingCycle === 'monthly' ? '₹2,299' : '₹1,839',
      savings: billingCycle === 'annual' ? 'Save ₹5,520/yr' : null,
      features: [
        'Premium Hall Customer Website',
        'Infovex Halls Software Engine',
        'Online Booking Requests Integration',
        'Payment Records & Ledger Sync',
        'Public-Facing Availability Calendar',
        'Complete Website Maintenance',
        'WhatsApp Alerts Integration',
        'Manager & Staff Training Session',
        'Priority Support with 2h SLA',
        'Direct Feature Request Influence',
      ],
      ctaText: 'Claim Transformation Slot',
      popular: true,
    },
    {
      name: 'Premium Hall Package',
      tagline: 'Bespoke custom branding, website design, and dedicated hands-on setup support.',
      setupFee: '₹29,999',
      monthlyPrice: billingCycle === 'monthly' ? '₹3,999' : '₹3,199',
      savings: billingCycle === 'annual' ? 'Save ₹9,600/yr' : null,
      features: [
        'Bespoke Premium Custom Website',
        'Infovex Halls Software Suite',
        'Complete Concierge Data Onboarding',
        'Advanced Brand Identity Assistance',
        'Unlimited Staff & Operator Training',
        'Continuous Website Maintenance',
        'Direct SLA Priority Hotline',
        'Dedicated Customer Success Manager',
      ],
      ctaText: 'Secure Premium Slot',
      popular: false,
    },
  ];

  const founderBenefits = [
    {
      icon: <Lock className="h-5 w-5 text-[#159DFC]" />,
      title: 'Permanent Pricing Lock',
      desc: 'Lock in your early-partner subscription rates forever. Your pricing remains unchanged even when market rates increase.',
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-[#159DFC]" />,
      title: 'Direct Product Influence',
      desc: 'Have a feature request or custom receipt template? Our developers build it directly into your platform at no extra cost.',
    },
    {
      icon: <Crown className="h-5 w-5 text-[#159DFC]" />,
      title: 'VIP Onboarding Concierge',
      desc: 'Our technical team personally imports your registers, sets up staff members, and hosts interactive training webinars.',
    },
    {
      icon: <Zap className="h-5 w-5 text-[#159DFC]" />,
      title: 'Priority Support Channel',
      desc: 'Get access to a dedicated WhatsApp and phone support group with guaranteed sub-2-hour responses from engineering.',
    },
    {
      icon: <Gift className="h-5 w-5 text-[#159DFC]" />,
      title: 'Free Add-ons for Life',
      desc: 'Receive future major releases and platform upgrades automatically for free without ever paying addon upgrade fees.',
    },
    {
      icon: <Shield className="h-5 w-5 text-[#159DFC]" />,
      title: 'Website Hosting Covered',
      desc: 'We fully cover your website domain, SSL security certificate, and hosting infrastructure under your monthly package.',
    },
  ];

  return (
    <section className="py-28 bg-white border-b border-slate-200/80 relative overflow-hidden" id="pricing">
      {/* Background spot glows */}
      <div className="absolute top-1/4 left-0 h-[400px] w-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] bg-[#159DFC]/2 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Pricing Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-[#002499] uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#159DFC]" />
            Founder Hall Partner Program
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight font-display">
            Transform Your Hall Operations
          </h2>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-xl mx-auto">
            Ditch manual ledger books. Position your venue as a premium brand with Tamil Nadu's leading digital venue operations engine.
          </p>
        </div>

        {/* Pricing Cycle Toggle Capsule */}
        <div className="flex items-center justify-center gap-3 mb-16 relative">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#159DFC] text-[#0F172A] shadow-md shadow-[#159DFC]/10'
                  : 'text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#159DFC] text-[#0F172A] shadow-md shadow-[#159DFC]/10'
                  : 'text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Annual
            </button>
          </div>
          
          {/* Floating discount badge */}
          <span className="bg-[#159DFC] text-[#0F172A] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce select-none shadow-md shadow-[#159DFC]/10">
            Save 20%
          </span>
        </div>

        {/* Founder Hall Program Banner (Slot Tracker) */}
        <div className="max-w-4xl mx-auto mb-20 bg-gradient-to-b from-[#F8FAFC] to-slate-100/80 text-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-200/80">
          <div className="absolute -right-16 -top-16 w-40 h-40 bg-[#159DFC]/3 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8 space-y-3">
              <span className="inline-block px-2.5 py-1 rounded bg-[#159DFC]/10 border border-[#159DFC]/25 text-[9px] text-[#002499] font-extrabold uppercase tracking-widest animate-pulse">
                Urgent: Limited Enrollment
              </span>
              <h3 className="font-extrabold text-xl text-[#0F172A] font-display">
                Exclusive Founder Partner Rates Locked Forever
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Only the first 20 marriage halls receive this pricing lock. Once filled, standard setup rates and higher monthly subscriptions will apply. Join today to retain your discount permanently.
              </p>
            </div>
            <div className="md:col-span-4 space-y-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Slots Claimed</span>
                <span className="text-[#159DFC]">{slotsClaimed} of {totalSlots} Halls</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-350/20 p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-[#159DFC] h-full rounded-full transition-all duration-750 shadow-md shadow-[#159DFC]/25" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-center text-slate-400 font-extrabold tracking-wider uppercase">
                Only {totalSlots - slotsClaimed} Founder slots remaining
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-28">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border backdrop-blur-sm ${
                plan.popular
                  ? 'border-[#159DFC] bg-white ring-4 ring-[#159DFC]/5 shadow-2xl lg:scale-[1.04] z-10 hover:shadow-[0_15px_40px_-15px_rgba(238,155,0,0.12)]'
                  : 'border-slate-200/80 bg-[#F8FAFC]/50 hover:border-slate-300 hover:bg-white hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#159DFC] text-[#0F172A] rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-md">
                  <Sparkles className="h-3 w-3" />
                  Recommended Package
                </span>
              )}

              {/* Plan Details */}
              <div>
                <h4 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2 font-display">
                  {plan.name}
                  {plan.popular && <Crown className="h-5 w-5 text-[#159DFC] shrink-0 animate-pulse" />}
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2.5 min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="my-6 border-y border-slate-200/60 py-6 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Monthly License</span>
                    <span className="text-3xl font-extrabold text-[#0F172A] leading-none tracking-tight">
                      {plan.monthlyPrice}
                      <span className="text-xs text-slate-400 font-semibold tracking-normal">/mo</span>
                    </span>
                  </div>
                  
                  {plan.savings && (
                    <div className="text-right text-[10px] text-emerald-600 font-bold tracking-wide">
                      {plan.savings}
                    </div>
                  )}

                  <div className="flex items-baseline justify-between text-xs text-slate-500 border-t border-slate-200 pt-3.5">
                    <span className="font-semibold">Setup & Concierge Onboarding</span>
                    <span className="font-extrabold text-[#0F172A]">{plan.setupFee}</span>
                  </div>
                </div>

                {/* Features checklists */}
                <div className="space-y-3.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Included Capabilities
                  </span>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-650 font-semibold leading-relaxed">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <div className="pt-8 mt-auto">
                <button
                  onClick={onBookDemoClick}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 text-center ${
                    plan.popular
                      ? 'bg-[#159DFC] text-[#0F172A] hover:bg-[#002499] shadow-md hover:scale-[1.02] shadow-[#159DFC]/10'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-650 hover:scale-[1.01]'
                  }`}
                >
                  {plan.ctaText}
                </button>
                <span className="text-[9px] text-slate-400 font-bold text-center block mt-3 uppercase tracking-wider">
                  Guarantees 100% Locked Price
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Founder Partner Advantages Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-extrabold text-[#159DFC] uppercase tracking-widest block">
            Partner Value Addition
          </span>
          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Founder Member Advantages
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Join the program to enjoy permanent system discounts, high-touch support, and custom setup perks.
          </p>
        </div>

        {/* Founder Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {founderBenefits.map((benefit, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/80 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-[#F8FAFC]/50 transition-all duration-300 space-y-3 backdrop-blur-sm"
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-[#159DFC]">
                {benefit.icon}
              </div>
              <h5 className="font-extrabold text-xs text-[#0F172A] leading-snug">
                {benefit.title}
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
