import type { PublicUser } from '@xperience/shared';
import type { UserDoc } from './user.model';

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
