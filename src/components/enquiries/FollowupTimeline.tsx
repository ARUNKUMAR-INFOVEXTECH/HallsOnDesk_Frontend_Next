'use client';

import React, { useState } from 'react';
import {
  Bell,
  Clock,
  CheckCircle,
  CalendarDays,
  Phone,
  MessageCircle,
  Mail,
  MoreHorizontal,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { Enquiry, Followup, FollowupType } from '@/types/enquiry';
import { useUpdateEnquiry } from '@/hooks/useEnquiries';
import { toast } from 'sonner';

interface FollowupTimelineProps {
  enquiry: Enquiry;
}

export function FollowupTimeline({ enquiry }: FollowupTimelineProps) {
  const updateEnquiryMutation = useUpdateEnquiry();

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [type, setType] = useState<FollowupType>('call');
  const [notes, setNotes] = useState('');

  // Pagination limit
  const [visibleCount, setVisibleCount] = useState(5);

  const followupTypes: { value: FollowupType; label: string; icon: any }[] = [
    { value: 'call', label: '📞 Call', icon: Phone },
    { value: 'whatsapp', label: '💬 WhatsApp', icon: MessageCircle },
    { value: 'visit', label: '🏃 Visit', icon: CalendarDays },
    { value: 'email', label: '📧 Email', icon: Mail },
    { value: 'other', label: '➕ Other', icon: MoreHorizontal },
  ];

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledAt) {
      toast.error('Schedule date and time is required');
      return;
    }

    const selected = new Date(scheduledAt);
    if (selected <= new Date()) {
      toast.error('Scheduled followup time must be in the future');
      return;
    }

    const newFollowup: Followup = {
      id: `fl-${Math.random().toString(36).substring(2, 7)}`,
      enquiryId: enquiry.id,
      scheduledAt: selected.toISOString(),
      type,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    const updatedFollowups = [...enquiry.followups, newFollowup];

    updateEnquiryMutation.mutate(
      {
        id: enquiry.id,
        data: {
          ...enquiry,
          followups: updatedFollowups,
        },
      },
      {
        onSuccess: () => {
          toast.success('Followup scheduled successfully');
          setFormOpen(false);
          setScheduledAt('');
          setType('call');
          setNotes('');
        },
      }
    );
  };

  const handleMarkDone = (followupId: string) => {
    const outcome = prompt('Enter followup outcome notes:', 'Contacted customer successfully.');
    if (outcome === null) return; // cancelled

    const scheduleNext = confirm('Do you want to schedule a next followup check-in?');
    let nextScheduledAt = '';
    let nextType: FollowupType = 'call';
    let nextNotes = '';

    if (scheduleNext) {
      const nextDate = prompt(
        'Enter next scheduled date and time (YYYY-MM-DD HH:mm):',
        format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "yyyy-MM-dd '11:00'")
      );
      if (nextDate) {
        const parsed = new Date(nextDate);
        if (!isNaN(parsed.getTime()) && parsed > new Date()) {
          nextScheduledAt = parsed.toISOString();
          const pType = prompt('Enter contact type (call, whatsapp, visit, email):', 'call');
          if (pType && ['call', 'whatsapp', 'visit', 'email', 'other'].includes(pType)) {
            nextType = pType as FollowupType;
          }
          nextNotes = prompt('Enter agenda notes for next followup:', '') || '';
        } else {
          toast.error('Invalid date entered. Next followup was not scheduled.');
        }
      }
    }

    let updatedFollowups = enquiry.followups.map((f) => {
      if (f.id === followupId) {
        return {
          ...f,
          completedAt: new Date().toISOString(),
          outcome: outcome || 'Completed',
          nextFollowupAt: nextScheduledAt || undefined,
        };
      }
      return f;
    });

    if (nextScheduledAt) {
      const nextFollowupObj: Followup = {
        id: `fl-${Math.random().toString(36).substring(2, 7)}`,
        enquiryId: enquiry.id,
        scheduledAt: nextScheduledAt,
        type: nextType,
        notes: nextNotes,
        createdAt: new Date().toISOString(),
      };
      updatedFollowups.push(nextFollowupObj);
    }

    updateEnquiryMutation.mutate({
      id: enquiry.id,
      data: {
        ...enquiry,
        followups: updatedFollowups,
      },
    });
  };

  const handleReschedule = (followupId: string) => {
    const newDate = prompt(
      'Enter new scheduled date and time (YYYY-MM-DD HH:mm):',
      format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd '11:00'")
    );

    if (!newDate) return;

    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      toast.error('Invalid scheduled date-time. Must be in the future.');
      return;
    }

    const updatedFollowups = enquiry.followups.map((f) => {
      if (f.id === followupId) {
        return {
          ...f,
          scheduledAt: parsedDate.toISOString(),
          notes: f.notes ? `${f.notes} (Rescheduled)` : 'Rescheduled',
        };
      }
      return f;
    });

    updateEnquiryMutation.mutate({
      id: enquiry.id,
      data: {
        ...enquiry,
        followups: updatedFollowups,
      },
    });
  };

  // Sort followups chronologically: completed at bottom, upcoming/overdue at top
  const sortedFollowups = [...enquiry.followups].sort((a, b) => {
    const aDone = !!a.completedAt;
    const bDone = !!b.completedAt;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    // Uncompleted followups sorted ascending (earliest first), completed followups sorted descending (most recent first)
    if (!aDone && !bDone) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    return new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime();
  });

  const visibleFollowups = sortedFollowups.slice(0, visibleCount);

  const getIcon = (typeVal: FollowupType) => {
    const match = followupTypes.find((t) => t.value === typeVal);
    return match ? match.icon : MoreHorizontal;
  };

  return (
    <div className="space-y-6 select-none bg-white rounded-xl border border-slate-150 p-5 shadow-sm">
      
      {/* Tab Header Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-50 pb-3.5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-extrabold text-slate-850">
            Followups & Scheduling ({enquiry.followups.length})
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold">Track historical calls and visit records</p>
        </div>

        {enquiry.stage !== 'booked' && enquiry.stage !== 'lost' && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-1.5 h-8.5 px-3 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{formOpen ? 'Cancel' : 'Add Followup'}</span>
          </button>
        )}
      </div>

      {/* Add Followup Inline Form Drawer */}
      {formOpen && (
        <form
          onSubmit={handleCreateFollowup}
          className="bg-violet-50/25 border border-violet-100 rounded-xl p-4.5 space-y-4 animate-in slide-in-from-top-3 duration-200"
        >
          {/* Visual Contact Type row */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
              Contact Channel
            </span>
            <div className="flex flex-wrap gap-2">
              {followupTypes.map((t) => {
                const isActive = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`h-8 px-3 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-violet-650 border-violet-650 text-white shadow-sm shadow-violet-200'
                        : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="scheduledAt" className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                Scheduled Date & Time (Future only)
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg outline-none hover:border-slate-305 focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-all font-semibold text-slate-705"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
              Followup Agenda Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discussing hall sections, expected guests, or payment plan details..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-250 rounded-lg outline-none hover:border-slate-305 focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-all font-semibold text-slate-705"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="h-8 px-3.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateEnquiryMutation.isPending}
              className="h-8 px-4 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Schedule Followup
            </button>
          </div>
        </form>
      )}

      {/* TIMELINE LIST */}
      {enquiry.followups.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 px-6 space-y-4">
          <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
            <Bell className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-extrabold text-slate-800">No followups scheduled yet</h4>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            Record client touchpoints (phone, whatsapp, site visits) to build history and boost conversions.
          </p>
          {enquiry.stage !== 'booked' && enquiry.stage !== 'lost' && (
            <button
              onClick={() => setFormOpen(true)}
              className="text-violet-650 hover:text-violet-755 border border-violet-200 hover:bg-violet-50/50 h-8 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule First Followup</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Vertical line list layout */}
          <div className="relative pl-6 border-l border-slate-100 space-y-8">
            {visibleFollowups.map((f) => {
              const Icon = getIcon(f.type);
              const sched = new Date(f.scheduledAt);
              const isCompleted = !!f.completedAt;
              const overdue = !isCompleted && isPast(sched) && !isToday(sched);
              const dueToday = !isCompleted && isToday(sched);

              return (
                <div key={f.id} className="relative">
                  {/* Circle Dot Marker on Left Border Line */}
                  <div
                    className={`absolute -left-9 top-1.5 h-5.5 w-5.5 rounded-full border-2 flex items-center justify-center bg-white shrink-0 ${
                      isCompleted
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : overdue
                        ? 'border-rose-500 bg-rose-50 text-rose-500 animate-pulse'
                        : 'border-violet-600 bg-violet-50 text-violet-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : overdue ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>

                  {/* Followup Header Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-655 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">
                        <Icon className="h-3 w-3 shrink-0 text-slate-450" />
                        {f.type}
                      </span>

                      <span className="text-[10px] font-mono text-slate-450 font-bold">
                        {format(sched, 'dd MMM yyyy, hh:mm a')}
                      </span>

                      {dueToday && (
                        <span className="text-[8px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.2 rounded font-sans">
                          Today
                        </span>
                      )}

                      {overdue && (
                        <span className="text-[8px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded font-sans animate-pulse">
                          Overdue
                        </span>
                      )}

                      {isCompleted && (
                        <span className="text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded font-sans">
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Followup Agenda notes */}
                    {f.notes && (
                      <p className="text-xs text-slate-550 leading-relaxed max-w-xl font-semibold">
                        {f.notes}
                      </p>
                    )}

                    {/* Completed meta logs */}
                    {isCompleted && (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-2.5 max-w-xl space-y-1 mt-1 text-[10px] text-slate-450 font-semibold leading-relaxed">
                        <div>
                          <strong className="text-slate-550">Completed at:</strong>{' '}
                          {format(new Date(f.completedAt!), 'dd MMM yyyy, hh:mm a')}
                        </div>
                        {f.outcome && (
                          <div>
                            <strong className="text-slate-550">Outcome Outcome:</strong>{' '}
                            <span className="italic">"{f.outcome}"</span>
                          </div>
                        )}
                        {f.nextFollowupAt && (
                          <div className="text-violet-650 font-bold">
                            📅 Next check-in booked for {format(new Date(f.nextFollowupAt), 'dd MMM yyyy')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Uncompleted Actions */}
                    {!isCompleted && enquiry.stage !== 'booked' && enquiry.stage !== 'lost' && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleMarkDone(f.id)}
                          className="h-6.5 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-150 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-custom-xs"
                        >
                          <CheckCircle className="h-3 w-3 shrink-0" />
                          <span>Mark Done</span>
                        </button>
                        <button
                          onClick={() => handleReschedule(f.id)}
                          className="h-6.5 px-2.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>Reschedule</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {sortedFollowups.length > visibleCount && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="text-[10px] font-bold text-violet-650 hover:text-violet-755 hover:underline cursor-pointer uppercase tracking-wider bg-violet-50/40 border border-violet-100 px-4 py-1.5 rounded-lg transition-colors"
              >
                Load More History
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default FollowupTimeline;
