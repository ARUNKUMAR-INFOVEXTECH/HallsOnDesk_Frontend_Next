'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  LayoutList,
  Download,
  Plus,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  SearchX,
  Users
} from 'lucide-react';
import { useStaffList, useStaffStats, useUpdateStaff, useDeleteStaff } from '@/hooks/useStaff';
import { useActiveSubscription } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { StaffStatsCards } from '@/components/staff/StaffStatsCards';
import { DepartmentFilterPills } from '@/components/staff/DepartmentFilterPills';
import { StaffCard } from '@/components/staff/StaffCard';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffEditDrawer } from '@/components/staff/StaffEditDrawer';
import { StaffDeleteModal } from '@/components/staff/StaffDeleteModal';
import { StaffMember, StaffStatus } from '@/types/staff';
import { calculateTenure } from '@/utils/tenure';
import { getLocalDateString } from '@/utils/formatters';

export default function StaffPage() {
  const router = useRouter();

  // 1. Persistent UI states (Grid vs Table view preference)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hod_staff_view') as 'grid' | 'table';
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hod_staff_view', mode);
    }
  };

  // 2. Filters state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // 3. React Queries
  const {
    data: staffRes,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useStaffList({
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    department: deptFilter,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useStaffStats();

  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  // Active subscription for user limits gating
  const { data: subscription } = useActiveSubscription();
  const activePackage = subscription?.packages;

  // Modals state
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<StaffMember | null>(null);

  const handleRefresh = () => {
    refetchList();
    refetchStats();
  };

  // Extract staff list
  const staff = staffRes?.data || [];
  const totalCount = staffRes?.total || 0;

  const totalStaffCount = stats?.totalStaff ?? totalCount;
  const totalUsersCount = totalStaffCount + 1; // Owner + Staff
  const maxUsers = activePackage?.max_users ?? null;
  const isLimitReached = maxUsers !== null && totalUsersCount >= maxUsers;

  const hasActiveFilters =
    search !== '' || roleFilter !== 'all' || statusFilter !== 'all' || deptFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDeptFilter('all');
  };

  // 4. Quick status update handler (optimistic & immediate)
  const handleStatusChange = (id: string, newStatus: StaffStatus) => {
    // Optimistic update of local queries state is handled by react-query invalidation, 
    // but we mutate it directly here
    updateStaffMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          handleRefresh();
        },
      }
    );
  };

  // Save changes from Edit Drawer
  const handleSaveEdit = (id: string, data: any) => {
    updateStaffMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditMember(null);
          handleRefresh();
        },
      }
    );
  };

  // Confirm delete from Delete Modal
  const handleConfirmDelete = (id: string) => {
    deleteStaffMutation.mutate(id, {
      onSuccess: () => {
        setDeleteMember(null);
        handleRefresh();
      },
    });
  };

  // 5. CSV Exporter (omitting salary & permissions for privacy reasons)
  const handleExportCSV = () => {
    if (staff.length === 0) return;

    const headers = [
      'Employee ID',
      'Name',
      'Role',
      'Department',
      'Phone',
      'Email',
      'City',
      'Status',
      'Joining Date',
      'Tenure',
    ];

    const rows = staff.map((s) => [
      s.employeeId,
      s.name,
      s.role,
      s.department,
      s.phone,
      s.email,
      s.city || '',
      s.status,
      s.joiningDate.substring(0, 10),
      calculateTenure(s.joiningDate),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val ?? '');
              return `"${str.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = getLocalDateString();
    link.setAttribute('download', `infovexhalls-staff-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Loading state skeleton loaders
  const renderSkeleton = () => {
    if (viewMode === 'table') {
      return (
        <div className="space-y-4 animate-pulse select-none">
          <div className="h-10 bg-slate-100 rounded-lg w-full border border-slate-200" />
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="h-14 bg-slate-100 rounded-lg w-full border border-slate-200" />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse select-none">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="h-44 bg-slate-100 border border-slate-200 rounded-xl w-full" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* User Limit Warning Banner */}
      {isLimitReached && (
        <div className="flex items-start md:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs">User Account Limit Reached</h4>
              <p className="text-[11px] text-amber-705 mt-1 leading-relaxed font-semibold">
                Your venue is currently on the <strong>{activePackage?.name}</strong> plan which allows a maximum of <strong>{maxUsers}</strong> active user accounts (1 Owner + {maxUsers - 1} Staff/Managers).
                You have used all available slots. To register additional team members, please upgrade your subscription plan.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/settings/subscription')}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-slate-850 tracking-tight">Staff Management</h1>
          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-150">
            {stats?.totalStaff ?? totalCount} members
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mr-1">
            <button
              onClick={() => handleToggleView('grid')}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary-lighter text-primary-light'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-55'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => handleToggleView('table')}
              className={`p-2 border-l border-slate-200 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary-lighter text-primary-light'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-55'
              }`}
              title="Table View"
            >
              <LayoutList className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={staff.length === 0}
            className="flex items-center justify-center gap-1.5 h-9 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export CSV</span>
          </button>

          {/* Add Staff button */}
          <button
            onClick={() => {
              if (isLimitReached) {
                toast.error(`User limit reached! Your plan allows a maximum of ${maxUsers} user accounts (Owner + Staff). Please upgrade.`);
                router.push('/settings/subscription');
              } else {
                router.push('/dashboard/staff/new');
              }
            }}
            className={`flex items-center justify-center gap-1.5 h-9 px-4.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer ${
              isLimitReached
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <StaffStatsCards stats={stats} isLoading={statsLoading} />

      {/* SEARCH + FILTER BAR CARD */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, employee ID..."
              className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-305 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-slate-705"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-605"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>

            {/* Clear filters trigger */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-primary-light hover:text-primary-light/80 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* DEPARTMENT FILTER PILLS BAR */}
        <div className="border-t border-slate-50 pt-3.5">
          <DepartmentFilterPills
            selectedDept={deptFilter}
            onSelectDept={setDeptFilter}
            departmentCounts={stats?.byDepartment}
            totalCount={stats?.totalStaff}
          />
        </div>
      </div>

      {/* CORE WORKSPACE LIST AREA */}
      {listError ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-red-200 rounded-xl bg-white select-none">
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-800">Failed to load staff list</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            A connection issue occurred while loading coworker details. Please retry.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-red-550 hover:bg-red-650 text-white h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : listLoading ? (
        renderSkeleton()
      ) : staff.length === 0 ? (
        // Empty States
        hasActiveFilters ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <SearchX className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No matching staff members</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No coworker matches your search filters or selected department constraints.
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-light hover:text-primary-light/80 border border-primary-light/20 hover:bg-primary-lighter h-8.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No staff members added</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Register managers, receptionists, accountants, and staff members to manage access controls.
            </p>
            <button
              onClick={() => router.push('/dashboard/staff/new')}
              className="bg-primary hover:bg-primary-hover text-white h-8.5 px-4.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add Your First Member</span>
            </button>
          </div>
        )
      ) : (
        // Main grid/table layout
        <div className="animate-in fade-in duration-300">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {staff.map((member) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  onEdit={(m) => setEditMember(m)}
                  onDelete={(id, name) => setDeleteMember(member)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <StaffTable
              data={staff}
              onEdit={(m) => setEditMember(m)}
              onDelete={(id, name) => setDeleteMember(staff.find((m) => m.id === id) || null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      )}

      {/* EDIT DRAWER SLIDE-OVER */}
      <StaffEditDrawer
        isOpen={!!editMember}
        onClose={() => setEditMember(null)}
        member={editMember}
        onSave={handleSaveEdit}
        isSaving={updateStaffMutation.isPending}
      />

      {/* SECURE DELETE CONFIRMATION MODAL */}
      <StaffDeleteModal
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        member={deleteMember}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteStaffMutation.isPending}
      />

    </div>
  );
}
