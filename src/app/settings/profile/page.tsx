'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hallProfileSchema } from '@/schemas/settings.schema';
import { HallProfile, HallSection } from '@/types/settings';
import {
  useHallProfile,
  useUpdateHallProfile,
  useUploadLogo,
  useUploadCoverImage
} from '@/hooks/useSettings';
import SettingsCard from '@/components/settings/SettingsCard';
import ImageUploader from '@/components/settings/ImageUploader';
import HallSectionManager from '@/components/settings/HallSectionManager';
import SettingsSaveBar from '@/components/settings/SettingsSaveBar';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  QrCode,
  Sparkles,
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const DRAFT_KEY = 'hod_settings_draft_profile';

export default function HallProfilePage() {
  const { data: profile, isLoading: queryLoading, isError } = useHallProfile();
  const updateProfileMutation = useUpdateHallProfile();
  
  const uploadLogoMutation = useUploadLogo();
  const uploadCoverMutation = useUploadCoverImage();

  const [showAccount, setShowAccount] = useState(false);
  const [gstValidState, setGstValidState] = useState<'none' | 'valid' | 'invalid'>('none');
  const [panValidState, setPanValidState] = useState<'none' | 'valid' | 'invalid'>('none');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<Omit<HallProfile, 'id' | 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(hallProfileSchema),
  });

  const watchedValues = watch();
  const gstNumber = watch('gstNumber');
  const panNumber = watch('panNumber');
  const upiId = watch('upiId');
  const logoUrl = watch('logoUrl');
  const coverImageUrl = watch('coverImageUrl');
  const hallSections = watch('hallSections') || [];

  // Reset form when profile hydrates
  useEffect(() => {
    if (profile) {
      reset({
        hallName: profile.hallName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        alternatePhone: profile.alternatePhone || '',
        email: profile.email,
        website: profile.website || '',
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        country: profile.country || 'India',
        description: profile.description || '',
        establishedYear: profile.establishedYear,
        totalCapacity: profile.totalCapacity,
        gstNumber: profile.gstNumber || '',
        panNumber: profile.panNumber || '',
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
        ifscCode: profile.ifscCode || '',
        upiId: profile.upiId || '',
        logoUrl: profile.logoUrl || '',
        coverImageUrl: profile.coverImageUrl || '',
        hallSections: profile.hallSections || [],
      });

      // Restore unsaved draft if present
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Only restore if different
          reset(parsed);
          toast.info('Restored unsaved draft configurations from local cache');
        } catch {
          // ignore corrupted JSON
        }
      }
    }
  }, [profile, reset]);

  // Save draft to localStorage on form changes
  useEffect(() => {
    if (isDirty && Object.keys(watchedValues).length > 0) {
      const delay = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues));
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [watchedValues, isDirty]);

  // Live validate GST & PAN
  useEffect(() => {
    if (!gstNumber) {
      setGstValidState('none');
    } else {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      setGstValidState(gstRegex.test(gstNumber) ? 'valid' : 'invalid');
    }
  }, [gstNumber]);

  useEffect(() => {
    if (!panNumber) {
      setPanValidState('none');
    } else {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      setPanValidState(panRegex.test(panNumber) ? 'valid' : 'invalid');
    }
  }, [panNumber]);

  const onSubmitForm = async (values: any) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      localStorage.removeItem(DRAFT_KEY);
      reset(values); // clear dirty state
    } catch {
      // handled
    }
  };

  const handleDiscardChanges = () => {
    if (confirm('Discard all unsaved edits for your profile?')) {
      localStorage.removeItem(DRAFT_KEY);
      if (profile) {
        reset({
          hallName: profile.hallName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          alternatePhone: profile.alternatePhone || '',
          email: profile.email,
          website: profile.website || '',
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          country: profile.country || 'India',
          description: profile.description || '',
          establishedYear: profile.establishedYear,
          totalCapacity: profile.totalCapacity,
          gstNumber: profile.gstNumber || '',
          panNumber: profile.panNumber || '',
          bankName: profile.bankName || '',
          accountNumber: profile.accountNumber || '',
          ifscCode: profile.ifscCode || '',
          upiId: profile.upiId || '',
          logoUrl: profile.logoUrl || '',
          coverImageUrl: profile.coverImageUrl || '',
          hallSections: profile.hallSections || [],
        });
      }
    }
  };

  if (queryLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-48 bg-gray-200 rounded-xl w-full" />
        <div className="h-28 bg-white border border-gray-100 rounded-xl p-5" />
        <div className="h-56 bg-white border border-gray-100 rounded-xl p-5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-md mx-auto">
        <XCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Error Loading Profile</h3>
        <p className="text-xs text-gray-450 mt-1">Failed to contact the backend service. Check connections and try again.</p>
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
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Hall Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your branding, contact info, spaces capacity, and billing legal parameters.</p>
        </div>
        
        {/* Unsaved indicator dot */}
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
            disabled={!isDirty || updateProfileMutation.isPending}
            className="px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Section 1: Branding */}
        <SettingsCard title="Venue Branding" subtitle="Upload your venue's public cover display and branding logo icon." icon={Building2}>
          <div className="space-y-4">
            {/* Cover Image */}
            <Controller
              name="coverImageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  type="cover"
                  currentUrl={coverImageUrl}
                  isUploading={uploadCoverMutation.isUploading}
                  progress={uploadCoverMutation.progress}
                  onUpload={async (file) => {
                    const res = await uploadCoverMutation.mutateAsync({ file });
                    setValue('coverImageUrl', res.cover_image_url || '', { shouldDirty: true });
                  }}
                  onRemove={() => {
                    setValue('coverImageUrl', '', { shouldDirty: true });
                  }}
                />
              )}
            />

            {/* Logo Circle overlapping cover bottom edge conceptually, left aligned */}
            <div className="pl-4 flex items-end gap-5 -mt-10 relative z-10">
              <Controller
                name="logoUrl"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    type="logo"
                    currentUrl={logoUrl}
                    isUploading={uploadLogoMutation.isUploading}
                    progress={uploadLogoMutation.progress}
                    onUpload={async (file) => {
                      const res = await uploadLogoMutation.mutateAsync({ file });
                      setValue('logoUrl', res.logo_url || '', { shouldDirty: true });
                    }}
                    onRemove={() => {
                      setValue('logoUrl', '', { shouldDirty: true });
                    }}
                  />
                )}
              />
              <div className="pb-3">
                <span className="font-extrabold text-sm text-gray-900 block leading-tight">Branding Identity</span>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Logo dimensions: 200 x 200px, max 2MB.</p>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Section 2: Basic Info */}
        <SettingsCard title="Basic Information" subtitle="Public specifications and host descriptions." icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Hall Name */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Venue Name</label>
              <input
                type="text"
                {...register('hallName')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.hallName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.hallName && <p className="text-[10px] text-red-500 font-semibold">{errors.hallName.message}</p>}
            </div>

            {/* Owner Name */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Owner / Operator Name</label>
              <input
                type="text"
                {...register('ownerName')}
                className={`px-3 py-2.5 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.ownerName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.ownerName && <p className="text-[10px] text-red-500 font-semibold">{errors.ownerName.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Primary Phone</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                {...register('phone')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.phone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Alt Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Alternate Phone</label>
              <input
                type="tel"
                placeholder="Optional secondary phone"
                {...register('alternatePhone')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.alternatePhone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.alternatePhone && <p className="text-[10px] text-red-500 font-semibold">{errors.alternatePhone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Registered Email</label>
              <input
                type="email"
                {...register('email')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Website URL</label>
              <input
                type="text"
                placeholder="https://example.com"
                {...register('website')}
                className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.website ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.website && <p className="text-[10px] text-red-500 font-semibold">{errors.website.message}</p>}
            </div>

            {/* Established Year */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Established Year</label>
              <input
                type="number"
                placeholder="e.g. 2012"
                {...register('establishedYear')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.establishedYear ? 'border-red-400' : ''
                }`}
              />
              {errors.establishedYear && <p className="text-[10px] text-red-500 font-semibold">{errors.establishedYear.message}</p>}
            </div>

            {/* Total Capacity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Maximum Capacity</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                {...register('totalCapacity')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.totalCapacity ? 'border-red-400' : ''
                }`}
              />
              {errors.totalCapacity && <p className="text-[10px] text-red-500 font-semibold">{errors.totalCapacity.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5 col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Venue Description</label>
                <span className="text-[9px] text-gray-400 font-semibold">{watchedValues.description?.length || 0} / 500 chars</span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Describe your hall features, decorations, and facilities details..."
                {...register('description')}
                className={`px-3 py-2.5 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed`}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Section 3: Hall Sections */}
        <SettingsCard title="Hall Sub-sections" subtitle="Configure separate sections or dining halls for independent occupancy scheduling." icon={Building2}>
          <Controller
            name="hallSections"
            control={control}
            render={({ field }) => (
              <HallSectionManager
                sections={hallSections}
                onChange={(updated) => setValue('hallSections', updated, { shouldDirty: true })}
              />
            )}
          />
        </SettingsCard>

        {/* Section 4: Address */}
        <SettingsCard title="Physical Location & Address" subtitle="Ensure location details are accurate to render on printable billing receipts." icon={MapPin}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Address */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Location Address</label>
              <textarea
                rows={2}
                {...register('address')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed ${
                  errors.address ? 'border-red-400' : ''
                }`}
              />
              {errors.address && <p className="text-[10px] text-red-500 font-semibold">{errors.address.message}</p>}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">City</label>
              <input
                type="text"
                {...register('city')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.city ? 'border-red-400' : ''
                }`}
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">State</label>
              <input
                type="text"
                {...register('state')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.state ? 'border-red-400' : ''
                }`}
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Pincode</label>
              <input
                type="text"
                placeholder="6-digit PIN"
                {...register('pincode')}
                className={`px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.pincode ? 'border-red-400' : ''
                }`}
              />
              {errors.pincode && <p className="text-[10px] text-red-500 font-semibold">{errors.pincode.message}</p>}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Country</label>
              <select
                {...register('country')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="India">India</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Malaysia">Malaysia</option>
              </select>
            </div>
          </div>
        </SettingsCard>

        {/* Section 5: Legal & Tax */}
        <SettingsCard title="Legal & Tax Information" subtitle="Configure legal tax identifiers to enable automated GST outputs calculations." icon={FileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* GST Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">GSTIN Identification Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="33AAFCI8876F1Z8"
                  {...register('gstNumber')}
                  className={`px-3 py-2 pr-9 w-full text-xs font-semibold border rounded-lg focus:outline-none focus:ring-1 uppercase focus:ring-violet-500 ${
                    gstValidState === 'valid'
                      ? 'border-green-400 bg-green-50/10'
                      : gstValidState === 'invalid'
                      ? 'border-red-400 bg-red-50/10'
                      : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-3 top-2.5">
                  {gstValidState === 'valid' && <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />}
                  {gstValidState === 'invalid' && <XCircle className="h-4.5 w-4.5 text-red-500" />}
                </div>
              </div>
              <span className="text-[9px] text-gray-400 font-semibold block">Format: 2 digits + 10 chars PAN + 1 char entity + 1 char Z + 1 checksum check.</span>
            </div>

            {/* PAN */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Permanent Account Number (PAN)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="AAFCI8876F"
                  {...register('panNumber')}
                  className={`px-3 py-2 pr-9 w-full text-xs font-semibold border rounded-lg focus:outline-none focus:ring-1 uppercase focus:ring-violet-500 ${
                    panValidState === 'valid'
                      ? 'border-green-400 bg-green-50/10'
                      : panValidState === 'invalid'
                      ? 'border-red-400 bg-red-50/10'
                      : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-3 top-2.5">
                  {panValidState === 'valid' && <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />}
                  {panValidState === 'invalid' && <XCircle className="h-4.5 w-4.5 text-red-500" />}
                </div>
              </div>
              <span className="text-[9px] text-gray-400 font-semibold block">Format: AAAAA0000A (10 characters).</span>
            </div>

            {/* GST Badge Card */}
            {gstValidState === 'valid' && (
              <div className="col-span-2 bg-green-50/50 border border-green-200/60 rounded-xl p-4 flex items-start gap-3.5 animate-fade-in mt-1">
                <CheckCircle2 className="h-5.5 w-5.5 text-green-650 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-green-800 text-xs block">GST Registered Entity Verified</span>
                  <p className="text-[10px] text-green-650 leading-relaxed font-semibold">
                    GST calculations will automatically append on invoices based on configured rates. Number: <span className="font-mono">{gstNumber}</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SettingsCard>

        {/* Section 6: Bank Details */}
        <SettingsCard
          title="Bank Accounts & Payments"
          subtitle="Details used to reference payment records and generate QR codes."
          icon={CreditCard}
          headerAction={
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
              <Lock className="h-3.5 w-3.5" />
              <span>Private Information</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
            {/* Bank Name */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank Ltd"
                {...register('bankName')}
                className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Account Number</label>
              <div className="relative">
                <input
                  type={showAccount ? 'text' : 'password'}
                  placeholder="e.g. 50100123456789"
                  {...register('accountNumber')}
                  className="px-3 py-2 pr-9 w-full text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowAccount(!showAccount)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showAccount ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* IFSC Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Bank IFSC Code</label>
              <input
                type="text"
                placeholder="HDFC0000184"
                {...register('ifscCode')}
                className="px-3 py-2 w-full text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-1 uppercase focus:ring-violet-500 font-mono"
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">UPI Identification ID</label>
              <input
                type="text"
                placeholder="vasanthamahal@okhdfc"
                {...register('upiId')}
                className="px-3 py-2 w-full text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
            </div>

            {/* UPI Preview QR Card */}
            {upiId && (
              <div className="col-span-2 bg-violet-50/50 border border-violet-100/50 rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in mt-1">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 border border-violet-100 rounded bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="h-9 w-9 text-violet-650" />
                  </div>
                  <div>
                    <span className="font-extrabold text-violet-850 text-xs block">UPI QR code active</span>
                    <span className="text-[10px] text-gray-500 block font-mono mt-0.5">{upiId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(upiId);
                    toast.success('UPI ID copied to clipboard');
                  }}
                  className="px-2.5 py-1.5 border border-violet-200 hover:bg-violet-100/50 text-[10px] font-bold text-violet-700 rounded-lg transition-colors cursor-pointer"
                >
                  Copy UPI ID
                </button>
              </div>
            )}
          </div>
        </SettingsCard>

        {/* Footer save bars */}
        <SettingsSaveBar
          onSave={handleSubmit(onSubmitForm)}
          onCancel={handleDiscardChanges}
          isDirty={isDirty}
          isSaving={updateProfileMutation.isPending}
          title="Save Profile Details"
        />
      </div>
    </div>
  );
}
