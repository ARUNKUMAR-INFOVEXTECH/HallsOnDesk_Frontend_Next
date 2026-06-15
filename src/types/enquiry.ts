export type EventType =
  | 'wedding'
  | 'engagement'
  | 'reception'
  | 'birthday'
  | 'corporate'
  | 'anniversary'
  | 'other';

export type EnquirySource =
  | 'walk_in'
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'google'
  | 'referral'
  | 'justdial'
  | 'other';

export type EnquiryStage =
  | 'new'
  | 'interested'
  | 'visit_scheduled'
  | 'visited'
  | 'booked'
  | 'lost';

export type EnquiryPriority = 'high' | 'medium' | 'low';

export type FollowupType = 'call' | 'whatsapp' | 'visit' | 'email' | 'other';

export interface Followup {
  id: string;
  enquiryId: string;
  scheduledAt: string; // ISO datetime string
  completedAt?: string; // ISO datetime string
  type: FollowupType;
  notes?: string;
  outcome?: string;
  nextFollowupAt?: string; // ISO datetime string
  createdAt: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  eventType: EventType;
  eventDate?: string; // ISO date string (YYYY-MM-DD)
  guestCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  hallSection?: string;
  source: EnquirySource;
  stage: EnquiryStage;
  priority: EnquiryPriority;
  assignedTo?: string;
  assignee?: { id: string; name: string; email: string };
  customerId?: string;
  bookingId?: string;
  convertedAt?: string; // ISO datetime string
  lostReason?: string;
  notes?: string;
  followups: Followup[];
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryStats {
  total: number;
  new: number;
  interested: number;
  visit_scheduled: number;
  visited: number;
  booked: number;
  lost: number;
  conversionRate: number;
  todayFollowups: number;
  overdueFollowups: number;
}
