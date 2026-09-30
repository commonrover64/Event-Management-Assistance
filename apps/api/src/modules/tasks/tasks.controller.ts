import type { Request, Response } from 'express';
import { createTaskInputSchema, updateTaskInputSchema } from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getEventId, userMutationContext } from '../events/event-access';
import * as tasksService from './tasks.service';

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ tasks: await tasksService.listTasks(getEventId(req)) });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createTaskInputSchema.parse(req.body);
  res.status(201).json({ task: await tasksService.createTask(userMutationContext(req), input) });
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = updateTaskInputSchema.parse(req.body);
  const task = await tasksService.updateTask(
    userMutationContext(req),
    paramId(req, 'taskId'),
    input,
  );
  res.json({ task });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await tasksService.deleteTask(userMutationContext(req), paramId(req, 'taskId'));
  res.status(204).end();
}
