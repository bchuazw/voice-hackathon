# PROJECT_BRIEF — Archimedes

## One-liner
A voice agent that captures shower thoughts, routes them intelligently into your task/calendar/notes apps, and resurfaces them at the right moment in later days.

## The problem
- Humans have great ideas in low-friction, hands-busy moments: the shower, the commute, walking the dog, falling asleep.
- We forget most of them because we can't write them down.
- Existing voice notes apps capture audio but don't *do* anything with it — the user still has to come back to type it up.
- Task managers like Todoist have voice input, but only for single items. No clarification, no context, no resurfacing.

## The product
A voice agent that runs as a web app (PWA-installable on phone). One tap to start the session. It listens, asks at most one clarifying question per thought, routes everything intelligently, then resurfaces relevant items at the right time.

### Three core loops

#### 1. Capture loop (live, sub-1s turn time)
User speaks. Agent:
- Confirms it heard (sub-second).
- If the thought is unambiguous → routes silently, brief audio confirm ("Got it. To Todoist.").
- If ambiguous → asks ONE clarifying question. Routes on best guess if user is vague.
- Stays silent when user stops talking. No "anything else?" loops.

Example:
> **User:** "I just realized we should rebrand the Q3 launch around accessibility."
> **Agent:** "Got it. Now-thing or remind-you-Monday thing?"
> **User:** "Monday, and loop in Sarah."
> **Agent:** "Done. Calendar note for Monday morning, Sarah tagged."

#### 2. Routing layer
Every captured thought is classified into one of:
- **Task** → Todoist / Linear
- **Calendar event** → Google Calendar
- **Note / half-baked idea** → Notion "Idea Compost" database
- **Reminder** → iOS Reminders or Todoist with due time
- **Message draft** → iMessage drafts or Slack saved message
- **Code idea** → Cursor `.cursor/todos.md` in a designated repo, or PR comment on a specified branch
- **Research question** → goes into "tomorrow's briefing" queue

Classification happens server-side with a small LLM call. The voice agent itself doesn't have to be smart — it's the post-capture classifier that does the routing.

#### 3. Resurfacing loop (the differentiator)
- **Morning digest:** between 7–9am, the agent calls *you* (or fires a push notification with one-tap listen) and reads back yesterday's captured thoughts in your **own cloned voice**. You verbally approve, refine, or discard each.
- **Cluster detection:** if the same theme appears 3+ times across days, agent surfaces it: *"You've mentioned the Q3 rebrand three times this week. Want me to make it a project?"*
- **Context-aware surfacing:** 5 minutes before a meeting with Sarah, your earbud whispers any past thought tagged with Sarah.

The resurfacing layer is what turns this from "voice notes" into "memory substrate."

---

## Core user flows (build in this order)

### Flow A — Capture (MVP, must ship)
1. User opens web app on phone (`archimedes.vercel.app`).
2. Big mic button. Tap to start.
3. Browser opens mic, connects to ElevenLabs ConvAI WebSocket.
4. User speaks a thought. Agent replies in ≤1s.
5. After turn ends, frontend POSTs transcript to `/api/capture`.
6. Server classifies, routes to integration, returns confirmation.
7. Agent speaks confirmation via TTS (or ConvAI's built-in).

### Flow B — Cross-day resurfacing (stretch)
1. Cron job (or manual trigger) at 7am.
2. Fetches yesterday's captures from Supabase.
3. Generates a digest using GPT/Claude + the cloned voice TTS.
4. Pushes to user (audio file URL via web push, or auto-plays on app open).

### Flow C — Cursor integration (sponsor delight, ship if time)
1. User says "code thought" or any thought classified as code.
2. Server appends to `.cursor/todos.md` in a configured target repo (the user's actual project).
3. Optional: opens a Cursor agent session via Cursor's CLI/API if available.

---

## Out of scope (don't build these)

- Multi-user accounts / auth (single-user demo for the hackathon)
- Settings UI (configure via `.env.local`)
- Mobile native app (PWA on iOS Safari is enough)
- Push notifications (web push is a bonus; SMS via Twilio is the fallback for "agent calls you")
- Editing/deleting captured thoughts (just append-only)
- Real cron infra (use a Vercel cron or a manual "Test Morning Digest" button for the demo)

---

## Success criteria (in priority order)

1. **The voice loop works end-to-end on a phone.** Sub-1s turn time. Filmable.
2. **At least one integration routes correctly.** Todoist is the easiest.
3. **The morning digest plays back a thought in the user's cloned voice.** The viral moment.
4. **The Cursor `.cursor/todos.md` integration works** for at least one demo thought.
5. **The 90-second video is shot, edited, captioned, and posted to 4 platforms.**

If you only ship 1 + 2 + 5: you have a submission. If you ship 1–5: you have a 1st-place candidate.

---

## Voice and character notes

- **Capture agent voice:** thoughtful, brief, slightly philosophical. Default to one of ElevenLabs' classical-sounding voices (Adam, Bill, or a custom "Archimedes" character). Greek-sage vibe is on-brand.
- **Resurfacing voice:** the user's own cloned voice. This is the emotional gut-punch.
- **Tone constraint:** the agent NEVER says "I'm sorry," NEVER apologizes for misunderstanding, NEVER asks "is there anything else." If it doesn't know, it asks one specific question.

See `AGENT_PROMPTS.md` for the exact system prompts.

---

## Demo script (the 5 things to show in the video)

1. **Capture** — wet hair, robe, foggy mirror. Speak a thought, hear instant confirmation.
2. **Routing visualization** — split-screen showing Todoist + Notion + Calendar updating.
3. **Cluster detection** — agent: *"That's the third time you've mentioned X this week."*
4. **Resurfacing in your own voice** — Monday morning walk to coffee, earbud plays *your* voice reminding you of *your* thought.
5. **Cursor integration** — open Cursor, see `.cursor/todos.md` populated by voice.

See `VIDEO_PLAN.md` for the full shot list.
