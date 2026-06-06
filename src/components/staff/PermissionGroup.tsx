'use client';

import React from 'react';
import { StaffPermission } from '@/types/staff';

interface PermissionItem {
  value: StaffPermission;
  label: string;
  description: string;
}

interface PermissionGroupProps {
  title: string;
  items: PermissionItem[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export function PermissionGroup({
  title,
  items,
  selectedPermissions,
  onChange,
}: PermissionGroupProps) {
  const handleToggle = (value: StaffPermission) => {
    if (selectedPermissions.includes(value)) {
      onChange(selectedPermissions.filter((p) => p !== value));
    } else {
      onChange([...selectedPermissions, value]);
    }
  };

  return (
    <div className="space-y-3 select-none">
      <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item) => {
          const isChecked = selectedPermissions.includes(item.value);
          return (
            <label
              key={item.value}
              onClick={() => handleToggle(item.value)}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? 'bg-violet-50/40 border-violet-200'
                  : 'bg-white border-slate-100 hover:border-slate-250'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-605 focus:ring-violet-500 accent-violet-600 cursor-pointer shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  {item.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block leading-normal">
                  {item.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
export default PermissionGroup;
