import { LEVELS } from '@xperience/shared';
import type { Category, Level, SuggestedAction, Task, Vendor } from '@xperience/shared';

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(iso: string, now: Date): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}

// Gaps matter more the closer the event is
export function urgencyFor(daysLeft: number): Level {
  if (daysLeft <= 14) return 'critical';
  if (daysLeft <= 30) return 'high';
  if (daysLeft <= 60) return 'medium';
  return 'low';
}

export function maxLevel(...levels: Level[]): Level {
  return levels.reduce((a, b) => (LEVELS.indexOf(b) > LEVELS.indexOf(a) ? b : a), 'low');
}

export const isOpenTask = (t: Task) => t.status !== 'done' && t.status !== 'cancelled';
export const isActiveTask = (t: Task) => t.status !== 'cancelled';

export function confirmedVendors(vendors: Vendor[], category: Category): Vendor[] {
  return vendors.filter((v) => v.status === 'confirmed' && v.category === category);
}

export function hasActiveTask(tasks: Task[], category: Category): boolean {
  return tasks.some((t) => isActiveTask(t) && t.category === category);
}

export function addTaskAction(
  label: string,
  data: { title: string; category: Category; priority?: Level; subEvent?: string },
): SuggestedAction {
  return { label, operations: [{ op: 'addTask', data: { priority: 'high', ...data } }] };
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
