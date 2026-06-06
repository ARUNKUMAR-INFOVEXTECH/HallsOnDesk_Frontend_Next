'use client';

import React from 'react';

interface SettingsToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function SettingsToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleRowProps) {
  const toggleId = React.useId();
  return (
    <div className={`flex items-start justify-between gap-4 p-3 hover:bg-gray-50/50 rounded-lg transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="space-y-0.5">
        <label htmlFor={toggleId} className="text-xs font-bold text-gray-800 cursor-pointer">
          {title}
        </label>
        {description && <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">{description}</p>}
      </div>

      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-650" />
      </label>
    </div>
  );
}
