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
      <div className="border border-gray-100 bg-white rounded-xl p-4 md:p-5 animate-pulse shadow-sm flex items-center gap-4 w-full h-full min-h-[80px]">
        <div className="h-10 w-10 rounded-xl bg-gray-50 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-50 rounded w-16" />
          <div className="h-5 bg-gray-50 rounded w-24" />
        </div>
      </div>
    );
  }

  const isIncrease = changeType === 'increase' || (change !== undefined && change > 0);
  const isDecrease = changeType === 'decrease' || (change !== undefined && change < 0);

  return (
    <div className="border border-gray-100 bg-white rounded-xl p-4 md:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 shadow-sm flex items-center gap-4 w-full h-full">
      {icon && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-lighter text-primary-light shrink-0 border border-primary-light/10 shadow-sm [&_svg]:h-4.5 [&_svg]:w-4.5">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <span className="text-xs md:text-sm font-semibold text-gray-500 block truncate">
          {title}
        </span>
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight leading-none mt-1 truncate">
          {value}
        </h3>
        
        {change !== undefined ? (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold leading-none shrink-0 ${
                isIncrease
                  ? 'bg-green-50 text-green-700 border border-green-150'
                  : isDecrease
                  ? 'bg-red-50 text-red-700 border border-red-150'
                  : 'bg-gray-50 text-gray-600 border border-gray-150'
              }`}
            >
              {isIncrease ? (
                <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 shrink-0" />
              ) : isDecrease ? (
                <ArrowDownRight className="h-2.5 w-2.5 mr-0.5 shrink-0" />
              ) : null}
              {Math.abs(change)}%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold tracking-tight whitespace-nowrap">
              {description || (isIncrease ? 'increase MoM' : isDecrease ? 'decrease MoM' : 'change')}
            </span>
          </div>
        ) : (
          description && (
            <p className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-none truncate">
              {description}
            </p>
          )
        )}
      </div>
    </div>
  );
}
