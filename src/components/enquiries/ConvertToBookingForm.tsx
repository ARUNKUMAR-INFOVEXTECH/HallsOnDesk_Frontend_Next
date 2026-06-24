'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Info, ArrowRight, Sparkles } from 'lucide-react';
import { convertFormSchema, ConvertFormValues } from '@/schemas/enquiry.schema';
import { FormProvider } from '@/components/forms/FormProvider';
import { InputField } from '@/components/forms/InputField';
import { CurrencyField } from '@/components/forms/CurrencyField';
import { Enquiry } from '@/types/enquiry';
import { useConvertToBooking } from '@/hooks/useEnquiries';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { obfuscateId } from '@/utils/obfuscate';
import { useCreateCustomerMutation } from '@/hooks/useCustomerQueries';

interface ConvertToBookingFormProps {
  enquiry: Enquiry;
}

export function ConvertToBookingForm({ enquiry }: ConvertToBookingFormProps) {
  const router = useRouter();
  const convertMutation = useConvertToBooking();
  const createCustomerMutation = useCreateCustomerMutation();
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const halls = user?.accessible_halls || [];
  const activeHall = halls.find((h) => h.id === activeHallId)
    || halls.find((h) => h.id === user?.hall_id)
    || halls[0];
  const activeHallName = activeHall?.hall_name || 'Venue';

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      eventDate: enquiry.eventDate || '',
      hallSection: enquiry.hallSection || 'Main Hall',
      bookingAmount: enquiry.budgetMax || 0,
      advanceAmount: 0,
      notes: enquiry.notes || '',
    },
  });

  const handleAddCustomerAndRedirect = async () => {
    try {
      const res = await createCustomerMutation.mutateAsync({
        customer_name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email || undefined,
        address: enquiry.address || undefined,
        city: enquiry.city || undefined,
        notes: `Created from Enquiry #${enquiry.enquiryNumber}`,
      });
      
      const customerId = res.data.id;
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        customerId: customerId,
        eventType: enquiry.eventType || 'other',
        eventDate: enquiry.eventDate || '',
        hallSection: enquiry.hallSection || 'Main Hall',
        guestCount: String(enquiry.guestCount || ''),
        bookingAmount: String(enquiry.budgetMax || ''),
        notes: enquiry.notes || '',
        enquiryId: enquiry.id,
      });
      
      toast.success('Customer profile created! Redirecting to booking builder...');
      
      // Redirect to the new booking form
      router.push(`/dashboard/bookings/new?${queryParams.toString()}`);
    } catch (err) {
      console.error('Failed to create customer and redirect:', err);
    }
  };

  const { watch, formState: { isSubmitting } } = form;
  const bookingAmount = watch('bookingAmount') || 0;
  const advanceAmount = watch('advanceAmount') || 0;
  const pendingAmount = Math.max(0, bookingAmount - advanceAmount);

  const handleSubmit = async (data: ConvertFormValues) => {
    try {
      const res = await convertMutation.mutateAsync({
        id: enquiry.id,
        data,
      });
      
      const createdId = res.bookingId || res.booking_id || (res.data ? res.data.id : '');
      if (createdId) {
        setSuccessBookingId(String(createdId));
      } else {
        // Fallback to bookings list
        router.push('/dashboard/bookings');
      }
    } catch (err) {
      console.error('Lead conversion failed:', err);
    }
  };

  // 1. If lead is already booked
  if (enquiry.stage === 'booked' || successBookingId) {
    const bookingId = enquiry.bookingId || successBookingId;
    return (
      <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-sm select-none max-w-xl mx-auto text-center space-y-5 relative overflow-hidden">
        
        {/* CSS Confetti keyframes styling */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
          }
          .confetti-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: confetti-fall 2.5s ease-out infinite;
          }
        `}} />

        {/* Confetti particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}px`,
              backgroundColor: ['#159DFC', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}

        <div className="h-14 w-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto animate-bounce shadow-sm">
          <CheckCircle className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <span>Enquiry Successfully Converted!</span>
          </h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
            The enquiry record has been archived and translated into a live booking contract inside your {activeHallName} CRM.
          </p>
        </div>

        {bookingId && (
          <div className="bg-violet-50/35 border border-violet-100 rounded-xl p-4.5 max-w-sm mx-auto text-xs font-bold text-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Converted Booking:</span>
              <span className="font-mono text-violet-650 font-black">#BKG-{bookingId.substring(0, 5).toUpperCase()}</span>
            </div>

            <button
              onClick={() => router.push(`/dashboard/bookings/${obfuscateId(bookingId)}`)}
              className="w-full h-8.5 bg-violet-650 hover:bg-violet-755 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-violet-100"
            >
              <span>View Booking File</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. If stage is lost
  if (enquiry.stage === 'lost') {
    return (
      <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-sm select-none max-w-xl mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
          <Info className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-850">Lead is Marked Lost</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          This CRM lead is marked inactive or lost. You can only convert active pipeline leads.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-sm select-none max-w-2xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="border-b border-slate-50 pb-3">
        <h3 className="text-sm font-extrabold text-slate-850">Convert to Venue Booking</h3>
        <p className="text-xs text-slate-450 mt-1">
          Finalize event parameters and rate terms to generate the reservation.
        </p>
      </div>

      {/* Pre-filled Meta details banner */}
      <div className="bg-violet-50/20 border border-violet-100 rounded-xl p-4.5 text-xs font-semibold text-slate-655 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
        <div>
          <strong className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] mb-0.5">Customer Profile:</strong>
          <span className="text-slate-800 font-extrabold text-sm">{enquiry.name}</span>
        </div>
        <div>
          <strong className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] mb-0.5">eventType target:</strong>
          <span className="capitalize">{enquiry.eventType}</span>
        </div>
        {enquiry.eventDate && (
          <div>
            <strong className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] mb-0.5">suggested eventDate:</strong>
            <span>{enquiry.eventDate}</span>
          </div>
        )}
        {(enquiry.budgetMin || enquiry.budgetMax) && (
          <div>
            <strong className="text-slate-500 font-bold block uppercase tracking-wider text-[9px] mb-0.5">suggested budget limits:</strong>
            <span className="font-mono">₹{enquiry.budgetMin?.toLocaleString('en-IN') || 0} — ₹{enquiry.budgetMax?.toLocaleString('en-IN') || 'TBD'}</span>
          </div>
        )}
      </div>

      {/* Quick Option: Direct Booking Form */}
      <div className="bg-amber-50/30 border border-dashed border-amber-200 rounded-xl p-4.5 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          <span>Alternate Conversion: Use Full Booking Form</span>
        </h4>
        <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
          Prefer using the full, detailed booking builder? Click below to save this lead details as a customer profile and launch the detailed booking registry form prefilled with their parameters.
        </p>
        <button
          type="button"
          onClick={handleAddCustomerAndRedirect}
          disabled={createCustomerMutation.isPending}
          className="w-full sm:w-auto h-9 px-4.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
        >
          {createCustomerMutation.isPending ? 'Adding Customer...' : 'Add as Customer & Open Booking Builder'}
          <ArrowRight className="h-4 w-4 text-slate-305" />
        </button>
      </div>

      {/* Conversion Form inputs */}
      <FormProvider form={form} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2">
            <InputField
              name="eventDate"
              label="Confirmed Event Date"
              type="date"
              required
            />
          </div>

          <div className="md:col-span-2">
            <InputField
              name="hallSection"
              label="Confirmed Hall Section"
              placeholder="e.g. Main Hall"
              required
            />
          </div>

          <CurrencyField
            name="bookingAmount"
            label="Total Booking Contract Rate"
            placeholder="120000"
            required
          />

          <CurrencyField
            name="advanceAmount"
            label="Advance Installment Paid"
            placeholder="25000"
          />

          {/* Payment breakdown card */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2.5">
            <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
              Booking Balance Breakdown
            </h4>

            <div className="space-y-1.5 text-xs font-semibold text-slate-655">
              <div className="flex items-center justify-between">
                <span>Contract Rate:</span>
                <span className="font-mono font-bold text-slate-800">₹{bookingAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Advance Paid:</span>
                <span className="font-mono text-green-700 font-bold">- ₹{advanceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 font-bold text-sm text-slate-800">
                <span>Net Balance Due:</span>
                <span className="font-mono text-violet-650 font-black">₹{pendingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-550">
              Additional Booking Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Enter dining plans, decorations terms, or installment rules..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-semibold text-slate-705"
              {...form.register('notes')}
            />
          </div>
        </div>

        {/* Submit Conversion */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-violet-650 hover:bg-violet-755 disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-violet-100 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Converting...</span>
            </>
          ) : (
            <>
              <span>Convert to Live Booking Contract</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </FormProvider>

    </div>
  );
}

export default ConvertToBookingForm;
