/**
 * Validates whether a given subscription plan supports a specific feature module.
 * 
 * Basic SaaS Plan (₹1,999): Core Booking, Calendar, Classic Invoice, Basic Alerts, 2 Staff.
 * Digital Transformation (₹2,299): Core Booking, Calendar, All Invoices, Basic Alerts, 5 Staff, CRM/Enquiries, Vendors, Payroll, Advanced Reports.
 * Premium SaaS Plan (₹3,999): Core Booking, Calendar, All Invoices, Basic Alerts, 10 Staff, Multi-Hall, WhatsApp Alerts, Support.
 * Premium DT Plan (₹4,999): All features, 15 Staff.
 */
export type SaaSFeature = 'crm' | 'vendors' | 'payroll' | 'reports' | 'multihall' | 'whatsapp' | 'support';

/**
 * Validates a feature against a package name.
 */
export function packageHasFeature(packageName: string, feature: SaaSFeature): boolean {
  const planName = (packageName || '').toLowerCase();
  
  switch (feature) {
    case 'crm':
      // Allowed in Digital Transformation and Premium plans
      return planName.includes('transformation') || planName.includes('premium') || planName.includes('pro') || planName.includes('deluxe');
      
    case 'vendors':
      // Allowed in Premium plans only (restricted in Digital Transformation plan)
      return planName.includes('premium');
      
    case 'payroll':
      // Payroll module is removed universally
      return false;
      
    case 'reports':
      // Requires a Digital Transformation plan (Digital Transformation or Premium DT)
      return planName.includes('transformation') || planName.includes('pro') || planName.includes('deluxe');
      
    case 'multihall':
    case 'whatsapp':
    case 'support':
      // Requires a Premium plan (contains 'premium')
      return planName.includes('premium');
      
    default:
      return false;
  }
}

/**
 * Validates a feature against an active subscription object.
 */
export function hasFeature(activeSubscription: any, feature: SaaSFeature): boolean {
  if (!activeSubscription) return false;
  
  // Extract plan name from either nested packages or raw plan field
  const planName = 
    activeSubscription.plan || 
    activeSubscription.packages?.name || 
    '';

  return packageHasFeature(planName, feature);
}
