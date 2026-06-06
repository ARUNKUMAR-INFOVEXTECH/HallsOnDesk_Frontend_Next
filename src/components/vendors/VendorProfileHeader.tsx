'use client';

import React from 'react';
import { Phone, Mail, MapPin, Pencil, Trash2, Calendar } from 'lucide-react';
import { Vendor, VendorCategory } from '@/types/vendor';
import { CategoryBadge } from './CategoryBadge';
import { VendorStatusBadge } from './VendorStatusBadge';
import { StarRating } from './StarRating';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';

interface VendorProfileHeaderProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function VendorProfileHeader({
  vendor,
  onEdit,
  onDelete,
  isDeleting = false,
}: VendorProfileHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return 'VD';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getCategoryAvatarStyles = (cat: VendorCategory) => {
    const styles: Record<VendorCategory, string> = {
      caterer: 'bg-orange-100 text-orange-700 border-orange-200',
      decorator: 'bg-pink-100 text-pink-700 border-pink-200',
      photographer: 'bg-blue-100 text-blue-700 border-blue-200',
      videographer: 'bg-purple-100 text-purple-700 border-purple-200',
      dj: 'bg-green-100 text-green-700 border-green-200',
      band: 'bg-yellow-100 text-yellow-750 border-yellow-200',
      florist: 'bg-rose-100 text-rose-700 border-rose-200',
      lighting: 'bg-amber-100 text-amber-700 border-amber-200',
      sound: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      tent: 'bg-stone-100 text-stone-700 border-stone-200',
      transport: 'bg-slate-100 text-slate-700 border-slate-200',
      security: 'bg-red-100 text-red-755 border-red-200',
      cleaning: 'bg-teal-100 text-teal-700 border-teal-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[cat] || styles.other;
  };

  const getMonthsAgo = (dateStr?: string) => {
    if (!dateStr || dateStr === '—') return 'Never';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Never';
    const now = new Date();
    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
    if (diffMonths <= 0) {
      const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    }
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-5 md:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 select-none">
      
      {/* Left section: Avatar & Profile Info */}
      <div className="flex items-start md:items-center gap-4.5">
        <div
          className={`h-16 w-16 md:h-18 md:w-18 rounded-xl flex items-center justify-center font-black text-2xl md:text-3xl shrink-0 border shadow-inner ${getCategoryAvatarStyles(
            vendor.category
          )}`}
        >
          {getInitials(vendor.name)}
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight leading-tight truncate">
              {vendor.name}
            </h2>
            <VendorStatusBadge status={vendor.status} />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <CategoryBadge category={vendor.category} />
            <div className="flex items-center gap-1.5">
              <StarRating value={vendor.rating} readonly size="sm" />
              <span className="text-xs font-bold text-slate-500 font-mono">
                ({vendor.rating.toFixed(1)})
              </span>
            </div>
          </div>

          {/* Quick contact parameters */}
          <div className="text-[11px] font-semibold text-slate-450 flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-605">{vendor.phone}</span>
            </span>
            {vendor.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{vendor.email}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {vendor.city}, {vendor.state}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle/Right: Spent Quick Stats Metrics */}
      <div className="flex items-center gap-4.5 flex-wrap self-start lg:self-auto border-t border-slate-50 pt-4 lg:pt-0 lg:border-t-0">
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center min-w-[90px]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Engagements</span>
          <span className="block text-slate-800 font-black font-mono text-sm mt-0.5">
            {vendor.totalEngagements}
          </span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl px-4 py-2 text-center min-w-[105px]">
          <span className="text-[9px] uppercase tracking-wider text-emerald-600/70 font-bold">Total Paid</span>
          <span className="block text-emerald-600 font-black font-mono text-sm mt-0.5">
            {formatCurrency(vendor.totalAmountPaid)}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center min-w-[95px]">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Last Used</span>
          <span className="block text-slate-700 font-black font-mono text-xs mt-0.5">
            {getMonthsAgo(vendor.lastEngagementDate)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-605 shadow-sm transition-all cursor-pointer"
            title="Edit Vendor"
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            title="Delete Vendor"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
export default VendorProfileHeader;
