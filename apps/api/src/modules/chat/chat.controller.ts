import type { Request, Response } from 'express';
import { sendMessageInputSchema } from '@xperience/shared';
import { getEventId } from '../events/event-access';
import * as chatService from './chat.service';

export async function list(req: Request, res: Response): Promise<void> {
  res.json({ messages: await chatService.listMessages(getEventId(req)) });
}

export async function send(req: Request, res: Response): Promise<void> {
  const { content } = sendMessageInputSchema.parse(req.body);
  res.status(201).json(await chatService.sendMessage(getEventId(req), content));
}
