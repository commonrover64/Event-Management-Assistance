import { z } from 'zod';
import { requiredText } from './common';
import { levelSchema, riskTypeSchema } from './enums';
import { eventFieldsSchema, subEventFieldsSchema } from './event';
import { guestSegmentFieldsSchema } from './guest';
import { taskFieldsSchema } from './task';
import { vendorFieldsSchema } from './vendor';

// A ref is either a snapshot handle ("T3", "V1") or a `ref` given to an item
// created earlier in the same batch ("new-transfer-task")
export const refSchema = z.string().trim().min(1).max(40);

const newRefSchema = refSchema.describe(
  'Temporary handle for an item created in this turn. Must start with "new-", e.g. "new-transfers".',
);
const optionalRef = { ref: newRefSchema.optional() };

// The AI refers to entities by ref, not database ids
const taskOpFieldsSchema = taskFieldsSchema.omit({ subEventId: true, dependsOn: true }).extend({
  subEvent: refSchema.nullable().optional(),
  dependsOn: z.array(refSchema).max(20).optional(),
});

const vendorOpFieldsSchema = vendorFieldsSchema.omit({ subEventIds: true }).extend({
  subEvents: z.array(refSchema).optional(),
});

const eventPatchSchema = eventFieldsSchema
  .pick({
    title: true,
    status: true,
    startDate: true,
    endDate: true,
    headcount: true,
    budget: true,
    location: true,
  })
  .partial();

export const operationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('updateEvent'), patch: eventPatchSchema }),

  z.object({ op: z.literal('addSubEvent'), ...optionalRef, data: subEventFieldsSchema }),
  z.object({
    op: z.literal('updateSubEvent'),
    target: refSchema,
    patch: subEventFieldsSchema.partial(),
  }),

  z.object({ op: z.literal('addTask'), ...optionalRef, data: taskOpFieldsSchema }),
  z.object({ op: z.literal('updateTask'), target: refSchema, patch: taskOpFieldsSchema.partial() }),

  z.object({ op: z.literal('addVendor'), ...optionalRef, data: vendorOpFieldsSchema }),
  z.object({
    op: z.literal('updateVendor'),
    target: refSchema,
    patch: vendorOpFieldsSchema.partial(),
  }),

  z.object({ op: z.literal('addGuestSegment'), ...optionalRef, data: guestSegmentFieldsSchema }),
  z.object({
    op: z.literal('updateGuestSegment'),
    target: refSchema,
    patch: guestSegmentFieldsSchema.partial(),
  }),

  z.object({
    op: z.literal('addRisk'),
    data: z.object({
      type: riskTypeSchema,
      severity: levelSchema,
      title: requiredText(160),
      description: requiredText(1000),
      related: z.array(refSchema).max(10).optional(),
      suggestions: z.array(requiredText(200)).max(5).optional(),
    }),
  }),
  z.object({ op: z.literal('resolveRisk'), target: refSchema }),
]);
export type Operation = z.infer<typeof operationSchema>;
export type OperationType = Operation['op'];

// Operations stay `unknown` here so each one is validated on its own:
// one malformed operation should not throw away the rest of the turn
export const assistantTurnSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
  operations: z.array(z.unknown()).max(30),
});
export type AssistantTurn = z.infer<typeof assistantTurnSchema>;
