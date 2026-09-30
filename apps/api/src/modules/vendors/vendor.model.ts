import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { CATEGORIES, VENDOR_STATUSES } from '@xperience/shared';

const vendorSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    status: { type: String, enum: VENDOR_STATUSES, default: 'shortlisted' },
    capacity: { type: Number, default: null },
    cost: { type: Number, default: null },
    // Ids of embedded sub-events this vendor covers
    subEventIds: [{ type: Schema.Types.ObjectId }],
    contact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
    },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

vendorSchema.index({ eventId: 1, category: 1 });

export type VendorDoc = HydratedDocumentFromSchema<typeof vendorSchema>;
export const VendorModel = model('Vendor', vendorSchema);
