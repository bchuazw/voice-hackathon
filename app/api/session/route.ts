import { NextResponse } from 'next/server';

/**
 * Mints a signed ConvAI WebSocket URL for the browser to connect to.
 * Keeps the ElevenLabs API key out of the client bundle.
 *
 * GET /api/session
 * → { signedUrl: string, agentId: string }
 *
 * Docs: https://elevenlabs.io/docs/conversational-ai/api-reference/conversational-ai/get-signed-url
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      {
        error:
          'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID. Configure these in .env.local — see README.md.',
        configured: { api_key: Boolean(apiKey), agent_id: Boolean(agentId) }
      },
      { status: 503 }
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: { 'xi-api-key': apiKey },
      cache: 'no-store'
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `ElevenLabs signed URL request failed: ${res.status} ${text}` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { signed_url: string };
  return NextResponse.json({ signedUrl: data.signed_url, agentId });
}
