import React from 'react';
import { Check, X } from 'lucide-react';
import { EnquiryStage } from '@/types/enquiry';

interface StageStepperProps {
  currentStage: EnquiryStage;
  onStageClick?: (stage: EnquiryStage) => void;
}

export function StageStepper({ currentStage, onStageClick }: StageStepperProps) {
  // Ordered list of pipeline stages
  const stages: { key: EnquiryStage; label: string }[] = [
    { key: 'new', label: 'New Lead' },
    { key: 'interested', label: 'Interested' },
    { key: 'visit_scheduled', label: 'Visit Scheduled' },
    { key: 'visited', label: 'Visited' },
    { key: 'booked', label: 'Booked' },
  ];

  const currentIdx = stages.findIndex((s) => s.key === currentStage);
  const isLost = currentStage === 'lost';

  return (
    <div className="w-full py-4 select-none">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
        {stages.map((stage, idx) => {
          // Determine state of this stage bubble
          let state: 'completed' | 'current' | 'upcoming' | 'lost' = 'upcoming';

          if (isLost && stage.key === 'booked') {
            state = 'lost';
          } else if (currentStage === stage.key) {
            state = 'current';
          } else if (!isLost && currentIdx > idx) {
            state = 'completed';
          } else if (isLost && idx < 4) {
            // For lost, all steps before booked are marked completed
            state = 'completed';
          }

          const isClickable = !!onStageClick && stage.key !== 'booked' && currentStage !== 'booked' && currentStage !== 'lost';

          return (
            <React.Fragment key={stage.key}>
              {/* Connector Line (except for the first item) */}
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    isLost && idx === 4
                      ? 'bg-rose-500'
                      : state === 'completed' || state === 'current'
                      ? 'bg-violet-600'
                      : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Stage Step Bubble */}
              <div className="flex flex-col items-center relative group">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStageClick(stage.key)}
                  className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all select-none duration-150 ${
                    isClickable ? 'hover:scale-110 hover:shadow-custom-sm cursor-pointer' : ''
                  } ${
                    state === 'completed'
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : state === 'current'
                      ? 'bg-white border-violet-600 text-violet-600 shadow-sm'
                      : state === 'lost'
                      ? 'bg-rose-50 border-rose-500 text-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : state === 'lost' ? (
                    <X className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                  )}
                </button>

                {/* Bubble label */}
                <span
                  className={`text-[9px] font-bold tracking-tight uppercase mt-2 whitespace-nowrap absolute top-7 text-center transition-colors ${
                    state === 'current'
                      ? 'text-violet-650'
                      : state === 'lost'
                      ? 'text-rose-505 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {state === 'lost' ? 'Lost' : stage.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {/* Spacer to balance the absolute absolute positioned labels */}
      <div className="h-3" />
    </div>
  );
}

export default StageStepper;
