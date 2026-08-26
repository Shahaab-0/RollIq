import { NextRequest, NextResponse } from 'next/server';
import { authedBackendFetch } from '@/lib/authedFetch';

type Context = { params: Promise<{ path: string[] }> };

// Single generic proxy for every authenticated backend call -- the browser
// never sees an access token at all (httpOnly cookies aren't readable from
// JS); this route reads it server-side, attaches it, transparently
// refreshes on a 401, and streams the backend's response straight back.
// Client code just calls `/api/proxy/techniques` the same way the mobile
// app calls `/techniques` on its axios instance.
async function handle(request: NextRequest, context: Context): Promise<NextResponse> {
  const { path } = await context.params;
  const targetPath = `/${path.join('/')}${request.nextUrl.search}`;
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const response = await authedBackendFetch(targetPath, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: hasBody ? await request.text() : undefined,
  });

  const text = await response.text();
  // Null-body statuses (204 No Content chief among them -- every DELETE
  // endpoint returns this) throw if the Response is constructed with a body
  // at all, even an empty string. text is always '' for these, but must be
  // passed as null, not ''.
  const body = text === '' ? null : text;
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
