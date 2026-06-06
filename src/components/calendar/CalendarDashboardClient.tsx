'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

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
  });

  // 3. Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createDefaultValues, setCreateDefaultValues] = useState<Partial<CalendarEventFormValues> | null>(null);

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

  // Map merged events to FullCalendar event format
  const fcEvents = mergedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    backgroundColor: e.color,
    borderColor: e.color,
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
  }));

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

    </div>
  );
}
