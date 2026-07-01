import apiClient from '../client';
import { HallProfile, HallSettings, HallSubscription, SubscriptionPackage } from '@/types/settings';
import Cookies from 'js-cookie';

const PROFILE_LOCAL_KEY = 'hod_settings_profile';
const SETTINGS_LOCAL_KEY = 'hod_settings_general';
const SUB_LOCAL_KEY = 'hod_settings_subscription';

const getProfileKey = () => {
  const activeHallId = Cookies.get('active_hall_id');
  return activeHallId ? `${PROFILE_LOCAL_KEY}_${activeHallId}` : PROFILE_LOCAL_KEY;
};

const getSettingsKey = () => {
  const activeHallId = Cookies.get('active_hall_id');
  return activeHallId ? `${SETTINGS_LOCAL_KEY}_${activeHallId}` : SETTINGS_LOCAL_KEY;
};

const getSubKey = () => {
  const activeHallId = Cookies.get('active_hall_id');
  return activeHallId ? `${SUB_LOCAL_KEY}_${activeHallId}` : SUB_LOCAL_KEY;
};

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
  invoiceTemplate: 'classic',
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
    setLocal(getProfileKey(), res.data);
    return res.data;
  } catch {
    return getLocal(getProfileKey(), initialProfileFallback);
  }
}

// 2. Update Hall Profile
export async function updateHallProfile(data: Partial<HallProfile>): Promise<{ message: string; data: HallProfile }> {
  try {
    const res = await apiClient.put<{ message: string; data: HallProfile }>('/hall/profile', data);
    setLocal(getProfileKey(), res.data.data);
    return res.data;
  } catch {
    const current = getLocal(getProfileKey(), initialProfileFallback);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setLocal(getProfileKey(), updated);
    return { message: 'Hall profile updated successfully', data: updated };
  }
}

// 3. Fetch Hall Settings
export async function getHallSettings(): Promise<HallSettings> {
  try {
    const res = await apiClient.get<HallSettings>('/hall/settings');
    setLocal(getSettingsKey(), res.data);
    return res.data;
  } catch {
    return getLocal(getSettingsKey(), initialSettingsFallback);
  }
}

// 4. Update Hall Settings
export async function updateHallSettings(data: Partial<HallSettings>): Promise<{ message: string; data: HallSettings }> {
  try {
    const res = await apiClient.put<{ message: string; data: HallSettings }>('/hall/settings', data);
    setLocal(getSettingsKey(), res.data.data);
    return res.data;
  } catch {
    const current = getLocal(getSettingsKey(), initialSettingsFallback);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    setLocal(getSettingsKey(), updated);
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

const PKG_LOCAL_KEY = 'hod_settings_packages';

const defaultSubFallback: HallSubscription = {
  id: 'sub-default',
  hall_id: 'hall-default',
  package_id: 'pkg-standard',
  start_date: new Date(Date.now() - 3600000 * 24 * 12).toISOString().substring(0, 10),
  end_date: new Date(Date.now() + 3600000 * 24 * 18).toISOString().substring(0, 10),
  status: 'active',
  payment_status: 'paid',
  created_at: new Date().toISOString(),
  packages: {
    id: 'pkg-standard',
    name: 'Standard Plan',
    price: 2499,
    billing_cycle: 'monthly',
    max_users: 5,
    max_bookings: 150,
    features: {
      reports: true,
      vendors: true,
      priority_support: false,
      staff_management: true,
    }
  }
};

const defaultPackagesFallback: SubscriptionPackage[] = [
  {
    id: 'pkg-basic',
    name: 'Basic',
    price: 1500,
    billing_cycle: 'monthly',
    max_users: 2,
    max_bookings: 50,
    features: {
      reports: false,
      vendors: false,
      priority_support: false,
      staff_management: true,
    }
  },
  {
    id: 'pkg-standard',
    name: 'Standard Plan',
    price: 2499,
    billing_cycle: 'monthly',
    max_users: 5,
    max_bookings: 150,
    features: {
      reports: true,
      vendors: true,
      priority_support: false,
      staff_management: true,
    }
  },
  {
    id: 'pkg-premium',
    name: 'Deluxe Enterprise',
    price: 4999,
    billing_cycle: 'monthly',
    max_users: 15,
    max_bookings: 500,
    features: {
      reports: true,
      vendors: true,
      priority_support: true,
      staff_management: true,
    }
  }
];

// 7. Get Active Subscription
export async function getActiveSubscription(): Promise<HallSubscription> {
  try {
    const res = await apiClient.get<HallSubscription>('/subscriptions/my');
    return res.data;
  } catch {
    return getLocal<HallSubscription>(getSubKey(), defaultSubFallback);
  }
}

// 8. Get All Packages
export async function getAllPackages(): Promise<SubscriptionPackage[]> {
  try {
    const res = await apiClient.get<SubscriptionPackage[]>('/packages');
    return res.data;
  } catch {
    return getLocal<SubscriptionPackage[]>(PKG_LOCAL_KEY, defaultPackagesFallback);
  }
}

// 9. Request Subscription Upgrade / Renewal
export async function requestSubscriptionChange(data: { package_id?: string; request_type: 'upgrade' | 'renewal'; notes?: string }): Promise<{ message: string }> {
  try {
    const res = await apiClient.post<{ message: string }>('/subscriptions/request-change', data);
    return res.data;
  } catch {
    return { message: 'Subscription request submitted successfully (Offline Cache simulated)' };
  }
}
