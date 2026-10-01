import type { AppliedChange, ChatMessage } from '@xperience/shared';
import { toId, toIso } from '../../lib/mapping';
import type { MessageDoc } from './message.model';

export function toChatMessage(doc: MessageDoc, changes: AppliedChange[]): ChatMessage {
  return {
    id: toId(doc._id),
    eventId: toId(doc.eventId),
    role: doc.role,
    content: doc.content,
    changes,
    rejected: doc.rejected.map((r) => ({ operation: r.operation as unknown, reason: r.reason })),
    createdAt: toIso(doc.createdAt),
  };
}
