'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // If the client side hydrated user role is not super_admin, redirect them to dashboard
    if (user && role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, role, router]);

  // If role is still loading or undefined, or not super_admin, show a high-end loader skeleton
  if (!user || role !== 'super_admin') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-[#7C3AED]" />
          <p className="text-sm font-medium text-gray-500">Securing admin environment...</p>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
