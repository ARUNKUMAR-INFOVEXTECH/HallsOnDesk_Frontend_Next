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
  useHallProfile
} from '@/hooks/useSettings';
import SettingsCard from '@/components/settings/SettingsCard';
import SettingsToggleRow from '@/components/settings/SettingsToggleRow';
import NumberingPreview from '@/components/settings/NumberingPreview';
import GstCalculatorPreview from '@/components/settings/GstCalculatorPreview';
import WorkingDaySelector from '@/components/settings/WorkingDaySelector';
import NotificationMatrix from '@/components/settings/NotificationMatrix';
import DangerZoneCard from '@/components/settings/DangerZoneCard';
import SettingsSaveBar from '@/components/settings/SettingsSaveBar';
import {
  Settings,
  Hash,
  Clock,
  Percent,
  Calendar,
  Bell,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  HelpCircle,
  FileText,
  Lock,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api/client';
import { useAuthStore } from '@/store/authStore';

const DRAFT_KEY = 'hod_settings_draft_general';

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

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,  // Numbering
    1: true,  // Locale
    2: true,  // Tax
    3: false, // Booking
    4: false, // Notifications
    5: false, // Danger Zone
    6: false, // Multi-Hall
  });

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const activeHallId = useAuthStore((state) => state.activeHallId);

  // Multi-hall state
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const [multiHallEnabled, setMultiHallEnabled] = useState(false);
  const [differentStaff, setDifferentStaff] = useState(false);

  // Secondary hall form state
  const [newHallName, setNewHallName] = useState('');
  const [newHallPhone, setNewHallPhone] = useState('');
  const [newHallEmail, setNewHallEmail] = useState('');
  const [newHallCity, setNewHallCity] = useState('');
  const [newHallAddress, setNewHallAddress] = useState('');
  const [isRegisteringHall, setIsRegisteringHall] = useState(false);

  // Fetch premium status & initialize settings
  useEffect(() => {
    if (user && user.role === 'owner') {
      setMultiHallEnabled(user.multi_hall_enabled || false);
      setDifferentStaff(user.different_staff_management || false);

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
        // Section 3 Booking policy errors
        if (errors.bookingSettings) {
          if (!next[3]) { next[3] = true; updated = true; }
        }
        // Section 4 Notifications matrix errors
        if (errors.notifications) {
          if (!next[4]) { next[4] = true; updated = true; }
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
      const savedDraft = localStorage.getItem(DRAFT_KEY);
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
        localStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues));
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [watchedValues, isDirty]);

  const onSubmitForm = async (values: SettingsFormValues) => {
    try {
      await updateSettingsMutation.mutateAsync(values);
      localStorage.removeItem(DRAFT_KEY);
      reset(values); // Reset dirty checks
    } catch {
      // Handled in query hook
    }
  };

  const handleDiscardChanges = () => {
    if (confirm('Discard all unsaved general settings modifications?')) {
      localStorage.removeItem(DRAFT_KEY);
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
      localStorage.removeItem(DRAFT_KEY);
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

        {/* Section 3: GST & Tax Configuration */}
        <AccordionSection
          index={2}
          isOpen={openSections[2]}
          onToggle={() => toggleSection(2)}
          title="GST & Tax Configurations"
          description="Manage automated tax rates and layout terms for printed invoices."
          icon={Percent}
          hasError={!!(errors.taxEnabled || errors.gstRate || errors.gstApplicableOn || errors.invoiceFooterNote || errors.termsAndConditions)}
        >
          {/* Tax toggle */}
          <Controller
            name="taxEnabled"
            control={control}
            render={({ field }) => (
              <SettingsToggleRow
                title="Enable GST Output Taxes"
                description="Automatically calculate and attach GST tax values to billing receipts."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* GST Rate */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">GST Tax Rate (%)</label>
              <select
                disabled={!taxEnabled}
                {...register('gstRate')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% (Concessional)</option>
                <option value={12}>12% (Standard Lower)</option>
                <option value={18}>18% (Standard Rate)</option>
                <option value={28}>28% (Luxury / Demerit)</option>
              </select>
            </div>

            {/* GST Scope */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Tax Application Scope</label>
              <select
                disabled={!taxEnabled}
                {...register('gstApplicableOn')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="all">Apply to all bills & services</option>
                <option value="bookings_only">Apply to Booking base charges only</option>
                <option value="custom">Manual tax overrides only</option>
              </select>
            </div>

            {/* Live GST Preview */}
            <div className="sm:col-span-2 pt-2">
              <GstCalculatorPreview
                taxEnabled={taxEnabled}
                gstRate={gstRate}
                gstApplicableOn={gstApplicableOn}
              />
            </div>

            {/* Automated Invoicing Toggle */}
            <div className="sm:col-span-2 pt-2">
              <Controller
                name="autoInvoice"
                control={control}
                render={({ field }) => (
                  <SettingsToggleRow
                    title="Auto-Generate Invoices on Booking Confirmation"
                    description="Instantly email and generate invoice records as soon as a booking turns active."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Invoice Footer Note */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Footer Note</label>
                <span className="text-[9px] text-gray-400 font-semibold">{watchedValues.invoiceFooterNote?.length || 0} / 200 chars</span>
              </div>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Thank you for choosing us! We hope to make your event memorable!"
                {...register('invoiceFooterNote')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-violet-500"
              />
              {errors.invoiceFooterNote && <p className="text-[10px] text-red-500 font-semibold">{errors.invoiceFooterNote.message}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Terms & Conditions</label>
                <span className="text-[9px] text-gray-400 font-semibold">{watchedValues.termsAndConditions?.length || 0} / 1000 chars</span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="e.g. 1. Advance deposits are non-refundable inside 30 days of the reservation schedule."
                {...register('termsAndConditions')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-violet-500 leading-relaxed"
              />
              {errors.termsAndConditions && <p className="text-[10px] text-red-500 font-semibold">{errors.termsAndConditions.message}</p>}
            </div>
          </div>
        </AccordionSection>

        {/* Section 4: Booking Policy & Work Hours */}
        <AccordionSection
          index={3}
          isOpen={openSections[3]}
          onToggle={() => toggleSection(3)}
          title="Booking configurations & Policies"
          description="Setup prepayment limits, double-booking blocks, and working operational calendars."
          icon={Calendar}
          hasError={!!errors.bookingSettings}
        >
          {/* Require Advance */}
          <Controller
            name="bookingSettings.requireAdvancePayment"
            control={control}
            render={({ field }) => (
              <SettingsToggleRow
                title="Require Upfront Advance Deposit"
                description="Require a partial deposit payment to lock in the reservation status."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Minimum Advance Deposit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Minimum Deposit Percentage (%)</label>
              <input
                type="number"
                disabled={!watchedValues.bookingSettings?.requireAdvancePayment}
                {...register('bookingSettings.minimumAdvancePercent')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.bookingSettings?.minimumAdvancePercent && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.bookingSettings.minimumAdvancePercent.message}</p>
              )}
            </div>

            {/* Cancellation Grace Window */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Cancellation Grace Period (Hours)</label>
              <input
                type="number"
                {...register('bookingSettings.bookingCancellationHours')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500"
              />
              {errors.bookingSettings?.bookingCancellationHours && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.bookingSettings.bookingCancellationHours.message}</p>
              )}
            </div>

            {/* Default Booking Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Default Reservation Duration (Hours)</label>
              <input
                type="number"
                {...register('bookingSettings.defaultBookingDurationHours')}
                className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500"
              />
              {errors.bookingSettings?.defaultBookingDurationHours && (
                <p className="text-[10px] text-red-500 font-semibold">{errors.bookingSettings.defaultBookingDurationHours.message}</p>
              )}
            </div>

            {/* Working Time Start / End */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Opening Time</label>
                <input
                  type="time"
                  {...register('bookingSettings.workingHoursStart')}
                  className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Closing Time</label>
                <input
                  type="time"
                  {...register('bookingSettings.workingHoursEnd')}
                  className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Allow Double Booking */}
            <div className="sm:col-span-2 pt-2">
              <Controller
                name="bookingSettings.allowDoubleBooking"
                control={control}
                render={({ field }) => (
                  <SettingsToggleRow
                    title="Allow Double Overlap Bookings"
                    description="Permit scheduling overlapping slots on the same venue hall section."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Working Days */}
            <div className="sm:col-span-2 pt-2">
              <Controller
                name="bookingSettings.workingDays"
                control={control}
                render={({ field }) => (
                  <WorkingDaySelector
                    selectedDays={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </AccordionSection>

        {/* Section 5: Notification Preferences */}
        <AccordionSection
          index={4}
          isOpen={openSections[4]}
          onToggle={() => toggleSection(4)}
          title="Notification Matrix Preferences"
          description="Map SMS, email alerts, and WhatsApp schedules triggers for client activities."
          icon={Bell}
          hasError={!!errors.notifications}
        >
          <Controller
            name="notifications"
            control={control}
            render={({ field }) => (
              <NotificationMatrix
                values={field.value || {
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
                }}
                onChange={(updated) => field.onChange({ ...field.value, ...updated })}
                emailContact={profile?.email}
                phoneContact={profile?.phone}
              />
            )}
          />

          {watchedValues.notifications?.dailySummaryEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 border border-gray-150 rounded-xl mt-4">
              <div className="space-y-1.5 text-xs font-semibold text-gray-700">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Daily Agenda Send Time</label>
                <input
                  type="time"
                  {...register('notifications.dailySummaryTime')}
                  className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-gray-700">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Pre-booking Reminder Alert (Days Before)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  {...register('notifications.bookingReminderDaysBefore')}
                  className="px-3 py-2 w-full border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-violet-500"
                />
                {errors.notifications?.bookingReminderDaysBefore && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.notifications.bookingReminderDaysBefore.message}</p>
                )}
              </div>
            </div>
          )}
        </AccordionSection>

        {/* Section 6: Danger Zone */}
        <AccordionSection
          index={5}
          isOpen={openSections[5]}
          onToggle={() => toggleSection(5)}
          title="Danger Control Center"
          description="Revert parameters to default clean configurations or manage data erasures."
          icon={AlertTriangle}
        >
          <DangerZoneCard onReset={handleResetToDefaults} />
        </AccordionSection>

        {/* Section 7: Multi-Hall Management */}
        {user?.role === 'owner' && (
          <AccordionSection
            index={6}
            isOpen={openSections[6] ?? false}
            onToggle={() => toggleSection(6)}
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
                <SettingsToggleRow
                  title="Enable Multi-Hall Workspace"
                  description="Allows you to add a secondary hall and switch between them seamlessly from your dashboard switcher."
                  checked={multiHallEnabled}
                  onChange={handleToggleMultiHall}
                />

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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                        {user.accessible_halls?.map((hall: any) => {
                          const isActive = hall.id === activeHallId || (!activeHallId && hall.id === user.hall_id);
                          return (
                            <div key={hall.id} className="p-3 border border-gray-150 bg-gray-50/50 rounded-lg flex items-center justify-between">
                              <span className="text-gray-800 font-bold">{hall.hall_name}</span>
                              {isActive ? (
                                <span className="text-[9px] font-extrabold text-green-700 bg-green-50 border border-green-150 px-1.5 py-0.5 rounded uppercase">
                                  Current
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold text-slate-500 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded uppercase">
                                  Linked
                                </span>
                              )}
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
    </div>
  );
}
