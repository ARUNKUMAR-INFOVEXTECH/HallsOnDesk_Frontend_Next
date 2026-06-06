'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Download,
  Trash2,
  SlidersHorizontal,
  Search,
} from 'lucide-react';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  // External pagination options (optional, defaults to client-side)
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: TData[]) => void;
    className?: string;
  }[];
  // Export option
  exportFileName?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  bulkActions,
  exportFileName = 'table_export',
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !!onPageChange, // True if server-side pagination
    pageCount: pageCount,
  });

  // Calculate selected rows data
  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  // Export to CSV helper
  const exportToCSV = () => {
    if (data.length === 0) return;
    
    // Extract visible columns headers
    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'select');
    const headers = visibleColumns.map(col => col.id || col.columnDef.header?.toString() || '');
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = visibleColumns.map(col => {
        const key = col.id as keyof TData;
        const val = row[key];
        const stringVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          {searchKey && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
            </>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Export button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-colors text-slate-600 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export
          </button>

          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-colors text-slate-600 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              Columns
            </button>
            {showVisibilityMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-premium z-10 py-2 text-xs text-slate-650 animate-fadeIn">
                <div className="px-3 py-1 font-semibold border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  Toggle Columns
                </div>
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'select') return null;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded border-slate-200 text-primary-light focus:ring-primary h-3.5 w-3.5 accent-primary-light cursor-pointer"
                      />
                      <span className="capitalize">{column.id}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Alert banner */}
      {selectedRows.length > 0 && bulkActions && (
        <div className="flex items-center justify-between px-4 py-2 border border-primary-light/20 bg-primary-lighter/75 rounded-lg text-xs font-medium text-slate-700 animate-fadeIn">
          <span>{selectedRows.length} rows selected</span>
          <div className="flex gap-2">
            {bulkActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick(selectedRows);
                  table.resetRowSelection();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors cursor-pointer text-xs font-semibold shadow-sm ${action.className || ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Element container */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-custom-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b border-slate-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    row.getIsSelected() ? 'bg-primary-lighter/30' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination footer */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-slate-500">
        <div>
          Showing page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount() || 1} ({data.length} total rows)
        </div>
        
        <div className="flex items-center gap-6">
          {/* Row count Selector */}
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (onPageSizeChange) {
                  onPageSizeChange(size);
                } else {
                  table.setPageSize(size);
                }
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => (onPageChange ? onPageChange(0) : table.setPageIndex(0))}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                onPageChange
                  ? onPageChange(pageIndex - 1)
                  : table.previousPage()
              }
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                onPageChange ? onPageChange(pageIndex + 1) : table.nextPage()
              }
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const last = table.getPageCount() - 1;
                onPageChange ? onPageChange(last) : table.setPageIndex(last);
              }}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
