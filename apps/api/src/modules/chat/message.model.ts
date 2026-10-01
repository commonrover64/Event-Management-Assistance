import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { MESSAGE_ROLES } from '@xperience/shared';

const rejectedOperationSchema = new Schema(
  {
    operation: { type: Schema.Types.Mixed },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    role: { type: String, enum: MESSAGE_ROLES, required: true },
    content: { type: String, required: true },
    // Applied changes are not stored here: they are read from the activity log by messageId
    rejected: { type: [rejectedOperationSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

messageSchema.index({ eventId: 1, createdAt: -1 });

export type MessageDoc = HydratedDocumentFromSchema<typeof messageSchema>;
export const MessageModel = model('Message', messageSchema);
