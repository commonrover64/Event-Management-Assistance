import type { AuthResponse, LoginInput, RegisterInput } from '@xperience/shared';
import { apiRequest } from './client';

export const authApi = {
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input, auth: false }),

  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input, auth: false }),

  logout: () => apiRequest<void>('/auth/logout', { method: 'POST', auth: false }),
};
