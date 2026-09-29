import { z } from 'zod';
import { requiredText } from './common';
import type { ActivityAction, EntityType, MessageRole } from './enums';

export const sendMessageInputSchema = z.object({ content: requiredText(4000) });
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

export interface AppliedChange {
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  summary: string;
}

export interface RejectedOperation {
  operation: unknown;
  reason: string;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  role: MessageRole;
  content: string;
  changes: AppliedChange[];
  rejected: RejectedOperation[];
  createdAt: string;
}

export interface ChatTurnResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
