'use client';

import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { CalendarFilters, CalendarEventType, EventStatus } from '@/types/calendar';

interface CalendarFilterPanelProps {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarFilterPanel({
  filters,
  onChange,
  isOpen,
  onClose,
}: CalendarFilterPanelProps) {
  const [localEventTypes, setLocalEventTypes] = useState<CalendarEventType[]>(filters.eventTypes);
  const [localStatus, setLocalStatus] = useState<EventStatus[]>(filters.status);
  const [localHallSection, setLocalHallSection] = useState<string>(filters.hallSection);

  // Sync state when filters prop updates
  useEffect(() => {
    setLocalEventTypes(filters.eventTypes);
    setLocalStatus(filters.status);
    setLocalHallSection(filters.hallSection);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const eventTypesConfig = [
    { value: 'booking' as CalendarEventType, label: 'Booking', color: 'bg-[#7C3AED]' },
    { value: 'blocked' as CalendarEventType, label: 'Blocked Out', color: 'bg-[#6B7280]' },
    { value: 'maintenance' as CalendarEventType, label: 'Maintenance', color: 'bg-[#F97316]' },
    { value: 'personal' as CalendarEventType, label: 'Personal', color: 'bg-[#3B82F6]' },
    { value: 'holiday' as CalendarEventType, label: 'Holiday', color: 'bg-[#10B981]' },
  ];

  const statusOptions: EventStatus[] = ['confirmed', 'pending', 'cancelled', 'completed'];

  const hallSections = ['All Sections', 'Main Hall', 'Garden Area', 'Terrace'];

  const handleToggleEventType = (type: CalendarEventType) => {
    if (localEventTypes.includes(type)) {
      setLocalEventTypes(localEventTypes.filter((t) => t !== type));
    } else {
      setLocalEventTypes([...localEventTypes, type]);
    }
  };

  const handleToggleStatus = (status: EventStatus) => {
    if (localStatus.includes(status)) {
      setLocalStatus(localStatus.filter((s) => s !== status));
    } else {
      setLocalStatus([...localStatus, status]);
    }
  };

  const handleClear = () => {
    setLocalEventTypes([]);
    setLocalStatus([]);
    setLocalHallSection('All Sections');
  };

  const handleApply = () => {
    onChange({
      eventTypes: localEventTypes,
      status: localStatus,
      hallSection: localHallSection,
    });
    onClose();
  };

  return (
    <>
      {/* Background click-away overlay */}
      <div className="fixed inset-0 z-30 cursor-default" onClick={onClose} />

      {/* Filter Floating Card */}
      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-premium z-40 p-5 space-y-5 animate-fadeIn text-xs font-semibold text-slate-700">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <SlidersHorizontal className="h-4 w-4 text-[#EE9B00]" />
            Filter Schedule Events
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section A: Event Types */}
        <div className="space-y-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Event Categories</span>
          <div className="space-y-2">
            {eventTypesConfig.map((item) => {
              const isChecked = localEventTypes.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleToggleEventType(item.value)}
                  className="flex items-center justify-between w-full hover:bg-slate-50 p-1 rounded transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
                    <span>{item.label}</span>
                  </div>
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                    isChecked ? 'bg-primary-light border-primary-light text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section B: Booking Status */}
        <div className="space-y-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Booking Status</span>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => {
              const isChecked = localStatus.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleToggleStatus(status)}
                  className={`px-2.5 py-1 rounded-full border font-semibold capitalize text-[10px] transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-primary-lighter text-primary-light border-primary-light/30 font-bold'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section C: Hall Section */}
        <div className="space-y-2">
          <label htmlFor="filterHall" className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Hall Section Filter
          </label>
          <select
            id="filterHall"
            value={localHallSection}
            onChange={(e) => setLocalHallSection(e.target.value)}
            className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold"
          >
            {hallSections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-primary-light hover:bg-[#D48A00] text-white px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </>
  );
}
