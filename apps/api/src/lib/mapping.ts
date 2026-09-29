import type { Types } from 'mongoose';

export function toId(id: Types.ObjectId | string): string {
  return typeof id === 'string' ? id : id.toString();
}

export function toIso(date: Date): string {
  return date.toISOString();
}

export function toIsoOrNull(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

// undefined = "leave unchanged", null = "clear", string = new date
export function parseDateInput(value: string | null | undefined): Date | null | undefined {
  if (value === undefined || value === null) return value;
  return new Date(value);
}

export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
