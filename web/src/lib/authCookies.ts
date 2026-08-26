import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './session';
import type { AuthResponseDto } from './backend';

// 30 days, matching the backend's jwt.refresh-token-ttl-days (application.yml).
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Only called from Route Handlers / Server Actions, where cookie mutation
// is legal (see hasSession's comment for why plain Server Components never
// touch these).
export async function setAuthCookies(auth: AuthResponseDto): Promise<void> {
  const store = await cookies();
  const isProd = process.env.NODE_ENV === 'production';
  const accessTokenMaxAge = Math.max(
    60,
    Math.floor((new Date(auth.expires_at).getTime() - Date.now()) / 1000),
  );

  store.set(ACCESS_TOKEN_COOKIE, auth.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: accessTokenMaxAge,
  });
  store.set(REFRESH_TOKEN_COOKIE, auth.refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
