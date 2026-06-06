import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminService from '@/services/api/admin.service';
import { Package, User } from '@/types';
import {
  SystemHealth,
  SupportTicket,
  TNDistrictMetric,
  AdminSettings,
  AdminActivity,
  GlobalUser,
  AdminAnalyticsData,
  RevenueMetric
} from '@/types/admin';

// --- Local Storage Keys ---
const TICKETS_KEY = 'hod_admin_tickets';
const SETTINGS_KEY = 'hod_admin_settings';
const GLOBAL_USERS_KEY = 'hod_admin_global_users';
const ACTIVITIES_KEY = 'hod_admin_activities';

// --- Initial Demo Data ---
const initialSettings: AdminSettings = {
  companyName: 'Infovex Technologies Private Limited',
  gstin: '33AAFCI8876F1Z8',
  supportPhone: '+91 91801 02030',
  supportEmail: 'support@infovex.com',
  defaultTrialDays: 14,
  invoicePrefix: 'INF-HOD-',
  nextInvoiceNumber: 1048,
  emailTemplates: {
    welcome: 'Hello {{owner_name}},\n\nWelcome to HallsOnDesk! Your account has been set up successfully. You can now configure your hall profiles and start accepting bookings.\n\nRegards,\nTeam HallsOnDesk',
    trialExpiring: 'Hi {{owner_name}},\n\nYour 14-day free trial for {{hall_name}} is expiring in 3 days. Please upgrade to a paid package to continue using the platform.\n\nBest,\nTeam HallsOnDesk',
    paymentSuccess: 'Dear {{owner_name}},\n\nWe have received your payment of Rs. {{amount}} for the monthly subscription of {{hall_name}}. Your subscription is now extended until {{expiry_date}}.\n\nInvoice: {{invoice_number}}\n\nRegards,\nInfovex Accounts',
    subscriptionSuspended: 'Dear Admin,\n\nThe subscription for {{hall_name}} has been suspended due to payment failure or direct request. Access to the dashboard is now blocked.\n\nRegards,\nSystem Admin',
  },
};

const initialTickets: SupportTicket[] = [
  {
    id: 'TKT-101',
    hallId: 'hall-1',
    hallName: 'Vasantha Mahal',
    subject: 'Cannot customize booking receipt GSTIN',
    description: 'We entered our GSTIN under Hall Profile, but the PDF receipt is still showing blank or empty GST field. Need this fixed immediately for audit.',
    category: 'bug',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    assignedTo: 'Suresh Kumar',
    messages: [
      { sender: 'user', senderName: 'Vasanth G', message: 'We entered our GSTIN under Hall Profile, but the PDF receipt is still showing blank.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
    ]
  },
  {
    id: 'TKT-102',
    hallId: 'hall-2',
    hallName: 'Grand Palace Hall',
    subject: 'Requesting feature for multi-section pricing',
    description: 'We have 3 halls in our venue (A/C Hall, Non A/C Hall, Mini Hall). Currently we can only set one default price. We need to define rates per section/sub-hall.',
    category: 'feature_request',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1d ago
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    assignedTo: 'Divya R',
    messages: [
      { sender: 'user', senderName: 'Rajesh Nair', message: 'Requesting pricing separation per section.', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { sender: 'admin', senderName: 'Divya R', message: 'Thanks Rajesh! We are prioritizing this in our v2.2 roadmap slated for July.', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
    ]
  },
  {
    id: 'TKT-103',
    hallId: 'hall-3',
    hallName: 'Royal Palace',
    subject: 'Billing inquiry: Trial to Pro Package upgrade',
    description: 'Our trial period ends tomorrow. We want to subscribe to the Annual Pro plan. How do we pay via UPI and receive a GST input invoice?',
    category: 'billing',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    messages: [
      { sender: 'user', senderName: 'Karthik Raja', message: 'Our trial ends tomorrow. How do we subscribe to the Pro plan?', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() }
    ]
  },
  {
    id: 'TKT-104',
    hallId: 'hall-4',
    hallName: 'Shree Kovil Mandapam',
    subject: 'Staff login showing unauthorized access',
    description: 'One of our new managers gets unauthorized error whenever they try to open calendar dashboard. Please check.',
    category: 'bug',
    priority: 'urgent',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    assignedTo: 'Suresh Kumar',
    messages: [
      { sender: 'user', senderName: 'Sundar M', message: 'Manager login shows unauthorized access.', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
      { sender: 'admin', senderName: 'Suresh Kumar', message: 'Resolved. The role config had a trailing space in the role tag. Reset credentials and try now.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  }
];

const initialActivities: AdminActivity[] = [
  { id: 'act-1', type: 'hall_signup', title: 'New Hall Registered', description: 'Vasantha Mahal signed up on Trial plan.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), hallName: 'Vasantha Mahal' },
  { id: 'act-2', type: 'payment_received', title: 'Subscription Renewed', description: 'Grand Palace Hall paid Rs. 4,999 monthly renewal fee.', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), hallName: 'Grand Palace Hall', amount: 4999 },
  { id: 'act-3', type: 'ticket_created', title: 'Support Ticket Created', description: 'Royal Palace opened high priority ticket: "Billing inquiry".', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), hallName: 'Royal Palace' },
  { id: 'act-4', type: 'package_changed', title: 'Package Plan Upgraded', description: 'Royal Palace switched from Basic to Enterprise package.', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), hallName: 'Royal Palace' },
  { id: 'act-5', type: 'subscription_expired', title: 'Subscription Expired', description: 'Annai Illam Mandapam trial expired.', timestamp: new Date(Date.now() - 3600000 * 36).toISOString(), hallName: 'Annai Illam Mandapam' },
];

function getStoredData<T>(key: string, fallback: T): T {
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

function setStoredData<T>(key: string, data: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// Helper: Seed global users cross-referenced with actual halls if empty
function syncGlobalUsers(halls: adminService.HallWithSubscription[]): GlobalUser[] {
  const fallbackUsers: GlobalUser[] = [
    { id: 'usr-1', name: 'Vasanth G', email: 'owner@vasanthamahal.com', role: 'owner', status: 'active', lastLogin: new Date(Date.now() - 1200000).toISOString(), phone: '9840123456', hallName: 'Vasantha Mahal' },
    { id: 'usr-2', name: 'Rajesh Nair', email: 'owner@grandpalace.com', role: 'owner', status: 'active', lastLogin: new Date(Date.now() - 3600000 * 5).toISOString(), phone: '9840987654', hallName: 'Grand Palace Hall' },
    { id: 'usr-3', name: 'Karthik Raja', email: 'owner@royalpalace.com', role: 'owner', status: 'active', lastLogin: new Date(Date.now() - 3600000 * 24).toISOString(), phone: '9962123123', hallName: 'Royal Palace' },
    { id: 'usr-4', name: 'Sundar M', email: 'owner@shreekovil.com', role: 'owner', status: 'suspended', lastLogin: new Date(Date.now() - 3600000 * 120).toISOString(), phone: '8123456789', hallName: 'Shree Kovil Mandapam' },
    { id: 'usr-5', name: 'Abishek S', email: 'manager@vasanthamahal.com', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(), phone: '7200112233', hallName: 'Vasantha Mahal' },
    { id: 'usr-6', name: 'Meena K', email: 'staff@grandpalace.com', role: 'staff', status: 'active', lastLogin: new Date(Date.now() - 600000).toISOString(), phone: '9444123456', hallName: 'Grand Palace Hall' },
  ];
  return getStoredData(GLOBAL_USERS_KEY, fallbackUsers);
}

// Helper: Get Activities from Local Storage
function getActivities(): AdminActivity[] {
  return getStoredData(ACTIVITIES_KEY, initialActivities);
}

function pushActivity(activity: Omit<AdminActivity, 'id' | 'timestamp'>) {
  const list = getActivities();
  const newAct: AdminActivity = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  setStoredData(ACTIVITIES_KEY, [newAct, ...list].slice(0, 50));
}

function parseFeatures(features: any): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
      return [parsed.toString()];
    } catch {
      if (features.includes(',')) {
        return features.split(',').map((f: string) => f.trim());
      }
      return [features];
    }
  }
  return [];
}

// --- Hooks Implementation ---

// 1. Dashboard Stats & Charts
export function useAdminDashboardData() {
  const { data: halls = [], isLoading: hallsLoading } = useQuery({
    queryKey: ['admin', 'halls'],
    queryFn: adminService.getAllHalls,
  });

  const { data: apiStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'overview-stats'],
    queryFn: adminService.getAdminStats,
  });

  const isLoading = hallsLoading || statsLoading;

  // Derive stats dynamically from halls
  const totalHallsCount = halls.length || 15;
  const activeHallsCount = halls.filter(h => h.status === 'active').length || 11;
  const trialHallsCount = halls.filter(h => {
    const subs = h.hall_subscriptions || [];
    return subs.some(s => s.status === 'trial');
  }).length || 3;
  
  const expiredHallsCount = halls.filter(h => {
    const subs = h.hall_subscriptions || [];
    return subs.length > 0 && subs.every(s => s.status === 'expired' || s.status === 'suspended');
  }).length || 1;

  // Business revenue and totals
  const monthlyRevenue = 84500; // Rs.
  const annualRevenue = 924000;
  
  const health: SystemHealth = {
    apiRequests24h: 384210,
    activeUsers24h: 184,
    storageUsedBytes: 42 * 1024 * 1024 * 1024, // 42 GB
    storageLimitBytes: 500 * 1024 * 1024 * 1024, // 500 GB
    databaseStatus: 'healthy',
    serverStatus: 'healthy',
  };

  const activities = getActivities();

  return {
    kpis: {
      totalHalls: { value: totalHallsCount, growth: 12.4, trend: 'up' },
      activeHalls: { value: activeHallsCount, growth: 8.5, trend: 'up' },
      trialHalls: { value: trialHallsCount, growth: -5.2, trend: 'down' },
      expiredSubscriptions: { value: expiredHallsCount, growth: -15.4, trend: 'up' }, // fewer is up/positive
      monthlyRevenue: { value: monthlyRevenue, growth: 18.2, trend: 'up' },
      annualRevenue: { value: annualRevenue, growth: 22.4, trend: 'up' },
      newSignups: { value: 6, growth: 20.0, trend: 'up' },
      totalUsers: { value: 74, growth: 14.8, trend: 'up' }
    },
    systemHealth: health,
    activities,
    isLoading
  };
}

// 2. Halls Management
export function useAdminHalls() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'halls'],
    queryFn: adminService.getAllHalls,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createHall,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      toast.success(res.message || 'Hall registered successfully!');
      
      // Update local storage users list and activity log
      pushActivity({
        type: 'hall_signup',
        title: 'New Hall Registered',
        description: `${res.owner_email} registered a new venue space.`,
        hallName: res.owner_email
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to register hall');
    }
  });

  const suspendMutation = useMutation({
    mutationFn: adminService.suspendHall,
    onSuccess: (res, hallId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall', hallId] });
      toast.success('Hall suspended successfully');
      
      pushActivity({
        type: 'subscription_expired',
        title: 'Hall Suspended',
        description: `Hall ID ${hallId.slice(0, 8)} has been suspended.`,
        hallId
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to suspend hall');
    }
  });

  const activateMutation = useMutation({
    mutationFn: adminService.activateHall,
    onSuccess: (res, hallId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall', hallId] });
      toast.success('Hall activated successfully');
      
      pushActivity({
        type: 'hall_signup',
        title: 'Hall Activated',
        description: `Hall ID ${hallId.slice(0, 8)} is now online.`,
        hallId
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to activate hall');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteHall,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      toast.success('Hall deleted permanently');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete hall');
    }
  });

  return {
    halls: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createHall: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    suspendHall: suspendMutation.mutateAsync,
    activateHall: activateMutation.mutateAsync,
    deleteHall: deleteMutation.mutateAsync,
  };
}

export function useAdminHallDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'hall', id],
    queryFn: async () => {
      const hall = await adminService.getHallById(id);
      if (hall.hall_subscriptions) {
        hall.hall_subscriptions = hall.hall_subscriptions.map((sub) => {
          if (sub.packages) {
            sub.packages.features = parseFeatures(sub.packages.features);
          }
          return sub;
        });
      }
      return hall;
    },
    enabled: !!id,
  });
}

// 3. Packages Management
export function useAdminPackages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: async () => {
      const pkgs = await adminService.getPackagesList();
      return pkgs.map((pkg) => ({
        ...pkg,
        features: parseFeatures(pkg.features),
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: adminService.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] });
      toast.success('Package plan created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create package');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updatePackage>[1] }) =>
      adminService.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] });
      toast.success('Package updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update package');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete package');
    }
  });

  return {
    packages: query.data || [],
    isLoading: query.isLoading,
    createPackage: createMutation.mutateAsync,
    updatePackage: updateMutation.mutateAsync,
    deletePackage: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

// 4. Subscriptions Management
export function useAdminSubscriptions() {
  const queryClient = useQueryClient();

  const { data: halls = [], isLoading: hallsLoading } = useQuery({
    queryKey: ['admin', 'halls'],
    queryFn: adminService.getAllHalls,
  });

  const renewMutation = useMutation({
    mutationFn: ({ hallId, months }: { hallId: string; months: number }) =>
      adminService.renewSubscription(hallId, months),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall', variables.hallId] });
      toast.success(res.message || 'Subscription renewed!');
      
      pushActivity({
        type: 'payment_received',
        title: 'Subscription Renewed',
        description: `Extended subscription by ${variables.months} months.`,
        hallId: variables.hallId
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Renewal failed');
    }
  });

  const changePackageMutation = useMutation({
    mutationFn: ({ hallId, packageId }: { hallId: string; packageId: string }) =>
      adminService.changePackage(hallId, packageId),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall', variables.hallId] });
      toast.success('Billing package changed successfully');
      
      pushActivity({
        type: 'package_changed',
        title: 'Package Plan Changed',
        description: `Subscription package migrated for Hall ID: ${variables.hallId.slice(0, 8)}.`,
        hallId: variables.hallId
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Package upgrade/downgrade failed');
    }
  });

  // Consolidate subscriptions list from Halls
  const subscriptions = halls
    .map((hall) => {
      const activeSub = hall.hall_subscriptions?.[0];
      return {
        id: activeSub?.id || `sub-${hall.id}`,
        hallId: hall.id,
        hallName: hall.hall_name,
        packageName: activeSub?.packages?.name || 'Free Trial',
        price: activeSub?.packages?.price || 0,
        startDate: activeSub?.start_date || hall.created_at || new Date().toISOString(),
        endDate: activeSub?.end_date || new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
        status: (activeSub?.status as 'active' | 'suspended' | 'expired' | 'trial') || 'trial',
        paymentStatus: activeSub?.payment_status || 'pending',
      };
    });

  return {
    subscriptions,
    isLoading: hallsLoading,
    renewSubscription: renewMutation.mutateAsync,
    changePackage: changePackageMutation.mutateAsync,
    isRenewing: renewMutation.isPending,
    isChangingPackage: changePackageMutation.isPending,
  };
}

// 5. Global Users Management
export function useAdminUsers() {
  const queryClient = useQueryClient();
  const { data: halls = [] } = useQuery({
    queryKey: ['admin', 'halls'],
    queryFn: adminService.getAllHalls,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => Promise.resolve(syncGlobalUsers(halls)),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) => {
      const allUsers = syncGlobalUsers(halls);
      const updated = allUsers.map((u) => (u.id === userId ? { ...u, status } : u));
      setStoredData(GLOBAL_USERS_KEY, updated);
      return { userId, status };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`User state set to ${res.status}`);
      pushActivity({
        type: 'user_created',
        title: 'User Access Altered',
        description: `User ID ${res.userId} status changed to ${res.status}.`
      });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Simulate password reset email
      return { userId };
    },
    onSuccess: (res) => {
      toast.success(`Password reset instructions triggered for user ID ${res.userId}`);
    }
  });

  return {
    users,
    isLoading,
    toggleUserStatus: toggleStatusMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
  };
}

// 6. Support Tickets
export function useAdminSupport() {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => Promise.resolve(getStoredData(TICKETS_KEY, initialTickets)),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status, assignedTo }: { ticketId: string; status: SupportTicket['status']; assignedTo?: string }) => {
      const list = getStoredData(TICKETS_KEY, initialTickets);
      const updated = list.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              ...(assignedTo ? { assignedTo } : {})
            }
          : t
      );
      setStoredData(TICKETS_KEY, updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Ticket updated successfully');
    }
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const list = getStoredData(TICKETS_KEY, initialTickets);
      const updated = list.map((t) => {
        if (t.id === ticketId) {
          const messages = [...t.messages, {
            sender: 'admin' as const,
            senderName: 'System Admin',
            message,
            timestamp: new Date().toISOString()
          }];
          return {
            ...t,
            messages,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
      setStoredData(TICKETS_KEY, updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Response dispatched');
    }
  });

  return {
    tickets,
    isLoading,
    updateTicketStatus: updateStatusMutation.mutateAsync,
    addTicketMessage: addMessageMutation.mutateAsync,
  };
}

// 7. System Settings
export function useAdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => Promise.resolve(getStoredData(SETTINGS_KEY, initialSettings)),
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedSettings: AdminSettings) => {
      setStoredData(SETTINGS_KEY, updatedSettings);
      return updatedSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Company parameters updated');
    }
  });

  return {
    settings: settings || initialSettings,
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

// 8. Analytics Details
export function useAdminAnalytics(timePeriod: '30d' | '3m' | '6m' | '1y' = '30d') {
  // Static datasets calculated relative to active Packages
  const revenueHistory: Record<'30d' | '3m' | '6m' | '1y', RevenueMetric[]> = {
    '30d': [
      { date: '05-08', mrr: 75000, setupFees: 5000, total: 80000 },
      { date: '05-15', mrr: 78000, setupFees: 10000, total: 88000 },
      { date: '05-22', mrr: 81000, setupFees: 8000, total: 89000 },
      { date: '05-29', mrr: 84500, setupFees: 7500, total: 92000 },
    ],
    '3m': [
      { date: 'Apr 2026', mrr: 72000, setupFees: 12000, total: 84000 },
      { date: 'May 2026', mrr: 78000, setupFees: 15000, total: 93000 },
      { date: 'Jun 2026', mrr: 84500, setupFees: 18000, total: 102500 },
    ],
    '6m': [
      { date: 'Jan 2026', mrr: 58000, setupFees: 8000, total: 66000 },
      { date: 'Feb 2026', mrr: 62000, setupFees: 11000, total: 73000 },
      { date: 'Mar 2026', mrr: 69000, setupFees: 14000, total: 83000 },
      { date: 'Apr 2026', mrr: 72000, setupFees: 12000, total: 84000 },
      { date: 'May 2026', mrr: 78000, setupFees: 15000, total: 93000 },
      { date: 'Jun 2026', mrr: 84500, setupFees: 18000, total: 102500 },
    ],
    '1y': [
      { date: 'Jul 2025', mrr: 34000, setupFees: 5000, total: 39000 },
      { date: 'Aug 2025', mrr: 38000, setupFees: 7000, total: 45000 },
      { date: 'Sep 2025', mrr: 41000, setupFees: 6000, total: 47000 },
      { date: 'Oct 2025', mrr: 48000, setupFees: 9000, total: 57000 },
      { date: 'Nov 2025', mrr: 50000, setupFees: 10000, total: 60000 },
      { date: 'Dec 2025', mrr: 54000, setupFees: 8000, total: 62000 },
      { date: 'Jan 2026', mrr: 58000, setupFees: 8000, total: 66000 },
      { date: 'Feb 2026', mrr: 62000, setupFees: 11000, total: 73000 },
      { date: 'Mar 2026', mrr: 69000, setupFees: 14000, total: 83000 },
      { date: 'Apr 2026', mrr: 72000, setupFees: 12000, total: 84000 },
      { date: 'May 2026', mrr: 78000, setupFees: 15000, total: 93000 },
      { date: 'Jun 2026', mrr: 84500, setupFees: 18000, total: 102500 },
    ],
  };

  const hallGrowth: Record<'30d' | '3m' | '6m' | '1y', Array<{ month: string; active: number; trials: number }>> = {
    '30d': [
      { month: 'Wk 1', active: 8, trials: 4 },
      { month: 'Wk 2', active: 9, trials: 3 },
      { month: 'Wk 3', active: 10, trials: 4 },
      { month: 'Wk 4', active: 11, trials: 3 },
    ],
    '3m': [
      { month: 'Apr', active: 8, trials: 2 },
      { month: 'May', active: 10, trials: 4 },
      { month: 'Jun', active: 11, trials: 3 },
    ],
    '6m': [
      { month: 'Jan', active: 6, trials: 2 },
      { month: 'Feb', active: 7, trials: 3 },
      { month: 'Mar', active: 8, trials: 3 },
      { month: 'Apr', active: 8, trials: 2 },
      { month: 'May', active: 10, trials: 4 },
      { month: 'Jun', active: 11, trials: 3 },
    ],
    '1y': [
      { month: 'Jul', active: 3, trials: 1 },
      { month: 'Aug', active: 4, trials: 2 },
      { month: 'Sep', active: 4, trials: 2 },
      { month: 'Oct', active: 5, trials: 3 },
      { month: 'Nov', active: 5, trials: 2 },
      { month: 'Dec', active: 6, trials: 3 },
      { month: 'Jan', active: 6, trials: 2 },
      { month: 'Feb', active: 7, trials: 3 },
      { month: 'Mar', active: 8, trials: 3 },
      { month: 'Apr', active: 8, trials: 2 },
      { month: 'May', active: 10, trials: 4 },
      { month: 'Jun', active: 11, trials: 3 },
    ],
  };

  const districtStats: TNDistrictMetric[] = [
    { district: 'Chennai', contacted: 48, demosGiven: 32, trialsStarted: 22, paidCustomers: 12, conversionRate: 25.0, mrr: 59988 },
    { district: 'Coimbatore', contacted: 35, demosGiven: 24, trialsStarted: 15, paidCustomers: 8, conversionRate: 22.8, mrr: 39992 },
    { district: 'Madurai', contacted: 28, demosGiven: 18, trialsStarted: 12, paidCustomers: 5, conversionRate: 17.8, mrr: 24995 },
    { district: 'Trichy', contacted: 22, demosGiven: 14, trialsStarted: 8, paidCustomers: 3, conversionRate: 13.6, mrr: 14997 },
    { district: 'Salem', contacted: 19, demosGiven: 10, trialsStarted: 6, paidCustomers: 2, conversionRate: 10.5, mrr: 9998 },
    { district: 'Tirunelveli', contacted: 15, demosGiven: 8, trialsStarted: 4, paidCustomers: 1, conversionRate: 6.6, mrr: 4999 },
    { district: 'Vellore', contacted: 12, demosGiven: 6, trialsStarted: 3, paidCustomers: 0, conversionRate: 0.0, mrr: 0 },
  ];

  const packageDistribution = [
    { name: 'Basic Tier', value: 35, count: 5 },
    { name: 'Professional Tier', value: 45, count: 4 },
    { name: 'Enterprise Tier', value: 20, count: 2 },
  ];

  const query = useQuery({
    queryKey: ['admin', 'analytics', timePeriod],
    queryFn: () => {
      const data: AdminAnalyticsData = {
        revenueHistory: revenueHistory[timePeriod],
        retentionRate: 94.8,
        churnRate: 5.2,
        arpu: 7681,
        packageDistribution,
        hallGrowth: hallGrowth[timePeriod],
        districtStats
      };
      return Promise.resolve(data);
    }
  });

  return {
    analyticsData: query.data,
    isLoading: query.isLoading
  };
}
