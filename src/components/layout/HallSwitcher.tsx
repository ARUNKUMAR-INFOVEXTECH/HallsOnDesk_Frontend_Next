'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Building2, ChevronDown, Check, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HallSwitcher() {
  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const setActiveHall = useAuthStore((state) => state.setActiveHall);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || user.role === 'super_admin' || !user.multi_hall_enabled) {
    return null;
  }

  const halls = user.accessible_halls || [];
  const isConsolidated = activeHallId === 'all';
  
  // Find currently active hall
  const activeHall = halls.find((h) => h.id === activeHallId) 
    || halls.find((h) => h.id === user.hall_id)
    || halls[0];

  const activeVenueName = isConsolidated ? 'All Managed Venues' : (activeHall?.hall_name || 'Active Venue');

  if (!activeHall && !isConsolidated) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-white/20 rounded-xl text-left transition-all duration-150 cursor-pointer shadow-sm group select-none"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#062089] shrink-0 shadow-inner">
            <Building2 className="h-4 w-4 text-[#062089]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
              {activeVenueName}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 group-hover:text-slate-700 shrink-0 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn py-1">
          <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/50 select-none">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Switch Venue
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {/* Consolidated Option */}
            <button
              type="button"
              onClick={() => {
                if (!isConsolidated) {
                  setActiveHall('all');
                }
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors cursor-pointer ${
                isConsolidated
                  ? 'bg-blue-50/60 text-[#062089] font-semibold border-l-2 border-[#159DFC]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
              }`}
            >
              <span className="text-xs truncate font-bold">All Managed Venues</span>
              {isConsolidated && <Check className="h-3.5 w-3.5 text-[#159DFC] shrink-0 font-bold" />}
            </button>

            <hr className="border-slate-100 my-1" />

            {halls.map((hall) => {
              const isActive = !isConsolidated && hall.id === activeHall.id;
              return (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => {
                    if (!isActive || isConsolidated) {
                      setActiveHall(hall.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/60 text-[#062089] font-semibold border-l-2 border-[#159DFC]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
                  }`}
                >
                  <span className="text-xs truncate">{hall.hall_name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-[#159DFC] shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>

          {/* Owner options: Register / Manage links */}
          {user.role === 'owner' && (
            <div className="border-t border-slate-100 p-1 bg-slate-50/50">
              {halls.length < 2 ? (
                <Link
                  href="/settings/general"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#062089]" />
                  <span>Register 2nd Hall</span>
                </Link>
              ) : (
                <Link
                  href="/settings/general"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-[#062089]" />
                  <span>Manage Workspace</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
