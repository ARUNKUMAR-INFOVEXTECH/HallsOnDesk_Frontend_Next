/**
 * Formats a number to Indian Rupee (INR) currency style.
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an ISO date string to DD/MM/YYYY format.
 * Example: "2026-06-09T10:30:00Z" → "09/06/2026"
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO date string to DD/MM/YYYY with time (HH:MM).
 * Example: "2026-06-09T10:30:00Z" → "09/06/2026, 10:30"
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO date string to a short "DD MMM" label (e.g. "09 Jun").
 * Used in chart axis labels and compact UI.
 */
export function formatDateShort(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return dateString ?? '-';
  }
}

/**
 * Gets the current date in local timezone as YYYY-MM-DD.
 * Prevents timezone shift bugs common with toISOString().
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current date and time in local timezone as YYYY-MM-DDTHH:MM.
 * Prevents timezone shift bugs in HTML5 datetime-local inputs.
 */
export function getLocalDateTimeString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formats a start and optional end date/time string into a customer-friendly event slot range.
 * Example same-day: "28/06/2026, 09:00 - 15:00"
 * Example multi-day: "28/06/2026, 09:00 - 29/06/2026, 15:00"
 * Example date-only: "28/06/2026"
 */
export function formatEventSlot(startDateStr: string | undefined | null, endDateStr?: string | null): string {
  if (!startDateStr) return '-';
  try {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) return startDateStr;

    // Check if there is time specified
    const hasTime = startDateStr.includes('T') || startDateStr.includes(' ') || startDateStr.includes(':');
    
    const startDay = String(startDate.getDate()).padStart(2, '0');
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startYear = startDate.getFullYear();
    const startDateFormatted = `${startDay}/${startMonth}/${startYear}`;
    
    if (!hasTime) return startDateFormatted;

    const startHours = String(startDate.getHours()).padStart(2, '0');
    const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
    const startTimeFormatted = `${startHours}:${startMinutes}`;

    if (!endDateStr) {
      return `${startDateFormatted}, ${startTimeFormatted}`;
    }

    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      return `${startDateFormatted}, ${startTimeFormatted}`;
    }

    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endYear = endDate.getFullYear();
    const endDateFormatted = `${endDay}/${endMonth}/${endYear}`;

    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    const endTimeFormatted = `${endHours}:${endMinutes}`;

    if (startDateFormatted === endDateFormatted) {
      return `${startDateFormatted}, ${startTimeFormatted} - ${endTimeFormatted}`;
    } else {
      return `${startDateFormatted}, ${startTimeFormatted} - ${endDateFormatted}, ${endTimeFormatted}`;
    }
  } catch {
    return startDateStr;
  }
}
