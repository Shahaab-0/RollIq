import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/backend';
import { REFRESH_TOKEN_COOKIE } from '@/lib/session';
import { clearAuthCookies } from '@/lib/authCookies';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${BACKEND_URL}/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    }).catch(() => undefined);
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
