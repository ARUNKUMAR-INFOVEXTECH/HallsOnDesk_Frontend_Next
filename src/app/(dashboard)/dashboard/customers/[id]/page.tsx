'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Inbox,
  File,
  History,
  Edit,
  Trash2,
  AlertTriangle,
  Upload,
  Download,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Users,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api/client';
import { deobfuscateId } from '@/utils/obfuscate';

// Queries & Mutations
import {
  useCustomerDetailQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useLogCustomerInteractionMutation,
} from '@/hooks/useCustomerQueries';
import { getEnquiries } from '@/services/api/modules/enquiries.service';
import { getPaymentsByBooking } from '@/services/api/modules/payments.service';
import { getInvoiceByBooking } from '@/services/api/modules/invoices.service';

// Subcomponents & Helpers
import {
  OverviewTab,
  BookingsTab,
  PaymentsTab,
  InvoicesTab,
  ActivityTimeline,
} from '@/components/customers/CustomerProfileComponents';
import { CustomerForm, CustomerFormValues } from '@/components/customers/CustomerForm';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Enquiry, Booking, Payment, Invoice } from '@/types';

// Tab Definitions
type TabId = 'overview' | 'bookings' | 'payments' | 'invoices' | 'enquiries' | 'timeline';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = deobfuscateId(params.id as string);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  React.useEffect(() => {
    if (searchParams?.get('edit') === 'true') {
      setShowEditModal(true);
    }
  }, [searchParams]);

  // Queries
  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    refetch,
  } = useCustomerDetailQuery(id);

  // Enquiries query for this client
  const { data: enquiries = [] } = useQuery<Enquiry[], Error>({
    queryKey: ['customers', 'enquiries', id],
    queryFn: () => getEnquiries({ customer_id: id }),
    enabled: !!id,
  });

  const bookings: Booking[] = customer?.bookings || [];

  // Parallel Query bindings to retrieve payments for each booking
  const paymentQueries = useQueries({
    queries: bookings.map((booking) => ({
      queryKey: ['payments', 'booking', booking.id],
      queryFn: () => getPaymentsByBooking(booking.id),
      enabled: !!booking.id,
    })),
  });

  // Parallel Query bindings to retrieve invoices for each booking
  const invoiceQueries = useQueries({
    queries: bookings.map((booking) => ({
      queryKey: ['invoices', 'booking', booking.id],
      queryFn: () => getInvoiceByBooking(booking.id),
      enabled: !!booking.id,
    })),
  });

  // Mutations
  const updateCustomerMutation = useUpdateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();

  const handleRefresh = () => {
    refetch();
  };

  if (isCustomerLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-xl" />
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="border border-red-200 bg-red-50/20 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          Customer Profile Not Found
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The requested customer record does not exist or could not be loaded due to a network connection issue.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard/customers"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-600 transition-colors"
          >
            Back to Directory
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-custom-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Compile payments and invoices from queries or fallback to inline models
  const compiledPayments: Payment[] = paymentQueries
    .flatMap((q) => q.data || [])
    .filter(Boolean) as Payment[];

  const fallbackPayments = bookings.flatMap((b) => b.payments || []);
  const paymentsList = (compiledPayments.length > 0 ? compiledPayments : fallbackPayments)
    .filter((p) => p && (Number(p.amount) > 0 || p.payment_date || (p as any).paymentDate));

  const invoicesList: Invoice[] = invoiceQueries
    .map((q) => q.data)
    .filter(Boolean) as Invoice[];

  // Calculate total revenue booked
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const totalPaid = paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingBalance = Math.max(0, totalRevenue - totalPaid);

  // Perform updates
  const handleEditSubmit = async (data: CustomerFormValues) => {
    try {
      await updateCustomerMutation.mutateAsync({
        id,
        data: {
          customer_name: data.customer_name,
          phone: data.phone,
          email: data.email || undefined,
          address: data.address || undefined,
          notes: data.notes || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          company_name: data.company_name || undefined,
          gst_number: data.gst_number || undefined,
          vip_status: data.vip_status,
        },
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Update customer error:', err);
    }
  };

  // Perform delete
  const handleDeleteConfirm = async () => {
    try {
      await deleteCustomerMutation.mutateAsync(id);
      setShowDeleteModal(false);
      router.push('/dashboard/customers');
    } catch (err) {
      console.error('Delete customer error:', err);
    }
  };

  // Get name initials
  const nameInitials = customer.customer_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'timeline', label: 'Timeline', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Refresh */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-light transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        <button
          onClick={handleRefresh}
          className="h-8 w-8 inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Main Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Profile Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-6 text-xs">
            {/* Avatar & Title */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary-lighter border border-primary-light/10 flex items-center justify-center font-bold text-xl text-primary-light mb-3.5 shadow-sm">
                  {nameInitials}
                </div>
                {customer.vip_status && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-md border border-white" title="VIP Customer">
                    👑
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-805 text-base tracking-tight leading-none flex items-center gap-1.5 justify-center">
                {customer.customer_name}
                {customer.vip_status && (
                  <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wider select-none scale-90">
                    VIP
                  </span>
                )}
              </h3>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-150 border border-slate-200 text-[10px] text-slate-500 font-mono font-semibold">
                ID: #{customer.id.slice(0, 8)}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3.5 py-1.5 text-center font-bold">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Bookings</span>
                <span className="text-sm text-slate-800 font-mono block mt-1">{bookings.length}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Booked</span>
                <span className="text-sm text-primary-light font-mono block mt-1 leading-none">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100/50 flex flex-col justify-between">
                <span className="text-[9px] text-emerald-600 uppercase tracking-wider block font-bold">Total Paid</span>
                <span className="text-sm text-emerald-600 font-mono block mt-1 leading-none">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="bg-rose-50/50 rounded-lg p-2.5 border border-rose-100/50 flex flex-col justify-between">
                <span className="text-[9px] text-rose-500 uppercase tracking-wider block font-bold">Balance Due</span>
                <span className="text-sm text-rose-600 font-mono block mt-1 leading-none">{formatCurrency(outstandingBalance)}</span>
              </div>
            </div>

            {/* Core Metadata */}
            <div className="space-y-3 font-semibold text-slate-600">
              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              {customer.email ? (
                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors overflow-hidden">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2 text-slate-400 rounded-lg italic">
                  <Mail className="h-4 w-4 text-slate-300 shrink-0" />
                  <span>No email registered</span>
                </div>
              )}
              {customer.address ? (
                <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{customer.address}</span>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-2 text-slate-405 text-slate-400 rounded-lg italic">
                  <MapPin className="h-4 w-4 text-slate-300 shrink-0" />
                  <span>No address registered</span>
                </div>
              )}
              {customer.company_name && (
                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="text-slate-400 shrink-0 w-4 text-center leading-none text-base">🏢</span>
                  <span className="leading-snug truncate">{customer.company_name}</span>
                </div>
              )}
              {customer.gst_number && (
                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors font-mono">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100 border border-slate-200 px-1 py-0.2 rounded shrink-0 leading-none">GSTIN</span>
                  <span className="font-semibold text-slate-700 leading-none">{customer.gst_number}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-all shadow-sm cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-105 hover:border-red-200 bg-white hover:bg-rose-50 rounded-lg text-xs font-semibold text-red-650 transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Underlined tab selectors & history contents */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tab Selector Header (Underlined style) */}
          <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-4 shrink-0 transition-all cursor-pointer border-b-2 -mb-[1px] ${
                    isActive
                      ? 'border-primary-light text-primary-light'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Render Tab Contents */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <OverviewTab 
                customer={customer} 
                bookings={bookings} 
                totalRevenue={totalRevenue} 
                totalPaid={totalPaid}
                outstandingBalance={outstandingBalance}
              />
            )}

            {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}

            {activeTab === 'payments' && <PaymentsTab payments={paymentsList} />}

            {activeTab === 'invoices' && <InvoicesTab invoices={invoicesList} />}

            {activeTab === 'enquiries' && <EnquiriesTab enquiries={enquiries} />}



            {activeTab === 'timeline' && <DynamicActivityTimeline customerId={id} />}
          </div>
        </div>
      </div>

      {/* 1. Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-premium max-w-2xl w-full p-6 space-y-4 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Edit Customer Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <CustomerForm
              initialValues={{
                customer_name: customer.customer_name,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                notes: customer.notes || '',
                company_name: customer.company_name || '',
                gst_number: customer.gst_number || '',
                vip_status: customer.vip_status || false,
              }}
              onSubmit={handleEditSubmit}
              loading={updateCustomerMutation.isPending}
              submitLabel="Save Updates"
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Delete Profile Warnings Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-premium max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-650">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">
                Delete Customer Profile?
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Deleting this customer will affect related bookings, invoices, and payments. This action cannot be undone. Are you sure you want to permanently erase <span className="text-slate-800 font-bold">{customer.customer_name}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteCustomerMutation.isPending}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-600 transition-colors cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCustomerMutation.isPending}
                onClick={handleDeleteConfirm}
                className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-md text-xs font-semibold text-white bg-red-650 hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer shadow-custom-sm font-bold"
              >
                {deleteCustomerMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Auxiliary Tab Components for Enquiries
// ----------------------------------------------------
interface EnquiriesTabProps {
  enquiries: Enquiry[];
}

function EnquiriesTab({ enquiries }: EnquiriesTabProps) {
  return (
    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Historical Enquiries</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Track historical booking inquiries and their status</p>
        </div>
      </div>
      
      <div className="overflow-x-auto text-xs text-slate-655">
        {enquiries.length > 0 ? (
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-3">Expected Date</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Guest Count</th>
                <th className="px-6 py-3">Budget</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {enquiries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-slate-500 font-mono">{formatDate(e.expected_date)}</td>
                  <td className="px-6 py-3.5 capitalize text-slate-800 font-semibold">{e.event_type}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-600">{e.guest_count} Guests</td>
                  <td className="px-6 py-3.5 text-slate-800 font-bold font-mono">
                    {e.budget ? formatCurrency(e.budget) : '-'}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 truncate max-w-[200px]">{e.notes || '-'}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${
                        e.status === 'converted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : e.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {e.status === 'converted' && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No historical inquiries logged.
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Auxiliary Tab Component for Dynamic Touchpoint Timeline
// ----------------------------------------------------
interface DynamicActivityTimelineProps {
  customerId: string;
}

function DynamicActivityTimeline({ customerId }: DynamicActivityTimelineProps) {
  const [touchpointType, setTouchpointType] = useState('Call');
  const [touchpointNotes, setTouchpointNotes] = useState('');
  
  const queryClient = useQueryClient();
  const logMutation = useLogCustomerInteractionMutation();

  // Dynamic Query to load this customer's activity log timeline
  const { data: logs = [], isLoading, refetch } = useQuery<any[], Error>({
    queryKey: ['activity-logs', 'customer', customerId],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(`/activity-logs/customer/${customerId}`);
      return response.data || [];
    },
    enabled: !!customerId,
  });

  const handleLogTouchpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchpointNotes.trim()) {
      toast.error('Please enter interaction notes before logging.');
      return;
    }
    
    logMutation.mutate({
      id: customerId,
      type: touchpointType,
      notes: touchpointNotes,
    }, {
      onSuccess: () => {
        setTouchpointNotes('');
        refetch();
      }
    });
  };

  // Helper: map action to styling and icons
  const getLogMeta = (action: string, metadata?: any) => {
    const act = action.toLowerCase();
    if (act === 'customer.interaction') {
      const type = (metadata?.type || 'Call').toLowerCase();
      if (type.includes('email')) {
        return { label: 'Email Interaction', icon: Mail, color: 'bg-blue-50 border-blue-200 text-blue-600' };
      } else if (type.includes('whatsapp') || type.includes('message')) {
        return { label: 'WhatsApp Interaction', icon: MessageSquare, color: 'bg-green-50 border-green-200 text-green-600' };
      } else if (type.includes('meeting') || type.includes('physical')) {
        return { label: 'Meeting Touchpoint', icon: Users, color: 'bg-purple-50 border-purple-205 text-purple-600' };
      } else {
        return { label: 'Phone Call Touchpoint', icon: Phone, color: 'bg-amber-50 border-amber-250 text-amber-600' };
      }
    }

    if (act.includes('created')) {
      return { label: 'Created Event/Booking', icon: Calendar, color: 'bg-primary-lighter border-primary-light/10 text-primary-light' };
    }
    if (act.includes('payment') || act.includes('paid')) {
      return { label: 'Payment Transacted', icon: DollarSign, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' };
    }
    if (act.includes('invoice')) {
      return { label: 'Invoice Generated', icon: FileText, color: 'bg-slate-100 border-slate-205 text-slate-700' };
    }

    return { label: 'System Log', icon: History, color: 'bg-slate-50 border-slate-205 text-slate-500' };
  };

  return (
    <div className="space-y-6">
      {/* 1. Form to Log New touchpoint interaction */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Log CRM Touchpoint</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Record a physical/digital conversation with the customer</p>
        </div>

        <form onSubmit={handleLogTouchpoint} className="space-y-4 font-semibold text-xs text-slate-750">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Touchpoint Type</span>
              <select
                id="touchpointType"
                value={touchpointType}
                onChange={(e) => setTouchpointType(e.target.value)}
                className="h-9 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm font-semibold w-full"
              >
                <option value="Call">📞 Phone Call</option>
                <option value="Email">✉️ Email Message</option>
                <option value="WhatsApp">💬 WhatsApp Chat</option>
                <option value="Meeting">🤝 In-Person Meeting</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Notes / Discussion Details</span>
              <input
                id="touchpointNotes"
                type="text"
                value={touchpointNotes}
                onChange={(e) => setTouchpointNotes(e.target.value)}
                placeholder="Notes on what was discussed or decided..."
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={logMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {logMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 shrink-0" />
                  Log Touchpoint
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Interactive Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3.5 mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-primary-light" />
              Customer Engagement Timeline
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Audit log of system actions and logged touchpoints</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading timeline data...</div>
        ) : logs.length > 0 ? (
          <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-3">
            {logs.map((item: any) => {
              const meta = getLogMeta(item.action, item.metadata);
              const LogIcon = meta.icon;
              return (
                <div key={item.id} className="relative flex gap-4 items-start text-xs font-semibold">
                  {/* Connector icon dot */}
                  <div className="absolute -left-[35px] bg-white rounded-full p-1 border border-slate-200 shadow-sm">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${meta.color}`}>
                      <LogIcon className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3.5 hover:border-slate-205 transition-colors">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-800 font-bold text-xs">{meta.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider shrink-0 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                        {formatDateTime(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed font-sans">
                      {item.description}
                    </p>
                    <div className="text-[10px] text-slate-400 font-medium mt-2 flex items-center justify-between">
                      <span>Logged by: <strong className="text-slate-500 capitalize">{item.user_name || 'System'}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-450 border border-dashed border-slate-150 rounded-xl bg-slate-50/50">
            No activity history logged for this customer.
          </div>
        )}
      </div>
    </div>
  );
}
