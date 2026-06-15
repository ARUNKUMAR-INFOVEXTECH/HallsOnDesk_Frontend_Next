'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, User, ShieldCheck } from 'lucide-react';
import { staffCreateSchema, StaffCreateValues } from '@/schemas/staff.schema';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { PhoneField } from '@/components/forms/PhoneField';
import { SelectField } from '@/components/forms/SelectField';
import { PermissionGroup } from './PermissionGroup';
import { RolePresetButton } from './RolePresetButton';
import { StaffRole, StaffPermission } from '@/types/staff';

interface StaffFormProps {
  onSubmit: (data: StaffCreateValues) => void;
  defaultValues?: Partial<StaffCreateValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitButtonText?: string;
}

export function StaffForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  onCancel,
  submitButtonText = 'Save Staff Member',
}: StaffFormProps) {
  const [locationExpanded, setLocationExpanded] = useState(false);
  const [additionalExpanded, setAdditionalExpanded] = useState(false);

  const form = useForm<StaffCreateValues>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      department: 'other',
      employeeId: 'HOD-001', // suggest default format
      joiningDate: new Date().toISOString().substring(0, 10),
      salary: 0,
      address: '',
      city: '',
      state: 'Tamil Nadu',
      emergencyContactName: '',
      emergencyContactPhone: '',
      status: 'active',
      permissions: [],
      notes: '',
      password: '',
      ...defaultValues,
    },
  });

  const { register, control, setValue, formState: { isDirty } } = form;

  // Monitor selected role to display its description dynamically
  const selectedRole = useWatch({ control, name: 'role' }) as StaffRole;

  const roleDescriptions: Record<StaffRole, string> = {
    owner: 'Owner — Full access to everything',
    manager: 'Manager — Manage bookings and staff',
    staff: 'Staff — Day to day operations',
    receptionist: 'Receptionist — Handle enquiries and customers',
    accountant: 'Accountant — Manage payments and reports',
    security: 'Security — Security access only',
    cleaner: 'Cleaner — Basic access',
    other: 'Other — Custom access rules',
  };

  const roles = [
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'security', label: 'Security' },
    { value: 'cleaner', label: 'Cleaner' },
    { value: 'other', label: 'Other' },
  ] as const;

  const departments = [
    { value: 'management', label: 'Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'security', label: 'Security' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'other', label: 'Other' },
  ] as const;

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' },
  ] as const;

  // Permission Groups Config
  const bookingPermissions = [
    { value: 'view_bookings' as StaffPermission, label: 'View Bookings', description: 'Read reservation files' },
    { value: 'create_bookings' as StaffPermission, label: 'Create Bookings', description: 'Log new reservations and blocks' },
    { value: 'edit_bookings' as StaffPermission, label: 'Edit Bookings', description: 'Modify reservation properties' },
    { value: 'delete_bookings' as StaffPermission, label: 'Delete Bookings', description: 'Wipe reservation files' },
  ];

  const customerPermissions = [
    { value: 'view_customers' as StaffPermission, label: 'View Customers', description: 'View client directory records' },
    { value: 'create_customers' as StaffPermission, label: 'Create Customers', description: 'Add new client contact profiles' },
    { value: 'edit_customers' as StaffPermission, label: 'Edit Customers', description: 'Save updates to client details' },
    { value: 'delete_customers' as StaffPermission, label: 'Delete Customers', description: 'Remove customer profiles' },
  ];

  const paymentPermissions = [
    { value: 'view_payments' as StaffPermission, label: 'View Payments', description: 'Read transaction logs' },
    { value: 'create_payments' as StaffPermission, label: 'Record Payments', description: 'Log installments or receipts' },
  ];

  const vendorPermissions = [
    { value: 'view_vendors' as StaffPermission, label: 'View Vendors', description: 'View service rosters' },
    { value: 'manage_vendors' as StaffPermission, label: 'Manage Vendors', description: 'Create or update vendor details' },
  ];

  const staffPermissions = [
    { value: 'view_staff' as StaffPermission, label: 'View Staff', description: 'Read coworker details' },
    { value: 'manage_staff' as StaffPermission, label: 'Manage Staff', description: 'Register colleagues and edit permissions' },
  ];

  const reportPermissions = [
    { value: 'view_reports' as StaffPermission, label: 'View Reports', description: 'Access financial overview screens' },
    { value: 'manage_settings' as StaffPermission, label: 'Manage Settings', description: 'Modify account and application parameters' },
  ];

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to navigate away?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-6 pb-12 select-none">
      
      {/* CARD 1: Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-primary shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-850">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputField
              name="name"
              label="Full Name"
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>

          <InputField
            name="employeeId"
            label="Employee ID (Autosuggest format)"
            placeholder="e.g. HOD-001"
            required
          />

          <InputField
            name="joiningDate"
            label="Joining Date"
            type="date"
            required
          />

          <PhoneField
            name="phone"
            label="Phone Number"
            placeholder="9876543210"
            required
          />

          <InputField
            name="email"
            label="Email Address"
            type="email"
            placeholder="e.g. ramesh@mandapam.com"
            required
          />

          <InputField
            name="password"
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            required
          />
        </div>
      </div>

      {/* CARD 2: Role & Department */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Role & Department</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <SelectField
              name="role"
              label="Staff Role"
              options={roles}
              placeholder="Select role"
              required
            />
            <span className="text-[10px] text-primary-light font-bold bg-primary-lighter px-2.5 py-0.5 rounded border border-primary-light/20 inline-block font-mono">
              {roleDescriptions[selectedRole] || 'No role details selected'}
            </span>
          </div>

          <SelectField
            name="department"
            label="Department"
            options={departments}
            placeholder="Select department"
            required
          />

          <SelectField
            name="status"
            label="Initial Status"
            options={statuses}
            placeholder="Select status"
          />
        </div>
      </div>

      {/* CARD 3: Permissions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-850">Access Permissions</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Control staff permissions rules</p>
            </div>
          </div>

          {/* Quick preset filler */}
          <RolePresetButton
            selectedRole={selectedRole}
            onApply={(perms) => setValue('permissions', perms, { shouldDirty: true })}
          />
        </div>

        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <div className="space-y-6">
              <PermissionGroup
                title="Bookings & Calendar"
                items={bookingPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
              <PermissionGroup
                title="Customers & Directory"
                items={customerPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
              <PermissionGroup
                title="Payments & Revenue"
                items={paymentPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
              <PermissionGroup
                title="Vendors & Partners"
                items={vendorPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
              <PermissionGroup
                title="Colleague & Staffing"
                items={staffPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
              <PermissionGroup
                title="Reporting & Controls"
                items={reportPermissions}
                selectedPermissions={field.value || []}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </div>

      {/* CARD 4: Location & Emergency Contact (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setLocationExpanded(!locationExpanded)}
          className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-850">Address & Emergency Contact</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Optional
            </span>
          </div>
          {locationExpanded ? (
            <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          )}
        </button>

        {locationExpanded && (
          <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Street Address
              </label>
              <textarea
                id="address"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter building, area details..."
                {...register('address')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="city" label="City" placeholder="Chennai" />
              <InputField name="state" label="State" placeholder="Tamil Nadu" />
            </div>

            <div className="border-t border-slate-100 pt-3.5 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="emergencyContactName" label="Contact Person Name" placeholder="e.g. Suresh Kumar (Brother)" />
                <PhoneField name="emergencyContactPhone" label="Contact Person Phone" placeholder="9876543210" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD 5: Salary & Notes (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setAdditionalExpanded(!additionalExpanded)}
          className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-850">Salary & Additional Notes</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Optional
            </span>
          </div>
          {additionalExpanded ? (
            <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          )}
        </button>

        {additionalExpanded && (
          <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="salary" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Monthly Salary (Private Details)
                </label>
                <div className="relative flex rounded-md">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-550 text-sm">
                    ₹
                  </span>
                  <input
                    id="salary"
                    type="number"
                    placeholder="25000"
                    className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-r-md transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    {...register('salary', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Staff Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Add private performance summaries or other comments..."
                {...register('notes')}
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 transition-all disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isSubmitting && (
            <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{submitButtonText}</span>
        </button>
      </div>

    </FormProvider>
  );
}
export default StaffForm;
