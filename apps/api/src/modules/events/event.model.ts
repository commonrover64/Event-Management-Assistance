import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { EVENT_STATUSES, EVENT_TYPES, SUB_EVENT_STATUSES } from '@xperience/shared';

const subEventSchema = new Schema({
  name: { type: String, required: true, trim: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, default: null },
  venue: { type: String, default: null },
  expectedGuests: { type: Number, default: null },
  status: { type: String, enum: SUB_EVENT_STATUSES, default: 'planned' },
  notes: { type: String, default: null },
});

const eventSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    status: { type: String, enum: EVENT_STATUSES, default: 'planning' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, required: true },
    headcount: { type: Number, required: true, min: 1 },
    budget: { type: Number, default: null },
    location: { type: String, default: null },
    description: { type: String, default: null },
    subEvents: { type: [subEventSchema], default: [] },
  },
  { timestamps: true },
);

eventSchema.index({ ownerId: 1, startDate: 1 });

export type EventDoc = HydratedDocumentFromSchema<typeof eventSchema>;
export const EventModel = model('Event', eventSchema);
