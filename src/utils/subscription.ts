/**
 * Validates whether a given subscription plan supports a specific feature module.
 * 
 * Basic SaaS Plan (₹1,999): Core Booking, Calendar, Classic Invoice, Basic Alerts, 2 Staff.
 * Digital Transformation (₹2,299): Core Booking, Calendar, All Invoices, Basic Alerts, 5 Staff, CRM/Enquiries, Vendors, Payroll, Advanced Reports.
 * Premium SaaS Plan (₹3,999): Core Booking, Calendar, All Invoices, Basic Alerts, 10 Staff, Multi-Hall, WhatsApp Alerts, Support.
 * Premium DT Plan (₹4,999): All features, 15 Staff.
 */
export type SaaSFeature = 'crm' | 'vendors' | 'payroll' | 'reports' | 'multihall' | 'whatsapp';

export function hasFeature(activeSubscription: any, feature: SaaSFeature): boolean {
  if (!activeSubscription) return false;
  
  // Extract plan name from either nested packages or raw plan field
  const planName = (
    activeSubscription.plan || 
    activeSubscription.packages?.name || 
    ''
  ).toLowerCase();

  switch (feature) {
    case 'crm':
    case 'vendors':
    case 'payroll':
    case 'reports':
      // Requires a Digital Transformation plan (contains 'transformation', 'pro', 'deluxe')
      return planName.includes('transformation') || planName.includes('pro') || planName.includes('deluxe');
      
    case 'multihall':
    case 'whatsapp':
      // Requires a Premium plan (contains 'premium')
      return planName.includes('premium');
      
    default:
      return false;
  }
}
