import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, type AuthResponseDto } from '@/lib/backend';
import { setAuthCookies } from '@/lib/authCookies';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const auth = data as AuthResponseDto;
  await setAuthCookies(auth);
  return NextResponse.json({ user: auth.user });
}
