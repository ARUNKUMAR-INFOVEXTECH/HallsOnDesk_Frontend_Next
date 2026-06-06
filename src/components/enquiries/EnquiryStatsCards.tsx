'use client';

import React from 'react';
import { MessageSquare, TrendingUp, Target, Bell, TrendingDown } from 'lucide-react';
import { EnquiryStats } from '@/types/enquiry';

interface EnquiryStatsCardsProps {
  stats?: EnquiryStats;
  isLoading?: boolean;
}

export function EnquiryStatsCards({ stats, isLoading = false }: EnquiryStatsCardsProps) {
  const total = stats?.total ?? 0;
  const newCount = stats?.new ?? 0;
  const booked = stats?.booked ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;
  const todayFollowups = stats?.todayFollowups ?? 0;
  const overdueFollowups = stats?.overdueFollowups ?? 0;
  
  // Dynamic metrics fallback calculations if stats hook doesn't provide them
  const thisMonthAdded = (stats as any)?.thisMonthAdded ?? Math.max(0, newCount + booked);
  const thisMonthLost = (stats as any)?.thisMonthLost ?? stats?.lost ?? 0;

  const cards = [
    {
      title: 'Total Enquiries',
      value: total,
      label: 'All time leads',
      icon: MessageSquare,
      color: 'bg-violet-50 text-violet-755 border-violet-100',
      iconColor: 'text-violet-605',
    },
    {
      title: 'This Month',
      value: thisMonthAdded,
      label: 'New leads added',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      label: `${booked} booked bookings`,
      icon: Target,
      color: 'bg-green-50 text-green-700 border-green-100',
      iconColor: 'text-green-600',
      isProgress: true,
    },
    {
      title: "Today's Followups",
      value: todayFollowups,
      label: overdueFollowups > 0 ? `${overdueFollowups} overdue!` : 'Scheduled today',
      icon: Bell,
      color:
        overdueFollowups > 0
          ? 'bg-rose-50 text-rose-700 border-rose-100'
          : todayFollowups > 0
          ? 'bg-amber-50 text-amber-705 border-amber-100'
          : 'bg-slate-50 text-slate-655 border-slate-150',
      iconColor: overdueFollowups > 0 ? 'text-rose-500 font-bold' : todayFollowups > 0 ? 'text-amber-500' : 'text-slate-400',
    },
    {
      title: 'Lost This Month',
      value: thisMonthLost,
      label: 'Failed to convert',
      icon: TrendingDown,
      color: thisMonthLost > 5 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-550 border-slate-150',
      iconColor: thisMonthLost > 5 ? 'text-rose-500' : 'text-slate-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse select-none">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[105px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4.5 flex flex-col justify-between min-h-[110px] transition-all hover:shadow-custom-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] uppercase font-black text-slate-450 tracking-wider">
                  {card.title}
                </span>
                <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight leading-none mt-0.5">
                  {card.value}
                </h3>
              </div>

              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${card.color}`}
              >
                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              {card.isProgress ? (
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400">
                    {card.label}
                  </p>
                </div>
              ) : (
                <p className={`text-[9px] font-bold ${
                  card.title === "Today's Followups" && overdueFollowups > 0 
                    ? 'text-rose-500 animate-pulse'
                    : 'text-slate-400'
                }`}>
                  {card.label}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EnquiryStatsCards;
