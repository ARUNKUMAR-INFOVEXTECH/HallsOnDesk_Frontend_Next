'use client';

import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { STATUS_STYLES } from '@/constants';
import {
  Users,
  Search,
  Phone,
  Mail,
  Building,
  Key,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminUsersPage() {
  const { users = [], isLoading, toggleUserStatus, resetPassword } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Action Menu toggle state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.hallName && u.hallName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = selectedRole ? u.role === selectedRole : true;
    const matchesStatus = selectedStatus ? u.status === selectedStatus : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusToggle = async (id: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (confirm(`Change this user system access state to ${nextStatus}?`)) {
      await toggleUserStatus({ userId: id, status: nextStatus });
    }
    setActiveMenuId(null);
  };

  const handleResetPassword = async (id: string, email: string) => {
    if (confirm(`Send credentials password reset instructions email to ${email}?`)) {
      await resetPassword(id);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Global Users Registry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, activate, suspend, or reset credentials for operators across all host venues.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Account Roles</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Access States</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading users registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm mt-3">No Users Found</h3>
            <p className="text-xs text-gray-455 mt-1">Modify your filters and try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Account Name</th>
                  <th className="px-5 py-4">Contact Info</th>
                  <th className="px-5 py-4">Password Backup</th>
                  <th className="px-5 py-4">Venue Host</th>
                  <th className="px-5 py-4">Permission Role</th>
                  <th className="px-5 py-4">System State</th>
                  <th className="px-5 py-4">Last Login</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredUsers.map((user) => {
                  const statusStyle = STATUS_STYLES.hall[user.status === 'active' ? 'active' : 'inactive'];

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-950 block">{user.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">UID: {user.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-900 flex items-center gap-1 font-medium">
                            <Mail className="h-3 w-3 text-gray-400 shrink-0" /> {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                              <Phone className="h-3 w-3 text-gray-400 shrink-0" /> {user.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {user.backupPassword ? (
                          <div className="flex items-center gap-1.5 min-w-[90px]">
                            <span className="font-mono text-xs text-gray-700 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-bold">
                              {visiblePasswords[user.id] ? user.backupPassword : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer inline-flex items-center"
                            >
                              {visiblePasswords[user.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-semibold italic">Self-Updated</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.hallName ? (
                          <span className="text-gray-800 flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {user.hallName}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium italic">Global Operator</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-violet-50 text-violet-700 border border-violet-150 rounded-full capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusStyle.bg}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-medium">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-GB') : 'Never'}
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {activeMenuId === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-5 mt-1 w-48 bg-white border border-gray-150 rounded-lg shadow-lg py-1.5 z-20 text-left">
                              <button
                                onClick={() => handleStatusToggle(user.id, user.status)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-xs font-semibold cursor-pointer ${
                                  user.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                              >
                                {user.status === 'active' ? (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    <span>Suspend User</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Activate User</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleResetPassword(user.id, user.email)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-750 text-xs font-semibold text-left cursor-pointer"
                              >
                                <Key className="h-3.5 w-3.5 text-gray-450" />
                                <span>Reset Password</span>
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
    </div>
  );
}
