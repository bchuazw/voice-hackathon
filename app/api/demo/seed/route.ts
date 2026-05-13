import { NextRequest, NextResponse } from 'next/server';
import { saveThought, resetMemoryStore, memoryBackend } from '@/lib/memory';
import { dispatch } from '@/lib/integrations';
import { STORYBOARD_THOUGHTS } from '@/lib/demoSeed';
import { classifyThought } from '@/lib/router';

/**
 * Seed the storyboard thoughts from VIDEO_PLAN.md. Use for the demo video
 * when you don't want to (or can't) speak each line aloud — e.g. filming
 * the on-screen routing animation.
 *
 * POST /api/demo/seed?live=1   → re-classify each transcript with the live
 *                                classifier (slower, more authentic).
 * POST /api/demo/seed          → use the hand-authored classifications
 *                                (instant, no external calls).
 * POST /api/demo/seed?reset=1  → wipe the in-memory store first.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const live = url.searchParams.get('live') === '1';
  const reset = url.searchParams.get('reset') === '1';

  if (reset) resetMemoryStore();

  const results: any[] = [];
  for (const seed of STORYBOARD_THOUGHTS) {
    const classified = live
      ? await classifyThought({ transcript: seed.transcript }).catch(() => seed.classification)
      : seed.classification;
    const integrationResult = await dispatch(classified);
    const saved = await saveThought({
      transcript: seed.transcript,
      classification: classified,
      integration_result: integrationResult,
      conversation_id: 'demo-seed'
    });
    results.push({
      id: saved.id,
      transcript: seed.transcript,
      agent_reply: seed.agent_reply,
      classification: classified,
      integration_result: integrationResult
    });
  }

  return NextResponse.json({
    ok: true,
    backend: memoryBackend(),
    thoughts: results
  });
}
