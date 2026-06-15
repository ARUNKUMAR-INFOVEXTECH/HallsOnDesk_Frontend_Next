'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  CalendarDays,
  IndianRupee,
  MoreVertical,
  Bell,
  AlertCircle,
  Clock,
  Plus,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  Calendar
} from 'lucide-react';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { Enquiry } from '@/types/enquiry';
import { SourceBadge } from './SourceBadge';
import { useRouter } from 'next/navigation';
import { obfuscateId } from '@/utils/obfuscate';

interface KanbanCardProps {
  enquiry: Enquiry;
  index: number;
  onEdit: (enquiry: Enquiry) => void;
  onAddFollowup: (enquiry: Enquiry) => void;
  onMarkLost: (enquiry: Enquiry) => void;
}

export function KanbanCard({
  enquiry,
  index,
  onEdit,
  onAddFollowup,
  onMarkLost,
}: KanbanCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format budget range
  const formatBudget = () => {
    if (enquiry.budgetMin === undefined && enquiry.budgetMax === undefined) {
      return <span className="text-[10px] text-slate-400 italic">Budget TBD</span>;
    }
    const minStr = enquiry.budgetMin ? `₹${enquiry.budgetMin.toLocaleString('en-IN')}` : '₹0';
    const maxStr = enquiry.budgetMax ? `₹${enquiry.budgetMax.toLocaleString('en-IN')}` : 'TBD';
    return (
      <span className="text-[10px] text-slate-655 font-bold font-mono flex items-center gap-0.5">
        <IndianRupee className="h-3 w-3 text-slate-400 shrink-0" />
        {minStr} — {maxStr}
      </span>
    );
  };

  // Get initials
  const getInitials = (name: string) => {
    if (!name) return 'LD';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Days in current stage
  const daysInStage = Math.max(0, differenceInDays(new Date(), new Date(enquiry.updatedAt)));

  // Identify next uncompleted followup
  const nextFollowup = enquiry.followups
    .filter((f) => !f.completedAt)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const renderFollowupStatus = () => {
    if (!nextFollowup) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFollowup(enquiry);
          }}
          className="flex items-center gap-1 text-[9px] font-bold text-slate-450 hover:text-violet-650 cursor-pointer transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add followup</span>
        </button>
      );
    }

    const scheduledDate = new Date(nextFollowup.scheduledAt);
    if (isToday(scheduledDate)) {
      return (
        <span className="flex items-center gap-1 text-[9px] font-extrabold text-amber-500 animate-pulse">
          <Bell className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>Follow up today</span>
        </span>
      );
    }

    if (isPast(scheduledDate)) {
      const daysOverdue = Math.max(1, differenceInDays(new Date(), scheduledDate));
      return (
        <span className="flex items-center gap-1 text-[9px] font-extrabold text-rose-505">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue</span>
        </span>
      );
    }

    const daysUntil = Math.max(1, differenceInDays(scheduledDate, new Date()));
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-450">
        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>Follow up in {daysUntil}d</span>
      </span>
    );
  };

  const priorityColors = {
    high: 'bg-rose-500 ring-4 ring-rose-500/10',
    medium: 'bg-amber-500 ring-4 ring-amber-500/10',
    low: 'bg-slate-400 ring-4 ring-slate-400/10',
  };

  const stageLabels = {
    new: 'New',
    interested: 'Interested',
    visit_scheduled: 'Visit Scheduled',
    visited: 'Visited',
    booked: 'Booked',
    lost: 'Lost',
  };

  return (
    <Draggable draggableId={enquiry.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => router.push(`/dashboard/enquiries/${obfuscateId(enquiry.id)}`)}
          className={`bg-white rounded-xl border border-slate-150 p-4.5 mb-3 shadow-custom-xs select-none transition-all hover:shadow-custom-sm cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'opacity-50 rotate-1 bg-violet-50/20 border-violet-300' : ''
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  priorityColors[enquiry.priority] || priorityColors.medium
                }`}
                title={`${enquiry.priority} priority`}
              />
              <span className="text-[10px] font-bold font-mono text-slate-400">
                {enquiry.enquiryNumber}
              </span>
            </div>

            {/* Actions Menu */}
            <div className="relative" ref={menuOpen ? menuRef : undefined}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-20 text-[11px] font-bold text-slate-705 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      router.push(`/dashboard/enquiries/${obfuscateId(enquiry.id)}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onAddFollowup(enquiry);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Add Followup
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(enquiry);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer border-t border-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Edit
                  </button>
                  {enquiry.stage !== 'lost' && enquiry.stage !== 'booked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onMarkLost(enquiry);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-650 text-left transition-colors cursor-pointer border-t border-slate-50"
                    >
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      Mark Lost
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Row */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-755 font-black text-[10px] flex items-center justify-center border border-violet-100 shrink-0 uppercase">
                {getInitials(enquiry.name)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-850 truncate leading-none">
                  {enquiry.name}
                </h4>
                <p className="text-[9px] font-mono text-slate-400 mt-1 truncate font-semibold">
                  {enquiry.phone}
                </p>
              </div>
            </div>
            {enquiry.assignee && (
              <div
                className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-black text-[8px] shrink-0 uppercase"
                title={`Assigned to ${enquiry.assignee.name}`}
              >
                {getInitials(enquiry.assignee.name)}
              </div>
            )}
          </div>

          {/* Event and Date */}
          <div className="mt-3.5 flex items-center justify-between gap-3">
            <span className="bg-slate-100 border border-slate-200 text-slate-655 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">
              {enquiry.eventType}
            </span>
            {enquiry.eventDate && (
              <span className="flex items-center gap-1 text-[9px] text-slate-450 font-mono font-bold">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {format(new Date(enquiry.eventDate), 'dd MMM yyyy')}
              </span>
            )}
          </div>

          {/* Budget */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-center justify-between">
            {formatBudget()}
            <SourceBadge source={enquiry.source} />
          </div>

          {/* Card Bottom Indicator Row */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
            {renderFollowupStatus()}
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              In {stageLabels[enquiry.stage] || enquiry.stage} for {daysInStage}d
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default KanbanCard;
