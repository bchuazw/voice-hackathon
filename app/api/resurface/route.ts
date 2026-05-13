import { NextResponse } from 'next/server';
import { fetchThoughtsSince, findClusters } from '@/lib/memory';
import { synthesizeDigestAudio } from '@/lib/elevenlabs';
import { generateDigestScript } from '@/lib/router';

/**
 * Morning digest endpoint. Returns:
 *  - the text of the digest (for captions / debug)
 *  - an audio URL of the digest read in the user's cloned voice
 *  - the underlying thoughts (for the UI to display)
 *
 * GET /api/resurface?hours=24
 *
 * In production this would be triggered by a Vercel cron at 7am.
 * For the demo, the frontend can call it manually via a "Morning Digest" button.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const hours = Number(url.searchParams.get('hours') ?? '24');

  const thoughts = await fetchThoughtsSince(hours);
  if (thoughts.length === 0) {
    return NextResponse.json({ script: 'No thoughts captured yet.', audioUrl: null, thoughts: [] });
  }

  const clusters = await findClusters(thoughts);
  const script = await generateDigestScript({ thoughts, clusters });

  let audioUrl: string | null = null;
  try {
    audioUrl = await synthesizeDigestAudio(script);
  } catch (err) {
    console.error('[resurface] TTS failed', err);
  }

  return NextResponse.json({ script, audioUrl, thoughts, clusters });
}
