'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { StaffForm } from '@/components/staff/StaffForm';
import { useCreateStaff } from '@/hooks/useStaff';
import { StaffFormValues } from '@/schemas/staff.schema';

export default function NewStaffPage() {
  const router = useRouter();
  const createStaffMutation = useCreateStaff();

  const handleSubmit = async (data: StaffFormValues) => {
    try {
      await createStaffMutation.mutateAsync(data);
      // Redirect back to staff listing page
      router.push('/dashboard/staff');
    } catch (err) {
      console.error('Staff registration failed:', err);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/staff');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 select-none">
      {/* Breadcrumb Area */}
      <div>
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-650 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Staff Management
        </Link>
      </div>

      {/* Header Info */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Add Staff Member
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Register a new staff member, manager, or security officer and configure their access permissions.
        </p>
      </div>

      {/* Form Card wrapper */}
      <StaffForm
        onSubmit={handleSubmit}
        isSubmitting={createStaffMutation.isPending}
        submitButtonText="Register Staff Member"
        onCancel={handleCancel}
      />
    </div>
  );
}
