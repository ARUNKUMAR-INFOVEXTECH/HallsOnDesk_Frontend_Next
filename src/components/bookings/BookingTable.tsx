'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { Booking } from '@/types/booking';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { BookingStatusBadge, BookingPaymentStatusBadge } from './BookingStatusBadge';
import { DataTable } from '../tables/DataTable';
import { useDeleteBooking } from '@/hooks/useBookings';

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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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
            href={`/dashboard/bookings/${row.original.id}`}
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
              {formatDate(row.original.eventDate)}
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
      accessorKey: 'hallSection',
      header: 'Hall Section',
      cell: ({ row }) => {
        return <span className="text-xs font-semibold text-slate-600">{row.original.hallSection}</span>;
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const id = row.original.id;
        const isMenuOpen = activeMenuId === id;
        return (
          <div className="relative text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isMenuOpen ? null : id);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="h-4.5 w-4.5" />
            </button>
            
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(null);
                  }}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-left animate-fadeIn text-xs font-semibold">
                  <Link
                    href={`/dashboard/bookings/${id}`}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    View Details
                  </Link>
                  <Link
                    href={`/dashboard/bookings/${id}?tab=edit`}
                    onClick={() => setActiveMenuId(null)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-400" />
                    Edit Booking
                  </Link>
                  <button
                    onClick={() => {
                      handleDelete(id, row.original.bookingNumber);
                      setActiveMenuId(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 w-full text-left cursor-pointer border-t border-slate-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Booking
                  </button>
                </div>
              </>
            )}
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
