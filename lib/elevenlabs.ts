import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

let _client: ElevenLabsClient | null = null;
function client(): ElevenLabsClient {
  if (_client) return _client;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY missing');
  _client = new ElevenLabsClient({ apiKey });
  return _client;
}

const FALLBACK_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — public ElevenLabs voice

/**
 * Synthesise the morning digest audio.
 *
 * Prefers the user's cloned voice (ELEVENLABS_USER_VOICE_ID — the emotional
 * hook for the demo video). Falls back to a public stock voice so the digest
 * still works on first run.
 *
 * Returns a base64 data URL — fine for clips under ~1 MB. For longer audio
 * upload to Supabase Storage and return the public URL.
 */
export async function synthesizeDigestAudio(script: string): Promise<string> {
  const voiceId = process.env.ELEVENLABS_USER_VOICE_ID || FALLBACK_VOICE_ID;

  const stream = await client().textToSpeech.convert(voiceId, {
    text: script,
    modelId: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_44100_128'
  });

  const chunks: Uint8Array[] = [];
  const reader = (stream as ReadableStream<Uint8Array>).getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return `data:audio/mpeg;base64,${buf.toString('base64')}`;
}

export function hasElevenLabsApiKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export function hasClonedVoice(): boolean {
  return Boolean(process.env.ELEVENLABS_USER_VOICE_ID);
}
