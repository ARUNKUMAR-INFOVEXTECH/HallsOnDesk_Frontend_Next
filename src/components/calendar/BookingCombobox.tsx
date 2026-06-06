'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, Calendar } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { Booking as FrontendBooking } from '@/types/booking';

interface BookingComboboxProps {
  selectedBookingId: string;
  onSelect: (booking: FrontendBooking | null) => void;
  error?: string;
  disabled?: boolean;
}

export function BookingCombobox({
  selectedBookingId,
  onSelect,
  error,
  disabled = false,
}: BookingComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch bookings from API
  const { data: bookingsList = [], isLoading } = useBookings({
    search: debouncedSearch,
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the currently selected booking
  const selectedBooking = bookingsList.find((b) => b.id === selectedBookingId) || null;

  return (
    <div className="space-y-1.5 w-full text-xs font-semibold text-slate-700" ref={dropdownRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
        Select Booking Reference
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-3 flex items-center justify-between text-sm bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-red-500' : 'border-slate-200 hover:border-slate-350 shadow-sm'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
        >
          {selectedBooking ? (
            <span className="text-slate-800 font-semibold">
              {selectedBooking.bookingNumber} - {selectedBooking.customerName} ({selectedBooking.eventType})
            </span>
          ) : (
            <span className="text-slate-450 font-medium">Search or select booking...</span>
          )}
          <ChevronDown className="h-4.5 w-4.5 text-slate-405 shrink-0 ml-2" />
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-premium z-20 overflow-hidden animate-fadeIn">
            {/* Search Input bar */}
            <div className="relative p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search booking #, customer name, type..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>

            {/* List entries */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 text-xs">
              {isLoading ? (
                <div className="p-4 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-light" />
                  Loading bookings...
                </div>
              ) : bookingsList.length > 0 ? (
                bookingsList.map((booking) => {
                  const isSelected = booking.id === selectedBookingId;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => {
                        onSelect(booking);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between text-left p-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center font-bold text-xs shrink-0 border border-primary-light/10">
                          <Calendar className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {booking.bookingNumber} - {booking.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {booking.eventType} • {booking.hallSection} • {booking.eventDate}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary-light shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 font-semibold">No bookings found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}
