# VIDEO_PLAN — Archimedes

> Reminder: per CONTEXT.md, **the video is worth more than the code**. The guide explicitly says spend ≥50% of time on it. Posting on 4 socials + Most Viral + Most Popular = +600 pts, more than 1st place placement (+400).

## Target: 75 seconds, vertical 9:16, captioned, music under voiceover.

---

## Hook patterns being used

- **Lead with the outcome:** show captured-thought-resurfacing-in-your-voice first.
- **Bold claim:** "I have 4 great ideas a week. I forget 3 of them. Here's what changed."
- **Wow moment first:** the cloned-voice resurfacing is the wow. Use it in shot 2.

---

## Shot-by-shot

### Shot 1 — Hook (0:00–0:05)
- **Visual:** foggy bathroom mirror. You in robe / wet hair. Phone on a stand outside the shower.
- **Voiceover (your real voice):** *"I have four good ideas a week. I forget three of them. So I built a voice agent that lives in my shower."*
- **Caption (bold, center):** "I forget my best ideas. I built this so I'd stop."

### Shot 2 — The wow (0:05–0:15)
- **Visual:** time-cut to Monday morning. You walking to coffee. Earbud in.
- **Audio:** YOUR CLONED VOICE plays through the phone speaker: *"On Friday you said you wanted to rebrand the Q3 launch around accessibility. Sarah's on your calendar in 20 minutes — want me to send her a note?"*
- **You (real voice):** *"Yeah."*
- **Caption:** "That's my voice. Telling me what I said three days ago."

### Shot 3 — The capture demo (0:15–0:40)
- **Visual:** back to bathroom. Mirror foggy. You tap the phone button (one big mic icon on screen). Light ambient music.
- **You:** *"Hey Archimedes — I just realized we should rebrand the Q3 launch around accessibility."*
- **Archimedes (deep TTS voice):** *"Got it. Now-thing or remind-you-Monday thing?"*
- **You:** *"Monday. Loop in Sarah."*
- **Archimedes:** *"Captured."*
- **Visual overlay (split-screen):** Notion page populating + Google Calendar invite appearing + Todoist task being added — all in real time.
- **Caption:** "One thought. Routed to three apps. Zero typing."

### Shot 4 — The Cursor moment (0:40–0:55)
- **Visual:** back to bathroom. Shaving cream on face.
- **You:** *"Also — the auth middleware needs to use JWT instead of session cookies."*
- **Archimedes:** *"Code thought. Sent to Cursor."*
- **Cut to:** Cursor open on laptop. `.cursor/todos.md` file. New line appears: `- [ ] Auth middleware: JWT instead of session cookies (captured 2026-05-13)`.
- **Caption:** "Code thoughts go straight to Cursor."

### Shot 5 — The cluster moment (0:55–1:05)
- **Visual:** kitchen, making coffee, phone on counter playing.
- **Archimedes (your cloned voice this time):** *"Heads up — you've mentioned the Q3 rebrand three times this week. Want me to make it a project?"*
- **You:** *"Do it."*
- **Visual cut:** Linear board materializes with "Q3 Accessibility Rebrand" project + 3 linked notes.
- **Caption:** "It notices what I keep saying."

### Shot 6 — Close (1:05–1:15)
- **Visual:** you walking out the front door, phone in pocket.
- **Voiceover (your real voice):** *"Built in 24 hours with Cursor and ElevenLabs. Never lose a shower thought again."*
- **End card (3s):** Archimedes logo + URL (`archimedes.vercel.app` or wherever) + tags:
  - `@cursor_ai @elevenlabsio #ElevenHacks`
- **Music swells, fades.**

---

## Production checklist

### Filming
- [ ] Use phone in 4K vertical mode (export to 1080p 9:16 — social platforms compress heavily, start high)
- [ ] Phone on a tripod / stable surface for bathroom shots — handheld looks amateur
- [ ] Bathroom: actually run hot water for 30 seconds before filming to fog the mirror
- [ ] Lighting: window light if possible, otherwise bright bathroom light
- [ ] Wear something natural (robe is on-brand, doesn't have to be a costume)
- [ ] Phone screen recording for the app UI shots — use iOS built-in screen recorder

### Audio (the killer detail per the guide)
- [ ] Record voiceover with a real mic (not phone mic) — Blue Yeti, AirPods Pro, or use ElevenLabs TTS for narration
- [ ] Record in a quiet room — bathroom audio gets echoey; do voiceover separately, lay over visuals
- [ ] If you can't get a good real-voice take, **generate the voiceover with ElevenLabs TTS** using a stock voice or your own clone. This is on-brand AND solves the audio problem.

### Music
- [ ] Generate background music with **ElevenLabs Music** (https://elevenlabs.io/app/music). Prompt suggestion: *"upbeat tech demo, lo-fi piano + synth, 90 bpm, optimistic, 75 seconds"*
- [ ] Drop music volume to **15-20%** in CapCut so voiceover dominates
- [ ] Music ducks under speech automatically in CapCut (use audio ducking)

### Editing (CapCut, free)
- [ ] Import all clips
- [ ] Auto-captions: Text → Auto Captions → English → Generate
- [ ] Caption style: bold, centered, dark background, large font (mobile-readable)
- [ ] Review auto-captions for errors — fix any product name typos (Archimedes, Cursor, ElevenLabs)
- [ ] Trim ruthlessly. If a shot has 1 second of dead air, cut it.
- [ ] Export 1080×1920 (vertical 9:16), MP4, H.264

---

## Posting plan (+200 pts free)

### X (Twitter)
**Caption text:**
> I have four good ideas a week. I forget three of them.
>
> So I built Archimedes — a voice agent that lives in my shower. It captures what I say, routes it into the right apps, and reminds me in my own voice days later.
>
> Built in 24h with @cursor_ai and @elevenlabsio.
>
> #ElevenHacks

Upload the video natively (do NOT link a YouTube). Pin the tweet.

### LinkedIn
**Caption text:**
> This week I built a voice agent that captures shower thoughts — for #ElevenHacks.
>
> The pain: humans have great ideas in the shower, commute, walks. We forget 75% of them because we can't write anything down.
>
> The build: Cursor + ElevenLabs Conversational AI + voice cloning. One tap, sub-second turn time, routes thoughts into Todoist / Calendar / Notion / Cursor TODOs. Resurfaces them next morning in *your own cloned voice*.
>
> 24 hours, end-to-end, in Cursor. Demo video below.

Upload native video. Keep text ≤200 words.

### Instagram Reels
- Re-export the same 1080×1920 video.
- Caption: one-liner + #ElevenHacks tag.
- Captions baked in (essential — Reels autoplay muted).

### TikTok
- Same vertical export.
- Hook in first 3 seconds — the cloned-voice reveal is the hook. Front-load if needed.
- Use a trending sound under your voiceover at low volume if you want algo boost.

---

## Demo URL / repo links to include in the submission form

- **Live demo:** `https://archimedes.vercel.app` (or whatever Vercel gives you)
- **GitHub:** `https://github.com/<you>/archimedes-voice` (or similar)
- **Cover image:** a clean frame from the bathroom shot — phone on counter, foggy mirror, "Archimedes is listening..." on screen. Or a stylized logo + tagline. Avoid generic stock.

---

## Time budget for the video (if total budget is 24h)

- 1h: scripting and shot list (this doc covers most of it)
- 3h: filming (multiple takes per shot — be patient)
- 3h: editing in CapCut
- 1h: music generation, captions, fine-tuning
- 0.5h: posting to 4 platforms

**Total: ~8.5 hours on video. Plan for it.**

If you do all the coding and skip this part, you lose to someone who did the opposite. The guide is explicit about this.
