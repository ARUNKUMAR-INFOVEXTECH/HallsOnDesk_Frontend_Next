'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CustomerForm, CustomerFormValues } from '@/components/customers/CustomerForm';
import { useCreateCustomerMutation } from '@/hooks/useCustomerQueries';

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomerMutation = useCreateCustomerMutation();

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      // Map form structure to API fields
      await createCustomerMutation.mutateAsync({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        // Backend doesn't support city/state at route root creation but it can be passed or set
        ...((data.city || data.state) ? {
          address: [data.address, data.city, data.state].filter(Boolean).join(', ')
        } : {})
      });
      
      // Redirect back to customer listing page
      router.push('/dashboard/customers');
    } catch (err) {
      // Errors are handled inside the hook via sonner toast
      console.error('Customer registration failed:', err);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/customers');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Breadcrumb Area */}
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Customer Directory
        </Link>
      </div>

      {/* Header Info */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Customer Record
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Initialize a new customer CRM record for bookings, event payments, and communication history.
        </p>
      </div>

      {/* Form Card wrapper */}
      <CustomerForm
        onSubmit={handleSubmit}
        loading={createCustomerMutation.isPending}
        submitLabel="Register Customer"
        onCancel={handleCancel}
      />
    </div>
  );
}
