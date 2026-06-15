'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Target, 
  Activity, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Trash2,
  Inbox
} from 'lucide-react';
import { EnquiryStats } from '@/types/enquiry';

interface ConversionFunnelProps {
  stats?: EnquiryStats;
}

export function ConversionFunnel({ stats }: ConversionFunnelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  if (!stats) return null;

  const total = stats.total || 0;
  const newCount = stats.new || 0;
  const interested = stats.interested || 0;
  const visitScheduled = stats.visit_scheduled || 0;
  const visited = stats.visited || 0;
  const booked = stats.booked || 0;
  const lost = stats.lost || 0;

  // Active pipeline: sum of all active stages (excludes Booked and Lost)
  const activePipelineCount = newCount + interested + visitScheduled + visited;

  const calculatePercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Funnel calculations: percent relative to Total Enquiries
  const funnelStages = [
    { 
      key: 'new', 
      label: 'New Lead', 
      count: newCount, 
      percent: calculatePercent(newCount), 
      colorClass: 'from-indigo-600 to-violet-650', 
      glowClass: 'shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]',
      icon: <Target className="h-4 w-4 shrink-0 text-indigo-300" />,
      widthClass: 'w-full max-w-[480px]',
      tip: 'New leads are fresh! Contact them within 15 minutes to maximize conversion. First impressions are critical to push them to the Interested stage.'
    },
    { 
      key: 'interested', 
      label: 'Interested', 
      count: interested, 
      percent: calculatePercent(interested), 
      colorClass: 'from-violet-500 to-purple-650', 
      glowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.12)] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]',
      icon: <Activity className="h-4 w-4 shrink-0 text-violet-350" />,
      widthClass: 'w-[90%] max-w-[430px]',
      tip: 'Qualify budget, guest count, and date requirements. Keep engagement high by answering questions promptly and propose scheduling a site visit.'
    },
    { 
      key: 'visit_scheduled', 
      label: 'Visit Scheduled', 
      count: visitScheduled, 
      percent: calculatePercent(visitScheduled), 
      colorClass: 'from-amber-500 to-orange-600', 
      glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]',
      icon: <Calendar className="h-4 w-4 shrink-0 text-amber-300" />,
      widthClass: 'w-[80%] max-w-[380px]',
      tip: 'Confirm the schedule 24h prior. Ensure the venue is presentable and key staff are ready to lead the tour and address customer questions.'
    },
    { 
      key: 'visited', 
      label: 'Visited', 
      count: visited, 
      percent: calculatePercent(visited), 
      colorClass: 'from-blue-500 to-cyan-600', 
      glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.12)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]',
      icon: <UserCheck className="h-4 w-4 shrink-0 text-blue-300" />,
      widthClass: 'w-[70%] max-w-[330px]',
      tip: 'Send a custom proposal immediately after the walkthrough. Follow up on specific requests and offer a booking deposit incentive.'
    },
    { 
      key: 'booked', 
      label: 'Booked', 
      count: booked, 
      percent: calculatePercent(booked), 
      colorClass: 'from-emerald-500 to-teal-600 border-emerald-450/40', 
      glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
      icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />,
      widthClass: 'w-[60%] max-w-[280px] border border-transparent animate-pulse-slow',
      tip: 'Lead converted! Finalize the agreement, collect the deposit, and transition the booking details seamlessly to operations.'
    },
  ];

  // Memoize transition rates between consecutive stages
  const transitions = useMemo(() => {
    const rates: Array<{ transition: number; dropoff: number }> = [];
    for (let i = 0; i < funnelStages.length - 1; i++) {
      const prev = funnelStages[i].count;
      const curr = funnelStages[i + 1].count;
      if (prev === 0) {
        rates.push({ transition: 0, dropoff: 100 });
      } else {
        const rawRate = (curr / prev) * 100;
        const transition = Math.min(100, Math.round(rawRate));
        const dropoff = Math.max(0, 100 - transition);
        rates.push({ transition, dropoff });
      }
    }
    return rates;
  }, [newCount, interested, visitScheduled, visited, booked]);

  // Sidebar dynamic content
  const activeHoverData = useMemo(() => {
    if (!hoveredStage) return null;
    return funnelStages.find((s) => s.key === hoveredStage) || null;
  }, [hoveredStage]);

  return (
    <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden select-none transition-all duration-300">
      {/* Trigger bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/70 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 className="h-5 w-5 shrink-0" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Leads Conversion Funnel
            </span>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Analyze progression rates and identify pipeline bottlenecks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black bg-amber-50 border border-amber-200/60 text-amber-700 shadow-sm shadow-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse-slow">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Overall Conversion: {stats.conversionRate}%
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded panel with premium dark glass theme */}
      {isExpanded && (
        <div 
          className="p-6 md:p-8 bg-slate-950 border-t border-slate-900 text-slate-200 relative overflow-hidden animate-in slide-in-from-top-3 duration-350 ease-out"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08), transparent 70%),
              linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 24px 24px, 24px 24px',
          }}
        >
          {/* Subtle decorative lights */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-650/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Left Column: Vertical Funnel Stack */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center py-4">
              <div className="w-full flex flex-col items-center">
                {funnelStages.map((stage, idx) => {
                  const isHovered = hoveredStage === stage.key;
                  return (
                    <React.Fragment key={stage.key}>
                      {/* Funnel Stage Card */}
                      <div
                        onMouseEnter={() => setHoveredStage(stage.key)}
                        onMouseLeave={() => setHoveredStage(null)}
                        className={`
                          ${stage.widthClass}
                          bg-gradient-to-r ${stage.colorClass}
                          rounded-xl p-3.5 flex items-center justify-between
                          border border-white/10 text-white
                          transition-all duration-300 cursor-pointer
                          ${stage.glowClass}
                          ${isHovered ? 'scale-[1.03] border-amber-400/60' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black/15 border border-white/10 flex items-center justify-center">
                            {stage.icon}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs tracking-wider uppercase block">
                              {stage.label}
                            </span>
                            <span className="text-[10px] text-white/70 font-semibold block mt-0.5">
                              {stage.percent}% of total leads
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-center">
                          <span className="text-base font-black font-mono tracking-tight leading-none">
                            {stage.count}
                          </span>
                          <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-1">
                            leads
                          </span>
                        </div>
                      </div>

                      {/* Transition Badge between consecutive stages */}
                      {idx < funnelStages.length - 1 && (
                        <div className="flex flex-col items-center py-2.5">
                          {/* Vertical dashed line */}
                          <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-800" />
                          {/* Pill Badge */}
                          <div className="my-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-[10px] font-bold text-slate-300 flex items-center gap-2 shadow-lg backdrop-blur-sm">
                            <span className="text-emerald-450 font-black">
                              ↓ {transitions[idx].transition}% converted
                            </span>
                            <span className="text-slate-700">|</span>
                            <span className="text-rose-450 font-black">
                              -{transitions[idx].dropoff}% drop-off
                            </span>
                          </div>
                          <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-800" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Analytics & Exit Details */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              {/* Lost / Exit Leads Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur shadow-xl hover:border-rose-900/50 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-rose-500 group-hover:scale-110 transition-transform duration-300">
                  <Trash2 className="h-14 w-14" />
                </div>
                <div className="flex items-center gap-2.5 text-rose-400 font-extrabold text-xs tracking-wider uppercase border-b border-slate-800 pb-3 mb-3">
                  <Trash2 className="h-4 w-4" />
                  <span>Pipeline Exit / Lost Leads</span>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-black text-rose-500 font-mono tracking-tight">
                      {lost}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 ml-2">
                      leads lost ({total > 0 ? Math.round((lost / total) * 100) : 0}% of total)
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-3">
                  Lost leads represent opportunities that did not convert. Review lost reasons periodically to optimize your sales pitch, pricing strategy, or response times.
                </p>
              </div>

              {/* Dynamic Insights Panel */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur shadow-xl hover:border-indigo-950 transition-all duration-300 flex-1 flex flex-col">
                <div className="flex items-center gap-2.5 text-indigo-400 font-extrabold text-xs tracking-wider uppercase border-b border-slate-800 pb-3 mb-4">
                  <TrendingUp className="h-4 w-4" />
                  <span>{activeHoverData ? `${activeHoverData.label} Stage Insights` : 'Overall Pipeline Insights'}</span>
                </div>

                {activeHoverData ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Leads in Stage</span>
                        <span className="text-sm font-black text-white font-mono">{activeHoverData.count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Share of Pipeline</span>
                        <span className="text-xs font-bold text-white font-mono">{activeHoverData.percent}%</span>
                      </div>
                      {activeHoverData.key !== 'new' && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Progression Efficiency</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {
                              (() => {
                                const idx = funnelStages.findIndex(s => s.key === activeHoverData.key);
                                return idx > 0 ? `${transitions[idx - 1].transition}%` : 'N/A';
                              })()
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3.5 mt-2">
                      <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 mb-1.5">
                        <AlertCircle className="h-3 w-3" /> Actionable Advice
                      </span>
                      <p className="text-[10.5px] text-slate-350 leading-relaxed font-medium">
                        {activeHoverData.tip}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-450">Active Leads Pipeline</span>
                        <span className="text-xs font-black text-slate-200 font-mono">
                          {activePipelineCount} / {total} ({total > 0 ? Math.round((activePipelineCount / total) * 100) : 0}%)
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-450">Today's Tasks / Followups</span>
                        <span className="text-xs font-black text-amber-500 font-mono">
                          {stats.todayFollowups} scheduled
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-450">Overdue Followups</span>
                        <span className={`text-xs font-black font-mono ${stats.overdueFollowups > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {stats.overdueFollowups} overdue
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-3.5 mt-2">
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 mb-1">
                        <Inbox className="h-3 w-3" /> Quick Tip
                      </span>
                      <p className="text-[10.5px] text-slate-350 leading-relaxed font-medium">
                        Hover over any funnel stage card in the stack on the left to see dynamic performance statistics and concrete actionable recommendations to boost your sales velocity!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversionFunnel;
