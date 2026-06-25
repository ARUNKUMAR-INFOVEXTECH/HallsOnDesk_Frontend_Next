'use client';

import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FeatureLockOverlayProps {
  requiredPlan: 'Digital Transformation Plan' | 'Premium SaaS Plan' | 'Premium Digital Transformation Plan';
  featureName: string;
  description: string;
}

export default function FeatureLockOverlay({ requiredPlan, featureName, description }: FeatureLockOverlayProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50/30 rounded-2xl border border-gray-150 backdrop-blur-[1px] my-6 select-none select-none">
      <div className="max-w-md bg-white border border-gray-150 rounded-2xl p-8 text-center shadow-premium relative overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-100/50 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-50/50 blur-3xl pointer-events-none" />

        {/* Lock Icon Emblem */}
        <div className="h-14 w-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mx-auto shadow-sm mb-5 relative">
          <Lock className="h-6 w-6" />
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold uppercase animate-pulse">
            ★
          </span>
        </div>

        {/* Heading */}
        <span className="text-[9px] font-black text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 uppercase tracking-widest inline-block mb-3">
          Plan Upgrade Required
        </span>
        <h2 className="text-lg font-black text-gray-900 tracking-tight leading-snug">
          {featureName} is Locked
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed font-semibold mt-2.5 max-w-sm mx-auto">
          {description}
        </p>

        {/* Requirements Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 my-6 text-left space-y-2.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Minimum required plan tier</span>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{requiredPlan}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Upgrade your subscription now to unlock this module, allocate staff slots, configure templates, and streamline operations.
          </p>
        </div>

        {/* Action Button CTA */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/settings/subscription"
            className="h-10 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/10 hover:shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            <span>Explore Subscription Plans</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="h-10 border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
