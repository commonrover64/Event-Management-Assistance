import type { ActivityAction, Actor, EntityType } from './enums';

export interface ActivityEntry {
  id: string;
  eventId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  summary: string;
  actor: Actor;
  messageId: string | null;
  createdAt: string;
}
