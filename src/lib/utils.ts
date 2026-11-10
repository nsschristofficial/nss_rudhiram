import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Not available';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Not available';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function daysSince(dateString?: string | null): number | null {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  const diffTime = Math.abs(Date.now() - d.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isEligibleByDate(dateString?: string | null): boolean {
  if (!dateString) return true; // never donated before or unknown
  const days = daysSince(dateString);
  if (days === null) return true;
  return days >= 90; // 90 days (3 months) standard medical interval for whole blood
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function isValidIndianMobile(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  // Match 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function generateWhatsAppLink(
  mobile: string,
  donorName: string,
  bloodGroup: string,
  patientOrHospital?: string
): string {
  const cleaned = cleanPhone(mobile);
  const targetNumber = cleaned.length === 10 ? `91${cleaned}` : cleaned;
  const context = patientOrHospital
    ? ` for a patient requirement at ${patientOrHospital}`
    : '';
  const message = encodeURIComponent(
    `Hello ${donorName}, we are contacting you from the NSS RUDHIRAM team, Christ College (Autonomous), Irinjalakuda regarding a voluntary blood donation requirement${context} (${bloodGroup}). Please let us know if you are available and interested in helping. Thank you!`
  );
  return `https://wa.me/${targetNumber}?text=${message}`;
}

export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Prevent CSV formula injection by prepending quote if starts with =,+,-,@,\t,\r
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
