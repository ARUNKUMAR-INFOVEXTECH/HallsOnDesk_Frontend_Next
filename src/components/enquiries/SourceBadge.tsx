import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Camera,
  Users,
  Search,
  Share2,
  PhoneCall,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { EnquirySource } from '@/types/enquiry';

interface SourceBadgeProps {
  source: EnquirySource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const configs: Record<EnquirySource, { label: string; icon: LucideIcon; className: string; iconColor: string }> = {
    walk_in: {
      label: 'Walk-In',
      icon: MapPin,
      className: 'bg-gray-150 text-slate-700 border-gray-250',
      iconColor: 'text-slate-500',
    },
    phone: {
      label: 'Phone Call',
      icon: Phone,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-505',
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: MessageCircle,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-505',
    },
    instagram: {
      label: 'Instagram',
      icon: Camera,
      className: 'bg-pink-50 text-pink-700 border-pink-200',
      iconColor: 'text-pink-505',
    },
    facebook: {
      label: 'Facebook',
      icon: Users,
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-505',
    },
    google: {
      label: 'Google',
      icon: Search,
      className: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-505',
    },
    referral: {
      label: 'Referral',
      icon: Share2,
      className: 'bg-violet-50 text-violet-700 border-violet-200',
      iconColor: 'text-violet-505',
    },
    justdial: {
      label: 'JustDial',
      icon: PhoneCall,
      className: 'bg-orange-50 text-orange-705 border-orange-200',
      iconColor: 'text-orange-500',
    },
    other: {
      label: 'Other',
      icon: MoreHorizontal,
      className: 'bg-slate-100 text-slate-655 border-slate-200',
      iconColor: 'text-slate-400',
    },
  };

  const config = configs[source] || configs.other;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${config.className}`}>
      <Icon className={`h-3 w-3 shrink-0 ${config.iconColor}`} />
      <span>{config.label}</span>
    </span>
  );
}

export default SourceBadge;
