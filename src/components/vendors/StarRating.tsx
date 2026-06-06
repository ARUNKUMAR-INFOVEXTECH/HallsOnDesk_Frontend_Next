'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const currentVal = hoverValue !== null ? hoverValue : value;

  const handleClick = (starIdx: number) => {
    if (!readonly && onChange) {
      onChange(starIdx);
    }
  };

  const handleMouseEnter = (starIdx: number) => {
    if (!readonly) {
      setHoverValue(starIdx);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div className="flex items-center gap-1 select-none">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentVal;
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            </button>
          );
        })}
      </div>
      {!readonly && onChange && (
        <span className="text-xs font-bold text-slate-500 font-mono ml-1.5">
          {currentVal}/5
        </span>
      )}
    </div>
  );
}
export default StarRating;
