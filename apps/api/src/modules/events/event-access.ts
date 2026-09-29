import type { Request, RequestHandler } from 'express';
import { objectIdSchema } from '@xperience/shared';
import { notFound } from '../../lib/errors';
import { getAuthUserId } from '../../middleware/require-auth';
import type { MutationContext } from '../activity/activity.service';
import { EventModel } from './event.model';

// Guards every /events/:eventId/* route; 404 (not 403) so other users' event ids aren't revealed
export const requireEventAccess: RequestHandler = async (req, _res, next) => {
  const userId = getAuthUserId(req);
  const eventId = objectIdSchema.parse(req.params.eventId);

  const owned = await EventModel.exists({ _id: eventId, ownerId: userId });
  if (!owned) throw notFound('Event');

  req.eventId = eventId;
  next();
};

export function getEventId(req: Request): string {
  if (!req.eventId) throw notFound('Event');
  return req.eventId;
}

export function userMutationContext(req: Request): MutationContext {
  return { eventId: getEventId(req), actor: 'user', messageId: null };
}
