'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  headerAction,
  loading = false,
  className = '',
}: ChartCardProps) {
  return (
    <div
      className={`border border-slate-200 bg-white rounded-lg p-5 shadow-custom-sm flex flex-col hover:border-slate-300 hover:shadow-premium transition-all duration-200 ${className}`}
    >
      {/* Header section */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div>
          <h4 className="text-sm font-bold text-slate-800 leading-snug">{title}</h4>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[240px] flex items-center justify-center relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/60">
            <div className="h-6 w-6 border-2 border-slate-200 border-t-primary-light rounded-full animate-spin" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Fetching metrics...
            </span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">{children}</div>
        )}
      </div>
    </div>
  );
}
