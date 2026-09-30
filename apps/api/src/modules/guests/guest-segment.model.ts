import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { GUEST_NEEDS } from '@xperience/shared';

const guestSegmentSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    label: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1 },
    needs: [{ type: String, enum: GUEST_NEEDS }],
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

export type GuestSegmentDoc = HydratedDocumentFromSchema<typeof guestSegmentSchema>;
export const GuestSegmentModel = model('GuestSegment', guestSegmentSchema);
