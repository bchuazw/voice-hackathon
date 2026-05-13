'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// NOTE: @elevenlabs/client is the browser SDK for ConvAI. Confirm exact import surface
// against current docs at https://elevenlabs.io/docs/conversational-ai/libraries/js.
// The minimal contract this page needs: open a session with a signed URL, stream mic,
// receive transcripts + audio, allow stop.
import { Conversation } from '@elevenlabs/client';

type State = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export default function Home() {
  const [state, setState] = useState<State>('idle');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAgentText, setLastAgentText] = useState('');
  const convRef = useRef<Conversation | null>(null);

  const start = useCallback(async () => {
    setState('connecting');
    try {
      const res = await fetch('/api/session');
      const { signedUrl } = (await res.json()) as { signedUrl: string };

      const conversation = await Conversation.startSession({
        signedUrl,
        onConnect: () => setState('listening'),
        onDisconnect: () => setState('idle'),
        onError: (err) => {
          console.error('[convai] error', err);
          setState('error');
        },
        onModeChange: ({ mode }) => {
          if (mode === 'listening') setState('listening');
          if (mode === 'speaking') setState('speaking');
        },
        onMessage: ({ source, message }) => {
          if (source === 'user') {
            setLastUserText(message);
            // Fire-and-forget capture (server classifies + routes + persists)
            fetch('/api/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: message })
            }).catch((err) => console.warn('[capture] failed', err));
          }
          if (source === 'ai') setLastAgentText(message);
        }
      });

      convRef.current = conversation;
    } catch (err) {
      console.error(err);
      setState('error');
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await convRef.current?.endSession();
    } finally {
      convRef.current = null;
      setState('idle');
    }
  }, []);

  useEffect(() => {
    return () => {
      convRef.current?.endSession().catch(() => {});
    };
  }, []);

  const active = state === 'listening' || state === 'speaking' || state === 'connecting';

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <header className="w-full pt-8 text-center">
        <h1 className="text-3xl font-light tracking-wide">Archimedes</h1>
        <p className="mt-2 text-sm opacity-60">{captionFor(state)}</p>
      </header>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={active ? stop : start}
          aria-label={active ? 'Stop listening' : 'Start listening'}
          className={`relative flex h-56 w-56 items-center justify-center rounded-full text-archimedes-mist transition ${
            active
              ? 'bg-archimedes-accent shadow-[0_0_80px_rgba(58,134,255,0.6)] pulse-ring'
              : 'bg-archimedes-mist/10 hover:bg-archimedes-mist/20'
          }`}
        >
          <MicIcon className="h-20 w-20" />
        </button>

        <div className="min-h-[88px] max-w-md text-center text-sm opacity-80">
          {lastUserText && <p className="mb-2 italic">“{lastUserText}”</p>}
          {lastAgentText && <p className="opacity-70">— {lastAgentText}</p>}
        </div>
      </div>

      <footer className="pb-6 text-center text-xs opacity-50">
        <a href="/api/resurface" className="underline-offset-4 hover:underline">
          Morning digest →
        </a>
      </footer>
    </main>
  );
}

function captionFor(state: State): string {
  switch (state) {
    case 'idle':
      return 'Tap to speak';
    case 'connecting':
      return 'Waking Archimedes…';
    case 'listening':
      return 'Listening…';
    case 'speaking':
      return 'Archimedes is replying';
    case 'error':
      return 'Something broke. Tap to retry.';
  }
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
