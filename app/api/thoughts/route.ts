import { NextResponse } from 'next/server';
import { fetchRecent, memoryBackend } from '@/lib/memory';

/**
 * GET /api/thoughts?limit=25
 * Returns the most recently captured thoughts so the UI can render a live feed.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') ?? '25')));
  const rows = await fetchRecent(limit);
  return NextResponse.json({ backend: memoryBackend(), thoughts: rows });
}
