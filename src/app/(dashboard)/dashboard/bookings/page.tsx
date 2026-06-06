'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, AlertCircle, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingStatsCards } from '@/components/bookings/BookingStatsCards';
import { BookingTable } from '@/components/bookings/BookingTable';

export default function BookingsListPage() {
  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch bookings list using React Query
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookings({
    search,
    status: status === 'all' ? undefined : status,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const handleRefresh = () => {
    refetch();
  };

  // 1. Loading Skeletons
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="h-9 bg-slate-100 rounded w-28" />
        </div>

        {/* 4 KPI cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] bg-slate-100 border border-slate-200 rounded-xl" />
          ))}
        </div>

        {/* Filters bar skeleton */}
        <div className="h-14 bg-slate-100 border border-slate-200 rounded-xl w-full" />

        {/* Table skeleton (8 rows) */}
        <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
          <div className="h-6 bg-slate-50 rounded w-full" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-50/50 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  // 2. Fetch Error state
  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50/30 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 my-12 animate-fadeIn shadow-sm">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-650 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 tracking-tight">
          Failed to load bookings
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {error?.message || 'The connection to the server timed out or returned an error. Please try again.'}
        </p>
        <button
          onClick={handleRefresh}
          className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const bookingsList = bookings || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
            Bookings
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-primary-lighter text-primary-light text-[10px] font-bold border border-primary-light/10 shadow-sm shrink-0">
            {bookingsList.length} Total
          </span>
        </div>
        
        <Link
          href="/dashboard/bookings/new"
          className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Booking
        </Link>
      </div>

      {/* KPI Cards Row */}
      <BookingStatsCards bookings={bookingsList} />

      {/* Filters & Parameter controls bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-600">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
          {/* Custom Search field */}
          <div className="relative w-full sm:w-60 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking, customer, event..."
              className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-250 rounded-lg hover:border-slate-350 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-2 bg-white border border-slate-250 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-auto shadow-sm"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Ranges selectors */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 px-2 bg-white border border-slate-250 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto shadow-sm"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 px-2 bg-white border border-slate-250 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto shadow-sm"
            />
          </div>
          {(fromDate || toDate || status !== 'all' || search) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setStatus('all');
                setSearch('');
              }}
              className="text-primary hover:text-primary-light transition-colors shrink-0 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table view */}
      {bookingsList.length > 0 ? (
        <BookingTable bookings={bookingsList} />
      ) : (
        <div className="border border-slate-200 bg-white rounded-xl py-16 px-6 text-center space-y-3.5 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800">No bookings yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Create your first marriage event reservation record to initialize the calendars and analytics dashboards.
            </p>
          </div>
          <Link
            href="/dashboard/bookings/new"
            className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </div>
      )}
    </div>
  );
}
