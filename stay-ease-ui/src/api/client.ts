// Thin fetch wrapper for the real StayEase backend.
// Base URL + JWT storage/attachment live here so every api function stays simple.

const BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'stayease_token';
const ROLE_KEY = 'stayease_role';
const USER_ID_KEY = 'stayease_user_id';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setStoredRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

/**
 * Decodes a JWT payload client-side (no signature verification — just reading claims).
 * Your backend currently only puts `sub` (email), `iat`, and `exp` in the token.
 * If you add more claims (role, userId, name) later, they'll show up here automatically.
 */
export function decodeToken(token: string): Record<string, any> | null {
  try {
    const raw = token.replace(/^Bearer\s+/i, '');
    const payload = raw.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = opts;

  let url = `${BASE_URL}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  // Backend's login response is already prefixed with "Bearer ", so we store and send it as-is.
  if (token) headers['Authorization'] = token;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // plain-text response (several of this API's endpoints return raw strings) — keep as-is
  }

  if (!res.ok) {
    const message = (data && data.message) || (typeof data === 'string' && data) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}