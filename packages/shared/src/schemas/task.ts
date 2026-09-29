import { z } from 'zod';
import { dateInputSchema, objectIdSchema, optionalText, requiredText } from './common';
import type { Timestamps } from './common';
import { categorySchema, levelSchema, taskStatusSchema } from './enums';
import type { Actor, Category, Level, TaskStatus } from './enums';

export const taskFieldsSchema = z.object({
  title: requiredText(200),
  description: optionalText(2000),
  category: categorySchema,
  status: taskStatusSchema.optional(),
  priority: levelSchema.optional(),
  dueDate: dateInputSchema.nullable().optional(),
  subEventId: objectIdSchema.nullable().optional(),
  dependsOn: z.array(objectIdSchema).max(20).optional(),
});
export const createTaskInputSchema = taskFieldsSchema;
export const updateTaskInputSchema = taskFieldsSchema.partial();
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export interface Task extends Timestamps {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  category: Category;
  status: TaskStatus;
  priority: Level;
  dueDate: string | null;
  subEventId: string | null;
  dependsOn: string[];
  createdBy: Actor;
  sourceMessageId: string | null;
}
