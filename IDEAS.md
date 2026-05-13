# Innovative Submission Ideas — ElevenHacks #8 (Cursor)

> Companion to `CONTEXT.md`. The shortlist there covered the obvious framings (Cursor-by-Voice, VoiceChef, Polyglot-Me). This file goes deeper into less-explored territory.

---

## ⭐ Lead pick: Archimedes (shower-thought voice agent)

After several rounds of iteration the picked direction is **Archimedes** — a voice agent for shower thoughts that captures, routes, and resurfaces.

See `PROJECT_BRIEF.md`, `ARCHITECTURE.md`, `AGENT_PROMPTS.md`, `VIDEO_PLAN.md`, and `SUBMISSION_CHECKLIST.md` for the full build plan. Everything below is preserved as backup/fallback in case this direction stalls.

---

## Three innovation axes most submissions will miss

1. **Your cloned voice acting in your stead** — async or live. Most demos use stock voices for the agent. The killer move is having the agent *be* you when you can't be there.
2. **Inbound voice** — the AI calls you. No app to open, no button to push. Ambient, scheduled, or reactive.
3. **Voice as the only interface for traditionally non-voice domains** — debugging, design, 3D, spreadsheets, devops. The further from "chatbot" the better.

---

## Tier A — Most innovative (high "wait, that's possible?" factor)

### 1. The Standup Eraser
You record a 30-second voice memo each morning. Your cloned voice agent **attends standup as you**, summarizes everyone else's updates, files action items, and DMs you the recap. You never join standups again.
- **APIs:** Voice cloning + ConvAI agent + TTS + STT (transcribes others) + Cursor (Slack/Linear integrations)
- **Hook:** *"I haven't been to a standup in 30 days."*
- **Virality:** every engineer who's ever sat through a useless meeting will share this.
- **Sponsor delight:** maximum. Cursor team will see this and weep.

### 2. Whisper Co-Pilot (the "Apology Generator" + better)
You're on a hard phone call — a salary negotiation, a breakup, a customer escalation. One earbud feeds you live coaching ("ask for 15% more, not a number"); the other tells the agent what to *say next in your cloned voice*. The other person hears you; you hear your co-pilot.
- **APIs:** STT on incoming audio + ConvAI for live strategy + voice cloning + TTS streaming
- **Hook:** *"I let an AI run my salary negotiation. I got 22%."*
- **Risk:** ethics on the edge; lean into "coaching" framing, not "deception."
- **Demo:** livestream cold-calling something low-stakes (negotiating with a hotel front desk for an upgrade).

### 3. The Bedtime Story Engine (Dad's Cloned Voice, Travel Mode)
A traveling parent records 30 seconds of bedtime narration once. The child says "tell me a story about a dragon and a robot." A 5-minute story is generated and narrated *in the parent's voice*, with music. The child hears Dad even when Dad is in Tokyo.
- **APIs:** Voice cloning + TTS + ElevenLabs Music + ConvAI for story shaping
- **Hook:** *"My kid hears me read her a story every night, even when I'm in another country."*
- **Virality:** parent-Twitter and dad-TikTok will eat this alive.
- **Sponsor delight:** ElevenLabs flagship features in their most emotionally powerful form.

### 4. The Smart Doorbell That Roleplays as You
Visitor rings. ElevenLabs agent answers **as you** ("Hey — I'm just stepping out of the shower, what's up?"), holds a full conversation, takes a message, summarizes to you later. Indistinguishable from you being home.
- **APIs:** Voice cloning + ConvAI + STT + TTS streaming + Cursor (notification webhook)
- **Hook:** *"My doorbell talks to strangers in my voice. They have no idea."*
- **Virality:** spooky-impressive. Tech-influencers love.
- **Real-world demo:** literally film a delivery person being fooled.

### 5. VoiceLearn (the AI calls *you*)
Language learning inverted. You set a target language; the AI calls your actual phone at random times during the day, in your tutor's cloned voice, and runs a 90-second conversation in the target language. No app to open. Pure inbound.
- **APIs:** Voice cloning + ConvAI + TTS streaming + Twilio (or Vapi) telephony
- **Hook:** *"I learned conversational Spanish in 3 weeks. I never opened the app — it called me."*
- **Inversion angle:** opens the door for everything ambient (inbound therapy check-ins, inbound code review, inbound journaling).

---

## Tier B — Strong differentiation

### 6. Rubber Duck.exe (the debugger that pushes back)
A voice agent that's read your repo (via Cursor's context) and Socratically interrogates you about your bug instead of just listening. "You said the loop runs 5 times. Are you sure? When did you last verify?"
- **APIs:** ConvAI + STT + TTS + Cursor agent for repo context
- **Hook:** *"I described my bug. The AI told me I was wrong about my own code. It was right."*
- **Why it's clever:** flips the assistant relationship. Most demos *help*; this one *challenges*.

### 7. The Voice Build System (DevOps by yelling)
`npm run` but you yell from the couch. "Deploy staging. Run the migration. Ping #engineering when it's done. Show me the logs if anything red." Ambient acknowledgments in TTS.
- **APIs:** STT + ConvAI + TTS + Cursor (script generation)
- **Hook:** *"I haven't typed a deploy command in a week."*
- **Sponsor delight:** Cursor judges will recognize this is what they actually want.

### 8. Voice Three.js / "VibeScene"
"Make a glowing cube spin slowly. Add three smaller ones orbiting it. Now make the lighting dramatic." Cursor generates Three.js on the fly; you see results in real time, narrated by the agent.
- **APIs:** STT + ConvAI + Cursor agent + TTS (narrates what changed)
- **Visual virality:** the demo *looks* trippy and good.
- **Wow factor:** "you can talk a 3D scene into existence."

### 9. Mom Mode (the household OS)
You yell from the kitchen: "Did I take my meds? When's Jake's soccer? What's for dinner?" The household agent knows everything because it ingests your calendar/notes/email passively. Family members each have cloned voices so when Mom tells everyone dinner's ready, the speaker actually plays Mom.
- **APIs:** Voice cloning + ConvAI + STT + TTS + integrations
- **Demo:** chaotic family kitchen scene. Maximally relatable.

### 10. PodcastClone (paper → 2-host show, in your voices)
Drop a PDF or paste a paper. Generate a 5-minute Lex-Fridman-style two-host podcast with both hosts being cloned voices of *you and a friend* (or two public figures whose voices you've licensed). Listen on the walk.
- **APIs:** Voice cloning (×2) + ConvAI for dialogue generation + TTS + ElevenLabs Music for intro
- **Already exists in fragments** — but the in-your-own-voice angle + commute-friendly framing is fresh.

### 11. Live Auction Voice (accessibility win)
Auction app where you bid by saying "twenty bucks" and the agent confirms, places, and reads competing bids back in real time. Targets visually-impaired or hands-busy users (driving, cooking, working).
- **APIs:** STT + ConvAI + TTS streaming + ElevenLabs Music (auction-room ambience)
- **Accessibility angle:** judges score it as a real impact project.

---

## Tier C — Wildcards (riskier but distinctive)

### 12. The Vibe Inverter (live Zoom persona swap)
You speak your honest internal monologue into your headset during a Zoom call ("this idea is dumb, but I can't say that"). The agent broadcasts the corporate-translated version as your cloned voice over the call ("That's a really interesting framing — what if we considered X?"). Comedic but functional.
- **Demo:** livestream filming yourself doing it in a real (fake) meeting.
- **Risk:** ethically dicey. Frame as parody/sketch.

### 13. VoiceSheets (Excel by yelling)
"Add a column for revenue. Sum row 3 to 10. Color cells over 1000 green. Sort by Q3." Spreadsheets entirely by speech. Looks deceptively simple, devilishly hard, instantly understandable.
- **Demo angle:** finance/ops people who live in Excel will share immediately.

### 14. Cooking Show Generator (the byproduct is the video)
Describe your recipe out loud while cooking. Agent records every step, generates a narrated cooking video (with B-roll prompts) in your cloned voice as the byproduct. The video *of the cooking* is the deliverable, and the demo *is* you cooking and then showing the auto-generated video.
- **Meta-angle:** the submission video could literally be the auto-generated cooking video — recursive demo.

### 15. Voice Photographer / PhotoCoach
Point phone at a scene, describe what you want ("portrait, dramatic light, lower angle"). Agent verbally directs framing ("step back 2 feet, tilt up slightly"), snaps when you say "now." Outdoor demo gold.
- **APIs:** STT + ConvAI + TTS + on-device camera/CV
- **Filming locations:** beach, golden hour, urban — high visual virality.

### 16. The Therapist for Your Codebase
You complain about your repo to the agent ("this auth flow is making me want to quit"). It validates emotionally — *and* fixes the code via Cursor in the background. Therapy + ticket execution.
- **Tone:** humorous + functional. Memorable framing.

---

## My top 3 recommendations

Ranked for **virality × novelty × ship-in-30-hours feasibility × sponsor delight**:

1. **The Standup Eraser** (Tier A #1) — universal pain point, max sponsor delight (both Cursor + ElevenLabs in full force), filmable as a "look I'm not in this meeting" sketch.
2. **The Bedtime Story Engine** (Tier A #3) — emotionally devastating in the best way, easy to film (you + your kid, or a stand-in), shows off ElevenLabs cloning at peak power.
3. **The Smart Doorbell That Roleplays as You** (Tier A #4) — the "wait, that's possible?" moment is built in. Real-world demo with a delivery person is gold.

If forced to pick ONE: **The Standup Eraser.** Engineers are the most likely retweeters, the demo is short (you walking around while a meeting happens without you), and it's exactly the kind of thing that makes the Cursor judge text the founder.

---

## Anti-patterns to avoid

- **Generic "voice assistant" demos.** Every hackathon has 50 of these. Specificity wins.
- **Browser extensions with TTS read-back.** Done to death.
- **"AI tutor for X"** without an innovation angle. Tier A #5 (the AI calls *you*) is the only fresh take.
- **Tech-stack slides in the video.** Show the product working in the real world.
- **Demos shot at your desk.** Take it outside (kitchen, café, street, car).
- **Forgetting the Cursor sponsor.** Half the prize.
