import { z } from 'zod';
import { dateInputSchema, optionalText, requiredText, timezoneSchema } from './common';
import type { Timestamps } from './common';
import { eventStatusSchema, eventTypeSchema, subEventStatusSchema } from './enums';
import type { EventStatus, EventType, SubEventStatus } from './enums';

export const subEventFieldsSchema = z.object({
  name: requiredText(100),
  startAt: dateInputSchema,
  endAt: dateInputSchema.nullable().optional(),
  venue: optionalText(200),
  expectedGuests: z.number().int().positive().nullable().optional(),
  status: subEventStatusSchema.optional(),
  notes: optionalText(1000),
});
export const createSubEventInputSchema = subEventFieldsSchema;
export const updateSubEventInputSchema = subEventFieldsSchema.partial();
export type CreateSubEventInput = z.infer<typeof createSubEventInputSchema>;
export type UpdateSubEventInput = z.infer<typeof updateSubEventInputSchema>;

export const eventFieldsSchema = z.object({
  title: requiredText(120),
  type: eventTypeSchema,
  status: eventStatusSchema.optional(),
  startDate: dateInputSchema,
  endDate: dateInputSchema,
  timezone: timezoneSchema,
  headcount: z.number().int().positive(),
  budget: z.number().nonnegative().nullable().optional(),
  location: optionalText(200),
  description: optionalText(2000),
});

export const createEventInputSchema = eventFieldsSchema.refine(
  (e) => new Date(e.endDate) >= new Date(e.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] },
);
// Cross-field date checks on update happen in the service, which knows the stored values
export const updateEventInputSchema = eventFieldsSchema.partial();
export type CreateEventInput = z.infer<typeof createEventInputSchema>;
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

export interface SubEvent {
  id: string;
  name: string;
  startAt: string;
  endAt: string | null;
  venue: string | null;
  expectedGuests: number | null;
  status: SubEventStatus;
  notes: string | null;
}

// Not named "Event" because that collides with the browser's built-in DOM Event type
export interface EventDetails extends Timestamps {
  id: string;
  ownerId: string;
  title: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  timezone: string;
  headcount: number;
  budget: number | null;
  location: string | null;
  description: string | null;
  subEvents: SubEvent[];
}
