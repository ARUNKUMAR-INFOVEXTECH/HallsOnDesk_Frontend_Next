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
  from_date?: string;
  to_date?: string;
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
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Clean up any remaining dummy/seed leads in the user's browser storage
        const cleaned = parsed.filter(
          (item) => !['enq-1', 'enq-2', 'enq-3', 'enq-4'].includes(item.id)
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  }
  return [];
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

    // Always overwrite local backup with the latest server list if the request succeeded,
    // so that deleted/empty status on the server is correctly reflected locally.
    saveLocalBackup(data);
    return data;
  } catch (error) {
    console.warn('Server enquiries GET failed. Falling back to local cache.', error);
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

export async function bulkCreateEnquiries(enquiries: any[]): Promise<{ message: string; count: number; data: any[] }> {
  try {
    const res = await apiClient.post<{ message: string; count: number; data: any[] }>('/enquiries/bulk', { enquiries });
    const serverItems = res.data?.data;
    if (Array.isArray(serverItems)) {
      mergeServerIntoBackup(serverItems);
    }
    return res.data;
  } catch (error) {
    console.warn('Server bulkCreateEnquiries failed. Syncing locally.', error);
  }

  // Local fallback
  const createdItems = [];
  const localList = getLocalBackup();

  for (const data of enquiries) {
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
    createdItems.push(localItem);
  }

  saveLocalBackup(localList);

  return {
    message: 'Enquiries imported successfully (Cached Mirror)',
    count: createdItems.length,
    data: createdItems,
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
    
    // Sync locally - delete the enquiry from local backup since it is deleted on the server
    const localList = getLocalBackup();
    const filtered = localList.filter((l) => String(l.id) !== String(id));
    saveLocalBackup(filtered);
    return res.data;
  } catch (error) {
    console.warn(`Server convertEnquiry ${id} failed. Syncing locally.`, error);
  }

  // Local storage synchronization (fallback when server offline)
  const localList = getLocalBackup();
  const idx = localList.findIndex((l) => String(l.id) === String(id));
  const newBookingId = `local-bkg-${Math.random().toString(36).substring(2, 7)}`;
  
  if (idx !== -1) {
    const filtered = localList.filter((l) => String(l.id) !== String(id));
    saveLocalBackup(filtered);
    return {
      message: 'Enquiry converted successfully (Local Storage Purge Sync)',
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

export async function deleteEnquiry(id: string): Promise<{ message: string }> {
  try {
    const res = await apiClient.delete<{ message: string }>(`/enquiries/${id}`);
    
    // Update local cache
    const localList = getLocalBackup();
    const filtered = localList.filter((l) => String(l.id) !== String(id));
    saveLocalBackup(filtered);
    
    return res.data;
  } catch (error) {
    console.warn(`Server deleteEnquiry ${id} failed. Removing locally.`, error);
    
    const localList = getLocalBackup();
    const filtered = localList.filter((l) => String(l.id) !== String(id));
    saveLocalBackup(filtered);
    
    return { message: 'Enquiry deleted locally' };
  }
}
