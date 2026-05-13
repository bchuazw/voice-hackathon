# ARCHITECTURE — Archimedes

## High-level data flow

```
   PHONE (Safari/Chrome, PWA)
   ├── Mic button (tap to start)
   └── WebRTC mic stream
              │
              ▼
   ElevenLabs ConvAI WebSocket
   (STT + agent + TTS in one stream, sub-1s turns)
              │
              ▼ (on turn-end event)
   Next.js Edge function: /api/capture
              │
              ├── Classifier LLM (OpenAI or Anthropic)
              │   → { type, target_app, payload, due_at, tags }
              │
              ├── Integration dispatch:
              │   ├── todoist.createTask()
              │   ├── calendar.createEvent()
              │   ├── notion.appendToDB()
              │   └── cursor.appendTodo()
              │
              └── memory.save() → Supabase
                                     │
                                     ▼
                          (cross-day storage for resurfacing)


   MORNING DIGEST (cron @ 7am or manual trigger)
   /api/resurface
              │
              ├── memory.fetchSince(24h)
              ├── cluster.detect() (theme repetition)
              ├── synthesize digest text via LLM
              └── TTS via ElevenLabs (using USER'S CLONED voice)
                     │
                     ▼
              return audio URL → phone push / auto-play
```

---

## Components

### 1. Frontend (`app/page.tsx`)
- **Single page, single button.** No navigation, no settings.
- States: `idle`, `listening`, `speaking`, `error`.
- On tap: fetches signed ConvAI URL from `/api/session`, opens WebSocket via `@elevenlabs/client`.
- On turn end: POSTs the transcript to `/api/capture` (fire-and-forget; the voice loop doesn't wait).
- Visual feedback: pulsing button when agent is speaking, ring animation when listening.

### 2. Session endpoint (`app/api/session/route.ts`)
- Mints a signed ElevenLabs ConvAI URL using `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID`.
- Returns `{ signedUrl: string }` for the browser to connect to.
- Reason for server-side mint: keeps API key out of the browser.

### 3. Capture endpoint (`app/api/capture/route.ts`)
- Receives `{ transcript: string, conversationId: string }`.
- Calls `router.classify(transcript)` → returns structured intent.
- Dispatches to the matching integration adapter.
- Saves to Supabase via `memory.save()`.
- Returns 200 immediately (don't block the voice loop).

### 4. Router (`lib/router.ts`)
Single LLM call that returns:
```ts
type ClassifiedThought = {
  type: 'task' | 'calendar' | 'note' | 'reminder' | 'message' | 'code' | 'research';
  target_app: 'todoist' | 'calendar' | 'notion' | 'reminders' | 'imessage' | 'cursor';
  payload: {
    title: string;
    body?: string;
    due_at?: string; // ISO
    tags?: string[];
    target_repo?: string; // for code thoughts
    target_person?: string; // for messages
  };
  confidence: number; // 0-1
  needs_clarification?: string; // if ambiguous, the agent should ask this
};
```
- Uses OpenAI structured outputs or Anthropic tool use for guaranteed JSON shape.
- Fallback if API fails: dump to Notion "uncategorized."

### 5. Integration adapters (`lib/integrations/*`)
- Each adapter exports `async function dispatch(payload: ClassifiedThought): Promise<{ url?: string; id?: string }>`.
- Adapters **must never throw** — log errors and return a partial result. The voice loop must never break.

**todoist.ts:** uses the REST v2 API. Single endpoint: POST /tasks.
**calendar.ts:** Google Calendar API v3. Requires OAuth2 (use refresh token stored in `.env`).
**notion.ts:** Notion API. Append to a database by ID.
**cursor.ts:** the special one. Appends a markdown bullet to `.cursor/todos.md` in a configured local repo path. If `CURSOR_TARGET_REPO_URL` is a GitHub URL, optionally creates a PR or issue comment via `gh` CLI.

### 6. Memory (`lib/memory.ts`)
- Supabase client wrapper.
- One table: `thoughts`.
- Schema:
```sql
create table thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  transcript text not null,
  classification jsonb not null,
  integration_result jsonb,
  embedding vector(1536), -- for cluster detection (use pgvector)
  captured_at timestamptz not null default now(),
  resurfaced_at timestamptz
);
```
- Methods: `save()`, `fetchSince(hours)`, `findClusters()` (cosine similarity over embeddings).

### 7. Resurfacing (`app/api/resurface/route.ts`)
- Fetches last 24h of captures.
- Calls cluster detection (group by cosine similarity > 0.8).
- Generates digest text: "You had 3 thoughts yesterday. First..."
- Synthesizes audio via ElevenLabs TTS using the **user's cloned voice ID** from `ELEVENLABS_USER_VOICE_ID`.
- Returns `{ audioUrl: string, items: ThoughtSummary[] }`.

### 8. ConvAI agent config (configured at elevenlabs.io/app/conversational-ai)
- **System prompt:** see `prompts/capture-agent.md`.
- **Tools:** the agent has ONE tool: `capture_thought(transcript: string)`. The agent's only job is to confirm verbally, optionally ask one clarifying question, then call this tool. The classifier on the server does the real routing.
- **Voice:** Adam (deep, thoughtful) or a custom "Archimedes" character voice.
- **Turn-taking:** aggressive — interrupt detection on, silence threshold short (~500ms).
- **Conversation limit:** unlimited (this is an always-on assistant).

---

## Why this architecture

- **ConvAI handles STT + TTS + interruption + turn-taking** — we don't have to build any of that. Massive timesaver.
- **The agent itself is "dumb"** — it confirms and captures. The classifier on our server is "smart." This means:
  - We can iterate the classifier prompt without re-deploying the agent.
  - The agent can stay extremely fast (no big LLM call in the voice loop).
  - We can swap classifier models cheaply.
- **Supabase + pgvector** gives us embedding-based cluster detection with one extension. No vector DB to manage.
- **Vercel deploy is one command** — `vercel --prod`. Demo URL is shareable.

---

## Latency budget

For the voice loop to feel instant:
- ConvAI round-trip: ~700ms (their default, can be tuned)
- Our `/api/capture` call: must be **fire-and-forget**. Frontend doesn't wait for routing.
- The integration dispatch happens in the background; if it fails, we log to Supabase as "needs retry."

If the voice loop ever waits for our server, the demo dies. Treat the capture API as eventually-consistent.

---

## Security / pragmatic shortcuts

- No auth for the demo. Single user. `user_id` hardcoded to `'demo'`.
- API keys in `.env.local`. Don't commit.
- Mic permission prompted on first tap (browser handles).
- ElevenLabs signed URLs expire fast (good — don't extend).
- Supabase RLS off for the demo. Turn on if you ever want public.
