import { cookies } from 'next/headers';

export const ACCESS_TOKEN_COOKIE = 'rolliq_access_token';
export const REFRESH_TOKEN_COOKIE = 'rolliq_refresh_token';

// Coarse, cookie-presence-only check for gating pages -- NOT a validity
// check (the access token could be expired). Real enforcement happens in
// two places: the Spring Boot backend rejects bad/expired tokens on every
// request regardless, and the proxy route transparently refreshes an
// expired access token using the refresh token on the first data fetch.
// This just decides whether to bother rendering the authenticated shell at
// all before that happens.
export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(store.get(ACCESS_TOKEN_COOKIE) || store.get(REFRESH_TOKEN_COOKIE));
}
