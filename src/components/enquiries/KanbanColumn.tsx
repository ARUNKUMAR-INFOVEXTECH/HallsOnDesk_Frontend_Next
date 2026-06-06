'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Enquiry, EnquiryStage } from '@/types/enquiry';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  stage: EnquiryStage;
  enquiries: Enquiry[];
  onAddEnquiryClick: (stage: EnquiryStage) => void;
  onEdit: (enquiry: Enquiry) => void;
  onAddFollowup: (enquiry: Enquiry) => void;
  onMarkLost: (enquiry: Enquiry) => void;
}

export function KanbanColumn({
  stage,
  enquiries,
  onAddEnquiryClick,
  onEdit,
  onAddFollowup,
  onMarkLost,
}: KanbanColumnProps) {
  const stageConfigs: Record<
    EnquiryStage,
    { title: string; badgeClass: string; borderClass: string }
  > = {
    new: {
      title: 'New Lead',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      borderClass: 'border-t-slate-400',
    },
    interested: {
      title: 'Interested',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
      borderClass: 'border-t-blue-500',
    },
    visit_scheduled: {
      title: 'Visit Scheduled',
      badgeClass: 'bg-amber-100 text-amber-705 border-amber-250',
      borderClass: 'border-t-amber-500',
    },
    visited: {
      title: 'Visited',
      badgeClass: 'bg-purple-100 text-purple-705 border-purple-250',
      borderClass: 'border-t-purple-500',
    },
    booked: {
      title: 'Booked',
      badgeClass: 'bg-green-150 text-green-755 border-green-250',
      borderClass: 'border-t-green-500',
    },
    lost: {
      title: 'Lost',
      badgeClass: 'bg-rose-100 text-rose-650 border-rose-250',
      borderClass: 'border-t-rose-500',
    },
  };

  const config = stageConfigs[stage] || stageConfigs.new;

  // Calculate sum of budgetMax in this column
  const totalBudget = enquiries.reduce((sum, e) => sum + (e.budgetMax || 0), 0);

  return (
    <div className="w-[290px] shrink-0 flex flex-col bg-slate-50 border border-slate-200/60 rounded-xl p-3 h-full min-h-[500px]">
      
      {/* Column Header */}
      <div className="flex flex-col gap-1.5 pb-3.5 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {config.title}
            </h3>
            <span
              className={`text-[9px] font-black font-mono border px-2 py-0.5 rounded-full ${config.badgeClass}`}
            >
              {enquiries.length}
            </span>
          </div>

          {/* Add lead button (not allowed on booked stage) */}
          {stage !== 'booked' && stage !== 'lost' && (
            <button
              onClick={() => onAddEnquiryClick(stage)}
              className="p-1 rounded-md text-slate-400 hover:text-violet-650 hover:bg-slate-150 transition-colors cursor-pointer"
              title={`Add enquiry in ${config.title}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Budget sum info */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-405 font-bold uppercase tracking-tight">
            Est. Value
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            ₹{totalBudget.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Droppable Card list container */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pt-3 pb-6 space-y-1.5 transition-colors duration-150 min-h-[450px] ${
              snapshot.isDraggingOver ? 'bg-violet-50/10 rounded-lg' : ''
            }`}
          >
            {enquiries.map((enquiry, index) => (
              <KanbanCard
                key={enquiry.id}
                enquiry={enquiry}
                index={index}
                onEdit={onEdit}
                onAddFollowup={onAddFollowup}
                onMarkLost={onMarkLost}
              />
            ))}

            {provided.placeholder}

            {/* Empty column state */}
            {enquiries.length === 0 && (
              <div
                onClick={() => stage !== 'booked' && stage !== 'lost' && onAddEnquiryClick(stage)}
                className={`border-2 border-dashed border-slate-200/80 rounded-xl py-12 px-4 text-center select-none flex flex-col items-center justify-center gap-1.5 transition-colors ${
                  stage !== 'booked' && stage !== 'lost' ? 'hover:border-violet-300 hover:bg-white/50 cursor-pointer' : 'opacity-60'
                }`}
              >
                <Plus className="h-5 w-5 text-slate-400 shrink-0" />
                <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">
                  {stage === 'booked' || stage === 'lost' ? 'No leads here' : 'Drop here or click +'}
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>

    </div>
  );
}

export default KanbanColumn;
