'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Star
} from 'lucide-react';
import { Vendor, VendorCategory } from '@/types/vendor';
import { obfuscateId } from '@/utils/obfuscate';
import { CategoryBadge } from './CategoryBadge';
import { VendorStatusBadge } from './VendorStatusBadge';
import { formatCurrency } from '@/utils/currency';
import { useAuthStore } from '@/store/authStore';

interface VendorTableProps {
  data: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string, name: string) => void;
}

export function VendorTable({ data, onEdit, onDelete }: VendorTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const canManage = !user || user.role === 'owner' || user.role === 'super_admin' || user.permissions?.includes('manage_vendors');

  const getInitials = (name: string) => {
    if (!name) return 'VD';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getCategoryAvatarStyles = (cat: VendorCategory) => {
    const styles: Record<VendorCategory, string> = {
      caterer: 'bg-orange-100 text-orange-700',
      decorator: 'bg-pink-100 text-pink-700',
      photographer: 'bg-blue-100 text-blue-700',
      videographer: 'bg-purple-100 text-purple-700',
      dj: 'bg-green-100 text-green-700',
      band: 'bg-yellow-100 text-yellow-750',
      florist: 'bg-rose-100 text-rose-700',
      lighting: 'bg-amber-100 text-amber-700',
      sound: 'bg-cyan-100 text-cyan-700',
      tent: 'bg-stone-100 text-stone-700',
      transport: 'bg-slate-100 text-slate-700',
      security: 'bg-red-100 text-red-755',
      cleaning: 'bg-teal-100 text-teal-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return styles[cat] || styles.other;
  };

  const columnHelper = createColumnHelper<Vendor>();

  const columns = useMemo(
    () => [
      // Vendor Profile Column
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Vendor
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const vendor = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-white/10 ${getCategoryAvatarStyles(
                  vendor.category
                )}`}
              >
                {getInitials(vendor.name)}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-800 leading-snug text-xs hover:underline cursor-pointer">
                  {vendor.name}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  ID: #{vendor.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          );
        },
      }),

      // Contact Details Column
      columnHelper.accessor('phone', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Contact</span>,
        cell: (info) => {
          const vendor = info.row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-mono text-xs text-slate-700 font-bold flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                {vendor.phone}
              </div>
              {vendor.email && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  {vendor.email}
                </div>
              )}
            </div>
          );
        },
      }),

      // Location Column
      columnHelper.accessor('city', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Location</span>,
        cell: (info) => {
          const vendor = info.row.original;
          return (
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {vendor.city}, {vendor.state}
              </span>
            </div>
          );
        },
      }),

      // Category badge Column
      columnHelper.accessor('category', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Category</span>,
        cell: (info) => <CategoryBadge category={info.getValue()} />,
      }),

      // Rating Column
      columnHelper.accessor('rating', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Rating
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const rating = info.getValue();
          return (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                {rating.toFixed(1)}
              </span>
            </div>
          );
        },
      }),

      // Engagements Count Column
      columnHelper.accessor('totalEngagements', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Engaged
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-bold text-slate-700 font-mono">
            {info.getValue()}
          </span>
        ),
      }),

      // Total Spend Paid Column
      columnHelper.accessor('totalAmountPaid', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Total Paid
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-extrabold text-emerald-600 font-mono">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),

      // Status pill Column
      columnHelper.accessor('status', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Status</span>,
        cell: (info) => <VendorStatusBadge status={info.getValue()} />,
      }),

      // Actions Column
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: (info) => {
          const vendor = info.row.original;
          const isOpen = activeMenuId === vendor.id;
          return (
            <div className="relative flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isOpen ? null : vendor.id);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                    }}
                  />
                  <div className="absolute right-0 mt-7 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-20 text-xs font-semibold text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                        router.push(`/dashboard/vendors/${obfuscateId(vendor.id)}`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      View Profile
                    </button>
                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          onEdit(vendor);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        Edit Vendor
                      </button>
                    )}
                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          onDelete(vendor.id, vendor.name);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 text-left transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-rose-550 shrink-0" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [activeMenuId, columnHelper, router, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Adjust page size dynamically
  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden select-none flex flex-col">
      {/* Scrollable Table View Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-semibold text-slate-650">
          <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold border-b border-slate-150">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <tr
                    key={header.id}
                    className="px-4.5 py-3.5 first:pl-6 last:pr-6 align-middle font-black"
                    style={{ display: 'table-cell' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </tr>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => router.push(`/dashboard/vendors/${obfuscateId(row.original.id)}`)}
                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4.5 py-3.5 first:pl-6 last:pr-6 align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  No matching vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 cursor-pointer"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} items
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-605 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <span className="font-mono text-slate-650 font-bold px-2 text-[11px]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-605 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default VendorTable;
