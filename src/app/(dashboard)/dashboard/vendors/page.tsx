'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  LayoutList,
  Download,
  Plus,
  Search,
  X,
  Filter,
  SearchX,
  AlertCircle,
  Users2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useVendors, useVendorStats, useDeleteVendor } from '@/hooks/useVendors';
import { VendorStatsCards } from '@/components/vendors/VendorStatsCards';
import { CategoryFilterPills } from '@/components/vendors/CategoryFilterPills';
import { VendorCard } from '@/components/vendors/VendorCard';
import { VendorTable } from '@/components/vendors/VendorTable';
import { Vendor } from '@/types/vendor';
import { obfuscateId } from '@/utils/obfuscate';

export default function VendorsPage() {
  const router = useRouter();

  // 1. Persistent UI states (Grid vs Table view preference)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hod_vendor_view') as 'grid' | 'table';
      if (saved) setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hod_vendor_view', mode);
    }
  };

  // 2. Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');

  // Debounced search term representation (we can simple query reactively on change, or debounce)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // 3. React Queries
  const {
    data: vendorsRes,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useVendors({
    search: debouncedSearch,
    category,
    status,
    city,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useVendorStats();

  const deleteVendorMutation = useDeleteVendor();

  const handleRefresh = () => {
    refetchList();
    refetchStats();
  };

  // Extract vendors list
  const vendors = vendorsRes?.data || [];
  const totalCount = vendorsRes?.total || 0;

  // 4. Derive Dynamic Cities list from all vendors in the workspace
  const citiesList = useMemo(() => {
    if (!stats || !stats.totalVendors) return [];
    // We can fetch up to 1000 items to fetch cities list
    const citiesSet = new Set<string>();
    // Fallback to active query result cities mapping
    vendors.forEach((v) => {
      if (v.city) citiesSet.add(v.city.trim());
    });
    return Array.from(citiesSet).sort();
  }, [vendors, stats]);

  const hasActiveFilters = search !== '' || category !== 'all' || status !== 'all' || city !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setCity('all');
  };

  // 5. Reversals / Deletions
  const handleDeleteVendor = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete vendor "${name}"? This action cannot be undone.`)) {
      deleteVendorMutation.mutate(id);
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    router.push(`/dashboard/vendors/${obfuscateId(vendor.id)}?edit=true`);
  };

  // 6. CSV Exporter Utility
  const handleExportCSV = () => {
    if (vendors.length === 0) return;

    const headers = [
      'Vendor Name',
      'Category',
      'Phone',
      'Email',
      'City',
      'State',
      'Rating',
      'Status',
      'Total Engagements',
      'Total Paid',
      'GST Number',
      'Created Date',
    ];

    const rows = vendors.map((v) => [
      v.name,
      v.category,
      v.phone,
      v.email || '',
      v.city,
      v.state,
      v.rating,
      v.status,
      v.totalEngagements,
      v.totalAmountPaid,
      v.gstNumber || '',
      v.createdAt.substring(0, 10),
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
    const dateStr = new Date().toISOString().substring(0, 10);
    link.setAttribute('download', `infovexhalls-vendors-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Loading state skeleton
  const renderSkeleton = () => {
    if (viewMode === 'table') {
      return (
        <div className="space-y-4 animate-pulse select-none">
          <div className="h-10 bg-slate-100 rounded-lg w-full border border-slate-200" />
          {[1, 2, 3, 4, 5, 6].map((idx) => (
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
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-slate-850 tracking-tight">Vendors</h1>
          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-150">
            {stats?.totalVendors ?? totalCount} total
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm mr-1">
            <button
              onClick={() => handleToggleView('grid')}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary-lighter text-primary-light'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
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
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Table View"
            >
              <LayoutList className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={vendors.length === 0}
            className="flex items-center justify-center gap-1.5 h-9 px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Export CSV</span>
          </button>

          {/* Add Vendor button */}
          <button
            onClick={() => router.push('/dashboard/vendors/new')}
            className="flex items-center justify-center gap-1.5 h-9 px-4.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <VendorStatsCards stats={stats} isLoading={statsLoading} />

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
              placeholder="Search vendor name, phone, city..."
              className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-slate-700"
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
            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>

            {/* City Selector */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bold text-slate-700 cursor-pointer max-w-[150px]"
            >
              <option value="all">All Cities</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Clear Filters Link */}
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

        {/* CATEGORY FILTER PILLS BAR */}
        <div className="border-t border-slate-50 pt-3.5">
          <CategoryFilterPills
            selectedCategory={category}
            onSelectCategory={setCategory}
            categoryCounts={stats?.categoryCounts}
            totalCount={stats?.totalVendors}
          />
        </div>
      </div>

      {/* CORE WORKSPACE LIST AREA */}
      {listError ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-red-200 rounded-xl bg-white select-none">
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle className="h-5 w-5 animate-bounce" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-800">Failed to load vendors</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            A connection issue occurred while syncing with the server. Please check your credentials or retry.
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
      ) : vendors.length === 0 ? (
        // Empty States
        hasActiveFilters ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 space-y-4 border border-dashed border-slate-200 rounded-xl bg-white select-none">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <SearchX className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No matching vendors found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No service profile matching your search keywords or filter criteria exists.
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
              <Users2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No vendors added yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Start building your centralized directory of caterers, decorators, and setup staff.
            </p>
            <button
              onClick={() => router.push('/dashboard/vendors/new')}
              className="bg-primary hover:bg-primary-hover text-white h-8.5 px-4.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add Your First Vendor</span>
            </button>
          </div>
        )
      ) : (
        // Main grid / table list view
        <div className="animate-in fade-in duration-300">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onEdit={handleEditVendor}
                  onDelete={handleDeleteVendor}
                />
              ))}
            </div>
          ) : (
            <VendorTable
              data={vendors}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
            />
          )}
        </div>
      )}
    </div>
  );
}
