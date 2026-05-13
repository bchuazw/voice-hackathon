# Archimedes — Builder Agent Start Here

> You are a builder agent picking up a hackathon project. Read this file first.
> Estimated time to ship: 24 hours. Deadline: **Thu 14 May 17:00**.

---

## What you're building

**Archimedes** — a voice agent that captures shower thoughts (and any other hands-busy thought), routes them intelligently into your task/calendar/notes apps, and resurfaces them at the right moment in later days.

Tagline: *"Never lose a shower thought again."*

Submission for **ElevenHacks #8 (Cursor)**. Theme: *build something you can use without ever touching a keyboard.* Voice is the **only** interface.

---

## Read these docs (in order)

1. **`CONTEXT.md`** — the hackathon brief: requirements, scoring math, video playbook, judges. Memorize the scoring math.
2. **`PROJECT_BRIEF.md`** — Archimedes product spec. What we're building and why.
3. **`ARCHITECTURE.md`** — system design, components, data flow.
4. **`AGENT_PROMPTS.md`** — the ConvAI agent prompts + classifier prompts. These are the highest-value asset; don't rewrite from scratch.
5. **`VIDEO_PLAN.md`** — 90-second video shot list. **The video is worth more than the code.** See CONTEXT.md scoring.
6. **`SUBMISSION_CHECKLIST.md`** — final submission steps.
7. **`IDEAS.md`** — alternative project ideas (in case this one stalls). Archimedes is the picked direction.

---

## Tech stack (chosen for ship speed)

- **Next.js 14 + TypeScript** — App Router, deploys to Vercel in one click
- **ElevenLabs Conversational AI** — primary voice agent (STT + LLM + TTS in one WebSocket)
- **ElevenLabs SDK (`@elevenlabs/elevenlabs-js`)** — for cloning, music, optional standalone TTS
- **Supabase** — thought storage + cross-day memory (free tier, no setup pain)
- **Integration adapters** — Todoist, Google Calendar, Notion, Cursor TODOs
- **Tailwind CSS** — minimal UI (this is a voice app, the UI is just a big button)

Why not Python: ConvAI's WebSocket is easiest in browser/Node; Next.js gives free Vercel deploy + mic API + Edge functions for low-latency routing.

---

## Quick start (for the builder agent)

```powershell
cd C:\Users\bchua\Desktop\StuffToTest\voice-hackathon
npm install
copy .env.example .env.local
# Fill in keys in .env.local (see SETUP section below)
npm run dev
# Open http://localhost:3000 on phone over LAN (or use ngrok)
```

### Minimum viable demo (12-hour path)

1. Get the ElevenLabs ConvAI agent talking back-and-forth in the browser.
2. Make it route a captured thought into **one** integration (Todoist is easiest).
3. Make a single-button page that starts/stops the session.
4. Record the video.

### Stretch (24-hour path)

5. Add Google Calendar + Notion routing.
6. Add cross-day storage in Supabase.
7. Add the resurfacing flow ("you had 3 shower thoughts last night, ready?").
8. Add Cursor TODO integration (write to `.cursor/todos.md` in a target repo).
9. Add cluster detection ("this is the third time you've mentioned X").

---

## SETUP — required API keys

Copy `.env.example` to `.env.local` and fill in:

| Var | Where to get it | Required for |
|---|---|---|
| `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys | Everything |
| `ELEVENLABS_AGENT_ID` | Create a Conversational AI agent at elevenlabs.io/app/conversational-ai | Voice loop |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | OpenAI/Anthropic console | Router classifier (the ConvAI agent itself is hosted on ElevenLabs; this is for the classifier post-capture) |
| `TODOIST_API_TOKEN` | https://todoist.com/app/settings/integrations/developer | Task routing |
| `GOOGLE_CALENDAR_CREDENTIALS` | https://console.cloud.google.com (OAuth2 JSON) | Calendar routing |
| `NOTION_API_KEY` + `NOTION_DATABASE_ID` | https://www.notion.so/my-integrations | Notes routing |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | https://supabase.com (new project, free tier) | Cross-day memory |

If you can't get all of these in time: **gracefully degrade**. Each integration should fail silently with a console warning and the thought still gets logged to Supabase / a local JSON file. The voice loop must never break.

---

## Critical product principles

1. **The voice loop must feel instant.** Sub-1s turn time. Use ConvAI's streaming. If latency is bad, the demo dies.
2. **One clarifying question max.** The agent should not interrogate. If a thought is ambiguous, ask once, then route on best guess.
3. **The agent shuts up when you go quiet.** No filler. No "is there anything else?" loops. Silence is fine.
4. **Use the user's cloned voice for the resurfacing flow** — that's the wow moment in the video. The capture loop can use a stock voice (or a cloned "Archimedes" character voice).
5. **Cursor must appear at runtime, not just build time.** Code-related thoughts should route into Cursor (a `.cursor/todos.md` file or PR comment). This is sponsor-delight critical.

---

## Project structure

```
voice-hackathon/
├── README.md                       # this file
├── CONTEXT.md                      # hackathon brief
├── PROJECT_BRIEF.md                # Archimedes spec
├── ARCHITECTURE.md                 # system design
├── AGENT_PROMPTS.md                # ConvAI + router prompts
├── VIDEO_PLAN.md                   # 90-sec video shot list
├── SUBMISSION_CHECKLIST.md         # final prep
├── IDEAS.md                        # alternative ideas (backup)
├── .env.example                    # required keys
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # single-button voice UI
│   ├── globals.css
│   └── api/
│       ├── session/route.ts        # mint ConvAI signed URL
│       ├── capture/route.ts        # receive transcript → classify → route
│       └── resurface/route.ts      # fetch + read out cross-day thoughts
├── lib/
│   ├── elevenlabs.ts               # SDK init
│   ├── router.ts                   # classify thought type
│   ├── memory.ts                   # Supabase wrapper
│   └── integrations/
│       ├── todoist.ts
│       ├── calendar.ts
│       ├── notion.ts
│       └── cursor.ts               # write to .cursor/todos.md
└── prompts/
    ├── capture-agent.md            # ConvAI agent system prompt
    ├── router-classifier.md        # post-capture classifier prompt
    └── resurfacing.md              # cross-day surfacing prompt
```

---

## DOs and DON'Ts for the builder agent

### DO
- Ship the voice loop end-to-end before adding any integrations
- Test on a real phone over LAN (or ngrok) — desktop browser feels great, phone feels honest
- Use the ConvAI default English voice initially; voice-clone the demo user only if time allows
- Generate the video soundtrack with ElevenLabs Music (free virality bonus + sponsor demo)
- Make the UI ugly and minimal — one big button. Voice is the product.

### DON'T
- Don't build a settings page, signup flow, or admin UI. Out of scope.
- Don't try to handle every integration perfectly. Pick 2-3 and nail them.
- Don't over-engineer the resurfacing logic. A simple `next-morning-digest` cron with one cluster heuristic is enough for the demo.
- Don't write tests. This is a hackathon.
- Don't forget to film the video. **Half the time budget. Minimum.**

---

## When you're done

1. Run through `SUBMISSION_CHECKLIST.md`.
2. Push to a public GitHub repo.
3. Deploy to Vercel (`vercel --prod`).
4. Submit at https://hacks.elevenlabs.io/hackathons/7 (sign in first).
5. Post to X, LinkedIn, Instagram, TikTok with the video + tags.

Tags: `@cursor_ai`, `@elevenlabsio`, `#ElevenHacks`

---

## Build status (current state of this repo)

The voice loop, classifier, integrations, memory, and resurfacing endpoint
are all wired together. **`npm run typecheck` and `npm run build` pass clean.**

### Run it now

```bash
npm install
npm run dev
# open http://localhost:3000
```

With **zero env vars** the demo still works end-to-end:
- Tap **Play storyboard** → injects four canonical thoughts → routes them through
  the rule-based classifier → renders the live feed.
- Tap **Morning digest** → generates a templated digest script. (Add
  `ELEVENLABS_API_KEY` to also hear it spoken; add `ELEVENLABS_USER_VOICE_ID`
  to hear it in your cloned voice — the wow moment.)
- Integration adapters return `{ok: false, error: 'no-token'}` when their
  keys are missing instead of throwing, so the voice loop never breaks.

Add keys progressively in `.env.local` to upgrade each layer.

### Demo / submission artifacts

| File | Purpose |
|---|---|
| `SUBMISSION_VIDEO_SCRIPT.md` | 75-second shot list with lines, captions, timings |
| `DEMO_GUIDE.md` | operator's manual — what to tap on the phone in each shot |
| `SOCIAL_POSTS.md` | platform-by-platform copy (X / LinkedIn / Reels / TikTok) + submission form text |
| `public/cover.svg` | submission cover image |

### Endpoints

| Route | Verb | What |
|---|---|---|
| `/api/session` | GET | mint a ConvAI signed URL |
| `/api/capture` | POST | classify + dispatch + persist a captured transcript |
| `/api/thoughts` | GET | feed of recent thoughts (UI) |
| `/api/resurface` | GET | digest script + cloned-voice audio |
| `/api/demo/seed` | POST | inject the four storyboard thoughts (`?reset=1` to wipe; `?live=1` to re-classify with the live LLM) |
| `/api/health` | GET | which integrations are configured |
