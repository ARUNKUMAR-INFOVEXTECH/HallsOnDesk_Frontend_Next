'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  hallSettingsSchema,
  notificationSettingsSchema,
  bookingSettingsSchema
} from '@/schemas/settings.schema';
import { HallSettings } from '@/types/settings';
import {
  useHallSettings,
  useUpdateHallSettings,
  useHallProfile,
  useActiveSubscription
} from '@/hooks/useSettings';
import { formatDate } from '@/utils/formatters';
import SettingsCard from '@/components/settings/SettingsCard';
import SettingsToggleRow from '@/components/settings/SettingsToggleRow';
import NumberingPreview from '@/components/settings/NumberingPreview';
import SettingsSaveBar from '@/components/settings/SettingsSaveBar';
import {
  Settings,
  Hash,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
  HelpCircle,
  FileText,
  Lock,
  XCircle,
  X,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import apiClient from '@/services/api/client';
import { useAuthStore } from '@/store/authStore';

const getDraftKey = () => {
  const activeHallId = Cookies.get('active_hall_id');
  return activeHallId ? `hod_settings_draft_general_${activeHallId}` : 'hod_settings_draft_general';
};

// Define the full schema extending core settings with notifications and booking configurations
const fullSettingsSchema = hallSettingsSchema.extend({
  notifications: notificationSettingsSchema,
  bookingSettings: bookingSettingsSchema,
});

type SettingsFormValues = z.infer<typeof fullSettingsSchema>;

interface AccordionSectionProps {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  hasError?: boolean;
  children: React.ReactNode;
}

function AccordionSection({
  isOpen,
  onToggle,
  title,
  description,
  icon: Icon,
  hasError = false,
  children
}: AccordionSectionProps) {
  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-sm ${
      hasError ? 'border-red-300 ring-1 ring-red-150' : isOpen ? 'border-violet-200' : 'border-gray-150'
    }`}>
      {/* Trigger Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 bg-gray-50/50 hover:bg-gray-50/80 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            hasError ? 'bg-red-50 text-red-650 border-red-100' : isOpen ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-gray-100 text-gray-500 border-gray-150'
          }`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h3>
              {hasError && (
                <span className="text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                  Errors
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-450 font-medium mt-0.5">{description}</p>
          </div>
        </div>

        <div className="text-gray-400 shrink-0 hover:text-gray-650 transition-colors">
          {isOpen ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
        </div>
      </button>

      {/* Content Area */}
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <div className="p-5 border-t border-gray-100 space-y-5 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GeneralSettingsPage() {
  const { data: settings, isLoading: queryLoading, isError } = useHallSettings();
  const { data: profile } = useHallProfile(); // For email & phone context
  const updateSettingsMutation = useUpdateHallSettings();

  const templates = [
    {
      id: 'classic',
      name: 'Classic Layout',
      description: 'Clean grid-centric layout with corporate gray borders. Default for all tiers.',
      isPremium: false,
      previewHtml: (
        <div className="flex flex-col h-full justify-between w-full">
          <div className="flex justify-between items-center pb-1 border-b border-slate-200">
            <div className="h-3 w-10 bg-slate-350 rounded-sm" />
            <div className="h-3 w-12 bg-slate-300 rounded-sm" />
          </div>
          <div className="space-y-1 my-1 flex-1 py-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-sm" />
            <div className="h-1.5 w-full bg-slate-100 rounded-sm" />
            <div className="h-1.5 w-2/3 bg-slate-100 rounded-sm" />
          </div>
          <div className="h-2 w-16 bg-slate-300 rounded-sm align-bottom self-end" />
        </div>
      )
    },
    {
      id: 'modern',
      name: 'Modern Indigo',
      description: 'Sleek indigo gradients, rounded panels, dark headers, and dynamic table dividers.',
      isPremium: true,
      previewHtml: (
        <div className="flex flex-col h-full justify-between w-full">
          <div className="bg-indigo-600 h-5 -mx-3.5 -mt-3.5 px-2 flex justify-between items-center text-[8px] text-white">
            <div className="h-2 w-8 bg-indigo-300 rounded-sm" />
            <div className="h-2 w-10 bg-indigo-200 rounded-sm" />
          </div>
          <div className="space-y-1 my-1 flex-1 py-1">
            <div className="h-1.5 w-full bg-indigo-50/50 rounded-sm border border-indigo-100" />
            <div className="h-1.5 w-full bg-indigo-50/50 rounded-sm border border-indigo-100" />
          </div>
          <div className="h-2 w-14 bg-indigo-600 rounded-sm self-end" />
        </div>
      )
    },
    {
      id: 'elegant',
      name: 'Elegant Gold & Serif',
      description: 'Luxury gold borders, ornate serif headings (Playfair), and signature spaces.',
      isPremium: true,
      previewHtml: (
        <div className="flex flex-col h-full justify-between w-full border border-amber-200/60 p-1.5 rounded-sm bg-amber-50/10">
          <div className="flex flex-col items-center border-b border-amber-250 pb-0.5">
            <div className="h-2 w-16 bg-amber-800/80 rounded-sm" />
            <div className="text-[5px] text-amber-600/80 font-serif mt-0.5 font-bold tracking-widest uppercase">INVOICE</div>
          </div>
          <div className="space-y-1 my-1 flex-1 py-0.5">
            <div className="h-1.5 w-full bg-amber-50/45 rounded-sm" />
            <div className="h-1.5 w-4/5 bg-amber-50/45 rounded-sm" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-1.5 w-6 bg-slate-300 rounded-sm" />
            <div className="h-2 w-12 bg-amber-700/85 rounded-sm" />
          </div>
        </div>
      )
    },
    {
      id: 'minimalist',
      name: 'Minimalist Clean',
      description: 'Ultra-minimal type-driven layout, plenty of whitespace, and subtle gray lines.',
      isPremium: true,
      previewHtml: (
        <div className="flex flex-col h-full justify-between w-full">
          <div className="flex justify-between items-baseline pt-1">
            <div className="h-2.5 w-8 bg-gray-900 rounded-sm" />
            <div className="text-[6px] font-light text-gray-500">INV-001</div>
          </div>
          <div className="space-y-1 my-1">
            <div className="h-1 w-full bg-gray-200 rounded-sm" />
            <div className="h-1 w-full bg-gray-200 rounded-sm" />
          </div>
          <div className="border-t border-gray-900/60 pt-1 flex justify-between">
            <div className="h-1 w-6 bg-gray-300 rounded-sm" />
            <div className="h-2 w-10 bg-gray-950 rounded-sm" />
          </div>
        </div>
      )
    }
  ];

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,  // Numbering
    1: true,  // Locale
    2: true,  // Tax
    3: false, // Invoice Templates
    4: false, // Multi-Hall
    5: false, // Notifications
  });

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const setActiveHall = useAuthStore((state) => state.setActiveHall);

  const { data: subscription } = useActiveSubscription();
  const activePackage = subscription?.packages;

  // Multi-hall state
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const [multiHallEnabled, setMultiHallEnabled] = useState(false);
  const [differentStaff, setDifferentStaff] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Secondary hall form state
  const [newHallName, setNewHallName] = useState('');
  const [newHallPhone, setNewHallPhone] = useState('');
  const [newHallEmail, setNewHallEmail] = useState('');
  const [newHallCity, setNewHallCity] = useState('');
  const [newHallAddress, setNewHallAddress] = useState('');
  const [isRegisteringHall, setIsRegisteringHall] = useState(false);

  // Fetch premium status & initialize settings
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        setMultiHallEnabled(user.multi_hall_enabled || false);
        setDifferentStaff(user.different_staff_management || false);
      }

      const checkPremium = async () => {
        try {
          const res = await apiClient.get('/multihall/premium-status');
          setIsPremium(res.data.premium);
        } catch (err) {
          console.error('Error checking premium status:', err);
        } finally {
          setIsCheckingPremium(false);
        }
      };

      checkPremium();
    } else {
      setIsCheckingPremium(false);
    }
  }, [user]);

  const handleToggleMultiHall = async (checked: boolean) => {
    try {
      await apiClient.post('/multihall/toggle-feature', { enabled: checked });
      setMultiHallEnabled(checked);
      if (user) {
        setUser({ ...user, multi_hall_enabled: checked });
        if (!checked && activeHallId && user.hall_id && activeHallId !== user.hall_id) {
          setActiveHall(user.hall_id);
          return;
        }
      }
      toast.success(`Multi-hall workspace ${checked ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle multi-hall setting.');
    }
  };

  const handleToggleDifferentStaff = async (checked: boolean) => {
    try {
      await apiClient.post('/multihall/toggle-staff-mode', { enabled: checked });
      setDifferentStaff(checked);
      if (user) {
        setUser({ ...user, different_staff_management: checked });
      }
      toast.success(`Staff management changed to ${checked ? 'different' : 'shared'} successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle staff management.');
    }
  };

  const handleRegisterSecondHall = async () => {
    if (!newHallName) return;
    setIsRegisteringHall(true);
    try {
      const res = await apiClient.post('/multihall/register-hall', {
        hall_name: newHallName,
        phone: newHallPhone,
        email: newHallEmail,
        city: newHallCity,
        address: newHallAddress,
      });

      // Update store user profile with new accessible halls list
      const updatedHalls = [...(user?.accessible_halls || []), { id: res.data.hall.id, hall_name: res.data.hall.hall_name }];
      if (user) {
        const updatedUser = { ...user, accessible_halls: updatedHalls };
        setUser(updatedUser);
      }

      setNewHallName('');
      setNewHallPhone('');
      setNewHallEmail('');
      setNewHallCity('');
      setNewHallAddress('');

      toast.success('Secondary hall registered successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register secondary hall.');
    } finally {
      setIsRegisteringHall(false);
    }
  };

  const toggleSection = (idx: number) => {
    setOpenSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(fullSettingsSchema),
    defaultValues: {
      invoicePrefix: 'INV',
      bookingPrefix: 'BK',
      receiptPrefix: 'RCP',
      invoiceStartNumber: 1,
      bookingStartNumber: 1,
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      timezone: 'Asia/Kolkata',
      taxEnabled: false,
      gstRate: 18,
      gstApplicableOn: 'all',
      autoInvoice: false,
      invoiceFooterNote: '',
      termsAndConditions: '',
      invoiceTemplate: 'classic',
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
    }
  });

  const watchedValues = watch();
  const invoicePrefix = watch('invoicePrefix') || '';
  const invoiceStartNumber = Number(watch('invoiceStartNumber')) || 1;
  const bookingPrefix = watch('bookingPrefix') || '';
  const bookingStartNumber = Number(watch('bookingStartNumber')) || 1;
  const receiptPrefix = watch('receiptPrefix') || '';
  const taxEnabled = watch('taxEnabled') ?? false;
  const gstRate = Number(watch('gstRate')) || 0;
  const gstApplicableOn = watch('gstApplicableOn') || 'all';

  // Force auto-open sections that have validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setOpenSections(prev => {
        const next = { ...prev };
        let updated = false;

        // Section 0 numbering errors
        if (errors.invoicePrefix || errors.invoiceStartNumber || errors.bookingPrefix || errors.bookingStartNumber || errors.receiptPrefix) {
          if (!next[0]) { next[0] = true; updated = true; }
        }
        // Section 1 locale errors
        if (errors.currency || errors.currencySymbol || errors.dateFormat || errors.timeFormat || errors.timezone) {
          if (!next[1]) { next[1] = true; updated = true; }
        }
        // Section 2 GST tax errors
        if (errors.taxEnabled || errors.gstRate || errors.gstApplicableOn || errors.invoiceFooterNote || errors.termsAndConditions) {
          if (!next[2]) { next[2] = true; updated = true; }
        }
        // Section 3 Invoice template errors
        if (errors.invoiceTemplate) {
          if (!next[3]) { next[3] = true; updated = true; }
        }

        return updated ? next : prev;
      });
    }
  }, [errors]);

  // Sync state when API settings load
  useEffect(() => {
    if (settings) {
      const initialValues: SettingsFormValues = {
        invoicePrefix: settings.invoicePrefix,
        bookingPrefix: settings.bookingPrefix,
        receiptPrefix: settings.receiptPrefix,
        invoiceStartNumber: settings.invoiceStartNumber,
        bookingStartNumber: settings.bookingStartNumber,
        currency: settings.currency || 'INR',
        currencySymbol: settings.currencySymbol || '₹',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        timeFormat: settings.timeFormat || '12h',
        timezone: settings.timezone || 'Asia/Kolkata',
        taxEnabled: settings.taxEnabled ?? false,
        gstRate: settings.gstRate ?? 18,
        gstApplicableOn: settings.gstApplicableOn || 'all',
        autoInvoice: settings.autoInvoice ?? false,
        invoiceFooterNote: settings.invoiceFooterNote || '',
        termsAndConditions: settings.termsAndConditions || '',
        invoiceTemplate: settings.invoiceTemplate || 'classic',
        notifications: settings.notifications || {
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
        bookingSettings: settings.bookingSettings || {
          requireAdvancePayment: true,
          minimumAdvancePercent: 25,
          allowDoubleBooking: false,
          bookingCancellationHours: 48,
          defaultBookingDurationHours: 12,
          workingHoursStart: '08:00',
          workingHoursEnd: '23:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      };

      reset(initialValues);

      // Restore draft if present
      const savedDraft = localStorage.getItem(getDraftKey());
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          reset(parsed);
          toast.info('Restored unsaved settings draft from local cache');
        } catch {
          // ignore corrupted JSON
        }
      }
    }
  }, [settings, reset]);

  // Autosave draft to localStorage
  useEffect(() => {
    if (isDirty && Object.keys(watchedValues).length > 0) {
      const delay = setTimeout(() => {
        localStorage.setItem(getDraftKey(), JSON.stringify(watchedValues));
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [watchedValues, isDirty]);

  const onSubmitForm = async (values: SettingsFormValues) => {
    try {
      await updateSettingsMutation.mutateAsync(values);
      localStorage.removeItem(getDraftKey());
      reset(values); // Reset dirty checks
    } catch {
      // Handled in query hook
    }
  };

  const handleDiscardChanges = () => {
    if (confirm('Discard all unsaved general settings modifications?')) {
      localStorage.removeItem(getDraftKey());
      if (settings) {
        reset({
          invoicePrefix: settings.invoicePrefix,
          bookingPrefix: settings.bookingPrefix,
          receiptPrefix: settings.receiptPrefix,
          invoiceStartNumber: settings.invoiceStartNumber,
          bookingStartNumber: settings.bookingStartNumber,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          timezone: settings.timezone,
          taxEnabled: settings.taxEnabled,
          gstRate: settings.gstRate,
          gstApplicableOn: settings.gstApplicableOn,
          autoInvoice: settings.autoInvoice,
          invoiceFooterNote: settings.invoiceFooterNote,
          termsAndConditions: settings.termsAndConditions,
          invoiceTemplate: settings.invoiceTemplate || 'classic',
          notifications: settings.notifications,
          bookingSettings: settings.bookingSettings,
        });
      }
    }
  };

  const handleResetToDefaults = async () => {
    const systemDefaults: Omit<HallSettings, 'id' | 'hallId' | 'updatedAt'> = {
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
      gstApplicableOn: 'all',
      autoInvoice: true,
      invoiceFooterNote: 'Thank you for choosing Vasantha Mahal. We hope to make your event memorable!',
      termsAndConditions: '1. Advance payment is non-refundable on cancellation within 30 days of event.\n2. Music and loudspeakers are strictly prohibited after 10:00 PM.\n3. Safe deposits are required for extra damage liability coverage.',
      invoiceTemplate: 'classic',
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
      }
    };

    try {
      await updateSettingsMutation.mutateAsync(systemDefaults);
      localStorage.removeItem(getDraftKey());
      reset(systemDefaults);
      toast.success('Successfully restored configurations to system defaults');
    } catch {
      toast.error('Failed to reset configurations');
    }
  };

  if (queryLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-white border border-gray-100 rounded-xl p-5" />
        <div className="h-20 bg-white border border-gray-100 rounded-xl p-5" />
        <div className="h-20 bg-white border border-gray-100 rounded-xl p-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-md mx-auto">
        <XCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Error Loading Settings</h3>
        <p className="text-xs text-gray-450 mt-1">Failed to fetch settings from the API service. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">General Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure serial prefix parameters, tax rules, reservation policies, and notification schedules.</p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping shrink-0" />
              <span>Unsaved Changes</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit(onSubmitForm)}
            disabled={!isDirty || updateSettingsMutation.isPending}
            className="px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        {/* Section 1: Numbering & Prefixes */}
        <AccordionSection
          index={0}
          isOpen={openSections[0]}
          onToggle={() => toggleSection(0)}
          title="Document Numbering & Prefixes"
          description="Customize serial parameters for bills, bookings contracts, and ledger entries."
          icon={Hash}
          hasError={!!(errors.invoicePrefix || errors.invoiceStartNumber || errors.bookingPrefix || errors.bookingStartNumber || errors.receiptPrefix)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Invoice Prefix */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Prefix</label>
              <input
                type="text"
                {...register('invoicePrefix')}
                className={`px-3 py-2 w-full border rounded-lg focus:ring-1 focus:ring-violet-500 uppercase ${
                  errors.invoicePrefix ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.invoicePrefix && <p className="text-[10px] text-red-500 font-semibold">{errors.invoicePrefix.message}</p>}
            </div>

            {/* Invoice Start Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Start Number</label>
              <input
                type="number"
                {...register('invoiceStartNumber')}
                className={`px-3 py-2 w-full border rounded-lg focus:ring-1 focus:ring-violet-500 ${
                  errors.invoiceStartNumber ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.invoiceStartNumber && <p className="text-[10px] text-red-500 font-semibold">{errors.invoiceStartNumber.message}</p>}
            </div>

            {/* Booking Prefix */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Booking Prefix</label>
              <input
                type="text"
                {...register('bookingPrefix')}
                className={`px-3 py-2 w-full border rounded-lg focus:ring-1 focus:ring-violet-500 uppercase ${
                  errors.bookingPrefix ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.bookingPrefix && <p className="text-[10px] text-red-500 font-semibold">{errors.bookingPrefix.message}</p>}
            </div>

            {/* Booking Start Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Booking Start Number</label>
              <input
                type="number"
                {...register('bookingStartNumber')}
                className={`px-3 py-2 w-full border rounded-lg focus:ring-1 focus:ring-violet-500 ${
                  errors.bookingStartNumber ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.bookingStartNumber && <p className="text-[10px] text-red-500 font-semibold">{errors.bookingStartNumber.message}</p>}
            </div>

            {/* Receipt Prefix */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Receipt Prefix</label>
              <input
                type="text"
                {...register('receiptPrefix')}
                className={`px-3 py-2 w-full border rounded-lg focus:ring-1 focus:ring-violet-500 uppercase ${
                  errors.receiptPrefix ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.receiptPrefix && <p className="text-[10px] text-red-500 font-semibold">{errors.receiptPrefix.message}</p>}
            </div>
          </div>

          <NumberingPreview
            invoicePrefix={invoicePrefix}
            invoiceStartNumber={invoiceStartNumber}
            bookingPrefix={bookingPrefix}
            bookingStartNumber={bookingStartNumber}
            receiptPrefix={receiptPrefix}
            receiptStartNumber={1}
          />
        </AccordionSection>

        {/* Section 2: Date, Time & Locale */}
        <AccordionSection
          index={1}
          isOpen={openSections[1]}
          onToggle={() => toggleSection(1)}
          title="Date, Time & Locale"
          description="Adjust timezone standards, currencies displaying, and formatting patterns."
          icon={Globe}
          hasError={!!(errors.currency || errors.currencySymbol || errors.dateFormat || errors.timeFormat || errors.timezone)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Timezone */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">System Timezone</label>
              <select
                {...register('timezone')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="Asia/Kolkata">India Standard Time (IST - Asia/Kolkata)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="Asia/Dubai">Gulf Standard Time (GST - Asia/Dubai)</option>
                <option value="Asia/Singapore">Singapore Standard Time (SST - Asia/Singapore)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT/BST - Europe/London)</option>
                <option value="America/New_York">Eastern Standard Time (EST/EDT - America/New_York)</option>
                <option value="America/Los_Angeles">Pacific Standard Time (PST/PDT - America/Los_Angeles)</option>
              </select>
            </div>

            {/* Currency Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Operational Currency</label>
              <select
                {...register('currency')}
                onChange={(e) => {
                  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED' };
                  setValue('currency', e.target.value, { shouldDirty: true });
                  setValue('currencySymbol', symbols[e.target.value] || '₹', { shouldDirty: true });
                }}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="AED">UAE Dirham (AED)</option>
              </select>
            </div>

            {/* Currency Symbol Preview */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Currency Symbol</label>
              <input
                type="text"
                readOnly
                {...register('currencySymbol')}
                className="px-3 py-2 w-full border border-gray-200 bg-gray-50 text-gray-400 font-bold rounded-lg text-xs"
              />
            </div>

            {/* Date Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Date Display Format</label>
              <select
                {...register('dateFormat')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 06/06/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 06/06/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-06-06)</option>
              </select>
            </div>

            {/* Time Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Time Format</label>
              <select
                {...register('timeFormat')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="12h">12-Hour Format (AM/PM)</option>
                <option value="24h">24-Hour Format</option>
              </select>
            </div>
          </div>
        </AccordionSection>



        {/* Section 8: Invoice & Receipt Custom Templates */}
        <AccordionSection
          index={3}
          isOpen={openSections[3] ?? false}
          onToggle={() => toggleSection(3)}
          title="Invoice & Receipt Custom Templates"
          description="Select the layout design pattern for printable billing invoices and receipt notes."
          icon={FileText}
          hasError={!!errors.invoiceTemplate}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Select Template Style</h4>
              {!isPremium && !isCheckingPremium && (
                <span className="text-[9px] font-extrabold text-violet-750 bg-violet-50 border border-violet-150 px-2.5 py-0.5 rounded-full">
                  Basic Plan: Classic Only
                </span>
              )}
            </div>

            <Controller
              name="invoiceTemplate"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((tpl) => {
                    const isLocked = tpl.isPremium && !isPremium;
                    const isSelected = field.value === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          if (isLocked) {
                            toast.error("Premium Layout Locked", {
                              description: "Please upgrade to a Premium plan to unlock custom invoice templates.",
                            });
                            return;
                          }
                          field.onChange(tpl.id);
                        }}
                        className={`relative border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'border-violet-600 ring-2 ring-violet-100 bg-violet-50/5'
                            : 'border-gray-200 hover:border-gray-305 hover:shadow-sm bg-white'
                        } ${isLocked ? 'opacity-80' : ''}`}
                      >
                        {/* Preview Block */}
                        <div className="h-28 w-full border border-gray-150 rounded-lg bg-gray-50/50 flex flex-col justify-between p-3.5 mb-3 shadow-inner overflow-hidden select-none">
                          {tpl.previewHtml}
                        </div>

                        {/* Title and details */}
                        <div className="flex items-start justify-between gap-2 flex-1">
                          <div className="flex-1">
                            <span className="font-bold text-xs text-gray-900 block">{tpl.name}</span>
                            <span className="text-[10px] text-gray-450 font-medium leading-relaxed block mt-0.5">{tpl.description}</span>
                          </div>
                          {tpl.isPremium && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                              isPremium
                                ? 'text-violet-750 bg-violet-50 border-violet-150'
                                : 'text-gray-500 bg-gray-50 border-gray-200'
                            }`}>
                              Premium
                            </span>
                          )}
                        </div>

                        {/* Preview button */}
                        <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex justify-between items-center relative z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplateId(tpl.id);
                            }}
                            className="text-[10px] font-extrabold text-violet-650 hover:text-violet-850 transition-colors flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 border border-gray-200 hover:border-gray-300 rounded-md shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview Layout</span>
                          </button>
                        </div>

                        {/* Lock Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-white/70 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-3 text-center transition-all duration-200 group">
                            <div className="h-8 w-8 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-800 border border-slate-900/10 mb-1.5 transition-transform group-hover:scale-105">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">Premium Template</span>
                            <span className="text-[9px] font-semibold text-slate-500 mt-0.5 mb-2">Upgrade plan to unlock</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </AccordionSection>

        {user?.role === 'owner' && (
          <AccordionSection
            index={4}
            isOpen={openSections[4] ?? false}
            onToggle={() => toggleSection(4)}
            title="Multi-Hall Workspace Settings"
            description="Manage multiple wedding halls, configure shared vs separate staff, and link secondary venues."
            icon={Globe}
          >
            {isCheckingPremium ? (
              <div className="h-20 flex items-center justify-center text-xs text-gray-500 font-semibold animate-pulse">
                Verifying workspace premium entitlements...
              </div>
            ) : !isPremium ? (
              <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-5 text-center space-y-3">
                <Globe className="h-8 w-8 text-violet-500 mx-auto" />
                <h3 className="font-bold text-gray-900 text-sm">Upgrade to Premium Plan</h3>
                <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                  Multi-hall workspace management (running up to 2 halls under a single login) is exclusively available to **Premium plan** subscribers. Upgrade your subscription to unlock this feature.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Toggle Multi-Hall */}
                <div className="p-4.5 bg-gradient-to-br from-violet-50/70 to-blue-50/40 border border-violet-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-violet-700 bg-violet-100 border border-violet-200 px-1.5 py-0.5 rounded uppercase tracking-wider mb-1">
                        Premium SaaS Tool
                      </span>
                      <h4 className="text-xs font-black text-slate-800">
                        Enable Multi-Hall Workspace
                      </h4>
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed max-w-md">
                        Allows you to add a secondary hall and switch between them seamlessly from your dashboard switcher dropdown.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2 scale-110">
                      <input
                        type="checkbox"
                        checked={multiHallEnabled}
                        onChange={(e) => handleToggleMultiHall(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-600 shadow-inner" />
                    </label>
                  </div>
                </div>

                {multiHallEnabled && (
                  <div className="pt-4 border-t border-gray-100 space-y-6">
                    {/* 2. Toggle Different Staff */}
                    <SettingsToggleRow
                      title="Separate Staff Management"
                      description="When enabled, staff accounts are locked to the hall they were created in. When disabled, your staff is shared and can access both halls."
                      checked={differentStaff}
                      onChange={handleToggleDifferentStaff}
                    />

                    {/* 3. List current halls */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Your Managed Halls</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        {user.accessible_halls?.map((hall: any, index: number) => {
                          const isActive = hall.id === activeHallId || (!activeHallId && hall.id === user.hall_id);
                          return (
                            <div key={hall.id} className="p-4 border border-gray-150 bg-gray-50/50 rounded-xl flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-gray-800 font-extrabold text-sm">{hall.hall_name}</span>
                                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider mt-0.5">
                                    {hall.id === user.hall_id
                                      ? "Venue #1 (Primary - Admin Created)"
                                      : "Venue #2 (Secondary - Owner Created)"}
                                  </span>
                                </div>
                                {isActive ? (
                                  <span className="text-[9px] font-black text-green-700 bg-green-50 border border-green-150 px-2.5 py-1 rounded uppercase tracking-wider">
                                    Active
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setActiveHall(hall.id)}
                                    className="text-[9px] font-black text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1 rounded uppercase cursor-pointer transition-all tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                                  >
                                    Switch Hall
                                  </button>
                                )}
                              </div>

                              {/* Owner & Package Metadata Details */}
                              <div className="border-t border-gray-200/60 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-gray-550 font-semibold leading-relaxed">
                                <div>
                                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Owner Name</span>
                                  <span className="text-gray-750 font-extrabold">{user.name}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Owner Email</span>
                                  <span className="text-gray-750 font-extrabold truncate block max-w-[130px]">{user.email}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Active Plan</span>
                                  <span className="text-primary-light font-extrabold">{activePackage?.name || 'Premium Plan'}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Expires On</span>
                                  <span className="text-gray-750 font-extrabold font-mono">
                                    {subscription?.end_date ? formatDate(subscription.end_date) : 'Unlimited'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Form to add second hall (if less than 2 halls) */}
                    {(user.accessible_halls?.length || 0) < 2 && (
                      <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl space-y-4">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-gray-900 text-sm">Register Secondary Hall</h4>
                          <p className="text-[11px] text-gray-450 font-medium">Add a second wedding hall profile to start managing bookings and invoices for it.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Hall Name</label>
                            <input
                              type="text"
                              value={newHallName}
                              onChange={(e) => setNewHallName(e.target.value)}
                              placeholder="e.g. Royal Palace Hall"
                              className="px-3 py-2 w-full border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Phone Number</label>
                            <input
                              type="text"
                              value={newHallPhone}
                              onChange={(e) => setNewHallPhone(e.target.value)}
                              placeholder="e.g. +91 98765 43210"
                              className="px-3 py-2 w-full border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                            <input
                              type="email"
                              value={newHallEmail}
                              onChange={(e) => setNewHallEmail(e.target.value)}
                              placeholder="e.g. contact@hall.com"
                              className="px-3 py-2 w-full border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">City</label>
                            <input
                              type="text"
                              value={newHallCity}
                              onChange={(e) => setNewHallCity(e.target.value)}
                              placeholder="e.g. Chennai"
                              className="px-3 py-2 w-full border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Complete Address</label>
                            <input
                              type="text"
                              value={newHallAddress}
                              onChange={(e) => setNewHallAddress(e.target.value)}
                              placeholder="e.g. 123 Main St, Near Central Station"
                              className="px-3 py-2 w-full border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRegisterSecondHall}
                          disabled={isRegisteringHall || !newHallName}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer block w-full sm:w-auto text-center"
                        >
                          {isRegisteringHall ? 'Registering...' : 'Register Hall'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </AccordionSection>
        )}




        {/* Bottom Save bar */}
        <SettingsSaveBar
          onSave={handleSubmit(onSubmitForm)}
          onCancel={handleDiscardChanges}
          isDirty={isDirty}
          isSaving={updateSettingsMutation.isPending}
          title="Save Settings Configurations"
        />
      </div>

      {/* Invoice Preview Modal */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setPreviewTemplateId(null)}
          />
          <div className="relative w-full max-w-4xl bg-gray-150 rounded-2xl shadow-premium border border-gray-200 overflow-hidden z-10 animate-fadeIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Template Design Live Preview
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                  Visualizing design: <span className="font-extrabold text-violet-650 capitalize">{previewTemplateId}</span> Layout (Sample Wedding Data)
                </p>
              </div>
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-655 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Preview Area (Simulating print container) */}
            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-gray-50">
              <div className="bg-white w-full max-w-[800px] border border-gray-200 rounded-xl p-8 shadow-sm relative text-xs text-gray-700 min-h-[700px] flex flex-col justify-between">
                
                {previewTemplateId === 'classic' && (
                  <div className="font-sans w-full select-text">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="h-10 w-32 bg-gray-100 border border-gray-200 rounded mb-2 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">VM Logo</div>
                        <div className="text-base font-bold text-gray-800">Vasantha Mahal AC</div>
                        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          102, G.N. Chetty Road, T. Nagar, Chennai - 600017<br/>
                          Phone: +91 44 2815 6789<br/>
                          Email: info@vasanthamahal.in<br/>
                          GSTIN: 33AABCV1234F1Z1
                        </div>
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                        <p className="font-bold text-xs text-gray-600 mt-1">#INV-2026-0089</p>
                        <p className="text-[11px] text-gray-500 mt-1">Date: 10/06/2026</p>
                        <p className="text-[11px] text-gray-500">Due: 20/06/2026</p>
                        <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-amber-50 text-amber-700 border-amber-200">
                          partial paid
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-200 my-6" />

                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</div>
                        <div className="font-bold text-xs text-gray-800">Sneha & Rahul</div>
                        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Phone: +91 98401 23456<br/>
                          Email: sneha.rahul@gmail.com<br/>
                          No 45, Sterling Road, Nungambakkam, Chennai - 600034
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Event Details</div>
                        <div className="font-bold text-xs text-gray-800">Grand Wedding Reception</div>
                        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Date: 18/06/2026 to 19/06/2026<br/>
                          Type: Marriage Function<br/>
                          Section: Main AC Banquet Hall
                        </div>
                      </div>
                    </div>

                    <table className="w-full border-collapse mb-6 text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-600 text-[10px] uppercase font-bold">
                          <th className="p-3">Description</th>
                          <th className="p-3 text-center w-16">Qty</th>
                          <th className="p-3 text-right w-28">Unit Price</th>
                          <th className="p-3 text-right w-32">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        <tr className="text-xs">
                          <td className="p-3 text-gray-800 font-semibold">Base Hall Rental Charge (12 hours slot)</td>
                          <td className="p-3 text-center text-gray-505">1</td>
                          <td className="p-3 text-right text-gray-500 font-mono">₹1,50,000.00</td>
                          <td className="p-3 text-right text-gray-850 font-bold font-mono">₹1,50,000.00</td>
                        </tr>
                        <tr className="text-xs">
                          <td className="p-3 text-gray-800 font-semibold">Luxury Stage Decoration & lighting theme</td>
                          <td className="p-3 text-center text-gray-505">1</td>
                          <td className="p-3 text-right text-gray-500 font-mono">₹45,000.00</td>
                          <td className="p-3 text-right text-gray-850 font-bold font-mono">₹45,000.00</td>
                        </tr>
                        <tr className="text-xs">
                          <td className="p-3 text-gray-800 font-semibold">Standard Catering Service (250 Guests plate charge)</td>
                          <td className="p-3 text-center text-gray-505">1</td>
                          <td className="p-3 text-right text-gray-500 font-mono">₹1,25,000.00</td>
                          <td className="p-3 text-right text-gray-850 font-bold font-mono">₹1,25,000.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between items-start mt-8">
                      <div className="flex-1 max-w-sm text-xs text-gray-500 leading-relaxed pr-6">
                        <div className="bg-slate-50 border-l-4 border-slate-700 p-3.5 rounded-r-lg font-semibold">
                          <span className="font-bold text-slate-800 block mb-1">Notes:</span>
                          Thank you for choosing Vasantha Mahal. We are committed to making your special occasion absolutely memorable!
                        </div>
                      </div>
                      <div className="w-64">
                        <table className="w-full text-xs text-gray-605 font-bold">
                          <tbody>
                            <tr>
                              <td className="py-1.5 text-gray-500">Subtotal</td>
                              <td className="py-1.5 text-right font-mono">₹3,20,000.00</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-red-650">Discount</td>
                              <td className="py-1.5 text-right text-red-650 font-mono">- ₹20,000.00</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-gray-500">GST (18%)</td>
                              <td className="py-1.5 text-right font-mono">₹54,000.00</td>
                            </tr>
                            <tr className="border-t border-slate-300 font-bold text-gray-855 text-sm">
                              <td className="py-2.5">Total</td>
                              <td className="py-2.5 text-right font-mono">₹3,54,000.00</td>
                            </tr>
                            <tr className="text-green-700 font-bold">
                              <td className="py-1.5">Amount Paid</td>
                              <td className="py-1.5 text-right font-mono">- ₹1,00,000.00</td>
                            </tr>
                            <tr className="border-t-2 border-slate-700 font-black text-[#159DFC] text-base">
                              <td className="py-3">Balance Due</td>
                              <td className="py-3 text-right font-mono">₹2,54,000.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-center text-[9px] text-gray-400 font-bold tracking-wider uppercase">
                      <span>Powered by <strong className="text-gray-500">Infovex Halls</strong> — Venue CRM & ERP</span>
                      <span>by <strong className="text-gray-500">Infovex Technologies</strong></span>
                    </div>
                  </div>
                )}

                {previewTemplateId === 'modern' && (
                  <div className="font-sans w-full select-text">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl mb-3 flex items-center justify-center text-white font-extrabold text-base shadow-sm">V</div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Vasantha Mahal AC</h1>
                        <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-semibold">
                          102, G.N. Chetty Road, T. Nagar, Chennai - 600017<br/>
                          Phone: +91 44 2815 6789 • Email: info@vasanthamahal.in<br/>
                          <strong>GSTIN:</strong> 33AABCV1234F1Z1
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          partial paid
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2.5">INVOICE</h2>
                        <p className="text-xs font-mono font-bold text-slate-500 mt-1"># INV-2026-0089</p>
                        <div className="mt-4 text-[10px] text-slate-455 leading-relaxed font-bold">
                          Date: <span className="text-slate-800 font-mono">10/06/2026</span><br/>
                          Due: <span className="text-slate-800 font-mono">20/06/2026</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <h4 className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1.5">Bill To</h4>
                        <div className="font-extrabold text-xs text-slate-850">Sneha & Rahul</div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                          Phone: +91 98401 23456<br/>
                          Email: sneha.rahul@gmail.com<br/>
                          No 45, Sterling Road, Nungambakkam, Chennai - 600034
                        </p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <h4 className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest mb-1.5">Event Specification</h4>
                        <div className="font-extrabold text-xs text-slate-850 font-bold">Grand Wedding Reception</div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                          Muhurtham: 18/06/2026 to 19/06/2026<br/>
                          Type: Marriage Function<br/>
                          Section: Main AC Banquet Hall
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-6">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                            <th className="p-3.5">Item Description</th>
                            <th className="p-3.5 text-center w-16">Qty</th>
                            <th className="p-3.5 text-right w-28">Unit Price</th>
                            <th className="p-3.5 text-right w-32">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50/20 text-xs">
                            <td className="p-3.5 text-slate-800 font-semibold">Base Hall Rental Charge (12 hours slot)</td>
                            <td className="p-3.5 text-center text-slate-450 font-bold">1</td>
                            <td className="p-3.5 text-right text-slate-500 font-mono">₹1,50,000.00</td>
                            <td className="p-3.5 text-right text-slate-855 font-extrabold font-mono">₹1,50,000.00</td>
                          </tr>
                          <tr className="hover:bg-slate-50/20 text-xs">
                            <td className="p-3.5 text-slate-800 font-semibold">Luxury Stage Decoration & lighting theme</td>
                            <td className="p-3.5 text-center text-slate-450 font-bold">1</td>
                            <td className="p-3.5 text-right text-slate-500 font-mono">₹45,000.00</td>
                            <td className="p-3.5 text-right text-slate-855 font-extrabold font-mono">₹45,000.00</td>
                          </tr>
                          <tr className="hover:bg-slate-50/20 text-xs">
                            <td className="p-3.5 text-slate-800 font-semibold">Standard Catering Service (250 Guests plate charge)</td>
                            <td className="p-3.5 text-center text-slate-455 font-bold">1</td>
                            <td className="p-3.5 text-right text-slate-500 font-mono">₹1,25,000.00</td>
                            <td className="p-3.5 text-right text-slate-855 font-extrabold font-mono">₹1,25,000.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-start mt-8">
                      <div className="flex-1 max-w-sm pr-6">
                        <div className="bg-indigo-50/30 border-l-3 border-indigo-600 p-4 rounded-r-xl">
                          <span className="font-extrabold text-slate-850 block mb-1">Notes & Instructions:</span>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            Thank you for choosing Vasantha Mahal. We are committed to making your special occasion absolutely memorable!
                          </p>
                        </div>
                      </div>
                      <div className="w-64 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <table className="w-full text-xs text-slate-605 font-bold">
                          <tbody>
                            <tr>
                              <td className="py-1.5 text-slate-450">Subtotal</td>
                              <td className="py-1.5 text-right font-mono text-slate-800">₹3,20,000.00</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-red-650">Discount</td>
                              <td className="py-1.5 text-right text-red-650 font-mono">- ₹20,000.00</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 text-slate-450">GST (18%)</td>
                              <td className="py-1.5 text-right font-mono text-slate-800">₹54,000.00</td>
                            </tr>
                            <tr className="border-t border-slate-200 text-slate-855 font-extrabold text-sm">
                              <td className="py-2.5">Total</td>
                              <td className="py-2.5 text-right font-mono text-slate-900">₹3,54,000.00</td>
                            </tr>
                            <tr className="text-green-700">
                              <td className="py-1.5">Paid So Far</td>
                              <td className="py-1.5 text-right font-mono">- ₹1,00,000.00</td>
                            </tr>
                            <tr className="border-t border-dashed border-indigo-200 font-black text-indigo-650 text-base">
                              <td className="py-3">Balance Due</td>
                              <td className="py-3 text-right font-mono">₹2,54,000.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                      <span>Powered by <strong className="text-slate-650">Infovex Halls</strong> — Venue ERP</span>
                      <span>by <strong className="text-slate-650">Infovex Technologies</strong></span>
                    </div>
                  </div>
                )}

                {previewTemplateId === 'elegant' && (
                  <div className="font-serif w-full p-2 relative select-text">
                    <div className="border border-amber-300 p-6 rounded-lg bg-amber-50/5 relative">
                      <div className="absolute top-2 left-2 right-2 bottom-2 border border-amber-200/50 pointer-events-none" />
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                          <div className="text-lg font-bold text-slate-900 tracking-wide font-serif">Vasantha Mahal AC</div>
                          <div className="text-[10px] text-amber-800/80 font-serif italic mt-0.5 tracking-wider uppercase font-extrabold">Grand Wedding Venue</div>
                          <div className="text-[11px] text-slate-500 mt-2.5 leading-relaxed font-sans font-semibold">
                            102, G.N. Chetty Road, T. Nagar, Chennai - 600017<br/>
                            Phone: +91 44 2815 6789 • Email: info@vasanthamahal.in<br/>
                            <strong>GSTIN:</strong> 33AABCV1234F1Z1
                          </div>
                        </div>
                        <div className="text-right">
                          <h2 className="text-lg font-black text-amber-800/90 tracking-widest font-serif">RECEIPT INVOICE</h2>
                          <p className="text-xs font-serif font-bold text-amber-700/80 mt-1"># INV-2026-0089</p>
                          <div className="mt-4 text-[10px] text-slate-500 font-sans font-bold leading-relaxed">
                            Invoice Date: <span className="text-slate-800 font-mono">10/06/2026</span><br/>
                            Due Date: <span className="text-slate-800 font-mono">20/06/2026</span><br/>
                            Payment Status: <span className="text-amber-700 uppercase italic font-bold tracking-wider">PARTIAL PAID</span>
                          </div>
                        </div>
                      </div>

                      <hr className="border-t border-amber-200 my-5" />

                      <div className="grid grid-cols-2 gap-8 mb-6 relative z-10 font-sans">
                        <div>
                          <div className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest border-b border-amber-100 pb-1 mb-2">Prepared for Guest</div>
                          <div className="font-bold text-xs text-slate-850 font-serif">Sneha & Rahul</div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-semibold">
                            Phone: +91 98401 23456<br/>
                            Email: sneha.rahul@gmail.com<br/>
                            No 45, Sterling Road, Nungambakkam, Chennai - 600034
                          </p>
                        </div>
                        <div>
                          <div className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest border-b border-amber-100 pb-1 mb-2">Event Particulars</div>
                          <div className="font-bold text-xs text-slate-850 font-serif">Grand Wedding Reception</div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-semibold">
                            Muhurtham: 18/06/2026 to 19/06/2026<br/>
                            Vibe & Setup: Marriage Function<br/>
                            Venue Unit: Main AC Banquet Hall
                          </p>
                        </div>
                      </div>

                      <table className="w-full border-collapse mb-6 text-left relative z-10 font-sans">
                        <thead>
                          <tr className="border-t border-b-2 border-amber-300 text-slate-900 font-serif font-bold text-xs">
                            <th className="py-2.5 px-2">Description of Services & Venue Hires</th>
                            <th className="py-2.5 px-2 text-center w-16">Qty</th>
                            <th className="py-2.5 px-2 text-right w-28">Unit Rate</th>
                            <th className="py-2.5 px-2 text-right w-32">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          <tr className="text-xs">
                            <td className="py-3 px-2 text-slate-800 font-semibold font-serif">Base Hall Rental Charge (12 hours slot)</td>
                            <td className="py-3 px-2 text-center text-slate-505 font-medium">1</td>
                            <td className="py-3 px-2 text-right text-slate-500 font-mono">₹1,50,000.00</td>
                            <td className="py-3 px-2 text-right text-slate-850 font-extrabold font-serif">₹1,50,000.00</td>
                          </tr>
                          <tr className="text-xs">
                            <td className="py-3 px-2 text-slate-800 font-semibold font-serif">Luxury Stage Decoration & lighting theme</td>
                            <td className="py-3 px-2 text-center text-slate-505 font-medium">1</td>
                            <td className="py-3 px-2 text-right text-slate-500 font-mono">₹45,000.00</td>
                            <td className="py-3 px-2 text-right text-slate-850 font-extrabold font-serif">₹45,000.00</td>
                          </tr>
                          <tr className="text-xs">
                            <td className="py-3 px-2 text-slate-800 font-semibold font-serif">Standard Catering Service (250 Guests plate charge)</td>
                            <td className="py-3 px-2 text-center text-slate-505 font-medium">1</td>
                            <td className="py-3 px-2 text-right text-slate-500 font-mono">₹1,25,000.00</td>
                            <td className="py-3 px-2 text-right text-slate-850 font-extrabold font-serif">₹1,25,000.00</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="flex justify-between items-start mt-8 relative z-10 font-sans">
                        <div className="flex-1 max-w-sm pr-6 italic text-slate-500 text-[11px] font-serif">
                          * Note: Thank you for choosing Vasantha Mahal. We are committed to making your special occasion absolutely memorable!
                        </div>
                        <div className="w-64 text-xs font-bold text-slate-655">
                          <div className="flex justify-between py-1"><span>Subtotal</span><span className="font-mono">₹3,20,000.00</span></div>
                          <div className="flex justify-between py-1 text-red-650"><span>Adjusted Discount</span><span className="font-mono">- ₹20,000.00</span></div>
                          <div className="flex justify-between py-1"><span>GST Output Tax (18%)</span><span className="font-mono">₹54,000.00</span></div>
                          <div className="flex justify-between py-2 border-t border-b border-amber-300 font-serif text-sm text-slate-850 my-1">
                            <span>Total Charge</span><span>₹3,54,000.00</span>
                          </div>
                          <div className="flex justify-between py-1 text-green-700"><span>Total Receipts Logged</span><span className="font-mono">- ₹1,00,000.00</span></div>
                          <div className="flex justify-between py-2 border-b-2 border-amber-300 font-serif text-base text-amber-800">
                            <span>Pending Balance</span><span>₹2,54,000.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-12 relative z-10 font-serif text-[9px] uppercase tracking-wider text-amber-800">
                        <div className="border-t border-amber-300 w-44 text-center pt-2">Authorized Representative</div>
                        <div className="border-t border-amber-300 w-44 text-center pt-2">Client Signature</div>
                      </div>

                      <div className="mt-12 pt-4 border-t border-amber-300 flex justify-between items-center text-[9px] text-amber-800 font-sans font-bold tracking-widest uppercase relative z-10">
                        <span>Powered by Infovex Halls — Venue CRM</span>
                        <span>by Infovex Technologies</span>
                      </div>
                    </div>
                  </div>
                )}

                {previewTemplateId === 'minimalist' && (
                  <div className="font-mono text-xs text-gray-900 bg-white w-full select-text">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-base font-black tracking-tight uppercase">Vasantha Mahal AC</h1>
                        <div className="text-[10px] text-gray-500 mt-1 leading-normal font-mono font-medium">
                          102, G.N. Chetty Road, T. Nagar, Chennai - 600017<br/>
                          P: +91 44 2815 6789 • E: info@vasanthamahal.in<br/>
                          GSTIN: 33AABCV1234F1Z1
                        </div>
                      </div>
                      <div className="text-right">
                        <h2 className="text-lg font-light tracking-widest uppercase">INVOICE</h2>
                        <p className="font-bold text-[11px] mt-1"># INV-2026-0089</p>
                        <div className="mt-2.5">
                          <span className="inline-block border border-gray-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            partial paid
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-t border-gray-950 my-4" />

                    <div className="grid grid-cols-2 gap-8 mb-6 font-mono text-[10px] leading-relaxed">
                      <div>
                        <div className="font-bold uppercase text-gray-400 mb-1">Bill To:</div>
                        <strong className="text-gray-950">Sneha & Rahul</strong><br/>
                        Phone: +91 98401 23456<br/>
                        Email: sneha.rahul@gmail.com<br/>
                        No 45, Sterling Road, Nungambakkam, Chennai - 600034
                      </div>
                      <div className="text-right">
                        <div className="font-bold uppercase text-gray-400 mb-1">Metadata:</div>
                        <strong>Event:</strong> Grand Wedding Reception<br/>
                        <strong>Schedules:</strong> 18/06/2026<br/>
                        <strong>Created:</strong> 10/06/2026
                      </div>
                    </div>

                    <table className="w-full border-collapse mb-6 text-left">
                      <thead>
                        <tr className="border-b border-gray-950 text-gray-955 text-[10px] uppercase font-bold">
                          <th className="py-2 px-0 font-extrabold text-gray-900">Description</th>
                          <th className="py-2 px-0 text-center w-16 font-extrabold text-gray-900">Qty</th>
                          <th className="py-2 px-0 text-right w-24 font-extrabold text-gray-900">Price</th>
                          <th className="py-2 px-0 text-right w-28 font-extrabold text-gray-900">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="text-[11px]">
                          <td className="py-2.5 px-0 text-gray-955">Base Hall Rental Charge (12 hours slot)</td>
                          <td className="py-2.5 px-0 text-center text-gray-505">1</td>
                          <td className="py-2.5 px-0 text-right text-gray-500">₹1,50,000.00</td>
                          <td className="py-2.5 px-0 text-right text-gray-955 font-bold">₹1,50,000.00</td>
                        </tr>
                        <tr className="text-[11px]">
                          <td className="py-2.5 px-0 text-gray-955">Luxury Stage Decoration & lighting theme</td>
                          <td className="py-2.5 px-0 text-center text-gray-505">1</td>
                          <td className="py-2.5 px-0 text-right text-gray-500">₹45,000.00</td>
                          <td className="py-2.5 px-0 text-right text-gray-955 font-bold">₹45,000.00</td>
                        </tr>
                        <tr className="text-[11px]">
                          <td className="py-2.5 px-0 text-gray-955">Standard Catering Service (250 Guests plate charge)</td>
                          <td className="py-2.5 px-0 text-center text-gray-505">1</td>
                          <td className="py-2.5 px-0 text-right text-gray-500">₹1,25,000.00</td>
                          <td className="py-2.5 px-0 text-right text-gray-955 font-bold">₹1,25,000.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between items-start mt-6">
                      <div className="flex-1 max-w-sm text-[10px] text-gray-550 leading-normal pr-8 uppercase">
                        NOTE: Thank you for choosing Vasantha Mahal. We are committed to making your special occasion absolutely memorable!
                      </div>
                      <div className="w-60 font-mono">
                        <div className="flex justify-between py-1 text-[11px]"><span>Subtotal</span><span>₹3,20,000.00</span></div>
                        <div className="flex justify-between py-1 text-[11px] text-red-650"><span>Discount</span><span>- ₹20,000.00</span></div>
                        <div className="flex justify-between py-1 text-[11px]"><span>GST (18%)</span><span>₹54,000.00</span></div>
                        <div className="flex justify-between py-1.5 border-t border-gray-905 font-bold text-gray-955 text-xs">
                          <span>Total</span><span>₹3,54,000.00</span>
                        </div>
                        <div className="flex justify-between py-1 text-[11px] text-green-700"><span>Payments</span><span>- ₹1,00,000.00</span></div>
                        <div className="flex justify-between py-2 border-t border-dashed border-gray-300 font-bold text-xs text-gray-900">
                          <span>Balance Due</span><span>₹2,54,000.00</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-t border-gray-950 mt-12 mb-4" />

                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Powered by Infovex Halls — Venue CRM</span>
                      <span>by Infovex Technologies</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
