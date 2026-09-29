import { Router } from 'express';
import { createRateLimiter } from '../../middleware/rate-limit';
import { requireAuth } from '../../middleware/require-auth';
import * as authController from './auth.controller';

const credentialsLimiter = createRateLimiter({ windowMinutes: 15, limit: 20 });

export const authRouter = Router();

authRouter.post('/register', credentialsLimiter, authController.register);
authRouter.post('/login', credentialsLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
