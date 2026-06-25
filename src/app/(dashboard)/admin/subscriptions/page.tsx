'use client';

import React, { useState } from 'react';
import { useAdminSubscriptions, useAdminPackages, useAdminHalls } from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  CreditCard,
  Search,
  Calendar,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  PowerOff,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import Link from 'next/link';
import { obfuscateId } from '@/utils/obfuscate';

export default function AdminSubscriptionsPage() {
  const { 
    subscriptions = [], 
    isLoading: subsLoading, 
    renewSubscription, 
    changePackage, 
    adjustSubscription,
    isRenewing, 
    isChangingPackage,
    isAdjusting
  } = useAdminSubscriptions();
  const { packages = [], isLoading: pkgsLoading } = useAdminPackages();
  const { suspendHall } = useAdminHalls();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Dialog State
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedNewPkgId, setSelectedNewPkgId] = useState('');
  
  // Custom Override States
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedStatusOverride, setSelectedStatusOverride] = useState('');

  const activeSubscription = subscriptions.find((s) => s.id === activeSubId);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.hallName.toLowerCase().includes(search.toLowerCase()) ||
      sub.packageName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus ? sub.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubscription) return;
    try {
      await renewSubscription({
        hallId: activeSubscription.hallId,
        months: selectedMonths,
      });
      setRenewDialogOpen(false);
    } catch {
      // handled
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubscription || !selectedNewPkgId) return;
    try {
      await changePackage({
        hallId: activeSubscription.hallId,
        packageId: selectedNewPkgId,
      });
      setPackageDialogOpen(false);
    } catch {
      // handled
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId) return;
    try {
      await adjustSubscription({
        subscriptionId: activeSubId,
        endDate: customEndDate || undefined,
        status: selectedStatusOverride || undefined,
      });
      setAdjustDialogOpen(false);
    } catch {
      // handled
    }
  };

  const handleApplyGrace = async (days: number) => {
    if (!activeSubId) return;
    if (confirm(`Apply custom grace period of +${days} days to this venue license?`)) {
      try {
        await adjustSubscription({
          subscriptionId: activeSubId,
          graceDays: days,
        });
        setAdjustDialogOpen(false);
      } catch {
        // handled
      }
    }
  };

  const handleCancelSubscription = async (hallId: string) => {
    if (confirm('Are you sure you want to suspend this subscription? The venue space dashboard will be locked.')) {
      await suspendHall(hallId);
    }
  };

  const isLoading = subsLoading || pkgsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Subscriptions & Billing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review venue licensing contracts, process renewals, and manage packages migration.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search venue or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
        >
          <option value="">All Billing States</option>
          <option value="active">Active Plan</option>
          <option value="trial">Setup Mode</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading subscriptions...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm mt-3">No Contracts Found</h3>
            <p className="text-xs text-gray-455 mt-1">Adjust filtering criteria and check again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Venue Host</th>
                  <th className="px-5 py-4">Pricing Tier</th>
                  <th className="px-5 py-4">Monthly Fee</th>
                  <th className="px-5 py-4">Start Date</th>
                  <th className="px-5 py-4">End Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredSubscriptions.map((sub) => {
                  const style = STATUS_STYLES.subscription[sub.status as 'active' | 'trial' | 'suspended' | 'expired'];

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/admin/halls/${obfuscateId(sub.hallId)}`} className="font-bold text-gray-900 hover:text-violet-600 block">
                          {sub.hallName}
                        </Link>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">ID: {sub.hallId.slice(0, 8)}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-800">{sub.packageName}</td>
                      <td className="px-5 py-4">
                        <span className="text-gray-900 block">₹{sub.price.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-medium">
                        {new Date(sub.startDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-medium">
                        {new Date(sub.endDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${style.bg}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/subscriptions/${obfuscateId(sub.id)}`}
                            className="p-1.5 rounded-lg hover:bg-gray-150/50 text-gray-500 hover:text-violet-600 transition-colors inline-block"
                            title="Inspect Timeline"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => {
                              setRenewDialogOpen(true);
                              setActiveSubId(sub.id);
                              setSelectedMonths(1);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-150/50 text-gray-500 hover:text-violet-600 transition-colors inline-block cursor-pointer"
                            title="Extend License"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setPackageDialogOpen(true);
                              setActiveSubId(sub.id);
                              setSelectedNewPkgId('');
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-150/50 text-gray-500 hover:text-violet-600 transition-colors inline-block cursor-pointer"
                            title="Migrate Plan"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveSubId(sub.id);
                              const formattedDate = sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '';
                              setCustomEndDate(formattedDate);
                              setSelectedStatusOverride(sub.status);
                              setAdjustDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-150/50 text-gray-500 hover:text-violet-650 transition-colors inline-block cursor-pointer"
                            title="Adjust End Date & Grace Overrides"
                          >
                            <Sliders className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleCancelSubscription(sub.hallId)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-750 transition-colors inline-block cursor-pointer"
                            title="Suspend Access"
                          >
                            <PowerOff className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renew / Extend Dialog */}
      {renewDialogOpen && activeSubscription && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-bold text-gray-900 text-sm">Extend Hosting License</span>
              <button onClick={() => setRenewDialogOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleRenewSubmit} className="p-5 space-y-4">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Extend subscription for <span className="font-bold text-gray-800">{activeSubscription.hallName}</span>.
              </p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Extension Duration</label>
                <select
                  value={selectedMonths}
                  onChange={(e) => setSelectedMonths(Number(e.target.value))}
                  className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  <option value={1}>1 Month Extension</option>
                  <option value={3}>3 Months Extension</option>
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>1 Year Extension</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenewDialogOpen(false)}
                  className="px-3 py-1.5 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                >
                  {isRenewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Extend plan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Migration Dialog */}
      {packageDialogOpen && activeSubscription && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-bold text-gray-900 text-sm">Migrate Pricing Plan</span>
              <button onClick={() => setPackageDialogOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handlePackageSubmit} className="p-5 space-y-4">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Change package layout for <span className="font-bold text-gray-800">{activeSubscription.hallName}</span>.
                Current plan: <span className="font-bold text-violet-600">{activeSubscription.packageName}</span>.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Target Billing Plan</label>
                <select
                  value={selectedNewPkgId}
                  onChange={(e) => setSelectedNewPkgId(e.target.value)}
                  className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  required
                >
                  <option value="">Select Plan Tier...</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPackageDialogOpen(false)}
                  className="px-3 py-1.5 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isChangingPackage}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                >
                  {isChangingPackage ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Plan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Subscription Adjust Overrides Dialog */}
      {adjustDialogOpen && activeSubscription && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-bold text-gray-900 text-sm">Adjust Subscription & Grace</span>
              <button onClick={() => setAdjustDialogOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Manually adjust parameters for <span className="font-bold text-gray-800">{activeSubscription.hallName}</span>.
              </p>

              {/* Status Override */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Billing Plan Status</label>
                <select
                  value={selectedStatusOverride}
                  onChange={(e) => setSelectedStatusOverride(e.target.value)}
                  className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  required
                >
                  <option value="active">Active Plan</option>
                  <option value="trial">Setup Mode</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Custom Expiry Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Plan Expiry Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Quick Grace Periods */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Quick Grace Extension</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyGrace(7)}
                    disabled={isAdjusting}
                    className="py-2 text-center text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                  >
                    +7 Days Grace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGrace(14)}
                    disabled={isAdjusting}
                    className="py-2 text-center text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                  >
                    +14 Days Grace
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setAdjustDialogOpen(false)}
                  className="px-3 py-1.5 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                >
                  {isAdjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Apply Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
