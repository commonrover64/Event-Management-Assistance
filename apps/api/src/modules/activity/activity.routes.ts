import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { getEventId } from '../events/event-access';
import { listActivity } from './activity.service';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const activityRouter = Router();

activityRouter.get('/', async (req: Request, res: Response) => {
  const { limit } = listQuerySchema.parse(req.query);
  res.json({ activity: await listActivity(getEventId(req), limit) });
});
