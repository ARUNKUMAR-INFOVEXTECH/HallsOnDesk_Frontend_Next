'use client';

import React from 'react';
import { useAdminPackages, useAdminSubscriptions } from '@/hooks/useAdmin';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  Check,
  Building,
  Users,
  CalendarRange,
  HardDrive,
  Clock,
  Loader2,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPackagesPage() {
  const { packages, isLoading, deletePackage } = useAdminPackages();
  const { subscriptions = [] } = useAdminSubscriptions();

  const handlePackageDelete = async (id: string, name: string) => {
    // Count how many halls are bound
    const boundCount = subscriptions.filter((s) => s.packageName === name).length;
    if (boundCount > 0) {
      alert(`CANNOT DELETE: There are ${boundCount} halls currently active under the "${name}" package. Re-assign those halls before deleting this plan.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the pricing plan "${name}"?`)) {
      await deletePackage(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">SaaS Pricing Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure subscription pricing structures, staff caps, and feature lists.
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Package</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading packages catalog...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-xl p-16 text-center max-w-lg mx-auto">
          <Layers className="h-10 w-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm mt-3">No Packages Defined</h3>
          <p className="text-xs text-gray-450 mt-1">Configure your first SaaS plan package parameters.</p>
          <Link
            href="/admin/packages/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg shadow-sm"
          >
            Create Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const hallCount = subscriptions.filter((s) => s.packageName === pkg.name).length;
            const billingPeriod = pkg.billing_cycle === 'yearly' ? 'year' : 'month';

            return (
              <div
                key={pkg.id}
                className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Package Head */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-950 text-sm font-sans tracking-tight block">
                      {pkg.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                      <Building className="h-3 w-3" />
                      <span>{hallCount} Active</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">/ {billingPeriod}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1">
                    Setup Fee: {pkg.setup_fee !== undefined && pkg.setup_fee !== null ? `₹${pkg.setup_fee.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>

                {/* Package Limits & Caps */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-600 shrink-0" />
                      <span>Max Staff: {pkg.max_users || 'Unlimited'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-violet-600 shrink-0" />
                      <span>Max Bookings: {pkg.max_bookings || 'Unlimited'}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <HardDrive className="h-4 w-4 text-violet-600 shrink-0" />
                      <span>Storage Capacity: 10 GB</span>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Included Features</span>
                    <div className="space-y-2">
                      {pkg.features && Array.isArray(pkg.features) && pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/packages/new?edit=${pkg.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-150 rounded-lg text-xs font-bold text-gray-600 border border-gray-200 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Plan</span>
                  </Link>

                  <button
                    onClick={() => handlePackageDelete(pkg.id, pkg.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg text-xs font-bold text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
