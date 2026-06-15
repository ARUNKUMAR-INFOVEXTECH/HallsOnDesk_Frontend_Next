'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Columns,
  LayoutList,
  Plus,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  SearchX,
  MessageSquarePlus,
  Bell,
  Download,
  Upload
} from 'lucide-react';
import { CSVImportModal } from '@/components/enquiries/CSVImportModal';
import {
  useEnquiries,
  useEnquiryStats,
  useTodayFollowups,
  useUpdateEnquiryStage,
  useUpdateEnquiry
} from '@/hooks/useEnquiries';
import { toast } from 'sonner';
import { EnquiryStatsCards } from '@/components/enquiries/EnquiryStatsCards';
import { ConversionFunnel } from '@/components/enquiries/ConversionFunnel';
import { KanbanBoard } from '@/components/enquiries/KanbanBoard';
import { EnquiryTable } from '@/components/enquiries/EnquiryTable';
import { TodayFollowupsDrawer } from '@/components/enquiries/TodayFollowupsDrawer';
import { LostReasonModal } from '@/components/enquiries/LostReasonModal';
import { Enquiry, EnquiryStage } from '@/types/enquiry';
import { obfuscateId } from '@/utils/obfuscate';

export default function EnquiriesDashboardPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const halls = user?.accessible_halls || [];
  const activeHall = halls.find((h) => h.id === activeHallId)
    || halls.find((h) => h.id === user?.hall_id)
    || halls[0];
  const activeHallName = activeHall?.hall_name || 'Venue';

  // Multi-select and Date filter states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const updateEnquiryMutation = useUpdateEnquiry();

  // 1. Persistent View Toggles
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hod_enquiry_view') as 'kanban' | 'list';
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: 'kanban' | 'list') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hod_enquiry_view', mode);
    }
  };

  // 2. Filter states
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  const dateParams = React.useMemo(() => {
    const today = new Date();
    let fromEventDate = '';
    let toEventDate = '';

    if (dateRangeType === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      fromEventDate = firstDay.toISOString().substring(0, 10);
      toEventDate = lastDay.toISOString().substring(0, 10);
    } else if (dateRangeType === 'next_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      fromEventDate = firstDay.toISOString().substring(0, 10);
      toEventDate = lastDay.toISOString().substring(0, 10);
    } else if (dateRangeType === 'next_90_days') {
      fromEventDate = today.toISOString().substring(0, 10);
      const next90 = new Date();
      next90.setDate(today.getDate() + 90);
      toEventDate = next90.toISOString().substring(0, 10);
    } else if (dateRangeType === 'custom') {
      if (customStartDate) fromEventDate = customStartDate;
      if (customEndDate) toEventDate = customEndDate;
    }

    return { fromEventDate, toEventDate };
  }, [dateRangeType, customStartDate, customEndDate]);

  // Clear selection on viewMode or filter adjustments
  useEffect(() => {
    setSelectedIds([]);
  }, [search, stageFilter, sourceFilter, priorityFilter, eventTypeFilter, dateRangeType, customStartDate, customEndDate, viewMode]);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // 3. React Queries
  const {
    data: enquiries = [],
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useEnquiries({
    search: debouncedSearch,
    stage: stageFilter,
    source: sourceFilter,
    priority: priorityFilter,
    eventType: eventTypeFilter,
    fromEventDate: dateParams.fromEventDate,
    toEventDate: dateParams.toEventDate,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useEnquiryStats();

  const {
    data: todayFollowups = [],
    isLoading: followupsLoading,
    refetch: refetchFollowups,
  } = useTodayFollowups();

  const updateStageMutation = useUpdateEnquiryStage();

  // Bulk operation handlers
  const handleBulkStageChange = async (newStage: EnquiryStage) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const existing = enquiries.find((e) => e.id === id);
          if (!existing) return Promise.resolve();
          return updateEnquiryMutation.mutateAsync({
            id,
            data: {
              ...existing,
              stage: newStage,
              status: newStage === 'booked' ? 'converted' : newStage === 'lost' ? 'lost' : 'pending',
            },
          });
        })
      );
      toast.success(`Updated stage to "${newStage}" for ${selectedIds.length} enquiries`);
      setSelectedIds([]);
      handleRefresh();
    } catch (err) {
      toast.error('Failed to update stage for some enquiries');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkPriorityChange = async (newPriority: 'high' | 'medium' | 'low') => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const existing = enquiries.find((e) => e.id === id);
          if (!existing) return Promise.resolve();
          return updateEnquiryMutation.mutateAsync({
            id,
            data: {
              ...existing,
              priority: newPriority,
            },
          });
        })
      );
      toast.success(`Updated priority to "${newPriority}" for ${selectedIds.length} enquiries`);
      setSelectedIds([]);
      handleRefresh();
    } catch (err) {
      toast.error('Failed to update priority for some enquiries');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExportSelectedCSV = () => {
    const selectedEnquiries = enquiries.filter((e) => selectedIds.includes(e.id));
    if (selectedEnquiries.length === 0) return;

    const headers = [
      'Enquiry Number',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Event Type',
      'Event Date',
      'Guest Count',
      'Budget Min',
      'Budget Max',
      'Source',
      'Stage',
      'Priority',
      'Created Date'
    ];

    const rows = selectedEnquiries.map((e) => [
      e.enquiryNumber,
      e.name,
      e.phone,
      e.email || '',
      e.city || '',
      e.eventType,
      e.eventDate || '',
      e.guestCount || '',
      e.budgetMin || '',
      e.budgetMax || '',
      e.source,
      e.stage,
      e.priority,
      e.createdAt.substring(0, 10),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val ?? '');
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().substring(0, 10);
    link.setAttribute('download', `infovexhalls-selected-enquiries-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Modals and drawers states
  const [followupsOpen, setFollowupsOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostEnquiry, setLostEnquiry] = useState<Enquiry | null>(null);

  const handleRefresh = () => {
    refetchList();
    refetchStats();
    refetchFollowups();
  };

  const hasActiveFilters =
    search !== '' ||
    stageFilter !== 'all' ||
    sourceFilter !== 'all' ||
    priorityFilter !== 'all' ||
    eventTypeFilter !== 'all' ||
    dateRangeType !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const clearFilters = () => {
    setSearch('');
    setStageFilter('all');
    setSourceFilter('all');
    setPriorityFilter('all');
    setEventTypeFilter('all');
    setDateRangeType('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Lost modal callback
  const handleLostConfirm = (reason: string, notes: string) => {
    if (!lostEnquiry) return;
    updateStageMutation.mutate({
      id: lostEnquiry.id,
      stage: 'lost',
      lostReason: reason,
      notes: notes,
    }, {
      onSuccess: () => {
        handleRefresh();
      }
    });
    setLostEnquiry(null);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (enquiries.length === 0) return;

    const headers = [
      'Enquiry Number',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Event Type',
      'Event Date',
      'Guest Count',
      'Budget Min',
      'Budget Max',
      'Source',
      'Stage',
      'Priority',
      'Created Date',
      'Last Followup',
      'Next Followup',
    ];

    const rows = enquiries.map((e) => {
      const lastF = e.followups
        .filter((f) => f.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
      const nextF = e.followups
        .filter((f) => !f.completedAt)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

      return [
        e.enquiryNumber,
        e.name,
        e.phone,
        e.email || '',
        e.city || '',
        e.eventType,
        e.eventDate || '',
        e.guestCount || '',
        e.budgetMin || '',
        e.budgetMax || '',
        e.source,
        e.stage,
        e.priority,
        e.createdAt.substring(0, 10),
        lastF ? lastF.completedAt!.substring(0, 10) : '',
        nextF ? nextF.scheduledAt.substring(0, 10) : '',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val ?? '');
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().substring(0, 10);
    link.setAttribute('download', `infovexhalls-enquiries-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Skeleton Loaders
  const renderSkeleton = () => {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4 animate-pulse select-none">
          <div className="h-10 bg-slate-100 rounded-lg w-full border border-slate-200" />
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="h-14 bg-slate-100 rounded-lg w-full border border-slate-200" />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 animate-pulse select-none">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-slate-100 border border-slate-200 rounded-xl w-full min-h-[400px]" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-slate-850 tracking-tight">Enquiries</h1>
          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-150">
            {stats?.total ?? enquiries.length} active leads
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mr-1">
            <button
              onClick={() => handleToggleView('kanban')}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-violet-50 text-violet-650'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-55'
              }`}
              title="Pipeline Kanban Board"
            >
              <Columns className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => handleToggleView('list')}
              className={`p-2 border-l border-slate-200 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-violet-50 text-violet-650'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-55'
              }`}
              title="List Data Table"
            >
              <LayoutList className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Today Followups Button */}
          <button
            onClick={() => setFollowupsOpen(true)}
            className="relative flex items-center justify-center gap-1.5 h-9 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-55 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4 shrink-0 text-slate-450" />
            <span>Today's Followups</span>
            {todayFollowups.length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-black font-mono px-1.5 py-0.2 rounded-full absolute -top-1.5 -right-1.5 animate-bounce">
                {todayFollowups.length}
              </span>
            )}
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={enquiries.length === 0}
            className="flex items-center justify-center gap-1.5 h-9.5 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="h-4 w-4 shrink-0 text-slate-450" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV button */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center gap-1.5 h-9.5 px-3 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-indigo-650 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Upload className="h-4 w-4 shrink-0 text-indigo-500" />
            <span>Import CSV</span>
          </button>

          {/* Add Enquiry button */}
          <button
            onClick={() => router.push('/dashboard/enquiries/new')}
            className="flex items-center justify-center gap-1.5 h-9.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-extrabold tracking-wider uppercase shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <EnquiryStatsCards stats={stats} isLoading={statsLoading} />

      {/* COLLAPSIBLE CONVERSION FUNNEL */}
      <ConversionFunnel stats={stats} />

      {/* SEARCH + FILTER BAR CARD */}
      <div className="bg-white border border-slate-150 rounded-xl shadow-sm p-5 space-y-4">
        
        {/* Row 1: Full width search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone number, or enquiry sequence..."
            className="w-full h-9.5 pl-10 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-705"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Row 2: Grid of filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-1">
          {/* Stage filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450">Pipeline Stage</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            >
              <option value="all">All Stages</option>
              <option value="new">New Lead</option>
              <option value="interested">Interested</option>
              <option value="visit_scheduled">Visit Scheduled</option>
              <option value="visited">Visited</option>
              <option value="booked">Booked</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Source filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455">Acquisition Source</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            >
              <option value="all">All Sources</option>
              <option value="walk_in">Walk-in</option>
              <option value="phone">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="justdial">JustDial</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455">Priority Level</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Event type filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455">Event Category</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            >
              <option value="all">All Events</option>
              <option value="wedding">Wedding</option>
              <option value="engagement">Engagement</option>
              <option value="reception">Reception</option>
              <option value="birthday">Birthday</option>
              <option value="corporate">Corporate</option>
              <option value="anniversary">Anniversary</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Event Date filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455">Event Date</span>
            <select
              value={dateRangeType}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            >
              <option value="all">All Event Dates</option>
              <option value="this_month">Event This Month</option>
              <option value="next_month">Event Next Month</option>
              <option value="next_90_days">Event Next 90 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Clear filters action */}
          <div className="flex items-end justify-start sm:justify-end xl:col-span-1">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-9 px-4 bg-slate-50 border border-slate-205 hover:border-slate-350 hover:bg-slate-100 text-slate-655 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full hover:scale-[1.01] active:scale-[0.99]"
              >
                <X className="h-4 w-4 text-slate-450" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom date range inputs row */}
        {dateRangeType === 'custom' && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 animate-in slide-in-from-top-1 duration-150">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 mr-2">Custom Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-8.5 px-3.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-8.5 px-3.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 cursor-pointer transition-all"
            />
          </div>
        )}
      </div>

      {/* CORE PIPELINE LISTING WORKSPACE */}
      {listError ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-red-200 rounded-xl bg-white select-none">
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-800">Failed to load enquiries</h4>
          <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
            An issue occurred while loading lead accounts from the {activeHallName} CRM. Please retry.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-rose-550 hover:bg-rose-650 text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Try Again</span>
          </button>
        </div>
      ) : listLoading ? (
        renderSkeleton()
      ) : enquiries.length === 0 ? (
        /* Empty states */
        hasActiveFilters ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <SearchX className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">No matching leads found</h4>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              No CRM enquiry match your query parameters. Try modifying filters or search query.
            </p>
            <button
              onClick={clearFilters}
              className="text-violet-650 hover:text-violet-755 border border-violet-200 hover:bg-violet-50/55 h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <MessageSquarePlus className="h-5 w-5 text-slate-405" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-850">No enquiries captured yet</h4>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Log client walkthrough site bookings, wedding phone calls, or WhatsApp enquires to fill your pipeline.
            </p>
            <button
              onClick={() => router.push('/dashboard/enquiries/new')}
              className="bg-violet-655 hover:bg-violet-755 text-white h-8.5 px-4.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Capture Your First Lead</span>
            </button>
          </div>
        )
      ) : (
        /* Main Dual View Area */
        <div className="animate-in fade-in duration-300">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              enquiries={enquiries}
              onEdit={(e) => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}?edit=true`)}
              onAddFollowup={(e) => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}?tab=followups`)}
              onAddEnquiryClick={(stage) => router.push(`/dashboard/enquiries/new?stage=${stage}`)}
            />
          ) : (
            <EnquiryTable
              data={enquiries}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              onEdit={(e) => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}?edit=true`)}
              onAddFollowup={(e) => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}?tab=followups`)}
              onConvert={(e) => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}?tab=convert`)}
              onMarkLost={(e) => {
                setLostEnquiry(e);
                setLostModalOpen(true);
              }}
            />
          )}
        </div>
      )}

      {/* TODAY'S FOLLOWUPS SLIDING DRAWER SHEET */}
      <TodayFollowupsDrawer
        isOpen={followupsOpen}
        onClose={() => {
          setFollowupsOpen(false);
          handleRefresh();
        }}
        followups={todayFollowups}
        isLoading={followupsLoading}
      />

      {/* SECURE LOST REASON CONFIRMATION MODAL */}
      <LostReasonModal
        isOpen={lostModalOpen}
        onClose={() => {
          setLostModalOpen(false);
          setLostEnquiry(null);
        }}
        onConfirm={handleLostConfirm}
      />

      {/* FLOATING BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && viewMode === 'list' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 px-6 py-4 flex items-center justify-between gap-6 z-50 animate-in slide-in-from-bottom-4 duration-300 w-[90%] max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center font-mono shrink-0">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">leads selected</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Bulk Change Stage */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStageChange(e.target.value as EnquiryStage);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="h-8 px-2.5 text-[10px] bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-extrabold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              disabled={isBulkUpdating}
            >
              <option value="" disabled>Change Stage</option>
              <option value="new">New Lead</option>
              <option value="interested">Interested</option>
              <option value="visit_scheduled">Visit Scheduled</option>
              <option value="visited">Visited</option>
              <option value="booked">Booked</option>
              <option value="lost">Lost</option>
            </select>

            {/* Bulk Change Priority */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkPriorityChange(e.target.value as 'high' | 'medium' | 'low');
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="h-8 px-2.5 text-[10px] bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-extrabold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              disabled={isBulkUpdating}
            >
              <option value="" disabled>Change Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Bulk Export Selected */}
            <button
              onClick={handleExportSelectedCSV}
              className="h-8 px-3 text-[10px] bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              disabled={isBulkUpdating}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            {/* Cancel Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-450 hover:text-white font-bold cursor-pointer transition-colors"
              disabled={isBulkUpdating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CSV BATCH UPLOAD DIALOG MODAL */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={handleRefresh}
      />

    </div>
  );
}
