'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { EnquiryStats } from '@/types/enquiry';
import { StageBadge } from './StageBadge';

interface ConversionFunnelProps {
  stats?: EnquiryStats;
}

export function ConversionFunnel({ stats }: ConversionFunnelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats) return null;

  const total = stats.total || 0;
  const newCount = stats.new || 0;
  const interested = stats.interested || 0;
  const visitScheduled = stats.visit_scheduled || 0;
  const visited = stats.visited || 0;
  const booked = stats.booked || 0;
  const lost = stats.lost || 0;

  // Funnel calculations: percent relative to Total Enquiries (or to previous stage if desired, but prompt says: New: 100%, and others are counts/percentage of total)
  const calculatePercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const funnelStages = [
    { key: 'new', label: 'New Lead', count: newCount, percent: calculatePercent(newCount), color: 'bg-violet-600' },
    { key: 'interested', label: 'Interested', count: interested, percent: calculatePercent(interested), color: 'bg-blue-600' },
    { key: 'visit_scheduled', label: 'Visit Scheduled', count: visitScheduled, percent: calculatePercent(visitScheduled), color: 'bg-amber-500' },
    { key: 'visited', label: 'Visited', count: visited, percent: calculatePercent(visited), color: 'bg-purple-600' },
    { key: 'booked', label: 'Booked', count: booked, percent: calculatePercent(booked), color: 'bg-green-500' },
    { key: 'lost', label: 'Lost', count: lost, percent: calculatePercent(lost), color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden select-none">
      {/* Trigger bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <span className="text-xs font-extrabold text-slate-850 uppercase tracking-wider">
            View Conversion Funnel
          </span>
          <span className="text-[10px] font-bold bg-violet-50 border border-violet-100 text-violet-755 px-2 py-0.5 rounded">
            Overall Conversion: {stats.conversionRate}%
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4.5 w-4.5 text-slate-400" />
        ) : (
          <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
        )}
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {funnelStages.map((stage) => {
              return (
                <div key={stage.key} className="flex items-center gap-4 text-xs font-semibold">
                  {/* Left Label */}
                  <div className="w-28 shrink-0">
                    <StageBadge stage={stage.key as any} />
                  </div>

                  {/* Funnel Bar */}
                  <div className="flex-1 bg-slate-50 rounded-lg h-5.5 relative overflow-hidden border border-slate-100">
                    {stage.percent > 0 && (
                      <div
                        className={`h-full ${stage.color} opacity-85 rounded-l-md transition-all duration-500`}
                        style={{ width: `${stage.percent}%` }}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center px-2.5 text-[10px] font-bold text-slate-655 font-mono">
                      {stage.percent}%
                    </span>
                  </div>

                  {/* Right count */}
                  <div className="w-16 text-right shrink-0 text-slate-500 font-mono text-[11px] font-bold">
                    {stage.count} leads
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 text-[10px] text-slate-500 leading-relaxed font-semibold">
            🎯 Funnel conversion percentages reflect each stage's count relative to the total enquiries base ({total} leads). Conversion optimization aims to move leads seamlessly from <strong>New Lead</strong> and <strong>Interested</strong> stages to a completed <strong>Booked</strong> state.
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversionFunnel;
