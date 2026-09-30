import type { CreateTaskInput, Task, UpdateTaskInput } from '@xperience/shared';
import { notFound } from '../../lib/errors';
import { omitUndefined, parseDateInput } from '../../lib/mapping';
import { applyPatch } from '../../lib/patch';
import { recordActivity, statusChangeAction } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { assertSubEventsExist } from '../events/events.service';
import { assertValidDependencies } from './task-dependencies';
import { toTask } from './task.mapper';
import { TaskModel } from './task.model';
import type { TaskDoc } from './task.model';

function toTaskDbFields(input: UpdateTaskInput) {
  const { dueDate, dependsOn, ...rest } = input;
  return omitUndefined({
    ...rest,
    dueDate: parseDateInput(dueDate),
    dependsOn: dependsOn && [...new Set(dependsOn)],
  });
}

async function assertValidReferences(
  ctx: MutationContext,
  input: UpdateTaskInput,
  taskId?: string,
) {
  if (input.subEventId) await assertSubEventsExist(ctx.eventId, [input.subEventId]);
  if (input.dependsOn) await assertValidDependencies(ctx.eventId, input.dependsOn, taskId);
}

export async function findTaskOrThrow(eventId: string, taskId: string): Promise<TaskDoc> {
  const task = await TaskModel.findOne({ _id: taskId, eventId });
  if (!task) throw notFound('Task');
  return task;
}

export async function listTasks(eventId: string): Promise<Task[]> {
  const tasks = await TaskModel.find({ eventId }).sort({ dueDate: 1, createdAt: 1 });
  return tasks.map(toTask);
}

export async function createTask(ctx: MutationContext, input: CreateTaskInput): Promise<Task> {
  await assertValidReferences(ctx, input);

  const task = await TaskModel.create({
    ...toTaskDbFields(input),
    eventId: ctx.eventId,
    createdBy: ctx.actor,
    sourceMessageId: ctx.messageId,
  });

  await recordActivity(ctx, {
    entityType: 'task',
    entityId: task._id.toString(),
    action: 'created',
    summary: `Created task "${task.title}"`,
  });
  return toTask(task);
}

export async function updateTask(
  ctx: MutationContext,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const task = await findTaskOrThrow(ctx.eventId, taskId);
  await assertValidReferences(ctx, input, taskId);

  const statusBefore = task.status;
  const changes = applyPatch(task, toTaskDbFields(input));
  if (changes.length === 0) return toTask(task);

  await task.save();
  await recordActivity(ctx, {
    entityType: 'task',
    entityId: taskId,
    action: statusChangeAction(statusBefore, task.status),
    summary: `Updated task "${task.title}": ${changes.join(', ')}`,
  });
  return toTask(task);
}

export async function deleteTask(ctx: MutationContext, taskId: string): Promise<void> {
  const task = await findTaskOrThrow(ctx.eventId, taskId);

  // Other tasks must not keep pointing at a task that no longer exists
  await TaskModel.updateMany(
    { eventId: ctx.eventId, dependsOn: taskId },
    { $pull: { dependsOn: taskId } },
  );
  await task.deleteOne();

  await recordActivity(ctx, {
    entityType: 'task',
    entityId: taskId,
    action: 'deleted',
    summary: `Deleted task "${task.title}"`,
  });
}
