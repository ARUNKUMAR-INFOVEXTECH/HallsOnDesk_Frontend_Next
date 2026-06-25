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
  XCircle,
  CheckCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Mail,
  CalendarDays,
  Users,
  Bell,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { Enquiry } from '@/types/enquiry';
import { StageBadge } from './StageBadge';
import { SourceBadge } from './SourceBadge';
import { PriorityBadge } from './PriorityBadge';
import { obfuscateId } from '@/utils/obfuscate';
import { formatDate } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';

interface EnquiryTableProps {
  data: Enquiry[];
  onEdit: (enquiry: Enquiry) => void;
  onAddFollowup: (enquiry: Enquiry) => void;
  onMarkLost: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

export function EnquiryTable({
  data,
  onEdit,
  onAddFollowup,
  onMarkLost,
  onConvert,
  selectedIds,
  onSelectedIdsChange,
}: EnquiryTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const canCreateBookings = !user || user.role === 'owner' || user.role === 'super_admin' || user.permissions?.includes('create_bookings');
  const canEditBookings = !user || user.role === 'owner' || user.role === 'super_admin' || user.permissions?.includes('edit_bookings');

  const getInitials = (name: string) => {
    if (!name) return 'LD';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const columnHelper = createColumnHelper<Enquiry>();

  const columns = useMemo(
    () => [
      // Checkbox Column
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={data.length > 0 && selectedIds.length === data.length}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectedIdsChange(data.map((item) => item.id));
              } else {
                onSelectedIdsChange([]);
              }
            }}
            className="rounded border-slate-300 text-violet-650 focus:ring-violet-500 h-4 w-4 cursor-pointer"
          />
        ),
        cell: (info) => {
          const e = info.row.original;
          const isSelected = selectedIds.includes(e.id);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(evt) => {
                evt.stopPropagation();
                if (evt.target.checked) {
                  onSelectedIdsChange([...selectedIds, e.id]);
                } else {
                  onSelectedIdsChange(selectedIds.filter((id) => id !== e.id));
                }
              }}
              className="rounded border-slate-300 text-violet-650 focus:ring-violet-500 h-4 w-4 cursor-pointer"
            />
          );
        },
      }),
      // Enquiry Number Column
      columnHelper.accessor('enquiryNumber', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase text-left"
          >
            Enquiry
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const e = info.row.original;
          return (
            <div className="space-y-0.5">
              <span
                onClick={() => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}`)}
                className="font-mono text-xs text-violet-650 hover:text-violet-755 font-bold cursor-pointer hover:underline"
              >
                {e.enquiryNumber}
              </span>
              <span className="block text-[9px] text-slate-400 font-semibold font-mono">
                {formatDate(e.createdAt)}
              </span>
            </div>
          );
        },
      }),

      // Customer Column
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase text-left"
          >
            Customer
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const e = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-8.5 w-8.5 rounded-lg bg-violet-50 text-violet-755 border border-violet-100 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {getInitials(e.name)}
              </div>
              <div className="min-w-0">
                <div
                  onClick={() => router.push(`/dashboard/enquiries/${obfuscateId(e.id)}`)}
                  className="font-extrabold text-slate-800 leading-snug text-xs hover:text-violet-605 cursor-pointer hover:underline truncate max-w-[140px]"
                >
                  {e.name}
                </div>
                <div className="text-[10px] text-slate-450 font-mono mt-0.5 flex items-center gap-0.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {e.phone}
                </div>
              </div>
            </div>
          );
        },
      }),

      // Assignee Column
      columnHelper.display({
        id: 'assignee',
        header: () => <span className="text-[10px] tracking-wider uppercase">Assignee</span>,
        cell: (info) => {
          const e = info.row.original;
          if (!e.assignee) {
            return (
              <span className="text-[10px] font-bold text-slate-400 italic">
                Unassigned
              </span>
            );
          }
          const initials = getInitials(e.assignee.name);
          return (
            <div className="flex items-center gap-2">
              <div className="h-6.5 w-6.5 rounded-full bg-violet-50 text-violet-755 border border-violet-100 flex items-center justify-center font-black text-[9px] shrink-0 uppercase" title={e.assignee.name}>
                {initials}
              </div>
              <span className="text-[11px] text-slate-700 font-bold truncate max-w-[85px]" title={e.assignee.name}>
                {e.assignee.name}
              </span>
            </div>
          );
        },
      }),

      // Event Specifications
      columnHelper.accessor('eventType', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Event Requirements</span>,
        cell: (info) => {
          const e = info.row.original;
          return (
            <div className="space-y-1">
              <span className="bg-slate-100 border border-slate-200 text-slate-655 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">
                {e.eventType}
              </span>
              <div className="flex items-center gap-2.5 text-[9px] font-mono text-slate-450 font-bold">
                {e.eventDate ? (
                  <span className="flex items-center gap-0.5">
                    <CalendarDays className="h-3 w-3 text-slate-450" />
                    {format(new Date(e.eventDate), 'dd MMM yyyy')}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Date TBD</span>
                )}
                {e.guestCount && (
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3 text-slate-450" />
                    {e.guestCount}
                  </span>
                )}
              </div>
            </div>
          );
        },
      }),

      // Budget Range
      columnHelper.accessor('budgetMax', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Budget Range</span>,
        cell: (info) => {
          const e = info.row.original;
          if (e.budgetMin === undefined && e.budgetMax === undefined) {
            return <span className="text-xs text-slate-400 italic font-semibold">Budget TBD</span>;
          }
          const minStr = e.budgetMin ? `₹${e.budgetMin.toLocaleString('en-IN')}` : '₹0';
          const maxStr = e.budgetMax ? `₹${e.budgetMax.toLocaleString('en-IN')}` : 'TBD';
          return (
            <span className="text-xs text-slate-705 font-bold font-mono">
              {minStr} — {maxStr}
            </span>
          );
        },
      }),

      // Acquisition Source
      columnHelper.accessor('source', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Source</span>,
        cell: (info) => <SourceBadge source={info.getValue()} />,
      }),

      // Stage
      columnHelper.accessor('stage', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase text-left"
          >
            Stage
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => <StageBadge stage={info.getValue()} />,
      }),

      // Priority
      columnHelper.accessor('priority', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase text-left"
          >
            Priority
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => <PriorityBadge priority={info.getValue()} />,
      }),

      // Followup Column
      columnHelper.display({
        id: 'nextFollowup',
        header: () => <span className="text-[10px] tracking-wider uppercase">Next Followup</span>,
        cell: (info) => {
          const e = info.row.original;
          const nextF = e.followups
            .filter((f) => !f.completedAt)
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

          if (!nextF) {
            return <span className="text-slate-400 font-bold">—</span>;
          }

          const scheduled = new Date(nextF.scheduledAt);

          if (isToday(scheduled)) {
            return (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Bell className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                <span>Today, {format(scheduled, 'hh:mm a')}</span>
              </span>
            );
          }

          if (isPast(scheduled)) {
            return (
              <span className="text-xs font-bold text-rose-505 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="underline decoration-dotted">{format(scheduled, 'dd MMM yyyy')}</span>
              </span>
            );
          }

          return (
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{format(scheduled, 'dd MMM yyyy')}</span>
            </span>
          );
        },
      }),

      // Actions Context Menu
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: (info) => {
          const e = info.row.original;
          const menuOpen = activeMenuId === e.id;
          return (
            <div className="relative flex justify-end">
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  setActiveMenuId(menuOpen ? null : e.id);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-707 hover:bg-slate-55 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-7 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-25 text-[11px] font-bold text-slate-705 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setActiveMenuId(null);
                      router.push(`/dashboard/enquiries/${obfuscateId(e.id)}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-55 text-left transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    View Details
                  </button>
                  {canEditBookings && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setActiveMenuId(null);
                        onAddFollowup(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-55 text-left transition-colors cursor-pointer border-t border-slate-50"
                    >
                      <Bell className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      Add Followup
                    </button>
                  )}
                  {e.stage !== 'booked' && e.stage !== 'lost' && (
                    <>
                      {canCreateBookings && (
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setActiveMenuId(null);
                            onConvert(e);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-green-50 text-green-700 text-left transition-colors cursor-pointer border-t border-slate-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          Convert
                        </button>
                      )}
                      {canEditBookings && (
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setActiveMenuId(null);
                            onMarkLost(e);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-650 text-left transition-colors cursor-pointer border-t border-slate-50"
                        >
                          <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          Mark Lost
                        </button>
                      )}
                    </>
                  )}
                  {canEditBookings && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setActiveMenuId(null);
                        onEdit(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-55 text-left transition-colors cursor-pointer border-t border-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    [activeMenuId, columnHelper, onEdit, onAddFollowup, onMarkLost, onConvert, router, selectedIds, onSelectedIdsChange, data]
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

  // Handle outside menu click
  React.useEffect(() => {
    function handleClickOutside() {
      setActiveMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden select-none flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-semibold text-slate-655">
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
              <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4.5 py-3.5 first:pl-6 last:pr-6 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  No matching enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer */}
      <div className="bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              table.setPageSize(newSize);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 font-bold text-slate-705 cursor-pointer"
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
          <span className="font-mono text-slate-655 font-bold px-2 text-[11px]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnquiryTable;
