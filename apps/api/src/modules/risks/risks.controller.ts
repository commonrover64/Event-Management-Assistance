import { z } from 'zod';
import type { Request, Response } from 'express';
import { updateRiskInputSchema } from '@xperience/shared';
import { paramId } from '../../lib/http';
import { getEventId, userMutationContext } from '../events/event-access';
import * as risksService from './risks.service';
import { applySuggestedAction } from './risk-actions.service';

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

const actionIndexSchema = z.coerce.number().int().min(0).max(20);

export async function applyAction(req: Request, res: Response): Promise<void> {
  const rejected = await applySuggestedAction(
    userMutationContext(req),
    paramId(req, 'riskId'),
    actionIndexSchema.parse(req.params.index),
  );
  res.json({ rejected });
}
