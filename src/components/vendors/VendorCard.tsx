'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, MapPin, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Vendor, VendorCategory } from '@/types/vendor';
import { StarRating } from './StarRating';
import { CategoryBadge } from './CategoryBadge';
import { formatCurrency } from '@/utils/currency';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string, name: string) => void;
}

export function VendorCard({ vendor, onEdit, onDelete }: VendorCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      caterer: 'bg-orange-100 text-orange-700',
      decorator: 'bg-pink-100 text-pink-700',
      photographer: 'bg-blue-100 text-blue-700',
      videographer: 'bg-purple-100 text-purple-700',
      dj: 'bg-green-100 text-green-700',
      band: 'bg-yellow-100 text-yellow-750',
      florist: 'bg-rose-100 text-rose-700',
      lighting: 'bg-amber-100 text-amber-700',
      sound: 'bg-cyan-100 text-cyan-700',
      tent: 'bg-stone-100 text-stone-700',
      transport: 'bg-slate-100 text-slate-700',
      security: 'bg-red-100 text-red-750',
      cleaning: 'bg-teal-100 text-teal-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return styles[cat] || styles.other;
  };

  const getStatusDotColor = (status: string) => {
    if (status === 'inactive') return 'bg-gray-400';
    if (status === 'blacklisted') return 'bg-red-500 animate-pulse';
    return 'bg-green-500';
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
      return `${diffDays}d ago`;
    }
    if (diffMonths === 1) return '1m ago';
    return `${diffMonths}m ago`;
  };

  const handleCardClick = () => {
    router.push(`/dashboard/vendors/${vendor.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-custom-md hover:border-violet-200 hover:-translate-y-0.5 transition-all p-4.5 space-y-4 cursor-pointer relative select-none"
    >
      {/* CARD TOP */}
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          {/* Avatar Initials Circle */}
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-white/20 shadow-inner ${getCategoryAvatarStyles(
              vendor.category
            )}`}
          >
            {getInitials(vendor.name)}
          </div>

          <div className="min-w-0 space-y-1">
            <h4 className="font-extrabold text-sm text-slate-850 tracking-tight leading-snug truncate pr-6">
              {vendor.name}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={vendor.category} />
              <StarRating value={vendor.rating} readonly size="sm" />
            </div>
          </div>
        </div>

        {/* Status Dot + Dropdown Menu */}
        <div className="flex items-center gap-2 absolute top-0.5 right-0.5" ref={menuRef}>
          <span
            className={`h-2 w-2 rounded-full border border-white shadow-sm shrink-0 ${getStatusDotColor(
              vendor.status
            )}`}
            title={`Status: ${vendor.status}`}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Action Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-7 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-20 text-xs font-semibold text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  router.push(`/dashboard/vendors/${vendor.id}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                View Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(vendor);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Edit Vendor
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(vendor.id, vendor.name);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 text-left transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-rose-550 shrink-0" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARD MIDDLE */}
      <div className="space-y-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-slate-700 font-bold">{vendor.phone}</span>
        </div>
        {vendor.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{vendor.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {vendor.city}, {vendor.state}
          </span>
        </div>
      </div>

      {/* CARD BOTTOM */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        <div className="flex flex-col gap-0.5 leading-none">
          <span>Engaged</span>
          <span className="text-slate-700 font-extrabold mt-1 text-[11px]">
            {vendor.totalEngagements}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 leading-none items-center">
          <span>Total Paid</span>
          <span className="text-emerald-600 font-extrabold mt-1 text-[11px]">
            {formatCurrency(vendor.totalAmountPaid)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 leading-none items-end">
          <span>Last Used</span>
          <span className="text-slate-700 font-extrabold mt-1 text-[11px]">
            {getMonthsAgo(vendor.lastEngagementDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
export default VendorCard;
