import type { Request, Response } from 'express';
import { updateRiskInputSchema } from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getEventId, userMutationContext } from '../events/event-access';
import * as risksService from './risks.service';

// Evaluating on read keeps risks current with no triggers to forget, including time-based ones
export async function list(req: Request, res: Response): Promise<void> {
  const eventId = getEventId(req);
  await risksService.evaluateRisks({ eventId, actor: 'system', messageId: null });
  res.json({ risks: await risksService.listRisks(eventId) });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { status } = updateRiskInputSchema.parse(req.body);
  const risk = await risksService.updateRiskStatus(
    userMutationContext(req),
    paramId(req, 'riskId'),
    status,
  );
  res.json({ risk });
}
