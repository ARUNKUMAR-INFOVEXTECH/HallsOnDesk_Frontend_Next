export type VendorCategory =
  | 'caterer'
  | 'decorator'
  | 'photographer'
  | 'videographer'
  | 'dj'
  | 'band'
  | 'florist'
  | 'lighting'
  | 'sound'
  | 'tent'
  | 'transport'
  | 'security'
  | 'cleaning'
  | 'other';

export type VendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  city: string;
  state: string;
  gstNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  rating: number;
  totalEngagements: number;
  totalAmountPaid: number;
  lastEngagementDate?: string;
  status: VendorStatus;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  categoryCounts: Record<VendorCategory, number>;
  topCategory: VendorCategory;
  totalAmountPaid: number;
}
