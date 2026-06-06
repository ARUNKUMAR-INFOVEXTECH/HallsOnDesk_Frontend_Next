'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { StaffMember } from '@/types/staff';

interface StaffDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: StaffMember | null;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export function StaffDeleteModal({
  isOpen,
  onClose,
  member,
  onConfirm,
  isDeleting = false,
}: StaffDeleteModalProps) {
  const [confirmName, setConfirmName] = useState('');

  // Reset input when modal opens/closes or member changes
  useEffect(() => {
    setConfirmName('');
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleConfirm = () => {
    if (confirmName.trim() === member.name.trim()) {
      onConfirm(member.id);
    }
  };

  const isMatched = confirmName.trim() === member.name.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Box */}
      <div className="bg-white rounded-xl border border-slate-150 shadow-2xl max-w-md w-full relative z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header close */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Content Panel */}
        <div className="p-6 space-y-4 flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-550 shrink-0">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-850 tracking-tight">
              Remove Staff Member?
            </h3>
            <p className="text-xs text-slate-450 font-semibold leading-relaxed">
              Confirm security withdrawal for employee profile listing
            </p>
          </div>

          {/* Warning Card */}
          <div className="w-full text-left bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-xs font-semibold text-amber-850 space-y-2 leading-relaxed font-sans">
            <p className="font-extrabold text-amber-900">
              Removing {member.name} will:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Revoke their system access immediately</li>
              <li>Remove them from all future assignments</li>
              <li className="font-extrabold text-red-600">This action cannot be undone</li>
            </ul>
          </div>

          {/* Input text verification */}
          <div className="w-full space-y-2 text-left">
            <label
              htmlFor="confirm-name-input"
              className="text-[10px] font-black uppercase text-slate-500 tracking-wider block"
            >
              Type the employee name to confirm:
            </label>
            <input
              id="confirm-name-input"
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={member.name}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-200 hover:border-slate-300 focus:border-red-500 rounded-lg outline-none focus:ring-1 focus:ring-red-500 transition-all font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-55 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 border border-slate-200 hover:border-slate-350 hover:bg-white rounded-lg text-xs font-bold text-slate-655 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatched || isDeleting}
            className="h-9 px-4.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isDeleting && (
              <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>Remove Staff Member</span>
          </button>
        </div>

      </div>
    </div>
  );
}
export default StaffDeleteModal;
