'use client';

import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Calendar, ShieldAlert, ArrowLeft } from 'lucide-react';
import { enquiryFormSchema, EnquiryFormValues } from '@/schemas/enquiry.schema';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { PhoneField } from '@/components/forms/PhoneField';
import { SelectField } from '@/components/forms/SelectField';
import { CurrencyField } from '@/components/forms/CurrencyField';
import { EnquiryStage, EnquiryPriority, EnquirySource, EventType } from '@/types/enquiry';

interface EnquiryFormProps {
  onSubmit: (data: EnquiryFormValues) => void;
  defaultValues?: Partial<EnquiryFormValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitButtonText?: string;
}

export function EnquiryForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  onCancel,
  submitButtonText = 'Save Enquiry',
}: EnquiryFormProps) {
  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: '',
      eventType: 'other',
      eventDate: '',
      guestCount: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      hallSection: 'Main Hall',
      source: 'walk_in',
      stage: 'new',
      priority: 'medium',
      notes: '',
      scheduleFollowup: false,
      followupDate: '',
      followupType: 'call',
      followupNotes: '',
      ...defaultValues,
    },
  });

  const { control, register, setValue, formState: { isDirty, errors } } = form;

  // Watch fields to toggle visibility dynamically
  const scheduleFollowupVal = useWatch({ control, name: 'scheduleFollowup' });

  // Options configuration
  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'reception', label: 'Reception' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'other', label: 'Other' },
  ] as const;

  const sources = [
    { value: 'walk_in', label: '🚶 Walk-In' },
    { value: 'phone', label: '📞 Phone Call' },
    { value: 'whatsapp', label: '📱 WhatsApp' },
    { value: 'instagram', label: '📷 Instagram' },
    { value: 'facebook', label: '👥 Facebook' },
    { value: 'google', label: '🔍 Google' },
    { value: 'justdial', label: '📋 JustDial' },
    { value: 'referral', label: '👋 Referral' },
    { value: 'other', label: '➕ Other' },
  ] as const;

  const priorityConfigs: Record<EnquiryPriority, { label: string; activeClass: string }> = {
    high: { label: 'High 🔴', activeClass: 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/10' },
    medium: { label: 'Medium 🟡', activeClass: 'bg-amber-50 border-amber-450 text-amber-705 ring-2 ring-amber-500/10' },
    low: { label: 'Low ⚪', activeClass: 'bg-slate-100 border-slate-350 text-slate-700' },
  };

  const stageLabels: Record<EnquiryStage, string> = {
    new: 'New',
    interested: 'Interested',
    visit_scheduled: 'Visit Scheduled',
    visited: 'Visited',
    booked: 'Booked',
    lost: 'Lost',
  };

  // Warning check for unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to navigate away?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-6 pb-12 select-none">
      
      {/* SECTION 1: Lead Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-850">Lead Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputField
              name="name"
              label="Full Name"
              placeholder="e.g. Priyan Sharma"
              required
            />
          </div>

          <PhoneField
            name="phone"
            label="Phone Number"
            placeholder="9876543210"
            required
          />

          <InputField
            name="email"
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. priyan@gmail.com"
          />

          <div className="md:col-span-2">
            <InputField
              name="city"
              label="City"
              placeholder="Chennai"
            />
          </div>

          <div className="md:col-span-2">
            <SelectField
              name="source"
              label="Lead Acquisition Source"
              options={sources}
              placeholder="Select source channel"
              required
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Event Requirements */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-violet-650 shrink-0" />
          <h3 className="text-sm font-extrabold text-slate-850">Event Requirements</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <SelectField
              name="eventType"
              label="Event Category"
              options={eventTypes}
              placeholder="Select event category"
              required
            />
          </div>

          <div className="md:col-span-2">
            <InputField
              name="eventDate"
              label="Event Date (Future dates only)"
              type="date"
            />
          </div>

          <InputField
            name="guestCount"
            label="Expected Guest Count"
            type="number"
            placeholder="e.g. 250"
          />

          <InputField
            name="hallSection"
            label="Preferred Hall Section"
            placeholder="e.g. Main Hall"
          />

          <CurrencyField
            name="budgetMin"
            label="Minimum Budget Target"
            placeholder="50000"
          />

          <CurrencyField
            name="budgetMax"
            label="Maximum Budget Target"
            placeholder="150000"
          />
        </div>
      </div>

      {/* SECTION 3: Pipeline & Priority */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Pipeline & Priority</h3>
        </div>

        {/* Visual Stage Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-505">
            Pipeline Stage
          </span>
          <Controller
            name="stage"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(stageLabels).map(([key, label]) => {
                  const isActive = field.value === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => field.onChange(key)}
                      className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all text-center flex items-center justify-center cursor-pointer ${
                        isActive
                          ? 'bg-violet-650 border-violet-650 text-white shadow-sm shadow-violet-200'
                          : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Priority Toggles */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-505">
            Priority Level
          </span>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(priorityConfigs).map(([key, config]) => {
                  const isActive = field.value === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => field.onChange(key)}
                      className={`h-9 px-4 rounded-lg text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? config.activeClass
                          : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Schedule First Followup Toggle */}
        {defaultValues?.stage !== 'booked' && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-150">
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-slate-800">Schedule First Followup</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Book an appointment or call slot immediately</p>
              </div>
              <Controller
                name="scheduleFollowup"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4.5 w-4.5 text-violet-650 border-slate-300 focus:ring-violet-500 rounded cursor-pointer"
                  />
                )}
              />
            </div>

            {/* Followup fields */}
            {scheduleFollowupVal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-violet-50/25 border border-violet-100 rounded-xl animate-in slide-in-from-top-2 duration-200">
                <InputField
                  name="followupDate"
                  label="Followup Date & Time (Future only)"
                  type="datetime-local"
                  required
                />

                <SelectField
                  name="followupType"
                  label="Contact Type"
                  options={[
                    { value: 'call', label: '📞 Phone Call' },
                    { value: 'whatsapp', label: '💬 WhatsApp' },
                    { value: 'visit', label: '🏃 Site Visit' },
                    { value: 'email', label: '📧 Email' },
                    { value: 'other', label: '➕ Other' },
                  ]}
                  placeholder="Select followup type"
                  required
                />

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="followupNotes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Followup Agenda Notes
                  </label>
                  <textarea
                    id="followupNotes"
                    rows={2}
                    placeholder="e.g. Call to discuss wedding catering packages and guest counts..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-700"
                    {...register('followupNotes')}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: Notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-850">Notes & Comments</h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <textarea
            id="notes"
            rows={3}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-semibold text-slate-705"
            placeholder="Add any requirement highlights or private lead notes..."
            {...register('notes')}
          />
        </div>
      </div>

      {/* Cross-validation errors warning banner */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 select-none">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-[11px] font-bold space-y-1">
            <h4 className="font-extrabold text-rose-800 text-xs">Form Validation Mismatches</h4>
            <ul className="list-disc pl-4 space-y-0.5 font-semibold">
              {Object.entries(errors).map(([key, err]: any) => (
                <li key={key}>{err?.message || `${key} field is incorrect`}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FORM FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 transition-all disabled:opacity-50 cursor-pointer animate-in duration-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-5 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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

export default EnquiryForm;
