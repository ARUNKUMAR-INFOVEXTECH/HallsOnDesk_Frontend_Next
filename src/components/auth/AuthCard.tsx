'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden transition-all duration-200 hover:border-slate-300">
      {/* Top Brand Banner */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
      
      <div className="p-8">
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-custom-sm mb-3.5">
            <Building2 className="h-5.5 w-5.5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 font-semibold mt-2 text-center leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Card Body content */}
        {children}
      </div>
    </div>
  );
}
