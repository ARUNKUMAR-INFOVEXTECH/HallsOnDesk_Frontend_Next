'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { EnquiryForm } from '@/components/enquiries/EnquiryForm';
import { useCreateEnquiry } from '@/hooks/useEnquiries';
import { EnquiryFormValues } from '@/schemas/enquiry.schema';
import { EnquiryStage } from '@/types/enquiry';

function NewEnquiryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateEnquiry();

  // Load selected stage from query param, e.g. /dashboard/enquiries/new?stage=interested
  const initialStage = (searchParams.get('stage') as EnquiryStage) || 'new';

  const handleSubmit = async (data: EnquiryFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/dashboard/enquiries');
    } catch (err) {
      console.error('Lead creation failed:', err);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/enquiries');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2 select-none">
      {/* Breadcrumb back navigation */}
      <div>
        <Link
          href="/dashboard/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-650 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Enquiries Dashboard
        </Link>
      </div>

      {/* Header banner */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Capture New Lead
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Capture wedding reception walkthrough schedules, telephone inquiries, or direct WhatsApp interest profiles.
        </p>
      </div>

      {/* Form Wizard */}
      <EnquiryForm
        onSubmit={handleSubmit}
        defaultValues={{ stage: initialStage }}
        isSubmitting={createMutation.isPending}
        submitButtonText="Register Enquiry"
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function NewEnquiryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-400 animate-pulse font-bold">
        Loading Lead Registration wizard...
      </div>
    }>
      <NewEnquiryContent />
    </Suspense>
  );
}
