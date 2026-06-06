'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Clock,
  CheckCircle,
  CalendarDays,
  Phone,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  Mail,
  User,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { Enquiry, Followup } from '@/types/enquiry';
import { useUpdateEnquiry } from '@/hooks/useEnquiries';
import { toast } from 'sonner';

interface TodayFollowupsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  followups: any[];
  isLoading?: boolean;
}

export function TodayFollowupsDrawer({
  isOpen,
  onClose,
  followups,
  isLoading = false,
}: TodayFollowupsDrawerProps) {
  const updateEnquiryMutation = useUpdateEnquiry();

  // Split into overdue and today's followups
  const overdueItems = followups.filter((f) => f.isOverdue);
  const todayItems = followups.filter((f) => !f.isOverdue);

  const handleMarkDone = (item: any) => {
    const parentEnquiry: Enquiry = item.enquiry;
    if (!parentEnquiry) return;

    // Map new followups array with item marked done
    const updatedFollowups = parentEnquiry.followups.map((f) => {
      if (f.id === item.id) {
        return {
          ...f,
          completedAt: new Date().toISOString(),
          outcome: 'Completed via Today Followups Drawer',
        };
      }
      return f;
    });

    updateEnquiryMutation.mutate(
      {
        id: parentEnquiry.id,
        data: {
          ...parentEnquiry,
          followups: updatedFollowups,
        },
      },
      {
        onSuccess: () => {
          toast.success('Followup marked as completed');
        },
      }
    );
  };

  const handleReschedule = (item: any) => {
    const parentEnquiry: Enquiry = item.enquiry;
    if (!parentEnquiry) return;

    const newDate = prompt(
      'Enter new scheduled date and time (YYYY-MM-DD HH:mm):',
      format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd '11:00'")
    );

    if (!newDate) return;

    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      toast.error('Invalid date format entered');
      return;
    }

    if (parsedDate <= new Date()) {
      toast.error('Rescheduled date must be in the future');
      return;
    }

    const updatedFollowups = parentEnquiry.followups.map((f) => {
      if (f.id === item.id) {
        return {
          ...f,
          scheduledAt: parsedDate.toISOString(),
          notes: f.notes ? `${f.notes} (Rescheduled)` : 'Rescheduled',
        };
      }
      return f;
    });

    updateEnquiryMutation.mutate(
      {
        id: parentEnquiry.id,
        data: {
          ...parentEnquiry,
          followups: updatedFollowups,
        },
      },
      {
        onSuccess: () => {
          toast.success('Followup rescheduled successfully');
        },
      }
    );
  };

  const getFollowupIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'whatsapp':
        return MessageCircle;
      case 'visit':
        return CalendarDays;
      case 'email':
        return Mail;
      default:
        return MoreHorizontal;
    }
  };

  const renderFollowupCard = (item: any, isOverdue: boolean) => {
    const Icon = getFollowupIcon(item.type);
    const enquiry: Enquiry = item.enquiry || {};

    return (
      <div
        key={item.id}
        className={`bg-white rounded-xl border p-4.5 mb-3 shadow-custom-xs transition-all hover:shadow-custom-sm relative overflow-hidden ${
          isOverdue ? 'border-l-4 border-l-rose-500 border-slate-150' : 'border-slate-150'
        }`}
      >
        {/* Card Header Info */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold font-mono text-slate-400">
            {enquiry.enquiryNumber || 'ENQ-TBD'}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                enquiry.priority === 'high'
                  ? 'bg-rose-500 animate-pulse'
                  : enquiry.priority === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-slate-450'
              }`}
              title={`${enquiry.priority} priority`}
            />
            <span className="text-[9px] font-black uppercase text-slate-405">
              {enquiry.priority}
            </span>
          </div>
        </div>

        {/* Customer Detail */}
        <div className="mt-2.5 flex items-start gap-2.5">
          <div className="h-7 w-7 rounded-full bg-violet-50 text-violet-755 font-black text-[10px] flex items-center justify-center border border-violet-100 shrink-0 uppercase">
            {enquiry.name ? enquiry.name.substring(0, 2) : 'ST'}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-slate-800 leading-none">
              {enquiry.name || 'Anonymous client'}
            </h4>
            <p className="text-[10px] font-mono text-slate-455 mt-1">
              📞 {enquiry.phone || 'No phone'}
            </p>
          </div>
        </div>

        {/* Requirements summary */}
        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between text-[9px] font-bold text-slate-505">
          <span className="capitalize">{enquiry.eventType || 'Other event'}</span>
          <span>{enquiry.eventDate ? format(new Date(enquiry.eventDate), 'dd MMM yyyy') : 'Date TBD'}</span>
        </div>

        {/* Followup type and scheduled time */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-655 px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">
            <Icon className="h-3 w-3 shrink-0" />
            {item.type}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-450 font-mono">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {format(new Date(item.scheduledAt), 'hh:mm a')}
          </span>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="mt-2 text-[10px] text-slate-400 italic bg-slate-50/50 p-2 rounded border border-dashed border-slate-100">
            {item.notes}
          </p>
        )}

        {/* Action controls */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          {/* Call Link */}
          {enquiry.phone && (
            <a
              href={`tel:${enquiry.phone}`}
              className="h-7 w-7 rounded-md border border-slate-200 text-violet-650 hover:bg-violet-50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              title="Call Customer Now"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {/* Reschedule */}
          <button
            onClick={() => handleReschedule(item)}
            className="h-7 px-2.5 rounded-md border border-slate-200 hover:border-slate-350 text-slate-655 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Reschedule Appointment"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Reschedule</span>
          </button>
          {/* Complete */}
          <button
            onClick={() => handleMarkDone(item)}
            className="h-7 px-3 bg-green-550 hover:bg-green-650 text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-green-100"
            title="Mark Completed"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Mark Completed</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            className="relative bg-[#FAFAFA] w-full max-w-[420px] h-full shadow-custom-lg border-l border-slate-150 flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="bg-white border-b border-slate-150 px-5 py-4.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-850">Today's Followups</h3>
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-705 px-2 py-0.5 rounded-full">
                    {followups.length} tasks
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {format(new Date(), 'EEEE, dd MMM yyyy')}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-605 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable List Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl h-44 border border-slate-150 w-full" />
                  ))}
                </div>
              ) : followups.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 px-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800">All clear for today</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    No followups or site visit tasks scheduled for today. You are up to date!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* OVERDUE SECTION */}
                  {overdueItems.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-rose-600 font-extrabold text-[10px] uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{overdueItems.length} Overdue Followups</span>
                      </div>
                      <div className="space-y-3">
                        {overdueItems.map((item) => renderFollowupCard(item, true))}
                      </div>
                    </div>
                  )}

                  {/* TODAY'S ITEMS SECTION */}
                  {todayItems.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-slate-450 font-extrabold text-[10px] uppercase tracking-wider">
                        <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Scheduled Today ({todayItems.length})</span>
                      </div>
                      <div className="space-y-3">
                        {todayItems.map((item) => renderFollowupCard(item, false))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-150 p-4 flex items-center justify-end">
              <button
                onClick={onClose}
                className="h-9 px-4.5 border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TodayFollowupsDrawer;
