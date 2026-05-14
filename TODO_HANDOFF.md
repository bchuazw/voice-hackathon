# TODO_HANDOFF — what's left for the next agent / for me-the-human

> Status as of last commit on `claude/elevenlabs-hackathon-build-2ZS6k`:
> `npm run typecheck` and `npm run build` both pass clean.
> The voice loop, classifier, integrations, in-memory store, digest, and
> storyboard-seed demo all work end-to-end with zero env vars set.
>
> What remains is (a) wiring real credentials so the integrations actually
> talk to Todoist/Notion/Calendar/Cursor, (b) filming the submission video,
> and (c) submitting + posting. Optional polish items at the bottom.

---

## P0 — must do before submitting

### 1. Configure ElevenLabs

- [ ] Get an API key at https://elevenlabs.io/app/settings/api-keys.
      Paste into `.env.local` as `ELEVENLABS_API_KEY`.
- [ ] Create a Conversational AI agent at https://elevenlabs.io/app/conversational-ai:
  - System prompt: paste `prompts/capture-agent.md` verbatim.
  - Voice: pick `Adam` (default English) or any deeper, thoughtful voice.
  - Turn-taking: aggressive — silence threshold ~500ms, interrupt on.
  - **Client tool** (critical): add a tool named exactly `capture_thought`
    with parameters:
      - `transcript: string` (required)
      - `user_clarification: string` (optional)
    The browser SDK's `clientTools.capture_thought` handler in
    `app/page.tsx` will receive these. The server does the routing.
  - Copy the agent ID → `.env.local` `ELEVENLABS_AGENT_ID`.
- [ ] **Clone your voice** at https://elevenlabs.io/app/voice-lab → Instant
      Voice Clone. Upload 60s of clean audio. Copy the voice ID →
      `.env.local` `ELEVENLABS_USER_VOICE_ID`. This is the wow moment.
- [ ] Test the voice loop: `npm run dev`, open `http://localhost:3000`,
      tap the mic, say "hey Archimedes, remind me to call Mom tonight."
      You should see the thought appear in the feed within ~1s of
      finishing the sentence.

### 2. Wire one integration so the routing is real on camera

Pick the easiest target — Todoist — and prove the round-trip works on camera.

- [ ] Get a Todoist API token at https://todoist.com/app/settings/integrations/developer.
      Paste into `.env.local` `TODOIST_API_TOKEN`.
- [ ] Trigger a capture, then refresh Todoist in a browser — the task
      should appear with the right title, tags, and (if you said "tomorrow
      morning") a due date.

Stretch — Notion, Calendar, Cursor:

- [ ] **Notion:** create an integration at https://www.notion.so/my-integrations,
      create a database with columns `Title (title)`, `Type (select)`,
      `Tags (multi-select)`, `Source (rich_text)`, `Captured (date)`,
      `Body (rich_text)`. Share the DB with the integration. Paste
      `NOTION_API_KEY` + `NOTION_DATABASE_ID` into `.env.local`.
- [ ] **Calendar:** create an OAuth client at https://console.cloud.google.com,
      run a one-time consent flow to mint a refresh token for scope
      `https://www.googleapis.com/auth/calendar.events`. Paste
      `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
      into `.env.local`. Note: `GOOGLE_CALENDAR_ID` defaults to `primary`.
- [ ] **Cursor:** set `CURSOR_TARGET_REPO_PATH` to an absolute path of a
      local repo with a `.cursor/` folder (or any folder — we'll mkdir
      it). Speak a code thought; `tail -F .cursor/todos.md` to see the
      append.

If you only have time for one integration, do Todoist (Shot 3 split-screen
needs it) and Cursor (Shot 4 needs it). Skip the others — the demo
storyboard button still routes them visually in the UI.

### 3. Set up persistent memory (optional but nicer)

The in-memory store works fine for one filming session, but Vercel cold-
starts will wipe it. For the deployed demo, switch to Supabase:

- [ ] Create a free Supabase project at https://supabase.com.
- [ ] Open SQL editor → paste `supabase/schema.sql` → run.
- [ ] Copy the project URL + the **service role** key (not the anon key)
      into `.env.local` as `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
- [ ] Hit `/api/health` — should now report `"memory": "supabase"`.

### 4. Deploy to Vercel

- [ ] `npx vercel --prod` from the repo root.
- [ ] In the Vercel dashboard for the project, **Settings → Environment
      Variables**, add every key from `.env.local`. Re-deploy after.
- [ ] Hit the deployed `/api/health` to confirm everything's wired.
- [ ] Warm the routes once before filming (cold starts add 2–3s).

### 5. Generate the music

- [ ] https://elevenlabs.io/app/music → prompt:
      `upbeat tech demo, lo-fi piano + warm synth, 90 bpm, optimistic, 75 seconds`
- [ ] Download mp3, save as `assets/soundtrack.mp3` (gitignore it; it's
      not part of the deliverable).

### 6. Film the video

Follow `SUBMISSION_VIDEO_SCRIPT.md` shot-by-shot. Order matters:

- [ ] Pre-roll: record the digest audio first (it's Shot 2's audio bed).
      Click **Morning digest** in the UI, screen-record, extract audio.
- [ ] Shot 1: bathroom hook, 5s.
- [ ] Shot 2: walk-to-coffee, cloned-voice digest plays from pocket, 13s.
- [ ] Shot 3: live capture (or use **Play storyboard** if the agent's
      `capture_thought` tool is flaky), routing overlay, 20s.
- [ ] Shot 4: Cursor `.cursor/todos.md` append on a real laptop, 14s.
- [ ] Shot 5: cluster surprise, kitchen, 13s.
- [ ] Shot 6: close + end-card, 10s.

### 7. Edit in CapCut

- [ ] Auto-captions, fix the brand-name typos (Archimedes / ElevenLabs /
      Cursor / Todoist / JWT / Q3).
- [ ] Soundtrack at 18%, ducked under VO.
- [ ] Export 1080×1920, MP4, H.264, 30 fps.
- [ ] Watch it muted once — captions need to carry the story.

### 8. Submit

- [ ] Push GitHub repo public.
- [ ] Submit at https://hacks.elevenlabs.io/hackathons/7. Use the copy
      in `SOCIAL_POSTS.md` § "Submission form copy".
- [ ] Cover image: `public/cover.svg` OR a peak frame from Shot 2.
- [ ] Paste GitHub + Vercel + video URLs.

### 9. Post to 4 socials (+200 free points)

Use `SOCIAL_POSTS.md` captions. Upload video **natively** on each
platform; don't link YouTube.

- [ ] X (Twitter) — pin the tweet. Reply 30 min later with a follow-up.
- [ ] LinkedIn — story framing, ≤200 words.
- [ ] Instagram Reels — captions essential.
- [ ] TikTok — front-load the cloned-voice reveal in first 3s.
- [ ] Drop the X link in the ElevenLabs Discord `#elevenhacks` channel
      (Most Popular bonus).

---

## P1 — nice to have, ship if there's time

### Code polish

- [ ] **Switch `/api/capture` to use OpenAI structured outputs.** Currently
      we use `response_format: { type: 'json_object' }` and normalise after
      parse. Once you confirm the model supports it, swap to a JSON schema
      response — eliminates the `normalizeClassified` defensive layer.
      File: `lib/router.ts:60-65`.
- [ ] **Embed digest audio in Supabase Storage.** Currently we return a
      base64 data URL (~OK for clips under 1MB but bloats the JSON).
      File: `lib/elevenlabs.ts:18-46`. Upload to a bucket, return a
      public URL.
- [ ] **Real cron for the morning digest.** Add a Vercel cron at 7am
      hitting `/api/resurface` + sending a web push or SMS. Right now the
      "Morning digest" button is the only trigger.
- [ ] **PWA icons.** `public/manifest.json` has empty `icons`. Drop a
      192/512 PNG of the cover graphic so iOS Add-to-Home-Screen looks
      proper. (Use rsvg-convert or any SVG→PNG tool on `public/cover.svg`.)
- [ ] **Live cluster detection in the capture path.** Right now clusters
      only surface when the digest fires. Hot-path detection — "you've
      said this before" — would be a nicer UX. File: `lib/memory.ts:140-170`.
- [ ] **Speech-feedback on capture-tool return.** The `capture_thought`
      client tool returns a string (e.g. "Sent to Cursor.") that the
      agent currently doesn't always speak. Confirm the ConvAI agent
      prompt is set to read tool returns aloud, or update the prompt.
- [ ] **GitHub issue dispatch for code thoughts.** When
      `CURSOR_TARGET_REPO_URL` is a real GitHub URL (vs a local path),
      use the GH MCP server (or `gh api`) to file an issue. File:
      `lib/integrations/cursor.ts:18-33`.

### Demo polish

- [ ] **Cover image PNG.** Convert `public/cover.svg` to a 1280×720 PNG
      for hackathon-form upload (some forms reject SVG).
- [ ] **A pre-recorded fallback clip of Shot 2.** If your filming wifi
      or mic fails, having the cloned-voice 13s audio pre-rendered means
      you can still ship the wow.
- [ ] **A second cluster theme.** The storyboard seed clusters only on
      "Q3". Add a second cluster (e.g. an "auth" theme spanning two
      thoughts) so the digest can demo "multiple clusters detected."
      File: `lib/demoSeed.ts`.

### Documentation polish

- [ ] **GIF in the README.** A short looping GIF of the live capture +
      routing flow makes the repo land harder on browse.
- [ ] **Architecture diagram.** `ARCHITECTURE.md` has an ASCII diagram —
      a real PNG/SVG would help reviewers grok the data flow.

---

## P2 — known caveats

- **Tag-overlap clustering is a fallback.** When `OPENAI_API_KEY` is
  unset, `findClusters` groups by shared tags instead of cosine similarity
  on embeddings. The behaviour differs subtly (more aggressive, lower
  precision). If you're filming with real keys, the embeddings path runs
  and the cluster summaries will be more semantic.
- **In-memory store is per-instance.** On Vercel, two requests can land
  on two cold instances and see different thought lists. Configure
  Supabase before the deployed demo or stick to a single warm region.
- **Browser must access `/api/session` over HTTPS for the mic permission
  to stick on iOS.** Use ngrok during local-LAN filming, or just record
  using a desktop browser.
- **`.cursor/todos.md` is local to the server.** On Vercel this writes
  to `/tmp` and disappears. The integration is meant for local-machine
  Cursor (your own laptop) — keep `CURSOR_TARGET_REPO_PATH` empty in
  Vercel envs and only run that path on your local dev server.

---

## P3 — out of scope (don't build)

These were in `IDEAS.md` or surfaced during the build. Save for v2:

- Multi-user accounts / auth.
- Editing / deleting captured thoughts.
- Settings UI (everything is `.env`).
- Real cron infra beyond Vercel cron.
- Push notifications / SMS.
- Mobile-native app.

---

## How to hand this off cleanly

If you (the next agent) is picking this up cold:

1. Read `README.md`, then this file.
2. Run `npm install && npm run dev` and click around — the storyboard
   seed + digest button work with zero secrets, so you can see what
   "good" looks like in 60 seconds.
3. Pick the highest-leverage P0 item the human asks for. Don't try to
   do everything — the goal is a shippable submission, not a complete
   product.
4. Each P0 item is independent — you can do them in any order.

Branch: `claude/elevenlabs-hackathon-build-2ZS6k`. Stay on it; don't
fork to a new branch unless the human asks.
