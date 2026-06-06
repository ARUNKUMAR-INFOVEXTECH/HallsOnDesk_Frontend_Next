import apiClient from '../client';

export interface StaffQuery {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StaffListResponse {
  data: any[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function getStaffList(params: StaffQuery = {}): Promise<StaffListResponse> {
  const res = await apiClient.get<StaffListResponse | any[]>('/staff', { params });
  if (Array.isArray(res)) {
    return { data: res };
  }
  if (res && Array.isArray((res as any).data)) {
    return res as StaffListResponse;
  }
  // Fallback to res.data if wrapped
  const responseData = (res as any).data;
  if (Array.isArray(responseData)) {
    return { data: responseData };
  }
  if (responseData && Array.isArray(responseData.data)) {
    return responseData;
  }
  return { data: [] };
}

export async function createStaff(data: any): Promise<{ message: string; data: any }> {
  const res = await apiClient.post<{ message: string; data: any }>('/staff', data);
  return res.data;
}

export async function updateStaff(id: string, data: any): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/staff/${id}`, data);
  return res.data;
}

export async function deleteStaff(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/staff/${id}`);
  return res.data;
}
