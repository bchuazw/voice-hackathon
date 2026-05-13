import { NextResponse } from 'next/server';

/**
 * Mints a signed ConvAI WebSocket URL for the browser to connect to.
 * Keeps the ElevenLabs API key out of the client bundle.
 *
 * GET /api/session
 * → { signedUrl: string }
 *
 * Docs: https://elevenlabs.io/docs/conversational-ai/api-reference/conversational-ai/get-signed-url
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: 'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID' },
      { status: 500 }
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
      { status: 500 }
    );
  }

  const data = (await res.json()) as { signed_url: string };
  return NextResponse.json({ signedUrl: data.signed_url });
}
