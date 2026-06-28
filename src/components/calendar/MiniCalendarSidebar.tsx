'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, ChevronLeftSquare, ChevronRightSquare } from 'lucide-react';
import { useUpcomingEvents } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/types/calendar';
import { formatDate } from '@/utils/formatters';

interface MiniCalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const MiniCalendarSidebar = React.memo(function MiniCalendarSidebar({
  selectedDate,
  onDateSelect,
  onSelectEvent,
}: MiniCalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch upcoming events for next 30 days
  const { data: upcomingEvents = [], isLoading } = useUpcomingEvents(30);

  // Take the next 5 events
  const nextEvents = upcomingEvents.slice(0, 5);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Generate date grid cells
  const cells: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

  // Padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, month - 1, day);
    cells.push({ date: d, isCurrentMonth: false, key: `prev-${day}` });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ date: d, isCurrentMonth: true, key: `curr-${day}` });
  }

  // Padding days for next month to complete the row of 7s (typically 42 cells total)
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day);
    cells.push({ date: d, isCurrentMonth: false, key: `next-${day}` });
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-slate-200 bg-white h-full flex flex-col items-center py-4 shrink-0 transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm mb-4"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
        <div className="flex-1 flex flex-col items-center gap-6 mt-4">
          <div className="rotate-90 origin-center text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Upcoming Events
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-slate-200 bg-white h-full flex flex-col shrink-0 transition-all duration-300 overflow-y-auto no-scrollbar">
      {/* Sidebar Header / Collapser */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#159DFC]" />
          Schedule Helper
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Mini Calendar Month Selector */}
        <div className="space-y-3 select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Days Week Names */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days grid cells */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center text-xs font-semibold">
            {cells.map((cell) => {
              const active = isSelected(cell.date);
              const currentToday = isToday(cell.date);

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => onDateSelect(cell.date)}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer text-[11px] ${
                    active
                      ? 'bg-violet-600 text-white font-bold shadow-sm'
                      : currentToday
                      ? 'bg-primary-lighter text-primary-light font-bold border border-primary-light/20'
                      : cell.isCurrentMonth
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-350 hover:bg-slate-50'
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Upcoming Checklist panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Upcoming (30 days)
            </span>
            {isLoading && (
              <span className="text-[10px] text-slate-400 animate-pulse font-semibold">
                syncing...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2.5 animate-pulse">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-14 bg-slate-50 border border-slate-100 rounded-lg" />
                ))}
              </div>
            ) : nextEvents.length > 0 ? (
              nextEvents.map((event) => {
                const eventDate = new Date(event.start);
                const isEventBooking = event.type === 'booking';

                return (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-150 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer flex flex-col gap-1.5"
                  >
                    {/* Event Tag Color Bar / Dot */}
                    <div className="flex items-center gap-1.5 w-full">
                      <span className={`h-2 w-2 rounded-full ${
                        event.type === 'booking'
                          ? event.status === 'confirmed' ? 'bg-[#159DFC]' : 'bg-[#F59E0B]'
                          : event.type === 'maintenance' ? 'bg-[#F97316]' : 'bg-[#3B82F6]'
                      } shrink-0`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">
                        {event.type}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                      {event.title}
                    </span>

                    <div className="flex flex-col gap-1 text-[10px] text-slate-550 leading-none">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{formatDate(event.start)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-lg">
                No upcoming events
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
