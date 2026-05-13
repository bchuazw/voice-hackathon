# SUBMISSION_CHECKLIST — Archimedes

> Deadline: **Thu 14 May 17:00**. Submit at https://hacks.elevenlabs.io/hackathons/7

## Pre-submission

### Project
- [ ] Live demo URL works on a phone (not just desktop). Test in Safari + Chrome.
- [ ] One-tap → mic permission → voice loop starts. No keyboard required.
- [ ] At least one integration routes correctly (Todoist is the easiest target).
- [ ] Capture confirms in ≤1 second. If latency is bad, debug before filming.
- [ ] Public GitHub repo. README has setup instructions.
- [ ] Deployed to Vercel. URL is short and memorable if possible.

### Video
- [ ] 60–90 seconds, vertical 9:16, 1080p+
- [ ] One-sentence value prop in first 5 seconds
- [ ] Captions baked in (most viewers watch muted)
- [ ] Background music (ElevenLabs Music, 15–20% volume)
- [ ] Mentions BOTH ElevenLabs and Cursor meaningfully (not just logos)
- [ ] Shows the product working in the real world (the bathroom IS the real world here)
- [ ] Demonstrates the cloned-voice resurfacing moment — that's the wow

### Cover image
- [ ] Clean screenshot or stylized graphic
- [ ] Readable at card size
- [ ] Captures the "wow" — e.g., phone on bathroom counter, mirror foggy, "Archimedes is listening..." UI

---

## Submission form fields

### Title
**Archimedes** — Voice agent for shower thoughts

### Short description (one-sentence value prop)
> A voice agent that captures the thoughts you have in the shower (or any hands-busy moment), routes them intelligently into your apps, and resurfaces them in your own cloned voice the next morning.

### Full description (3 paragraphs, max ~150 words)

> **What it does.** Tap one button, talk, walk away. Archimedes listens to passing thoughts, asks at most one clarifying question, and routes each thought into the right place — Todoist for tasks, Google Calendar for events, Notion for half-baked ideas, and Cursor's `.cursor/todos.md` for code thoughts. The next morning, it reads yesterday's thoughts back to you in your own cloned voice, surfaces patterns it noticed across the week, and asks if you want to act on them.

> **How we used the tech.** ElevenLabs Conversational AI handles the live voice loop (STT + agent + streaming TTS, sub-1s turns). A custom classifier on the server routes each captured thought to the right integration. ElevenLabs voice cloning powers the morning resurfacing — you literally hear yourself remind you of your own past thoughts. ElevenLabs Music generates the demo soundtrack. Cursor was the entire build environment and is also a runtime target: code-related thoughts land directly in `.cursor/todos.md` of a chosen repo.

> **What makes it special.** Most voice apps stop at capture. Archimedes does the routing, the resurfacing, and the cluster detection — turning voice from a notes layer into a memory substrate for your life. It's the first voice tool I'd actually keep using after the hackathon.

### Tech / API list
- ElevenLabs Conversational AI (live agent)
- ElevenLabs Instant Voice Cloning (user's own voice for resurfacing)
- ElevenLabs Music (demo soundtrack)
- ElevenLabs TTS (digest playback)
- Cursor (build environment + runtime target via `.cursor/todos.md`)
- Next.js 14 + TypeScript
- Supabase (storage + pgvector for clustering)
- OpenAI / Anthropic (classifier only — not user-facing voice)

### Links to include
- GitHub repo URL
- Live demo URL (Vercel)
- 60-second video (uploaded to the form OR linked from X / YouTube — prefer native upload to socials, then link)

---

## Social posting (free +200 pts, ~15 minutes of work)

Post to all four. See `VIDEO_PLAN.md` for the exact captions per platform.

- [ ] **X (Twitter)** — native video, tag `@elevenlabsio @cursor_ai`, `#ElevenHacks`
- [ ] **LinkedIn** — native video, story framing, ≤200 words
- [ ] **Instagram Reels** — 9:16 export, captions baked in
- [ ] **TikTok** — 9:16 export, hook in first 3s

After posting, paste the URLs into the submission form if the form has those fields (or in the description as social proof).

---

## Final pre-submit sanity check

- [ ] Demo URL still works (do this 10 minutes before submitting; Vercel cold starts can bite)
- [ ] GitHub repo is **public**
- [ ] Video has captions
- [ ] Cover image uploaded
- [ ] All four social posts live (or queued)
- [ ] You've tagged both sponsors in at least the X post

---

## If something breaks at the last minute

- **Demo URL down?** Submit anyway with the GitHub repo and a recorded video. Note in the description "demo is currently being redeployed; see video for the full flow."
- **One integration failing?** Cut it from the demo. Show the working ones. Don't risk a broken integration on the video.
- **Voice latency suddenly bad?** Pre-record the demo audio and use it in the video. The video is what's judged; the live demo is corroboration.
- **You ran out of time before recording the video?** RECORD IT ANYWAY. A scrappy phone video with the right hook beats a polished video that doesn't exist.

---

## Post-submission

- Reply to your own X post with a follow-up showing one more clever use case (more engagement = Most Viral bonus).
- Drop the link in the ElevenLabs Discord `#elevenhacks` channel (community vote = Most Popular bonus).
- Reply to other submissions you like — community goodwill helps for Most Popular.
