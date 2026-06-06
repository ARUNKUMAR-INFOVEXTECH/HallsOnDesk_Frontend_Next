'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  useEnquiry,
  useUpdateEnquiry,
  useUpdateEnquiryStage
} from '@/hooks/useEnquiries';
import { EnquiryDetailHeader } from '@/components/enquiries/EnquiryDetailHeader';
import { FollowupTimeline } from '@/components/enquiries/FollowupTimeline';
import { ConvertToBookingForm } from '@/components/enquiries/ConvertToBookingForm';
import { EnquiryForm } from '@/components/enquiries/EnquiryForm';
import { PriorityBadge } from '@/components/enquiries/PriorityBadge';
import { SourceBadge } from '@/components/enquiries/SourceBadge';
import { LostReasonModal } from '@/components/enquiries/LostReasonModal';
import { EnquiryStage } from '@/types/enquiry';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Building,
  IndianRupee,
  FileText,
  Clock,
  UserCheck,
  Plus,
  Pencil,
  AlertCircle,
  RefreshCw,
  SearchX,
  ArrowRightCircle,
  XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

function EnquiryDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const enquiryId = String(params.id || '');

  // Tabs management
  const [activeTab, setActiveTab] = useState<'overview' | 'followups' | 'activity' | 'convert'>('overview');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam && ['overview', 'followups', 'activity', 'convert'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Edit / Modals state
  const [isEditing, setIsEditing] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  // API Hooks
  const { data: enquiry, isLoading, isError, refetch } = useEnquiry(enquiryId);
  const updateEnquiryMutation = useUpdateEnquiry();
  const updateStageMutation = useUpdateEnquiryStage();

  useEffect(() => {
    if (enquiry) {
      setNotesText(enquiry.notes || '');
    }
  }, [enquiry]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none py-4">
        {/* Header skeleton */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl h-44 w-full" />
        {/* Tab skeleton */}
        <div className="h-10 bg-slate-100 rounded-lg w-full max-w-sm" />
        {/* Body skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 border border-slate-200 rounded-xl w-full" />
          <div className="h-80 bg-slate-100 border border-slate-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (isError || !enquiry) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4 select-none">
        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
          <SearchX className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800 font-sans">Enquiry Not Found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The requested lead file could not be fetched or has been removed from the Mandapam CRM.
        </p>
        <button
          onClick={() => router.push('/dashboard/enquiries')}
          className="bg-violet-650 hover:bg-violet-755 text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Back to Enquiries
        </button>
      </div>
    );
  }

  const handleStageChange = (newStage: EnquiryStage) => {
    if (newStage === 'booked') {
      // Must use Convert flow
      setActiveTab('convert');
      router.replace(`/dashboard/enquiries/${enquiry.id}?tab=convert`);
      return;
    }

    if (newStage === 'lost') {
      setLostModalOpen(true);
      return;
    }

    updateStageMutation.mutate({
      id: enquiry.id,
      stage: newStage,
    });
  };

  const handleLostConfirm = (reason: string, notes: string) => {
    updateStageMutation.mutate({
      id: enquiry.id,
      stage: 'lost',
      lostReason: reason,
      notes: notes,
    });
    setLostModalOpen(false);
  };

  const handleSaveEdit = async (data: any) => {
    try {
      await updateEnquiryMutation.mutateAsync({
        id: enquiry.id,
        data,
      });
      setIsEditing(false);
      router.replace(`/dashboard/enquiries/${enquiry.id}`);
    } catch (err) {
      console.error('Lead update failed:', err);
    }
  };

  const handleSaveNotes = () => {
    updateEnquiryMutation.mutate(
      {
        id: enquiry.id,
        data: {
          ...enquiry,
          notes: notesText,
        },
      },
      {
        onSuccess: () => {
          setIsEditingNotes(false);
          toast.success('Notes updated');
        },
      }
    );
  };

  // Activity events generator
  const getActivities = () => {
    const list: {
      type: string;
      title: string;
      description: string;
      date: Date;
      dotColor: string;
    }[] = [];

    // 1. Creation
    list.push({
      type: 'created',
      title: 'Enquiry Created',
      description: `Lead account registered by acquisition channel ${enquiry.source.replace('_', ' ')}.`,
      date: new Date(enquiry.createdAt),
      dotColor: 'bg-slate-400',
    });

    // 2. Followups
    enquiry.followups.forEach((f) => {
      list.push({
        type: 'followup_scheduled',
        title: `Followup Scheduled (${f.type.toUpperCase()})`,
        description: `Check-in scheduled for ${format(new Date(f.scheduledAt), 'dd MMM yyyy, hh:mm a')}.${
          f.notes ? ` Agenda: ${f.notes}` : ''
        }`,
        date: new Date(f.createdAt),
        dotColor: 'bg-violet-500',
      });

      if (f.completedAt) {
        list.push({
          type: 'followup_completed',
          title: `Followup Completed (${f.type.toUpperCase()})`,
          description: `Outcome: ${f.outcome || 'Completed check-in.'}`,
          date: new Date(f.completedAt),
          dotColor: 'bg-green-500',
        });
      }
    });

    // 3. Stage changes
    if (enquiry.stage !== 'new') {
      list.push({
        type: 'stage_changed',
        title: 'Stage Changed',
        description: `Pipeline stage updated to ${enquiry.stage.replace('_', ' ')}.`,
        date: new Date(enquiry.updatedAt),
        dotColor: 'bg-blue-500',
      });
    }

    // 4. Lost
    if (enquiry.stage === 'lost') {
      list.push({
        type: 'lost',
        title: 'Marked as Lost',
        description: `Reason: ${enquiry.lostReason || 'Not specified'}. notes: ${enquiry.notes || 'None'}`,
        date: new Date(enquiry.updatedAt),
        dotColor: 'bg-rose-500',
      });
    }

    // 5. Converted
    if (enquiry.stage === 'booked' && enquiry.convertedAt) {
      list.push({
        type: 'converted',
        title: 'Converted to Booking',
        description: `Successfully converted into reservation ID: #BKG-${enquiry.bookingId?.substring(0, 5).toUpperCase() || 'CONFIRMED'}.`,
        date: new Date(enquiry.convertedAt),
        dotColor: 'bg-green-600 font-bold',
      });
    }

    // Sort descending chronologically
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'followups', label: 'Followups' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'convert', label: 'Convert to Booking' },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* 1. DETAIL HEADER CARD */}
      <EnquiryDetailHeader
        enquiry={enquiry}
        onEdit={() => setIsEditing(true)}
        onConvert={() => {
          setActiveTab('convert');
          router.replace(`/dashboard/enquiries/${enquiry.id}?tab=convert`);
        }}
        onMarkLost={() => setLostModalOpen(true)}
        onStageChange={handleStageChange}
      />

      {/* 2. TABS UNDERLINE ROW */}
      <div className="flex border-b border-slate-200 gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsEditing(false);
                router.replace(`/dashboard/enquiries/${enquiry.id}?tab=${tab.id}`);
              }}
              className={`pb-2.5 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-violet-605 text-violet-650 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-655'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. TABS CONTENT */}
      {isEditing ? (
        /* Edit Section Override */
        <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-50 mb-5">
            <h3 className="text-sm font-extrabold text-slate-800">Edit Enquiry details</h3>
            <button
              onClick={() => {
                setIsEditing(false);
                router.replace(`/dashboard/enquiries/${enquiry.id}`);
              }}
              className="text-xs text-slate-400 hover:text-slate-655 font-bold cursor-pointer hover:underline"
            >
              Cancel Edit
            </button>
          </div>
          <EnquiryForm
            defaultValues={enquiry}
            onSubmit={handleSaveEdit}
            isSubmitting={updateEnquiryMutation.isPending}
            onCancel={() => {
              setIsEditing(false);
              router.replace(`/dashboard/enquiries/${enquiry.id}`);
            }}
            submitButtonText="Save Changes"
          />
        </div>
      ) : activeTab === 'overview' ? (
        /* OVERVIEW TAB Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: Metadata columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Enquiry info */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-violet-650 shrink-0" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Lead Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-655">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Customer Name</span>
                  <span className="text-slate-800 font-extrabold mt-0.5 block">{enquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Phone number</span>
                  <span className="text-slate-800 mt-0.5 block font-mono">{enquiry.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Email address</span>
                  <span className="text-slate-800 mt-0.5 block">{enquiry.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">City location</span>
                  <span className="text-slate-800 mt-0.5 block">{enquiry.city || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Acquisition Channel</span>
                  <div className="mt-0.5">
                    <SourceBadge source={enquiry.source} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Priority status</span>
                  <div className="mt-0.5">
                    <PriorityBadge priority={enquiry.priority} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Requirements details */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-violet-650 shrink-0" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Event Requirements
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-655">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Event Category</span>
                  <span className="text-slate-850 font-extrabold mt-0.5 block capitalize">{enquiry.eventType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Proposed eventDate</span>
                  <span className="text-slate-800 mt-0.5 block font-mono">
                    {enquiry.eventDate ? format(new Date(enquiry.eventDate), 'EEEE, dd MMM yyyy') : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Expected Guest Count</span>
                  <span className="text-slate-805 font-bold mt-0.5 block flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    {enquiry.guestCount || 'TBD'} guests
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Preferred Hall Section</span>
                  <span className="text-slate-800 mt-0.5 block">{enquiry.hallSection || 'Not specified'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wide">Estimated budget range</span>
                  <span className="text-slate-800 font-mono font-bold mt-1.5 block flex items-center gap-1 text-sm bg-slate-50 border border-slate-150 p-2.5 rounded-lg w-fit">
                    <IndianRupee className="h-4 w-4 text-slate-450 shrink-0" />
                    ₹{enquiry.budgetMin?.toLocaleString('en-IN') || 0} — ₹{enquiry.budgetMax?.toLocaleString('en-IN') || 'TBD'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick actions and note displays */}
          <div className="space-y-6">
            
            {/* Notes container */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-2">
                <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">
                  Lead Notes & Comments
                </h4>
                {enquiry.stage !== 'booked' && (
                  <button
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Enter special requirements or pricing agreements..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-all font-semibold text-slate-705"
                  />
                  <div className="flex justify-end gap-2 text-xs font-bold">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="h-7 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-slate-550 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="h-7 px-3 bg-violet-650 hover:bg-violet-755 text-white rounded-lg transition-colors cursor-pointer shadow-sm shadow-violet-100"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : enquiry.notes ? (
                <p className="text-xs text-slate-550 leading-relaxed font-semibold italic bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  "{enquiry.notes}"
                </p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[11px] text-slate-400 font-bold italic">No notes added</p>
                  {enquiry.stage !== 'booked' && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-[10px] font-black text-violet-650 hover:text-violet-755 uppercase tracking-wide mt-2 inline-block hover:underline"
                    >
                      + Add Lead Note
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick action card */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2">
                Quick Actions
              </h4>
              <div className="flex flex-col gap-2.5 text-xs font-bold">
                <button
                  onClick={() => {
                    setActiveTab('followups');
                    router.replace(`/dashboard/enquiries/${enquiry.id}?tab=followups`);
                  }}
                  className="w-full h-9 border border-violet-200 hover:bg-violet-50/55 text-violet-650 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-custom-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Schedule Followup</span>
                </button>

                {enquiry.stage !== 'booked' && enquiry.stage !== 'lost' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('convert');
                        router.replace(`/dashboard/enquiries/${enquiry.id}?tab=convert`);
                      }}
                      className="w-full h-9 bg-green-550 hover:bg-green-650 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-green-100"
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                      <span>Convert to Booking</span>
                    </button>

                    <button
                      onClick={() => setLostModalOpen(true)}
                      className="w-full h-9 border border-rose-200 hover:bg-rose-50 text-rose-650 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Mark as Lost</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Assigned to column */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2">
                Assigned Team Member
              </h4>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xs shrink-0 font-bold">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Manager Team Slot</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Assigned to: {enquiry.assignedTo || 'Unassigned lead'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'followups' ? (
        /* FOLLOWUPS TAB Layout */
        <FollowupTimeline enquiry={enquiry} />
      ) : activeTab === 'activity' ? (
        /* ACTIVITY TAB LOG Layout */
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4 select-none">
          <div className="border-b border-slate-50 pb-2">
            <h3 className="text-sm font-extrabold text-slate-850">Granular Activity Logs</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chronological list of lead touchpoints</p>
          </div>

          <div className="relative pl-6 border-l border-slate-100 space-y-6 pt-2">
            {getActivities().map((act, i) => (
              <div key={i} className="relative">
                {/* Dot marker */}
                <div className={`absolute -left-9 top-1 h-3.5 w-3.5 rounded-full border border-white ${act.dotColor}`} />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-800 leading-none">
                      {act.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">
                      {format(act.date, 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xl font-semibold leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CONVERT TAB Layout */
        <ConvertToBookingForm enquiry={enquiry} />
      )}

      {/* SECURE LOST MODAL OVERLAY */}
      <LostReasonModal
        isOpen={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        onConfirm={handleLostConfirm}
      />

    </div>
  );
}

export default function EnquiryDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-slate-400 animate-pulse font-bold">
        Loading Enquiry detail profile...
      </div>
    }>
      <EnquiryDetailContent />
    </Suspense>
  );
}
