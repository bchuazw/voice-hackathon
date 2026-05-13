import { NextResponse } from 'next/server';
import { memoryBackend } from '@/lib/memory';
import { hasClonedVoice, hasElevenLabsApiKey } from '@/lib/elevenlabs';

/**
 * GET /api/health
 * Lightweight surface for the UI — which integrations are configured?
 * Never returns secrets, only booleans.
 */
export async function GET() {
  return NextResponse.json({
    elevenlabs: {
      api_key: hasElevenLabsApiKey(),
      agent: Boolean(process.env.ELEVENLABS_AGENT_ID),
      cloned_voice: hasClonedVoice()
    },
    classifier: { openai: Boolean(process.env.OPENAI_API_KEY) },
    memory: memoryBackend(),
    integrations: {
      todoist: Boolean(process.env.TODOIST_API_TOKEN),
      notion: Boolean(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID),
      calendar: Boolean(
        process.env.GOOGLE_CLIENT_ID &&
          process.env.GOOGLE_CLIENT_SECRET &&
          process.env.GOOGLE_REFRESH_TOKEN
      ),
      cursor: Boolean(process.env.CURSOR_TARGET_REPO_PATH)
    },
    timezone: process.env.USER_TIMEZONE ?? 'UTC'
  });
}
