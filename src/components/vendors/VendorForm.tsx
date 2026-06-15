'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Sparkles, Briefcase } from 'lucide-react';
import { vendorFormSchema, VendorFormValues } from '@/schemas/vendor.schema';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { PhoneField } from '@/components/forms/PhoneField';
import { SelectField } from '@/components/forms/SelectField';
import { StarRating } from './StarRating';
import { TagInput } from './TagInput';

interface VendorFormProps {
  onSubmit: (data: VendorFormValues) => void;
  defaultValues?: Partial<VendorFormValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitButtonText?: string;
}

export function VendorForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  onCancel,
  submitButtonText = 'Save Vendor',
}: VendorFormProps) {
  const [businessExpanded, setBusinessExpanded] = useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      category: 'other',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      city: '',
      state: 'Tamil Nadu', // reasonable default
      gstNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      contactPersonName: '',
      contactPersonPhone: '',
      rating: 5,
      status: 'active',
      tags: [],
      notes: '',
      ...defaultValues,
    },
  });

  const categories = [
    { value: 'caterer', label: 'Caterer 🍽️' },
    { value: 'decorator', label: 'Decorator ✨' },
    { value: 'photographer', label: 'Photographer 📷' },
    { value: 'videographer', label: 'Videographer 🎥' },
    { value: 'dj', label: 'DJ 🎵' },
    { value: 'band', label: 'Live Band 🎸' },
    { value: 'florist', label: 'Florist 🌸' },
    { value: 'lighting', label: 'Lighting 💡' },
    { value: 'sound', label: 'Sound System 🔊' },
    { value: 'tent', label: 'Tent & Shamiana ⛺' },
    { value: 'transport', label: 'Transport 🚚' },
    { value: 'security', label: 'Security 🛡️' },
    { value: 'cleaning', label: 'Cleaning & Setup 🧹' },
    { value: 'other', label: 'Other Services ⚙️' },
  ] as const;

  const statuses = [
    { value: 'active', label: 'Active Status' },
    { value: 'inactive', label: 'Inactive Status' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ] as const;

  const { register, control, formState: { errors } } = form;

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-6 select-none pb-12">
      
      {/* CARD 1: Basic Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
          <Briefcase className="h-4.5 w-4.5 text-primary shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-850">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputField
              name="name"
              label="Vendor / Business Name"
              placeholder="e.g. Sharma Catering Services"
              required
            />
          </div>

          <SelectField
            name="category"
            label="Service Category"
            options={categories}
            placeholder="Choose category"
            required
          />

          <SelectField
            name="status"
            label="Status"
            options={statuses}
            placeholder="Select status"
          />

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vendor Rating Quality
            </span>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarRating
                  value={field.value ?? 5}
                  onChange={field.onChange}
                  size="lg"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Contact Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhoneField
            name="phone"
            label="Primary Phone Number"
            placeholder="9876543210"
            required
          />

          <PhoneField
            name="alternatePhone"
            label="Alternate Phone"
            placeholder="9876543210"
          />

          <div className="md:col-span-2">
            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="e.g. sharma@gmail.com"
            />
          </div>

          <InputField
            name="contactPersonName"
            label="Contact Person Name"
            placeholder="e.g. Ramesh Sharma"
          />

          <PhoneField
            name="contactPersonPhone"
            label="Contact Person Phone"
            placeholder="9876543210"
          />
        </div>
      </div>

      {/* CARD 3: Location */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Street Address
            </label>
            <textarea
              id="address"
              rows={2}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                errors.address ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
              }`}
              placeholder="Enter building, street, area details..."
              {...register('address')}
            />
            {errors.address && (
              <span className="text-xs text-red-500 font-semibold">{errors.address.message as string}</span>
            )}
          </div>

          <InputField
            name="city"
            label="City"
            placeholder="e.g. Chennai"
            required
          />

          <InputField
            name="state"
            label="State / Region"
            placeholder="e.g. Tamil Nadu"
            required
          />
        </div>
      </div>

      {/* CARD 4: Business Details (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setBusinessExpanded(!businessExpanded)}
          className="w-full flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-850">Business & Payment Details</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Optional
            </span>
          </div>
          {businessExpanded ? (
            <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          )}
        </button>

        {businessExpanded && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div className="md:col-span-2">
              <InputField
                name="gstNumber"
                label="GSTIN Number (GST Format)"
                placeholder="e.g. 33AAAAA1111A1Z1"
              />
            </div>

            <InputField
              name="bankName"
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
            />

            <InputField
              name="accountNumber"
              label="Account Number"
              placeholder="e.g. 50100234567890"
            />

            <InputField
              name="ifscCode"
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
            />

            <InputField
              name="upiId"
              label="UPI ID"
              placeholder="e.g. sharma@okaxis"
            />
          </div>
        )}
      </div>

      {/* CARD 5: Additional Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Additional Information</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vendor Tags
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type tag (e.g. premium, buffet) and press Enter"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Internal Notes / Terms
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Add specialized billing notes or terms here..."
              {...register('notes')}
            />
          </div>
        </div>
      </div>

      {/* FORM FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 transition-all disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isSubmitting && (
            <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{submitButtonText}</span>
        </button>
      </div>

    </FormProvider>
  );
}
export default VendorForm;
