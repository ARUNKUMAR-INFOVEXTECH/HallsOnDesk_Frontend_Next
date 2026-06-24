'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalDateTimeString } from '@/utils/formatters';

interface VisitScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledAt: string, notes: string) => void;
}

export function VisitScheduleModal({ isOpen, onClose, onConfirm }: VisitScheduleModalProps) {
  // Default scheduledAt to tomorrow at 11 AM
  const getTomorrowDateTimeString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return getLocalDateTimeString(tomorrow);
  };

  const [scheduledAt, setScheduledAt] = useState(getTomorrowDateTimeString());
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!scheduledAt) {
      toast.error('Appointment date and time is required');
      return;
    }
    const selected = new Date(scheduledAt);
    if (selected <= new Date()) {
      toast.error('Site visit appointment must be in the future');
      return;
    }
    onConfirm(scheduledAt, notes);
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
                <div className="h-10 w-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850">Schedule a Site Visit</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Link an on-site visit schedule appointment</p>
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
                <label htmlFor="scheduledAt" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Appointment Date & Time
                </label>
                <input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-semibold text-slate-705"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visit Notes / Guidelines
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Coming with family of 4. Wants to inspect electrical capacity and central dining hall decor..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none hover:border-slate-300 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-semibold text-slate-705"
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-50 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-655 cursor-pointer underline decoration-dotted"
              >
                Skip Scheduling
              </button>
              <div className="flex items-center gap-2">
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
                  className="h-8.5 px-4.5 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default VisitScheduleModal;
