import type { Document } from 'mongoose';

const MAX_INLINE_LENGTH = 40;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'none';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(formatValue).join(', ') || 'none';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').toLowerCase();
}

/**
 * Applies only the fields that actually change and describes them,
 * e.g. ["status → done", "description updated"]. Values must already be DB-ready.
 */
export function applyPatch(doc: Document, patch: Record<string, unknown>): string[] {
  const changes: string[] = [];

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const before = formatValue(doc.get(key));
    const after = formatValue(value);
    if (before === after) continue;

    doc.set(key, value);
    changes.push(
      after.length <= MAX_INLINE_LENGTH
        ? `${humanize(key)} → ${after}`
        : `${humanize(key)} updated`,
    );
  }

  return changes;
}
