import { Router } from 'express';
import { isDatabaseReady } from '../../lib/db';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const dbReady = isDatabaseReady();
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ok' : 'degraded',
    database: dbReady ? 'up' : 'down',
    uptimeSeconds: Math.round(process.uptime()),
  });
});
