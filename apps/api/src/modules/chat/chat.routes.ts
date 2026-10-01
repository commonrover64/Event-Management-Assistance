import { Router } from 'express';
import { createRateLimiter } from '../../middleware/rate-limit';
import * as chatController from './chat.controller';

// Every message costs an LLM call, so sending is limited separately from reading
const sendLimiter = createRateLimiter({ windowMinutes: 1, limit: 10, keyBy: 'user' });

export const chatRouter = Router();

chatRouter.get('/', chatController.list);
chatRouter.post('/', sendLimiter, chatController.send);
