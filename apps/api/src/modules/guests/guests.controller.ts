import type { Request, Response } from 'express';
import { createGuestSegmentInputSchema, updateGuestSegmentInputSchema } from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getEventId, userMutationContext } from '../events/event-access';
import * as guestsService from './guests.service';

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ guestSegments: await guestsService.listSegments(getEventId(req)) });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createGuestSegmentInputSchema.parse(req.body);
  const guestSegment = await guestsService.createSegment(userMutationContext(req), input);
  res.status(201).json({ guestSegment });
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = updateGuestSegmentInputSchema.parse(req.body);
  const guestSegment = await guestsService.updateSegment(
    userMutationContext(req),
    paramId(req, 'segmentId'),
    input,
  );
  res.json({ guestSegment });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await guestsService.deleteSegment(userMutationContext(req), paramId(req, 'segmentId'));
  res.status(204).end();
}
