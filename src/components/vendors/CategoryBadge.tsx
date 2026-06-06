'use client';

import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  Camera,
  Video,
  Music,
  Music2,
  Flower2,
  Lightbulb,
  Volume2,
  Tent,
  Truck,
  Shield,
  Brush,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { VendorCategory } from '@/types/vendor';

interface CategoryBadgeProps {
  category: VendorCategory;
  className?: string;
}

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  badgeStyle: string;
  iconStyle: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const configs: Record<VendorCategory, CategoryConfig> = {
    caterer: {
      label: 'Caterer',
      icon: UtensilsCrossed,
      badgeStyle: 'bg-orange-50 text-orange-700 border-orange-250',
      iconStyle: 'text-orange-600',
    },
    decorator: {
      label: 'Decorator',
      icon: Sparkles,
      badgeStyle: 'bg-pink-50 text-pink-700 border-pink-250',
      iconStyle: 'text-pink-600',
    },
    photographer: {
      label: 'Photographer',
      icon: Camera,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-250',
      iconStyle: 'text-blue-600',
    },
    videographer: {
      label: 'Videographer',
      icon: Video,
      badgeStyle: 'bg-purple-50 text-purple-750 border-purple-250',
      iconStyle: 'text-purple-650',
    },
    dj: {
      label: 'DJ',
      icon: Music,
      badgeStyle: 'bg-green-50 text-green-700 border-green-250',
      iconStyle: 'text-green-600',
    },
    band: {
      label: 'Live Band',
      icon: Music2,
      badgeStyle: 'bg-yellow-50 text-yellow-750 border-yellow-250',
      iconStyle: 'text-yellow-600',
    },
    florist: {
      label: 'Florist',
      icon: Flower2,
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-255',
      iconStyle: 'text-rose-600',
    },
    lighting: {
      label: 'Lighting',
      icon: Lightbulb,
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-250',
      iconStyle: 'text-amber-600',
    },
    sound: {
      label: 'Sound System',
      icon: Volume2,
      badgeStyle: 'bg-cyan-50 text-cyan-750 border-cyan-250',
      iconStyle: 'text-cyan-600',
    },
    tent: {
      label: 'Tent & Shamiana',
      icon: Tent,
      badgeStyle: 'bg-stone-50 text-stone-700 border-stone-250',
      iconStyle: 'text-stone-605',
    },
    transport: {
      label: 'Transport',
      icon: Truck,
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-250',
      iconStyle: 'text-slate-600',
    },
    security: {
      label: 'Security',
      icon: Shield,
      badgeStyle: 'bg-red-50 text-red-750 border-red-250',
      iconStyle: 'text-red-650',
    },
    cleaning: {
      label: 'Cleaning & Setup',
      icon: Brush,
      badgeStyle: 'bg-teal-50 text-teal-700 border-teal-250',
      iconStyle: 'text-teal-600',
    },
    other: {
      label: 'Other',
      icon: MoreHorizontal,
      badgeStyle: 'bg-gray-50 text-gray-750 border-gray-200',
      iconStyle: 'text-gray-600',
    },
  };

  const config = configs[category] || configs.other;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wider ${config.badgeStyle} ${className}`}
    >
      <Icon className={`h-3 w-3 shrink-0 ${config.iconStyle}`} />
      {config.label}
    </span>
  );
}
export default CategoryBadge;
