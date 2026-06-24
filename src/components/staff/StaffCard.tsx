'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, Calendar, Shield, MoreVertical, Pencil, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { RoleBadge } from './RoleBadge';
import { StaffStatusBadge } from './StaffStatusBadge';
import { DepartmentBadge } from './DepartmentBadge';
import { calculateTenure } from '@/utils/tenure';
import { formatDate } from '@/utils/formatters';

interface StaffCardProps {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onDelete: (id: string, name: string) => void;
  onStatusChange: (id: string, newStatus: StaffStatus) => void;
}

export function StaffCard({ member, onEdit, onDelete, onStatusChange }: StaffCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleAvatarStyles = (role: StaffRole) => {
    const styles: Record<StaffRole, string> = {
      owner: 'bg-primary-lighter text-primary-light border-primary-light/20',
      manager: 'bg-blue-100 text-blue-700 border-blue-200',
      staff: 'bg-green-100 text-green-700 border-green-200',
      receptionist: 'bg-pink-100 text-pink-700 border-pink-200',
      accountant: 'bg-amber-100 text-amber-705 border-amber-200',
      security: 'bg-red-100 text-red-700 border-red-200',
      cleaner: 'bg-teal-100 text-teal-700 border-teal-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[role] || styles.other;
  };

  const getStatusDotColor = (status: StaffStatus) => {
    if (status === 'inactive') return 'bg-gray-400';
    if (status === 'on_leave') return 'bg-amber-500 animate-pulse';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-custom-md hover:border-primary-light transition-all p-4.5 space-y-4 relative select-none">
      
      {/* CARD TOP */}
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          {/* Avatar Circle */}
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-white/20 shadow-inner ${getRoleAvatarStyles(
              member.role
            )}`}
          >
            {getInitials(member.name)}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="font-extrabold text-sm text-slate-850 truncate leading-snug pr-6">
              {member.name}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <RoleBadge role={member.role} size="sm" />
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                {member.employeeId}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown Menu actions */}
        <div className="flex items-center gap-2 absolute top-0.5 right-0.5" ref={menuRef}>
          <span
            className={`h-2 w-2 rounded-full border border-white shadow-sm shrink-0 ${getStatusDotColor(
              member.status
            )}`}
          />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-20 text-xs font-semibold text-slate-705 animate-in fade-in slide-in-from-top-1 duration-155">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(member);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Edit Staff
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStatusOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Change Status
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(member.id, member.name);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 hover:text-rose-650 text-left transition-colors cursor-pointer border-t border-slate-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-400 shrink-0 hover:text-rose-600" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARD MIDDLE */}
      <div className="space-y-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-slate-700 font-bold">{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DepartmentBadge department={member.department} />
        </div>
        
        {/* Password backup row */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 text-[11px] font-semibold text-slate-550 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Password Backup</span>
          {member.backupPassword ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                {showPassword ? member.backupPassword : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-655 p-0.5 cursor-pointer inline-flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold italic">Self-Updated</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            Joined: {formatDate(member.joiningDate)} ({calculateTenure(member.joiningDate)})
          </span>
        </div>
      </div>

      {/* CARD BOTTOM */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
        {/* Permissions Count */}
        <span className="inline-flex items-center gap-1.5 bg-primary-lighter text-primary-light border border-primary-light/25 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide">
          <Shield className="h-3.5 w-3.5 text-primary-light shrink-0" />
          <span>{member.permissions.length} permissions</span>
        </span>

        {/* Clickable Status Badge Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer block"
            title="Click to quickly change status"
          >
            <StaffStatusBadge status={member.status} />
          </button>

          {statusOpen && (
            <div className="absolute right-0 bottom-8 w-36 bg-white border border-slate-150 rounded-lg shadow-custom-lg py-1 z-20 text-xs font-semibold text-slate-705 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <button
                onClick={() => {
                  setStatusOpen(false);
                  onStatusChange(member.id, 'active');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                Set Active
              </button>
              <button
                onClick={() => {
                  setStatusOpen(false);
                  onStatusChange(member.id, 'inactive');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-gray-400 shrink-0" />
                Set Inactive
              </button>
              <button
                onClick={() => {
                  setStatusOpen(false);
                  onStatusChange(member.id, 'on_leave');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                Mark On Leave
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
export default StaffCard;
