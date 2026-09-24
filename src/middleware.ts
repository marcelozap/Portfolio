import { NextResponse } from 'next/server';

// Desk retired at the owner's request. Retain stored data and source history.
export function middleware() {
  return new NextResponse('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export const config = {
  matcher: ['/desk/:path*', '/api/desk/:path*', '/desk-assets/:path*'],
};
