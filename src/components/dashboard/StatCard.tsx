'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number; // e.g. 12.5
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  changeType,
  description,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="border border-gray-100 bg-white rounded-xl p-6 animate-pulse shadow-sm flex items-center gap-4 w-full h-[88px]">
        <div className="h-12 w-12 rounded-xl bg-gray-50 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-50 rounded w-16" />
          <div className="h-6 bg-gray-50 rounded w-24" />
        </div>
      </div>
    );
  }

  const isIncrease = changeType === 'increase' || (change !== undefined && change > 0);
  const isDecrease = changeType === 'decrease' || (change !== undefined && change < 0);

  return (
    <div className="border border-gray-100 bg-white rounded-xl p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200 shadow-sm flex items-center gap-4 w-full">
      {icon && (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-lighter text-primary-light shrink-0 border border-primary-light/10 shadow-sm [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-500 block truncate">
          {title}
        </span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
            {value}
          </h3>
          
          {change !== undefined && (
            <span
              className={`inline-flex items-center text-xs font-bold leading-none pl-1 shrink-0 ${
                isIncrease
                  ? 'text-green-600'
                  : isDecrease
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {isIncrease ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" />
              ) : isDecrease ? (
                <ArrowDownRight className="h-3 w-3 mr-0.5 shrink-0" />
              ) : null}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        
        {description && !change && (
          <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-none truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
