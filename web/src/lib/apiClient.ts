// apiClient calls this app's own /api/proxy/* route, never the backend
// directly -- the browser holds no token at all (see authedFetch.ts). A
// 401 here means the proxy already tried refreshing and the refresh token
// itself is gone/expired, so there's nothing left to do but sign out.
// requestLocal (unprefixed) is for the /api/auth/* routes, which are
// local-only endpoints in their own right, not a backend proxy.

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error: unknown }).error;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return undefined;
}

export async function requestLocal<T>(
  method: string,
  fullPath: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(fullPath, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // Matches the backend's ApiExceptionHandler shape: {"error":{"message":"..."}}
    const message = extractErrorMessage(data) ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    return await requestLocal<T>(method, `/api/proxy${path}`, body);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // A hard navigation, not router.push() -- this deliberately drops
      // every bit of client state (React Query cache included) rather than
      // client-routing away from an app that just discovered its session
      // is dead.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/signin';
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}
