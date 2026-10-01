import { z } from 'zod';

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

// Inputs accept "2026-10-09" or a full ISO datetime; outputs are always full ISO strings
export const dateInputSchema = z.union([z.iso.datetime({ offset: true }), z.iso.date()]);

export const timezoneSchema = z.string().refine(isValidTimezone, 'Invalid IANA timezone');

export const requiredText = (max: number) => z.string().trim().min(1).max(max);
// null clears the field on update, same as other nullable inputs
export const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
