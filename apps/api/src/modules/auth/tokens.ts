import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env';

const accessKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const ISSUER = 'xperience-api';
const AUDIENCE = 'xperience-web';

export const REFRESH_TTL_MS = env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

export function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL_MINUTES}m`)
    .sign(accessKey);
}

// Throws if the signature, expiry, issuer or audience is wrong
export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, accessKey, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (!payload.sub) throw new Error('Token has no subject');
  return payload.sub;
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
