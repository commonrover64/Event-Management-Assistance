import type { Level } from '@xperience/shared';

// "guest_segment" → "Guest segment"
export function humanize(value: string): string {
  const spaced = value.replaceAll('_', ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const SEVERITY_ORDER: Level[] = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_STYLES: Record<Level, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  low: 'bg-muted text-muted-foreground',
};
