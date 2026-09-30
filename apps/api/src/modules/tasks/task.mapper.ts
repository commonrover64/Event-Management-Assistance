import type { Task } from '@xperience/shared';
import { toId, toIso, toIsoOrNull } from '../../lib/mapping';
import type { TaskDoc } from './task.model';

export function toTask(task: TaskDoc): Task {
  return {
    id: toId(task._id),
    eventId: toId(task.eventId),
    title: task.title,
    description: task.description ?? null,
    category: task.category,
    status: task.status,
    priority: task.priority,
    dueDate: toIsoOrNull(task.dueDate),
    subEventId: task.subEventId ? toId(task.subEventId) : null,
    dependsOn: task.dependsOn.map(toId),
    createdBy: task.createdBy,
    sourceMessageId: task.sourceMessageId ? toId(task.sourceMessageId) : null,
    createdAt: toIso(task.createdAt),
    updatedAt: toIso(task.updatedAt),
  };
}
