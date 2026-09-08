import { NextRequest } from 'next/server';
import { handleDesk } from '@/lib/desk/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
type RouteContext = { params: Promise<{ path: string[] }> };
export async function GET(request: NextRequest, context: RouteContext) {
  return handleDesk(request, (await context.params).path);
}
export async function POST(request: NextRequest, context: RouteContext) {
  return handleDesk(request, (await context.params).path);
}
