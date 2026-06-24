'use client';

import React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { Booking } from '@/types/booking';
import { formatCurrency, formatDate, formatEventSlot } from '@/utils/formatters';
import { BookingStatusBadge, BookingPaymentStatusBadge } from './BookingStatusBadge';
import { DataTable } from '../tables/DataTable';
import { useDeleteBooking } from '@/hooks/useBookings';
import { obfuscateId } from '@/utils/obfuscate';

interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
}

// Utility relative date formatter (zero dependencies)
function getRelativeTimeString(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  } catch {
    return '';
  }
}

export function BookingTable({ bookings, isLoading = false }: BookingTableProps) {
  const deleteMutation = useDeleteBooking();

  const handleDelete = async (id: string, bookingNumber: string) => {
    if (window.confirm(`Are you sure you want to permanently delete booking #${bookingNumber}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // Columns definition matching TanStack ColumnDef schema
  const columns: ColumnDef<Booking, any>[] = [
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
      accessorKey: 'bookingNumber',
      header: 'Booking#',
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/bookings/${obfuscateId(row.original.id)}`}
            className="font-mono font-bold text-primary hover:text-primary-light transition-colors"
          >
            #{row.original.bookingNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        const name = row.original.customerName || 'Guest';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary-lighter border border-primary-light/10 flex items-center justify-center font-bold text-xs text-primary-light shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <span className="font-semibold text-slate-800 block text-xs leading-none">
                {name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1.5 block leading-none">
                {row.original.customerPhone || 'No phone'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'eventType',
      header: 'Event Type',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-650 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-primary-light shrink-0" />
            <span>{row.original.eventType}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'eventDate',
      header: 'Event Date',
      cell: ({ row }) => {
        const relativeTime = getRelativeTimeString(row.original.eventDate);
        return (
          <div>
            <span className="text-xs font-semibold text-slate-850 block leading-none">
              {formatEventSlot(row.original.eventDate, row.original.eventEndDate)}
            </span>
            {relativeTime && (
              <span className="text-[9px] text-primary-light font-bold mt-1.5 block leading-none uppercase tracking-wider">
                {relativeTime}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'bookingAmount',
      header: 'Amount',
      cell: ({ row }) => {
        const netAmount = Math.max(0, row.original.bookingAmount - row.original.discountAmount);
        return (
          <span className="text-xs font-bold text-slate-800 font-mono">
            {formatCurrency(netAmount)}
          </span>
        );
      },
    },
    {
      accessorKey: 'advanceAmount',
      header: 'Advance Paid',
      cell: ({ row }) => {
        return (
          <span className="text-xs font-bold text-emerald-600 font-mono">
            {formatCurrency(row.original.advanceAmount)}
          </span>
        );
      },
    },
    {
      accessorKey: 'pendingAmount',
      header: 'Pending',
      cell: ({ row }) => {
        const isPending = row.original.pendingAmount > 0;
        return (
          <span className={`text-xs font-bold font-mono ${isPending ? 'text-rose-600' : 'text-slate-500'}`}>
            {formatCurrency(row.original.pendingAmount)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        return <BookingStatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        return <BookingPaymentStatusBadge status={row.original.paymentStatus} />;
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
              href={`/dashboard/bookings/${obfuscateId(id)}`}
              title="View Details"
              className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/dashboard/bookings/${obfuscateId(id)}?tab=edit`}
              title="Edit Booking"
              className="h-7 w-7 inline-flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-350 bg-white rounded-md transition-all shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => handleDelete(id, row.original.bookingNumber)}
              title="Delete Booking"
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
    <div className="w-full">
      <DataTable
        columns={columns}
        data={bookings}
        searchKey="customerName"
        searchPlaceholder="Search bookings, customer, event..."
        exportFileName="bookings_list"
        bulkActions={[
          {
            label: 'Delete Selected',
            onClick: async (selected) => {
              if (
                window.confirm(
                  `Are you sure you want to delete ${selected.length} selected bookings?`
                )
              ) {
                // Delete sequentially in the background
                for (const item of selected) {
                  try {
                    await deleteMutation.mutateAsync(item.id);
                  } catch (err) {
                    console.error('Bulk delete item failed:', err);
                  }
                }
              }
            },
            className: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs',
          },
        ]}
      />
    </div>
  );
}
