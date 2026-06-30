'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  useOwnerHallsList,
  useCreateSecondaryHall,
  useUpdateSecondaryHall,
  useDeleteSecondaryHall
} from '@/hooks/useOwnerHalls';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { toast } from 'sonner';

export default function MultiHallManagementPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const activeHallId = useAuthStore((state) => state.activeHallId);
  const setActiveHall = useAuthStore((state) => state.setActiveHall);

  const { data, isLoading } = useOwnerHallsList();
  const createMutation = useCreateSecondaryHall();
  const updateMutation = useUpdateSecondaryHall();
  const deleteMutation = useDeleteSecondaryHall();

  const halls = data?.halls || [];
  const subscription = data?.subscription || null;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    hall_name: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
  });

  const handleOpenAddModal = () => {
    setFormData({
      hall_name: '',
      address: '',
      district: '',
      state: '',
      pincode: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (hall: any) => {
    setSelectedHall(hall);
    setFormData({
      hall_name: hall.hall_name,
      address: hall.location?.address || '',
      district: hall.location?.district || '',
      state: hall.location?.state || '',
      pincode: hall.location?.pincode || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSecondaryHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hall_name.trim()) {
      toast.error('Hall Name is required');
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsAddModalOpen(false);
      },
    });
  };

  const handleUpdateSecondaryHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHall) return;
    if (!formData.hall_name.trim()) {
      toast.error('Hall Name is required');
      return;
    }

    updateMutation.mutate(
      { id: selectedHall.id, data: formData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  const handleDeleteHall = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${name}"? This will delete all settings, bookings, invoices and statistics associated with this venue.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSwitchWorkspace = (hallId: string, name: string) => {
    setActiveHall(hallId);
    toast.success(`Switched active context to: ${name}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-violet-650" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading Organizations...</span>
      </div>
    );
  }

  if (user && !user.multi_hall_enabled) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-600" />
              Multi-Hall Workspace Manager
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Organize multiple wedding halls under a single owner login with absolute data isolation.
            </p>
          </div>
        </div>

        {/* Informative placeholder state */}
        <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-8 text-center max-w-2xl mx-auto space-y-6 my-10">
          <div className="h-16 w-16 rounded-full bg-violet-55 border border-violet-100 flex items-center justify-center text-violet-600 mx-auto shadow-inner animate-pulse">
            <Layers className="h-8 w-8 text-violet-750" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Multi-Hall Workspace is Disabled</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed max-w-md mx-auto">
              Your account supports multi-venue capabilities, but the Multi-Hall Workspace feature is currently turned off in your system settings.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-600 space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-violet-750 font-black">
              <Sparkles className="h-4 w-4" />
              <span>How to Enable:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed text-slate-500">
              <li>Navigate to the <span className="font-extrabold text-slate-700">General Settings</span> tab on the left sidebar.</li>
              <li>Expand the <span className="font-extrabold text-slate-700">Multi-Hall Workspace Settings</span> accordion.</li>
              <li>Toggle <span className="font-extrabold text-slate-700">"Enable Multi-Hall Workspace"</span> to turn on organization-wide workspaces.</li>
            </ol>
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push('/settings/general')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Go to General Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-600" />
            Multi-Hall Workspace Manager
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Organize multiple wedding halls under a single owner login with absolute data isolation.
          </p>
        </div>

        {subscription && subscription.remainingHalls > 0 && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Register Secondary Hall
          </button>
        )}
      </div>

      {/* Subscription Limit Allocation Metrics Banner */}
      {subscription && (
        <div className="bg-gradient-to-br from-[#062089]/95 to-[#5D22C6]/90 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-48 w-48 rounded-full bg-white/5 border border-white/10" />
          <div className="absolute right-12 bottom-0 translate-y-16 h-32 w-32 rounded-full bg-white/5 border border-white/5" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative z-10">
            <div className="space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Active Subscription Cap
              </span>
              <h3 className="text-lg font-black">{subscription.planName}</h3>
              <p className="text-[11px] text-blue-100 font-semibold leading-relaxed">
                Your subscription belongs to the organization owner. Secondary venues inherit this billing status and all premium capabilities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <span className="text-[9px] font-black text-blue-200 uppercase tracking-wider block">Managed Venues</span>
                <span className="text-base font-black">{subscription.currentHalls} / {subscription.maxHalls} limit</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <span className="text-[9px] font-black text-blue-200 uppercase tracking-wider block">Remaining Slots</span>
                <span className="text-base font-black">{subscription.remainingHalls} Available</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Venues Listing */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Your Organizations</span>
          <span className="text-[10px] text-slate-400 font-bold">Total: {halls.length} Venue(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/20">
                <th className="py-3 px-5">Venue Details</th>
                <th className="py-3 px-5">Badge / Type</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5 text-center">Staff Count</th>
                <th className="py-3 px-5 text-center">Bookings</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-slate-700 divide-y divide-gray-100">
              {halls.map((hall: any) => {
                const isActive = hall.id === activeHallId || (!activeHallId && hall.role === 'Primary');
                return (
                  <tr key={hall.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-black shadow-inner">
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">{hall.hall_name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Registered {formatDate(hall.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {hall.role === 'Primary' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" />
                          Primary Hall
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded uppercase tracking-wider">
                          Secondary
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-500 truncate leading-relaxed">
                          {hall.location.address ? `${hall.location.address}, ` : ''}
                          {hall.location.district ? `${hall.location.district}, ` : ''}
                          {hall.location.state ? `${hall.location.state} ` : ''}
                          {hall.location.pincode ? `- ${hall.location.pincode}` : ''}
                          {!hall.location.address && 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center font-mono">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        <Users className="h-3 w-3" />
                        {hall.staffCount}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center font-mono">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {hall.bookingsCount}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block h-2 w-2 rounded-full ${hall.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} mr-2`} />
                      <span className="capitalize">{hall.status}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black text-green-700 bg-green-50 border border-green-150 rounded uppercase tracking-wide">
                            <CheckCircle className="h-3 w-3" />
                            Active Context
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchWorkspace(hall.id, hall.hall_name)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-black border border-slate-200 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98] uppercase tracking-wide"
                          >
                            Switch Workspace
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(hall)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit Venue Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {hall.role !== 'Primary' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteHall(hall.id, hall.hall_name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Venue"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Billing Information (Owner level values inherited from Primary Hall) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-violet-600" />
          Multi-Tenant SaaS Licensing Context
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs font-semibold leading-relaxed">
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Organization Owner</span>
            <span className="text-gray-700 font-extrabold">{user?.name}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Owner Login Account</span>
            <span className="text-gray-750 font-extrabold block truncate">{user?.email}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">Billing & GST</span>
            <span className="text-gray-750 font-extrabold">Inherited from Primary Hall</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wide">SaaS Renewal Date</span>
            <span className="text-violet-700 font-extrabold font-mono">
              {subscription?.endDate ? formatDate(subscription.endDate) : 'Unlimited'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Hall Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-wide">Register Secondary Wedding Hall</span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSecondaryHall} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Hall Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Palace Hall"
                  value={formData.hall_name}
                  onChange={(e) => setFormData({ ...formData, hall_name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Hall Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Main St, Near Central Station"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-600">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 600001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hall Dialog Modal */}
      {isEditModalOpen && selectedHall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-wide">Edit Venue Information</span>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSecondaryHall} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Hall Name *</label>
                <input
                  type="text"
                  required
                  value={formData.hall_name}
                  onChange={(e) => setFormData({ ...formData, hall_name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Hall Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-600">City / District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
