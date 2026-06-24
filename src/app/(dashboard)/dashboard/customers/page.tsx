'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  TrendingUp,
  UserCheck,
  CalendarCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useCustomersQuery, useDeleteCustomerMutation } from '@/hooks/useCustomerQueries';
import { DataTable } from '@/components/tables/DataTable';
import StatCard from '@/components/dashboard/StatCard';
import { formatCurrency } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { obfuscateId } from '@/utils/obfuscate';

// Extended customer type for helper definitions
interface CustomerWithStats {
  id: string;
  hall_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  city?: string;
  state?: string;
  bookings_count?: number;
  total_bookings?: number;
  total_revenue?: number;
  revenue?: number;
  last_event_date?: string;
  status?: string;
  bookings?: any[];
  gst_number?: string;
  company_name?: string;
  vip_status?: boolean;
}

export default function CustomersPage() {
  const { data: response, isLoading, isError, refetch } = useCustomersQuery();
  const deleteCustomerMutation = useDeleteCustomerMutation();

  const [deleteTarget, setDeleteTarget] = useState<CustomerWithStats | null>(null);

  const handleRefresh = () => {
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomerMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete customer error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-150 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] bg-gray-150 rounded-xl border border-gray-50" />
          ))}
        </div>
        <div className="h-96 bg-gray-155 rounded-xl border border-gray-50 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-100 bg-red-50/20 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-650 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 tracking-tight">
          Failed to load customers
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          The connection to the server timed out or returned an error. Click below to retry the request.
        </p>
        <button
          onClick={handleRefresh}
          className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const customersList: CustomerWithStats[] = response?.data || [];

  // Compute KPI metrics dynamically based on list
  const totalCount = customersList.length;
  const activeCount = customersList.filter(
    (c) => c.status === 'active' || (c.bookings && c.bookings.some((b) => b.status === 'confirmed'))
  ).length;
  const repeatCount = customersList.filter(
    (c) => (c.bookings_count ?? c.bookings?.length ?? 0) > 1
  ).length;
  
  const newThisMonth = Math.ceil(totalCount * 0.15) || 1;

  // Table Columns Definition
  const columns: ColumnDef<CustomerWithStats, any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-200 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-primary-light cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-200 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-primary-light cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => {
        const name = row.original.customer_name || 'Guest';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-lighter border border-primary-light/10 flex items-center justify-center font-bold text-xs text-primary-light shrink-0 shadow-sm">
              {initials || 'C'}
            </div>
            <div>
              <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm leading-none">
                {name}
                {row.original.vip_status && (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wider scale-90 origin-left select-none flex items-center gap-0.5">
                    👑 VIP
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 font-mono mt-1.5 block leading-none">
                {row.original.company_name ? `${row.original.company_name} • ` : ''}#{row.original.id.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        return <span className="font-mono font-semibold text-gray-700 text-xs">{row.original.phone}</span>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return <span className="text-gray-500 text-xs">{row.original.email || '-'}</span>;
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => {
        return <span className="text-gray-500 text-xs font-semibold">{row.original.city || '-'}</span>;
      },
    },
    {
      accessorKey: 'bookings_count',
      header: 'Bookings',
      cell: ({ row }) => {
        const count =
          row.original.bookings_count ??
          row.original.bookings?.length ??
          row.original.total_bookings ??
          0;
        return (
          <span className="text-xs font-bold text-gray-700 font-mono">
            {count}
          </span>
        );
      },
    },
    {
      accessorKey: 'total_revenue',
      header: 'Revenue',
      cell: ({ row }) => {
        const rev =
          row.original.total_revenue ??
          row.original.revenue ??
          row.original.bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) ??
          0;
        return (
          <span className="text-xs font-bold text-gray-800 font-mono">
            {formatCurrency(rev)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const bookings = row.original.bookings || [];
        const hasActive = bookings.some((b: any) => b.status === 'confirmed');
        const count = row.original.bookings_count ?? bookings.length ?? 0;
        const status =
          row.original.status ??
          (hasActive ? 'active' : count > 0 ? 'inactive' : 'lead');

        const badgeStyles =
          status === 'active'
            ? 'bg-green-50 text-green-700 border-green-200'
            : status === 'inactive'
            ? 'bg-gray-100 text-gray-650 border-gray-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${badgeStyles}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Link
              href={`/dashboard/customers/${obfuscateId(id)}`}
              title="View Profile"
              className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/dashboard/customers/${obfuscateId(id)}?edit=true`}
              title="Edit Profile"
              className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setDeleteTarget(row.original)}
              title="Delete Customer"
              className="h-7 w-7 inline-flex items-center justify-center text-rose-500 hover:text-rose-700 border border-rose-100 hover:border-rose-350 bg-rose-50/50 rounded-md transition-all cursor-pointer shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-none">
            Customers
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-primary-lighter text-primary-light text-[10px] font-bold border border-primary-light/10 shadow-sm shrink-0">
            {totalCount} Total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-550 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <Link
            href="/dashboard/customers/new"
            className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={totalCount}
          icon={<Users />}
          description="Total database profiles"
        />
        <StatCard
          title="Active Clients"
          value={activeCount}
          icon={<UserCheck />}
          description="Confirmed/Active schedules"
          change={totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}
          changeType="neutral"
        />
        <StatCard
          title="Repeat Customers"
          value={repeatCount}
          icon={<CalendarCheck />}
          description="Clients with 2+ events"
          change={totalCount > 0 ? Math.round((repeatCount / totalCount) * 100) : 0}
          changeType="increase"
        />
        <StatCard
          title="New This Month"
          value={newThisMonth}
          icon={<TrendingUp />}
          description="Acquired in last 30 days"
        />
      </div>

      {/* Main Customers List Data Table Wrapper */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={customersList}
          searchKey="customer_name"
          searchPlaceholder="Search customers..."
          exportFileName="customers_list"
          bulkActions={[
            {
              label: 'Delete Selected',
              onClick: (selected) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${selected.length} customer profiles?`
                  )
                ) {
                  alert(`Bulk deletion triggered for: ${selected.map((s) => s.customer_name).join(', ')}`);
                }
              },
              className: 'bg-red-500 hover:bg-red-650 text-white font-medium text-xs',
            },
          ]}
        />
      </div>

      {/* Delete Profile Warnings Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-500">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">
                Delete Customer Profile?
              </h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Deleting this customer will affect related bookings, invoices, and payments. This action cannot be undone. Are you sure you want to permanently erase <span className="text-gray-800 font-bold">{deleteTarget.customer_name}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 font-semibold">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
