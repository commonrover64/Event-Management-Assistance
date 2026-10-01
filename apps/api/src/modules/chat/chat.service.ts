import { Types } from 'mongoose';
import type { AssistantTurn, ChatMessage, ChatTurnResponse } from '@xperience/shared';
import { executeOperations } from '../../ai/executor';
import { llm } from '../../ai/llm';
import { buildSystemPrompt } from '../../ai/prompts/chat-system-prompt';
import type { LlmMessage } from '../../ai/providers/llm-provider';
import { buildEventSnapshot } from '../../ai/snapshot';
import { parseAssistantTurn } from '../../ai/turn';
import { AppError } from '../../lib/errors';
import { listChangesByMessage } from '../activity/activity.service';
import type { MutationContext } from '../activity/activity.service';
import { toChatMessage } from './message.mapper';
import { MessageModel } from './message.model';

// Recent turns give conversational context; the snapshot carries the actual state
const HISTORY_TURNS = 12;
const PAGE_SIZE = 100;

async function loadHistory(eventId: string): Promise<LlmMessage[]> {
  const docs = await MessageModel.find({ eventId }).sort({ createdAt: -1 }).limit(HISTORY_TURNS);
  return docs.reverse().map((m) => ({ role: m.role, content: m.content }));
}

// One corrective retry when the model's JSON has the wrong shape
async function requestTurn(messages: LlmMessage[]): Promise<AssistantTurn> {
  const first = parseAssistantTurn(await llm.completeJson({ messages }));
  if (first.ok) return first.turn;

  const retry = parseAssistantTurn(
    await llm.completeJson({
      messages: [
        ...messages,
        {
          role: 'user',
          content: `Your previous response was invalid (${first.error}). Respond again with ONLY the JSON object {"reply": string, "operations": [...]}.`,
        },
      ],
    }),
  );
  if (retry.ok) return retry.turn;

  throw new AppError(
    502,
    'AI_INVALID_RESPONSE',
    'The assistant could not produce a valid response. Please try rephrasing.',
  );
}

export async function listMessages(eventId: string): Promise<ChatMessage[]> {
  const docs = (
    await MessageModel.find({ eventId }).sort({ createdAt: -1 }).limit(PAGE_SIZE)
  ).reverse();
  const changes = await listChangesByMessage(docs.map((d) => d._id.toString()));
  return docs.map((d) => toChatMessage(d, changes.get(d._id.toString()) ?? []));
}

export async function sendMessage(eventId: string, content: string): Promise<ChatTurnResponse> {
  const [snapshot, history] = await Promise.all([
    buildEventSnapshot(eventId),
    loadHistory(eventId),
  ]);

  // Ask the model first: if it fails, nothing has been saved or changed
  const turn = await requestTurn([
    { role: 'system', content: buildSystemPrompt(snapshot.payload) },
    ...history,
    { role: 'user', content },
  ]);

  const userMessage = await MessageModel.create({ eventId, role: 'user', content });

  // The assistant message id is fixed up front so every change can point back to it
  const assistantId = new Types.ObjectId();
  const ctx: MutationContext = { eventId, actor: 'ai', messageId: assistantId.toString() };
  const rejected = await executeOperations(ctx, turn.operations, snapshot.refs);

  const assistantMessage = await MessageModel.create({
    _id: assistantId,
    eventId,
    role: 'assistant',
    content: withRejectionNote(turn.reply, rejected.length, turn.operations.length),
    rejected,
  });

  const changes = await listChangesByMessage([assistantId.toString()]);
  return {
    userMessage: toChatMessage(userMessage, []),
    assistantMessage: toChatMessage(assistantMessage, changes.get(assistantId.toString()) ?? []),
  };
}

// The reply is written before execution, so it must not claim changes that were rejected.
// The note also lands in history, which tells the model on its next turn what failed.
function withRejectionNote(reply: string, rejectedCount: number, total: number): string {
  if (rejectedCount === 0) return reply;
  return `${reply}\n\n(Note: ${rejectedCount} of ${total} proposed changes could not be applied.)`;
}