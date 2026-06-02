export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jonglockapi.zonedevnode.com/platform';
export const SESSION_STORAGE_KEY = 'jonglock.platform.session';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function request(path, options = {}) {
  const token = options.token;
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload?.message || 'API request failed', response.status, payload);
  }

  return payload;
}
