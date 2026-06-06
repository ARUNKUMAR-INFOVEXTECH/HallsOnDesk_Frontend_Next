import React from 'react';

export function CalendarLegend() {
  const legendItems = [
    { label: 'Booking (Confirmed)', color: 'bg-[#7C3AED]' },
    { label: 'Booking (Pending)', color: 'bg-[#F59E0B]' },
    { label: 'Maintenance', color: 'bg-[#F97316]' },
    { label: 'Blocked Out', color: 'bg-[#6B7280]' },
    { label: 'Personal Schedule', color: 'bg-[#3B82F6]' },
    { label: 'Public Holiday', color: 'bg-[#10B981]' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-semibold text-slate-550">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Legend</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 shrink-0">
            <span className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-sm shrink-0`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
