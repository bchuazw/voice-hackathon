# SOCIAL_POSTS — copy-paste captions

> +50 pts per platform, 4 platforms, +200 free points if you post on all of them.
> Always upload native video (not a YouTube link) so the platform algorithm pushes it.
> Always tag `@elevenlabsio` AND `@cursor_ai` AND `#ElevenHacks`.

---

## X (Twitter) — primary post

```
I have four good ideas a week. I forget three of them.

So I built Archimedes — a voice agent that lives in my shower.
It captures what I say, routes it into the right app, then
reads it back to me in my own voice the next morning.

Built in 24h with @cursor_ai + @elevenlabsio.

#ElevenHacks
```

**Attach:** 75-second vertical video, uploaded natively.
**Pin** the tweet.

### X follow-up (reply 30 minutes later for engagement bump)

```
The wow moment is the digest in your own cloned voice (ElevenLabs IVC) —
turns voice from "notes" into "memory you can hear."

Code-related thoughts route into Cursor's .cursor/todos.md at runtime.
Yes, your agent edits your repo for you.

Repo + live demo:
github.com/<you>/voice-hackathon
archimedes.vercel.app
```

---

## LinkedIn — story framing (≤200 words)

```
This week, I built a voice agent that captures my shower thoughts.

The pain: humans have great ideas in the shower, the commute, the walk
home. Most of them never make it past the moment. Voice notes apps capture
the audio — they don't *do* anything with it.

Archimedes is the missing layer. Tap one button, talk, walk away.
It listens, asks at most one clarifying question, and routes each
thought to the right place — Todoist for tasks, Calendar for events,
Notion for half-baked ideas, and `.cursor/todos.md` for code.

The viral moment: the next morning, it reads yesterday's thoughts back
to you — in your own cloned voice — and surfaces patterns it noticed
across the week.

Built end-to-end in Cursor with the ElevenLabs Conversational AI API,
voice cloning (Instant Voice Clone), and ElevenLabs Music for the demo
soundtrack. 24 hours, no keyboard required after the first build.

Demo video below. Submitting to #ElevenHacks (@cursor_ai @elevenlabsio).
```

**Attach:** native video. Don't link YouTube.

---

## Instagram Reels — short caption (algorithm punishes long captions)

```
I forget my best ideas in the shower. So I built this. 🚿

Voice agent → routes every thought → talks back in MY cloned voice.

Built in 24h with @elevenlabsio + @cursor_ai
#ElevenHacks #AI #voicetech
```

**Attach:** vertical 9:16 export, captions baked in.

---

## TikTok — front-load the hook

First 3 seconds **must** be the cloned-voice reveal — that's the algo bait.
Re-cut your video if needed: lead with Shot 2, then drop the title card,
then play the rest. Use TikTok's "captions" feature on top of your baked-in
ones (double captions = higher accessibility score).

```
I built an AI that lives in my shower 🚿
It reads me yesterday's thoughts in my own voice every morning.

24h build, @elevenlabsio + @cursor_ai
#ElevenHacks #AI #vibecoding
```

**Optional:** layer a popular trending sound at 5% volume under your VO
to nudge the algorithm. Don't let it cover your voiceover.

---

## Discord (#elevenhacks in the ElevenLabs Discord)

Drop the link with one line — judges + community see this and emoji-react.
That counts toward "Most Popular" (+200 pts).

```
Archimedes — voice agent for shower thoughts. Captures, routes, then resurfaces in your own cloned voice the next morning.

Live demo: <vercel url>
Repo: <github url>
Video: <x link>
```

---

## After posting

1. Reply to your own X post with one more demo angle 30 min later
   (e.g. show the rule-based classifier handling an off-script thought).
   Engagement bumps the Most Viral ranking.
2. React to other submissions with the 🚿 emoji — community goodwill +
   they reciprocate.
3. If a judge replies, answer fast and link the relevant code path
   (`lib/integrations/cursor.ts:18`, `lib/router.ts:42`, etc.).

---

## Submission form copy (paste into hacks.elevenlabs.io)

### Title

```
Archimedes — voice agent for shower thoughts
```

### One-sentence value prop

```
A voice agent that captures the thoughts you have in the shower
(or any hands-busy moment), routes them intelligently into your
apps, and resurfaces them the next morning in your own cloned voice.
```

### Full description

```
What it does. Tap one button, talk, walk away. Archimedes listens
to passing thoughts, asks at most one clarifying question, and routes
each thought into the right place — Todoist for tasks, Google Calendar
for events, Notion for half-baked ideas, and Cursor's .cursor/todos.md
for code thoughts. The next morning it reads yesterday's thoughts back
to you in your own cloned voice, surfaces patterns it noticed across
the week, and asks if you want to act on them.

How we used the tech. ElevenLabs Conversational AI handles the live
voice loop (STT + agent + streaming TTS, sub-1s turns) with a custom
agent prompt and a single client tool, `capture_thought`. A server-side
classifier turns each captured transcript into a typed action and
dispatches it to the matching integration. ElevenLabs Instant Voice
Cloning powers the morning resurfacing — you literally hear yourself
remind you of your own past thoughts. ElevenLabs Music generated the
demo soundtrack. Cursor was the entire build environment AND a
runtime target — code-related thoughts append to `.cursor/todos.md`
in a real project, so the agent your editor is on actually picks up
work the agent in your shower captured.

What makes it special. Most voice apps stop at capture. Archimedes
does the routing, the resurfacing, and cross-day cluster detection
("you've mentioned Q3 three times this week — want me to make it a
project?") — turning voice from a notes layer into a memory substrate
for your life. It's the first voice tool I'd actually keep using
after the hackathon ends.
```

### Tech / API list

```
- ElevenLabs Conversational AI (live agent)
- ElevenLabs Instant Voice Cloning (user's own voice for resurfacing)
- ElevenLabs Music (demo soundtrack)
- ElevenLabs TTS (digest playback)
- Cursor (build environment + runtime target via .cursor/todos.md)
- Next.js 14 + TypeScript on Vercel
- Supabase + pgvector (cross-day memory + cluster detection)
- OpenAI text-embedding-3-small + gpt-4o-mini (classifier only)
```

### Links

- GitHub: `<paste your repo URL here>`
- Live demo: `<paste your Vercel URL here>`
- 60s video: `<paste the X / native upload URL here>`
- Cover image: `public/cover.svg` (or a peak frame from your Shot 2)
