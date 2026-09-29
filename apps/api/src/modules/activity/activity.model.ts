import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { ACTIVITY_ACTIONS, ACTORS, ENTITY_TYPES } from '@xperience/shared';

const activitySchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    entityType: { type: String, enum: ENTITY_TYPES, required: true },
    // String, not ObjectId: sub-events and the event itself are logged too
    entityId: { type: String, required: true },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    summary: { type: String, required: true },
    actor: { type: String, enum: ACTORS, required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ eventId: 1, createdAt: -1 });
activitySchema.index({ messageId: 1 });

export type ActivityDoc = HydratedDocumentFromSchema<typeof activitySchema>;
export const ActivityModel = model('Activity', activitySchema);
