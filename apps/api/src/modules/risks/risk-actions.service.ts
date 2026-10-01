import type { RejectedOperation } from '@xperience/shared';
import { executeOperations } from '../../ai/executor';
import { buildEventSnapshot } from '../../ai/snapshot';
import { badRequest } from '../../lib/errors';
import type { MutationContext } from '../activity/activity.service';
import { evaluateRisks, getRiskOrThrow } from './risks.service';

/**
 * Runs a risk's suggested fix through the same executor the AI uses,
 * so it gets the same validation, duplicate guard and activity logging.
 * Kept apart from risks.service because the executor itself depends on that service.
 */
export async function applySuggestedAction(
  ctx: MutationContext,
  riskId: string,
  actionIndex: number,
): Promise<RejectedOperation[]> {
  const risk = await getRiskOrThrow(ctx.eventId, riskId);
  const action = risk.suggestedActions[actionIndex];
  if (!action || action.operations.length === 0) {
    throw badRequest('This suggestion has no action that can be applied');
  }

  // The snapshot registers every item's database id, which the stored operations use
  const { refs } = await buildEventSnapshot(ctx.eventId);
  const rejected = await executeOperations(ctx, action.operations, refs);

  await evaluateRisks({ eventId: ctx.eventId, actor: 'system', messageId: null });
  return rejected;
}
