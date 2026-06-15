'use client';

import React from 'react';
import { StaffDepartment } from '@/types/staff';

interface DepartmentFilterPillsProps {
  selectedDept: string;
  onSelectDept: (dept: string) => void;
  departmentCounts?: Record<string, number>;
  totalCount?: number;
}

export function DepartmentFilterPills({
  selectedDept,
  onSelectDept,
  departmentCounts = {},
  totalCount = 0,
}: DepartmentFilterPillsProps) {
  const deptsList = [
    { value: 'all', label: 'All' },
    { value: 'management', label: 'Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'security', label: 'Security' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-none select-none">
      <div className="flex gap-2.5 px-0.5">
        {deptsList.map((dept) => {
          const isActive = selectedDept === dept.value;
          const count = dept.value === 'all'
            ? totalCount
            : departmentCounts[dept.value] || 0;

          return (
            <button
              key={dept.value}
              onClick={() => onSelectDept(dept.value)}
              className={`flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-sm rounded-full font-bold border transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white border-gray-200 text-gray-655 hover:border-primary-light'
              }`}
            >
              <span>{dept.label}</span>
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
export default DepartmentFilterPills;
