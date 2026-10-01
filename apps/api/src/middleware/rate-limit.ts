import type { Request } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { AppError } from '../lib/errors';

type KeyStrategy = 'ip' | 'user' | 'ip-and-email';

const clientIp = (req: Request) => ipKeyGenerator(req.ip ?? 'unknown');

// Behind a proxy (Netlify) many users can arrive from one address,
// so IP alone would make unrelated people share a single limit
const KEY_GENERATORS: Record<KeyStrategy, (req: Request) => string> = {
  ip: clientIp,
  user: (req) => req.auth?.userId ?? clientIp(req),
  'ip-and-email': (req) => {
    const email: unknown = req.body?.email;
    return `${clientIp(req)}:${typeof email === 'string' ? email.toLowerCase() : ''}`;
  },
};

export function createRateLimiter({
  windowMinutes,
  limit,
  keyBy = 'ip',
}: {
  windowMinutes: number;
  limit: number;
  keyBy?: KeyStrategy;
}) {
  return rateLimit({
    windowMs: windowMinutes * 60_000,
    limit,
    keyGenerator: KEY_GENERATORS[keyBy],
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later')),
  });
}
