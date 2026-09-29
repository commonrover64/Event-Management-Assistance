import { rateLimit } from 'express-rate-limit';
import { AppError } from '../lib/errors';

export function createRateLimiter({
  windowMinutes,
  limit,
}: {
  windowMinutes: number;
  limit: number;
}) {
  return rateLimit({
    windowMs: windowMinutes * 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later')),
  });
}
