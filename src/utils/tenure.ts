/**
 * Calculates human-readable tenure since the joining date.
 * Returns formats like: "2 years 3 months", "8 months", or "Just joined".
 * @param joiningDate The ISO date string or date format.
 */
export function calculateTenure(joiningDate: string): string {
  if (!joiningDate) return 'Just joined';
  const start = new Date(joiningDate);
  if (isNaN(start.getTime())) return 'Just joined';
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) {
    return 'Just joined';
  }
  
  if (years === 0 && months === 0) {
    // If less than a month
    const diffDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return 'Just joined';
    return '1 month';
  }
  
  const yearStr = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';
  
  if (yearStr && monthStr) {
    return `${yearStr} ${monthStr}`;
  }
  return yearStr || monthStr || 'Just joined';
}
