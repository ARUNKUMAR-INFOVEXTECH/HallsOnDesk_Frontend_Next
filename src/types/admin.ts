import { User, Package, Hall } from './index';

export interface SystemHealth {
  databaseStatus: 'healthy' | 'degraded' | 'down';
  serverStatus: 'healthy' | 'degraded' | 'down';
  // Legacy optional fields retained for backward compat
  apiRequests24h?: number;
  activeUsers24h?: number;
  storageUsedBytes?: number;
  storageLimitBytes?: number;
}

export interface SupportTicket {
  id: string;
  hallId?: string;
  hallName?: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature_request' | 'billing' | 'onboarding' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: Array<{
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export interface TNDistrictMetric {
  district: string;
  contacted: number;
  demosGiven: number;
  trialsStarted: number;
  paidCustomers: number;
  conversionRate: number; // calculated percent
  mrr: number;
}

export interface AdminSettings {
  id?: string;
  companyName: string;
  gstin: string;
  supportPhone: string;
  supportEmail: string;
  defaultTrialDays: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  subscriptionQrEnabled?: boolean;
  subscriptionQrUpiId?: string;
  emailTemplates: {
    welcome: string;
    trialExpiring: string;
    paymentSuccess: string;
    subscriptionSuspended: string;
  };
}

export interface AdminActivity {
  id: string;
  type: 'hall_signup' | 'payment_received' | 'subscription_expired' | 'ticket_created' | 'package_changed' | 'user_created' | 'activity';
  title: string;
  description: string;
  timestamp: string;
  hallId?: string;
  hallName?: string;
  amount?: number;
}

export interface GlobalUser extends User {
  phone?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  hallName?: string;
  backupPassword?: string;
}

export interface RevenueMetric {
  date: string; // Formatted label e.g. "Jan 2026"
  mrr: number;
  setupFees: number;
  total: number;
}

export interface TopHall {
  hallId: string;
  hallName: string;
  city: string;
  totalRevenue: number;
  rank: number;
}

export interface HallStats {
  bookingsCount: number;
  confirmedBookings: number;
  pendingBookings: number;
  staffCount: number;
  totalRevenue: number;
  pendingBalance: number;
  maxUsers: number | null;
  maxBookings: number | null;
}

export interface HallActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: 'activity' | 'subscription';
}

export interface AdminAnalyticsData {
  revenueHistory: RevenueMetric[];
  retentionRate: number; // percentage
  churnRate: number; // percentage
  arpu: number; // average revenue per unit/hall
  packageDistribution: Array<{ name: string; value: number; count: number }>;
  hallGrowth: Array<{ month: string; active: number; trials: number }>;
  districtStats: TNDistrictMetric[];
  topHalls: TopHall[];
}
