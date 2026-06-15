import apiClient from '../client';

export interface VendorsQuery {
  search?: string;
  category?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface VendorsListResponse {
  data: any[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function getVendors(params: VendorsQuery = {}): Promise<VendorsListResponse> {
  const res = await apiClient.get<VendorsListResponse | any[]>('/vendors', { params });
  if (Array.isArray(res)) {
    return { data: res };
  }
  if (res && Array.isArray((res as any).data)) {
    return res as VendorsListResponse;
  }
  // Safe fallback to res.data if axios wraps it or raw response is returned
  const responseData = (res as any).data;
  if (Array.isArray(responseData)) {
    return { data: responseData };
  }
  if (responseData && Array.isArray(responseData.data)) {
    return responseData;
  }
  return { data: [] };
}

export async function getVendorById(id: string): Promise<any> {
  const res = await apiClient.get<any>(`/vendors/${id}`);
  return res.data?.data || res.data || res;
}

export async function createVendor(data: any): Promise<{ message: string; data: any }> {
  const res = await apiClient.post<{ message: string; data: any }>('/vendors', data);
  return res.data;
}

export async function updateVendor(id: string, data: any): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/vendors/${id}`, data);
  return res.data;
}

export async function deleteVendor(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/vendors/${id}`);
  return res.data;
}

export async function getBookingVendors(bookingId: string): Promise<any[]> {
  const res = await apiClient.get<any[]>(`/bookings/${bookingId}/vendors`);
  return res.data;
}

export async function allocateVendorToBooking(
  bookingId: string,
  payload: any
): Promise<{ message: string; conflict: boolean; conflictMessage: string; data: any }> {
  const res = await apiClient.post<any>(`/bookings/${bookingId}/vendors`, payload);
  return res.data;
}

export async function updateVendorAllocation(
  bookingId: string,
  vendorId: string,
  payload: any
): Promise<any> {
  const res = await apiClient.put<any>(`/bookings/${bookingId}/vendors/${vendorId}`, payload);
  return res.data;
}

export async function deallocateVendorFromBooking(
  bookingId: string,
  vendorId: string
): Promise<any> {
  const res = await apiClient.delete<any>(`/bookings/${bookingId}/vendors/${vendorId}`);
  return res.data;
}

export async function getVendorAllocations(vendorId: string): Promise<any[]> {
  const res = await apiClient.get<any[]>(`/vendors/${vendorId}/allocations`);
  return res.data;
}

export async function getVendorAllocationStats(vendorId: string): Promise<any> {
  const res = await apiClient.get<any>(`/vendors/${vendorId}/allocation-stats`);
  return res.data;
}
