'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, Download } from 'lucide-react';
import { CalendarView, CalendarFilters } from '@/types/calendar';
import { CalendarFilterPanel } from './CalendarFilterPanel';

interface CalendarHeaderProps {
  title: string;
  activeView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (action: 'prev' | 'next' | 'today') => void;
  onAddEvent: () => void;
  onExportICS: () => void;
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
}

export function CalendarHeader({
  title,
  activeView,
  onViewChange,
  onNavigate,
  onAddEvent,
  onExportICS,
  filters,
  onFiltersChange,
}: CalendarHeaderProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const views: { id: CalendarView; label: string }[] = [
    { id: 'dayGridMonth', label: 'Month' },
    { id: 'timeGridWeek', label: 'Week' },
    { id: 'timeGridDay', label: 'Day' },
    { id: 'listWeek', label: 'List' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white p-4 shrink-0 shadow-custom-sm rounded-xl">
      {/* Left side: Month Year header title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
          Calendar Dashboard
        </h2>
        <p className="text-sm font-semibold text-slate-500 mt-1.5 font-sans leading-none">
          {title}
        </p>
      </div>

      {/* Right side: Navigation, Toggles and Controls */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
        
        {/* Navigation block */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg">
          <button
            onClick={() => onNavigate('prev')}
            className="p-1 rounded hover:bg-white text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-sm border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onNavigate('today')}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer bg-white border border-slate-200 rounded-md shadow-sm"
          >
            Today
          </button>

          <button
            onClick={() => onNavigate('next')}
            className="p-1 rounded hover:bg-white text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-sm border border-transparent hover:border-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher segment */}
        <div className="flex items-center bg-slate-50 p-1 border border-slate-200 rounded-lg">
          {views.map((v) => {
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={`px-3 py-1.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Action Panel: Filters & Add Event */}
        <div className="flex items-center gap-2 relative">
          
          {/* Filters slider toggle */}
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            Filters
          </button>

          {/* Filter dropdown element */}
          <CalendarFilterPanel
            filters={filters}
            onChange={onFiltersChange}
            isOpen={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
          />

          {/* Export iCal Button */}
          <button
            onClick={onExportICS}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg shadow-sm transition-all cursor-pointer"
            title="Export Calendar to Google Calendar (iCal/ICS format)"
          >
            <Download className="h-4 w-4 text-slate-400" />
            Export Calendar
          </button>

          {/* New Event Button */}
          <button
            onClick={onAddEvent}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Event
          </button>
        </div>

      </div>
    </div>
  );
}
