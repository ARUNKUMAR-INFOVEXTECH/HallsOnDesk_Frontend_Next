'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ShieldCheck, User, Info, FileText } from 'lucide-react';
import { staffFormSchema, StaffFormValues } from '@/schemas/staff.schema';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { PhoneField } from '@/components/forms/PhoneField';
import { SelectField } from '@/components/forms/SelectField';
import { PermissionGroup } from './PermissionGroup';
import { RolePresetButton } from './RolePresetButton';
import { RoleBadge } from './RoleBadge';
import { StaffMember, StaffRole, StaffPermission } from '@/types/staff';

interface StaffEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: StaffMember | null;
  onSave: (id: string, data: StaffFormValues) => void;
  isSaving?: boolean;
}

type SubTabType = 'details' | 'permissions' | 'additional';

export function StaffEditDrawer({
  isOpen,
  onClose,
  member,
  onSave,
  isSaving = false,
}: StaffEditDrawerProps) {
  const [activeTab, setActiveTab] = useState<SubTabType>('details');

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
  });

  const { setValue, control, handleSubmit, reset } = form;

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        department: member.department,
        employeeId: member.employeeId,
        joiningDate: member.joiningDate.substring(0, 10),
        salary: member.salary || 0,
        address: member.address || '',
        city: member.city || '',
        state: member.state || '',
        emergencyContactName: member.emergencyContactName || '',
        emergencyContactPhone: member.emergencyContactPhone || '',
        status: member.status,
        permissions: member.permissions,
        notes: member.notes || '',
      });
      setActiveTab('details');
    }
  }, [member, reset]);

  const selectedRole = useWatch({ control, name: 'role' }) as StaffRole;

  if (!isOpen || !member) return null;

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

  // Permissions Data Mappings
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

  const handleFormSubmit = (data: StaffFormValues) => {
    onSave(member.id, data);
  };

  const tabs: { value: SubTabType; label: string; icon: any }[] = [
    { value: 'details', label: 'Details', icon: User },
    { value: 'permissions', label: 'Permissions', icon: ShieldCheck },
    { value: 'additional', label: 'Additional', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Background mobile overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[520px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-850 tracking-tight">
                Edit Staff Member
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-semibold text-slate-500">
                  {member.name}
                </span>
                <RoleBadge role={member.role} size="sm" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-605 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sub-tabs Selection inside Drawer */}
          <div className="px-5 border-b border-slate-100 flex gap-4 text-xs font-bold text-slate-450 pt-2 bg-slate-50/40">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`pb-2.5 border-b-2 flex items-center gap-1 cursor-pointer transition-all ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent hover:text-slate-700'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Scrollable Body form content */}
          <div className="flex-1 overflow-y-auto p-5">
            <FormProvider form={form} onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <InputField name="name" label="Full Name" required />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputField name="employeeId" label="Employee ID" required />
                    <InputField name="joiningDate" label="Joining Date" type="date" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PhoneField name="phone" label="Phone Number" placeholder="98765 43210" required />
                    <InputField name="email" label="Email Address" type="email" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField name="role" label="Staff Role" options={roles} required />
                    <SelectField name="department" label="Department" options={departments} required />
                  </div>

                  <SelectField name="status" label="Status" options={statuses} />

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Street Address</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter street and area details..."
                      {...form.register('address')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField name="city" label="City" />
                    <InputField name="state" label="State" />
                  </div>
                </div>
              )}

              {/* TAB 2: PERMISSIONS */}
              {activeTab === 'permissions' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      Quick presets available
                    </span>
                    <RolePresetButton
                      selectedRole={selectedRole}
                      onApply={(perms) => setValue('permissions', perms, { shouldDirty: true })}
                    />
                  </div>

                  <Controller
                    name="permissions"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-5">
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
              )}

              {/* TAB 3: ADDITIONAL */}
              {activeTab === 'additional' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                      Emergency Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField name="emergencyContactName" label="Contact Name" placeholder="e.g. Suresh (Brother)" />
                      <PhoneField name="emergencyContactPhone" label="Contact Phone" />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">
                      Private & Billing Info
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="drawer-salary" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Monthly Salary
                      </label>
                      <div className="relative flex rounded-md">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-550 text-sm">
                          ₹
                        </span>
                        <input
                          id="drawer-salary"
                          type="number"
                          placeholder="25000"
                          className="block w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-r-md transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent font-semibold text-slate-700"
                          {...form.register('salary', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="drawer-notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Staff notes
                      </label>
                      <textarea
                        id="drawer-notes"
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Private details, comments, etc..."
                        {...form.register('notes')}
                      />
                    </div>
                  </div>
                </div>
              )}

            </FormProvider>
          </div>

          {/* Drawer Footer */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3.5">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 border border-slate-200 hover:border-slate-355 hover:bg-white rounded-lg text-xs font-bold text-slate-605 transition-all disabled:opacity-50 cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSaving}
              className="h-9 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaving && (
                <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>Save Changes</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
export default StaffEditDrawer;
