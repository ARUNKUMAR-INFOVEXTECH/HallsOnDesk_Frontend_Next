'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  bulkCreateEnquiries,
  updateEnquiry,
  convertEnquiryToBooking,
  getTodayFollowups,
  EnquiriesQuery,
  deleteEnquiry,
} from '@/services/api/modules/enquiries.service';
import {
  Enquiry,
  Followup,
  EnquiryStats,
  EnquiryStage,
  EnquiryPriority,
  EnquirySource,
  FollowupType,
  EventType,
} from '@/types/enquiry';

// ----------------------------------------------------------------------
// Backend <-> Frontend Adapter Layer
// ----------------------------------------------------------------------

export const mapBackendFollowupToFrontend = (f: any): Followup => {
  return {
    id: String(f.id || ''),
    enquiryId: String(f.enquiry_id || f.enquiryId || ''),
    scheduledAt: f.scheduled_at || f.scheduledAt || new Date().toISOString(),
    completedAt: f.completed_at || f.completedAt || undefined,
    type: (f.type || 'call').toLowerCase() as FollowupType,
    notes: f.notes || '',
    outcome: f.outcome || '',
    nextFollowupAt: f.next_followup_at || f.nextFollowupAt || undefined,
    createdAt: f.created_at || f.createdAt || new Date().toISOString(),
  };
};

export const mapFrontendFollowupToBackend = (f: any) => {
  return {
    id: f.id,
    enquiry_id: f.enquiryId,
    scheduled_at: f.scheduledAt,
    completed_at: f.completedAt || null,
    type: f.type,
    notes: f.notes || '',
    outcome: f.outcome || null,
    next_followup_at: f.nextFollowupAt || null,
  };
};

export const mapBackendEnquiryToFrontend = (e: any): Enquiry => {
  // Parse followups safely
  let rawFollowups: any[] = [];
  if (Array.isArray(e.followups)) {
    rawFollowups = e.followups;
  } else if (typeof e.followups === 'string' && e.followups.trim() !== '') {
    try {
      rawFollowups = JSON.parse(e.followups);
    } catch {
      rawFollowups = [];
    }
  }

  const followups = rawFollowups.map(mapBackendFollowupToFrontend);

  // Map stage based on status if stage is not returned
  let stage: EnquiryStage = 'new';
  if (e.stage) {
    stage = String(e.stage).toLowerCase() as EnquiryStage;
  } else if (e.status) {
    const status = String(e.status).toLowerCase();
    if (status === 'converted' || status === 'booked') {
      stage = 'booked';
    } else if (status === 'lost') {
      stage = 'lost';
    } else if (['new', 'interested', 'visit_scheduled', 'visited'].includes(status)) {
      stage = status as EnquiryStage;
    } else {
      stage = 'new';
    }
  }

  // Map priorities
  let priority: EnquiryPriority = 'medium';
  if (e.priority) {
    priority = String(e.priority).toLowerCase() as EnquiryPriority;
  }

  // Map source
  let source: EnquirySource = 'walk_in';
  if (e.source) {
    source = String(e.source).toLowerCase() as EnquirySource;
  }

  // Map eventType
  let eventType: EventType = 'other';
  const rawEventType = e.event_type || e.eventType || '';
  if (rawEventType) {
    eventType = String(rawEventType).toLowerCase() as EventType;
  }

  // budget parameters
  const budgetMin = Number(e.budget_min || e.budgetMin || 0);
  const budgetMax = Number(e.budget_max || e.budgetMax || e.budget || 0);

  return {
    id: String(e.id || ''),
    enquiryNumber: e.enquiry_number || e.enquiryNumber || `ENQ-${String(e.id).substring(0, 4).toUpperCase()}`,
    name: e.customer_name || e.name || 'Lead Contact',
    phone: e.phone || '',
    email: e.email || '',
    address: e.address || '',
    city: e.city || '',
    eventType,
    eventDate: e.event_date || e.eventDate || e.expected_date || e.expectedDate || undefined,
    guestCount: Number(e.guest_count || e.guestCount || 0) || undefined,
    budgetMin: budgetMin || undefined,
    budgetMax: budgetMax || undefined,
    hallSection: e.hall_section || e.hallSection || 'Main Hall',
    source,
    stage,
    priority,
    assignedTo: e.assigned_to || e.assignedTo || undefined,
    assignee: e.assignee || undefined,
    customerId: e.customer_id || e.customerId || undefined,
    bookingId: e.booking_id || e.bookingId || undefined,
    convertedAt: e.converted_at || e.convertedAt || undefined,
    lostReason: e.lost_reason || e.lostReason || undefined,
    notes: e.notes || '',
    followups,
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
    updatedAt: e.updated_at || e.updatedAt || new Date().toISOString(),
  };
};

export const mapFrontendEnquiryToBackend = (e: any) => {
  return {
    enquiry_number: e.enquiryNumber,
    customer_name: e.name,
    phone: e.phone,
    email: e.email || null,
    address: e.address || null,
    city: e.city || null,
    event_type: e.eventType,
    event_date: e.eventDate || null,
    expected_date: e.eventDate || null, // duplicate for backend compatibility
    guest_count: e.guestCount || null,
    budget_min: e.budgetMin || null,
    budget_max: e.budgetMax || null,
    budget: e.budgetMax || null, // duplicate for compatibility
    hall_section: e.hallSection || 'Main Hall',
    source: e.source,
    stage: e.stage,
    status: e.stage === 'booked' ? 'booked' : e.stage === 'lost' ? 'lost' : e.stage, // status fallback
    priority: e.priority,
    assigned_to: e.assignedTo || null,
    customer_id: e.customerId || null,
    booking_id: e.bookingId || null,
    converted_at: e.convertedAt || null,
    lost_reason: e.lostReason || null,
    notes: e.notes || '',
    followups: (e.followups || []).map(mapFrontendFollowupToBackend),
  };
};

// ----------------------------------------------------------------------
// Hooks Interface
// ----------------------------------------------------------------------

export function useEnquiries(params: {
  search?: string;
  stage?: string;
  source?: string;
  priority?: string;
  eventType?: string;
  fromEventDate?: string;
  toEventDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryParams: EnquiriesQuery = {
    search: params.search || undefined,
    stage: params.stage === 'all' || !params.stage ? undefined : params.stage,
    source: params.source === 'all' || !params.source ? undefined : params.source,
    priority: params.priority === 'all' || !params.priority ? undefined : params.priority,
    eventType: params.eventType === 'all' || !params.eventType ? undefined : params.eventType,
    from_date: params.fromEventDate || undefined,
    to_date: params.toEventDate || undefined,
    page: params.page,
    limit: params.limit,
  };

  return useQuery<Enquiry[], Error>({
    queryKey: ['enquiries', params],
    queryFn: async () => {
      const res = await getEnquiries(queryParams);
      const mappedData = res.map(mapBackendEnquiryToFrontend);

      // Resilient client-side fallback query filters
      let filtered = mappedData;

      if (params.search && params.search.trim() !== '') {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.phone.includes(q) ||
            e.enquiryNumber.toLowerCase().includes(q) ||
            (e.email && e.email.toLowerCase().includes(q))
        );
      }

      if (params.stage && params.stage !== 'all') {
        filtered = filtered.filter((e) => e.stage === params.stage);
      }

      if (params.source && params.source !== 'all') {
        filtered = filtered.filter((e) => e.source === params.source);
      }

      if (params.priority && params.priority !== 'all') {
        filtered = filtered.filter((e) => e.priority === params.priority);
      }

      if (params.eventType && params.eventType !== 'all') {
        filtered = filtered.filter((e) => e.eventType === params.eventType);
      }

      if (params.fromEventDate) {
        const fromD = new Date(params.fromEventDate);
        filtered = filtered.filter((e) => e.eventDate && new Date(e.eventDate) >= fromD);
      }

      if (params.toEventDate) {
        const toD = new Date(params.toEventDate);
        filtered = filtered.filter((e) => e.eventDate && new Date(e.eventDate) <= toD);
      }

      // Sort by creation date descending
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    staleTime: 30 * 1000,
  });
}

export function useEnquiry(id: string) {
  return useQuery<Enquiry, Error>({
    queryKey: ['enquiry', id],
    queryFn: async () => {
      const res = await getEnquiryById(id);
      return mapBackendEnquiryToFrontend(res);
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useEnquiryStats() {
  return useQuery<EnquiryStats, Error>({
    queryKey: ['enquiry-stats'],
    queryFn: async () => {
      const res = await getEnquiries({ limit: 1000 });
      const enquiries = res.map(mapBackendEnquiryToFrontend);

      let total = enquiries.length;
      let newCount = 0;
      let interested = 0;
      let visitScheduled = 0;
      let visited = 0;
      let booked = 0;
      let lost = 0;

      enquiries.forEach((e) => {
        if (e.stage === 'new') newCount++;
        else if (e.stage === 'interested') interested++;
        else if (e.stage === 'visit_scheduled') visitScheduled++;
        else if (e.stage === 'visited') visited++;
        else if (e.stage === 'booked') booked++;
        else if (e.stage === 'lost') lost++;
      });

      const conversionRate = total > 0 ? Math.round((booked / total) * 100) : 0;

      // Scan followups across all enquiries
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const now = new Date();

      let todayFollowups = 0;
      let overdueFollowups = 0;

      enquiries.forEach((e) => {
        e.followups.forEach((f) => {
          if (!f.completedAt) {
            const sched = new Date(f.scheduledAt);
            if (sched >= startOfDay && sched <= endOfDay) {
              todayFollowups++;
            } else if (sched < startOfDay) {
              overdueFollowups++;
            }
          }
        });
      });

      return {
        total,
        new: newCount,
        interested,
        visit_scheduled: visitScheduled,
        visited,
        booked,
        lost,
        conversionRate,
        todayFollowups,
        overdueFollowups,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useTodayFollowups() {
  const { data: enquiries = [] } = useQuery<Enquiry[], Error>({
    queryKey: ['enquiries', 'followups-sync'],
    queryFn: async () => {
      const res = await getEnquiries({ limit: 1000 });
      return res.map(mapBackendEnquiryToFrontend);
    },
    staleTime: 30 * 1000,
  });

  return useQuery<any[], Error>({
    queryKey: ['followups-today', enquiries],
    queryFn: async () => {
      // 1. Try pulling today's followups directly from server endpoint
      const serverToday = await getTodayFollowups();
      if (serverToday && serverToday.length > 0) {
        return serverToday.map((item) => {
          const mappedF = mapBackendFollowupToFrontend(item);
          // Try linking the parent enquiry detail if it is in the server payload
          const mappedE = item.enquiry ? mapBackendEnquiryToFrontend(item.enquiry) : undefined;
          return {
            ...mappedF,
            enquiry: mappedE,
          };
        });
      }

      // 2. Client-side fallback scanning all loaded enquiries' followups
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const items: any[] = [];
      enquiries.forEach((e) => {
        e.followups.forEach((f) => {
          if (!f.completedAt) {
            const scheduled = new Date(f.scheduledAt);
            const isToday = scheduled >= startOfDay && scheduled <= endOfDay;
            const isOverdue = scheduled < startOfDay;
            if (isToday || isOverdue) {
              items.push({
                ...f,
                enquiry: e,
                isOverdue,
              });
            }
          }
        });
      });

      // Sort: overdue first, then by scheduled datetime ascending
      return items.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // polling every 5 minutes
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const payload = mapFrontendEnquiryToBackend(data);
      return createEnquiry(payload);
    },
    onSuccess: () => {
      toast.success('Enquiry added successfully');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['followups-today'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to register enquiry.';
      toast.error(errMsg);
    },
  });
}

export function useBulkCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateEnquiries,
    onSuccess: (res) => {
      toast.success(`Successfully imported ${res.count || 0} enquiries!`);
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['followups-today'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to import enquiries.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const payload = mapFrontendEnquiryToBackend(data);
      return updateEnquiry(id, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Enquiry updated');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['followups-today'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to update enquiry.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateEnquiryStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, lostReason, notes, bookingId }: { id: string; stage: EnquiryStage; lostReason?: string; notes?: string; bookingId?: string }) => {
      // We perform stage updates via general updateEnquiry to support flexible payloads
      const existing = queryClient.getQueryData<Enquiry>(['enquiry', id]);
      const updateData = existing
        ? { ...existing, stage, lostReason, notes, bookingId }
        : { stage, lostReason, notes, bookingId };
      
      const payload = mapFrontendEnquiryToBackend(updateData);
      return updateEnquiry(id, payload);
    },
    onMutate: async ({ id, stage }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['enquiries'] });

      // Snapshot previous value
      const previousEnquiries = queryClient.getQueryData<Enquiry[]>(['enquiries']);

      // Optimistically update list cache
      if (previousEnquiries) {
        queryClient.setQueryData<Enquiry[]>(
          ['enquiries'],
          previousEnquiries.map((e) => (e.id === id ? { ...e, stage } : e))
        );
      }

      return { previousEnquiries };
    },
    onError: (err: any, _, context) => {
      // Revert optimistic updates
      if (context?.previousEnquiries) {
        queryClient.setQueryData(['enquiries'], context.previousEnquiries);
      }
      const errMsg = err.response?.data?.message || 'Failed to update stage - Try again';
      toast.error(errMsg);
    },
    onSuccess: (_, variables) => {
      toast.success('Stage updated');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['followups-today'] });
    },
  });
}

export function useConvertToBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return convertEnquiryToBooking(id, data);
    },
    onSuccess: (res) => {
      toast.success('Enquiry converted to booking successfully');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to convert enquiry to booking.';
      toast.error(errMsg);
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteEnquiry(id);
    },
    onSuccess: () => {
      toast.success('Enquiry records purged successfully');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['followups-today'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to delete enquiry records.';
      toast.error(errMsg);
    },
  });
}
