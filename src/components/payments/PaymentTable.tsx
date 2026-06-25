'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  ExternalLink,
  Receipt,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  ReceiptText,
} from 'lucide-react';
import { Payment, PaymentMethod, PaymentStatus } from '@/types/payment';
import { formatDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/currency';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { obfuscateId } from '@/utils/obfuscate';
import { useAuthStore } from '@/store/authStore';

interface PaymentTableProps {
  payments: Payment[];
  onViewReceipt: (payment: Payment) => void;
  onDeletePayment: (id: string, amount: number) => void;
  onBulkDelete: (ids: string[]) => void;
  isDeleting?: boolean;
}

export function PaymentTable({
  payments,
  onViewReceipt,
  onDeletePayment,
  onBulkDelete,
  isDeleting = false,
}: PaymentTableProps) {
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const canDelete = !user || user.role === 'owner' || user.role === 'super_admin' || user.permissions?.includes('create_payments');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // React Table States
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'paymentDate', desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    notes: false, // hidden by default, togglable
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Close dropdown helper
  React.useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.payment-actions-container')) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter payments client-side
  const filteredData = useMemo(() => {
    let result = [...payments];

    if (search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.customerName.toLowerCase().includes(q) ||
          p.bookingNumber.toLowerCase().includes(q) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
      );
    }

    if (methodFilter !== 'all') {
      result = result.filter((p) => p.paymentMethod === methodFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [payments, search, methodFilter, statusFilter]);

  // Relative Date Helper
  const getRelativeDaysText = (dateStr: string) => {
    if (!dateStr || dateStr === '—') return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      d.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = d.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'tomorrow';
      if (diffDays === -1) return 'yesterday';
      if (diffDays > 1) return `in ${diffDays} days`;
      return `${Math.abs(diffDays)} days ago`;
    } catch {
      return '';
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="rounded border-slate-205 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-violet-600 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="rounded border-slate-205 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-violet-600 cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'paymentDate',
        id: 'date',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 hover:text-slate-700 font-semibold cursor-pointer"
          >
            Date
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const rawDate = row.original.paymentDate;
          const formatted = formatDate(rawDate);
          
          // Use createdAt timestamp for exact timing of work done, fallback to paymentDate
          const rawTimestamp = row.original.createdAt || row.original.paymentDate;
          let formattedTime = '12:00 PM';
          try {
            const date = new Date(rawTimestamp);
            formattedTime = date.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
          } catch {}
          return (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-extrabold text-slate-800 font-mono">{formatted}</span>
              <span className="text-[10px] text-slate-400 font-medium font-mono">{formattedTime}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'customerName',
        id: 'customer',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 hover:text-slate-700 font-semibold cursor-pointer"
          >
            Customer
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const initials = (row.original.customerName || 'C')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-violet-50 border border-violet-100 text-violet-650 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                {initials}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-slate-800 text-xs">{row.original.customerName}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{row.original.customerPhone}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'bookingNumber',
        id: 'booking',
        header: 'Booking',
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 leading-none">
            <Link
              href={`/dashboard/bookings/${obfuscateId(row.original.bookingId)}`}
              className="text-violet-605 font-bold font-mono text-xs hover:underline hover:text-violet-750"
            >
              {row.original.bookingNumber}
            </Link>
            <span className="text-[10px] text-slate-400 font-medium">{row.original.eventType}</span>
          </div>
        ),
      },
      {
        accessorKey: 'eventDate',
        id: 'eventDate',
        header: 'Event Date',
        cell: ({ row }) => {
          const date = row.original.eventDate;
          const relative = getRelativeDaysText(date);
          return (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="text-slate-700 font-bold font-mono">{formatDate(date)}</span>
              <span className="text-[10px] text-slate-400 capitalize font-medium">{relative}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        id: 'amount',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 hover:text-slate-700 font-semibold cursor-pointer"
          >
            Amount
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const amt = row.original.amount;
          return (
            <span className={`font-mono text-xs ${
              amt >= 20000 ? 'text-green-600 font-extrabold text-sm' : 'text-slate-900 font-bold'
            }`}>
              {formatCurrency(amt)}
            </span>
          );
        },
      },
      {
        accessorKey: 'paymentMethod',
        id: 'method',
        header: 'Method',
        cell: ({ row }) => <PaymentMethodBadge method={row.original.paymentMethod} />,
      },
      {
        accessorKey: 'referenceNumber',
        id: 'reference',
        header: 'Reference',
        cell: ({ row }) => {
          const ref = row.original.referenceNumber;
          if (!ref || ref === '—') {
            return <span className="text-slate-350 italic font-medium">No reference</span>;
          }
          return <span className="font-mono text-[10px] font-bold text-slate-700">{ref}</span>;
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status;
          const badgeColors = {
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            failed: 'bg-rose-50 text-rose-650 border-rose-200',
            refunded: 'bg-purple-50 text-purple-750 border-purple-200',
          };
          const badgeClass = badgeColors[st] || badgeColors.completed;
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize tracking-wider ${badgeClass}`}>
              {st}
            </span>
          );
        },
      },
      {
        accessorKey: 'notes',
        id: 'notes',
        header: 'Notes',
        cell: ({ row }) => <span className="text-slate-450 italic font-medium leading-relaxed">{row.original.notes || '—'}</span>,
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          const isDropdownActive = activeDropdownId === item.id;
          
          return (
            <div className="relative print:hidden payment-actions-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(isDropdownActive ? null : item.id);
                }}
                className="p-1 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isDropdownActive && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-premium z-10 py-1.5 text-xs text-slate-650 font-bold animate-fadeIn">
                  <Link
                    href={`/dashboard/bookings/${obfuscateId(item.bookingId)}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    View Booking
                  </Link>
                  <button
                    type="button"
                    onClick={() => onViewReceipt(item)}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Receipt className="h-3.5 w-3.5 text-slate-400" />
                    View Receipt
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDeletePayment(item.id, item.amount)}
                      disabled={isDeleting}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-605 border-t border-slate-50 mt-1 pt-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Ledger
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [activeDropdownId, isDeleting, onDeletePayment, onViewReceipt]
  );

  const visibleColumns = canDelete ? columns : columns.filter((col) => col.id !== 'select');

  // React Table setup
  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRowsData = table.getSelectedRowModel().rows.map((r) => r.original);

  const handleBulkDelete = () => {
    const ids = selectedRowsData.map((p) => p.id);
    if (confirm(`Are you sure you want to reverse the ${ids.length} selected payment transactions?`)) {
      onBulkDelete(ids);
      table.resetRowSelection();
    }
  };

  return (
    <div className="space-y-4 w-full select-none">
      
      {/* Filters Bar card */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-550 print:hidden">
        
        {/* Left Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, booking, reference..."
            className="w-full h-9 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-350 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-slate-700"
          />
        </div>

        {/* Right filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Method Filter */}
          <div className="flex items-center gap-1.5">
            <span>Method</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 px-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Visibility column trigger */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center gap-1.5 px-3 h-9 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-all text-slate-650 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              Columns
            </button>

            {showVisibilityMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-premium z-10 py-2 animate-fadeIn text-xs">
                <div className="px-3 py-1 font-bold border-b border-slate-100 text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                  Columns Visibility
                </div>
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'select' || column.id === 'actions') return null;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded border-slate-205 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-violet-600 cursor-pointer"
                      />
                      <span className="capitalize font-semibold text-slate-600">{column.id}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(search || methodFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setMethodFilter('all');
                setStatusFilter('all');
              }}
              className="text-violet-605 hover:text-violet-750 transition-colors font-bold shrink-0 cursor-pointer text-xs"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Bulk actions box */}
      {selectedRowsData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border border-violet-100 bg-violet-50/50 rounded-lg text-xs font-semibold text-slate-700 animate-fadeIn shrink-0">
          <span>{selectedRowsData.length} transaction entries selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-650 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected Entries
          </button>
        </div>
      )}

      {/* Data Table */}
      {filteredData.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-custom-md">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 text-slate-400 font-bold">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 border-b border-slate-150 uppercase tracking-wider text-[10px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50/40 transition-all ${
                    row.getIsSelected() ? 'bg-violet-50/20' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-slate-200 bg-white rounded-xl py-16 px-6 text-center space-y-3.5 shadow-sm select-none flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">No matching payments found</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              We couldn't find any recorded payment transactions matching your search criteria or filter conditions.
            </p>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
          <div>
            Showing rows {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              filteredData.length,
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
            )}{' '}
            of {filteredData.length} entries
          </div>

          <div className="flex items-center gap-5">
            {/* Rows per page selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 rounded focus:outline-none cursor-pointer"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination controls buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-bold cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
