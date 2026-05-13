import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

/**
 * Shared ElevenLabs client. Server-side only — never import in client code.
 */
export const eleven = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!
});

/**
 * Generates audio for the morning digest using the user's cloned voice.
 * Returns a data URL or a public Supabase storage URL.
 *
 * TODO (builder agent):
 *  - Decide on a hosting strategy. Simplest path: upload the audio buffer to
 *    Supabase Storage and return the public URL.
 *  - Alternative: stream as a base64 data URL (~ok for short clips).
 */
export async function synthesizeDigestAudio(script: string): Promise<string> {
  const voiceId = process.env.ELEVENLABS_USER_VOICE_ID;
  if (!voiceId) {
    throw new Error('ELEVENLABS_USER_VOICE_ID not set — clone a voice first');
  }

  const audio = await eleven.textToSpeech.convert(voiceId, {
    text: script,
    modelId: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_44100_128'
  });

  // TODO: upload to Supabase Storage and return public URL.
  // For now, return a base64 data URL (works for <1MB clips).
  const chunks: Uint8Array[] = [];
  for await (const chunk of audio as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const buf = Buffer.concat(chunks);
  return `data:audio/mpeg;base64,${buf.toString('base64')}`;
}
