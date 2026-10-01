import { LEVELS } from '@xperience/shared';
import type { EntityRef, Level, Risk, RiskStatus, RiskType } from '@xperience/shared';
import { badRequest, notFound } from '../../lib/errors';
import { applyPatch } from '../../lib/patch';
import { runRules } from '../../rules';
import type { RiskCandidate } from '../../rules';
import { recordActivity } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { getEvent } from '../events/events.service';
import { listSegments } from '../guests/guests.service';
import { listTasks } from '../tasks/tasks.service';
import { listVendors } from '../vendors/vendors.service';
import { toRisk } from './risk.mapper';
import { RiskModel } from './risk.model';
import type { RiskDoc } from './risk.model';

const rank = (level: Level) => LEVELS.indexOf(level);

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

async function findRiskOrThrow(eventId: string, riskId: string): Promise<RiskDoc> {
  const risk = await RiskModel.findOne({ _id: riskId, eventId });
  if (!risk) throw notFound('Risk');
  return risk;
}

async function log(
  ctx: MutationContext,
  risk: RiskDoc,
  action: 'created' | 'updated' | 'resolved',
  summary: string,
) {
  await recordActivity(ctx, { entityType: 'risk', entityId: risk._id.toString(), action, summary });
}

async function raise(ctx: MutationContext, candidate: RiskCandidate): Promise<void> {
  try {
    const risk = await RiskModel.create({ ...candidate, eventId: ctx.eventId, source: 'rule' });
    await log(ctx, risk, 'created', `Risk raised: ${risk.title}`);
  } catch (err) {
    // Another evaluation created it a moment ago; the unique index did its job
    if (!isDuplicateKeyError(err)) throw err;
  }
}

async function refresh(ctx: MutationContext, risk: RiskDoc, candidate: RiskCandidate) {
  const previousSeverity = risk.severity;
  const wasResolved = risk.status === 'resolved';

  const changes = applyPatch(risk, {
    title: candidate.title,
    description: candidate.description,
    severity: candidate.severity,
    related: candidate.related,
    suggestedActions: candidate.suggestedActions,
    // A resolved problem that came back is reopened; a dismissed one stays dismissed
    ...(wasResolved && { status: 'open', resolvedAt: null }),
  });
  if (changes.length === 0) return;
  await risk.save();

  if (wasResolved) await log(ctx, risk, 'updated', `Risk reopened: ${risk.title}`);
  else if (risk.status === 'open' && rank(risk.severity) > rank(previousSeverity)) {
    await log(ctx, risk, 'updated', `Risk escalated to ${risk.severity}: ${risk.title}`);
  }
}

/**
 * Runs every rule against the current state and syncs stored rule risks:
 * new problems are raised, changed ones refreshed, fixed ones resolved.
 * Idempotent, so it is safe to call after any change or before any read.
 */
export async function evaluateRisks(ctx: MutationContext, now = new Date()): Promise<void> {
  const [event, tasks, vendors, guestSegments, stored] = await Promise.all([
    getEvent(ctx.eventId),
    listTasks(ctx.eventId),
    listVendors(ctx.eventId),
    listSegments(ctx.eventId),
    RiskModel.find({ eventId: ctx.eventId, source: 'rule' }),
  ]);

  const candidates = runRules({ event, tasks, vendors, guestSegments, now });
  const storedByKey = new Map(stored.map((r) => [r.ruleKey, r]));

  for (const candidate of candidates) {
    const existing = storedByKey.get(candidate.ruleKey);
    if (existing) await refresh(ctx, existing, candidate);
    else await raise(ctx, candidate);
  }

  const activeKeys = new Set(candidates.map((c) => c.ruleKey));
  for (const risk of stored) {
    if (risk.status !== 'open' || !risk.ruleKey || activeKeys.has(risk.ruleKey)) continue;
    risk.status = 'resolved';
    risk.resolvedAt = now;
    await risk.save();
    await log(ctx, risk, 'resolved', `Risk resolved: ${risk.title}`);
  }
}

// Open first, most severe first; then the rest by most recent
export async function listRisks(eventId: string): Promise<Risk[]> {
  const risks = await RiskModel.find({ eventId }).sort({ updatedAt: -1 });
  return risks.map(toRisk).sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (b.status === 'open' && a.status !== 'open') return 1;
    return a.status === 'open' ? rank(b.severity) - rank(a.severity) : 0;
  });
}

export async function updateRiskStatus(
  ctx: MutationContext,
  riskId: string,
  status: RiskStatus,
): Promise<Risk> {
  const risk = await findRiskOrThrow(ctx.eventId, riskId);
  if (risk.status === status) return toRisk(risk);

  risk.status = status;
  risk.resolvedAt = status === 'open' ? null : new Date();
  await risk.save();

  const action = status === 'resolved' ? 'resolved' : 'updated';
  await log(ctx, risk, action, `Risk ${status === 'open' ? 'reopened' : status}: ${risk.title}`);
  return toRisk(risk);
}

export interface AiRiskInput {
  type: RiskType;
  severity: Level;
  title: string;
  description: string;
  related: EntityRef[];
  suggestions: string[];
}

export async function createAiRisk(ctx: MutationContext, input: AiRiskInput): Promise<Risk> {
  const { suggestions, ...rest } = input;
  const risk = await RiskModel.create({
    ...rest,
    eventId: ctx.eventId,
    source: 'ai',
    suggestedActions: suggestions.map((label) => ({ label, operations: [] })),
  });
  await log(ctx, risk, 'created', `Risk raised: ${risk.title}`);
  return toRisk(risk);
}

// Rule risks resolve themselves when the problem is fixed, so only AI risks are resolved here
export async function resolveAiRisk(ctx: MutationContext, riskId: string): Promise<Risk> {
  const risk = await findRiskOrThrow(ctx.eventId, riskId);
  if (risk.source !== 'ai') {
    throw badRequest('This risk is tracked automatically and resolves once the issue is fixed');
  }
  return updateRiskStatus(ctx, riskId, 'resolved');
}

export async function listOpenRisks(eventId: string): Promise<Risk[]> {
  const risks = await RiskModel.find({ eventId, status: 'open' });
  return risks.map(toRisk);
}

export async function getRiskOrThrow(eventId: string, riskId: string): Promise<Risk> {
  return toRisk(await findRiskOrThrow(eventId, riskId));
}
