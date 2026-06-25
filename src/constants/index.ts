export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hallsondesk-backend.onrender.com';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Tenancy contexts to scale to other OnDesk apps in the future
export const PRODUCT_CONTEXTS = {
  HALLS: 'halls',
  SCHOOLS: 'schools',
  ROOMS: 'rooms',
  LEADS: 'leads',
} as const;

export type ProductContext = typeof PRODUCT_CONTEXTS[keyof typeof PRODUCT_CONTEXTS];

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export const DASHBOARD_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: 'CalendarDays',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: 'Calendar',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: 'Users',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: 'DollarSign',
    roles: ['owner', 'manager'],
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: 'FileText',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Vendors',
    href: '/dashboard/vendors',
    icon: 'Briefcase',
    roles: ['owner', 'manager', 'staff'],
  },
  {
    title: 'Staff Management',
    href: '/dashboard/staff',
    icon: 'ShieldCheck',
    roles: ['owner'],
  },
  {
    title: 'Enquiries',
    href: '/dashboard/enquiries',
    icon: 'Inbox',
    roles: ['owner', 'manager', 'staff'],
  },

  {
    title: 'Support Center',
    href: '/dashboard/support',
    icon: 'LifeBuoy',
    roles: ['owner', 'manager'],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
    roles: ['owner'],
  },
];

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    roles: ['super_admin'],
  },
  {
    title: 'Halls Management',
    href: '/admin/halls',
    icon: 'Building2',
    roles: ['super_admin'],
  },
  {
    title: 'Packages',
    href: '/admin/packages',
    icon: 'Layers',
    roles: ['super_admin'],
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: 'CreditCard',
    roles: ['super_admin'],
  },
  {
    title: 'Billing Approvals',
    href: '/admin/billing',
    icon: 'Receipt',
    roles: ['super_admin'],
  },
  {
    title: 'Setup Payments',
    href: '/admin/payments',
    icon: 'Banknote',
    roles: ['super_admin'],
  },
  {
    title: 'Invoice Generator',
    href: '/admin/invoices',
    icon: 'FileText',
    roles: ['super_admin'],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: 'Users',
    roles: ['super_admin'],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    roles: ['super_admin'],
  },
  {
    title: 'Support Center',
    href: '/admin/support',
    icon: 'LifeBuoy',
    roles: ['super_admin'],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    roles: ['super_admin'],
  },
];

export const STATUS_STYLES = {
  booking: {
    pending: { label: 'Pending', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    confirmed: { label: 'Confirmed', bg: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200' },
    completed: { label: 'Completed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  },
  invoice: {
    paid: { label: 'Paid', bg: 'bg-green-50 text-green-700 border-green-200' },
    unpaid: { label: 'Unpaid', bg: 'bg-red-50 text-red-700 border-red-200' },
    partial: { label: 'Partial Paid', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  },
  enquiry: {
    pending: { label: 'Pending', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    converted: { label: 'Converted', bg: 'bg-green-50 text-green-700 border-green-200' },
    lost: { label: 'Lost', bg: 'bg-gray-50 text-gray-700 border-gray-200' },
  },
  hall: {
    active: { label: 'Active', bg: 'bg-green-50 text-green-700 border-green-200' },
    inactive: { label: 'Suspended', bg: 'bg-red-50 text-red-700 border-red-200' },
  },
  subscription: {
    active: { label: 'Active', bg: 'bg-green-50 text-green-700 border-green-200' },
    trial: { label: 'Setup Mode', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    suspended: { label: 'Suspended', bg: 'bg-red-50 text-red-700 border-red-200' },
    expired: { label: 'Expired', bg: 'bg-gray-50 text-gray-700 border-gray-200' },
  },
} as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
] as const;
