# SUBMISSION_VIDEO_SCRIPT — Archimedes (75s)

> Production-ready shot list with exact timings, lines to speak, captions to bake in,
> and on-screen actions. Pair with `DEMO_GUIDE.md` for the live web-app dance you'll
> do during filming and `SOCIAL_POSTS.md` for the four platform captions.
>
> Target: 75 seconds, vertical 9:16, 1080×1920, captions baked in, music ducked
> to ~18% under voiceover. The cloned-voice resurfacing moment lands at 0:08–0:18 — that
> is the wow. Front-load it; everything else is supporting evidence.

---

## Pre-roll — do these once before filming

1. **Clone your voice.** Sign in at elevenlabs.io → Voices → "Instant Voice Cloning"
   → upload a clean 60-second voice sample of yourself reading anything you like
   (the cookie monologue from Sesame Street works). Grab the voice ID, paste into
   `.env.local` as `ELEVENLABS_USER_VOICE_ID`.
2. **Generate the soundtrack.** Go to https://elevenlabs.io/app/music. Prompt:
   `upbeat tech demo, lo-fi piano + warm synth, 90 bpm, optimistic, 75 seconds`.
   Download as mp3. Save as `assets/soundtrack.mp3`.
3. **Pre-record the digest voiceover.** Click the "Morning digest" button in
   the live app. The audio that plays IS your cloned voice reading the digest —
   screen-record it. That recording becomes the Shot 2 audio.
4. **Steam up the mirror.** Run hot water for 30 seconds before filming Shots
   1/3/4. Re-fog between takes.

---

## Shot 1 — Hook (0:00–0:05)

**Visual.** Bathroom, foggy mirror, you in a robe or T-shirt with damp hair.
Phone propped on the counter at chest height. Wide angle.

**Voiceover (your real voice, recorded separately for clean audio).**
> "I have four good ideas a week. I forget three of them. So I built an AI that lives in my shower."

**Caption (bold center, dark pill background).**
> I FORGET MY BEST IDEAS. I BUILT THIS SO I'D STOP.

**Cut.** Hard cut on the word "shower" → straight into Shot 2 (no transition).

---

## Shot 2 — The wow (0:05–0:18)

**Visual.** Time-cut to morning. You walking down a sunny pavement with one
AirPod in, coffee in hand. Phone in your pocket but visible. **Vertical, handheld
is fine here — looks honest.**

**Audio.** YOUR CLONED VOICE plays through the phone speaker (use the file you
recorded in pre-roll step 3):

> "You had four thoughts yesterday. The Q3 launch rebrand — on your calendar. Auth middleware switch to JWT — dropped into Cursor. Accessibility as the Q3 narrative — logged in Notion. The kickoff doc with Sarah — Todoist for Monday. Heads up — you've mentioned Q3 three times this week. Want me to make it a project?"

**You (real voice, after the clone speaks the cluster line).**
> "Do it."

**Caption (over the clone speaking).**
> THAT'S MY VOICE. TELLING ME WHAT I SAID YESTERDAY.

**Caption (when "Do it" lands).**
> CLONED VOICE • ELEVENLABS

**Cut.** Match-cut on motion — your hand reaching → reaching for the phone in Shot 3.

---

## Shot 3 — The capture (0:18–0:38)

**Visual.** Back in the steamy bathroom. Mirror foggy. You shaving / brushing
teeth — one-handed. Phone is on the counter. The Archimedes UI is visible:
the big mic button is pulsing because the session is live.

**Dialogue.**
> **You:** "Hey Archimedes — we should rebrand the Q3 launch around accessibility. Loop in Sarah."
>
> **Archimedes (ConvAI voice, Adam):** "Got it. Now-thing or remind-you-Monday thing?"
>
> **You:** "Monday. Loop in Sarah."
>
> **Archimedes:** "Captured."

**Visual overlay (split-screen or quick 3-cut at 0:31–0:36).**
- A Google Calendar event appearing on Monday 9am ("Q3 rebrand — Sarah")
- A Notion row materialising ("Accessibility as Q3 narrative")
- A Todoist task animating in ("Write Q3 accessibility kickoff doc with Sarah")

> Capture each in a screen-record before the shoot. Stack them as three picture-in-
> picture overlays in CapCut, each 1.5s long.

**Caption.**
> ONE THOUGHT. ROUTED TO THREE APPS. ZERO TYPING.

---

## Shot 4 — Cursor moment (0:38–0:52)

**Visual.** Still bathroom, foam on jaw. You tap the mic again.

**Dialogue.**
> **You:** "Also — the auth middleware needs to use JWT instead of session cookies."
>
> **Archimedes:** "Code thought. Sent to Cursor."

**Visual cut (0:46–0:52).** Quick zoom into your laptop screen. Cursor is open.
Highlight a `.cursor/todos.md` file. A new line appears at the bottom:
> `- [ ] Auth middleware: switch from session cookies to JWT (captured 2026-05-13 via Archimedes)`

> Tip: pre-record the file-edit shot. Use Cursor's terminal to `cat .cursor/todos.md`
> then trigger your real `/api/capture` POST so a fresh line appends on-camera.

**Caption.**
> CODE THOUGHTS LAND IN CURSOR. AT RUNTIME.

---

## Shot 5 — Cluster surprise (0:52–1:05)

**Visual.** Kitchen, late morning. Phone on counter, you pouring coffee.

**Audio (cloned voice, from a pre-rendered digest clip).**
> "Heads up — you've mentioned the Q3 rebrand three times this week. Want me to make it a project?"

**You.**
> "Yeah. Do it."

**Visual.** Cut to a Linear / Notion board on the laptop. A new "Q3 Accessibility
Rebrand" project materialises with three linked notes underneath. (For the demo,
this can be a screen-recorded mock — make the project in Linear first, then
record the empty board → linked-notes appearing.)

**Caption.**
> IT NOTICES WHAT I KEEP SAYING.

---

## Shot 6 — Close (1:05–1:15)

**Visual.** You walking out the front door, phone in pocket. Backlit.

**Voiceover (real voice).**
> "Built in 24 hours with Cursor and ElevenLabs. Never lose a shower thought again."

**End-card (1:12–1:15, 3 seconds).**
- Archimedes wordmark
- One line: `archimedes.vercel.app` (or your URL)
- Three tags, bottom: `@cursor_ai @elevenlabsio #ElevenHacks`

**Music swells, fades.**

---

## CapCut edit checklist

- [ ] Drop Shot 1–6 in order.
- [ ] Add `assets/soundtrack.mp3` on a separate audio track, volume 18%.
- [ ] Enable audio ducking under your VO.
- [ ] Text → Auto Captions → English → Generate. Style: bold, center, dark
      pill background, font size ~64.
- [ ] Manually correct the words "Archimedes", "ElevenLabs", "Cursor",
      "Todoist", "JWT", "Q3" — auto-captions miss these.
- [ ] Trim every shot ruthlessly. If anyone says "umm" or breathes for >0.5s, cut.
- [ ] Export: 1080×1920, MP4, H.264, 30 fps.
- [ ] Watch it muted once. If a viewer can follow with sound off, ship it.

---

## Total runtime sanity check

- Hook: 5s
- Cloned-voice wow: 13s
- Capture: 20s
- Cursor moment: 14s
- Cluster surprise: 13s
- Close + end-card: 10s
- **Total: 75s** ✓

If you go over 90s, cut Shot 5 (the cluster surprise). The Cursor moment in
Shot 4 is non-negotiable — that's the Cursor judge.
