import { NextRequest, NextResponse } from 'next/server';
import { classifyThought } from '@/lib/router';
import { dispatch } from '@/lib/integrations';
import { saveThought } from '@/lib/memory';

/**
 * Receives a captured transcript from the ConvAI agent (via tool call OR
 * directly from the frontend after a turn ends).
 *
 * POST /api/capture
 * body: { transcript: string, conversationId?: string, clarification?: string }
 *
 * Fire-and-forget on the caller side — don't block the voice loop on routing.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.transcript !== 'string' || !body.transcript.trim()) {
    return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
  }

  const transcript: string = body.transcript;
  const clarification: string | undefined = body.clarification;
  const conversationId: string | undefined = body.conversationId;

  // 1. Classify the thought
  let classified;
  try {
    classified = await classifyThought({ transcript, clarification });
  } catch (err) {
    console.error('[capture] classifier failed', err);
    // Fallback: log as raw note
    classified = {
      type: 'note' as const,
      target_app: 'notion' as const,
      payload: { title: transcript.slice(0, 80), body: transcript, due_at: null, tags: [], target_repo: null, target_person: null },
      confidence: 0.2,
      rationale: 'classifier-fallback'
    };
  }

  // 2. Dispatch to the integration (must not throw — adapters swallow errors)
  const integrationResult = await dispatch(classified);

  // 3. Persist for cross-day resurfacing
  await saveThought({
    transcript,
    classification: classified,
    integration_result: integrationResult,
    conversation_id: conversationId ?? null
  });

  return NextResponse.json({ ok: true, classification: classified, integrationResult });
}
