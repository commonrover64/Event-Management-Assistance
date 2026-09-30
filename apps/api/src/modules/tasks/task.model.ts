import { Schema, model } from 'mongoose';
import type { HydratedDocumentFromSchema } from 'mongoose';
import { ACTORS, CATEGORIES, LEVELS, TASK_STATUSES } from '@xperience/shared';

const taskSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    category: { type: String, enum: CATEGORIES, required: true },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    priority: { type: String, enum: LEVELS, default: 'medium' },
    dueDate: { type: Date, default: null },
    // Id of an embedded sub-event on the parent event
    subEventId: { type: Schema.Types.ObjectId, default: null },
    dependsOn: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    createdBy: { type: String, enum: ACTORS, required: true },
    sourceMessageId: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true },
);

taskSchema.index({ eventId: 1, status: 1 });
taskSchema.index({ eventId: 1, dueDate: 1 });

export type TaskDoc = HydratedDocumentFromSchema<typeof taskSchema>;
export const TaskModel = model('Task', taskSchema);
