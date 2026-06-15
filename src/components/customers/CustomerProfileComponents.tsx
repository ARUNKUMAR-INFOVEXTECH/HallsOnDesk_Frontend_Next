'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  CalendarCheck,
  Clock,
  Download,
  Eye,
  Info,
  History,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Booking, Payment, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

// ----------------------------------------------------
// 1. OVERVIEW TAB
// ----------------------------------------------------
interface OverviewTabProps {
  customer: any;
  bookings: Booking[];
  totalRevenue: number;
}

export function OverviewTab({ customer, bookings, totalRevenue }: OverviewTabProps) {
  const upcomingEvents = bookings.filter((b) => new Date(b.start_date) > new Date());
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contact Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-5">
        <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Contact Details</h3>
            <p className="text-xs text-slate-400 font-medium">Customer contact information and address</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-lighter text-primary-light border border-primary-light/10">
            <UserCheck className="h-3.5 w-3.5" />
            Active Customer
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-medium">
          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block leading-none">Full Name</span>
              <span className="text-slate-700 font-bold mt-1.5 block">{customer.customer_name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block leading-none">Phone Number</span>
              <span className="text-slate-700 font-bold mt-1.5 block font-mono">{customer.phone}</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block leading-none">Email Address</span>
              <span className="text-slate-700 font-bold mt-1.5 block truncate">{customer.email || 'No email registered'}</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="h-8 w-8 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block leading-none">Street Address</span>
              <span className="text-slate-700 font-bold mt-1.5 block leading-relaxed">{customer.address || 'No address added'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="space-y-6 lg:col-span-1">
        {/* Revenue Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-fit">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-primary-light" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Revenue Booked
            </span>
            <h3 className="text-2xl font-extrabold text-primary tracking-tight leading-none font-mono">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
            Sum of all event rental totals booked by this customer.
          </p>
        </div>

        {/* Next event card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Upcoming Bookings
          </span>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3 mt-1 text-xs">
              <div className="flex items-center gap-2 p-2 bg-primary-lighter/50 border border-primary-light/10 rounded-lg">
                <CalendarCheck className="h-4 w-4 text-primary-light shrink-0" />
                <div className="overflow-hidden">
                  <span className="font-bold text-slate-800 block truncate">
                    {upcomingEvents[0].event_name}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    {formatDate(upcomingEvents[0].start_date)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 font-medium">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>No upcoming bookings scheduled.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. BOOKINGS TAB
// ----------------------------------------------------
interface BookingsTabProps {
  bookings: Booking[];
}

export function BookingsTab({ bookings }: BookingsTabProps) {
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
      {/* Tab Header & Statistics */}
      <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Bookings History</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and track venue bookings of the client</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
            Total: {bookings.length}
          </span>
          <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700">
            Confirmed: {confirmedCount}
          </span>
          {pendingCount > 0 && (
            <span className="px-2 py-1 rounded-md bg-yellow-50 border border-yellow-100 text-yellow-700">
              Pending: {pendingCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto text-xs text-slate-600">
        {bookings.length > 0 ? (
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Event Name</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-[10px] uppercase text-slate-400 truncate max-w-[80px]">
                    #{(b.id || '').slice(0, 8)}
                  </td>
                  <td className="px-6 py-3.5 text-slate-800 font-semibold">{b.event_name}</td>
                  <td className="px-6 py-3.5 capitalize text-slate-600">{b.event_type}</td>
                  <td className="px-6 py-3.5 text-slate-500 font-mono">{formatDate(b.start_date)}</td>
                  <td className="px-6 py-3.5 text-slate-800 font-bold font-mono">{formatCurrency(b.total_amount)}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : b.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link 
                      href={`/dashboard/bookings?id=${b.id}`} 
                      className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-primary bg-primary-lighter hover:bg-primary-light/20 rounded-md transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No bookings recorded for this client.
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. PAYMENTS TAB
// ----------------------------------------------------
interface PaymentsTabProps {
  payments: Payment[];
}

export function PaymentsTab({ payments }: PaymentsTabProps) {
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
      {/* Header & stats summary card */}
      <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Payment Records</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Summary of all transactions logged for the client</p>
        </div>
        <div className="bg-primary-lighter/50 border border-primary-light/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-xs font-semibold text-primary font-mono">
          <DollarSign className="h-4 w-4 shrink-0 text-primary-light" />
          <span>Total Received: {formatCurrency(totalPaid)}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto text-xs text-slate-600">
        {payments.length > 0 ? (
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Booking Reference</th>
                <th className="px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-slate-500 font-mono">{formatDate(p.payment_date || (p as any).paymentDate)}</td>
                  <td className="px-6 py-3.5 text-slate-800 font-bold font-mono">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-600 uppercase font-semibold">
                      <CreditCard className="h-3 w-3 text-slate-400" />
                      {p.payment_method || (p as any).paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-[10px] uppercase text-slate-400">
                      #{(p.booking_id || (p as any).bookingId || '').slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 truncate max-w-[200px]">{p.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No payments logged.
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. INVOICES TAB
// ----------------------------------------------------
interface InvoicesTabProps {
  invoices: Invoice[];
}

export function InvoicesTab({ invoices }: InvoicesTabProps) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Invoice Cleardown Checklist Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Invoice Cleardown Checklist</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Visual tracking for audit and settlements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Progress</span>
            <div className="flex items-center gap-3">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap font-mono">
                {paidInvoices.length}/{invoices.length} Cleared
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-6">
            <div>
              <span className="text-slate-400">Total Billed:</span>
              <strong className="text-slate-800 font-mono ml-1.5">{formatCurrency(totalInvoiced)}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Cleared:</span>
              <strong className="text-emerald-600 font-mono ml-1.5">{paidInvoices.length} Invoices</strong>
            </div>
          </div>
        </div>

        {/* Small checklist overlay */}
        <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-2 text-slate-600 font-medium">
                {inv.status === 'paid' ? (
                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span>Invoice <strong className="text-slate-700">{inv.invoice_number}</strong> ({formatCurrency(inv.total_amount)}) — </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border ${
                  inv.status === 'paid' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : inv.status === 'partial' 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {inv.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic text-center py-1">No invoices generated to checklist.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 font-bold">Invoices Issued</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Billed invoices for wedding rentals</p>
          </div>
        </div>
        
        <div className="overflow-x-auto text-xs text-slate-600">
          {invoices.length > 0 ? (
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount Due</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-850">{inv.invoice_number}</td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono">{formatDate(inv.invoice_date)}</td>
                    <td className="px-6 py-3.5 text-slate-800 font-bold font-mono">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : inv.status === 'partial'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-250'
                          : 'bg-rose-50 text-rose-700 border-rose-250'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      <button className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 rounded-md transition-colors cursor-pointer shadow-sm">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 bg-white text-primary-light hover:text-primary hover:border-primary-light/50 rounded-md transition-colors cursor-pointer shadow-sm">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              No invoices cleared.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. ACTIVITY TIMELINE TAB
// ----------------------------------------------------
export function ActivityTimeline() {
  const logEvents = [
    { id: '1', event: 'Customer Created', desc: 'Anand Srinivasan customer profile initialized.', date: 'May 10, 2026', icon: UserCheck, color: 'bg-primary-lighter border-primary-light/10 text-primary-light' },
    { id: '2', event: 'Wedding Booking Added', desc: 'Booked Raj Mahal hall for wedding Muhurtham on Dec 12.', date: 'May 12, 2026', icon: Calendar, color: 'bg-primary-lighter border-primary-light/10 text-primary-light' },
    { id: '3', event: 'Deposit Invoice Issued', desc: 'Generated invoice #INV-2026-004.', date: 'May 12, 2026', icon: FileText, color: 'bg-primary-lighter border-primary-light/10 text-primary-light' },
    { id: '4', event: 'Advance Payment Logged', desc: 'Logged deposit amount ₹40,000 via Bank Transfer.', date: 'May 14, 2026', icon: DollarSign, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-3.5 mb-6">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-primary-light" />
          Customer Engagement Timeline
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Timeline of all touchpoints with the customer</p>
      </div>

      <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-3">
        {logEvents.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative flex gap-4 items-start text-xs font-semibold">
              {/* Connector icon dot */}
              <div className="absolute -left-[35px] bg-white rounded-full p-1 border border-slate-200">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3.5 hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-800 font-bold text-xs">{item.event}</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider shrink-0 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
