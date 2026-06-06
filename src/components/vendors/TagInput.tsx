'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add a tag and press Enter...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      const updated = [...value, trimmed];
      onChange(updated);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-2.5">
      {/* Tag Chips Container */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-2.5 py-1 text-xs font-bold font-mono"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:bg-violet-200/50 p-0.5 rounded-full text-violet-500 hover:text-violet-700 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Input block */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-h-[36px] bg-white border border-gray-250 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="h-9 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
export default TagInput;
