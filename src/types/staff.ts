export type StaffRole =
  | 'owner'
  | 'manager'
  | 'staff'
  | 'receptionist'
  | 'accountant'
  | 'security'
  | 'cleaner'
  | 'other';

export type StaffDepartment =
  | 'management'
  | 'operations'
  | 'accounts'
  | 'security'
  | 'housekeeping'
  | 'other';

export type StaffStatus = 'active' | 'inactive' | 'on_leave';

export type StaffPermission =
  | 'view_bookings'
  | 'create_bookings'
  | 'edit_bookings'
  | 'delete_bookings'
  | 'view_customers'
  | 'create_customers'
  | 'edit_customers'
  | 'delete_customers'
  | 'view_payments'
  | 'create_payments'
  | 'view_vendors'
  | 'manage_vendors'
  | 'view_staff'
  | 'manage_staff'
  | 'view_reports'
  | 'manage_settings';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: StaffDepartment;
  employeeId: string;
  joiningDate: string;
  salary?: number;
  address?: string;
  city?: string;
  state?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profileImage?: string;
  status: StaffStatus;
  permissions: StaffPermission[];
  notes?: string;
  backupPassword?: string;
  createdAt: string;
  updatedAt: string;
  hallId?: string;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  onLeave: number;
  byRole: Record<StaffRole, number>;
  byDepartment: Record<StaffDepartment, number>;
  recentlyAdded: number;
}
