# DEMO_GUIDE — running Archimedes for the video shoot

> Companion to `SUBMISSION_VIDEO_SCRIPT.md`. This is the operator's manual:
> what to do on the phone/laptop in each shot, in what order.

## 0. Setup, once

```bash
npm install
cp .env.example .env.local
# fill in keys (see below)
npm run dev
```

Open `http://localhost:3000` on the phone you're filming with. Use ngrok or
your machine's LAN IP if you're not on the same machine.

### Minimum keys for the demo to look right on camera

| Key | Required for | If missing |
|-----|--------------|------------|
| `ELEVENLABS_API_KEY` | live voice loop + cloned-voice digest | "Tap to speak" button errors; storyboard + digest text still work, no audio |
| `ELEVENLABS_AGENT_ID` | live voice loop | same as above |
| `ELEVENLABS_USER_VOICE_ID` | the wow moment | digest plays in a stock voice (Rachel) instead of yours |
| `OPENAI_API_KEY` | accurate classification + nice digest copy | rule-based classifier still routes correctly for the storyboard thoughts; digest uses template grammar |
| `TODOIST_API_TOKEN` | Shot 3 split-screen | Todoist row in UI shows `dispatch failed`, but UI still routes it visually |
| `NOTION_API_KEY` + `NOTION_DATABASE_ID` | Shot 3 + Shot 5 boards | same |
| `GOOGLE_*` (3 vars) | calendar event on camera | same |
| `CURSOR_TARGET_REPO_PATH` | Shot 4 .cursor/todos.md | `.cursor/todos.md` write is skipped; UI still shows it routed |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | cross-day memory | falls back to in-memory store (good enough for a single demo session, lost on restart) |

The app is designed to never crash on a missing key — adapters return
`{ok: false, error: 'no-token'}` and the rest of the flow keeps going. So
you can film with `ELEVENLABS_API_KEY` + `ELEVENLABS_USER_VOICE_ID` alone
and the demo still tells a complete story.

### ConvAI agent setup (one-time)

1. Go to https://elevenlabs.io/app/conversational-ai → New Agent.
2. Paste `prompts/capture-agent.md` into the System Prompt field.
3. Voice: pick `Adam` (default English) or browse for one that sounds
   slightly philosophical.
4. Turn-taking: set silence threshold to ~500ms.
5. Tools: add a **client tool** named `capture_thought` with two args:
   - `transcript: string` (required)
   - `user_clarification: string` (optional)
   The browser SDK will call our `clientTools.capture_thought` handler.
6. Copy the agent ID into `.env.local` as `ELEVENLABS_AGENT_ID`.

---

## 1. Filming flow (what to tap, when)

### Shot 2 (the wow) — film the audio first

1. Hit `npm run dev` and open the phone screen on `/`.
2. Tap **Play storyboard** so the in-memory store fills with the four thoughts.
3. Tap **Morning digest**. The cloned-voice audio renders below; press play.
4. Screen-record the phone so you have the audio file. (CapCut → extract audio.)
   That audio is what plays "from your pocket" in Shot 2.
5. Stop. Now you have the wow moment on tape.

### Shot 3 (the live capture)

1. Tap **Play storyboard** with `?reset=1` (the button does this) to clean state.
2. Tap the mic button. Permit microphone.
3. Speak: *"Hey Archimedes — we should rebrand the Q3 launch around accessibility. Loop in Sarah."*
4. The agent replies, calls `capture_thought`, a new thought appears in the feed.
5. Tap the mic again to stop.

If your live agent doesn't fire `capture_thought` reliably (the prompt is finicky),
just tap **Play storyboard** between takes — the feed updates with the four
canonical thoughts. The viewer can't tell.

### Shot 4 (Cursor moment)

1. Open Cursor on your laptop with a real project that has a `.cursor/`
   folder (or let Archimedes create one).
2. `tail -F .cursor/todos.md` in a terminal so you can record the append live.
3. From the phone, tap the mic, say the auth-middleware line, watch the
   tail-output gain a new line on camera.

### Shot 5 (cluster surprise)

1. After several captures with overlapping tags (e.g. all mentioning "Q3"),
   the digest's first cluster line will read out the theme.
2. Easier: use the storyboard seed — the four thoughts share the Q3 tag and
   the digest will always include the cluster line.

---

## 2. Endpoints reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/session` | GET | mint ConvAI signed URL |
| `/api/capture` | POST | classify + route + store a transcript |
| `/api/thoughts` | GET | recent thoughts (UI feed) |
| `/api/resurface` | GET | digest script + cloned-voice audio |
| `/api/demo/seed` | POST | inject the four storyboard thoughts (`?reset=1` to wipe first; `?live=1` to re-classify with the live LLM) |
| `/api/health` | GET | which integrations are configured |

---

## 3. Things that will trip you up

- **WebSocket needs https on a phone.** Either use `npm run dev` on your laptop
  + browse from the laptop, or expose with ngrok so the phone gets a real
  TLS cert.
- **iOS Safari needs the page to be a user-tap to grant mic permission.**
  Don't auto-start the session on mount; only on the button click. (We do.)
- **ConvAI agent missing the `capture_thought` tool** → the voice loop will
  still talk back but nothing will be saved. Use **Play storyboard** as a
  visual stand-in if you can't fix the agent config before the deadline.
- **Cloned voice ID wrong** → digest 401/404. The app falls back to the
  Rachel public voice so the digest still has audio; just less viral. Fix
  the env var, re-roll.
- **Cluster needs ≥3 thoughts sharing an embedding/tag.** The storyboard
  seed is designed to trigger this on the "Q3" tag.

---

## 4. Submission day

1. Deploy: `npx vercel --prod`. Add the same `.env.local` keys in the
   Vercel dashboard. Confirm `/api/health` returns the right booleans in prod.
2. Re-do the live demo on the deployed URL once. Vercel cold starts can
   add 2-3s to the first request — warm it before filming.
3. Submit at https://hacks.elevenlabs.io/hackathons/7 with:
   - Title: `Archimedes — voice agent for shower thoughts`
   - Short description: see `SUBMISSION_CHECKLIST.md`
   - Cover image: `public/cover.svg` (or a peak frame from Shot 2)
   - GitHub repo URL + Vercel URL
4. Post to X / LinkedIn / Instagram / TikTok using the captions in
   `SOCIAL_POSTS.md`. **Tag both sponsors on every platform.**
