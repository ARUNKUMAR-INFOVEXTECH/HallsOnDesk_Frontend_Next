'use client';

import React, { useState } from 'react';
import { HallSection } from '@/types/settings';
import { LayoutGrid, Plus, Edit2, Trash2, Users, Check, X, ShieldAlert } from 'lucide-react';

interface HallSectionManagerProps {
  sections: HallSection[];
  onChange: (sections: HallSection[]) => void;
}

export default function HallSectionManager({
  sections = [],
  onChange,
}: HallSectionManagerProps) {
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Inline Form State
  const [formData, setFormData] = useState<Omit<HallSection, 'id'>>({
    name: '',
    capacity: 100,
    description: '',
    isActive: true,
  });

  const handleAddClick = () => {
    setFormData({ name: '', capacity: 100, description: '', isActive: true });
    setIsAdding(true);
    setIsEditingId(null);
  };

  const handleEditClick = (section: HallSection) => {
    setFormData({
      name: section.name,
      capacity: section.capacity,
      description: section.description || '',
      isActive: section.isActive,
    });
    setIsEditingId(section.id);
    setIsAdding(false);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this hall space/section?')) {
      onChange(sections.filter((s) => s.id !== id));
    }
  };

  const handleFormCancel = () => {
    setIsAdding(false);
    setIsEditingId(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isAdding) {
      const newSec: HallSection = {
        id: `sec-${Date.now()}`,
        name: formData.name,
        capacity: formData.capacity,
        description: formData.description,
        isActive: formData.isActive,
      };
      onChange([...sections, newSec]);
    } else if (isEditingId) {
      const updated = sections.map((s) =>
        s.id === isEditingId
          ? {
              ...s,
              name: formData.name,
              capacity: formData.capacity,
              description: formData.description,
              isActive: formData.isActive,
            }
          : s
      );
      onChange(updated);
    }

    setIsAdding(false);
    setIsEditingId(null);
  };

  const handleActiveToggle = (id: string, currentVal: boolean) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isActive: !currentVal } : s));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-2">
        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Hall Sections & Sub-spaces</h4>
        {!isAdding && !isEditingId && (
          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 hover:bg-violet-100 rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Space</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {sections.length === 0 && !isAdding && (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/20">
          <LayoutGrid className="h-8 w-8 text-gray-300 mx-auto" />
          <h5 className="font-bold text-gray-800 text-xs mt-3">No Sections Configured</h5>
          <p className="text-[10px] text-gray-450 mt-1 max-w-xs mx-auto leading-relaxed">
            Configure sub-spaces like Main Hall, Open Lawn, or Mini Halls to separate pricing and booking options.
          </p>
          <button
            type="button"
            onClick={handleAddClick}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-750 text-[10px] font-bold text-white rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Configure Space
          </button>
        </div>
      )}

      {/* Section List */}
      {sections.length > 0 && !isAdding && !isEditingId && (
        <div className="space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className={`flex items-center justify-between p-3.5 border border-gray-150 rounded-xl bg-gray-50/40 hover:bg-gray-50 transition-colors ${
                !sec.isActive ? 'opacity-70 border-gray-100 bg-gray-100/10' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">{sec.name}</span>
                  {!sec.isActive && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1 flex items-center gap-0.5">
                      <ShieldAlert className="h-2.5 w-2.5" /> Offline
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-400" /> Max Capacity: {sec.capacity} guests
                  </span>
                  {sec.description && (
                    <span className="truncate max-w-[240px] text-gray-400">
                      • {sec.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sec.isActive}
                    onChange={() => handleActiveToggle(sec.id, sec.isActive)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-gray-250 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-650" />
                </label>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleEditClick(sec)}
                  className="p-1.5 rounded hover:bg-gray-150 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  title="Edit Space"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteClick(sec.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-450 hover:text-red-600 transition-colors cursor-pointer"
                  title="Remove Space"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Inline Form */}
      {(isAdding || isEditingId) && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-violet-50/30 rounded-xl border border-violet-100/50 p-4 space-y-4 shadow-sm animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-violet-100/40 pb-2.5">
            <span className="font-bold text-violet-850 text-xs">
              {isAdding ? 'Configure New Space' : 'Modify Space Details'}
            </span>
            <button
              type="button"
              onClick={handleFormCancel}
              className="text-gray-400 hover:text-gray-650 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Space Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-violet-800 uppercase tracking-wider block">Space Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Main Wedding Hall"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-violet-800 uppercase tracking-wider block">Max Guest Capacity</label>
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="px-3 py-2 w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
            </div>

            {/* Description */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="text-[9px] font-bold text-violet-800 uppercase tracking-wider block">Short Description</label>
              <input
                type="text"
                placeholder="Optional facility specifications (e.g. A/C unit, dining space)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-3 py-2 w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Active Switch */}
            <div className="col-span-1 sm:col-span-2 flex items-center justify-between bg-white border border-gray-150 rounded-lg p-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-700 block">Space Availability Status</span>
                <span className="text-[9px] text-gray-400 font-semibold block">Turn off to suspend new bookings for this section.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-gray-250 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-650" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-violet-100/40">
            <button
              type="button"
              onClick={handleFormCancel}
              className="px-3 py-1.5 border border-gray-250 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-gray-100/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-750 text-[10px] font-bold text-white rounded-lg shadow-sm"
            >
              {isAdding ? 'Configure Space' : 'Update Space'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
