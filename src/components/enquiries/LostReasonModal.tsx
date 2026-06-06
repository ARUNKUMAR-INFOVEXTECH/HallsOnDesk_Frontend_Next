'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
}

export function LostReasonModal({ isOpen, onClose, onConfirm }: LostReasonModalProps) {
  const [reason, setReason] = useState('Not responding');
  const [notes, setNotes] = useState('');

  const reasons = [
    { value: 'Budget too high', label: '💸 Budget too high' },
    { value: 'Chose another venue', label: '🏛️ Chose another venue' },
    { value: 'Event cancelled', label: '📅 Event cancelled' },
    { value: 'Not responding', label: '📞 Not responding / No contact' },
    { value: 'Other', label: '✏️ Other' },
  ];

  const handleConfirm = () => {
    onConfirm(reason, notes);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white w-full max-w-md border border-slate-100 shadow-custom-lg rounded-xl overflow-hidden z-10 p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850">Mark Enquiry as Lost</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please capture why this lead is lost</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-605 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Inputs Form */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reason for Loss
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold text-slate-700 cursor-pointer"
                >
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Additional Notes / Explanations
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Venue was unavailable on their required dates or budget mismatched by 20%..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all font-semibold text-slate-705"
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3.5 border-t border-slate-50 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="h-8.5 px-4 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-8.5 px-4.5 bg-rose-550 hover:bg-rose-650 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Confirm Lost
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default LostReasonModal;
