'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { StaffRole } from '@/types/staff';

export const ROLE_PRESETS: Record<StaffRole, string[]> = {
  owner: [
    'view_bookings',
    'create_bookings',
    'edit_bookings',
    'delete_bookings',
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers',
    'view_payments',
    'create_payments',
    'view_vendors',
    'manage_vendors',
    'view_staff',
    'manage_staff',
    'view_reports',
    'manage_settings',
  ],
  manager: [
    'view_bookings',
    'create_bookings',
    'edit_bookings',
    'view_customers',
    'create_customers',
    'edit_customers',
    'view_payments',
    'create_payments',
    'view_vendors',
    'manage_vendors',
    'view_staff',
    'view_reports',
  ],
  staff: [
    'view_bookings',
    'create_bookings',
    'view_customers',
    'create_customers',
    'view_payments',
    'view_vendors',
  ],
  receptionist: [
    'view_bookings',
    'view_customers',
    'create_customers',
  ],
  accountant: [
    'view_bookings',
    'view_payments',
    'create_payments',
    'view_reports',
  ],
  security: [
    'view_bookings',
  ],
  cleaner: [],
  other: [],
};

interface RolePresetButtonProps {
  selectedRole: StaffRole;
  onApply: (permissions: string[]) => void;
  className?: string;
}

export function RolePresetButton({
  selectedRole,
  onApply,
  className = '',
}: RolePresetButtonProps) {
  const preset = ROLE_PRESETS[selectedRole] || [];

  const handleApplyPreset = () => {
    onApply(preset);
  };

  const roleLabels: Record<StaffRole, string> = {
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
    receptionist: 'Receptionist',
    accountant: 'Accountant',
    security: 'Security',
    cleaner: 'Cleaner',
    other: 'Custom',
  };

  return (
    <button
      type="button"
      onClick={handleApplyPreset}
      className={`h-8 px-3 border border-violet-250 hover:bg-violet-50 text-violet-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${className}`}
    >
      <ShieldAlert className="h-4 w-4 shrink-0 text-violet-605" />
      <span>Apply {roleLabels[selectedRole] || 'Role'} Preset</span>
    </button>
  );
}
export default RolePresetButton;
