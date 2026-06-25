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


// --- Helper functions ---
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: adminService.getAdminDashboardStats,
  });

  return {
    kpis: data?.kpis || {
      totalHalls: { value: 0, growth: 0, trend: 'up' as const },
      activeHalls: { value: 0, growth: 0, trend: 'up' as const },
      trialHalls: { value: 0, growth: 0, trend: 'up' as const },
      expiredSubscriptions: { value: 0, growth: 0, trend: 'up' as const },
      monthlyRevenue: { value: 0, growth: 0, trend: 'up' as const },
      annualRevenue: { value: 0, growth: 0, trend: 'up' as const },
      newSignups: { value: 0, growth: 0, trend: 'up' as const },
      totalUsers: { value: 0, growth: 0, trend: 'up' as const },
    },
    systemHealth: data?.systemHealth || {
      databaseStatus: 'healthy' as const,
      serverStatus: 'healthy' as const,
    },
    activities: data?.activities || [],
    isLoading,
    isError,
    error,
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(res.message || 'Hall registered successfully!');
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success('Hall suspended successfully');
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success('Hall activated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to activate hall');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteHall,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(res.message || 'Subscription renewed!');
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success('Billing package changed successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Package upgrade/downgrade failed');
    }
  });

  // Consolidate subscriptions list from Halls
  const subscriptions = halls.map((hall) => {
    const activeSub = hall.hall_subscriptions?.[0];
    const todayStr = new Date().toISOString().split('T')[0];
    let subStatus = (activeSub?.status as 'active' | 'suspended' | 'expired' | 'trial') || 'trial';
    if (activeSub && (subStatus === 'active' || subStatus === 'trial') && activeSub.end_date && activeSub.end_date < todayStr) {
      subStatus = 'expired';
    }

    return {
      id: activeSub?.id || `sub-${hall.id}`,
      hallId: hall.id,
      hallName: hall.hall_name,
      packageName: activeSub?.packages?.name || 'Free Trial',
      price: activeSub?.packages?.price || 0,
      startDate: activeSub?.start_date || hall.created_at || new Date().toISOString(),
      endDate: activeSub?.end_date || new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
      status: subStatus,
      paymentStatus: activeSub?.payment_status || 'pending',
    };
  });

  const adjustSubMutation = useMutation({
    mutationFn: ({ subscriptionId, endDate, graceDays, status }: { subscriptionId: string; endDate?: string; graceDays?: number; status?: string }) =>
      adminService.adjustSubscription(subscriptionId, { end_date: endDate, grace_days: graceDays, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(res.message || 'Subscription adjusted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to adjust subscription');
    }
  });

  return {
    subscriptions,
    isLoading: hallsLoading,
    renewSubscription: renewMutation.mutateAsync,
    changePackage: changePackageMutation.mutateAsync,
    adjustSubscription: adjustSubMutation.mutateAsync,
    isRenewing: renewMutation.isPending,
    isChangingPackage: changePackageMutation.isPending,
    isAdjusting: adjustSubMutation.isPending,
  };
}

// 5. Global Users Management
export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.getAdminUsers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
      adminService.toggleAdminUserStatus(userId, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(res.message || `User state set to ${variables.status}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetAdminUserPassword(userId),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset instructions triggered');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      adminService.changeAdminUserPassword(userId, password),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(res.message || 'Password changed successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  });

  return {
    users,
    isLoading,
    toggleUserStatus: toggleStatusMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

// 6. Support Tickets
export function useAdminSupport() {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: adminService.getAdminTickets,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status, assignedTo }: { ticketId: string; status: SupportTicket['status']; assignedTo?: string }) =>
      adminService.updateAdminTicketStatus(ticketId, { status, assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    }
  });

  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      adminService.addAdminTicketMessage(ticketId, { message, senderName: 'System Admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Response dispatched');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch reply');
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
    queryFn: adminService.getAdminSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedSettings: AdminSettings) => adminService.updateAdminSettings(updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Company parameters updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update company settings');
    }
  });

  const defaultSettings: AdminSettings = {
    companyName: 'Infovex Technologies Private Limited',
    gstin: '33AAFCI8876F1Z8',
    supportPhone: '+91 91801 02030',
    supportEmail: 'support@infovex.com',
    defaultTrialDays: 14,
    invoicePrefix: 'INF-HOD-',
    nextInvoiceNumber: 1048,
    emailTemplates: {
      welcome: '',
      trialExpiring: '',
      paymentSuccess: '',
      subscriptionSuspended: '',
    }
  };

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

// 8. Analytics Details
export function useAdminAnalytics(timePeriod: '30d' | '3m' | '6m' | '1y' = '30d') {
  const query = useQuery({
    queryKey: ['admin', 'analytics', timePeriod],
    queryFn: () => adminService.getAdminAnalytics(timePeriod),
  });

  return {
    analyticsData: query.data,
    isLoading: query.isLoading
  };
}

// 9. Hall-level real stats
export function useAdminHallStats(id: string) {
  return useQuery({
    queryKey: ['admin', 'hall-stats', id],
    queryFn: () => adminService.getHallStats(id),
    enabled: !!id,
  });
}

// 10. Hall-level real activity timeline
export function useAdminHallActivity(id: string) {
  return useQuery({
    queryKey: ['admin', 'hall-activity', id],
    queryFn: () => adminService.getHallActivity(id),
    enabled: !!id,
  });
}

// 11. SaaS Subscription Billing Approvals
export function useAdminPendingPayments() {
  return useQuery({
    queryKey: ['admin', 'pending-payments'],
    queryFn: adminService.getPendingSubscriptionPayments,
  });
}

export function useAdminVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { action: 'approve' | 'reject'; rejection_reason?: string } }) =>
      adminService.verifySubscriptionPayment(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Payment verified successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify payment');
    },
  });
}

// 12. SMTP Outgoing Mail Connection Test
export function useAdminSendTestEmail() {
  return useMutation({
    mutationFn: adminService.sendTestEmail,
    onSuccess: (res) => {
      toast.success(res.message || 'Test email dispatched successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch test email');
    },
  });
}

// 13. Hall Subscription Payments (Invoices)
export function useAdminHallSubscriptionPayments(id: string) {
  return useQuery({
    queryKey: ['admin', 'hall-payments', id],
    queryFn: () => adminService.getHallSubscriptionPayments(id),
    enabled: !!id,
  });
}

// 14. Record Manual Subscription Payment (Generate Invoice)
export function useAdminRecordManualPayment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { package_id: string; amount: number; payment_method?: string; transaction_ref_no?: string; notes?: string; tax_enabled?: boolean }) =>
      adminService.recordManualSubscriptionPayment(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Manual payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall-payments', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hall-stats', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    },
  });
}

// 15. Setup Fee Payments hooks
export function useAdminSetupFeePayments() {
  return useQuery({
    queryKey: ['admin', 'setup-fee-payments'],
    queryFn: adminService.getSetupFeePayments,
  });
}

export function useAdminUpdateSetupFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount_paid: number; payment_method: string; transaction_ref_no?: string; notes?: string } }) =>
      adminService.updateSetupFeePayment(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Setup fee payment updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'setup-fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'halls'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update setup fee payment');
    },
  });
}

export function useAdminGenerateCustomInvoice() {
  return useMutation({
    mutationFn: (data: adminService.CustomInvoiceData) => adminService.generateCustomInvoice(data),
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate custom invoice');
    },
  });
}


