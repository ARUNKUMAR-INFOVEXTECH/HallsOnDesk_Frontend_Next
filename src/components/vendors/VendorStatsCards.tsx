'use client';

import React from 'react';
import { Users2, CheckCircle, Grid3x3, IndianRupee } from 'lucide-react';
import { VendorStats } from '@/types/vendor';
import { formatCurrencyShort } from '@/utils/currency';

interface VendorStatsCardsProps {
  stats?: VendorStats;
  isLoading?: boolean;
}

export function VendorStatsCards({ stats, isLoading = false }: VendorStatsCardsProps) {
  // Mock fallback numbers
  const totalVendors = stats?.totalVendors ?? 0;
  const activeVendors = stats?.activeVendors ?? 0;
  const totalSpent = stats?.totalAmountPaid ?? 0;
  
  // Calculate how many categories have at least one vendor
  const categoryCounts = stats?.categoryCounts ?? {};
  const activeCategoriesCount = (Object.values(categoryCounts) as number[]).filter((count) => count > 0).length;

  const cards = [
    {
      title: 'Total Vendors',
      value: totalVendors,
      label: 'All vendors',
      icon: Users2,
      color: 'bg-primary-lighter text-primary-light border-primary-light/10',
      iconColor: 'text-primary-light',
    },
    {
      title: 'Active Vendors',
      value: activeVendors,
      label: 'Currently active',
      icon: CheckCircle,
      color: 'bg-green-50 text-green-755 border-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Categories',
      value: activeCategoriesCount,
      label: 'Service categories',
      icon: Grid3x3,
      color: 'bg-blue-50 text-blue-755 border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Spent',
      value: formatCurrencyShort(totalSpent),
      label: 'All time payments',
      icon: IndianRupee,
      color: 'bg-amber-50 text-amber-755 border-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 animate-pulse select-none">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[105px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 md:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-custom-sm"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider">
                {card.title}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 font-mono tracking-tight leading-none">
                {card.value}
              </h3>
              <p className="text-[10px] font-semibold text-slate-400">
                {card.label}
              </p>
            </div>

            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 ${card.color}`}
            >
              <Icon className={`h-5.5 w-5.5 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default VendorStatsCards;
