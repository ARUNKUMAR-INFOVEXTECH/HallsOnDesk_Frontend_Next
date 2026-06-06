'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export default function SettingsCard({
  title,
  subtitle,
  icon: Icon,
  children,
  headerAction,
  className = '',
}: SettingsCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-405 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
