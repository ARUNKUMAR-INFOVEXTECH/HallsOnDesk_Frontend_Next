'use client';

import React from 'react';

interface WorkingDaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 'Monday' },
  { label: 'Tue', value: 'Tuesday' },
  { label: 'Wed', value: 'Wednesday' },
  { label: 'Thu', value: 'Thursday' },
  { label: 'Fri', value: 'Friday' },
  { label: 'Sat', value: 'Saturday' },
  { label: 'Sun', value: 'Sunday' },
];

export default function WorkingDaySelector({
  selectedDays = [],
  onChange,
}: WorkingDaySelectorProps) {
  
  const handleDayToggle = (dayValue: string) => {
    if (selectedDays.includes(dayValue)) {
      // Don't allow selecting zero days
      if (selectedDays.length === 1) return;
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      onChange([...selectedDays, dayValue]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Operational Working Days</span>
      <div className="flex flex-wrap gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayToggle(day.value)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-violet-600 border-violet-650 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
