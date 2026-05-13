import type { ClassifiedThought } from './types';

/**
 * Pre-canned thoughts for the demo video. Lets you click "Play storyboard"
 * and have the UI fill with the four canonical examples from VIDEO_PLAN.md
 * — even without API keys or a mic.
 *
 * Each entry contains both a transcript (what the user says) and a hand-
 * authored classification (so the live demo doesn't depend on an external
 * classifier call). When the LLM classifier IS configured the route can
 * still re-classify each transcript for an authentic flow.
 */
export type SeedThought = {
  transcript: string;
  classification: ClassifiedThought;
  agent_reply: string;
};

export const STORYBOARD_THOUGHTS: SeedThought[] = [
  {
    transcript:
      "I just realized we should rebrand the Q3 launch around accessibility. Loop in Sarah.",
    agent_reply: 'Got it. Calendar note for Monday morning, Sarah tagged.',
    classification: {
      type: 'calendar',
      target_app: 'calendar',
      payload: {
        title: 'Q3 launch — rebrand around accessibility (loop in Sarah)',
        body: "Discussion seed: pivot the Q3 narrative toward accessibility wins. Cc Sarah for marketing alignment.",
        due_at: nextMonday9().toISOString(),
        tags: ['Q3', 'Sarah', 'accessibility'],
        target_repo: null,
        target_person: 'Sarah'
      },
      confidence: 0.92,
      rationale: 'mentions a person, a project, and an implied next step'
    }
  },
  {
    transcript: "Also — the auth middleware needs to use JWT instead of session cookies.",
    agent_reply: 'Code thought. Sent to Cursor.',
    classification: {
      type: 'code',
      target_app: 'cursor',
      payload: {
        title: 'Auth middleware: switch from session cookies to JWT',
        body: 'Bearer tokens; rotate every 24h; keep refresh in HttpOnly cookie. Update axios interceptor.',
        due_at: null,
        tags: ['auth', 'security'],
        target_repo: process.env.CURSOR_TARGET_REPO_PATH ?? null,
        target_person: null
      },
      confidence: 0.95,
      rationale: 'explicit codebase concern with a refactor verb'
    }
  },
  {
    transcript:
      "Throw a note in there — what if accessibility could be the whole Q3 narrative, not just a feature?",
    agent_reply: 'Noted.',
    classification: {
      type: 'note',
      target_app: 'notion',
      payload: {
        title: 'Accessibility as Q3 narrative (not feature)',
        body: 'Half-baked: position accessibility as the unifying thread for Q3 launch comms.',
        due_at: null,
        tags: ['Q3', 'accessibility', 'brand'],
        target_repo: null,
        target_person: null
      },
      confidence: 0.78,
      rationale: 'half-baked idea on the same theme — captured as a note'
    }
  },
  {
    transcript:
      "Remind me Monday morning — write the kickoff doc for the Q3 accessibility launch with Sarah.",
    agent_reply: 'Reminder set, Monday 9am.',
    classification: {
      type: 'reminder',
      target_app: 'todoist',
      payload: {
        title: 'Write Q3 accessibility kickoff doc with Sarah',
        body: 'Outline rebrand thesis, success metrics, comms calendar.',
        due_at: nextMonday9().toISOString(),
        tags: ['Q3', 'Sarah', 'accessibility', 'reminder'],
        target_repo: null,
        target_person: null
      },
      confidence: 0.9,
      rationale: 'time-sensitive task with a person'
    }
  }
];

function nextMonday9(): Date {
  const d = new Date();
  const delta = (1 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + delta);
  d.setHours(9, 0, 0, 0);
  return d;
}
