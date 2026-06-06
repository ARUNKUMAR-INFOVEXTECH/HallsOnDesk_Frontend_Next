'use client';

import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Enquiry, EnquiryStage } from '@/types/enquiry';
import { KanbanColumn } from './KanbanColumn';
import { useUpdateEnquiryStage, useUpdateEnquiry } from '@/hooks/useEnquiries';
import { LostReasonModal } from './LostReasonModal';
import { VisitScheduleModal } from './VisitScheduleModal';
import { toast } from 'sonner';

interface KanbanBoardProps {
  enquiries: Enquiry[];
  onEdit: (enquiry: Enquiry) => void;
  onAddFollowup: (enquiry: Enquiry) => void;
  onAddEnquiryClick: (stage: EnquiryStage) => void;
}

export function KanbanBoard({
  enquiries,
  onEdit,
  onAddFollowup,
  onAddEnquiryClick,
}: KanbanBoardProps) {
  const updateStageMutation = useUpdateEnquiryStage();
  const updateEnquiryMutation = useUpdateEnquiry();

  // Modals / pending drag states
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    id: string;
    stage: EnquiryStage;
    fromStage: EnquiryStage;
  } | null>(null);

  // Group enquiries by stage
  const columns: Record<EnquiryStage, Enquiry[]> = {
    new: enquiries.filter((e) => e.stage === 'new'),
    interested: enquiries.filter((e) => e.stage === 'interested'),
    visit_scheduled: enquiries.filter((e) => e.stage === 'visit_scheduled'),
    visited: enquiries.filter((e) => e.stage === 'visited'),
    booked: enquiries.filter((e) => e.stage === 'booked'),
    lost: enquiries.filter((e) => e.stage === 'lost'),
  };

  const orderedStages: EnquiryStage[] = [
    'new',
    'interested',
    'visit_scheduled',
    'visited',
    'booked',
    'lost',
  ];

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result;

    if (!destination) return;

    const fromStage = source.droppableId as EnquiryStage;
    const toStage = destination.droppableId as EnquiryStage;

    if (fromStage === toStage && source.index === destination.index) return;

    // RULE 1: Cannot drag directly into Booked (must use Convert checkout flow)
    if (toStage === 'booked') {
      toast.error('Direct drag to Booked is disabled. Please open detail view and use the Convert flow.');
      return;
    }

    // RULE 2: Dragging to New requires confirmation dialog
    if (toStage === 'new' && fromStage !== 'new') {
      const confirmMove = confirm('Are you sure you want to move this lead back to New Lead stage?');
      if (!confirmMove) return;
    }

    // Capture context for modals
    setPendingMove({
      id: draggableId,
      stage: toStage,
      fromStage,
    });

    // RULE 3: Dragging to Lost prompts LostReasonModal
    if (toStage === 'lost') {
      setLostModalOpen(true);
      return;
    }

    // RULE 4: Dragging to Visit Scheduled prompts VisitScheduleModal
    if (toStage === 'visit_scheduled') {
      setVisitModalOpen(true);
      return;
    }

    // Standard Stage Update Mutation
    updateStageMutation.mutate({
      id: draggableId,
      stage: toStage,
    });
  };

  // Lost modal callback
  const handleLostConfirm = (reason: string, notes: string) => {
    if (!pendingMove) return;
    updateStageMutation.mutate({
      id: pendingMove.id,
      stage: pendingMove.stage,
      lostReason: reason,
      notes: notes,
    });
    setPendingMove(null);
  };

  // Visit Scheduled modal callback
  const handleVisitConfirm = (scheduledAt: string, notes: string) => {
    if (!pendingMove) return;

    const lead = enquiries.find((e) => e.id === pendingMove.id);
    if (!lead) return;

    // Create a new site visit followup item
    const newFollowup = {
      id: `fl-${Math.random().toString(36).substring(2, 7)}`,
      enquiryId: lead.id,
      scheduledAt,
      type: 'visit',
      notes: notes || 'Site Visit scheduled via Kanban drag-and-drop',
      createdAt: new Date().toISOString(),
    };

    // Update parent lead with both stage change and new scheduled visit followup
    updateEnquiryMutation.mutate(
      {
        id: lead.id,
        data: {
          ...lead,
          stage: pendingMove.stage,
          followups: [...lead.followups, newFollowup],
        },
      },
      {
        onSuccess: () => {
          toast.success('Site visit scheduled and stage updated!');
        },
      }
    );

    setPendingMove(null);
  };

  // Skip schedule visit followup callback
  const handleVisitSkip = () => {
    if (!pendingMove) return;
    // Just perform the stage update mutation without adding followups
    updateStageMutation.mutate({
      id: pendingMove.id,
      stage: pendingMove.stage,
    });
    setPendingMove(null);
  };

  return (
    <div className="w-full flex-1 overflow-x-auto min-h-[550px] pb-6 select-none">
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-max h-full">
          {orderedStages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              enquiries={columns[stage] || []}
              onAddEnquiryClick={onAddEnquiryClick}
              onEdit={onEdit}
              onAddFollowup={onAddFollowup}
              onMarkLost={(e) => {
                setPendingMove({ id: e.id, stage: 'lost', fromStage: e.stage });
                setLostModalOpen(true);
              }}
            />
          ))}
        </div>
      </DragDropContext>

      {/* LOST REASON POPUP MODAL */}
      <LostReasonModal
        isOpen={lostModalOpen}
        onClose={() => {
          setLostModalOpen(false);
          setPendingMove(null);
        }}
        onConfirm={handleLostConfirm}
      />

      {/* SITE VISIT SCHEDULER POPUP MODAL */}
      <VisitScheduleModal
        isOpen={visitModalOpen}
        onClose={() => {
          setVisitModalOpen(false);
          handleVisitSkip(); // stage transitions anyway as skipped
        }}
        onConfirm={handleVisitConfirm}
      />

    </div>
  );
}

export default KanbanBoard;
