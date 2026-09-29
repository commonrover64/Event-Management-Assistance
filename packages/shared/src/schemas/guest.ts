import { z } from 'zod';
import { optionalText, requiredText } from './common';
import type { Timestamps } from './common';
import { guestNeedSchema } from './enums';
import type { GuestNeed } from './enums';

// Planning-level groups ("150 outstation guests"), not individual RSVPs
export const guestSegmentFieldsSchema = z.object({
  label: requiredText(120),
  count: z.number().int().positive(),
  needs: z.array(guestNeedSchema).optional(),
  notes: optionalText(1000),
});
export const createGuestSegmentInputSchema = guestSegmentFieldsSchema;
export const updateGuestSegmentInputSchema = guestSegmentFieldsSchema.partial();
export type CreateGuestSegmentInput = z.infer<typeof createGuestSegmentInputSchema>;
export type UpdateGuestSegmentInput = z.infer<typeof updateGuestSegmentInputSchema>;

export interface GuestSegment extends Timestamps {
  id: string;
  eventId: string;
  label: string;
  count: number;
  needs: GuestNeed[];
  notes: string | null;
}
