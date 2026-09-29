import { z } from 'zod';
import { requiredText } from './common';

export const registerInputSchema = z.object({
  name: requiredText(80),
  email: z.email().toLowerCase(),
  // bcrypt only uses the first 72 bytes of a password
  password: z.string().min(8).max(72),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}
