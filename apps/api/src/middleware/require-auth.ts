import type { Request, RequestHandler } from 'express';
import { unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../modules/auth/tokens';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) throw unauthorized();

  try {
    req.auth = { userId: await verifyAccessToken(token) };
  } catch {
    throw unauthorized('Invalid or expired token');
  }
  next();
};

// For handlers behind requireAuth; narrows away the optional type
export function getAuthUserId(req: Request): string {
  if (!req.auth) throw unauthorized();
  return req.auth.userId;
}
