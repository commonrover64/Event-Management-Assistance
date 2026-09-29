import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import type { LoginInput, PublicUser, RegisterInput } from '@xperience/shared';
import { conflict, notFound, unauthorized } from '../../lib/errors';
import { toPublicUser } from '../users/user.mapper';
import { UserModel } from '../users/user.model';
import type { UserDoc } from '../users/user.model';
import { SessionModel } from './session.model';
import { REFRESH_TTL_MS, generateRefreshToken, hashToken, signAccessToken } from './tokens';

const SALT_ROUNDS = 12;
// Parallel refreshes (two tabs) can legitimately present the same token within this window
const REUSE_GRACE_MS = 10_000;

// Compared against when the email doesn't exist, so response time doesn't reveal registered emails
const dummyHash = hash('timing-safe-placeholder', SALT_ROUNDS);

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

async function createSession(userId: string, familyId: string) {
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await SessionModel.create({
    userId,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiresAt,
  });
  return { refreshToken, refreshExpiresAt };
}

async function issueAuth(user: UserDoc, familyId: string = randomUUID()): Promise<AuthResult> {
  const userId = user._id.toString();
  const [accessToken, session] = await Promise.all([
    signAccessToken(userId),
    createSession(userId, familyId),
  ]);
  return { user: toPublicUser(user), accessToken, ...session };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  if (await UserModel.exists({ email: input.email })) {
    throw conflict('An account with this email already exists');
  }
  const passwordHash = await hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({ name: input.name, email: input.email, passwordHash });
  return issueAuth(user);
}

export async function login({ email, password }: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  const isValid = await compare(password, user?.passwordHash ?? (await dummyHash));
  // Same message for both cases so attackers can't probe which emails exist
  if (!user || !isValid) throw unauthorized('Invalid email or password');
  return issueAuth(user);
}

export async function refresh(rawToken: string | undefined): Promise<AuthResult> {
  if (!rawToken) throw unauthorized('No active session');

  const now = new Date();
  const tokenHash = hashToken(rawToken);

  // Atomically claim the token so two requests can't both rotate it
  const session = await SessionModel.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { revokedAt: now },
  );

  if (!session) {
    const used = await SessionModel.findOne({ tokenHash });
    const isReuse = used?.revokedAt && now.getTime() - used.revokedAt.getTime() > REUSE_GRACE_MS;
    if (used && isReuse) {
      // A rotated token came back: assume it was stolen and end the whole login
      await SessionModel.updateMany(
        { familyId: used.familyId, revokedAt: null },
        { revokedAt: now },
      );
    }
    throw unauthorized('Session expired or revoked');
  }

  const user = await UserModel.findById(session.userId);
  if (!user) throw unauthorized('Account no longer exists');
  return issueAuth(user, session.familyId);
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await SessionModel.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: null },
    { revokedAt: new Date() },
  );
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw notFound('User');
  return toPublicUser(user);
}
