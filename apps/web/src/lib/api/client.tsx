import type { ApiError as ApiErrorBody, AuthResponse } from '@xperience/shared';
import { notifySessionExpired, tokenStore } from '../auth/token-store';

// Same-origin path: Next.js rewrites /api/* to the Express server
const API_BASE = '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  // false for endpoints that must not trigger a refresh (login, register, logout)
  auth?: boolean;
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as Partial<ApiErrorBody>;
    if (body.error) {
      return new ApiError(res.status, body.error.code, body.error.message, body.error.details);
    }
  } catch {
    // Not JSON (e.g. the API is down and the proxy returned HTML)
  }
  return new ApiError(res.status, 'HTTP_ERROR', 'The server could not be reached');
}

let refreshInFlight: Promise<AuthResponse | null> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 * Concurrent callers share one request: the server rotates the refresh token
 * on every use, so two parallel refreshes would invalidate each other.
 */
export function refreshSession(): Promise<AuthResponse | null> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST' });
      if (!res.ok) return null;
      const session = (await res.json()) as AuthResponse;
      tokenStore.set(session.accessToken);
      return session;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

function send(path: string, { method = 'GET', body, auth = true }: RequestOptions) {
  const token = auth ? tokenStore.get() : null;
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options);

  // Access tokens expire after minutes: refresh once, then replay the request
  if (res.status === 401 && options.auth !== false) {
    const session = await refreshSession();
    if (!session) {
      notifySessionExpired();
      throw await toApiError(res);
    }
    res = await send(path, options);
  }

  if (!res.ok) throw await toApiError(res);
  // 204 has no body; callers of such endpoints use apiRequest<void>
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function getErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}
