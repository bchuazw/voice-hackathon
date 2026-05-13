import OpenAI from 'openai';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ClassifiedThought, Cluster, StoredThought, ThoughtType, TargetApp } from './types';

const CLASSIFIER_MODEL = process.env.CLASSIFIER_MODEL ?? 'gpt-4o-mini';

function openaiOrNull(): OpenAI | null {
  return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
}

let cachedClassifierPrompt: string | null = null;
function classifierPrompt(): string {
  if (cachedClassifierPrompt) return cachedClassifierPrompt;
  cachedClassifierPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'router-classifier.md'),
    'utf-8'
  );
  return cachedClassifierPrompt;
}

let cachedDigestPrompt: string | null = null;
function digestPrompt(): string {
  if (cachedDigestPrompt) return cachedDigestPrompt;
  cachedDigestPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'resurfacing.md'),
    'utf-8'
  );
  return cachedDigestPrompt;
}

/**
 * Classify a captured thought into a structured intent.
 *
 * Uses OpenAI when OPENAI_API_KEY is configured; otherwise falls back to a
 * deterministic rule-based classifier so the demo always runs.
 */
export async function classifyThought(opts: {
  transcript: string;
  clarification?: string;
}): Promise<ClassifiedThought> {
  const o = openaiOrNull();
  if (!o) return ruleBasedClassify(opts.transcript, opts.clarification);

  const now = new Date().toISOString();
  const tz = process.env.USER_TIMEZONE ?? 'UTC';

  const userMessage = [
    `current_datetime: ${now}`,
    `user_timezone: ${tz}`,
    `transcript: """${opts.transcript}"""`,
    opts.clarification ? `clarification: """${opts.clarification}"""` : ''
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const completion = await o.chat.completions.create({
      model: CLASSIFIER_MODEL,
      messages: [
        { role: 'system', content: classifierPrompt() },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    return normalizeClassified(JSON.parse(raw));
  } catch (err) {
    console.warn('[router] LLM classifier failed, using rule-based fallback', err);
    return ruleBasedClassify(opts.transcript, opts.clarification);
  }
}

/**
 * Produce a spoken-style script for the morning digest.
 * Falls back to a templated script if no LLM is configured.
 */
export async function generateDigestScript(opts: {
  thoughts: StoredThought[];
  clusters: Cluster[];
}): Promise<string> {
  const o = openaiOrNull();
  if (!o) return templateDigest(opts);

  const userMessage = JSON.stringify(
    {
      thoughts: opts.thoughts.map((t) => ({
        transcript: t.transcript,
        type: t.classification.type,
        target_app: t.classification.target_app,
        captured_at: t.captured_at,
        title: t.classification.payload.title
      })),
      clusters: opts.clusters
    },
    null,
    2
  );

  try {
    const completion = await o.chat.completions.create({
      model: CLASSIFIER_MODEL,
      messages: [
        { role: 'system', content: digestPrompt() },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.6
    });
    return completion.choices[0]?.message?.content?.trim() ?? templateDigest(opts);
  } catch (err) {
    console.warn('[router] LLM digest failed, using template fallback', err);
    return templateDigest(opts);
  }
}

// ---------- helpers ----------

function normalizeClassified(raw: any): ClassifiedThought {
  const allowedTypes: ThoughtType[] = ['task', 'calendar', 'note', 'reminder', 'message', 'code', 'research'];
  const allowedApps: TargetApp[] = ['todoist', 'calendar', 'notion', 'reminders', 'imessage', 'cursor'];
  const type: ThoughtType = allowedTypes.includes(raw?.type) ? raw.type : 'note';
  const target_app: TargetApp = allowedApps.includes(raw?.target_app) ? raw.target_app : defaultAppFor(type);
  const payload = raw?.payload ?? {};
  return {
    type,
    target_app,
    payload: {
      title: String(payload.title ?? '').slice(0, 80) || 'Untitled thought',
      body: payload.body ?? null,
      due_at: payload.due_at ?? null,
      tags: Array.isArray(payload.tags) ? payload.tags.map((t: any) => String(t)).filter(Boolean) : [],
      target_repo: payload.target_repo ?? null,
      target_person: payload.target_person ?? null
    },
    confidence: typeof raw?.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0.5,
    rationale: String(raw?.rationale ?? '').slice(0, 160)
  };
}

function defaultAppFor(type: ThoughtType): TargetApp {
  switch (type) {
    case 'task':
      return 'todoist';
    case 'calendar':
      return 'calendar';
    case 'reminder':
      return 'todoist';
    case 'message':
      return 'imessage';
    case 'code':
      return 'cursor';
    case 'research':
      return 'notion';
    default:
      return 'notion';
  }
}

// Rule-based classifier — runs entirely offline. Conservative; the LLM path
// is preferred for accuracy.
export function ruleBasedClassify(transcript: string, _clarification?: string): ClassifiedThought {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  // Heuristics
  const codeRegex = /\b(refactor|repo|merge|deploy|bug|backend|frontend|component|api|endpoint|middleware|jwt|migration|database|cursor|typescript|python|function|class)\b/;
  const calendarRegex = /\b(meeting|calendar|schedule|invite|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow morning|next week|at \d|standup|sync)\b/;
  const reminderRegex = /\b(remind me|at \d{1,2}(:\d{2})?\s?(am|pm)?|tonight|in (\d+) (minute|hour|min))/;
  const messageRegex = /\b(text|message|dm|tell|email)\s+([A-Z][a-z]+)/;
  const researchRegex = /\b(what is|how does|look into|read the|paper on|study on|why does|explore|research)\b/;
  const taskRegex = /\b(i should|i need to|remind me to|todo|task|gotta|have to|let me)\b/;

  let type: ThoughtType = 'note';
  if (codeRegex.test(lower)) type = 'code';
  else if (calendarRegex.test(lower)) type = 'calendar';
  else if (reminderRegex.test(lower)) type = 'reminder';
  else if (messageRegex.test(text)) type = 'message';
  else if (researchRegex.test(lower)) type = 'research';
  else if (taskRegex.test(lower)) type = 'task';

  // People mentioned: any capitalised single-token name >=3 letters.
  const peopleSet = new Set<string>();
  for (const m of text.matchAll(/\b([A-Z][a-z]{2,15})\b/g)) {
    const candidate = m[1];
    if (!isCommonWord(candidate)) peopleSet.add(candidate);
  }
  const people = Array.from(peopleSet);

  // Project / proper-noun tags: pull alphanumeric tokens prefixed with Q like Q3, or capitalised n-grams.
  const tags = new Set<string>();
  for (const m of text.matchAll(/\b(Q[1-4]|H[12]|FY\d{2,4})\b/gi)) tags.add(m[1].toUpperCase());
  for (const p of people) tags.add(p);

  // Resolve trivial relative times.
  let dueAt: string | null = null;
  if (/\btomorrow morning\b/i.test(text)) dueAt = nextDayAt(9).toISOString();
  else if (/\btonight\b/i.test(text)) dueAt = todayAt(20).toISOString();
  else if (/\bnext monday\b/i.test(text)) dueAt = nextWeekdayAt(1, 9).toISOString();

  // Build a title — try the first clause.
  const titleSource = text.split(/[\.!\?\n]/)[0] ?? text;
  const title = titleSource.replace(/\s+/g, ' ').trim().slice(0, 80) || 'Untitled thought';

  return {
    type,
    target_app: defaultAppFor(type),
    payload: {
      title,
      body: text.length > title.length ? text : null,
      due_at: dueAt,
      tags: Array.from(tags),
      target_repo: type === 'code' ? process.env.CURSOR_TARGET_REPO_PATH ?? null : null,
      target_person: type === 'message' && people[0] ? people[0] : null
    },
    confidence: 0.55,
    rationale: 'offline rule-based classifier'
  };
}

function isCommonWord(word: string): boolean {
  return /^(I|The|This|That|We|My|You|He|She|It|And|But|Then|So|For|Hey|Archimedes|Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/.test(
    word
  );
}

function todayAt(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}
function nextDayAt(hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function nextWeekdayAt(weekday: number, hour: number): Date {
  // weekday: 0=Sun..6=Sat
  const d = new Date();
  const delta = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + delta);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function templateDigest(opts: { thoughts: StoredThought[]; clusters: Cluster[] }): string {
  const { thoughts, clusters } = opts;
  if (thoughts.length === 0) return "No thoughts captured yesterday. Have a good one.";

  const parts: string[] = [];
  parts.push(`You had ${thoughts.length} ${thoughts.length === 1 ? 'thought' : 'thoughts'} yesterday.`);
  for (const t of thoughts.slice(0, 5)) {
    const verbMap: Record<TargetApp, string> = {
      todoist: 'sent to Todoist',
      calendar: 'on your calendar',
      notion: 'logged in Notion',
      cursor: 'dropped into Cursor',
      reminders: 'reminder set',
      imessage: 'message draft queued'
    };
    const dest = verbMap[t.classification.target_app] ?? 'noted';
    parts.push(`${stripTrailingPunct(t.classification.payload.title)} — ${dest}.`);
  }
  if (clusters.length > 0) {
    const c = clusters[0];
    parts.push(
      `Heads up — you've mentioned ${prettifyTheme(c.theme)} ${c.thought_ids.length} times across ${c.span_days} ${c.span_days === 1 ? 'day' : 'days'}. Want me to make it a project?`
    );
  }
  parts.push("That's it. Have a good one.");
  return parts.join(' ');
}

function stripTrailingPunct(s: string): string {
  return s.replace(/[\.\!\?]+$/g, '').trim();
}

function prettifyTheme(theme: string): string {
  if (/^q[1-4]$/i.test(theme)) return theme.toUpperCase();
  // Title-case single-word themes (e.g. "sarah" → "Sarah")
  if (/^[a-z]+$/i.test(theme)) return theme.charAt(0).toUpperCase() + theme.slice(1);
  return theme;
}
