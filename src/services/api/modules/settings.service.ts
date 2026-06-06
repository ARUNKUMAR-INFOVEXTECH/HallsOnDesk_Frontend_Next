import apiClient from '../client';
import { HallProfile, HallSettings } from '@/types/settings';

const PROFILE_LOCAL_KEY = 'hod_settings_profile';
const SETTINGS_LOCAL_KEY = 'hod_settings_general';

const initialProfileFallback: HallProfile = {
  id: 'hall-default',
  hallName: 'Vasantha Mahal Mandapam',
  ownerName: 'Rajesh Nair',
  phone: '9840123456',
  alternatePhone: '9444123456',
  email: 'owner@vasanthamahal.com',
  website: 'https://vasanthamahal.com',
  address: '12, Grand Southern Trunk Road, Tambaram',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600045',
  country: 'India',
  description: 'An elegant venue for grand weddings, receptions, and corporate meetings, seating up to 1000 guests with complete catering facilities.',
  establishedYear: 2012,
  totalCapacity: 1200,
  logoUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=150&auto=format&fit=crop&q=60',
  coverImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=60',
  gstNumber: '33AAFCI8876F1Z8',
  panNumber: 'AAFCI8876F',
  bankName: 'HDFC Bank',
  accountNumber: '50100487920134',
  ifscCode: 'HDFC0000184',
  upiId: 'vasanthamahal@okhdfc',
  hallSections: [
    { id: 'sec-1', name: 'Main A/C Auditorium', capacity: 800, description: 'Seating space for marriage functions.', isActive: true },
    { id: 'sec-2', name: 'Dining Hall', capacity: 300, description: 'Ground floor dining area.', isActive: true },
    { id: 'sec-3', name: 'Mini Banquet Hall', capacity: 150, description: 'Ideal for birthday parties & corporate events.', isActive: true }
  ],
  createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialSettingsFallback: HallSettings = {
  id: 'settings-default',
  hallId: 'hall-default',
  invoicePrefix: 'VM-INV',
  bookingPrefix: 'VM-BK',
  receiptPrefix: 'VM-RCP',
  invoiceStartNumber: 101,
  bookingStartNumber: 201,
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  timezone: 'Asia/Kolkata',
  taxEnabled: true,
  gstRate: 18,
  gstNumber: '33AAFCI8876F1Z8',
  gstApplicableOn: 'all',
  autoInvoice: true,
  invoiceFooterNote: 'Thank you for choosing Vasantha Mahal. We hope to make your event memorable!',
  termsAndConditions: '1. Advance payment is non-refundable on cancellation within 30 days of event.\n2. Music and loudspeakers are strictly prohibited after 10:00 PM.\n3. Safe deposits are required for extra damage liability coverage.',
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: false,
    newBookingAlert: true,
    paymentReceivedAlert: true,
    enquiryAlert: true,
    followupReminder: true,
    bookingReminderDaysBefore: 2,
    dailySummaryEnabled: true,
    dailySummaryTime: '08:00',
  },
  bookingSettings: {
    requireAdvancePayment: true,
    minimumAdvancePercent: 25,
    allowDoubleBooking: false,
    bookingCancellationHours: 48,
    defaultBookingDurationHours: 12,
    workingHoursStart: '08:00',
    workingHoursEnd: '23:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  updatedAt: new Date().toISOString(),
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// 1. Fetch Hall Profile
export async function getHallProfile(): Promise<HallProfile> {
  try {
    const res = await apiClient.get<HallProfile>('/hall/profile');
    return res.data;
  } catch {
    return getLocal(PROFILE_LOCAL_KEY, initialProfileFallback);
  }
}

// 2. Update Hall Profile
export async function updateHallProfile(data: Partial<HallProfile>): Promise<{ message: string; data: HallProfile }> {
  try {
    const res = await apiClient.put<{ message: string; data: HallProfile }>('/hall/profile', data);
    return res.data;
  } catch {
    const current = getLocal(PROFILE_LOCAL_KEY, initialProfileFallback);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setLocal(PROFILE_LOCAL_KEY, updated);
    return { message: 'Hall profile updated successfully', data: updated };
  }
}

// 3. Fetch Hall Settings
export async function getHallSettings(): Promise<HallSettings> {
  try {
    const res = await apiClient.get<HallSettings>('/hall/settings');
    return res.data;
  } catch {
    return getLocal(SETTINGS_LOCAL_KEY, initialSettingsFallback);
  }
}

// 4. Update Hall Settings
export async function updateHallSettings(data: Partial<HallSettings>): Promise<{ message: string; data: HallSettings }> {
  try {
    const res = await apiClient.put<{ message: string; data: HallSettings }>('/hall/settings', data);
    return res.data;
  } catch {
    const current = getLocal(SETTINGS_LOCAL_KEY, initialSettingsFallback);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setLocal(SETTINGS_LOCAL_KEY, updated);
    return { message: 'Settings saved successfully', data: updated };
  }
}

// 5. Upload Logo
export async function uploadLogo(file: File): Promise<{ message: string; logo_url: string }> {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await apiClient.post<{ message: string; logo_url: string }>('/hall/profile/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// 6. Upload Cover Image
export async function uploadCoverImage(file: File): Promise<{ message: string; cover_image_url: string }> {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await apiClient.post<{ message: string; cover_image_url: string }>('/hall/profile/cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}
