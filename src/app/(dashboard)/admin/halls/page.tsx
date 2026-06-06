'use client';

import React, { useState } from 'react';
import { useAdminHalls, useAdminPackages } from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  Search,
  SlidersHorizontal,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  Eye,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Plus,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminHallsPage() {
  const { halls, isLoading, suspendHall, activateHall, deleteHall, createHall, isCreating } = useAdminHalls();
  const { packages = [] } = useAdminPackages();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubStatus, setSelectedSubStatus] = useState('');

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newHallData, setNewHallData] = useState({
    hall_name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    city: '',
    address: '',
    package_id: '',
    password: '',
  });

  // Action Menu toggle state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Derive unique cities (districts)
  const uniqueDistricts = Array.from(new Set(halls.map((h) => h.city).filter(Boolean)));

  // Filter halls list
  const filteredHalls = halls.filter((hall) => {
    const matchesSearch =
      hall.hall_name.toLowerCase().includes(search.toLowerCase()) ||
      hall.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      hall.email.toLowerCase().includes(search.toLowerCase()) ||
      hall.phone.includes(search);

    const matchesDistrict = selectedDistrict ? hall.city === selectedDistrict : true;
    
    const activeSub = hall.hall_subscriptions?.[0];
    const matchesPackage = selectedPackage
      ? activeSub?.packages?.name === selectedPackage
      : true;

    const matchesStatus = selectedStatus ? hall.status === selectedStatus : true;

    const matchesSubStatus = selectedSubStatus
      ? activeSub?.status === selectedSubStatus
      : true;

    return matchesSearch && matchesDistrict && matchesPackage && matchesStatus && matchesSubStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHallData.package_id && packages.length > 0) {
      newHallData.package_id = packages[0].id;
    }
    try {
      await createHall(newHallData);
      setIsRegisterOpen(false);
      setNewHallData({
        hall_name: '',
        owner_name: '',
        owner_email: '',
        phone: '',
        city: '',
        address: '',
        package_id: '',
        password: '',
      });
    } catch {
      // handled in hook
    }
  };

  const handleSuspendToggle = async (id: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      if (confirm('Are you sure you want to suspend this hall? This will block dashboard access.')) {
        await suspendHall(id);
      }
    } else {
      await activateHall(id);
    }
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (confirm('CRITICAL ACTION: Are you sure you want to delete this hall permanently? All associated bookings, payments, and staff records will be lost.')) {
      await deleteHall(id);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Halls Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Activate, suspend, and configure billing parameters for registered halls.
          </p>
        </div>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Venue</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <SlidersHorizontal className="h-4 w-4 text-violet-600" />
          <span>Search & Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hall, owner, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {/* District */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Districts / Cities</option>
            {uniqueDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Package */}
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Packages</option>
            <option value="Free Trial">Free Trial</option>
            {packages.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All System Statuses</option>
            <option value="active">Active System</option>
            <option value="inactive">Suspended System</option>
          </select>

          {/* Sub Status */}
          <select
            value={selectedSubStatus}
            onChange={(e) => setSelectedSubStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Subscriptions</option>
            <option value="active">Active Sub</option>
            <option value="trial">Trial Sub</option>
            <option value="suspended">Suspended Sub</option>
            <option value="expired">Expired Sub</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading Halls registry...</p>
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm mt-3">No Halls Found</h3>
            <p className="text-xs text-gray-450 mt-1">Modify search criteria or register a new venue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Hall Name</th>
                  <th className="px-5 py-4">Owner Contact</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Billing Plan</th>
                  <th className="px-5 py-4">System Access</th>
                  <th className="px-5 py-4">Sub Expiry</th>
                  <th className="px-5 py-4">Created Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredHalls.map((hall) => {
                  const activeSub = hall.hall_subscriptions?.[0];
                  const subStatus = activeSub?.status || 'trial';
                  const packageName = activeSub?.packages?.name || 'Free Trial';
                  const statusStyle = STATUS_STYLES.hall[hall.status === 'active' ? 'active' : 'inactive'];
                  const subStyle = STATUS_STYLES.subscription[subStatus as 'active' | 'trial' | 'suspended' | 'expired'];

                  return (
                    <tr key={hall.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs border border-violet-100">
                            {hall.hall_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-950 block">{hall.hall_name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">ID: {hall.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-900 block">{hall.owner_name}</span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                            <Phone className="h-3 w-3 text-gray-400" /> {hall.phone}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                            <Mail className="h-3 w-3 text-gray-400 animate-pulse" /> {hall.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" /> {hall.city}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-900 font-bold block">{packageName}</span>
                        {activeSub?.packages?.price && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            ₹{activeSub.packages.price.toLocaleString('en-IN')}/{activeSub.packages.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusStyle.bg}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${subStyle.bg}`}>
                            {subStyle.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {activeSub?.end_date ? new Date(activeSub.end_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-medium">
                        {hall.created_at ? new Date(hall.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === hall.id ? null : hall.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === hall.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-5 mt-1 w-48 bg-white border border-gray-150 rounded-lg shadow-lg py-1.5 z-20 text-left">
                              <Link
                                href={`/admin/halls/${hall.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
                              >
                                <Eye className="h-3.5 w-3.5 text-gray-450" />
                                <span>Inspect Hall</span>
                              </Link>
                              
                              <Link
                                href={`/admin/subscriptions/${hall.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
                              >
                                <CreditCard className="h-3.5 w-3.5 text-gray-450" />
                                <span>Subscription Info</span>
                              </Link>

                              <button
                                onClick={() => handleSuspendToggle(hall.id, hall.status)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-xs font-semibold cursor-pointer ${
                                  hall.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                              >
                                {hall.status === 'active' ? (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    <span>Suspend System</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Activate System</span>
                                  </>
                                )}
                              </button>

                              <hr className="border-gray-100 my-1" />

                              <button
                                onClick={() => handleDeleteConfirm(hall.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-xs font-semibold cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Permanently</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Modal Backdrop */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-violet-600">
                <Building2 className="h-5 w-5" />
                <h3 className="font-bold text-gray-900 text-sm">Register New Hall</h3>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-150 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Hall / Venue Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vasantha Mahal Mandapam"
                    value={newHallData.hall_name}
                    onChange={(e) => setNewHallData({ ...newHallData, hall_name: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Nair"
                    value={newHallData.owner_name}
                    onChange={(e) => setNewHallData({ ...newHallData, owner_name: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9840123456"
                    value={newHallData.phone}
                    onChange={(e) => setNewHallData({ ...newHallData, phone: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Owner Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. owner@vasanthamahal.com"
                    value={newHallData.owner_email}
                    onChange={(e) => setNewHallData({ ...newHallData, owner_email: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Default Password</label>
                  <input
                    type="password"
                    placeholder="Optional (System will generate)"
                    value={newHallData.password}
                    onChange={(e) => setNewHallData({ ...newHallData, password: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">District / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={newHallData.city}
                    onChange={(e) => setNewHallData({ ...newHallData, city: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Billing Package / Tier</label>
                  <select
                    value={newHallData.package_id}
                    onChange={(e) => setNewHallData({ ...newHallData, package_id: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price.toLocaleString('en-IN')}/{p.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Full Physical Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter physical location address..."
                    value={newHallData.address}
                    onChange={(e) => setNewHallData({ ...newHallData, address: e.target.value })}
                    className="px-3 py-2 w-full text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 -mx-5 -mb-5 p-5">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-gray-250 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-violet-400"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Hall</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
