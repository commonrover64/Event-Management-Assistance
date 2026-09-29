import type { Request, Response } from 'express';
import {
  createEventInputSchema,
  createSubEventInputSchema,
  updateEventInputSchema,
  updateSubEventInputSchema,
} from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getAuthUserId } from '../../middleware/require-auth';
import { getEventId, userMutationContext } from './event-access';
import * as eventsService from './events.service';

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ events: await eventsService.listEvents(getAuthUserId(req)) });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createEventInputSchema.parse(req.body);
  res.status(201).json({ event: await eventsService.createEvent(getAuthUserId(req), input) });
}

export async function get(req: Request, res: Response): Promise<void> {
  res.json({ event: await eventsService.getEvent(getEventId(req)) });
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = updateEventInputSchema.parse(req.body);
  res.json({ event: await eventsService.updateEvent(userMutationContext(req), input) });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await eventsService.deleteEvent(getEventId(req));
  res.status(204).end();
}

export async function addSubEvent(req: Request, res: Response): Promise<void> {
  const input = createSubEventInputSchema.parse(req.body);
  res.status(201).json({ event: await eventsService.addSubEvent(userMutationContext(req), input) });
}

export async function updateSubEvent(req: Request, res: Response): Promise<void> {
  const input = updateSubEventInputSchema.parse(req.body);
  const event = await eventsService.updateSubEvent(
    userMutationContext(req),
    paramId(req, 'subEventId'),
    input,
  );
  res.json({ event });
}

export async function removeSubEvent(req: Request, res: Response): Promise<void> {
  const event = await eventsService.deleteSubEvent(
    userMutationContext(req),
    paramId(req, 'subEventId'),
  );
  res.json({ event });
}
