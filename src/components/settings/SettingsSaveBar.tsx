'use client';

import React from 'react';
import { Loader2, Check } from 'lucide-react';

interface SettingsSaveBarProps {
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isSaving?: boolean;
  title?: string;
}

export default function SettingsSaveBar({
  onSave,
  onCancel,
  isDirty,
  isSaving = false,
  title = 'Save Changes',
}: SettingsSaveBarProps) {
  if (!isDirty) return null;

  return (
    <>
      {/* Mobile Sticky Float Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3.5 flex items-center justify-between z-30 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.08)] animate-slide-up">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-650 hover:bg-violet-700 rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>{title}</span>
            </>
          )}
        </button>
      </div>

      {/* Desktop Inline Actions Bar */}
      <div className="hidden md:flex items-center justify-end gap-3 mt-6">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-2.5 py-1.5 mr-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
          <span>You have unsaved changes</span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-violet-650 hover:bg-violet-700 rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>{title}</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
