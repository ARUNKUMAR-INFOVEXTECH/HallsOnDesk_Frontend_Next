'use client';

import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Trash2, X, HelpCircle } from 'lucide-react';

interface DangerZoneCardProps {
  onReset: () => void;
}

export default function DangerZoneCard({ onReset }: DangerZoneCardProps) {
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleConfirmReset = () => {
    onReset();
    setResetModalOpen(false);
  };

  return (
    <>
      <div className="border border-red-200 bg-red-50/45 rounded-xl p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-red-100 pb-3">
          <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-sm tracking-tight">Danger Zone</h3>
            <p className="text-[10px] text-red-500 font-semibold mt-0.5">These actions are destructive and irreversible.</p>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-4 text-xs font-semibold text-gray-700">
          {/* Row 1: Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-gray-900 font-bold block flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-red-600 shrink-0" />
                <span>Reset Settings to Default</span>
              </span>
              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                Revert document numbering prefixes, GST configurations, locales, and notifications alert flags to clean defaults.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer self-start sm:self-center"
            >
              Reset Settings
            </button>
          </div>

          <hr className="border-red-100/60" />

          {/* Row 2: Clear Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-60">
            <div className="space-y-1">
              <span className="text-gray-900 font-bold block flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-red-600 shrink-0" />
                <span>Delete All Venue Data</span>
              </span>
              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                Permanently purge all bookings, customers details, payments ledgers, and staff history associated with this hall account.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-3 py-1.5 border border-gray-250 text-gray-400 rounded-lg text-[10px] cursor-not-allowed self-start sm:self-center bg-gray-100 flex items-center gap-1"
              title="Contact support to request database erasure."
            >
              <HelpCircle className="h-3 w-3" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Backdrop */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/20">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold text-gray-900 text-sm">Reset All Configurations?</span>
              </div>
              <button 
                type="button"
                onClick={() => setResetModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-550 font-semibold leading-relaxed">
                This will revert all your custom serial prefixes, Tax GST targets, timezone settings, and channel notification matrix selectors to system defaults.
              </p>
              
              <div className="bg-red-50 text-[10px] text-red-800 font-bold p-3 rounded-lg border border-red-100 leading-relaxed">
                ⚠️ Warning: Your bookings ledger, payments records, and customer directories will NOT be altered or affected.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
