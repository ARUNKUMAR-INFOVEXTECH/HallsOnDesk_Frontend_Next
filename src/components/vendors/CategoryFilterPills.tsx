'use client';

import React from 'react';
import { VendorCategory } from '@/types/vendor';

interface CategoryFilterPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

export function CategoryFilterPills({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  totalCount = 0,
}: CategoryFilterPillsProps) {
  const categoriesList = [
    { value: 'all', label: 'All' },
    { value: 'caterer', label: 'Caterer' },
    { value: 'decorator', label: 'Decorator' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'dj', label: 'DJ' },
    { value: 'band', label: 'Band' },
    { value: 'florist', label: 'Florist' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'sound', label: 'Sound' },
    { value: 'tent', label: 'Tent & Shamiana' },
    { value: 'transport', label: 'Transport' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-none">
      <div className="flex gap-2.5 px-0.5">
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.value;
          
          // Deduce count values
          const count = cat.value === 'all' 
            ? totalCount 
            : categoryCounts[cat.value] || 0;

          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-sm rounded-full font-bold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-650 hover:border-violet-300'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default CategoryFilterPills;
