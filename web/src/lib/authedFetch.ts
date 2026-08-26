import { cookies } from 'next/headers';
import { BACKEND_URL, type AuthResponseDto } from './backend';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './session';
import { clearAuthCookies, setAuthCookies } from './authCookies';

async function refreshTokens(refreshToken: string): Promise<AuthResponseDto | null> {
  const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

// Calls the backend with the caller's access token, transparently
// refreshing (and persisting the rotated tokens back into cookies) on a
// 401 -- same "retry once after refresh" shape as the mobile app's axios
// response interceptor (frontend/src/api/client.ts). Only safe to call from
// a Route Handler, since it mutates cookies.
export async function authedBackendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;

  const doFetch = (token: string | undefined) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

  let response = await doFetch(accessToken);

  if (response.status === 401) {
    const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      const refreshed = await refreshTokens(refreshToken);
      if (refreshed) {
        await setAuthCookies(refreshed);
        response = await doFetch(refreshed.access_token);
      } else {
        await clearAuthCookies();
      }
    }
  }

  return response;
}
