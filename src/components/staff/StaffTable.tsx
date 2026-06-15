'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Calendar,
  Shield,
  RefreshCw
} from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { RoleBadge } from './RoleBadge';
import { StaffStatusBadge } from './StaffStatusBadge';
import { DepartmentBadge } from './DepartmentBadge';
import { calculateTenure } from '@/utils/tenure';
import { formatDate } from '@/utils/formatters';

interface StaffTableProps {
  data: StaffMember[];
  onEdit: (member: StaffMember) => void;
  onDelete: (id: string, name: string) => void;
  onStatusChange: (id: string, newStatus: StaffStatus) => void;
}

export function StaffTable({ data, onEdit, onDelete, onStatusChange }: StaffTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeStatusChangeId, setActiveStatusChangeId] = useState<string | null>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setActiveStatusChangeId(null);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleAvatarStyles = (role: StaffRole) => {
    const styles: Record<StaffRole, string> = {
      owner: 'bg-primary-lighter text-primary-light border-primary-light/20',
      manager: 'bg-blue-100 text-blue-700 border-blue-200',
      staff: 'bg-green-100 text-green-700 border-green-200',
      receptionist: 'bg-pink-100 text-pink-700 border-pink-200',
      accountant: 'bg-amber-100 text-amber-705 border-amber-200',
      security: 'bg-red-100 text-red-700 border-red-200',
      cleaner: 'bg-teal-100 text-teal-700 border-teal-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[role] || styles.other;
  };

  const columnHelper = createColumnHelper<StaffMember>();

  const columns = useMemo(
    () => [
      // Staff Profile Column
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Staff Member
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const s = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-white/10 ${getRoleAvatarStyles(
                  s.role
                )}`}
              >
                {getInitials(s.name)}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-800 leading-snug text-xs">
                  {s.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  ID: {s.employeeId}
                </div>
              </div>
            </div>
          );
        },
      }),

      // Contact Column
      columnHelper.accessor('phone', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Contact</span>,
        cell: (info) => {
          const s = info.row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-mono text-xs text-slate-700 font-bold flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                {s.phone}
              </div>
              <div className="text-[10px] text-slate-450 flex items-center gap-1 truncate max-w-[150px]">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                {s.email}
              </div>
            </div>
          );
        },
      }),

      // Role Column
      columnHelper.accessor('role', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Role
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => <RoleBadge role={info.getValue()} size="sm" />,
      }),

      // Department Column
      columnHelper.accessor('department', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Department
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => <DepartmentBadge department={info.getValue()} />,
      }),

      // Joining Date / Tenure Column
      columnHelper.accessor('joiningDate', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-800 font-extrabold cursor-pointer text-[10px] tracking-wider uppercase"
          >
            Joining Date
            <ArrowUpDown className="h-3 w-3 shrink-0" />
          </button>
        ),
        cell: (info) => {
          const joining = info.getValue();
          return (
            <div className="space-y-0.5">
              <span className="text-xs text-slate-705 font-bold font-mono">
                {formatDate(joining)}
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold font-sans">
                {calculateTenure(joining)}
              </span>
            </div>
          );
        },
      }),

      // Status pill clickable Column
      columnHelper.accessor('status', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Status</span>,
        cell: (info) => {
          const s = info.row.original;
          const statusOpen = activeStatusChangeId === s.id;
          return (
            <div className="relative inline-block" ref={statusOpen ? statusRef : undefined}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStatusChangeId(statusOpen ? null : s.id);
                }}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer block"
                title="Click to quickly change status"
              >
                <StaffStatusBadge status={info.getValue()} />
              </button>

              {statusOpen && (
                <div className="absolute left-0 mt-1.5 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-30 text-xs font-semibold text-slate-705 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStatusChangeId(null);
                      onStatusChange(s.id, 'active');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                    Set Active
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStatusChangeId(null);
                      onStatusChange(s.id, 'inactive');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-400 shrink-0" />
                    Set Inactive
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStatusChangeId(null);
                      onStatusChange(s.id, 'on_leave');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    Mark On Leave
                  </button>
                </div>
              )}
            </div>
          );
        },
      }),

      // Permissions Column
      columnHelper.accessor('permissions', {
        header: () => <span className="text-[10px] tracking-wider uppercase">Permissions</span>,
        cell: (info) => {
          const list = info.getValue();
          return (
            <span className="inline-flex items-center gap-1 bg-primary-lighter text-primary-light border border-primary-light/25 rounded px-2 py-0.5 text-[10px] font-bold font-mono">
              <Shield className="h-3 w-3 shrink-0 text-primary-light" />
              {list.length} rules
            </span>
          );
        },
      }),

      // Actions Column
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: (info) => {
          const s = info.row.original;
          const menuOpen = activeMenuId === s.id;
          return (
            <div className="relative flex justify-end" ref={menuOpen ? menuRef : undefined}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(menuOpen ? null : s.id);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-707 hover:bg-slate-55 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-7 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-25 text-xs font-semibold text-slate-705 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      onEdit(s);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Edit Staff
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      setActiveStatusChangeId(s.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Change Status
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      onDelete(s.id, s.name);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-650 text-left transition-colors cursor-pointer border-t border-slate-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    [activeMenuId, activeStatusChangeId, columnHelper, onEdit, onDelete, onStatusChange]
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

  // Keep page size in sync
  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

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
              <tr
                key={row.id}
                className="hover:bg-slate-50/40 transition-colors"
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
                  No matching staff members found.
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
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-755 cursor-pointer"
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
export default StaffTable;
