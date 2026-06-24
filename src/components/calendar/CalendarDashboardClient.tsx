'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CalendarHeader } from './CalendarHeader';
import { MiniCalendarSidebar } from './MiniCalendarSidebar';
import { CalendarLegend } from './CalendarLegend';
import { CalendarEventDrawer } from './CalendarEventDrawer';
import { EventDetailContent } from './EventDetailContent';
import { EventFormContent } from './EventFormContent';

import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useBookingsForCalendar,
} from '@/hooks/useCalendar';
import { useUpdateBooking, useDeleteBooking } from '@/hooks/useBookings';
import { formatDateTime } from '@/utils/formatters';

import { CalendarEvent, CalendarView, CalendarFilters } from '@/types/calendar';
import { CalendarEventFormValues } from '@/schemas/calendar.schema';
import { useQueryClient } from '@tanstack/react-query';

export function CalendarDashboardClient() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  // 1. Calendar View & Focus States
  const [activeView, setActiveView] = useState<CalendarView>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarTitle, setCalendarTitle] = useState('');

  // 2. Filters State
  const [filters, setFilters] = useState<CalendarFilters>({
    eventTypes: [],
    status: [],
    hallSection: 'All Sections',
    search: '',
    colorBy: 'category',
  });

  // 3. Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDefaultValues, setCreateDefaultValues] = useState<Partial<CalendarEventFormValues> | null>(null);
  const [showConflictsModal, setShowConflictsModal] = useState(false);

  // 4. API Queries & Mutations
  // Fetch custom calendar events
  const { data: customEvents = [], isLoading: eventsLoading } = useCalendarEvents(
    {}, // Fetch full range caching handled by fullcalendar
    filters
  );

  // Fetch reservations to sync client-side
  const { data: syncedBookings = [], isLoading: bookingsLoading } = useBookingsForCalendar();

  // Mutations
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();

  // 5. Merge & Filter Datasets
  const filteredBookings = syncedBookings.filter((b) => {
    // Check event category filter
    if (filters.eventTypes.length > 0 && !filters.eventTypes.includes('booking')) {
      return false;
    }
    // Check status filter
    if (filters.status.length > 0 && !filters.status.includes(b.status)) {
      return false;
    }
    // Check section filter
    if (filters.hallSection && filters.hallSection !== 'All Sections') {
      if (b.hallSection?.toLowerCase().trim() !== filters.hallSection.toLowerCase().trim()) {
        return false;
      }
    }
    return true;
  });

  const mergedEvents = [...customEvents, ...filteredBookings];

  // Client-side text search filter
  const searchedEvents = mergedEvents.filter((e) => {
    if (!filters.search || filters.search.trim() === '') return true;
    const q = filters.search.toLowerCase().trim();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.customerName && e.customerName.toLowerCase().includes(q)) ||
      (e.customerPhone && e.customerPhone.toLowerCase().includes(q)) ||
      (e.eventType && e.eventType.toLowerCase().includes(q)) ||
      (e.hallSection && e.hallSection.toLowerCase().includes(q))
    );
  });

  // Overlap date calculation helper
  const isDatesOverlapping = (aStart?: string, aEnd?: string, bStart?: string, bEnd?: string) => {
    if (!aStart || !bStart) return false;
    const aS = new Date(aStart.split('T')[0]).getTime();
    const aE = new Date((aEnd || aStart).split('T')[0]).getTime();
    const bS = new Date(bStart.split('T')[0]).getTime();
    const bE = new Date((bEnd || bStart).split('T')[0]).getTime();
    return aS <= bE && bS <= aE;
  };

  // Conflict calculation list
  const conflicts = React.useMemo(() => {
    const list: { eventA: CalendarEvent; eventB: CalendarEvent; section: string; date: string }[] = [];
    const active = mergedEvents.filter((e) => e.status !== 'cancelled');

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const eA = active[i];
        const eB = active[j];

        const secA = (eA.hallSection || 'Main Hall').toLowerCase().trim();
        const secB = (eB.hallSection || 'Main Hall').toLowerCase().trim();

        if (secA === secB) {
          if (isDatesOverlapping(eA.start, eA.end, eB.start, eB.end)) {
            const dateSpan = eA.start.split('T')[0] === (eA.end || eA.start).split('T')[0]
              ? eA.start.split('T')[0]
              : `${eA.start.split('T')[0]} to ${(eA.end || eA.start).split('T')[0]}`;

            list.push({
              eventA: eA,
              eventB: eB,
              section: eA.hallSection || 'Main Hall',
              date: dateSpan,
            });
          }
        }
      }
    }
    return list;
  }, [mergedEvents]);

  // Map merged events to FullCalendar event format (with optional colorBy hall section)
  const fcEvents = searchedEvents.map((e) => {
    let color = e.color;
    if (filters.colorBy === 'section') {
      const sec = (e.hallSection || 'Main Hall').toLowerCase().trim();
      if (sec.includes('main')) {
        color = '#6025BC'; // violet
      } else if (sec.includes('garden') || sec.includes('lawn')) {
        color = '#10B981'; // emerald
      } else if (sec.includes('terrace')) {
        color = '#EAB308'; // amber/yellow
      } else {
        color = '#3B82F6'; // blue
      }
    }

    return {
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      backgroundColor: color,
      borderColor: color,
      textColor: '#FFFFFF',
      extendedProps: {
        type: e.type,
        bookingId: e.bookingId,
        customerId: e.customerId,
        customerName: e.customerName,
        customerPhone: e.customerPhone,
        customerEmail: e.customerEmail,
        hallName: e.hallName,
        hallSection: e.hallSection,
        guestCount: e.guestCount,
        bookingAmount: e.bookingAmount,
        advanceAmount: e.advanceAmount,
        pendingAmount: e.pendingAmount,
        discountAmount: e.discountAmount,
        status: e.status,
        paymentStatus: e.paymentStatus,
        notes: e.notes,
      },
    };
  });

  // 6. Navigation and View Switch Helpers
  const handleNavigate = (action: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi();
    if (api) {
      if (action === 'prev') api.prev();
      else if (action === 'next') api.next();
      else api.today();
      setCurrentDate(api.getDate());
      setCalendarTitle(api.view.title);
    }
  };

  const handleViewChange = (view: CalendarView) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      setActiveView(view);
      setCalendarTitle(api.view.title);
    }
  };

  const handleDateSelectFromSidebar = (date: Date) => {
    setCurrentDate(date);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
      setCalendarTitle(api.view.title);
    }
  };

  // 7. Interactive Click Handlers
  const handleDateSelect = (selectInfo: any) => {
    const start = selectInfo.startStr;
    const end = selectInfo.endStr;
    const allDay = selectInfo.allDay;

    setCreateDefaultValues({
      start,
      end,
      allDay,
      type: 'personal',
      hallSection: filters.hallSection !== 'All Sections' ? filters.hallSection : 'Main Hall',
    });
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const clickedEvent = mergedEvents.find((e) => e.id === eventId);
    if (clickedEvent) {
      setSelectedEvent(clickedEvent);
      setDrawerMode('view');
      setDrawerOpen(true);
    }
  };

  // Drag and drop or Resize event rescheduling
  const handleEventChange = async (changeInfo: any) => {
    const eventId = changeInfo.event.id;
    const isBookingEvent = eventId.startsWith('booking-');

    if (isBookingEvent) {
      const bookingDbId = eventId.replace('booking-', '');
      const existingBooking = syncedBookings.find((b) => b.bookingId === bookingDbId);

      if (existingBooking) {
        // Strip timezone suffix from ISO strings for date inputs
        const newStartDate = changeInfo.event.startStr.split('T')[0];
        const newEndDate = (changeInfo.event.endStr || changeInfo.event.startStr).split('T')[0];

        const updatedBookingValues = {
          customerId: existingBooking.customerId || '',
          eventType: existingBooking.eventType || 'Wedding Reception',
          eventDate: newStartDate,
          eventEndDate: newEndDate,
          hallSection: existingBooking.hallSection || 'Main Hall',
          guestCount: existingBooking.guestCount || 100,
          bookingAmount: existingBooking.bookingAmount || 0,
          advanceAmount: existingBooking.advanceAmount || 0,
          discountAmount: existingBooking.discountAmount || 0,
          status: existingBooking.status,
          notes: existingBooking.notes || '',
        };

        updateBookingMutation.mutate(
          { id: bookingDbId, data: updatedBookingValues },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
            },
            onError: () => {
              changeInfo.revert();
            },
          }
        );
      } else {
        changeInfo.revert();
      }
    } else {
      const start = changeInfo.event.startStr;
      const end = changeInfo.event.endStr || start;
      const allDay = changeInfo.event.allDay;

      updateEventMutation.mutate(
        {
          id: eventId,
          data: {
            title: changeInfo.event.title,
            start,
            end,
            allDay,
            type: changeInfo.event.extendedProps.type || 'personal',
            hallSection: changeInfo.event.extendedProps.hallSection || 'Main Hall',
            notes: changeInfo.event.extendedProps.notes || '',
            status: changeInfo.event.extendedProps.status || 'confirmed',
          },
        },
        {
          onError: () => {
            changeInfo.revert();
          },
        }
      );
    }
  };

  // iCal / ICS format Export Sync
  const handleExportICS = () => {
    if (searchedEvents.length === 0) {
      alert('No events to export matching the current search criteria.');
      return;
    }

    const formatICSDate = (dateStr: string, allDay: boolean, isEnd: boolean = false) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      if (allDay) {
        if (isEnd) {
          date.setDate(date.getDate() + 1);
        }
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `;VALUE=DATE:${yyyy}${mm}${dd}`;
      } else {
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const min = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');
        return `:${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
      }
    };

    const escapeICSValue = (str: string = '') => {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HallFlow//NONSGML Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    searchedEvents.forEach((e) => {
      const startICS = formatICSDate(e.start, e.allDay, false);
      const endICS = formatICSDate(e.end || e.start, e.allDay, true);
      
      if (!startICS || !endICS) return;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${e.id}@hallflow`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART${startICS}`);
      icsContent.push(`DTEND${endICS}`);
      icsContent.push(`SUMMARY:${escapeICSValue(e.title)}`);
      
      let descriptionParts = [];
      if (e.type) descriptionParts.push(`Category: ${e.type}`);
      if (e.status) descriptionParts.push(`Status: ${e.status}`);
      if (e.customerName) descriptionParts.push(`Client: ${e.customerName} (${e.customerPhone || 'N/A'})`);
      if (e.guestCount) descriptionParts.push(`Guests: ${e.guestCount}`);
      if (e.notes) descriptionParts.push(`Notes: ${e.notes}`);
      
      if (descriptionParts.length > 0) {
        icsContent.push(`DESCRIPTION:${escapeICSValue(descriptionParts.join(' | '))}`);
      }
      
      if (e.hallSection) {
        icsContent.push(`LOCATION:${escapeICSValue(e.hallSection)}`);
      }
      
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const fileContent = icsContent.join('\r\n');
    const blob = new Blob([fileContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `calendar_export_${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 8. CRUD Actions Inside Drawer
  const handleCreateSubmit = async (data: CalendarEventFormValues) => {
    createEventMutation.mutate(data, {
      onSuccess: () => {
        setDrawerOpen(false);
      },
    });
  };

  const handleEditSubmit = async (data: CalendarEventFormValues) => {
    if (!selectedEvent) return;

    const isBooking = selectedEvent.type === 'booking';

    if (isBooking) {
      const bookingDbId = selectedEvent.bookingId!;
      const existingBooking = syncedBookings.find((b) => b.bookingId === bookingDbId);

      if (existingBooking) {
        const updatedBookingValues = {
          customerId: existingBooking.customerId || '',
          eventType: existingBooking.eventType || 'Wedding Reception',
          eventDate: data.start.split('T')[0],
          eventEndDate: (data.end || data.start).split('T')[0],
          hallSection: data.hallSection || 'Main Hall',
          guestCount: data.guestCount || existingBooking.guestCount || 100,
          bookingAmount: existingBooking.bookingAmount || 0,
          advanceAmount: existingBooking.advanceAmount || 0,
          discountAmount: existingBooking.discountAmount || 0,
          status: data.status as any,
          notes: data.notes || '',
        };

        updateBookingMutation.mutate(
          { id: bookingDbId, data: updatedBookingValues },
          {
            onSuccess: () => {
              setDrawerOpen(false);
              setSelectedEvent(null);
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
            },
          }
        );
      }
    } else {
      updateEventMutation.mutate(
        { id: selectedEvent.id, data },
        {
          onSuccess: () => {
            setDrawerOpen(false);
            setSelectedEvent(null);
          },
        }
      );
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    const isBooking = selectedEvent.type === 'booking';

    if (isBooking) {
      if (
        confirm(
          'Are you sure you want to delete this booking reservation? This will delete all payment records and schedules.'
        )
      ) {
        deleteBookingMutation.mutate(selectedEvent.bookingId!, {
          onSuccess: () => {
            setDrawerOpen(false);
            setSelectedEvent(null);
          },
        });
      }
    } else {
      if (confirm('Are you sure you want to delete this calendar event?')) {
        deleteEventMutation.mutate(selectedEvent.id, {
          onSuccess: () => {
            setDrawerOpen(false);
            setSelectedEvent(null);
          },
        });
      }
    }
  };

  const getFormInitialValues = (): Partial<CalendarEventFormValues> => {
    if (drawerMode === 'create' && createDefaultValues) {
      return createDefaultValues;
    }
    if (drawerMode === 'edit' && selectedEvent) {
      return {
        title: selectedEvent.title,
        start: selectedEvent.start.substring(0, 16),
        end: selectedEvent.end ? selectedEvent.end.substring(0, 16) : selectedEvent.start.substring(0, 16),
        allDay: selectedEvent.allDay,
        type: selectedEvent.type,
        hallSection: selectedEvent.hallSection || 'Main Hall',
        guestCount: selectedEvent.guestCount,
        bookingId: selectedEvent.bookingId || '',
        notes: selectedEvent.notes || '',
        status: selectedEvent.status,
      };
    }
    return {};
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 items-stretch overflow-hidden select-none">
      
      {/* Collapsible Left navigation Sidebar */}
      <MiniCalendarSidebar
        selectedDate={currentDate}
        onDateSelect={handleDateSelectFromSidebar}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setDrawerMode('view');
          setDrawerOpen(true);
        }}
      />

      {/* Main Calendar Space */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* Custom Header Navigation Toolbar */}
        <CalendarHeader
          title={calendarTitle || 'Schedule Events'}
          activeView={activeView}
          onViewChange={handleViewChange}
          onNavigate={handleNavigate}
          onExportICS={handleExportICS}
          filters={filters}
          onFiltersChange={setFilters}
          onAddEvent={() => {
            setCreateDefaultValues({
              start: new Date().toISOString().substring(0, 16),
              end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().substring(0, 16),
              allDay: false,
              type: 'personal',
              hallSection: filters.hallSection !== 'All Sections' ? filters.hallSection : 'Main Hall',
            });
            setDrawerMode('create');
            setDrawerOpen(true);
          }}
        />

        {/* Conflicts Alert Banner */}
        {conflicts.length > 0 && (
          <div 
            onClick={() => setShowConflictsModal(true)}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-custom-sm font-sans"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm leading-none text-amber-800">
                  {conflicts.length} Booking Conflict{conflicts.length > 1 ? 's' : ''} Detected
                </h4>
                <p className="text-xs font-semibold text-amber-600 mt-1">
                  Some bookings share the exact same venue hall section on overlapping dates. Click to review details.
                </p>
              </div>
            </div>
            <button className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0">
              Review Conflicts
            </button>
          </div>
        )}

        {/* Calendar Grid Container Card */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-custom-md overflow-hidden flex flex-col gap-4 min-h-0">
          
          <CalendarLegend />

          {/* FullCalendar wrapper */}
          <div className="hod-calendar flex-1 overflow-hidden min-h-0">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={activeView}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              nowIndicator={true}
              height="100%"
              events={fcEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventChange}
              eventResize={handleEventChange}
              datesSet={(dateInfo) => {
                setCalendarTitle(dateInfo.view.title);
                setCurrentDate(dateInfo.view.calendar.getDate());
              }}
            />
          </div>
        </div>

      </div>

      {/* Slide-out Event details/form Drawer */}
      <CalendarEventDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEvent(null);
          setCreateDefaultValues(null);
        }}
        title={
          drawerMode === 'view'
            ? 'Event Details'
            : drawerMode === 'edit'
            ? 'Edit Event'
            : 'Add Schedule Event'
        }
      >
        {drawerMode === 'view' && selectedEvent ? (
          <EventDetailContent
            event={selectedEvent}
            onEdit={() => setDrawerMode('edit')}
            onDelete={handleDeleteEvent}
          />
        ) : (
          <EventFormContent
            initialValues={getFormInitialValues()}
            onSubmit={drawerMode === 'create' ? handleCreateSubmit : handleEditSubmit}
            loading={
              createEventMutation.isPending ||
              updateEventMutation.isPending ||
              updateBookingMutation.isPending
            }
            submitLabel={drawerMode === 'create' ? 'Create Event' : 'Save Changes'}
            onCancel={() => {
              if (drawerMode === 'edit') {
                setDrawerMode('view');
              } else {
                setDrawerOpen(false);
                setCreateDefaultValues(null);
              }
            }}
            excludeEventId={drawerMode === 'edit' ? selectedEvent?.id : undefined}
          />
        )}
      </CalendarEventDrawer>

      {/* Conflicts Details Modal */}
      <AnimatePresence>
        {showConflictsModal && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConflictsModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-premium border border-slate-200 z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2 text-amber-850">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <h3 className="text-sm font-bold uppercase tracking-wider leading-none">
                    Scheduling Conflicts Detected
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConflictsModal(false)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-xs font-semibold text-slate-500 font-sans">
                  The following events share the exact same venue hall section on overlapping dates/times. Please resolve these schedule collisions:
                </p>

                <div className="space-y-4">
                  {conflicts.map((c, idx) => (
                    <div 
                      key={idx} 
                      className="border border-slate-200 rounded-xl overflow-hidden shadow-custom-sm font-sans text-xs"
                    >
                      {/* Conflict Venue & Dates Info Header */}
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-slate-700 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          Section: {c.section}
                        </span>
                        <span className="text-slate-500">Date: {c.date}</span>
                      </div>

                      {/* Overlapping Events Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150">
                        {/* Event A */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">Event 1</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                              c.eventA.type === 'booking' ? 'bg-violet-100 text-violet-850' : 'bg-blue-100 text-blue-850'
                            }`}>
                              {c.eventA.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{c.eventA.title}</h4>
                          <div className="space-y-1 text-slate-500 font-semibold text-[11px]">
                            <p>Start: {formatDateTime(c.eventA.start)}</p>
                            <p>End: {formatDateTime(c.eventA.end)}</p>
                            {c.eventA.customerName && <p>Client: {c.eventA.customerName}</p>}
                            {c.eventA.notes && <p className="italic text-slate-400 truncate">Notes: {c.eventA.notes}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEvent(c.eventA);
                              setDrawerMode('view');
                              setDrawerOpen(true);
                              setShowConflictsModal(false);
                            }}
                            className="text-[11px] font-bold text-violet-650 hover:underline pt-1 flex items-center gap-1 cursor-pointer"
                          >
                            View Details &rarr;
                          </button>
                        </div>

                        {/* Event B */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400">Event 2</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                              c.eventB.type === 'booking' ? 'bg-violet-100 text-violet-850' : 'bg-blue-100 text-blue-850'
                            }`}>
                              {c.eventB.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{c.eventB.title}</h4>
                          <div className="space-y-1 text-slate-500 font-semibold text-[11px]">
                            <p>Start: {formatDateTime(c.eventB.start)}</p>
                            <p>End: {formatDateTime(c.eventB.end)}</p>
                            {c.eventB.customerName && <p>Client: {c.eventB.customerName}</p>}
                            {c.eventB.notes && <p className="italic text-slate-400 truncate">Notes: {c.eventB.notes}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEvent(c.eventB);
                              setDrawerMode('view');
                              setDrawerOpen(true);
                              setShowConflictsModal(false);
                            }}
                            className="text-[11px] font-bold text-violet-650 hover:underline pt-1 flex items-center gap-1 cursor-pointer"
                          >
                            View Details &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowConflictsModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors font-bold text-xs cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
