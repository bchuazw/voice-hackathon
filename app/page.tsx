'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Conversation, type Conversation as ConversationType } from '@elevenlabs/client';

type State = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

type Health = {
  elevenlabs: { api_key: boolean; agent: boolean; cloned_voice: boolean };
  classifier: { openai: boolean };
  memory: 'supabase' | 'in-memory';
  integrations: { todoist: boolean; notion: boolean; calendar: boolean; cursor: boolean };
};

type StoredThought = {
  id: string;
  transcript: string;
  captured_at: string;
  classification: {
    type: string;
    target_app: string;
    payload: { title: string; body: string | null; tags?: string[] };
    confidence: number;
  };
  integration_result: { app: string; ok: boolean; url?: string; error?: string } | null;
};

const APP_LABELS: Record<string, string> = {
  todoist: 'Todoist',
  notion: 'Notion',
  calendar: 'Calendar',
  cursor: 'Cursor',
  reminders: 'Reminders',
  imessage: 'Messages'
};

export default function Home() {
  const [state, setState] = useState<State>('idle');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAgentText, setLastAgentText] = useState('');
  const [thoughts, setThoughts] = useState<StoredThought[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [digestState, setDigestState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [digestScript, setDigestScript] = useState<string>('');
  const [digestAudio, setDigestAudio] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const convRef = useRef<ConversationType | null>(null);

  const refreshThoughts = useCallback(async () => {
    try {
      const res = await fetch('/api/thoughts');
      if (!res.ok) return;
      const data = (await res.json()) as { thoughts: StoredThought[] };
      setThoughts(data.thoughts);
    } catch (err) {
      console.warn('[thoughts] refresh failed', err);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return;
      const data = (await res.json()) as Health;
      setHealth(data);
    } catch (err) {
      console.warn('[health] failed', err);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    refreshThoughts();
    const t = setInterval(refreshThoughts, 4000);
    return () => clearInterval(t);
  }, [loadHealth, refreshThoughts]);

  const start = useCallback(async () => {
    setErrorMsg(null);
    setState('connecting');
    try {
      const res = await fetch('/api/session');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Session error ${res.status}`);
      }
      const { signedUrl } = (await res.json()) as { signedUrl: string };

      const conversation = await Conversation.startSession({
        signedUrl,
        clientTools: {
          // The ConvAI agent calls this when it has captured a thought.
          // Configure the tool on the agent dashboard with one string arg.
          capture_thought: async ({ transcript, user_clarification }: { transcript: string; user_clarification?: string }) => {
            try {
              const r = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, clarification: user_clarification })
              });
              const json = await r.json();
              refreshThoughts();
              return json?.agent_reply ?? 'Captured.';
            } catch (err) {
              console.warn('[capture-tool] failed', err);
              return 'Captured.';
            }
          }
        },
        onConnect: () => setState('listening'),
        onDisconnect: () => setState('idle'),
        onError: (msg) => {
          console.error('[convai] error', msg);
          setErrorMsg(typeof msg === 'string' ? msg : 'Voice connection lost');
          setState('error');
        },
        onModeChange: ({ mode }) => {
          if (mode === 'listening') setState('listening');
          if (mode === 'speaking') setState('speaking');
        },
        onMessage: ({ source, message }) => {
          // Display-only — the `capture_thought` client tool is the source
          // of truth for routing + storage. If your agent isn't configured
          // with that tool, capture happens via "Play storyboard" instead.
          if (source === 'user') setLastUserText(message);
          if (source === 'ai') setLastAgentText(message);
        }
      });

      convRef.current = conversation;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? 'Failed to start session');
      setState('error');
    }
  }, [refreshThoughts]);

  const stop = useCallback(async () => {
    try {
      await convRef.current?.endSession();
    } finally {
      convRef.current = null;
      setState('idle');
    }
  }, []);

  const seedStoryboard = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/demo/seed?reset=1', { method: 'POST' });
      if (!res.ok) throw new Error(`Seed failed ${res.status}`);
      await refreshThoughts();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? 'Seed failed');
    }
  }, [refreshThoughts]);

  const playDigest = useCallback(async () => {
    setDigestState('loading');
    setErrorMsg(null);
    setDigestAudio(null);
    try {
      const res = await fetch('/api/resurface');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Digest error ${res.status}`);
      }
      const data = (await res.json()) as { script: string; audioUrl: string | null };
      setDigestScript(data.script ?? '');
      setDigestAudio(data.audioUrl ?? null);
      setDigestState(data.audioUrl ? 'ready' : 'ready');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? 'Digest failed');
      setDigestState('error');
    }
  }, []);

  const active = state === 'listening' || state === 'speaking' || state === 'connecting';
  const integrationsList = useMemo(() => {
    if (!health) return [];
    return [
      ['Todoist', health.integrations.todoist],
      ['Notion', health.integrations.notion],
      ['Calendar', health.integrations.calendar],
      ['Cursor', health.integrations.cursor]
    ] as const;
  }, [health]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-6">
      <header className="text-center">
        <h1 className="text-3xl font-light tracking-wide">Archimedes</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] opacity-50">Shower-thought voice agent</p>
        <p className="mt-3 text-sm opacity-70">{captionFor(state)}</p>
      </header>

      <section className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={active ? stop : start}
          aria-label={active ? 'Stop listening' : 'Start listening'}
          className={`relative flex h-44 w-44 items-center justify-center rounded-full text-archimedes-mist transition ${
            active
              ? 'bg-archimedes-accent shadow-[0_0_80px_rgba(58,134,255,0.6)] pulse-ring'
              : 'bg-archimedes-mist/10 hover:bg-archimedes-mist/20'
          }`}
        >
          <MicIcon className="h-16 w-16" />
        </button>

        <div className="min-h-[64px] max-w-sm text-center text-sm opacity-80">
          {lastUserText && <p className="mb-1 italic">"{lastUserText}"</p>}
          {lastAgentText && <p className="opacity-70">— {lastAgentText}</p>}
        </div>

        {errorMsg && (
          <p className="text-center text-xs text-red-300">{errorMsg}</p>
        )}
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          onClick={seedStoryboard}
          className="rounded-full border border-archimedes-mist/20 px-3 py-1 opacity-80 hover:bg-archimedes-mist/10"
          title="Inject the four storyboard thoughts (for filming the routing animation)"
        >
          Play storyboard
        </button>
        <button
          onClick={playDigest}
          className="rounded-full border border-archimedes-mist/20 px-3 py-1 opacity-80 hover:bg-archimedes-mist/10"
        >
          {digestState === 'loading' ? 'Synthesising…' : 'Morning digest'}
        </button>
      </section>

      {digestScript && (
        <section className="mt-4 rounded-lg border border-archimedes-mist/15 bg-archimedes-mist/[0.04] p-3 text-sm">
          <p className="mb-2 text-xs uppercase tracking-widest opacity-50">Today's digest</p>
          <p className="opacity-90">{digestScript}</p>
          {digestAudio && (
            <audio controls className="mt-2 w-full" src={digestAudio} />
          )}
          {!digestAudio && health?.elevenlabs.api_key === false && (
            <p className="mt-2 text-xs opacity-50">
              (Add ELEVENLABS_API_KEY to .env.local to hear this in your cloned voice.)
            </p>
          )}
        </section>
      )}

      <section className="mt-6 flex-1 overflow-hidden">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest opacity-50">
          <span>Recent thoughts</span>
          <span>{thoughts.length}</span>
        </div>
        <ul className="space-y-2">
          {thoughts.length === 0 && (
            <li className="rounded-lg border border-dashed border-archimedes-mist/15 p-3 text-xs opacity-60">
              Tap the mic and speak a thought, or hit <em>Play storyboard</em> to see Archimedes route four sample thoughts.
            </li>
          )}
          {thoughts.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-archimedes-mist/10 bg-archimedes-mist/[0.04] p-3 text-sm"
            >
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest opacity-50">
                <span>{APP_LABELS[t.classification.target_app] ?? t.classification.target_app}</span>
                <span>{relativeTime(t.captured_at)}</span>
              </div>
              <p className="text-sm">{t.classification.payload.title}</p>
              {t.classification.payload.tags && t.classification.payload.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.classification.payload.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-archimedes-mist/10 px-2 py-[1px] text-[10px] opacity-70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {t.integration_result && t.integration_result.ok === false && (
                <p className="mt-1 text-[10px] opacity-50">
                  {t.integration_result.app} dispatch: {t.integration_result.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-widest opacity-50">
        <span>Storage: {health?.memory ?? '…'}</span>
        <span>·</span>
        <span>
          {health?.classifier.openai ? 'LLM router' : 'Rule router'}
        </span>
        <span>·</span>
        {integrationsList.map(([name, ok]) => (
          <span key={name} className={ok ? 'text-archimedes-accent' : 'opacity-40'}>
            {name}
          </span>
        ))}
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

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const delta = Math.max(0, Date.now() - t);
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`;
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
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
