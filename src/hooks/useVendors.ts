'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getBookingVendors,
  allocateVendorToBooking,
  updateVendorAllocation,
  deallocateVendorFromBooking,
  getVendorAllocations,
  getVendorAllocationStats,
  VendorsQuery,
} from '@/services/api/modules/vendors.service';
import { Vendor, VendorCategory, VendorStatus, VendorStats, BookingVendor } from '@/types/vendor';

// ----------------------------------------------------------------------
// Backend <-> Frontend Adapter Layer
// ----------------------------------------------------------------------
export const mapBackendVendorToFrontend = (v: any): Vendor => {
  // Extract and parse tags
  let parsedTags: string[] = [];
  if (Array.isArray(v.tags)) {
    parsedTags = v.tags;
  } else if (typeof v.tags === 'string' && v.tags.trim() !== '') {
    try {
      parsedTags = JSON.parse(v.tags);
    } catch {
      parsedTags = v.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
  }

  // Enforce Category type mapping
  const categoryMap: Record<string, VendorCategory> = {
    caterer: 'caterer',
    decorator: 'decorator',
    photographer: 'photographer',
    videographer: 'videographer',
    dj: 'dj',
    band: 'band',
    florist: 'florist',
    lighting: 'lighting',
    sound: 'sound',
    tent: 'tent',
    transport: 'transport',
    security: 'security',
    cleaning: 'cleaning',
    other: 'other',
  };

  const categoryInput = (v.category || v.service_type || v.serviceType || 'other').toLowerCase();
  const category: VendorCategory = categoryMap[categoryInput] || 'other';

  // Enforce Status type mapping
  const statusInput = (v.status || 'active').toLowerCase();
  const status: VendorStatus =
    statusInput === 'inactive'
      ? 'inactive'
      : statusInput === 'blacklisted'
      ? 'blacklisted'
      : 'active';

  // Deduce numbers
  const rating = Number(v.rating !== undefined ? v.rating : v.rate !== undefined ? v.rate : 5);
  const totalEngagements = Number(v.total_engagements || v.totalEngagements || 0);
  const totalAmountPaid = Number(v.total_amount_paid || v.totalAmountPaid || v.rate_amount || 0);

  return {
    id: String(v.id || ''),
    name: v.name || v.vendor_name || v.vendorName || 'Unnamed Vendor',
    category,
    phone: v.phone || '',
    alternatePhone: v.alternate_phone || v.alternatePhone || '',
    email: v.email || '',
    address: v.address || '',
    city: v.city || 'Chennai',
    state: v.state || 'Tamil Nadu',
    gstNumber: v.gst_number || v.gstNumber || '',
    bankName: v.bank_name || v.bankName || '',
    accountNumber: v.account_number || v.accountNumber || '',
    ifscCode: v.ifsc_code || v.ifscCode || '',
    upiId: v.upi_id || v.upiId || '',
    contactPersonName: v.contact_person_name || v.contactPersonName || '',
    contactPersonPhone: v.contact_person_phone || v.contactPersonPhone || '',
    rating,
    totalEngagements,
    totalAmountPaid,
    lastEngagementDate: v.last_engagement_date || v.lastEngagementDate || undefined,
    status,
    tags: parsedTags,
    notes: v.notes || '',
    createdAt: v.created_at || v.createdAt || new Date().toISOString(),
    updatedAt: v.updated_at || v.updatedAt || new Date().toISOString(),
  };
};

export const mapFrontendVendorToBackend = (v: any) => {
  return {
    vendor_name: v.name,
    service_type: v.category,
    phone: v.phone,
    alternate_phone: v.alternatePhone || null,
    email: v.email || null,
    address: v.address || null,
    city: v.city,
    state: v.state,
    gst_number: v.gstNumber || null,
    bank_name: v.bankName || null,
    account_number: v.accountNumber || null,
    ifsc_code: v.ifscCode || null,
    upi_id: v.upiId || null,
    contact_person_name: v.contactPersonName || null,
    contact_person_phone: v.contactPersonPhone || null,
    rating: v.rating || 5,
    rate: v.rating || 5,
    status: v.status || 'active',
    tags: v.tags || [],
    notes: v.notes || '',
    
    // Duplicate fields for camelCase compatibility
    name: v.name,
    category: v.category,
    alternatePhone: v.alternatePhone || null,
    gstNumber: v.gstNumber || null,
    bankName: v.bankName || null,
    accountNumber: v.accountNumber || null,
    ifscCode: v.ifscCode || null,
    upiId: v.upiId || null,
    contactPersonName: v.contactPersonName || null,
    contactPersonPhone: v.contactPersonPhone || null,
  };
};

// ----------------------------------------------------------------------
// Hooks Interface
// ----------------------------------------------------------------------
export function useVendors(params: {
  search?: string;
  category?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryParams: VendorsQuery = {
    search: params.search || undefined,
    category: params.category === 'all' || !params.category ? undefined : params.category,
    status: params.status === 'all' || !params.status ? undefined : params.status,
    city: params.city === 'all' || !params.city ? undefined : params.city,
    page: params.page,
    limit: params.limit,
  };

  return useQuery<{ data: Vendor[]; total: number }, Error>({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const res = await getVendors(queryParams);
      const mappedData = (res.data || []).map(mapBackendVendorToFrontend);
      
      // Perform local search fallback to guarantee correct client metrics
      let filtered = mappedData;

      if (params.search && params.search.trim() !== '') {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.phone.includes(q) ||
            v.city.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q) ||
            (v.contactPersonName && v.contactPersonName.toLowerCase().includes(q))
        );
      }

      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((v) => v.category === params.category);
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((v) => v.status === params.status);
      }

      if (params.city && params.city !== 'all') {
        filtered = filtered.filter((v) => v.city.toLowerCase() === params.city?.toLowerCase());
      }

      return {
        data: filtered,
        total: res.meta?.total ?? filtered.length,
      };
    },
    staleTime: 60 * 1000, // 60 seconds cache
  });
}

export function useVendor(id: string) {
  return useQuery<Vendor, Error>({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const res = await getVendorById(id);
      return mapBackendVendorToFrontend(res);
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useVendorStats() {
  return useQuery<VendorStats, Error>({
    queryKey: ['vendor-stats'],
    queryFn: async () => {
      const res = await getVendors({ limit: 1000 });
      const vendors = (res.data || []).map(mapBackendVendorToFrontend);

      const totalVendors = vendors.length;
      const activeVendors = vendors.filter((v) => v.status === 'active').length;
      const totalAmountPaid = vendors.reduce((sum, v) => sum + v.totalAmountPaid, 0);

      const categoryCounts: Record<VendorCategory, number> = {
        caterer: 0,
        decorator: 0,
        photographer: 0,
        videographer: 0,
        dj: 0,
        band: 0,
        florist: 0,
        lighting: 0,
        sound: 0,
        tent: 0,
        transport: 0,
        security: 0,
        cleaning: 0,
        other: 0,
      };

      vendors.forEach((v) => {
        if (categoryCounts[v.category] !== undefined) {
          categoryCounts[v.category]++;
        } else {
          categoryCounts.other++;
        }
      });

      // Find top category
      let topCategory: VendorCategory = 'other';
      let maxCount = -1;
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat as VendorCategory;
        }
      });

      return {
        totalVendors,
        activeVendors,
        categoryCounts,
        topCategory,
        totalAmountPaid,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const backendPayload = mapFrontendVendorToBackend(data);
      return createVendor(backendPayload);
    },
    onSuccess: () => {
      toast.success('Vendor added successfully');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to add vendor profile.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const backendPayload = mapFrontendVendorToBackend(data);
      return updateVendor(id, backendPayload);
    },
    onSuccess: (_, variables) => {
      toast.success('Vendor updated successfully');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to update vendor profile.';
      toast.error(errMsg);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      toast.success('Vendor removed');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to remove vendor.';
      toast.error(errMsg);
    },
  });
}

// ----------------------------------------------------------------------
// Booking Vendor Allocation Hooks & Mappers
// ----------------------------------------------------------------------
export const mapBackendBookingVendorToFrontend = (bv: any): BookingVendor => {
  return {
    id: String(bv.id || ''),
    hallId: String(bv.hall_id || ''),
    bookingId: String(bv.booking_id || ''),
    vendorId: String(bv.vendor_id || ''),
    serviceType: bv.service_type || 'other',
    allocatedCost: Number(bv.allocated_cost || 0),
    paymentStatus:
      bv.payment_status === 'paid'
        ? 'paid'
        : bv.payment_status === 'partially_paid' || bv.payment_status === 'partial'
        ? 'partial'
        : 'unpaid',
    amountPaid: Number(bv.amount_paid || 0),
    notes: bv.notes || '',
    createdAt: bv.created_at || bv.createdAt,
    updatedAt: bv.updated_at || bv.updatedAt,
    vendors: bv.vendors
      ? {
          id: String(bv.vendors.id || ''),
          vendor_name: bv.vendors.vendor_name || '',
          phone: bv.vendors.phone || '',
          service_type: bv.vendors.service_type || 'other',
          upi_id: bv.vendors.upi_id || '',
        }
      : undefined,
    bookings: bv.bookings
      ? {
          id: String(bv.bookings.id || ''),
          event_name: bv.bookings.event_name || '',
          start_date: bv.bookings.start_date || '',
          end_date: bv.bookings.end_date || '',
          status: bv.bookings.status || '',
          booking_number: bv.bookings.booking_number || '',
        }
      : undefined,
  };
};

export function useBookingVendors(bookingId: string) {
  return useQuery<BookingVendor[], Error>({
    queryKey: ['booking-vendors', bookingId],
    queryFn: async () => {
      const res = await getBookingVendors(bookingId);
      return (res || []).map(mapBackendBookingVendorToFrontend);
    },
    enabled: !!bookingId,
  });
}

export function useVendorAllocations(vendorId: string) {
  return useQuery<BookingVendor[], Error>({
    queryKey: ['vendor-allocations', vendorId],
    queryFn: async () => {
      const res = await getVendorAllocations(vendorId);
      return (res || []).map(mapBackendBookingVendorToFrontend);
    },
    enabled: !!vendorId,
  });
}

export function useVendorAllocationStats(vendorId: string) {
  return useQuery<
    { total_bookings: number; total_earnings: number; total_paid: number; total_pending: number },
    Error
  >({
    queryKey: ['vendor-allocation-stats', vendorId],
    queryFn: async () => {
      return getVendorAllocationStats(vendorId);
    },
    enabled: !!vendorId,
  });
}

export function useAllocateVendor(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      vendor_id: string;
      service_type: string;
      allocated_cost: number;
      amount_paid: number;
      notes?: string;
      payment_status?: string;
    }) => {
      return allocateVendorToBooking(bookingId, payload);
    },
    onSuccess: (data) => {
      if (data.conflict) {
        toast.warning(data.conflictMessage || data.message || 'Scheduling conflict detected.');
      } else {
        toast.success(data.message || 'Vendor allocated successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['booking-vendors', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocations'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to allocate vendor.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateVendorAllocation(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vendorId,
      payload,
    }: {
      vendorId: string;
      payload: {
        allocated_cost?: number;
        amount_paid?: number;
        notes?: string;
        payment_status?: string;
      };
    }) => {
      return updateVendorAllocation(bookingId, vendorId, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Vendor allocation updated successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-vendors', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocation-stats', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocations', variables.vendorId] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to update vendor allocation.';
      toast.error(errMsg);
    },
  });
}

export function useDeallocateVendor(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      return deallocateVendorFromBooking(bookingId, vendorId);
    },
    onSuccess: (_, vendorId) => {
      toast.success('Vendor deallocated successfully');
      queryClient.invalidateQueries({ queryKey: ['booking-vendors', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocation-stats', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-allocations', vendorId] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to deallocate vendor.';
      toast.error(errMsg);
    },
  });
}

