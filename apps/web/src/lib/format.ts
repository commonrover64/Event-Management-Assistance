const DAY_MS = 24 * 60 * 60 * 1000;

// Dates are shown in the event's own timezone, not the viewer's
export function formatDateRange(startIso: string, endIso: string, timeZone: string): string {
  const format = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return format.formatRange(new Date(startIso), new Date(endIso));
}

export function daysUntil(iso: string, now = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}

export function describeCountdown(days: number): string {
  if (days > 1) return `in ${days} days`;
  if (days === 1) return 'tomorrow';
  if (days === 0) return 'today';
  return 'past';
}

export const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
