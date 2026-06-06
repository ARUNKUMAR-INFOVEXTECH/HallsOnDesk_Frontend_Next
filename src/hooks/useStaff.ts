'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  StaffQuery,
} from '@/services/api/modules/staff.service';
import { StaffMember, StaffRole, StaffDepartment, StaffStatus, StaffStats } from '@/types/staff';

// ----------------------------------------------------------------------
// Backend <-> Frontend Adapter Layer
// ----------------------------------------------------------------------
export const mapBackendStaffToFrontend = (s: any): StaffMember => {
  // Extract permissions safely
  let parsedPermissions: any[] = [];
  if (Array.isArray(s.permissions)) {
    parsedPermissions = s.permissions;
  } else if (typeof s.permissions === 'string' && s.permissions.trim() !== '') {
    try {
      parsedPermissions = JSON.parse(s.permissions);
    } catch {
      parsedPermissions = s.permissions.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
  }

  // Enforce Role mapping
  const roleMap: Record<string, StaffRole> = {
    owner: 'owner',
    manager: 'manager',
    staff: 'staff',
    receptionist: 'receptionist',
    accountant: 'accountant',
    security: 'security',
    cleaner: 'cleaner',
    other: 'other',
  };
  const role: StaffRole = roleMap[(s.role || 'staff').toLowerCase()] || 'staff';

  // Enforce Department mapping
  const deptMap: Record<string, StaffDepartment> = {
    management: 'management',
    operations: 'operations',
    accounts: 'accounts',
    security: 'security',
    housekeeping: 'housekeeping',
    other: 'other',
  };
  const department: StaffDepartment = deptMap[(s.department || s.dept || 'other').toLowerCase()] || 'other';

  // Enforce Status mapping
  const statusInput = (s.status || 'active').toLowerCase();
  const status: StaffStatus =
    statusInput === 'inactive'
      ? 'inactive'
      : statusInput === 'on_leave' || statusInput === 'onleave'
      ? 'on_leave'
      : 'active';

  const employeeId = s.employee_id || s.employeeId || `HOD-${String(s.id).substring(0, 3).toUpperCase()}`;
  const joiningDate = s.joining_date || s.joiningDate || s.created_at || s.createdAt || new Date().toISOString();
  const salary = Number(s.salary || s.pay_amount || 0);

  return {
    id: String(s.id || ''),
    name: s.name || 'Staff Member',
    email: s.email || '',
    phone: s.phone || '',
    role,
    department,
    employeeId,
    joiningDate,
    salary,
    address: s.address || '',
    city: s.city || 'Chennai',
    state: s.state || 'Tamil Nadu',
    emergencyContactName: s.emergency_contact_name || s.emergencyContactName || '',
    emergencyContactPhone: s.emergency_contact_phone || s.emergencyContactPhone || '',
    profileImage: s.profile_image || s.profileImage || '',
    status,
    permissions: parsedPermissions,
    notes: s.notes || '',
    createdAt: s.created_at || s.createdAt || new Date().toISOString(),
    updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
  };
};

export const mapFrontendStaffToBackend = (s: any) => {
  return {
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    department: s.department,
    employee_id: s.employeeId,
    joining_date: s.joiningDate,
    salary: s.salary,
    address: s.address || null,
    city: s.city || null,
    state: s.state || null,
    emergency_contact_name: s.emergencyContactName || null,
    emergency_contact_phone: s.emergencyContactPhone || null,
    status: s.status || 'active',
    permissions: s.permissions || [],
    notes: s.notes || '',

    // Duplicate fields for camelCase database adapters
    employeeId: s.employeeId,
    joiningDate: s.joiningDate,
    emergencyContactName: s.emergencyContactName || null,
    emergencyContactPhone: s.emergencyContactPhone || null,
  };
};

// ----------------------------------------------------------------------
// Hooks Interface
// ----------------------------------------------------------------------
export function useStaffList(params: {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryParams: StaffQuery = {
    search: params.search || undefined,
    role: params.role === 'all' || !params.role ? undefined : params.role,
    department: params.department === 'all' || !params.department ? undefined : params.department,
    status: params.status === 'all' || !params.status ? undefined : params.status,
    page: params.page,
    limit: params.limit,
  };

  return useQuery<{ data: StaffMember[]; total: number }, Error>({
    queryKey: ['staff', params],
    queryFn: async () => {
      const res = await getStaffList(queryParams);
      const mappedData = (res.data || []).map(mapBackendStaffToFrontend);
      
      // Perform local search/filter fallbacks
      let filtered = mappedData;

      if (params.search && params.search.trim() !== '') {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            s.employeeId.toLowerCase().includes(q)
        );
      }

      if (params.role && params.role !== 'all') {
        filtered = filtered.filter((s) => s.role === params.role);
      }

      if (params.department && params.department !== 'all') {
        filtered = filtered.filter((s) => s.department === params.department);
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((s) => s.status === params.status);
      }

      return {
        data: filtered,
        total: res.meta?.total ?? filtered.length,
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useStaffStats() {
  return useQuery<StaffStats, Error>({
    queryKey: ['staff-stats'],
    queryFn: async () => {
      const res = await getStaffList({ limit: 1000 });
      const staff = (res.data || []).map(mapBackendStaffToFrontend);

      const totalStaff = staff.length;
      const activeStaff = staff.filter((s) => s.status === 'active').length;
      const onLeave = staff.filter((s) => s.status === 'on_leave').length;

      const byRole: Record<StaffRole, number> = {
        owner: 0,
        manager: 0,
        staff: 0,
        receptionist: 0,
        accountant: 0,
        security: 0,
        cleaner: 0,
        other: 0,
      };

      const byDepartment: Record<StaffDepartment, number> = {
        management: 0,
        operations: 0,
        accounts: 0,
        security: 0,
        housekeeping: 0,
        other: 0,
      };

      staff.forEach((s) => {
        if (byRole[s.role] !== undefined) byRole[s.role]++;
        else byRole.other++;

        if (byDepartment[s.department] !== undefined) byDepartment[s.department]++;
        else byDepartment.other++;
      });

      // Calculate recently added staff (joined in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyAdded = staff.filter((s) => new Date(s.joiningDate) >= thirtyDaysAgo).length;

      return {
        totalStaff,
        activeStaff,
        onLeave,
        byRole,
        byDepartment,
        recentlyAdded,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const backendPayload = mapFrontendStaffToBackend(data);
      return createStaff(backendPayload);
    },
    onSuccess: () => {
      toast.success('Staff member added successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to add staff member profile.';
      toast.error(errMsg);
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const backendPayload = mapFrontendStaffToBackend(data);
      return updateStaff(id, backendPayload);
    },
    onSuccess: () => {
      toast.success('Staff member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to save staff updates.';
      toast.error(errMsg);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success('Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to remove staff member.';
      toast.error(errMsg);
    },
  });
}
