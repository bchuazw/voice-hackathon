import { NextRequest, NextResponse } from 'next/server';
import { classifyThought } from '@/lib/router';
import { dispatch } from '@/lib/integrations';
import { saveThought } from '@/lib/memory';
import type { ClassifiedThought, TargetApp } from '@/lib/types';

/**
 * Receives a captured transcript from the ConvAI agent (either via its
 * `capture_thought` client-tool call or directly from the frontend after a
 * turn ends).
 *
 * POST /api/capture
 * body: { transcript: string, conversationId?: string, clarification?: string }
 *
 * Treated as fire-and-forget by the caller — never blocks the voice loop.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.transcript !== 'string' || !body.transcript.trim()) {
    return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
  }

  const transcript: string = body.transcript;
  const clarification: string | undefined = body.clarification;
  const conversationId: string | undefined = body.conversationId;

  let classified: ClassifiedThought;
  try {
    classified = await classifyThought({ transcript, clarification });
  } catch (err) {
    console.error('[capture] classifier failed', err);
    classified = {
      type: 'note',
      target_app: 'notion',
      payload: {
        title: transcript.slice(0, 80),
        body: transcript,
        due_at: null,
        tags: [],
        target_repo: null,
        target_person: null
      },
      confidence: 0.2,
      rationale: 'classifier-fallback'
    };
  }

  const integrationResult = await dispatch(classified);

  const saved = await saveThought({
    transcript,
    classification: classified,
    integration_result: integrationResult,
    conversation_id: conversationId ?? null
  });

  return NextResponse.json({
    ok: true,
    id: saved.id,
    classification: classified,
    integrationResult,
    agent_reply: agentReplyFor(classified.target_app)
  });
}

function agentReplyFor(app: TargetApp): string {
  switch (app) {
    case 'todoist':
      return 'Captured. Sent to Todoist.';
    case 'calendar':
      return 'Captured. On your calendar.';
    case 'notion':
      return 'Noted.';
    case 'cursor':
      return 'Code thought. Sent to Cursor.';
    case 'reminders':
      return 'Reminder set.';
    case 'imessage':
      return 'Message draft queued.';
    default:
      return 'Captured.';
  }
}
