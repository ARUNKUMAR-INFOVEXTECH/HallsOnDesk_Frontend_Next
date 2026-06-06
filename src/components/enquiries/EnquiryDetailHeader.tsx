'use client';

import React from 'react';
import { ArrowLeft, Pencil, ArrowRightCircle, XCircle, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Enquiry, EnquiryStage } from '@/types/enquiry';
import { StageStepper } from './StageStepper';
import { StageBadge } from './StageBadge';
import { SourceBadge } from './SourceBadge';

interface EnquiryDetailHeaderProps {
  enquiry: Enquiry;
  onEdit: () => void;
  onConvert: () => void;
  onMarkLost: () => void;
  onStageChange: (stage: EnquiryStage) => void;
}

export function EnquiryDetailHeader({
  enquiry,
  onEdit,
  onConvert,
  onMarkLost,
  onStageChange,
}: EnquiryDetailHeaderProps) {
  const priorityColors = {
    high: 'bg-rose-500 ring-4 ring-rose-500/10',
    medium: 'bg-amber-505 ring-4 ring-amber-500/10',
    low: 'bg-slate-400 ring-4 ring-slate-400/10',
  };

  const getRelativeAge = () => {
    try {
      return formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-xl shadow-sm p-5 space-y-5 select-none">
      
      {/* Top back route */}
      <div>
        <Link
          href="/dashboard/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-650 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Enquiries Dashboard
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        
        {/* Left Side: Meta Details */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`h-3 w-3 rounded-full ${
                priorityColors[enquiry.priority] || priorityColors.medium
              }`}
              title={`${enquiry.priority} priority`}
            />
            <span className="font-mono text-xs font-extrabold text-violet-650 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
              {enquiry.enquiryNumber}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-sans">
              Created {getRelativeAge()}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {enquiry.name}
          </h2>

          {/* Contact Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <a href={`tel:${enquiry.phone}`} className="hover:text-violet-650 hover:underline">
                {enquiry.phone}
              </a>
            </span>
            {enquiry.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <a href={`mailto:${enquiry.email}`} className="hover:text-violet-650 hover:underline">
                  {enquiry.email}
                </a>
              </span>
            )}
            {enquiry.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{enquiry.city}</span>
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <SourceBadge source={enquiry.source} />
            <span className="bg-slate-100 border border-slate-200 text-slate-655 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
              {enquiry.eventType}
            </span>
            {enquiry.eventDate && (
              <span className="inline-flex items-center gap-1 bg-violet-50/50 text-violet-755 border border-violet-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                <Calendar className="h-3.5 w-3.5 text-violet-600" />
                Date: {enquiry.eventDate}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Stage Stepper + Primary Actions */}
        <div className="flex flex-col items-stretch xl:items-end gap-4 shrink-0 w-full xl:w-auto">
          {/* Stepper progress */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 w-full max-w-xl">
            <StageStepper currentStage={enquiry.stage} onStageClick={onStageChange} />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5 flex-wrap self-end xl:self-auto">
            <StageBadge stage={enquiry.stage} size="md" />

            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 h-8.5 px-3.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4 text-slate-400" />
              <span>Edit Details</span>
            </button>

            {enquiry.stage !== 'lost' && enquiry.stage !== 'booked' && (
              <>
                <button
                  onClick={onMarkLost}
                  className="flex items-center justify-center gap-1.5 h-8.5 px-3.5 border border-rose-200 hover:bg-rose-50 text-rose-650 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-rose-500" />
                  <span>Mark Lost</span>
                </button>

                <button
                  onClick={onConvert}
                  className="flex items-center justify-center gap-1.5 h-8.5 px-4.5 bg-violet-650 hover:bg-violet-755 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <ArrowRightCircle className="h-4.5 w-4.5 text-white" />
                  <span>Convert to Booking</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EnquiryDetailHeader;
