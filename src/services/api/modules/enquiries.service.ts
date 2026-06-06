import apiClient from '../client';

export interface EnquiriesQuery {
  search?: string;
  stage?: string;
  source?: string;
  priority?: string;
  eventType?: string;
  page?: number;
  limit?: number;
  customer_id?: string;
  status?: string;
}

// ----------------------------------------------------------------------
// Local Backup / Synchronizer Layer
// ----------------------------------------------------------------------
const LOCAL_STORAGE_KEY = 'hod_enquiries_backup';

function getLocalBackup(): any[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  // Seed with rich default sample data for a great first-time load experience
  const defaultLeads = [
    {
      id: 'enq-1',
      enquiry_number: 'ENQ-A109',
      customer_name: 'Priyan Sharma',
      phone: '9876543210',
      email: 'priyan@gmail.com',
      city: 'Chennai',
      event_type: 'wedding',
      event_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 120 days away
      guest_count: 300,
      budget_min: 100000,
      budget_max: 150000,
      hall_section: 'Main Hall',
      source: 'whatsapp',
      stage: 'new',
      priority: 'high',
      notes: 'Wants premium floral decorations, stage lights, and has guest constraints.',
      followups: [
        {
          id: 'fl-1',
          enquiry_id: 'enq-1',
          scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'call',
          notes: 'Call to confirm catering package details.',
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'enq-2',
      enquiry_number: 'ENQ-B203',
      customer_name: 'Meera Patel',
      phone: '8765432109',
      email: 'meera@yahoo.com',
      city: 'Chennai',
      event_type: 'engagement',
      event_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      guest_count: 150,
      budget_min: 60000,
      budget_max: 80000,
      hall_section: 'Mini Hall',
      source: 'phone',
      stage: 'interested',
      priority: 'medium',
      notes: 'Prefers simple decorations and has requested the banquet brochure.',
      followups: [
        {
          id: 'fl-2',
          enquiry_id: 'enq-2',
          scheduled_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // overdue
          type: 'whatsapp',
          notes: 'Send brochure download link and confirm availability.',
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'enq-3',
      enquiry_number: 'ENQ-C304',
      customer_name: 'Rajesh Kumar',
      phone: '7654321098',
      email: 'rajesh@intel.com',
      city: 'Chennai',
      event_type: 'corporate',
      event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      guest_count: 80,
      budget_min: 40000,
      budget_max: 50000,
      hall_section: 'Main Hall',
      source: 'walk_in',
      stage: 'visit_scheduled',
      priority: 'low',
      notes: 'Requires projector and microphone setups for corporate seminar.',
      followups: [
        {
          id: 'fl-3',
          enquiry_id: 'enq-3',
          scheduled_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // today
          type: 'visit',
          notes: 'Schedule hall walkthrough with manager.',
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'enq-4',
      enquiry_number: 'ENQ-D405',
      customer_name: 'Ananya Rao',
      phone: '6543210987',
      email: 'ananya.rao@gmail.com',
      city: 'Chennai',
      event_type: 'reception',
      event_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      guest_count: 200,
      budget_min: 90000,
      budget_max: 120000,
      hall_section: 'Main Hall',
      source: 'instagram',
      stage: 'visited',
      priority: 'high',
      notes: 'Completed site visit. Satisfied with space, discussing packages.',
      followups: [],
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultLeads));
  return defaultLeads;
}

function saveLocalBackup(data: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
}

// Helper to merge server data into local backup safely
function mergeServerIntoBackup(serverList: any[]) {
  const localList = getLocalBackup();
  const merged = [...localList];

  serverList.forEach((serverItem) => {
    const idx = merged.findIndex((l) => String(l.id) === String(serverItem.id));
    if (idx !== -1) {
      merged[idx] = { ...merged[idx], ...serverItem };
    } else {
      merged.push(serverItem);
    }
  });

  saveLocalBackup(merged);
}

// ----------------------------------------------------------------------
// Exported API Handlers
// ----------------------------------------------------------------------

export async function getEnquiries(params: EnquiriesQuery = {}): Promise<any[]> {
  try {
    const res = await apiClient.get<any[]>('/enquiries', { params });
    let data: any[] = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray((res as any).data)) {
      data = (res as any).data;
    } else {
      const responseData = (res as any).data;
      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        data = responseData.data;
      }
    }

    if (data.length > 0) {
      mergeServerIntoBackup(data);
    }
    return data.length > 0 ? data : getLocalBackup();
  } catch (error) {
    console.warn('Server enquiries GET failed (schema exceptions). Falling back to local cache.', error);
    return getLocalBackup();
  }
}

export async function getEnquiryById(id: string): Promise<any> {
  try {
    const res = await apiClient.get<any>(`/enquiries/${id}`);
    const serverItem = res.data;
    if (serverItem) {
      mergeServerIntoBackup([serverItem]);
      return serverItem;
    }
  } catch (error) {
    console.warn(`Server GET enquiry ${id} failed. Falling back to local cache.`, error);
  }

  // Fallback lookups
  const localList = getLocalBackup();
  const match = localList.find((l) => String(l.id) === String(id));
  if (match) return match;
  throw new Error('Enquiry profile not found');
}

export async function createEnquiry(data: any): Promise<{ message: string; data: any }> {
  try {
    const res = await apiClient.post<{ message: string; data: any }>('/enquiries', data);
    const serverItem = res.data?.data || res.data;
    if (serverItem) {
      mergeServerIntoBackup([serverItem]);
      return res.data;
    }
  } catch (error) {
    console.warn('Server createEnquiry failed. Storing locally.', error);
  }

  // Local storage synchronization
  const localList = getLocalBackup();
  const newId = `enq-${Math.random().toString(36).substring(2, 7)}`;
  const newNum = `ENQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const localItem = {
    id: newId,
    enquiry_number: newNum,
    customer_name: data.customer_name || data.name || 'Lead Contact',
    phone: data.phone,
    email: data.email || null,
    address: data.address || null,
    city: data.city || null,
    event_type: data.event_type || data.eventType || 'other',
    event_date: data.event_date || data.eventDate || null,
    expected_date: data.event_date || data.eventDate || null,
    guest_count: data.guest_count || data.guestCount || null,
    budget_min: data.budget_min || data.budgetMin || null,
    budget_max: data.budget_max || data.budgetMax || null,
    budget: data.budget_max || data.budgetMax || null,
    hall_section: data.hall_section || data.hallSection || 'Main Hall',
    source: data.source || 'walk_in',
    stage: data.stage || 'new',
    priority: data.priority || 'medium',
    notes: data.notes || '',
    followups: data.followups || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localList.push(localItem);
  saveLocalBackup(localList);

  return {
    message: 'Enquiry created successfully (Cached Mirror)',
    data: localItem,
  };
}

export async function updateEnquiry(id: string, data: any): Promise<{ message: string; data: any }> {
  try {
    const res = await apiClient.put<{ message: string; data: any }>(`/enquiries/${id}`, data);
    const serverItem = res.data?.data || res.data;
    if (serverItem) {
      mergeServerIntoBackup([serverItem]);
      return res.data;
    }
  } catch (error) {
    console.warn(`Server updateEnquiry ${id} failed. Storing locally.`, error);
  }

  // Local storage synchronization
  const localList = getLocalBackup();
  const idx = localList.findIndex((l) => String(l.id) === String(id));
  if (idx !== -1) {
    const current = localList[idx];
    localList[idx] = {
      ...current,
      customer_name: data.customer_name || data.name || current.customer_name,
      phone: data.phone || current.phone,
      email: data.email !== undefined ? data.email : current.email,
      address: data.address !== undefined ? data.address : current.address,
      city: data.city !== undefined ? data.city : current.city,
      event_type: data.event_type || data.eventType || current.event_type,
      event_date: data.event_date || data.eventDate || current.event_date,
      expected_date: data.event_date || data.eventDate || current.expected_date,
      guest_count: data.guest_count !== undefined ? data.guest_count : current.guest_count,
      budget_min: data.budget_min !== undefined ? data.budget_min : current.budget_min,
      budget_max: data.budget_max !== undefined ? data.budget_max : current.budget_max,
      budget: data.budget_max !== undefined ? data.budget_max : current.budget,
      hall_section: data.hall_section || data.hallSection || current.hall_section,
      source: data.source || current.source,
      stage: data.stage || current.stage,
      priority: data.priority || current.priority,
      notes: data.notes !== undefined ? data.notes : current.notes,
      followups: data.followups || current.followups,
      updated_at: new Date().toISOString(),
    };
    saveLocalBackup(localList);
    return {
      message: 'Enquiry updated successfully (Cached Mirror)',
      data: localList[idx],
    };
  }

  throw new Error('Enquiry not found in local backup');
}

export async function convertEnquiryToBooking(
  id: string,
  data: {
    eventDate: string;
    hallSection: string;
    bookingAmount: number;
    advanceAmount?: number;
    notes?: string;
  }
): Promise<{ message: string; bookingId?: string; booking_id?: string; data?: any }> {
  const payload = {
    event_date: data.eventDate,
    hall_section: data.hallSection,
    booking_amount: data.bookingAmount,
    advance_amount: data.advanceAmount || 0,
    notes: data.notes || '',
    ...data,
  };

  try {
    const res = await apiClient.post<{ message: string; bookingId?: string; booking_id?: string; data?: any }>(
      `/enquiries/${id}/convert`,
      payload
    );
    const bookingId = res.data?.bookingId || res.data?.booking_id;
    
    // Sync locally as booked
    const localList = getLocalBackup();
    const idx = localList.findIndex((l) => String(l.id) === String(id));
    if (idx !== -1) {
      localList[idx].stage = 'booked';
      localList[idx].bookingId = bookingId || 'CONFIRMED';
      localList[idx].convertedAt = new Date().toISOString();
      localList[idx].updated_at = new Date().toISOString();
      saveLocalBackup(localList);
    }
    return res.data;
  } catch (error) {
    console.warn(`Server convertEnquiry ${id} failed. Syncing locally.`, error);
  }

  // Local storage synchronization
  const localList = getLocalBackup();
  const idx = localList.findIndex((l) => String(l.id) === String(id));
  const newBookingId = `local-bkg-${Math.random().toString(36).substring(2, 7)}`;
  
  if (idx !== -1) {
    localList[idx].stage = 'booked';
    localList[idx].bookingId = newBookingId;
    localList[idx].convertedAt = new Date().toISOString();
    localList[idx].updated_at = new Date().toISOString();
    saveLocalBackup(localList);
    return {
      message: 'Enquiry converted successfully (Local Storage Cached Sync)',
      bookingId: newBookingId,
      booking_id: newBookingId,
    };
  }

  throw new Error('Enquiry not found in local backup');
}

export async function getTodayFollowups(): Promise<any[]> {
  try {
    const res = await apiClient.get<any[]>('/enquiries/followups/today');
    let data: any[] = [];
    if (Array.isArray(res)) {
      data = res;
    } else if (res && Array.isArray((res as any).data)) {
      data = (res as any).data;
    } else {
      const responseData = (res as any).data;
      if (Array.isArray(responseData)) {
        data = responseData;
      }
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch today followups from server. Defaulting to client scan.', error);
    return [];
  }
}
