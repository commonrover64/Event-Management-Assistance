import type { ActivityAction, ActivityEntry, Actor, EntityType } from '@xperience/shared';
import { toId, toIso } from '../../lib/mapping';
import { ActivityModel } from './activity.model';
import type { ActivityDoc } from './activity.model';

// Who is changing what: every mutating service receives this
export interface MutationContext {
  eventId: string;
  actor: Actor;
  messageId: string | null;
}

interface ActivityInput {
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  summary: string;
}

export function toActivityEntry(doc: ActivityDoc): ActivityEntry {
  return {
    id: toId(doc._id),
    eventId: toId(doc.eventId),
    entityType: doc.entityType,
    entityId: doc.entityId,
    action: doc.action,
    summary: doc.summary,
    actor: doc.actor,
    messageId: doc.messageId ? toId(doc.messageId) : null,
    createdAt: toIso(doc.createdAt),
  };
}

export async function recordActivity(ctx: MutationContext, input: ActivityInput): Promise<void> {
  await ActivityModel.create({
    ...input,
    eventId: ctx.eventId,
    actor: ctx.actor,
    messageId: ctx.messageId,
  });
}

export async function listActivity(eventId: string, limit: number): Promise<ActivityEntry[]> {
  const docs = await ActivityModel.find({ eventId }).sort({ createdAt: -1 }).limit(limit);
  return docs.map(toActivityEntry);
}

// The chat turn uses this to show exactly what one message changed
export async function listActivityForMessage(messageId: string): Promise<ActivityEntry[]> {
  const docs = await ActivityModel.find({ messageId }).sort({ createdAt: 1 });
  return docs.map(toActivityEntry);
}
