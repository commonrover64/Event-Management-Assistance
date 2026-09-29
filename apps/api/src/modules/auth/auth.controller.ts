import type { Request, Response } from 'express';
import { loginInputSchema, registerInputSchema } from '@xperience/shared';
import type { AuthResponse } from '@xperience/shared';
import { getAuthUserId } from '../../middleware/require-auth';
import * as authService from './auth.service';
import type { AuthResult } from './auth.service';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from './cookies';

function sendAuth(res: Response, result: AuthResult): void {
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  // The refresh token only ever travels in the cookie, never in the body
  const body: AuthResponse = { user: result.user, accessToken: result.accessToken };
  res.json(body);
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerInputSchema.parse(req.body);
  sendAuth(res.status(201), await authService.register(input));
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginInputSchema.parse(req.body);
  sendAuth(res, await authService.login(input));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  sendAuth(res, await authService.refresh(readRefreshCookie(req)));
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(readRefreshCookie(req));
  clearRefreshCookie(res);
  res.status(204).end();
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: await authService.getCurrentUser(getAuthUserId(req)) });
}
