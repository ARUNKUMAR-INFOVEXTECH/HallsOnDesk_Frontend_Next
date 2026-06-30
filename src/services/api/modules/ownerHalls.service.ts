import apiClient from '../client';

export interface HallLocation {
  address: string;
  district: string;
  state: string;
  pincode: string;
}

export interface OwnerHall {
  id: string;
  hall_name: string;
  role: 'Primary' | 'Secondary';
  location: HallLocation;
  staffCount: number;
  bookingsCount: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface OwnerSubscriptionDetails {
  planName: string;
  status: string;
  endDate: string | null;
  maxHalls: number;
  currentHalls: number;
  remainingHalls: number;
  totalOrganizationUsers?: number;
}

export interface OwnerHallsResponse {
  halls: OwnerHall[];
  subscription: OwnerSubscriptionDetails;
}

export async function getOwnerHalls(): Promise<OwnerHallsResponse> {
  const res = await apiClient.get<OwnerHallsResponse>('/owner/halls');
  return res.data;
}

export async function createSecondaryHall(data: {
  hall_name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
}): Promise<{ message: string; hall: OwnerHall }> {
  const res = await apiClient.post<{ message: string; hall: OwnerHall }>('/owner/halls', data);
  return res.data;
}

export async function updateSecondaryHall(
  id: string,
  data: {
    hall_name?: string;
    address?: string;
    district?: string;
    state?: string;
    pincode?: string;
    status?: 'active' | 'inactive';
  }
): Promise<{ message: string; hall: any }> {
  const res = await apiClient.patch<{ message: string; hall: any }>(`/owner/halls/${id}`, data);
  return res.data;
}

export async function deleteSecondaryHall(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/owner/halls/${id}`);
  return res.data;
}

export async function transferStaffMember(staffId: string, targetHallId: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(`/owner/staff/${staffId}/transfer`, {
    target_hall_id: targetHallId,
  });
  return res.data;
}
