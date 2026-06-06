'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminPackages } from '@/hooks/useAdmin';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Layers,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';

const packageFormSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Monthly fee must be positive')),
  setupFee: z.preprocess((val) => Number(val), z.number().min(0, 'Setup fee must be positive')),
  billing_cycle: z.enum(['monthly', 'yearly']),
  max_users: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().nullable().optional()),
  max_bookings: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().nullable().optional()),
  trialDays: z.preprocess((val) => Number(val), z.number().min(0, 'Trial days must be positive')),
  features: z.array(z.object({ value: z.string().min(1, 'Feature cannot be empty') })).min(1, 'At least one feature is required'),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

export default function AdminNewPackagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { packages, createPackage, updatePackage, isCreating } = useAdminPackages();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: '',
      price: 4999,
      setupFee: 4999,
      billing_cycle: 'monthly',
      max_users: 10,
      max_bookings: 50,
      trialDays: 14,
      features: [{ value: 'Core Booking Engine' }, { value: 'Customer CRM Database' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  // Handle Loading edit data
  useEffect(() => {
    if (editId && packages.length > 0) {
      const match = packages.find((p) => p.id === editId);
      if (match) {
        setIsEditMode(true);
        reset({
          name: match.name,
          price: match.price,
          setupFee: 4999, // dummy setup fee fallback
          billing_cycle: match.billing_cycle || 'monthly',
          max_users: match.max_users,
          max_bookings: match.max_bookings,
          trialDays: 14,
          features: match.features.map((f) => ({ value: f })),
        });
      }
    }
  }, [editId, packages, reset]);

  const onSubmit = async (values: PackageFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        price: values.price,
        billing_cycle: values.billing_cycle,
        max_users: values.max_users ?? null,
        max_bookings: values.max_bookings ?? null,
        features: values.features.map((f) => f.value),
      };

      if (isEditMode && editId) {
        await updatePackage({ id: editId, data: payload });
      } else {
        await createPackage(payload);
      }
      router.push('/admin/packages');
    } catch {
      // Handled inside hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/packages')}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-150 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {isEditMode ? 'Edit SaaS Package' : 'Create Pricing Package'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure default billing cycle, usage targets, and feature specifications.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-150 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Layers className="h-5 w-5 text-violet-600" />
          <span className="font-bold text-gray-900 text-sm">Package Details Configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Package Name</label>
            <input
              type="text"
              placeholder="e.g. Enterprise Tier"
              {...register('name')}
              className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>}
          </div>

          {/* Billing Cycle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Billing Frequency</label>
            <select
              {...register('billing_cycle')}
              className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="monthly">Monthly Subscription</option>
              <option value="yearly">Yearly Subscription</option>
            </select>
          </div>

          {/* Setup Fee */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Implementation Setup Fee (INR)</label>
            <input
              type="number"
              placeholder="4999"
              {...register('setupFee')}
              className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                errors.setupFee ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.setupFee && <p className="text-[10px] text-red-500 font-semibold">{errors.setupFee.message}</p>}
          </div>

          {/* Monthly Price */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Billing Cost (INR)</label>
            <input
              type="number"
              placeholder="9999"
              {...register('price')}
              className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                errors.price ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.price && <p className="text-[10px] text-red-500 font-semibold">{errors.price.message}</p>}
          </div>

          {/* Max Users */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Maximum Tenant Staff Accounts</label>
            <input
              type="number"
              placeholder="10 (Leave blank for unlimited)"
              {...register('max_users')}
              className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Max Bookings */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Maximum Monthly Bookings</label>
            <input
              type="number"
              placeholder="50 (Leave blank for unlimited)"
              {...register('max_bookings')}
              className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Trial Days */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Free Trial Duration (Days)</label>
            <input
              type="number"
              placeholder="14"
              {...register('trialDays')}
              className={`px-3 py-2 w-full text-xs font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                errors.trialDays ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.trialDays && <p className="text-[10px] text-red-500 font-semibold">{errors.trialDays.message}</p>}
          </div>
        </div>

        {/* Feature List Array */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-900 text-sm block">SaaS Privileges & Feature Set</span>
              <p className="text-[11px] text-gray-400 font-medium">Add specifications that will render under the venue packages lists.</p>
            </div>
            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 hover:bg-violet-100 rounded-lg cursor-pointer transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Add Feature
            </button>
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="e.g. 24/7 Phone Support"
                {...register(`features.${idx}.value` as const)}
                className={`px-3 py-2 flex-1 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  errors.features?.[idx]?.value ? 'border-red-450' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => fields.length > 1 && remove(idx)}
                disabled={fields.length === 1}
                className="p-2 border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {errors.features && <p className="text-xs text-red-500 font-semibold">{errors.features.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Discard
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-violet-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving details...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>{isEditMode ? 'Update Package' : 'Publish Package'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
