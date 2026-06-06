'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCreateVendor } from '@/hooks/useVendors';
import { VendorForm } from '@/components/vendors/VendorForm';
import { VendorFormValues } from '@/schemas/vendor.schema';

export default function NewVendorPage() {
  const router = useRouter();
  const createVendorMutation = useCreateVendor();

  const handleSubmit = (data: VendorFormValues) => {
    createVendorMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard/vendors');
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      
      {/* Navigation & Header */}
      <div className="space-y-2.5">
        <button
          onClick={() => router.push('/dashboard/vendors')}
          className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Vendors Directory</span>
        </button>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-850 tracking-tight leading-none">
            Add New Vendor
          </h2>
          <p className="text-xs text-slate-450 font-semibold">
            Register a new partner service profile to your venue management roster.
          </p>
        </div>
      </div>

      {/* Main Vendor Form Card */}
      <VendorForm
        onSubmit={handleSubmit}
        isSubmitting={createVendorMutation.isPending}
        onCancel={() => router.push('/dashboard/vendors')}
        submitButtonText="Add Vendor Profile"
      />

    </div>
  );
}
